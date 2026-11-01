import { withTenantContext } from '../../database/connection';
import { RAGEngine } from './ragEngine';
import { mockStore } from '../../models/mockStore';

export interface LeadCaptureParams {
  workspaceId: string;
  studentName: string;
  phone: string;
  courseInterest?: string;
  notes?: string;
}

export interface DemoReservationParams {
  workspaceId: string;
  slotId: string;
  studentName: string;
  phone: string;
  idempotencyKey?: string;
}

export interface DemoSlotAvailability {
  id: string;
  date: string;
  timeRange: string;
  maxCapacity: number;
  currentBookings: number;
  seatsAvailable: number;
  isAvailable: boolean;
}

export class CoachingTools {
  /**
   * Tool 1: Search verified institute courses and FAQs
   */
  public static async searchCoursesAndFaqs(workspaceId: string, queryText: string) {
    if (!queryText || queryText.trim().length === 0) {
      throw new Error('Search query is required');
    }
    const results = await RAGEngine.retrieveKnowledge(workspaceId, queryText, 3);
    return {
      query: queryText,
      matchCount: results.length,
      courses: results.map(r => ({
        id: r.id,
        title: r.title,
        content: r.content,
        fees: r.fees,
        batches: r.batches,
        confidence: r.similarity,
      })),
    };
  }

  /**
   * Tool 2: Capture or update prospective student lead
   */
  public static async captureOrUpdateLead(params: LeadCaptureParams) {
    const { workspaceId, studentName, phone, courseInterest, notes } = params;

    if (!studentName || !phone) {
      throw new Error('Student name and phone number are required');
    }

    const cleanPhone = phone.startsWith('+') ? phone : `+${phone}`;

    return withTenantContext(workspaceId, async (client) => {
      // 1. Upsert contact
      const contactRes = await client.query(
        `INSERT INTO contacts (workspace_id, phone_e164, name, opt_in_status)
         VALUES ($1, $2, $3, 'OPTED_IN')
         ON CONFLICT (workspace_id, phone_e164) DO UPDATE SET name = $3
         RETURNING id;`,
        [workspaceId, cleanPhone, studentName]
      );
      const contactId = contactRes.rows[0].id;

      // 2. Upsert lead
      const leadRes = await client.query(
        `INSERT INTO leads (workspace_id, contact_id, course, status, notes)
         VALUES ($1, $2, $3, 'NEW', $4)
         RETURNING id, status, course;`,
        [workspaceId, contactId, courseInterest || 'General Inquiry', notes || null]
      );
      const lead = leadRes.rows[0];

      // Also record in mockStore
      mockStore.addLead(studentName, cleanPhone, courseInterest || 'General Inquiry');

      return {
        success: true,
        leadId: lead.id,
        studentName,
        phone: cleanPhone,
        courseInterest: lead.course,
        status: lead.status,
      };
    });
  }

  /**
   * Tool 3: Check live demo class availability with remaining capacity
   */
  public static async checkDemoAvailability(workspaceId: string, targetDate?: string): Promise<DemoSlotAvailability[]> {
    return withTenantContext(workspaceId, async (client) => {
      let queryStr = `SELECT id, title, start_at, end_at, capacity, booked_count, status FROM slots WHERE status = 'AVAILABLE'`;
      const params: any[] = [];

      if (targetDate) {
        queryStr += ` AND start_at::DATE = $1::DATE`;
        params.push(targetDate);
      }
      queryStr += ` ORDER BY start_at ASC;`;

      const res = await client.query(queryStr, params);

      if (res.rows.length === 0) {
        // Fallback to mockStore slots
        return mockStore.slots.map(s => ({
          id: s.id,
          date: s.startAt.split(' ')[0] || 'Today',
          timeRange: s.title,
          maxCapacity: s.capacity,
          currentBookings: s.bookedCount,
          seatsAvailable: Math.max(0, s.capacity - s.bookedCount),
          isAvailable: s.bookedCount < s.capacity,
        }));
      }

      return res.rows.map(row => {
        const max = parseInt(row.capacity || 15);
        const current = parseInt(row.booked_count || 0);
        const available = Math.max(0, max - current);
        return {
          id: row.id,
          date: new Date(row.start_at).toISOString().split('T')[0],
          timeRange: row.title || 'Demo Session',
          maxCapacity: max,
          currentBookings: current,
          seatsAvailable: available,
          isAvailable: available > 0,
        };
      });
    });
  }

