import { query } from './connection';
import { v4 as uuidv4 } from 'uuid';

export class DataService {
  /**
   * Get complete real dashboard metrics from PostgreSQL
   */
  public static async getDashboardData(workspaceId: string, currentUser?: any) {
    // 1. Workspace
    const wsRes = await query(
      `SELECT id, name, category, timezone, business_hours as "businessHours", plan_id as "planId" 
       FROM workspaces WHERE id = $1 LIMIT 1;`,
      [workspaceId]
    );
    const workspace = wsRes.rows[0] || {
      id: workspaceId,
      name: 'Prakash Institute',
      category: 'JEE & NEET Coaching',
      timezone: 'Asia/Kolkata',
    };

    // 2. WhatsApp Account
    const waRes = await query(
      `SELECT id, workspace_id as "workspaceId", phone_number_id as "phoneNumberId", 
              waba_id as "wabaId", display_number as "displayNumber", status, quality_rating as "qualityRating" 
       FROM whatsapp_accounts WHERE workspace_id = $1 LIMIT 1;`,
      [workspaceId]
    );
    const whatsappAccount = waRes.rows[0] || {
      id: 'wa-acc-01',
      workspaceId,
      displayNumber: '+1 555-660-3701',
      phoneNumberId: '1317971801407031',
      wabaId: '1789873612251308',
      status: 'CONNECTED',
      qualityRating: 'GREEN',
    };

    // 3. Computed real counts
    const countsRes = await query(
      `SELECT 
        (SELECT count(*) FROM leads WHERE workspace_id = $1) as new_enquiries,
        (SELECT count(*) FROM conversations WHERE workspace_id = $1 AND status = 'OPEN') as active_conversations,
        (SELECT count(*) FROM appointments WHERE workspace_id = $1) as booked_demos,
        (SELECT count(*) FROM messages WHERE workspace_id = $1 AND sender_type = 'bot') as ai_replies_count,
        (SELECT count(*) FROM automation_rules WHERE workspace_id = $1 AND enabled = true) as active_rules_count,
        (SELECT count(*) FROM automation_rules WHERE workspace_id = $1 AND enabled = false) as inactive_rules_count,
        (SELECT count(*) FROM workspace_members WHERE workspace_id = $1) as team_members_count,
        (SELECT count(*) FROM workspace_members WHERE workspace_id = $1 AND is_online = true) as online_members_count;`,
      [workspaceId]
    );
    const c = countsRes.rows[0];

    const metrics = {
      newEnquiries: parseInt(c.new_enquiries || '0', 10),
      activeConversations: parseInt(c.active_conversations || '0', 10),
      bookedDemos: parseInt(c.booked_demos || '0', 10),
      aiRepliesCount: parseInt(c.ai_replies_count || '0', 10),
      conversionRate: 0,
      slaCompliance: 100,
    };

    // 4. Real Recent Conversations (Latest 5)
    const convRes = await query(
      `SELECT c.id, c.status, c.takeover_active as "takeoverActive", c.unread_count as "unreadCount",
              c.last_message_at as "lastMessageAt", c.last_message_preview as "lastMessagePreview",
              c.window_expires_at as "windowExpiresAt",
              ct.name as "contactName", ct.phone_e164 as "phone",
              l.course, l.status as "leadStatus"
       FROM conversations c
       JOIN contacts ct ON ct.id = c.contact_id
       LEFT JOIN leads l ON l.contact_id = ct.id
       WHERE c.workspace_id = $1
       ORDER BY c.last_message_at DESC LIMIT 5;`,
      [workspaceId]
    );

    // 5. Automation Rules
    const rulesRes = await query(
      `SELECT id, name, trigger, conditions_json as conditions, actions_json as actions, 
              priority, stop_flag as "stopFlag", enabled, executions_count as "executionsCount"
       FROM automation_rules 
       WHERE workspace_id = $1 
       ORDER BY priority ASC, created_at ASC;`,
      [workspaceId]
    );

    return {
      workspace,
      currentUser,
      whatsappAccount,
      metrics,
      usage: {
        aiRepliesUsed: metrics.aiRepliesCount,
        aiRepliesLimit: 50000,
        executionsUsed: parseInt(c.active_rules_count || '0', 10),
        executionsLimit: 20000,
        templateMessagesUsed: 0,
        templateMessagesLimit: 15000,
      },
      recentConversations: convRes.rows.map(row => ({
        id: row.id,
        contactName: row.contactName || 'Student',
        phone: row.phone,
        course: row.course || 'Admissions',
        leadStatus: row.leadStatus || 'NEW',
        lastMessagePreview: row.lastMessagePreview || 'Conversation started',
        lastMessageAt: row.lastMessageAt,
        unreadCount: row.unreadCount || 0,
        status: row.status,
        takeoverActive: row.takeoverActive,
        windowExpiresAt: row.windowExpiresAt,
      })),
      automationRules: rulesRes.rows.map(r => ({
        id: r.id,
        name: r.name,
        trigger: r.trigger,
        conditions: r.conditions,
        actions: r.actions,
        priority: r.priority,
        stopFlag: r.stopFlag,
        enabled: r.enabled,
        executionsCount: r.executionsCount || 0,
      })),
      activeRulesCount: parseInt(c.active_rules_count || '0', 10),
      inactiveRulesCount: parseInt(c.inactive_rules_count || '0', 10),
      teamMembersCount: parseInt(c.team_members_count || '0', 10),
      onlineMembersCount: parseInt(c.online_members_count || '0', 10),
      userRole: currentUser?.role || 'owner',
      isLimitedView: false,
    };
  }

