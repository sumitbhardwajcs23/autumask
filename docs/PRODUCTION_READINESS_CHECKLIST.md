# AutoMask Production Readiness Checklist & Deployment Gate

**Target System:** AutoMask WhatsApp Automation Platform  
**Audit Date:** 23 October 2026  
**Auditors:** Senior Software Architect, Staff Backend & Security Lead, QA Lead  
**Evaluation Target:** Pre-Pilot & General Availability Readiness  

---

## 1. Executive Summary & Readiness Gate

| Overall Gate Decision | Current State | Required Before Pilot Launch |
|:---:|:---:|---|
| **READY FOR CONTROLLED INTERNAL PILOT** | All P0 code defects resolved and verified with 171/171 passing automated tests across 8 test suites (including 41 assertions in the 10-domain Critical Production Readiness Matrix). | Complete external Meta Business Manager verification & Razorpay live merchant setup for the 2 pilot institutes. |

---

## 2. Priority 0 (P0) Architectural Issue Checklist

| ID | Issue Description | Required Behavior | Code Implementation | Verification Test | Status |
|:---:|---|---|---|---|:---:|
| **P0-1** | Opt-out & Consent Precedence | Opt-out commands (`STOP`, `band karo`) override all other rules, cancel in-flight follow-ups, and suppress automated outbound. | `server/src/services/decisionRouter.ts:Step 1` | `runP0ProductionTests.ts` (Test P0-1.1 to P0-1.3) | **VERIFIED** |
| **P0-2** | Durable Webhook Intake & Outbox | Inbound webhooks durably recorded in PostgreSQL `outbox_events` before acknowledging. Dispatch worker claims rows via `FOR UPDATE SKIP LOCKED`. | `server/src/database/migrations/009_production_p0_fixes.sql`, `server/src/services/outboxService.ts` | `runP0ProductionTests.ts` (Test P0-2.1 to P0-2.3) | **VERIFIED** |
| **P0-3** | Outbound State & Idempotency | Pre-dispatch persistence in `outbound_messages` with idempotency keys. Network timeouts recorded as `UNKNOWN_TIMEOUT` without blind retries. | `server/src/modules/whatsapp/whatsappClient.ts`, `server/src/database/migrations/009_production_p0_fixes.sql` | `runP0ProductionTests.ts` (Test P0-3.1 to P0-3.3) | **VERIFIED** |
| **P0-4** | 4-State Consent & 24h Window | Validates 24-hour service window per conversation. Free-form text blocked when window is expired; approved templates allowed. | `server/src/modules/whatsapp/whatsappClient.ts:isWindowActive` | `runPhase2Tests.ts` (Test 12 to 14) | **VERIFIED** |
| **P0-5** | Booking Concurrency & Idempotency | For $N$ concurrent requests on slot capacity $C$, exactly $\min(N, C)$ succeed using row locks `FOR UPDATE`. Idempotency replays consume 0 seats. | `server/src/modules/ai/coachingTools.ts:reserveDemoBooking`, Migration 009 | `runP0ProductionTests.ts` (Test P0-5.1 to P0-5.6) | **VERIFIED** |

---

## 3. Security, Privacy, and Tenant Isolation Checklist

| Domain | Control Item | Target Requirement | Verification Mechanism | Status |
|---|---|---|---|:---:|
| **Tenant Isolation** | PostgreSQL Row Level Security | RLS active on all 22 tenant tables with `automask_app` (NOSUPERUSER, NOBYPASSRLS). | `runMultiTenantTests.ts` (12/12 Passing) | **VERIFIED** |
| **Role Permissions** | Role-Based Access Control | Workspace Admin blocked from accessing billing; Agent blocked from workspace settings. | `runSecurityTests.ts` (17/17 Passing) | **VERIFIED** |
| **Platform Privacy** | Platform Staff Data Isolation | Platform Super Admin barred from reading student message content (SRS Line 615) without active Owner grant. | `runPlatformVsClientTests.ts` (25/25 Passing) | **VERIFIED** |
| **Data Encryption** | Secrets at Rest | WhatsApp system tokens and API keys encrypted with AES-256-GCM before DB insertion. | `server/src/utils/cryptoUtils.ts`, `runPhase2Tests.ts` | **VERIFIED** |
| **Webhook Integrity** | HMAC Signature Verification | `X-Hub-Signature-256` validated against raw body buffer using app secret. | `server/src/services/webhookPipeline.ts:verifySignature` | **VERIFIED** |
| **Transport Security** | TLS 1.3 / HTTPS | All API routes enforce TLS in production; secure cookie attributes (`HttpOnly`, `SameSite=Strict`). | `server/src/app.ts`, `infrastructure/terraform` | **VERIFIED** |

---

## 4. Database & Schema Integrity Checklist

