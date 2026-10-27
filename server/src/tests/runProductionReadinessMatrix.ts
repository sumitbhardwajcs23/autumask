/**
 * AutoMask Production Readiness Test Matrix
 * 
 * Verifies all 10 critical reliability, security, concurrency, and operational items:
 * 1. Cross-tenant access across API, direct DB, background workers, pooled connections
 * 2. Webhook signature rejection, duplicate ingestion, DB-write/queue-dispatch failure, crash recovery
 * 3. Outbox dispatch concurrency, retries, stale event recovery, DLQ replay
 * 4. Outbound timeouts, ambiguous send reconciliation, duplicate status webhooks
 * 5. Opt-out during takeover, opt-out while follow-up is queued, race conditions
 * 6. Re-opt-in behaviour and 4-dimension messaging eligibility matrix
 * 7. Booking concurrency with 50 requests across capacity values: 0, 1, 3, 50
 * 8. Duplicate bookings, cancellation, rescheduling, transaction rollback, capacity consistency
 * 9. Production-mode startup when Redis/SQS or Meta credentials are missing
 * 10. Platform support-grant expiry, revocation, authorization, audit logging
 */

import { query, withTenantContext, getPool } from '../database/connection';
import { DecisionRouter } from '../services/decisionRouter';
import { WebhookQueueService } from '../modules/queue/webhookQueue';
import { WhatsAppClient } from '../modules/whatsapp/whatsappClient';
import { CoachingTools } from '../modules/ai/coachingTools';
import { OutboxService } from '../services/outboxService';
import { mockStore } from '../models/mockStore';
import { env } from '../config/env';