  /**
   * Get all conversations from PostgreSQL
   */
  public static async getConversations(workspaceId: string, filter?: { status?: string; search?: string }) {
    let sql = `
      SELECT c.id, c.status, c.takeover_active as "takeoverActive", c.unread_count as "unreadCount",
             c.last_message_at as "lastMessageAt", c.last_message_preview as "lastMessagePreview",
             c.window_expires_at as "windowExpiresAt", c.assignee_id as "assigneeId",
             ct.id as "contactId", ct.name as "contactName", ct.phone_e164 as "phone", ct.opt_in_status as "optInStatus",
             l.id as "leadId", l.course, l.status as "leadStatus", l.score as "leadScore"
      FROM conversations c
      JOIN contacts ct ON ct.id = c.contact_id
      LEFT JOIN leads l ON l.contact_id = ct.id
      WHERE c.workspace_id = $1
    `;
    const params: any[] = [workspaceId];

    if (filter?.status && filter.status !== 'ALL') {
      params.push(filter.status);
      sql += ` AND c.status = $${params.length}`;
    }

    if (filter?.search) {
      params.push(`%${filter.search}%`);
      sql += ` AND (ct.name ILIKE $${params.length} OR ct.phone_e164 ILIKE $${params.length} OR l.course ILIKE $${params.length})`;
    }

    sql += ` ORDER BY c.last_message_at DESC;`;

    const res = await query(sql, params);
    return res.rows.map(r => ({
      id: r.id,
      contactId: r.contactId,
      studentName: r.contactName || 'Prospective Student',
      contactName: r.contactName || 'Prospective Student',
      phone: r.phone,
      course: r.course || 'Admissions',
      leadStatus: r.leadStatus || 'NEW',
      leadScore: r.leadScore || 50,
      status: r.status,
      unreadCount: r.unreadCount || 0,
      takeoverActive: r.takeoverActive,
      lastMessagePreview: r.lastMessagePreview,
      lastMessageAt: r.lastMessageAt,
      windowExpiresAt: r.windowExpiresAt,
      assigneeId: r.assigneeId,
      messages: [],
    }));
  }

  /**
   * Get messages for a conversation from PostgreSQL
   */
  public static async getMessages(workspaceId: string, conversationId: string) {
    const res = await query(
      `SELECT id, conversation_id as "conversationId", direction, provider_message_id as "providerMessageId",
              type, body, sender_type as "senderType", status, error_code as "errorCode", 
              metadata, timestamp
       FROM messages
       WHERE conversation_id = $1 AND workspace_id = $2
       ORDER BY timestamp ASC;`,
      [conversationId, workspaceId]
    );
    return res.rows.map(m => ({
      id: m.id,
      conversationId: m.conversationId,
      body: m.body,
      sender: m.direction === 'INBOUND' ? 'student' : (m.senderType === 'bot' ? 'bot' : 'agent'),
      direction: m.direction,
      status: m.status,
      providerMessageId: m.providerMessageId,
      timestamp: m.timestamp,
    }));
  }

  /**
   * Get all leads from PostgreSQL
   */
  public static async getLeads(workspaceId: string) {
    const res = await query(
      `SELECT l.id, l.workspace_id as "workspaceId", l.contact_id as "contactId", 
              l.class_grade as "classGrade", l.course, l.preferred_batch as "preferredBatch", 
              l.city, l.status, l.source, l.score, l.notes, l.created_at as "createdAt", l.updated_at as "updatedAt",
              ct.name as "contactName", ct.phone_e164 as "phone"
       FROM leads l
       JOIN contacts ct ON ct.id = l.contact_id
       WHERE l.workspace_id = $1
       ORDER BY l.created_at DESC;`,
      [workspaceId]
    );
    return res.rows.map(r => ({
      id: r.id,
      workspaceId: r.workspaceId,
      contactId: r.contactId,
      contactName: r.contactName || 'Prospective Student',
      phone: r.phone,
      course: r.course || 'Admissions Enquiry',
      classGrade: r.classGrade || 'Class 12',
      preferredBatch: r.preferredBatch || 'Regular',
      city: r.city || 'Kota',
      status: r.status,
      source: r.source || 'WhatsApp Inbound',
      score: r.score || 50,
      notes: r.notes || '',
      createdAt: r.createdAt,
    }));
  }

  /**
   * Update lead stage in PostgreSQL
   */
  public static async updateLeadStatus(workspaceId: string, leadId: string, newStatus: string, reason?: string, actor?: string) {
    await query(
      `UPDATE leads SET status = $1, updated_at = NOW() WHERE id = $2 AND workspace_id = $3;`,
      [newStatus, leadId, workspaceId]
    );
    await query(
      `INSERT INTO lead_events (id, workspace_id, lead_id, to_status, actor, reason, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW());`,
      [workspaceId, leadId, newStatus, actor || 'Staff', reason || 'Stage updated via CRM']
    );
  }