  /**
   * Tool 4: Reserve Demo Booking with Transactional Capacity Validation
   * Concurrency-safe: executes SELECT ... FOR UPDATE to prevent seat overbooking.
   */
  public static async reserveDemoBooking(params: DemoReservationParams) {
    const { workspaceId, slotId, studentName, phone, idempotencyKey } = params;

    if (!slotId || !studentName || !phone) {
      throw new Error('slotId, studentName, and phone are required for booking');
    }

    const cleanPhone = phone.startsWith('+') ? phone : `+${phone}`;

    return withTenantContext(workspaceId, async (client) => {
      // 0. Idempotency Check: return existing appointment if idempotencyKey matches
      if (idempotencyKey) {
        const existingAppt = await client.query(
          `SELECT a.id, a.slot_id, a.status, s.start_at, s.title
           FROM appointments a
           JOIN slots s ON s.id = a.slot_id
           WHERE a.workspace_id = $1 AND a.idempotency_key = $2
           LIMIT 1;`,
          [workspaceId, idempotencyKey]
        );
        if (existingAppt.rows.length > 0) {
          const row = existingAppt.rows[0];
          return {
            success: true,
            bookingId: row.id,
            slotDate: new Date(row.start_at).toISOString().split('T')[0],
            timeRange: row.title,
            studentName,
            phone: cleanPhone,
            status: row.status,
            idempotentReplay: true,
          };
        }
      }

      // 1. Lock slot row with FOR UPDATE and explicit workspace check to prevent race condition overbooking
      const slotRes = await client.query(
        `SELECT id, title, start_at, end_at, capacity, booked_count, status
         FROM slots
         WHERE id = $1 AND workspace_id = $2 AND status = 'AVAILABLE'
         FOR UPDATE;`,
        [slotId, workspaceId]
      );

      if (slotRes.rows.length === 0) {
        throw new Error('Requested demo slot was not found in this workspace or is not available');
      }

      const slot = slotRes.rows[0];
      const max = parseInt(slot.capacity || 15);
      const current = parseInt(slot.booked_count || 0);

      // 2. Capacity Guard Check
      if (current >= max) {
        throw new Error('SLOT_CAPACITY_EXCEEDED: Slot has reached maximum student capacity');
      }

      // 3. Increment slot bookings with strict workspace boundary
      await client.query(
        `UPDATE slots SET booked_count = booked_count + 1 WHERE id = $1 AND workspace_id = $2;`,
        [slotId, workspaceId]
      );

      // 4. Upsert contact
      const contactRes = await client.query(
        `INSERT INTO contacts (workspace_id, phone_e164, name, opt_in_status)
         VALUES ($1, $2, $3, 'OPTED_IN')
         ON CONFLICT (workspace_id, phone_e164) DO UPDATE SET name = $3
         RETURNING id;`,
        [workspaceId, cleanPhone, studentName]
      );
      const contactId = contactRes.rows[0].id;

      // 5. Create appointment record with idempotency key
      const apptRes = await client.query(
        `INSERT INTO appointments (workspace_id, slot_id, contact_id, status, idempotency_key)
         VALUES ($1, $2, $3, 'CONFIRMED', $4)
         RETURNING id;`,
        [workspaceId, slotId, contactId, idempotencyKey || null]
      );

      // 6. Update lead stage to DEMO_BOOKED
      await client.query(
        `UPDATE leads SET status = 'DEMO_BOOKED' WHERE contact_id = $1 AND workspace_id = $2;`,
        [contactId, workspaceId]
      );

      return {
        success: true,
        bookingId: apptRes.rows[0].id,
        slotDate: new Date(slot.start_at).toISOString().split('T')[0],
        timeRange: slot.title,
        studentName,
        phone: cleanPhone,
        status: 'CONFIRMED',
      };
    });
  }