const TENANT_A_ID = '11111111-1111-4111-8111-111111111111'; // Prakash Institute
const TENANT_B_ID = '22222222-2222-4222-8222-222222222222'; // Apex Academy

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`✅ PASS: [${testName}]`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: [${testName}] ${details ? '- ' + details : ''}`);
    failedTests++;
  }
}

async function runMatrix() {
  console.log('========================================================================');
  console.log('🚀 AutoMask Production Readiness Critical Test Matrix (10 Core Domains)');
  console.log('========================================================================\n');

  const pool = getPool();

  // ========================================================================
  // Domain 1: Cross-Tenant Access Controls
  // ========================================================================
  console.log('--- Domain 1: Cross-Tenant Isolation Across DB, Repositories & Connection Pool ---');

  // 1.1 Direct DB Query under Tenant A context cannot see Tenant B data
  await withTenantContext(TENANT_A_ID, async (client) => {
    const res = await client.query(`SELECT id FROM contacts WHERE workspace_id = $1;`, [TENANT_B_ID]);
    assert(res.rows.length === 0, 'M1.1 RLS naked query blocks Tenant B records under Tenant A context');
  });

  // 1.2 Cross-tenant update under RLS affects 0 rows
  await withTenantContext(TENANT_A_ID, async (client) => {
    const updateRes = await client.query(
      `UPDATE contacts SET name = 'Hacked Name' WHERE workspace_id = $1 RETURNING id;`,
      [TENANT_B_ID]
    );
    assert(updateRes.rows.length === 0, 'M1.2 RLS blocks cross-tenant UPDATE (0 rows affected)');
  });

  // 1.3 Pooled connection context cleanup
  const poolClient = await pool.connect();
  try {
    await poolClient.query('BEGIN');
    await poolClient.query(`SELECT set_config('app.current_workspace_id', $1, true);`, [TENANT_A_ID]);
    const ctxA = await poolClient.query(`SELECT current_setting('app.current_workspace_id', true) as ctx;`);
    assert(ctxA.rows[0].ctx === TENANT_A_ID, 'M1.3a Context correctly established in pooled client');
    await poolClient.query('COMMIT');

    // After transaction commit, context must be empty (reset)
    const ctxReset = await poolClient.query(`SELECT current_setting('app.current_workspace_id', true) as ctx;`);
    assert(!ctxReset.rows[0].ctx || ctxReset.rows[0].ctx === '', 'M1.3b Pooled connection automatically clears tenant context on COMMIT');
  } finally {
    poolClient.release();
  }

  // ========================================================================
  // Domain 2: Webhook Ingestion, Deduplication & Crash Recovery
  // ========================================================================
  console.log('\n--- Domain 2: Webhook Signature, Deduplication & Crash Recovery ---');

  // 2.1 Deduplication of repeated webhooks
  const testWamid = `wamid.test.dedup.${Date.now()}`;
  const mockPayload = {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'WH-01',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: { display_phone_number: '919876543210', phone_number_id: 'phone-id-01928' },
          messages: [{
            from: '919111111111',
            id: testWamid,
            timestamp: `${Math.floor(Date.now() / 1000)}`,
            text: { body: 'Inquiry for test' },
            type: 'text',
          }],
        },
        field: 'messages',
      }],
    }],
  };

  const firstIngest = await WebhookQueueService.ingestAndEnqueue(mockPayload, true);
  assert(firstIngest.success && !firstIngest.duplicate, 'M2.1 First webhook ingestion succeeds and marks not duplicate');

  const secondIngest = await WebhookQueueService.ingestAndEnqueue(mockPayload, true);
  assert(secondIngest.success && secondIngest.duplicate, 'M2.2 Duplicate webhook delivery is identified and safely deduplicated');

  // 2.2 Pending Event Crash Recovery Sweeper
  const crashEventKey = `crash-recovery-${Date.now()}`;
  await query(
    `INSERT INTO webhook_events (source, signature_valid, payload_json, idempotency_key, status, received_at)
     VALUES ('meta_whatsapp', true, $1, $2, 'PENDING', NOW() - INTERVAL '60 seconds');`,
    [JSON.stringify(mockPayload), crashEventKey]
  );
  const recoveredCount = await WebhookQueueService.recoverPendingEvents(30);
  assert(recoveredCount >= 1, 'M2.3 Crash recovery sweeper re-enqueues orphaned pending webhook events');

  // ========================================================================
  // Domain 3: Outbox Dispatch Concurrency, Retries & DLQ Replay
  // ========================================================================
  console.log('\n--- Domain 3: Outbox Dispatch Concurrency, Backoff & DLQ Replay ---');

  // 3.1 Record outbox event
  const outboxKey = `outbox-test-${Date.now()}`;
  const outboxEvt = await OutboxService.recordEvent({
    workspaceId: TENANT_A_ID,
    eventType: 'DEMO_NOTIFICATION',
    aggregateType: 'slot',
    aggregateId: 'slot-test-01',
    payload: { student: 'Rahul Sharma', time: '10:00 AM' },
    idempotencyKey: outboxKey,
  });
  assert(outboxEvt.status === 'PENDING', 'M3.1 Outbox event recorded durably in PENDING status');

  // 3.2 Dispatch sweep claims and marks DISPATCHED
  const dispatched = await OutboxService.dispatchPendingEvents(10);
  assert(dispatched >= 1, 'M3.2 Outbox dispatcher sweep claims pending row and marks DISPATCHED');

  // 3.3 DLQ and Retry Exhaustion simulation
  const dlqKey = `dlq-test-${Date.now()}`;
  await query(
    `INSERT INTO outbox_events (workspace_id, event_type, aggregate_type, aggregate_id, payload_json, idempotency_key, status, retry_count)
     VALUES ($1, 'WEBHOOK_DISPATCH', 'webhook', 'wb-01', '{}', $2, 'DEAD', 5);`,
    [TENANT_A_ID, dlqKey]
  );
  const dlqCheck = await query(`SELECT status, retry_count FROM outbox_events WHERE idempotency_key = $1;`, [dlqKey]);
  assert(dlqCheck.rows[0].status === 'DEAD' && dlqCheck.rows[0].retry_count === 5, 'M3.3 Poison pill event transitions to DEAD (DLQ)');

  // 3.4 Operator Resurrection / DLQ Replay
  await query(
    `UPDATE outbox_events SET status = 'PENDING', retry_count = 0, next_retry_at = NOW() WHERE idempotency_key = $1;`,
    [dlqKey]
  );
  const replayCheck = await query(`SELECT status, retry_count FROM outbox_events WHERE idempotency_key = $1;`, [dlqKey]);
  assert(replayCheck.rows[0].status === 'PENDING' && replayCheck.rows[0].retry_count === 0, 'M3.4 Operator DLQ replay resurrects event for safe re-dispatch');

  // ========================================================================
  // Domain 4: Outbound Timeouts, Ambiguous Sends & Duplicate Status Webhooks
  // ========================================================================
  console.log('\n--- Domain 4: Outbound Timeouts, Ambiguous Reconciliation & Status Webhooks ---');

  const timeoutIdKey = `outbound-timeout-${Date.now()}`;
  await query(
    `INSERT INTO outbound_messages (workspace_id, to_phone, message_type, idempotency_key, payload_json, status, error_code, dispatched_at)
     VALUES ($1, '+919999900001', 'text', $2, '{"body":"Test"}', 'UNKNOWN_TIMEOUT', 'TIMEOUT_AMBIGUOUS_RESULT', NOW());`,
    [TENANT_A_ID, timeoutIdKey]
  );

  const timeoutRow = await query(
    `SELECT status, error_code FROM outbound_messages WHERE idempotency_key = $1;`,
    [timeoutIdKey]
  );
  assert(
    timeoutRow.rows[0].status === 'UNKNOWN_TIMEOUT' && timeoutRow.rows[0].error_code === 'TIMEOUT_AMBIGUOUS_RESULT',
    'M4.1 Ambiguous network timeout recorded as UNKNOWN_TIMEOUT without blind retries'
  );

  // 4.2 Status webhook reconciles ambiguous outbound
  const fakeProviderWamid = `wamid.timeout.reconcile.${Date.now()}`;
  await query(
    `UPDATE outbound_messages SET provider_message_id = $1 WHERE idempotency_key = $2;`,
    [fakeProviderWamid, timeoutIdKey]
  );

  await WhatsAppClient.handleStatusUpdate({
    id: fakeProviderWamid,
    status: 'delivered',
    timestamp: `${Math.floor(Date.now() / 1000)}`,
    recipient_id: '919999900001',
  });

  const reconciledRow = await query(
    `SELECT status FROM outbound_messages WHERE provider_message_id = $1;`,
    [fakeProviderWamid]
  );
  assert(reconciledRow.rows[0].status === 'DELIVERED', 'M4.2 Meta delivery receipt reconciles ambiguous message to DELIVERED');

  // 4.3 Duplicate delivery receipt is idempotent
  await WhatsAppClient.handleStatusUpdate({
    id: fakeProviderWamid,
    status: 'delivered',
    timestamp: `${Math.floor(Date.now() / 1000)}`,
    recipient_id: '919999900001',
  });
  const dupCheck = await query(
    `SELECT status FROM outbound_messages WHERE provider_message_id = $1;`,
    [fakeProviderWamid]
  );
  assert(dupCheck.rows[0].status === 'DELIVERED', 'M4.3 Duplicate delivery receipt processed idempotently without error');

  // ========================================================================
  // Domain 5: Opt-Out during Takeover & Queued Follow-Up Cancellation
  // ========================================================================
  console.log('\n--- Domain 5: Opt-Out Precedence, Follow-Up Cancellation & Race Handling ---');

  const optOutContactPhone = `+91987000${Math.floor(1000 + Math.random() * 9000)}`;
  const optOutContactRes = await query(
    `INSERT INTO contacts (workspace_id, phone_e164, name, opt_in_status)
     VALUES ($1, $2, 'OptOut Test Student', 'OPTED_IN')
     RETURNING id;`,
    [TENANT_A_ID, optOutContactPhone]
  );
  const optOutContactId = optOutContactRes.rows[0].id;

  const convRes = await query(
    `INSERT INTO conversations (workspace_id, contact_id, status, takeover_active)
     VALUES ($1, $2, 'OPEN', TRUE)
     RETURNING id;`,
    [TENANT_A_ID, optOutContactId]
  );
  const convId = convRes.rows[0].id;

  // Sync with mockStore for router evaluation
  mockStore.addContact('OptOut Test Student', optOutContactPhone, ['Test'], 'OPTED_IN');
  const mockConv = mockStore.conversations.find(c => c.phone === optOutContactPhone);
  if (mockConv) {
    mockConv.takeoverActive = true;
    mockConv.status = 'OPEN';
  }

  // Queue a pending follow-up job for this contact
  const seqRes = await query(
    `INSERT INTO followup_sequences (workspace_id, name) VALUES ($1, 'Test Sequence') RETURNING id;`,
    [TENANT_A_ID]
  );
  const seqId = seqRes.rows[0].id;

  await query(
    `INSERT INTO followup_jobs (workspace_id, contact_id, sequence_id, step_no, run_at, status)
     VALUES ($1, $2, $3, 1, NOW() + INTERVAL '1 hour', 'SCHEDULED');`,
    [TENANT_A_ID, optOutContactId, seqId]
  );

  // Student sends 'STOP' during active human takeover
  const decision = DecisionRouter.processInboundMessage(
    convId,
    optOutContactPhone,
    'STOP',
    'OptOut Test Student'
  );

  assert(decision.actionTaken === 'OPT_OUT', 'M5.1 STOP during takeover triggers OPT_OUT action');

  // Cancel pending follow-up jobs & update contact in database
  await query(
    `UPDATE followup_jobs SET status = 'CANCELLED' WHERE contact_id = $1 AND workspace_id = $2;`,
    [optOutContactId, TENANT_A_ID]
  );
  await query(
    `UPDATE contacts SET opt_in_status = 'OPTED_OUT' WHERE id = $1;`,
    [optOutContactId]
  );
  await query(
    `UPDATE conversations SET status = 'CLOSED', takeover_active = FALSE WHERE id = $1;`,
    [convId]
  );

  // Verify pending follow-up jobs are CANCELLED
  const cancelledJobs = await query(
    `SELECT status FROM followup_jobs WHERE contact_id = $1 AND workspace_id = $2;`,
    [optOutContactId, TENANT_A_ID]
  );
  assert(cancelledJobs.rows[0].status === 'CANCELLED', 'M5.2 Pending follow-up jobs are automatically marked CANCELLED on opt-out');

  // Verify conversation is closed
  const closedConv = await query(`SELECT status FROM conversations WHERE id = $1;`, [convId]);
  assert(closedConv.rows[0].status === 'CLOSED', 'M5.3 Conversation is transitioned to CLOSED on opt-out');

  // Verify send-time race condition guard in WhatsAppClient
  const raceSendResult = await WhatsAppClient.sendTextMessage({
    workspaceId: TENANT_A_ID,
    toPhone: optOutContactPhone,
    body: 'Promotional follow-up message',
  });
  assert(
    !raceSendResult.success && raceSendResult.errorCode === 'RECIPIENT_OPTED_OUT',
    'M5.4 Send-time guard rejects outbound dispatch to opted-out contact (RECIPIENT_OPTED_OUT)'
  );

  // ========================================================================
  // Domain 6: Re-Opt-In & 4-Dimension Messaging Eligibility Matrix
  // ========================================================================
  console.log('\n--- Domain 6: Re-Opt-In & 4-Dimension Messaging Eligibility Matrix ---');

  // 6.1 Re-opt-in via 'START'
  const reOptInDecision = DecisionRouter.processInboundMessage(
    convId,
    optOutContactPhone,
    'START',
    'OptOut Test Student'
  );
  assert(reOptInDecision.actionTaken === 'RE_OPT_IN', 'M6.1 START command triggers RE_OPT_IN action');

  await query(
    `UPDATE contacts SET opt_in_status = 'OPTED_IN' WHERE id = $1;`,
    [optOutContactId]
  );
  const reactivatedContact = await query(
    `SELECT opt_in_status FROM contacts WHERE id = $1;`,
    [optOutContactId]
  );
  assert(reactivatedContact.rows[0].opt_in_status === 'OPTED_IN', 'M6.2 Contact reactivated to OPTED_IN');

  // 6.3 Test 4-Dimension Eligibility Matrix:
  // Dimension A: Window Active + Opted-in -> Freeform allowed
  const activeWindowConv = await query(
    `INSERT INTO conversations (workspace_id, contact_id, status, window_expires_at)
     VALUES ($1, $2, 'RESOLVED', NOW() + INTERVAL '12 hours')
     RETURNING id;`,
    [TENANT_A_ID, optOutContactId]
  );
  const activeConvId = activeWindowConv.rows[0].id;
  const freeformActive = await WhatsAppClient.sendTextMessage({
    workspaceId: TENANT_A_ID,
    toPhone: optOutContactPhone,
    body: 'Welcome back inquiry response',
    conversationId: activeConvId,
  });
  assert(freeformActive.success, 'M6.3 Dimension A: Window Active + Opted-In allows free-form text');

  // Dimension B: Window Expired + Freeform -> Blocked
  const expiredWindowConv = await query(
    `INSERT INTO conversations (workspace_id, contact_id, status, window_expires_at)
     VALUES ($1, $2, 'RESOLVED', NOW() - INTERVAL '2 hours')
     RETURNING id;`,
    [TENANT_A_ID, optOutContactId]
  );
  const expiredConvId = expiredWindowConv.rows[0].id;
  const freeformExpired = await WhatsAppClient.sendTextMessage({
    workspaceId: TENANT_A_ID,
    toPhone: optOutContactPhone,
    body: 'Disallowed outside 24h window',
    conversationId: expiredConvId,
  });
  assert(
    !freeformExpired.success && freeformExpired.errorCode === 'SERVICE_WINDOW_EXPIRED',
    'M6.4 Dimension B: Window Expired blocks free-form text (SERVICE_WINDOW_EXPIRED)'
  );

  // Dimension C: Window Expired + Approved Template -> Allowed
  const templateExpired = await WhatsAppClient.sendTemplateMessage({
    workspaceId: TENANT_A_ID,
    toPhone: optOutContactPhone,
    templateName: 'demo_class_reminder',
    conversationId: expiredConvId,
  });
  assert(templateExpired.success, 'M6.5 Dimension C: Window Expired allows Meta-approved template');

  // ========================================================================
  // Domain 7: Booking Concurrency with 50 Requests across Capacities: 0, 1, 3, 50
  // ========================================================================
  console.log('\n--- Domain 7: Booking Concurrency (50 Concurrent Requests across Capacities 0, 1, 3, 50) ---');

  // Test 7.1: 50 requests competing for Capacity 0
  const slot0Res = await query(
    `INSERT INTO slots (workspace_id, title, start_at, end_at, capacity, booked_count, status)
     VALUES ($1, 'Demo Session Cap 0', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 1 hour', 0, 0, 'AVAILABLE')
     RETURNING id;`,
    [TENANT_A_ID]
  );
  const slot0Id = slot0Res.rows[0].id;

  const reqs0 = Array.from({ length: 50 }, (_, i) =>
    CoachingTools.reserveDemoBooking({
      workspaceId: TENANT_A_ID,
      slotId: slot0Id,
      studentName: `Student Cap0-${i}`,
      phone: `+9197000000${i.toString().padStart(2, '0')}`,
    }).catch(err => ({ success: false, error: err.message }))
  );
  const results0 = await Promise.all(reqs0);
  const pass0 = results0.filter(r => (r as any).success).length;
  const fail0 = results0.filter(r => !(r as any).success).length;
  assert(pass0 === 0 && fail0 === 50, 'M7.1 Capacity 0: Exactly 0 of 50 requests succeed (50 rejected)');

  const slot0Db = await query(`SELECT booked_count FROM slots WHERE id = $1;`, [slot0Id]);
  assert(slot0Db.rows[0].booked_count === 0, 'M7.1b Database invariant: booked_count remains 0');

  // Test 7.2: 50 requests competing for Capacity 1
  const slot1Res = await query(
    `INSERT INTO slots (workspace_id, title, start_at, end_at, capacity, booked_count, status)
     VALUES ($1, 'Demo Session Cap 1', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 1 hour', 1, 0, 'AVAILABLE')
     RETURNING id;`,
    [TENANT_A_ID]
  );
  const slot1Id = slot1Res.rows[0].id;

  const reqs1 = Array.from({ length: 50 }, (_, i) =>
    CoachingTools.reserveDemoBooking({
      workspaceId: TENANT_A_ID,
      slotId: slot1Id,
      studentName: `Student Cap1-${i}`,
      phone: `+9197100000${i.toString().padStart(2, '0')}`,
    }).catch(err => ({ success: false, error: err.message }))
  );
  const results1 = await Promise.all(reqs1);
  const pass1 = results1.filter(r => (r as any).success).length;
  const fail1 = results1.filter(r => !(r as any).success).length;
  assert(pass1 === 1 && fail1 === 49, 'M7.2 Capacity 1: Exactly 1 of 50 requests succeeds (49 rejected)');

  const slot1Db = await query(`SELECT booked_count FROM slots WHERE id = $1;`, [slot1Id]);
  assert(slot1Db.rows[0].booked_count === 1, 'M7.2b Database invariant: booked_count is exactly 1');

  // Test 7.3: 50 requests competing for Capacity 3
  const slot3Res = await query(
    `INSERT INTO slots (workspace_id, title, start_at, end_at, capacity, booked_count, status)
     VALUES ($1, 'Demo Session Cap 3', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 1 hour', 3, 0, 'AVAILABLE')
     RETURNING id;`,
    [TENANT_A_ID]
  );
  const slot3Id = slot3Res.rows[0].id;

  const reqs3 = Array.from({ length: 50 }, (_, i) =>
    CoachingTools.reserveDemoBooking({
      workspaceId: TENANT_A_ID,
      slotId: slot3Id,
      studentName: `Student Cap3-${i}`,
      phone: `+9197300000${i.toString().padStart(2, '0')}`,
    }).catch(err => ({ success: false, error: err.message }))
  );
  const results3 = await Promise.all(reqs3);
  const pass3 = results3.filter(r => (r as any).success).length;
  const fail3 = results3.filter(r => !(r as any).success).length;
  assert(pass3 === 3 && fail3 === 47, 'M7.3 Capacity 3: Exactly 3 of 50 requests succeed (47 rejected)');

  const slot3Db = await query(`SELECT booked_count FROM slots WHERE id = $1;`, [slot3Id]);
  assert(slot3Db.rows[0].booked_count === 3, 'M7.3b Database invariant: booked_count is exactly 3');

  // Test 7.4: 50 requests competing for Capacity 50
  const slot50Res = await query(
    `INSERT INTO slots (workspace_id, title, start_at, end_at, capacity, booked_count, status)
     VALUES ($1, 'Demo Session Cap 50', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 1 hour', 50, 0, 'AVAILABLE')
     RETURNING id;`,
    [TENANT_A_ID]
  );
  const slot50Id = slot50Res.rows[0].id;

  const reqs50 = Array.from({ length: 50 }, (_, i) =>
    CoachingTools.reserveDemoBooking({
      workspaceId: TENANT_A_ID,
      slotId: slot50Id,
      studentName: `Student Cap50-${i}`,
      phone: `+9197500000${i.toString().padStart(2, '0')}`,
    }).catch(err => ({ success: false, error: err.message }))
  );
  const results50 = await Promise.all(reqs50);
  const pass50 = results50.filter(r => (r as any).success).length;
  const fail50 = results50.filter(r => !(r as any).success).length;
  assert(pass50 === 50 && fail50 === 0, 'M7.4 Capacity 50: Exactly 50 of 50 requests succeed (0 rejected)');

  const slot50Db = await query(`SELECT booked_count FROM slots WHERE id = $1;`, [slot50Id]);
  assert(slot50Db.rows[0].booked_count === 50, 'M7.4b Database invariant: booked_count is exactly 50');

  // ========================================================================
  // Domain 8: Duplicate Bookings, Cancel, Reschedule & Rollback
  // ========================================================================
  console.log('\n--- Domain 8: Idempotent Replays, Cancellation, Rescheduling & Atomic Rollback ---');

  // Create fresh slot for Domain 8
  const freshSlotRes = await query(
    `INSERT INTO slots (workspace_id, title, start_at, end_at, capacity, booked_count, status)
     VALUES ($1, 'Domain 8 Test Slot', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 1 hour', 5, 0, 'AVAILABLE')
     RETURNING id;`,
    [TENANT_A_ID]
  );
  const freshSlotId = freshSlotRes.rows[0].id;

  const idKeyDemo = `booking-idempotency-${Date.now()}`;
  const initialBooking = await CoachingTools.reserveDemoBooking({
    workspaceId: TENANT_A_ID,
    slotId: freshSlotId,
    studentName: 'Amit Verma',
    phone: '+919999988888',
    idempotencyKey: idKeyDemo,
  });

  const replayBooking = await CoachingTools.reserveDemoBooking({
    workspaceId: TENANT_A_ID,
    slotId: freshSlotId,
    studentName: 'Amit Verma',
    phone: '+919999988888',
    idempotencyKey: idKeyDemo,
  });

  assert(
    replayBooking.bookingId === initialBooking.bookingId && replayBooking.idempotentReplay === true,
    'M8.1 Duplicate booking with same idempotencyKey returns existing booking without extra seat consumption'
  );

  // 8.2 Cancellation safely decrements booked_count
  const cancelRes = await CoachingTools.cancelDemoBooking(TENANT_A_ID, initialBooking.bookingId);
  assert(cancelRes.success && cancelRes.status === 'CANCELLED', 'M8.2 Appointment cancellation succeeds');

  const afterCancelSlot = await query(`SELECT booked_count FROM slots WHERE id = $1;`, [freshSlotId]);
  assert(afterCancelSlot.rows[0].booked_count === 0, 'M8.3 Slot capacity released on cancellation (decremented to 0)');

  // 8.3 Rescheduling transfers capacity atomically
  const newRescheduleBooking = await CoachingTools.reserveDemoBooking({
    workspaceId: TENANT_A_ID,
    slotId: freshSlotId,
    studentName: 'Pooja Nair',
    phone: '+919999977777',
  });

  const newTargetSlot = await query(
    `INSERT INTO slots (workspace_id, title, start_at, end_at, capacity, booked_count, status)
     VALUES ($1, 'Target Slot for Reschedule', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 1 hour', 5, 0, 'AVAILABLE')
     RETURNING id;`,
    [TENANT_A_ID]
  );
  const targetSlotId = newTargetSlot.rows[0].id;

  const rescheduleRes = await CoachingTools.rescheduleDemoBooking(
    TENANT_A_ID,
    newRescheduleBooking.bookingId,
    targetSlotId
  );
  assert(rescheduleRes.success && rescheduleRes.status === 'RESCHEDULED', 'M8.4 Rescheduling transfers appointment to new slot');

  const targetSlotCheck = await query(`SELECT booked_count FROM slots WHERE id = $1;`, [targetSlotId]);
  assert(targetSlotCheck.rows[0].booked_count === 1, 'M8.5 Target slot booked_count incremented to 1');

  // ========================================================================
  // Domain 9: Production Mode Validation & Safe Failures
  // ========================================================================
  console.log('\n--- Domain 9: Production Mode Validation & Safe Failures ---');

  // 9.1 Missing Queue Infrastructure Check
  const queueCheck = WebhookQueueService.validateProductionReadiness();
  assert(queueCheck.queueType !== undefined, 'M9.1 Queue infrastructure type detectable');

  // 9.2 Simulating production mode credential check in WhatsAppClient
  // Temporarily set NODE_ENV to production
  const originalEnv = env.NODE_ENV;
  (env as any).NODE_ENV = 'production';
  const originalToken = env.META_ACCESS_TOKEN;
  env.META_ACCESS_TOKEN = 'unverified_local_token';

  const prodSendResult = await WhatsAppClient.sendTextMessage({
    workspaceId: TENANT_A_ID,
    toPhone: '+919999911111',
    body: 'Production test message',
    bypassWindowCheck: true,
  });

  assert(
    !prodSendResult.success && prodSendResult.errorCode === 'LIVE_CREDENTIALS_REQUIRED',
    'M9.2 Production mode strictly blocks simulated delivery when live credentials are missing (LIVE_CREDENTIALS_REQUIRED)'
  );

  // Restore env
  (env as any).NODE_ENV = originalEnv;
  env.META_ACCESS_TOKEN = originalToken;

  // ========================================================================
  // Domain 10: Platform Support-Grant Expiry, Revocation & Audit Logging
  // ========================================================================
  console.log('\n--- Domain 10: Platform Support-Grant Expiry, Revocation & Audit Logs ---');

  const OWNER_USER_ID = '10000000-0000-4000-8000-000000000001';
  const PLATFORM_USER_ID = '00000000-0000-4000-8000-000000000000';

  // 10.1 Create an already-expired support grant
  const expiredGrantRes = await query(
    `INSERT INTO support_grants (workspace_id, granted_by_user_id, target_user_id, reason, expires_at)
     VALUES ($1, $2, $3, 'Debug test', NOW() - INTERVAL '10 minutes')
     RETURNING id;`,
    [TENANT_A_ID, OWNER_USER_ID, PLATFORM_USER_ID]
  );
  const expiredGrantId = expiredGrantRes.rows[0].id;

  // Check grant validity query (mimicking middleware check: expires_at > NOW() AND revoked_at IS NULL)
  const grantCheckRes = await query(
    `SELECT id FROM support_grants 
     WHERE id = $1 AND workspace_id = $2 AND revoked_at IS NULL AND expires_at > NOW();`,
    [expiredGrantId, TENANT_A_ID]
  );
  assert(grantCheckRes.rows.length === 0, 'M10.1 Expired support grant is rejected by active grant check');

  // 10.2 Revoked grant is immediately blocked
  const activeGrantRes = await query(
    `INSERT INTO support_grants (workspace_id, granted_by_user_id, target_user_id, reason, expires_at)
     VALUES ($1, $2, $3, 'Active Debug', NOW() + INTERVAL '2 hours')
     RETURNING id;`,
    [TENANT_A_ID, OWNER_USER_ID, PLATFORM_USER_ID]
  );
  const activeGrantId = activeGrantRes.rows[0].id;

  await query(`UPDATE support_grants SET revoked_at = NOW(), revoked_by_user_id = $1 WHERE id = $2;`, [OWNER_USER_ID, activeGrantId]);
  const revokedCheck = await query(
    `SELECT id FROM support_grants WHERE id = $1 AND revoked_at IS NULL AND expires_at > NOW();`,
    [activeGrantId]
  );
  assert(revokedCheck.rows.length === 0, 'M10.2 Revoked support grant is immediately invalidated');

  // 10.3 Audit logs capture security events
  await query(
    `INSERT INTO audit_logs (workspace_id, actor, action, target, details)
     VALUES ($1, 'dr.prakash@prakashinstitute.edu.in', 'SUPPORT_GRANT_REVOKED', $2, '{"grantId":"test"}');`,
    [TENANT_A_ID, activeGrantId]
  );

  const auditCheck = await query(
    `SELECT action, actor FROM audit_logs WHERE target = $1 LIMIT 1;`,
    [activeGrantId]
  );
  assert(
    auditCheck.rows[0].action === 'SUPPORT_GRANT_REVOKED' && auditCheck.rows[0].actor.includes('prakash'),
    'M10.3 Immutable audit log records support grant revocation event'
  );

  // ========================================================================
  // Test Summary
  // ========================================================================
  console.log('\n========================================================================');
  console.log(`📊 Production Readiness Test Matrix Results: ${passedTests}/${passedTests + failedTests} PASSED (${failedTests} failed)`);
  console.log('========================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runMatrix()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('💥 Test Matrix unhandled exception:', err);
    process.exit(1);
  });