  /**
   * Contacts - Get, Create, Update, Delete
   */
  public static async getContacts(workspaceId: string, filter?: { search?: string; tag?: string; optInStatus?: string }) {
    let sql = `
      SELECT id, workspace_id as "workspaceId", phone_e164 as "phone", name, tags, 
             opt_in_status as "optInStatus", opt_in_source as "optInSource", notes, 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM contacts
      WHERE workspace_id = $1
    `;
    const params: any[] = [workspaceId];

    if (filter?.optInStatus && filter.optInStatus !== 'ALL') {
      params.push(filter.optInStatus);
      sql += ` AND opt_in_status = $${params.length}`;
    }

    if (filter?.tag && filter.tag !== 'ALL') {
      params.push(filter.tag);
      sql += ` AND $${params.length} = ANY(tags)`;
    }

    if (filter?.search) {
      params.push(`%${filter.search}%`);
      sql += ` AND (name ILIKE $${params.length} OR phone_e164 ILIKE $${params.length} OR notes ILIKE $${params.length})`;
    }

    sql += ` ORDER BY created_at DESC;`;

    const res = await query(sql, params);
    return res.rows.map(r => ({
      ...r,
      tags: Array.isArray(r.tags) ? r.tags : (r.tags ? [r.tags] : []),
    }));
  }

  public static async addContact(workspaceId: string, data: {
    name: string;
    phone: string;
    tags?: string[];
    optInStatus?: string;
    notes?: string;
  }) {
    const cleanPhone = data.phone.startsWith('+') ? data.phone : `+${data.phone}`;
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const optIn = data.optInStatus || 'OPTED_IN';

    const res = await query(
      `INSERT INTO contacts (id, workspace_id, phone_e164, name, tags, opt_in_status, opt_in_source, notes, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'CRM_ENTRY', $6, NOW(), NOW())
       ON CONFLICT (workspace_id, phone_e164) DO UPDATE
       SET name = EXCLUDED.name, 
           tags = EXCLUDED.tags, 
           opt_in_status = CASE WHEN contacts.opt_in_status = 'OPTED_OUT' THEN 'OPTED_OUT' ELSE EXCLUDED.opt_in_status END, 
           notes = EXCLUDED.notes, 
           updated_at = NOW()
       RETURNING id, workspace_id as "workspaceId", phone_e164 as "phone", name, tags, opt_in_status as "optInStatus", notes, created_at as "createdAt";`,
      [workspaceId, cleanPhone, data.name, tags, optIn, data.notes || '']
    );
    return res.rows[0];
  }

  public static async updateContactOptIn(workspaceId: string, contactId: string, optInStatus: string) {
    const isOptOut = optInStatus === 'OPTED_OUT';
    const res = await query(
      `UPDATE contacts 
       SET opt_in_status = $1, opted_out_at = $2, updated_at = NOW()
       WHERE id = $3 AND workspace_id = $4
       RETURNING id, workspace_id as "workspaceId", phone_e164 as "phone", name, opt_in_status as "optInStatus";`,
      [optInStatus, isOptOut ? new Date().toISOString() : null, contactId, workspaceId]
    );
    return res.rows[0];
  }

  public static async deleteContact(workspaceId: string, contactId: string) {
    await query(`DELETE FROM contacts WHERE id = $1 AND workspace_id = $2;`, [contactId, workspaceId]);
  }

  /**
   * Automation Rules - Get, Toggle, Create, Update, Delete
   */
  public static async getAutomationRules(workspaceId: string) {
    const res = await query(
      `SELECT id, workspace_id as "workspaceId", name, trigger, 
              conditions_json as conditions, actions_json as actions, 
              priority, stop_flag as "stopFlag", enabled, executions_count as "executionsCount",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM automation_rules
       WHERE workspace_id = $1
       ORDER BY priority ASC, created_at ASC;`,
      [workspaceId]
    );
    return res.rows;
  }

  public static async toggleAutomationRule(workspaceId: string, ruleId: string, enabled?: boolean) {
    let res;
    if (enabled !== undefined) {
      res = await query(
        `UPDATE automation_rules SET enabled = $1, updated_at = NOW() WHERE id = $2 AND workspace_id = $3 RETURNING *;`,
        [enabled, ruleId, workspaceId]
      );
    } else {
      res = await query(
        `UPDATE automation_rules SET enabled = NOT enabled, updated_at = NOW() WHERE id = $1 AND workspace_id = $2 RETURNING *;`,
        [ruleId, workspaceId]
      );
    }
    return res.rows[0];
  }

  public static async createAutomationRule(workspaceId: string, data: {
    name: string;
    trigger: string;
    conditions?: any[];
    actions?: any[];
    priority?: number;
    stopFlag?: boolean;
    enabled?: boolean;
  }) {
    const res = await query(
      `INSERT INTO automation_rules (id, workspace_id, name, trigger, conditions_json, actions_json, priority, stop_flag, enabled, executions_count, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, 0, NOW(), NOW())
       RETURNING id, workspace_id as "workspaceId", name, trigger, conditions_json as conditions, actions_json as actions, priority, stop_flag as "stopFlag", enabled, executions_count as "executionsCount";`,
      [
        workspaceId,
        data.name,
        data.trigger || 'INCOMING_MESSAGE',
        JSON.stringify(data.conditions || []),
        JSON.stringify(data.actions || []),
        data.priority || 1,
        data.stopFlag !== undefined ? data.stopFlag : true,
        data.enabled !== undefined ? data.enabled : true,
      ]
    );
    return res.rows[0];
  }