  /**
   * Tool 4b: Cancel Demo Booking and safely release slot capacity
   */
  public static async cancelDemoBooking(workspaceId: string, appointmentId: string, reason?: string) {
    return withTenantContext(workspaceId, async (client) => {
      const apptRes = await client.query(
        `SELECT id, slot_id, status FROM appointments WHERE id = $1 AND workspace_id = $2 FOR UPDATE;`,
        [appointmentId, workspaceId]
      );
      if (apptRes.rows.length === 0) {
        throw new Error('APPOINTMENT_NOT_FOUND: Appointment does not exist in workspace');
      }
      const appt = apptRes.rows[0];
      if (appt.status === 'CANCELLED') {
        return { success: true, message: 'Appointment is already cancelled' };
      }

      await client.query(
        `UPDATE appointments SET status = 'CANCELLED' WHERE id = $1;`,
        [appointmentId]
      );

      // Decrement slot capacity safely
      await client.query(
        `UPDATE slots SET booked_count = GREATEST(0, booked_count - 1) WHERE id = $1;`,
        [appt.slot_id]
      );

      return { success: true, appointmentId, status: 'CANCELLED' };
    });
  }

  /**
   * Tool 4c: Reschedule Demo Booking (Atomic capacity release + re-reservation)
   */
  public static async rescheduleDemoBooking(workspaceId: string, appointmentId: string, newSlotId: string) {
    return withTenantContext(workspaceId, async (client) => {
      // 1. Lock appointment
      const apptRes = await client.query(
        `SELECT id, slot_id, contact_id, status FROM appointments WHERE id = $1 AND workspace_id = $2 FOR UPDATE;`,
        [appointmentId, workspaceId]
      );
      if (apptRes.rows.length === 0) throw new Error('APPOINTMENT_NOT_FOUND');
      const oldSlotId = apptRes.rows[0].slot_id;

      // 2. Lock and validate new slot
      const newSlotRes = await client.query(
        `SELECT id, capacity, booked_count FROM slots WHERE id = $1 AND status = 'AVAILABLE' FOR UPDATE;`,
        [newSlotId]
      );
      if (newSlotRes.rows.length === 0) throw new Error('NEW_SLOT_NOT_FOUND');
      const newSlot = newSlotRes.rows[0];
      if (newSlot.booked_count >= newSlot.capacity) {
        throw new Error('SLOT_CAPACITY_EXCEEDED: New slot is full');
      }

      // 3. Decrement old slot and increment new slot with strict workspace scoping
      await client.query(`UPDATE slots SET booked_count = GREATEST(0, booked_count - 1) WHERE id = $1 AND workspace_id = $2;`, [oldSlotId, workspaceId]);
      await client.query(`UPDATE slots SET booked_count = booked_count + 1 WHERE id = $1 AND workspace_id = $2;`, [newSlotId, workspaceId]);

      // 4. Update appointment
      await client.query(
        `UPDATE appointments SET slot_id = $1, status = 'RESCHEDULED' WHERE id = $2 AND workspace_id = $3;`,
        [newSlotId, appointmentId, workspaceId]
      );

      return { success: true, appointmentId, oldSlotId, newSlotId, status: 'RESCHEDULED' };
    });
  }

  /**
   * Tool 5: Request Human Counselor Handoff
   */
  public static async requestHumanHandoff(workspaceId: string, conversationId: string, reason: string) {
    return withTenantContext(workspaceId, async (client) => {
      // 1. Mark takeover active with strict workspace scoping
      await client.query(
        `UPDATE conversations SET takeover_active = TRUE WHERE id = $1 AND workspace_id = $2;`,
        [conversationId, workspaceId]
      );

      // Update in mockStore
      const conv = mockStore.conversations.find(c => c.id === conversationId);
      if (conv) {
        conv.takeoverActive = true;
      }

      // 2. Log audit event
      await client.query(
        `INSERT INTO audit_logs (workspace_id, user_id, user_name, user_role, action, target_resource, metadata)
         VALUES ($1, 'system:ai_router', 'AutoMask AI', 'platform_admin', 'HUMAN_TAKEOVER_ACTIVE', $2, $3);`,
        [workspaceId, conversationId, JSON.stringify({ reason })]
      );

      return {
        success: true,
        conversationId,
        takeoverActive: true,
        message: 'AI replies paused. Conversation routed to coaching staff inbox.',
      };
    });
  }

  /**
   * Scope Enforcement: Explicitly blocks generic e-commerce order tools in coaching MVP
   */
  public static executeTool(toolName: string, args: any) {
    if (['createOrder', 'processPayment', 'cancelOrder', 'orderStatus'].includes(toolName)) {
      throw new Error(`SCOPE_REJECTED: Tool '${toolName}' is disabled in the Coaching MVP per approved architecture roadmap.`);
    }
    throw new Error(`Unknown or disallowed tool: ${toolName}`);
  }
}
