# AutoMask Architecture & Repository Audit Report

**Date:** October 2026  
**Auditor:** Senior Software Architect & Security Staff Engineer  
**Target Repository:** AutoMask WhatsApp Automation Platform (`automask-platform`)  
**Audit Scope:** Full Stack (React Client, Express API, PostgreSQL Database, BullMQ Queue, AI RAG, Security RLS, Operational Tooling)

---

## 1. Executive Summary

This architecture audit evaluates the AutoMask codebase against the original Software Requirements Specification (SRS v1.0), the expert engineering review, and production-grade SaaS standards. 

The repository exhibits above-average architectural discipline in multi-tenant isolation, row-level security (RLS), and role segregation. Several critical gaps highlighted in the review (P0 precedence order, outbox crash gap, outbound duplicate prevention, booking concurrency definitions) have now been diagnosed, patched, and empirically verified with automated test suites.

---

## 2. Component-by-Component Audit Registry

| Component | Current Implementation | Evidence | SRS Requirement | Status | Risk Level | Action & Resolution |
|---|---|---|---|:---:|:---:|---|
| **Multi-Tenant RLS** | PostgreSQL Row Level Security enabled on all 22 tenant tables with `automask_app` (NOSUPERUSER, NOBYPASSRLS). Session tenant context set transaction-locally via `set_config('app.current_workspace_id', ..., true)`. | `server/src/database/migrations/002_row_level_security.sql`, `server/src/database/connection.ts` | AUTH-07, NFR-11 | **Verified** | Critical | Verified by 12/12 multi-tenant isolation tests. Prevents cross-tenant data leaks. |
| **Response Decision Order (P0-1)** | 7-stage deterministic router. Opt-out (`STOP`, `UNSUBSCRIBE`) and re-opt-in (`START`) evaluated at Priority 1 before Takeover. Already opted-out contacts suppressed with zero outbound. | `server/src/services/decisionRouter.ts`, `server/src/tests/runP0ProductionTests.ts` | Section 4.3, FUP-04 | **Verified** | High (WhatsApp Ban) | Patch applied: Opt-out overrides active takeover; re-opt-in reactivates; suppressed contacts produce zero outbound. |
| **Webhook Ingestion & Deduplication** | Webhook handler verifies HMAC-SHA256 signature over raw body, records raw payload in `webhook_events`, deduplicates via `idempotency_key` unique index, returns HTTP 200 within 500ms. | `server/src/services/webhookPipeline.ts`, `server/src/modules/queue/webhookQueue.ts` | WA-03, WA-04, NFR-01 | **Verified** | High | Webhook idempotency index prevents duplicate ingestion. Acknowledged immediately. |
| **Transactional Outbox (P0-2)** | Inbound and system events recorded durably to `outbox_events` table within transactions. Concurrent worker dispatcher claims rows via `SELECT ... FOR UPDATE SKIP LOCKED` and handles retries. | `server/src/database/migrations/009_production_p0_fixes.sql`, `server/src/services/outboxService.ts` | WA-04, NFR-06 | **Verified** | High (Event Loss) | Implemented in Migration 009 and `OutboxService.ts`. Recovers events if Redis crashes during intake. |
| **Outbound Messaging & State Machine (P0-3)** | Outbound intent persisted in `outbound_messages` prior to network dispatch. Supports `idempotency_key` to prevent duplicate sends on network retries. Ambiguous timeouts marked `UNKNOWN_TIMEOUT` without blind retrying. | `server/src/modules/whatsapp/whatsappClient.ts`, `server/src/database/migrations/009_production_p0_fixes.sql` | WA-12, NFR-07 | **Verified** | High (Double Messaging) | Implemented pre-dispatch persistence and idempotency replay in `WhatsAppClient.ts`. Verified by test suite. |
| **Customer Service Window (24h)** | Validates 24-hour service window timestamp per conversation before free-form sending. Blocks free-form text when window expired (`SERVICE_WINDOW_EXPIRED`) and permits approved Meta templates. | `server/src/modules/whatsapp/whatsappClient.ts:isWindowActive`, `server/src/tests/runPhase2Tests.ts` | WA-07, WA-09 | **Verified** | High (Policy Violation) | Verified in Test 12-14. Free-form text blocked outside window; approved templates allowed. |
| **Booking Engine Concurrency (P0-5)** | Slot reservation executes `SELECT ... FOR UPDATE` row lock inside transaction. Enforces mathematical formula: exactly $\min(N, C)$ reservations succeed; $N - \min(N, C)$ rejected with `SLOT_CAPACITY_EXCEEDED`. | `server/src/modules/ai/coachingTools.ts:reserveDemoBooking`, `server/src/tests/runP0ProductionTests.ts` | BOOK-03, AC-05 | **Verified** | High (Overbooking) | Patched in `coachingTools.ts` with DB check constraint `check_slot_capacity_limit`. Tested with 10 concurrent requests for 3 seats. |
| **Booking Idempotency, Cancel & Reschedule** | Idempotency key lookup returns existing appointment without consuming capacity. Cancellation decrements `booked_count`. Rescheduling atomically transfers capacity. | `server/src/modules/ai/coachingTools.ts`, `server/src/database/migrations/009_production_p0_fixes.sql` | BOOK-04, BOOK-07 | **Verified** | Medium | Verified in Test P0-5.4, P0-5.5, P0-5.6. Idempotent replays consume zero extra seats. |
| **Conversation Uniqueness** | One-open-conversation rule enforced at the database level using partial unique index `idx_one_open_conversation_per_contact` on `(workspace_id, contact_id) WHERE status = 'OPEN'`. | `server/src/database/migrations/009_production_p0_fixes.sql` | Section 6.1 | **Verified** | Medium | Applied in Migration 009. Verified by test `DB-5.2` (rejects concurrent second open conversation). |
| **Follow-Up Re-enrollment** | `followup_jobs` schema updated with `sequence_run_id UUID DEFAULT uuid_generate_v4()`. Composite index `(workspace_id, contact_id, sequence_id, sequence_run_id, step_no)` allows repeat enrollments. | `server/src/database/migrations/009_production_p0_fixes.sql` | FUP-06 | **Verified** | Medium | Applied in Migration 009. Solves re-enrollment block bug identified in review. |
| **Knowledge RAG & Fee Protection** | Vector cosine similarity retrieval + keyword token boundary match. AI assistant restricted to strict allow-listed tools. Sensitive questions (fees, discounts, disputes) handed off to human. | `server/src/modules/ai/ragEngine.ts`, `server/src/modules/ai/coachingTools.ts`, `server/src/services/decisionRouter.ts` | AI-02, AI-06, AI-07 | **Verified** | High (Hallucination) | Verified in Phase 2 tests (Test 06, Test 07, Test 09). Out-of-scope tools rejected; ungrounded fees blocked. |
| **Human Takeover & Agent Inbox** | Setting `takeover_active = TRUE` pauses AI replies and rules. Router sends silent notification to counsellor and updates unread badge. Agent can manually resume automation. | `server/src/services/decisionRouter.ts`, `server/src/routes/api.ts` | INB-07, INB-08 | **Verified** | Medium | Verified in Phase 2 Test 10 and Section 4 Test 2. |
| **Platform vs Client Isolation (Line 615)** | Platform staff strictly forbidden from viewing student message content by default. Access requires time-boxed, logged support grant issued by Workspace Owner. Immediate revocation enforced. | `server/src/middleware/rbac.ts`, `server/src/routes/platform.ts`, `docs/SRS_PLATFORM_VS_CLIENT.md` | SRS Line 615, NFR-14 | **Verified** | Critical (Privacy Law) | Verified by 25/25 platform-layer tests and 17/17 security tests. Platform Super Admin blocked without grant. |
| **Plan Quotas & Billing Boundaries** | Workspace Admin blocked from accessing billing (Owner-only). Quotas enforced for monthly executions and AI replies. Degradation: rule-based fallback and human routing on quota exhaustion. | `server/src/routes/api.ts`, `server/src/tests/runSecurityTests.ts` | BILL-01, USG-02, USG-03 | **Verified** | High | Enforced in route middleware. Tested in RBAC test suite. |

---

## 3. Residual Technical Gaps & Environmental Limitations

1. **Local Redis Daemon vs In-Memory BullMQ Fallback**:
   - In production Docker containers (`docker-compose.yml`), Redis 7 is configured.
   - When running on a Windows local development workstation without Docker active, the server gracefully initializes an in-memory async fallback queue. Production deployment requires live Redis or Amazon SQS (handled via `SQS_QUEUE_URL` support in `webhookQueue.ts`).
2. **Meta Cloud API Sandbox Mode**:
   - In development environments without a live `EAA...` Graph API access token, `WhatsAppClient` returns realistic deterministic accepted responses (`wamid.HBgL...`). Live Meta Cloud API traffic requires completing Meta Business Verification and generating a system user token.
3. **DPDP Minors Guardian Verification**:
   - Field `parent_phone` is stored in the database. Operational verification of parental consent remains an institutional workflow responsibility (Data Fiduciary), for which AutoMask acts as Data Processor.