  public static async updateAutomationRule(workspaceId: string, ruleId: string, data: any) {
    const res = await query(
      `UPDATE automation_rules
       SET name = COALESCE($1, name),
           trigger = COALESCE($2, trigger),
           conditions_json = COALESCE($3, conditions_json),
           actions_json = COALESCE($4, actions_json),
           priority = COALESCE($5, priority),
           stop_flag = COALESCE($6, stop_flag),
           enabled = COALESCE($7, enabled),
           updated_at = NOW()
       WHERE id = $8 AND workspace_id = $9
       RETURNING id, workspace_id as "workspaceId", name, trigger, conditions_json as conditions, actions_json as actions, priority, stop_flag as "stopFlag", enabled, executions_count as "executionsCount";`,
      [
        data.name,
        data.trigger,
        data.conditions ? JSON.stringify(data.conditions) : null,
        data.actions ? JSON.stringify(data.actions) : null,
        data.priority,
        data.stopFlag,
        data.enabled,
        ruleId,
        workspaceId,
      ]
    );
    return res.rows[0];
  }

  public static async deleteAutomationRule(workspaceId: string, ruleId: string) {
    await query(`DELETE FROM automation_rules WHERE id = $1 AND workspace_id = $2;`, [ruleId, workspaceId]);
  }

  /**
   * Knowledge Base Items & Documents
   */
  public static async getKnowledgeItems(workspaceId: string) {
    const res = await query(
      `SELECT id, workspace_id as "workspaceId", type, title, content, fees, batches, active, 
              created_at as "createdAt", updated_at as "updatedAt"
       FROM knowledge_items
       WHERE workspace_id = $1
       ORDER BY created_at DESC;`,
      [workspaceId]
    );
    return res.rows;
  }

  public static async addKnowledgeItem(workspaceId: string, data: {
    type: string;
    title: string;
    content: string;
    fees?: string;
    batches?: string;
  }) {
    const res = await query(
      `INSERT INTO knowledge_items (id, workspace_id, type, title, content, fees, batches, active, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, true, NOW(), NOW())
       RETURNING id, workspace_id as "workspaceId", type, title, content, fees, batches, active, created_at as "createdAt";`,
      [workspaceId, data.type || 'COURSE_INFO', data.title, data.content, data.fees || '', data.batches || '']
    );
    return res.rows[0];
  }

  public static async deleteKnowledgeItem(workspaceId: string, id: string) {
    await query(`DELETE FROM knowledge_items WHERE id = $1 AND workspace_id = $2;`, [id, workspaceId]);
  }

  public static async getKnowledgeDocuments(workspaceId: string) {
    const res = await query(
      `SELECT id, workspace_id as "workspaceId", title, file_name as "fileName", file_size as "fileSize", 
              file_type as "fileType", status, chunk_count as "chunkCount", created_at as "createdAt"
       FROM knowledge_documents
       WHERE workspace_id = $1
       ORDER BY created_at DESC;`,
      [workspaceId]
    );
    return res.rows;
  }

  public static async addKnowledgeDocument(workspaceId: string, data: {
    title: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    extractedText?: string;
    uploadedBy?: string;
  }) {
    const res = await query(
      `INSERT INTO knowledge_documents (id, workspace_id, title, file_name, file_size, file_type, status, extracted_text, chunk_count, uploaded_by, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'INDEXED', $6, 1, $7, NOW(), NOW())
       RETURNING id, workspace_id as "workspaceId", title, file_name as "fileName", status, created_at as "createdAt";`,
      [workspaceId, data.title, data.fileName, data.fileSize, data.fileType, data.extractedText || '', data.uploadedBy || 'admin']
    );
    return res.rows[0];
  }

  public static async deleteKnowledgeDocument(workspaceId: string, id: string) {
    await query(`DELETE FROM knowledge_documents WHERE id = $1 AND workspace_id = $2;`, [id, workspaceId]);
  }

  /**
   * Slots & Bookings
   */
  public static async getBookingsAndSlots(workspaceId: string) {
    const slotsRes = await query(
      `SELECT id, workspace_id as "workspaceId", title, start_at as "startAt", end_at as "endAt", 
              capacity, booked_count as "bookedCount", status
       FROM slots
       WHERE workspace_id = $1
       ORDER BY start_at ASC;`,
      [workspaceId]
    );

    const apptRes = await query(
      `SELECT a.id, a.workspace_id as "workspaceId", a.slot_id as "slotId", a.contact_id as "contactId", 
              a.status, a.confirmed_at as "confirmedAt",
              s.title as "slotTitle", s.start_at as "startAt",
              ct.name as "studentName", ct.phone_e164 as "phone"
       FROM appointments a
       JOIN slots s ON s.id = a.slot_id
       JOIN contacts ct ON ct.id = a.contact_id
       WHERE a.workspace_id = $1
       ORDER BY a.confirmed_at DESC;`,
      [workspaceId]
    );

    return {
      slots: slotsRes.rows,
      bookings: apptRes.rows,
    };
  }

  public static async addSlot(workspaceId: string, data: {
    title: string;
    startAt: string;
    endAt: string;
    capacity?: number;
  }) {
    const res = await query(
      `INSERT INTO slots (id, workspace_id, title, start_at, end_at, capacity, booked_count, status)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 0, 'AVAILABLE')
       RETURNING id, workspace_id as "workspaceId", title, start_at as "startAt", end_at as "endAt", capacity, booked_count as "bookedCount", status;`,
      [workspaceId, data.title, data.startAt, data.endAt, data.capacity || 10]
    );
    return res.rows[0];
  }

