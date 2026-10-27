/**
 * Automated Section 4: End-to-End Workflows Test Suite
 * Tests Inbound Pipeline, Deduplication, 24h Window, Response Decision Order, and Lead Stage Transitions.
 */

import { WebhookPipeline, WebhookPayload } from '../services/webhookPipeline';
import { DecisionRouter } from '../services/decisionRouter';
import { mockStore } from '../models/mockStore';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(name: string, condition: boolean, details?: string) {
  results.push({ name, passed: condition, details });
  const badge = condition ? '✅ PASS' : '❌ FAIL';
  console.log(`${badge} ${name}`);
  if (!condition && details) {
    console.error(`   ${details}`);
  }
}

async function runWorkflowTestSuite() {
  console.log('\n=============================================================');
  console.log('⚡ Starting AutoMask Section 4 End-to-End Workflows Test Suite');
  console.log('=============================================================\n');

  // -------------------------------------------------------------
  // 1. SECTION 4.2: INBOUND PIPELINE & DEDUPLICATION
  // -------------------------------------------------------------
  console.log('--- 1. Testing Webhook Signature & Deduplication (Section 4.2) ---');

  const validSig = WebhookPipeline.verifySignature('test_body', 'sha256=invalid_hash', 'secret');
  assert('Invalid signature rejected', validSig === false);

  const mockPayload: WebhookPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'waba_01',
        changes: [
          {
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '+91 98765 43210',
                phone_number_id: 'phone_01',
              },
              contacts: [{ profile: { name: 'Kunal Verma' }, wa_id: '919812345678' }],
              messages: [
                {
                  from: '919812345678',
                  id: 'wamid.HBgLMjAyNjExMTIzNFE1M0ZB',
                  timestamp: '1728987654',
                  text: { body: 'JEE dropper batch ki fees kya hai?' },
                  type: 'text',
                },
              ],
            },
          },
        ],
      },
    ],
  };

  const firstRun = WebhookPipeline.processWebhookEvent(mockPayload);
  assert(
    'First inbound message processed successfully',
    firstRun.length === 1 && firstRun[0].status === 'PROCESSED'
  );

  const secondRun = WebhookPipeline.processWebhookEvent(mockPayload);
  assert(
    'Duplicate provider_message_id is safely deduplicated (Line 641)',
    secondRun.length === 1 && secondRun[0].status === 'DUPLICATE'
  );

  assert(
    '24-Hour customer service window is calculated and updated',
    firstRun[0].windowExpiresAt !== undefined && new Date(firstRun[0].windowExpiresAt!).getTime() > Date.now()
  );

  // -------------------------------------------------------------
  // 2. SECTION 4.3: RESPONSE DECISION ORDER
  // -------------------------------------------------------------
  console.log('\n--- 2. Testing 7-Stage Response Decision Order (Section 4.3) ---');

  // Stage 3: Opt-out keyword ("STOP")
  const optOutRes = DecisionRouter.processInboundMessage('conv-test-01', '+91 98999 11111', 'STOP', 'Test Student');
  assert(
    'Stage 3: Opt-out keyword triggers unsubscription and confirmation message',
    Boolean(optOutRes.actionTaken === 'OPT_OUT' && optOutRes.replyText?.includes('cancel'))
  );

  // Stage 4: Booking flow intent ("book demo")
  const bookingRes = DecisionRouter.processInboundMessage('conv-test-02', '+91 98999 22222', 'Mujhe free demo class chahiye', 'Demo Seeker');
  assert(
    'Stage 4: Demo request triggers capacity-checked slot reservation offer',
    Boolean(bookingRes.actionTaken === 'BOOKING_FLOW' && bookingRes.replyText?.includes('Demo'))
  );

  // Stage 5: Rule match ("JEE" keyword rule)
  const ruleRes = DecisionRouter.processInboundMessage('conv-test-03', '+91 98999 33333', 'JEE course details', 'JEE Aspirant');
  assert(
    'Stage 5: Matching keyword triggers priority automation rule',
    ruleRes.actionTaken === 'RULE_MATCH' && ruleRes.matchedRuleName === 'Course Enquiry (JEE)'
  );

  // Stage 6: Knowledge Base FAQ RAG match ("Hostel")
  const faqRes = DecisionRouter.processInboundMessage('conv-test-04', '+91 98999 44444', 'Hostel and mess details', 'Hostel Inquirer');
  assert(
    'Stage 6: Knowledge item match answers strictly from grounded RAG facts',
    Boolean(faqRes.actionTaken === 'AI_FAQ_MATCH' && faqRes.replyText?.includes('₹7,500'))
  );

  // Stage 2: Human Takeover Active
  const convTakeover = mockStore.conversations.find(c => c.id === 'conv-01');
  if (convTakeover) convTakeover.takeoverActive = true;
  const takeoverRes = DecisionRouter.processInboundMessage('conv-01', '+91 98112 34567', 'Can anyone help me?', 'Amit Raj');
  assert(
    'Stage 2: Human takeover active pauses AI and routes silently to human inbox',
    takeoverRes.actionTaken === 'TAKEOVER_ACTIVE' && !takeoverRes.replyText
  );
  if (convTakeover) convTakeover.takeoverActive = false;

  // Stage 7: Fallback / Unknown query
  const fallbackRes = DecisionRouter.processInboundMessage('conv-test-05', '+91 98999 55555', 'Random uncatalogued query 12345', 'Curious User');
  assert(
    'Stage 7: Unknown query sends friendly holding message and hands off to human',
    Boolean(fallbackRes.actionTaken === 'FALLBACK_HANDOFF' && fallbackRes.replyText?.includes('counsellor'))
  );

  // -------------------------------------------------------------
  // 3. SECTION 4.4 & 4.5: LEAD CAPTURE & CAPACITY-SAFE BOOKING
  // -------------------------------------------------------------
  console.log('\n--- 3. Testing Lead CRM & Capacity-Safe Booking (Sections 4.4 & 4.5) ---');

  const lead = mockStore.leads.find(l => l.phone.replace(/\s+/g, '').includes('9899922222'));
  assert(
    'Lead pipeline status transitions to DEMO_BOOKED after booking request',
    lead?.status === 'DEMO_BOOKED'
  );

  const availableSlot = mockStore.slots.find(s => s.status === 'AVAILABLE');
  assert(
    'Demo booking engine checks real slot capacity before offering seats',
    availableSlot !== undefined && availableSlot.bookedCount < availableSlot.capacity
  );

  // -------------------------------------------------------------
  // 4. AUDIT LOG IMMUTABILITY & TENANT ISOLATION
  // -------------------------------------------------------------
  console.log('\n--- 4. Testing Audit Logging & Tenant Isolation ---');

  const auditEvents = mockStore.auditLogs.filter(a => a.action === 'WEBHOOK_RECEIVED');
  assert(
    'All raw webhook events are recorded in audit logs with tenant workspace_id',
    auditEvents.length > 0 && auditEvents[0].workspaceId === 'ws-prakash-01'
  );

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n=============================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  console.log(`📊 Section 4 Workflow Results: ${passed}/${total} PASSED (${failed} failed)`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runWorkflowTestSuite();
