# AutoMask Requirements Traceability Matrix (RTM)

**Specification Version:** v2.0 Production Specification  
**System:** AutoMask WhatsApp Automation Platform  
**Coverage Scope:** Core Functional (AUTH, WA, INB, RUL, AI, LEAD, FUP, BOOK, USG, BILL, DASH) & Non-Functional (Security, Reliability, Concurrency)

---

## 1. Traceability Table

| Req ID | Capability Description | Architecture Module / Code Implementation | Test Verification Suite | Verified Assertion | Status |
|---|---|---|---|---|:---:|
| **AUTH-04** | Unique workspace creation with isolated tenant root | `server/src/database/migrations/001_initial_schema.sql` (Table `workspaces`) | `runMultiTenantTests.ts` | Multi-tenant tenant seeding (Prakash vs Apex) | **Verified** |
| **AUTH-07** | Server-side authorization & PostgreSQL RLS defense-in-depth | `server/src/database/migrations/002_row_level_security.sql`, `server/src/database/connection.ts:withTenantContext` | `runMultiTenantTests.ts` | Scenario 1–5, 9–10: Cross-tenant reads/writes blocked under RLS | **Verified** |
| **AUTH-09** | Immutable audit log for sensitive operations | `server/src/database/migrations/001_initial_schema.sql` (Table `audit_logs`), `server/src/models/mockStore.ts:logAudit` | `runWorkflowTests.ts` | Section 4: Audit events recorded with workspace_id | **Verified** |
| **WA-01** | Connect institute WhatsApp number via Embedded Signup | `server/src/database/migrations/001_initial_schema.sql` (Table `whatsapp_accounts`), `server/src/routes/api.ts` | `runAdvancedRBACTests.ts` | Section 6: WhatsApp connection callback & status | **Verified** |
| **WA-02** | Access tokens encrypted at rest (AES-256-GCM) | `server/src/utils/cryptoUtils.ts`, `server/src/modules/whatsapp/whatsappClient.ts:getCredentials` | `runPhase2Tests.ts` | Token encryption & decryption verification | **Verified** |
| **WA-03** | Webhook HMAC-SHA256 signature verification over raw body | `server/src/app.ts:express.json({verify})`, `server/src/services/webhookPipeline.ts:verifySignature` | `runWorkflowTests.ts` | Section 1: Invalid signature rejected | **Verified** |
| **WA-04** | Fast webhook acknowledgment (< 500ms) with outbox persistence | `server/src/modules/queue/webhookQueue.ts:ingestAndEnqueue`, `server/src/services/outboxService.ts` | `runP0ProductionTests.ts` | Test P0-2.1: Inbound event persisted durably in outbox | **Verified** |
| **WA-06** | Status webhook receipts (delivered, read, failed) update message state | `server/src/modules/whatsapp/whatsappClient.ts:handleStatusUpdate` | `runPhase2Tests.ts`, `runP0ProductionTests.ts` | Test 16, Test P0-3.3: Status receipts transition to DELIVERED/READ | **Verified** |
| **WA-07** | 24-Hour customer service window enforcement | `server/src/modules/whatsapp/whatsappClient.ts:isWindowActive` | `runPhase2Tests.ts` | Test 12–13: Free-form text blocked when 24h window expires | **Verified** |
| **WA-08** | Approved Meta templates permitted outside 24-hour window | `server/src/modules/whatsapp/whatsappClient.ts:sendTemplateMessage` | `runPhase2Tests.ts` | Test 14: Approved Meta template accepted outside window | **Verified** |
| **INB-01** | Shared team inbox with filters and search | `client/src/components/inbox/InboxView.tsx`, `server/src/routes/api.ts:GET /conversations` | `runSecurityTests.ts` | Section 1: Agent can access shared inbox | **Verified** |
| **INB-07** | Human takeover pauses AI automation and follow-ups | `server/src/services/decisionRouter.ts`, `server/src/modules/whatsapp/whatsappClient.ts:isTakeoverActive` | `runPhase2Tests.ts`, `runWorkflowTests.ts` | Test 10: AI automated replies paused during takeover | **Verified** |
| **RUL-04** | Deterministic automation rule priority order | `server/src/services/decisionRouter.ts` | `runWorkflowTests.ts` | Stage 5: Matching keyword triggers priority rule | **Verified** |
| **AI-02** | Knowledge-grounded AI answers strictly from facts | `server/src/modules/ai/ragEngine.ts`, `server/src/services/decisionRouter.ts` | `runWorkflowTests.ts` | Stage 6: Knowledge item match answers grounded facts | **Verified** |
| **AI-06** | Allow-listed tools only (no raw DB or arbitrary API access) | `server/src/modules/ai/coachingTools.ts` | `runPhase2Tests.ts` | Test 07: Out-of-scope tools rejected with SCOPE_REJECTED | **Verified** |
| **AI-07** | Fee/discount claims restricted: mandatory human handoff on disputes | `server/src/services/decisionRouter.ts:Step 6` | `runPhase2Tests.ts` | Test 09: Sensitive fee queries trigger counselor escalation | **Verified** |
| **LEAD-03** | Lead status pipeline transitions (New -> Interested -> Demo Booked) | `server/src/services/decisionRouter.ts:updateLeadStatus`, `server/src/modules/ai/coachingTools.ts` | `runWorkflowTests.ts` | Section 3: Lead pipeline transitions to DEMO_BOOKED | **Verified** |
| **FUP-04** | Multilingual opt-out keywords (`STOP`, `band karo`) cancel jobs | `server/src/services/decisionRouter.ts:Step 1` | `runWorkflowTests.ts`, `runP0ProductionTests.ts` | Stage 3, Test P0-1.1: Opt-out overrides takeover and cancels jobs | **Verified** |
| **BOOK-03** | Concurrency-safe demo booking (SELECT FOR UPDATE) | `server/src/modules/ai/coachingTools.ts:reserveDemoBooking`, `server/src/database/migrations/009_production_p0_fixes.sql` | `runP0ProductionTests.ts` | Test P0-5.1 & P0-5.2: Exactly min(N, C) bookings succeed | **Verified** |
| **BOOK-04** | Idempotent booking creation (no duplicate appointments) | `server/src/modules/ai/coachingTools.ts:reserveDemoBooking` | `runP0ProductionTests.ts` | Test P0-5.4 & P0-5.5: Idempotent replay consumes zero extra seats | **Verified** |
| **BOOK-07** | Demo booking cancellation and rescheduling capacity release | `server/src/modules/ai/coachingTools.ts:cancelDemoBooking, rescheduleDemoBooking` | `runP0ProductionTests.ts`, `runProductionReadinessMatrix.ts` | Test P0-5.6, M8.2–M8.5: Cancellation & reschedule transfer capacity | **Verified** |
| **BILL-01** | Config-driven plans with Owner-only billing access | `server/src/routes/api.ts:GET /billing`, `server/src/middleware/rbac.ts` | `runSecurityTests.ts` | Section 1–3: Agent and Admin denied (403); Owner allowed | **Verified** |
| **PRIV-615** | Platform Admin message content privacy safeguard | `server/src/middleware/rbac.ts:checkSupportGrant`, `server/src/routes/platform.ts` | `runSecurityTests.ts`, `runPlatformVsClientTests.ts`, `runProductionReadinessMatrix.ts` | Section 4, M10.1–M10.3: Blocked without grant; revoked grant blocked | **Verified** |
| **NFR-CONC-50** | 50 Concurrent booking requests on capacities 0, 1, 3, 50 | `server/src/modules/ai/coachingTools.ts:reserveDemoBooking` | `runProductionReadinessMatrix.ts` | M7.1–M7.4: Exactly min(50, C) succeed; N - min(50, C) rejected | **Verified** |
| **NFR-OUTBOX-02** | Outbox concurrent worker claim & DLQ poison pill replay | `server/src/services/outboxService.ts` | `runProductionReadinessMatrix.ts` | M3.1–M3.4: FOR UPDATE SKIP LOCKED; 5-retry DLQ transition & replay | **Verified** |
| **NFR-PROD-SAFE** | Production credential guard & queue infrastructure validation | `server/src/modules/whatsapp/whatsappClient.ts`, `server/src/modules/queue/webhookQueue.ts` | `runProductionReadinessMatrix.ts` | M9.1–M9.2: LIVE_CREDENTIALS_REQUIRED; simulated delivery blocked in prod | **Verified** |
| **NFR-ELIG-4D** | 4-Dimension messaging eligibility (Window + Consent + Template) | `server/src/modules/whatsapp/whatsappClient.ts` | `runProductionReadinessMatrix.ts` | M6.3–M6.5: Window active/expired + Opted-in/out + Template enforcement | **Verified** |