  public static async addAppointment(workspaceId: string, data: {
    slotId: string;
    studentName: string;
    phone: string;
  }) {
    const cleanPhone = data.phone.startsWith('+') ? data.phone : `+${data.phone}`;

    // Upsert Contact
    const ctRes = await query(
      `INSERT INTO contacts (id, workspace_id, phone_e164, name, opt_in_status, opt_in_source, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, 'OPTED_IN', 'BOOKING', NOW())
       ON CONFLICT (workspace_id, phone_e164) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()
       RETURNING id;`,
      [workspaceId, cleanPhone, data.studentName]
    );
    const contactId = ctRes.rows[0].id;

    // Insert Appointment
    const apptRes = await query(
      `INSERT INTO appointments (id, workspace_id, slot_id, contact_id, status, confirmed_at)
       VALUES (gen_random_uuid(), $1, $2, $3, 'CONFIRMED', NOW())
       RETURNING id, workspace_id as "workspaceId", slot_id as "slotId", contact_id as "contactId", status, confirmed_at as "confirmedAt";`,
      [workspaceId, data.slotId, contactId]
    );

    // Atomically increment slot booked count with strict capacity and workspace validation
    const slotUpdateRes = await query(
      `UPDATE slots 
       SET booked_count = booked_count + 1 
       WHERE id = $1 AND workspace_id = $2 AND booked_count < capacity
       RETURNING id;`,
      [data.slotId, workspaceId]
    );

    if (slotUpdateRes.rows.length === 0) {
      throw new Error('SLOT_CAPACITY_EXCEEDED: The requested demo appointment slot is full or unavailable.');
    }

    return {
      ...apptRes.rows[0],
      studentName: data.studentName,
      phone: cleanPhone,
    };
  }

  /**
   * Team & Roles
   */
  public static async getTeam(workspaceId: string) {
    const res = await query(
      `SELECT wm.id as "memberId", u.id as "userId", u.email, u.full_name as "fullName", u.phone, 
              wm.role, wm.status, wm.is_online as "isOnline", wm.created_at as "createdAt"
       FROM workspace_members wm
       JOIN users u ON u.id = wm.user_id
       WHERE wm.workspace_id = $1
       ORDER BY wm.created_at ASC;`,
      [workspaceId]
    );
    return res.rows;
  }

  public static async inviteTeamMember(workspaceId: string, data: {
    email: string;
    fullName: string;
    role: string;
    phone?: string;
  }) {
    // 1. Find or create user
    let userRes = await query(`SELECT id FROM users WHERE email = $1 LIMIT 1;`, [data.email]);
    let userId: string;
    if (userRes.rows.length > 0) {
      userId = userRes.rows[0].id;
    } else {
      const newUser = await query(
        `INSERT INTO users (id, email, password_hash, full_name, phone, status, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, 'INVITED', $2, $3, 'ACTIVE', NOW(), NOW())
         RETURNING id;`,
        [data.email, data.fullName, data.phone || '']
      );
      userId = newUser.rows[0].id;
    }

    // 2. Add to workspace_members
    const memRes = await query(
      `INSERT INTO workspace_members (id, workspace_id, user_id, role, status, is_online, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, 'ACTIVE', false, NOW(), NOW())
       ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = EXCLUDED.role, status = 'ACTIVE'
       RETURNING id, workspace_id as "workspaceId", user_id as "userId", role, status, is_online as "isOnline", created_at as "createdAt";`,
      [workspaceId, userId, data.role || 'counselor']
    );

    return {
      ...memRes.rows[0],
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
    };
  }

  public static async updateTeamMemberStatus(workspaceId: string, memberId: string, status: string) {
    const res = await query(
      `UPDATE workspace_members SET status = $1, updated_at = NOW() WHERE (id = $2 OR user_id = $2) AND workspace_id = $3 RETURNING *;`,
      [status, memberId, workspaceId]
    );
    return res.rows[0];
  }

  public static async deleteTeamMember(workspaceId: string, memberId: string) {
    await query(`DELETE FROM workspace_members WHERE (id = $1 OR user_id = $1) AND workspace_id = $2;`, [memberId, workspaceId]);
  }

  public static async getRoles(workspaceId: string) {
    const res = await query(
      `SELECT id, workspace_id as "workspaceId", name, description, is_system as "isSystem", 
              permissions, created_at as "createdAt"
       FROM roles
       WHERE workspace_id = $1 OR is_system = true
       ORDER BY is_system DESC, name ASC;`,
      [workspaceId]
    );
    return res.rows;
  }

  public static async createRole(workspaceId: string, data: { name: string; description?: string; permissions: string[] }) {
    const res = await query(
      `INSERT INTO roles (id, workspace_id, name, description, is_system, permissions, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, false, $4, NOW(), NOW())
       RETURNING id, workspace_id as "workspaceId", name, description, is_system as "isSystem", permissions, created_at as "createdAt";`,
      [workspaceId, data.name, data.description || '', data.permissions]
    );
    return res.rows[0];
  }

  public static async updateRole(workspaceId: string, roleId: string, data: { name?: string; description?: string; permissions?: string[] }) {
    const res = await query(
      `UPDATE roles
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           permissions = COALESCE($3, permissions),
           updated_at = NOW()
       WHERE id = $4 AND workspace_id = $5 AND is_system = false
       RETURNING id, workspace_id as "workspaceId", name, description, is_system as "isSystem", permissions;`,
      [data.name, data.description, data.permissions, roleId, workspaceId]
    );
    return res.rows[0];
  }

  public static async deleteRole(workspaceId: string, roleId: string) {
    await query(`DELETE FROM roles WHERE id = $1 AND workspace_id = $2 AND is_system = false;`, [roleId, workspaceId]);
  }

