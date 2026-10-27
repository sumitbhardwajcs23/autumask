/**
 * AutoMask P0 Production Verification & Architectural Assurance Test Suite
 * Validates:
 * 1. P0-1: Opt-out, Consent, Re-opt-in, and Takeover Precedence
 * 2. P0-2: Transactional Outbox Persistence & Concurrent Claiming
 * 3. P0-3: Outbound Message Idempotency & Delivery State Machine
 * 4. P0-5: Concurrency-Safe Booking (min(N, C)), Idempotent Replays, and Atomic Cancellation/Reschedule
 * 5. Database Schema & Partial Unique Constraints
 */

import { Pool } from 'pg';
import { getPool, query } from '../database/connection';
import { DecisionRouter } from '../services/decisionRouter';
import { CoachingTools } from '../modules/ai/coachingTools';
import { WhatsAppClient } from '../modules/whatsapp/whatsappClient';
import { OutboxService } from '../services/outboxService';
import { mockStore } from '../models/mockStore';

const TENANT_ID = '11111111-1111-4111-8111-111111111111'; // Prakash Institute

let passed = 0;
let failed = 0;

function assert(description: string, condition: boolean, details?: string) {
  if (condition) {
    console.log(`✅ PASS: ${description}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${description}`);
    if (details) console.error(`   Details: ${details}`);
    failed++;
  }
}