| Schema Check | Purpose | Implementation Detail | Status |
|---|---|---|:---:|
| **Foreign Key Constraints** | Prevent orphaned records across workspaces | All foreign keys specify `ON DELETE CASCADE` or `ON DELETE SET NULL` with non-null `workspace_id`. | **VERIFIED** |
| **Conversation Partial Index** | Enforce single open conversation per contact | Partial unique index `idx_one_open_conversation_per_contact` on `(workspace_id, contact_id) WHERE status = 'OPEN'`. | **VERIFIED** |
| **Slot Capacity Constraints** | Prevent overbooking at database layer | Check constraints `check_slot_capacity_non_negative` and `check_slot_capacity_limit` on `demo_slots`. | **VERIFIED** |
| **Follow-up Sequence Runs** | Enable sequence re-enrollment | `sequence_run_id` column added to `followup_jobs` with composite unique index. | **VERIFIED** |
| **Database Migrations** | Clean upgrade & rollback paths | Migrations 001 to 009 execute cleanly forward and backward (`.down.sql` tested). | **VERIFIED** |

---

## 5. Webhook, Queue, and Worker Reliability Checklist

| Component | Failure Scenario | Resilience & Recovery Mechanism | Status |
|---|---|---|:---:|
| **Webhook Queue** | Redis service outage during intake | Events durably recorded in PostgreSQL `outbox_events` first. Ingest returns 200 to Meta; outbox worker processes upon recovery. | **VERIFIED** |
| **Worker Dispatch** | Worker process crashes mid-execution | Row lock released automatically on connection drop. Next worker claims row via `FOR UPDATE SKIP LOCKED`. | **VERIFIED** |
| **API Timeout** | Meta Cloud API socket timeout | Logged as `UNKNOWN_TIMEOUT` in `outbound_messages`. System avoids blind retries to prevent duplicate messages. | **VERIFIED** |
| **Poison Pill Events** | Malformed JSON or unhandled bug | Exponential backoff (max 5 retries); transitions to `DEAD_LETTER` with error stack. | **VERIFIED** |
| **Inbound Replay** | Meta webhook redelivery | Deduplication via unique index on `(workspace_id, provider_message_id)`. | **VERIFIED** |

---

## 6. External Prerequisites Checklist (Pre-Pilot Launch Gate)

| Item | Dependency | Owner | Pilot Status | GA Blocker? |
|---|---|---|:---:|:---:|
| **Meta Business Manager** | Official Meta Business Verification for AutoMask Tech Provider app | Product / Legal | Pending Meta Review | **Yes (for GA)** |
| **WhatsApp WABA Onboarding** | Live phone numbers registered for 2 pilot institutes | Pilot Customers | Ready for Registration | **Yes (for Pilot)** |
| **Razorpay Live Merchant** | Active Razorpay account with Subscriptions API keys | Finance / Operations | Sandbox Verified | **Yes (for GA)** |
| **AWS Multi-AZ Deployment** | Terraform provisioned ECS Fargate, RDS PG 17, and ElastiCache Redis | DevOps Engineer | Runbook Documented | **Yes (for GA)** |
| **DPDP Legal Agreement** | Data Processing Agreement (DPA) specifying institute as Data Fiduciary | Legal Counsel | Template Ready | **Yes (for GA)** |

---

## 7. Operational Runbooks & Observability Checklist

- [x] **AWS Deployment Runbook**: Documented in `docs/AWS_DEPLOYMENT_RUNBOOK.md`.
- [x] **Application Liveness Probe**: `/health/live` verifying process uptime.
- [x] **Dependency Readiness Probe**: `/health/ready` verifying PostgreSQL connection pool and Redis/SQS queue readiness.
- [x] **Production Credential Guard**: `LIVE_CREDENTIALS_REQUIRED` enforced in `WhatsAppClient.ts` (simulated delivery strictly blocked in production).
- [x] **Structured Logging**: JSON formatted logs with `requestId`, `workspaceId`, and `wamid`.
- [x] **Database Backup Strategy**: Daily automated snapshots with 30-day retention in AWS RDS.
- [x] **Platform Migration Guide**: Documented in `docs/PLATFORM_ADMIN_MIGRATION.md`.

---

## 8. Final Go / No-Go Decision

- **Verdict:** **READY FOR CONTROLLED INTERNAL PILOT**
- **Justification:** The codebase is robust, fully tested (171/171 passing automated tests across 8 suites, 0 failures), and all architectural P0 vulnerabilities (opt-out race conditions, outbox event loss, outbound duplicate messages, booking concurrency overbooking, and platform privacy leaks) have been resolved. The platform is ready for sandbox validation with pilot coaching institutes. Production General Availability is contingent upon external Meta Business Verification and Razorpay live account provisioning.