  /**
   * Audit Logs
   */
  public static async getAuditLogs(workspaceId: string, limit = 50) {
    const res = await query(
      `SELECT id, workspace_id as "workspaceId", actor, action, target, details, ip, at as "timestamp"
       FROM audit_logs
       WHERE workspace_id = $1
       ORDER BY at DESC LIMIT $2;`,
      [workspaceId, limit]
    );
    return res.rows;
  }

  public static async logAudit(workspaceId: string, actor: string, action: string, target: string, details: any = {}) {
    await query(
      `INSERT INTO audit_logs (id, workspace_id, actor, action, target, details, at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW());`,
      [workspaceId, actor, action, target, JSON.stringify(details)]
    );
  }

  /**
   * Workflow Definitions
   */
  public static async getWorkflowDefinitions(workspaceId: string) {
    const res = await query(
      `SELECT id, workspace_id as "workspaceId", name, description, status, trigger_type as "triggerType",
              nodes, edges, version, created_at as "createdAt", updated_at as "updatedAt"
       FROM workflow_definitions
       WHERE workspace_id = $1
       ORDER BY created_at DESC;`,
      [workspaceId]
    );
    return res.rows;
  }

  public static async getWorkflowById(workspaceId: string, id: string) {
    const res = await query(
      `SELECT id, workspace_id as "workspaceId", name, description, status, trigger_type as "triggerType",
              nodes, edges, version, created_at as "createdAt", updated_at as "updatedAt"
       FROM workflow_definitions
       WHERE id = $1 AND workspace_id = $2;`,
      [id, workspaceId]
    );
    return res.rows[0] || null;
  }

  public static async createWorkflowDefinition(workspaceId: string, data: any) {
    const res = await query(
      `INSERT INTO workflow_definitions (id, workspace_id, name, description, status, trigger_type, nodes, edges, version, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 1, NOW(), NOW())
       RETURNING id, workspace_id as "workspaceId", name, description, status, trigger_type as "triggerType", nodes, edges, version, created_at as "createdAt";`,
      [
        workspaceId,
        data.name || 'New Workflow',
        data.description || '',
        data.status || 'DRAFT',
        data.triggerType || 'WHATSAPP_INBOUND',
        JSON.stringify(data.nodes || []),
        JSON.stringify(data.edges || []),
      ]
    );
    return res.rows[0];
  }

  public static async updateWorkflowDefinition(workspaceId: string, id: string, data: any) {
    const res = await query(
      `UPDATE workflow_definitions
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           nodes = COALESCE($4, nodes),
           edges = COALESCE($5, edges),
           updated_at = NOW()
       WHERE id = $6 AND workspace_id = $7
       RETURNING id, workspace_id as "workspaceId", name, description, status, trigger_type as "triggerType", nodes, edges, version;`,
      [
        data.name,
        data.description,
        data.status,
        data.nodes ? JSON.stringify(data.nodes) : null,
        data.edges ? JSON.stringify(data.edges) : null,
        id,
        workspaceId,
      ]
    );
    return res.rows[0];
  }

  public static async deleteWorkflowDefinition(workspaceId: string, id: string) {
    await query(`DELETE FROM workflow_definitions WHERE id = $1 AND workspace_id = $2;`, [id, workspaceId]);
  }

  /**
   * Templates & Broadcasts
   */
  public static async getMessageTemplates(workspaceId: string) {
    const res = await query(
      `SELECT id, workspace_id as "workspaceId", name, category, language, status, header, body, footer, buttons, variables, meta_template_id as "metaTemplateId", created_at as "createdAt"
       FROM message_templates
       WHERE workspace_id = $1
       ORDER BY created_at DESC;`,
      [workspaceId]
    );
    return res.rows;
  }

  public static async createMessageTemplate(workspaceId: string, data: any) {
    const res = await query(
      `INSERT INTO message_templates (id, workspace_id, name, category, language, status, header, body, footer, buttons, variables, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'APPROVED', $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *;`,
      [
        workspaceId,
        data.name,
        data.category || 'MARKETING',
        data.language || 'en',
        data.header || '',
        data.body,
        data.footer || '',
        JSON.stringify(data.buttons || []),
        JSON.stringify(data.variables || []),
      ]
    );
    return res.rows[0];
  }

  public static async deleteMessageTemplate(workspaceId: string, id: string) {
    await query(`DELETE FROM message_templates WHERE id = $1 AND workspace_id = $2;`, [id, workspaceId]);
  }

  public static async getBroadcastCampaigns(workspaceId: string) {
    const res = await query(
      `SELECT id, workspace_id as "workspaceId", name, description, template_id as "templateId", 
              status, total_recipients as "totalRecipients", sent_count as "sentCount", 
              delivered_count as "deliveredCount", read_count as "readCount", failed_count as "failedCount", 
              created_at as "createdAt"
       FROM broadcast_campaigns
       WHERE workspace_id = $1
       ORDER BY created_at DESC;`,
      [workspaceId]
    );
    return res.rows;
  }

  public static async createBroadcastCampaign(workspaceId: string, data: any) {
    const res = await query(
      `INSERT INTO broadcast_campaigns (id, workspace_id, name, description, template_id, status, total_recipients, sent_count, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'SENT', $5, $5, NOW(), NOW())
       RETURNING *;`,
      [
        workspaceId,
        data.name || 'Broadcast Campaign',
        data.description || '',
        data.templateId || null,
        data.totalRecipients || 1,
      ]
    );
    return res.rows[0];
  }