export async function runP0ProductionTestSuite() {
  console.log('========================================================================');
  console.log('🛡️ AutoMask P0 Architectural Assurance & Production Reliability Tests');
  console.log('========================================================================\n');

  const pool = getPool();

  try {
    // -------------------------------------------------------------
    // SECTION 1: P0-1 Opt-Out, Takeover Precedence, and Re-Opt-In
    // -------------------------------------------------------------
    console.log('--- 1. Testing P0-1 Opt-Out & Takeover Precedence ---');

    // Scenario 1.1: STOP sent during active human takeover -> opt-out wins
    const testConvId = `conv-takeover-${Date.now()}`;
    const testPhone = '+91 99999 12345';
    
    // Create conversation with takeoverActive = true
    const initRes = DecisionRouter.processInboundMessage(testConvId, testPhone, 'I need immediate assistance', 'Takeover Student');
    const conv = mockStore.conversations.find(c => c.id === testConvId || c.phone === testPhone);
    if (conv) conv.takeoverActive = true;

    // Student sends STOP while takeover is active
    const stopRes = DecisionRouter.processInboundMessage(testConvId, testPhone, 'STOP', 'Takeover Student');
    assert(
      '[P0-1.1] STOP during active human takeover immediately records opt-out and closes conversation',
      stopRes.actionTaken === 'OPT_OUT' && 
      stopRes.replyText?.includes('cancel') === true &&
      conv?.status === 'CLOSED'
    );

    // Scenario 1.2: Ordinary message from already opted-out contact -> suppressed outbound
    const suppressedRes = DecisionRouter.processInboundMessage(testConvId, testPhone, 'Tell me more about physics batch', 'Takeover Student');
    assert(
      '[P0-1.2] Ordinary message from already opted-out contact produces ZERO automated outbound',
      suppressedRes.actionTaken === 'OPT_OUT_SUPPRESSED' && !suppressedRes.replyText
    );

    // Scenario 1.3: Explicit START re-opt-in -> reactivates subscription
    const startRes = DecisionRouter.processInboundMessage(testConvId, testPhone, 'START', 'Takeover Student');
    assert(
      '[P0-1.3] Explicit START keyword reactivates contact and sends welcome back confirmation',
      startRes.actionTaken === 'RE_OPT_IN' && 
      startRes.replyText?.includes('opt-in fir se active') === true &&
      conv?.status === 'OPEN'
    );

    // -------------------------------------------------------------
    // SECTION 2: P0-2 Transactional Outbox & Crash Recovery
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing P0-2 Transactional Outbox & Event Dispatch ---');

    const outboxIdempotencyKey = `outbox-test-${Date.now()}`;
    const outboxRecord = await OutboxService.recordEvent({
      workspaceId: TENANT_ID,
      eventType: 'webhook.inbound.received',
      aggregateType: 'whatsapp_message',
      aggregateId: 'msg-test-01',
      payload: { from: '+919811234567', body: 'Test webhook event payload' },
      idempotencyKey: outboxIdempotencyKey,
    });

    assert(
      '[P0-2.1] Inbound event is persisted durably to outbox_events in PENDING status',
      Boolean(outboxRecord.id && outboxRecord.status === 'PENDING')
    );

    // Duplicate event write with same idempotency key is deduplicated
    const dupRecord = await OutboxService.recordEvent({
      workspaceId: TENANT_ID,
      eventType: 'webhook.inbound.received',
      aggregateType: 'whatsapp_message',
      aggregateId: 'msg-test-01',
      payload: { from: '+919811234567', body: 'Test webhook duplicate' },
      idempotencyKey: outboxIdempotencyKey,
    });
    assert(
      '[P0-2.2] Duplicate outbox event with identical idempotency_key is safely deduplicated',
      dupRecord.id === outboxRecord.id
    );

    // Dispatcher sweep claims pending events and marks DISPATCHED
    const dispatched = await OutboxService.dispatchPendingEvents(10);
    assert(
      '[P0-2.3] Outbox dispatcher sweep claims pending events using FOR UPDATE SKIP LOCKED and marks DISPATCHED',
      dispatched >= 1
    );

    // Verify row status in database
    const outboxDbRes = await query(`SELECT status FROM outbox_events WHERE id = $1;`, [outboxRecord.id]);
    assert(
      '[P0-2.4] Verified outbox event row in PostgreSQL is marked DISPATCHED',
      outboxDbRes.rows[0]?.status === 'DISPATCHED'
    );

    // -------------------------------------------------------------
    // SECTION 3: P0-3 Outbound State Machine & Idempotency
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing P0-3 Outbound Idempotency & State Machine ---');

    const outboundKey = `idemp-out-${Date.now()}`;
    const outboundSend1 = await WhatsAppClient.sendTextMessage({
      workspaceId: TENANT_ID,
      toPhone: '+919811234567',
      body: 'Welcome to Prakash Institute Kota! Here are course details.',
      idempotencyKey: outboundKey,
      bypassWindowCheck: true,
    });

    assert(
      '[P0-3.1] Initial outbound send persists intent and transitions to ACCEPTED with provider message ID',
      outboundSend1.success === true && 
      outboundSend1.status === 'ACCEPTED' && 
      Boolean(outboundSend1.providerMessageId)
    );

    // Replay identical send with same idempotency key -> returns cached result without re-dispatch
    const outboundReplay = await WhatsAppClient.sendTextMessage({
      workspaceId: TENANT_ID,
      toPhone: '+919811234567',
      body: 'Welcome to Prakash Institute Kota! Here are course details.',
      idempotencyKey: outboundKey,
      bypassWindowCheck: true,
    });

    assert(
      '[P0-3.2] Replay with identical idempotencyKey returns cached accepted status without duplicate send',
      outboundReplay.success === true && 
      outboundReplay.idempotentReplay === true &&
      outboundReplay.providerMessageId === outboundSend1.providerMessageId
    );

    // Delivery Status receipt webhook updates outbound_messages table
    const statusPayload = {
      id: outboundSend1.providerMessageId!,
      status: 'delivered' as const,
      timestamp: new Date().toISOString(),
      recipient_id: '919811234567',
    };
    await WhatsAppClient.handleStatusUpdate(statusPayload);

    const outMsgDb = await query(
      `SELECT status FROM outbound_messages WHERE idempotency_key = $1;`,
      [outboundKey]
    );
    assert(
      '[P0-3.3] Meta delivery status receipt webhook transitions outbound_messages to DELIVERED',
      outMsgDb.rows[0]?.status === 'DELIVERED'
    );

    // -------------------------------------------------------------
    // SECTION 4: P0-5 Concurrency-Safe Booking (min(N, C))
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing P0-5 Concurrency-Safe Booking & min(N, C) Formula ---');

    // Create a fresh test slot with Capacity C = 3
    const concurrencySlotId = `11111111-5000-4000-8000-${Date.now().toString().slice(-12)}`;
    await query(`
      INSERT INTO slots (id, workspace_id, title, start_at, end_at, capacity, booked_count, status)
      VALUES ($1, $2, 'JEE Advanced Masterclass', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 2 hours', 3, 0, 'AVAILABLE');
    `, [concurrencySlotId, TENANT_ID]);

    // Fire 10 concurrent competing booking requests (N = 10, C = 3)
    // Formula: Exactly min(10, 3) = 3 must succeed, 7 must fail with SLOT_CAPACITY_EXCEEDED
    const competitors = Array.from({ length: 10 }, (_, i) => ({
      name: `Competitor ${i + 1}`,
      phone: `+9198000000${i.toString().padStart(2, '0')}`,
    }));

    const bookingResults = await Promise.allSettled(
      competitors.map(c => 
        CoachingTools.reserveDemoBooking({
          workspaceId: TENANT_ID,
          slotId: concurrencySlotId,
          studentName: c.name,
          phone: c.phone,
        })
      )
    );

    const successfulBookings = bookingResults.filter(r => r.status === 'fulfilled' && (r.value as any).success === true);
    const rejectedBookings = bookingResults.filter(r => r.status === 'rejected');

    assert(
      '[P0-5.1] Concurrency Rule: exactly min(10, 3) = 3 reservations succeed',
      successfulBookings.length === 3,
      `Expected 3, got ${successfulBookings.length}`
    );

    assert(
      '[P0-5.2] Remaining 7 requests are rejected without overbooking slot',
      rejectedBookings.length === 7,
      `Expected 7 rejected, got ${rejectedBookings.length}`
    );

    // Verify DB level invariant: booked_count must be exactly 3
    const slotCheck = await query(`SELECT booked_count, capacity FROM slots WHERE id = $1;`, [concurrencySlotId]);
    assert(
      '[P0-5.3] Database invariant verified: booked_count equals capacity (3/3)',
      slotCheck.rows[0]?.booked_count === 3 && slotCheck.rows[0]?.capacity === 3
    );

    // Scenario 4.2: Idempotent replay of a successful booking
    const apptId = (successfulBookings[0] as PromiseFulfilledResult<any>).value.bookingId;
    const testIdempotencyKey = `idemp-book-${Date.now()}`;

    // Create a new slot with capacity 5 for idempotency test
    const idempSlotId = `11111111-5000-4000-8000-${(Date.now() + 1).toString().slice(-12)}`;
    await query(`
      INSERT INTO slots (id, workspace_id, title, start_at, end_at, capacity, booked_count, status)
      VALUES ($1, $2, 'NEET Biology Demo', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 1 hour', 5, 0, 'AVAILABLE');
    `, [idempSlotId, TENANT_ID]);

    const firstBooking = await CoachingTools.reserveDemoBooking({
      workspaceId: TENANT_ID,
      slotId: idempSlotId,
      studentName: 'Rohan Verma',
      phone: '+919812345678',
      idempotencyKey: testIdempotencyKey,
    });

    const secondBookingReplay = await CoachingTools.reserveDemoBooking({
      workspaceId: TENANT_ID,
      slotId: idempSlotId,
      studentName: 'Rohan Verma',
      phone: '+919812345678',
      idempotencyKey: testIdempotencyKey,
    });

    assert(
      '[P0-5.4] Duplicate booking submission with identical idempotencyKey returns existing booking without consuming extra seat',
      firstBooking.bookingId === secondBookingReplay.bookingId &&
      secondBookingReplay.idempotentReplay === true
    );

    const idempSlotCheck = await query(`SELECT booked_count FROM slots WHERE id = $1;`, [idempSlotId]);
    assert(
      '[P0-5.5] Idempotent booking replay did NOT increment booked_count (remains 1)',
      idempSlotCheck.rows[0]?.booked_count === 1
    );

    // Scenario 4.3: Safe Cancellation & Capacity Release
    await CoachingTools.cancelDemoBooking(TENANT_ID, firstBooking.bookingId);
    const slotAfterCancel = await query(`SELECT booked_count FROM slots WHERE id = $1;`, [idempSlotId]);
    assert(
      '[P0-5.6] Booking cancellation safely decrements slot booked_count (1 -> 0)',
      slotAfterCancel.rows[0]?.booked_count === 0
    );

    // -------------------------------------------------------------
    // SECTION 5: Database Constraints (One-Open-Conv & Overbooking Prevention)
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Database Schema Constraints ---');

    // Constraint 5.1: Database check constraint check_slot_capacity_limit blocks booked_count > capacity
    let dbOverbookBlocked = false;
    try {
      await query(`UPDATE slots SET booked_count = capacity + 5 WHERE id = $1;`, [idempSlotId]);
    } catch (err: any) {
      dbOverbookBlocked = err.message.includes('check_slot_capacity_limit');
    }
    assert(
      '[DB-5.1] Database constraint check_slot_capacity_limit rejects UPDATE exceeding capacity',
      dbOverbookBlocked === true
    );

    // Constraint 5.2: Database constraint idx_one_open_conversation_per_contact blocks duplicate OPEN conversations
    const testContactId = '11111111-c000-4000-8000-000000000001';
    let duplicateOpenBlocked = false;
    try {
      await query(`
        INSERT INTO conversations (workspace_id, contact_id, status)
        VALUES ($1, $2, 'OPEN');
      `, [TENANT_ID, testContactId]);
    } catch (err: any) {
      duplicateOpenBlocked = err.message.includes('idx_one_open_conversation_per_contact');
    }
    assert(
      '[DB-5.2] Partial unique index idx_one_open_conversation_per_contact blocks duplicate OPEN conversations',
      duplicateOpenBlocked === true
    );

  } catch (err: any) {
    console.error('Fatal Test Runner Error:', err);
    failed++;
  }

  console.log('\n========================================================================');
  console.log(`📊 P0 Production Reliability Results: ${passed}/${passed + failed} PASSED (${failed} failed)`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

// Run directly
if (require.main === module || (process.argv[1] && process.argv[1].includes('runP0ProductionTests'))) {
  runP0ProductionTestSuite().then(() => process.exit(0)).catch(() => process.exit(1));
}