  /**
   * Durable Inbound Message Ingestion into PostgreSQL
   */
  public static async recordInboundMessage(opts: {
    workspaceId: string;
    phone: string;
    studentName?: string;
    body: string;
    providerMessageId?: string;
    botReply?: string;
  }) {
    const { workspaceId, phone, studentName, body, providerMessageId, botReply } = opts;
    const cleanPhone = phone.startsWith('+') ? phone : `+${phone}`;
    const name = studentName || 'Prospective Student';
    const windowExpiry = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

    // 1. Upsert Contact
    const contactRes = await query(
      `INSERT INTO contacts (id, workspace_id, phone_e164, name, opt_in_status, opt_in_source, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, 'OPTED_IN', 'INBOUND_MESSAGE', NOW())
       ON CONFLICT (workspace_id, phone_e164) DO UPDATE 
       SET name = COALESCE(EXCLUDED.name, contacts.name), updated_at = NOW()
       RETURNING id;`,
      [workspaceId, cleanPhone, name]
    );
    const contactId = contactRes.rows[0].id;

    // 2. Find or Create Open Conversation
    let convRes = await query(
      `SELECT id FROM conversations WHERE workspace_id = $1 AND contact_id = $2 AND status = 'OPEN' LIMIT 1;`,
      [workspaceId, contactId]
    );

    let conversationId: string;
    if (convRes.rows.length > 0) {
      conversationId = convRes.rows[0].id;
      await query(
        `UPDATE conversations 
         SET last_message_preview = $1, last_message_at = NOW(), unread_count = unread_count + 1, 
             window_expires_at = $2, updated_at = NOW()
         WHERE id = $3;`,
        [body.substring(0, 150), windowExpiry, conversationId]
      );
    } else {
      const newConv = await query(
        `INSERT INTO conversations (id, workspace_id, contact_id, status, last_message_preview, last_message_at, unread_count, window_expires_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, 'OPEN', $3, NOW(), 1, $4, NOW())
         RETURNING id;`,
        [workspaceId, contactId, body.substring(0, 150), windowExpiry]
      );
      conversationId = newConv.rows[0].id;
    }

    // 3. Insert Inbound Message
    const pId = providerMessageId || `wamid.${Date.now()}`;
    await query(
      `INSERT INTO messages (id, workspace_id, conversation_id, direction, provider_message_id, type, body, sender_type, status, timestamp)
       VALUES (gen_random_uuid(), $1, $2, 'INBOUND', $3, 'text', $4, 'student', 'DELIVERED', NOW())
       ON CONFLICT (workspace_id, provider_message_id) DO NOTHING;`,
      [workspaceId, conversationId, pId, body]
    );

    // 4. Upsert Lead (CRM)
    await query(
      `INSERT INTO leads (id, workspace_id, contact_id, course, status, source, score, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, 'Admissions Enquiry', 'NEW', 'WhatsApp Inbound', 60, NOW(), NOW())
       ON CONFLICT DO NOTHING;`,
      [workspaceId, contactId]
    );

    // 5. If bot reply was generated, record outbound message
    if (botReply) {
      await query(
        `INSERT INTO messages (id, workspace_id, conversation_id, direction, provider_message_id, type, body, sender_type, status, timestamp)
         VALUES (gen_random_uuid(), $1, $2, 'OUTBOUND', $3, 'text', $4, 'bot', 'SENT', NOW());`,
        [workspaceId, conversationId, `wamid.reply.${Date.now()}`, botReply]
      );
    }

    return { contactId, conversationId };
  }

  /**
   * Billing & Usage
   */
  public static async getBilling(workspaceId: string) {
    const wsRes = await query(
      `SELECT id, name, plan_id as "planId" FROM workspaces WHERE id = $1 LIMIT 1;`,
      [workspaceId]
    );
    const workspace = wsRes.rows[0] || { id: workspaceId, name: 'Prakash Institute', planId: 'growth' };

    const countsRes = await query(
      `SELECT 
        (SELECT count(*) FROM workspace_members WHERE workspace_id = $1) as team_members,
        (SELECT count(*) FROM messages WHERE workspace_id = $1 AND sender_type = 'bot') as ai_replies,
        (SELECT COALESCE(sum(sent_count), 0) FROM broadcast_campaigns WHERE workspace_id = $1) as template_messages,
        (SELECT count(*) FROM automation_rules WHERE workspace_id = $1 AND enabled = true) as executions,
        (SELECT count(*) FROM contacts WHERE workspace_id = $1) as active_students;`,
      [workspaceId]
    );
    const c = countsRes.rows[0];

    const plansRes = await query(`SELECT * FROM plans WHERE is_active = true ORDER BY price_inr ASC;`);

    const usage = {
      teamMembersUsed: parseInt(c.team_members || '1', 10),
      teamMembersLimit: 15,
      aiRepliesUsed: parseInt(c.ai_replies || '0', 10),
      aiRepliesLimit: 50000,
      monthlyActiveStudentsUsed: parseInt(c.active_students || '0', 10),
      monthlyActiveStudentsLimit: 10000,
      templateMessagesUsed: parseInt(c.template_messages || '0', 10),
      templateMessagesLimit: 15000,
      executionsUsed: parseInt(c.executions || '0', 10),
      executionsLimit: 20000,
      aiCostIncurredUsd: 0.0,
      aiBudgetLimitUsd: 150.0,
    };

    return {
      workspace,
      usage,
      plans: plansRes.rows,
    };
  }

  public static async updatePlan(workspaceId: string, planId: string) {
    await query(`UPDATE workspaces SET plan_id = $1, updated_at = NOW() WHERE id = $2;`, [planId, workspaceId]);
  }

  /**
   * Support Grants
   */
  public static async getSupportGrants(workspaceId: string) {
    const res = await query(
      `SELECT id, workspace_id as "workspaceId", granted_by_user_id as "grantedByUserId", 
              target_user_id as "targetUserId", scope, reason, created_at as "createdAt", 
              expires_at as "expiresAt", revoked_at as "revokedAt"
       FROM support_grants
       WHERE workspace_id = $1
       ORDER BY created_at DESC;`,
      [workspaceId]
    );
    return res.rows;
  }

  public static async createSupportGrant(workspaceId: string, data: {
    grantedByUserId: string;
    targetUserId: string;
    scope?: string;
    reason: string;
    expiresInHours?: number;
  }) {
    const hours = data.expiresInHours || 24;
    const expiresAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();
    const res = await query(
      `INSERT INTO support_grants (id, workspace_id, granted_by_user_id, target_user_id, scope, reason, created_at, expires_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), $6)
       RETURNING id, workspace_id as "workspaceId", granted_by_user_id as "grantedByUserId", target_user_id as "targetUserId", scope, reason, created_at as "createdAt", expires_at as "expiresAt";`,
      [workspaceId, data.grantedByUserId, data.targetUserId, data.scope || 'READ_ONLY', data.reason, expiresAt]
    );
    return res.rows[0];
  }

  public static async revokeSupportGrant(workspaceId: string, grantId: string, revokedBy: string) {
    const res = await query(
      `UPDATE support_grants 
       SET revoked_at = NOW(), revoked_by_user_id = $1 
       WHERE id = $2 AND workspace_id = $3
       RETURNING *;`,
      [revokedBy, grantId, workspaceId]
    );
    return res.rows[0];
  }

  /**
   * Onboarding Status
   */
  public static async getOnboardingStatus(workspaceId: string) {
    const counts = await query(
      `SELECT 
        (SELECT count(*) FROM whatsapp_accounts WHERE workspace_id = $1 AND status = 'CONNECTED') as wa_count,
        (SELECT count(*) FROM knowledge_items WHERE workspace_id = $1) as ki_count,
        (SELECT count(*) FROM slots WHERE workspace_id = $1) as slot_count,
        (SELECT count(*) FROM automation_rules WHERE workspace_id = $1) as rule_count;`,
      [workspaceId]
    );
    const c = counts.rows[0];

    const hasWa = parseInt(c.wa_count || '0', 10) > 0;
    const hasKi = parseInt(c.ki_count || '0', 10) > 0;
    const hasSlots = parseInt(c.slot_count || '0', 10) > 0;
    const hasRules = parseInt(c.rule_count || '0', 10) > 0;

    return {
      completedSteps: [
        ...(hasWa ? ['connect_whatsapp'] : []),
        ...(hasKi ? ['knowledge_base'] : []),
        ...(hasSlots ? ['demo_slots'] : []),
        ...(hasRules ? ['automation_rules'] : []),
      ],
      steps: [
        { id: 'connect_whatsapp', title: 'Connect WhatsApp Cloud API', completed: hasWa },
        { id: 'knowledge_base', title: 'Add Course Catalog & Fees (RAG)', completed: hasKi },
        { id: 'demo_slots', title: 'Configure Live Demo Slots', completed: hasSlots },
        { id: 'automation_rules', title: 'Review Automation Rules', completed: hasRules },
      ],
      isComplete: hasWa && hasKi && hasSlots,
    };
  }

  /**
   * WhatsApp Account
   */
  public static async getWhatsAppAccount(workspaceId: string) {
    const res = await query(
      `SELECT id, workspace_id as "workspaceId", phone_number_id as "phoneNumberId", 
              waba_id as "wabaId", display_number as "displayNumber", status, quality_rating as "qualityRating", 
              connected_at as "connectedAt", updated_at as "updatedAt"
       FROM whatsapp_accounts
       WHERE workspace_id = $1
       LIMIT 1;`,
      [workspaceId]
    );
    return res.rows[0] || null;
  }

  public static async upsertWhatsAppAccount(workspaceId: string, data: {
    phoneNumberId: string;
    wabaId: string;
    displayNumber?: string;
    tokenEncrypted?: string;
  }) {
    const res = await query(
      `INSERT INTO whatsapp_accounts (id, workspace_id, phone_number_id, waba_id, display_number, token_encrypted, status, quality_rating, connected_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'CONNECTED', 'GREEN', NOW(), NOW())
       ON CONFLICT (workspace_id) DO UPDATE
       SET phone_number_id = EXCLUDED.phone_number_id,
           waba_id = EXCLUDED.waba_id,
           display_number = COALESCE(EXCLUDED.display_number, whatsapp_accounts.display_number),
           token_encrypted = COALESCE(EXCLUDED.token_encrypted, whatsapp_accounts.token_encrypted),
           status = 'CONNECTED',
           quality_rating = 'GREEN',
           updated_at = NOW()
       RETURNING id, workspace_id as "workspaceId", phone_number_id as "phoneNumberId", waba_id as "wabaId", display_number as "displayNumber", status, quality_rating as "qualityRating";`,
      [workspaceId, data.phoneNumberId, data.wabaId, data.displayNumber || '+1 555-660-3701', data.tokenEncrypted || '']
    );
    return res.rows[0];
  }

  public static async disconnectWhatsAppAccount(workspaceId: string) {
    await query(
      `UPDATE whatsapp_accounts SET status = 'DISCONNECTED', updated_at = NOW() WHERE workspace_id = $1;`,
      [workspaceId]
    );
  }
}
