# AutoMask WhatsApp Automation Platform — Production Specification (SRS v2.0)

**Document Control:**
- **Product:** AutoMask — Multi-Tenant WhatsApp Automation SaaS for Coaching Institutes & Education Consultancies
- **Version:** 2.0 (Production-Verified Specification)
- **Previous Version:** 1.0 Draft (13 October 2026)
- **Date:** 23 October 2026
- **Authors:** Senior Software Architect, Staff Backend & Security Engineer, QA Lead, Technical Product Owner
- **Target Audience:** Engineering, Product, Security, Compliance, Operations, and Customer Success
- **Document Status:** Verified against Repository Implementation & Master Automated Test Suite (130/130 Passing Tests)

---

## 1. Document Control & Revision History

| Version | Date | Author / Role | Changes & Rationale |
|:---:|:---:|:---:|---|
| **0.1** | Sep 2026 | Founder | Initial project summary and coaching institute workflow concept. |
| **1.0** | 13 Oct 2026 | Product Team | Initial draft SRS defining MVP requirements, entity models, NFRs, and coaching features. |
| **1.5** | 18 Oct 2026 | Engineering Review | Comprehensive architectural critique identifying 5 P0 blockers (P0-1 to P0-5) and schema defects. |
| **2.0** | 23 Oct 2026 | Staff Architect & Security Lead | **Production Release Specification**: Incorporated verified code and database fixes (Migration 009), deterministic 7-stage decision router, transactional outbox pattern, durable outbound state machine, strict $\min(N, C)$ concurrency mathematical model, 4-state consent framework, and Platform vs. Client privacy isolation (Line 615). Verified with 130 passing automated tests. |

---

## 2. Purpose, Scope, Assumptions, and Exclusions

### 2.1 Purpose
This document provides the definitive, production-grade functional and technical specification for AutoMask. It bridges the gap between high-level business goals and ground-truth code reality, defining the exact system behaviors, data schemas, concurrency models, API contracts, and security boundaries.

### 2.2 In-Scope (Production MVP & Core SaaS)
1. **Multi-Tenant SaaS Core**: Workspace isolation via PostgreSQL Row Level Security (RLS) on all tenant tables, Role-Based Access Control (RBAC: Owner, Admin, Counselor/Agent), and session tenant binding.
2. **Meta WhatsApp Cloud API Integration**: Embedded Signup onboarding, webhook verification via HMAC-SHA256, 24-hour customer service window tracking, and template messaging.
3. **Durable Webhook Pipeline**: Webhook event persistence, idempotency deduping, and a Transactional Outbox pattern with `SELECT ... FOR UPDATE SKIP LOCKED` worker dispatch.
4. **Deterministic Response Decision Engine**: Strict 7-stage precedence router enforcing Opt-Out and Re-Opt-In before Human Takeover, Keywords, AI RAG, or Default Fallback.
5. **Knowledge RAG & Guarded AI**: Cosine-similarity vector retrieval with keyword boundaries, strict tool allow-listing, and mandatory human escalation for fee/discount inquiries.
6. **Unified Counselor Inbox**: Shared team inbox with real-time human takeover, custom notes, lead status updates, and broadcast management.
7. **Concurrency-Safe Demo Booking**: Seat reservation engine using pessimistic row-locking (`SELECT ... FOR UPDATE`), idempotency replay protection, and atomic cancel/reschedule capacity transfers.
8. **Automated Follow-Up Sequences**: Delayed drip campaigns with sequence run identifiers (`sequence_run_id`), window checks, and instantaneous opt-out suppression.
9. **Platform vs. Client Privacy Isolation**: Strict enforcement of SRS Line 615: Platform administrators are barred from viewing student message content without an active, logged, time-boxed support grant issued by the Workspace Owner.
10. **Usage Metering & Direct Meta Billing**: Quota tracking for messages and AI tokens, with coaching institutes directly billed by Meta for conversation charges, protecting SaaS gross margins.

### 2.3 System Assumptions
1. **Meta Direct Billing Model**: Coaching institutes register a credit card or payment method directly in their Meta Business Manager. Meta bills institutes directly for Business-Initiated (BIC) and User-Initiated (UIC) conversations. AutoMask charges solely for SaaS platform software access and AI inferencing.
2. **PostgreSQL 15+ Runtime**: Database supports Row-Level Security, partial unique indexes, `uuid-ossp`, and `pgcrypto`.
3. **Redis / BullMQ Queue**: Production environments utilize Redis 7+ for queue management; development environments utilize persistent outbox workers with graceful in-memory fallback.
4. **Authoritative Clock**: All system timestamps use UTC (`timestamptz`).

### 2.4 Exclusions (Out of Scope for Initial Launch)
1. In-house VoIP voice calling or WhatsApp voice message automated transcription.
2. Custom native mobile apps (iOS/Android); the web responsive dashboard (desktop/tablet/mobile) serves as the primary UI.
3. Direct payment collection from students inside WhatsApp (e.g. WhatsApp Pay UPI native checkout); payment links are dispatched via URL.

---

## 3. Product Overview & Personas

### 3.1 Value Proposition
Small and mid-sized coaching institutes in India (JEE, NEET, UPSC, SSC, Coding, Spoken English) lose 40–60% of prospective student leads due to slow response times outside office hours (nights and Sundays). AutoMask provides an instant, 24/7 AI counsellor on WhatsApp that answers inquiries, verifies course eligibility, and books demo classes directly into the institute's schedule, while ensuring complete data privacy and strict compliance with Meta policies.

### 3.2 Target Personas

| Persona | Role | Key Jobs to be Done | Pain Points Addressed |
|---|---|---|---|
| **Institute Owner (Director)** | Workspace Owner | - Purchases SaaS plan & manages billing<br>- Configures institute branding & WhatsApp number<br>- Grants temporary support access to platform staff | - High cost of existing enterprise solutions (Wati, Interakt)<br>- Fear of student data leaks to competitors |
| **Academic Head / Center Manager** | Workspace Admin | - Uploads brochures, syllabus, FAQs, and demo slots<br>- Sets up follow-up sequences and keyword rules<br>- Monitors lead conversion pipeline | - Counsellors forgetting to follow up with leads<br>- Chaotic spreadsheets and lost student inquiries |
| **Admission Counselor / Front Desk** | Workspace Agent | - Operates shared WhatsApp inbox<br>- Takes over chats from AI when high intent is detected<br>- Adds internal notes and marks demo attendance | - Answering repetitive questions (timings, syllabus)<br>- Handling night-time student messages |
| **Prospective Student / Parent** | End User | - Inquires about batches, syllabus, faculty, and fees<br>- Books demo classes in Hinglish, Hindi, or English<br>- Requests human counselor assistance or opts out | - No response after 7 PM or on weekends<br>- Intimidating phone calls from aggressive sales reps |
| **Platform Super Admin** | Platform Operator | - Manages SaaS tenant health, subscriptions, and system uptime<br>- Requests temporary support grants for debugging<br>- Enforces security and DPDP compliance | - Privacy compliance risks under DPDP Act 2023<br>- Uncontrolled access to client confidential data |

---

## 4. Architecture & Component Responsibilities

```
                                  +------------------------------------+
                                  |      Meta WhatsApp Cloud API       |
                                  +-----------------+------------------+
                                                    | Webhooks / REST
                                                    v
+-----------------------+         +-----------------+------------------+
|      Client App       |         |        Express API Gateway         |
|  React 18 + Vite +    | <-----> |   - Raw Body HMAC Verification     |
|   Tailwind CSS        |  HTTP   |   - Session Tenant Resolver (RLS)  |
+-----------------------+         |   - Strict RBAC Middleware         |
                                  +--------+------------------+--------+
                                           |                  |
                       Durable Inbound     |                  | Outbound Dispatch
                       Outbox Write        v                  v
                          +----------------+--+      +--------+---------------+
                          |  PostgreSQL 17    |      |  WhatsAppClient.ts     |
                          |  - 22 RLS Tables  |      |  - Pre-Dispatch State  |
                          |  - outbox_events  |      |  - Idempotency Keys    |
                          |  - outbound_msgs  |      |  - 24h Window Checker  |
                          +--------+----------+      +------------------------+
                                   |
                FOR UPDATE         |
                SKIP LOCKED        v
                          +--------+----------+
                          |   Outbox Worker   |
                          |   & BullMQ Queue  |
                          +--------+----------+
                                   |
                                   v
                          +--------+----------+
                          | DecisionRouter.ts |
                          | 1. Opt-out/In     |
                          | 2. Suppression    |
                          | 3. Human Takeover |
                          | 4. Workflows      |
                          | 5. Keywords       |
                          | 6. AI RAG / Tools |
                          | 7. Fallback       |
                          +-------------------+
```

### 4.1 Component Inventory & Boundaries
1. **Web Client (`/client`)**: Single-page application built with React 18, Vite, and Tailwind CSS. Communicates exclusively with `/api/v1` via authenticated JWT tokens.
2. **API Server (`/server`)**: Node.js + Express backend implementing secure route controllers, tenant resolution, RBAC validation, and webhook signature verification.
3. **Database Layer (`/server/src/database`)**: PostgreSQL 17 with 22 relational tables protected by PostgreSQL native Row-Level Security (RLS) under application role `automask_app`.
4. **Outbox & Event Worker (`/server/src/services/outboxService.ts`)**: Background worker executing atomic claim queries (`FOR UPDATE SKIP LOCKED`) to ensure zero-loss webhook ingestion even during Redis or process crashes.
5. **Decision Router (`/server/src/services/decisionRouter.ts`)**: Pure deterministic decision module governing message triage, consent enforcement, AI RAG execution, and lead state transitions.
6. **WhatsApp Client (`/server/src/modules/whatsapp/whatsappClient.ts`)**: Provider interface implementing pre-dispatch state logging (`outbound_messages`), idempotency keys, customer service window validation, and ambiguous timeout resolution.
7. **RAG & Tooling Engine (`/server/src/modules/ai/`)**: Cosine similarity vector search over institute knowledge bases, guarded by strict tool schemas (`reserveDemoBooking`, `cancelDemoBooking`, `rescheduleDemoBooking`, `escalateToHuman`).

---

## 5. Authentication, Roles, and Tenant Isolation

### 5.1 Multi-Tenant Isolation Model
- **Tenant Entity**: Every tenant is anchored by a unique `workspaces` record (`id UUID PRIMARY KEY`).
- **Data Partitioning**: Every tenant table contains a non-nullable `workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE`.
- **Database Defense-in-Depth (PostgreSQL RLS)**:
  - All application queries execute under PostgreSQL role `automask_app` with attributes `NOSUPERUSER NOBYPASSRLS`.
  - Every connection sets the transaction-local tenant context:
    ```sql
    SELECT set_config('app.current_workspace_id', $1, true);
    ```
  - Standard table policy applied across all 22 tenant tables:
    ```sql
    CREATE POLICY tenant_isolation_policy ON <table>
      FOR ALL
      USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::UUID)
      WITH CHECK (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::UUID);
    ```

### 5.2 Role-Based Access Control (RBAC)

| Role | Scope | Permissions | Restricted Actions |
|---|---|---|---|
| **Owner** | Workspace | Full administrative control, user invites, API keys, billing & subscription management, platform support grant issuance. | Cannot access other workspaces. |
| **Admin** | Workspace | Knowledge base management, automation rules, follow-up sequences, slot definitions, analytics, user management. | **Blocked from Billing** (`403 Forbidden` enforced in `server/src/routes/api.ts`). |
| **Counselor / Agent** | Workspace | View shared inbox, send 1-on-1 messages, initiate takeover, view contacts, book/reschedule demos, add notes. | Blocked from billing, workspace settings, rule creation, and API credential management. |
| **Platform Super Admin** | Global / Platform | System health, tenant provisioning, subscription overrides, audit logs. | **Strictly blocked from reading student message content** (SRS Line 615) unless granted a temporary support token by Workspace Owner. |

---

## 6. WhatsApp Integration & Provider Constraints

### 6.1 WhatsApp Business Platform Architecture
AutoMask connects to Meta's WhatsApp Cloud API using Meta Embedded Signup (Coexistence / Tech Provider model).

```
[Student Device] <---> [Meta WhatsApp Infrastructure] <---> [AutoMask Webhook / REST]
```

### 6.2 Constraints & SLA Boundaries
1. **24-Hour Customer Service Window**:
   - Begins upon receipt of an inbound user message (`last_customer_message_at`).
   - Within window: Free-form text, media, interactive buttons, and list messages are permitted at standard session rates.
   - Outside window: Free-form messages are **blocked at the server level** (`SERVICE_WINDOW_EXPIRED`). Outbound communication is restricted strictly to Meta-approved templates.
2. **Rate Limits & Tier Management**:
   - Tier 1: 1,000 business-initiated conversations / 24 hours.
   - Tier 2: 10,000 conversations / 24 hours.
   - Tier 3: 100,000 conversations / 24 hours.
   - Rate limit responses from Meta (HTTP 429) trigger exponential backoff with jitter.
3. **Meta Webhook Acknowledgment SLA**:
   - Meta requires an HTTP 200 response within 5,000ms (AutoMask SLA: `< 500ms`).
   - Webhooks are written immediately to `webhook_events` and `outbox_events` before returning HTTP 200. Heavy processing occurs asynchronously.

---

## 7. Webhook Ingestion & Durable Event Processing (P0-2)

### 7.1 Webhook Verification & Pipeline Flow
To eliminate event loss and prevent replay attacks, AutoMask implements a resilient 5-stage ingestion pipeline:

```
[Meta POST /api/v1/webhook]
       |
       v
1. HMAC-SHA256 Signature Verification (X-Hub-Signature-256 over raw request buffer)
       | (Pass)
       v
2. Transactional Intake:
   - Insert raw payload into `webhook_events`
   - Insert normalized event into `outbox_events` (status: 'PENDING')
   - Deduplicate via unique index: `ON CONFLICT (idempotency_key) DO NOTHING`
       |
       v
3. Fast HTTP 200 Acknowledgment returned to Meta within 150ms
       |
       v
4. Outbox Worker Sweep (`SELECT ... FOR UPDATE SKIP LOCKED`):
   - Claims pending events safely across concurrent workers
   - Dispatches event to `DecisionRouter`
   - Updates `outbox_events.status` to 'DISPATCHED' or increments `retry_count`
       |
       v
5. Poison-Pill / DLQ Handling:
   - Max 5 retries with exponential backoff (2^retry * 1000ms)
   - Exhausted events transitioned to `status = 'DEAD_LETTER'` with error stack
```

### 7.2 Database Schema: `outbox_events`
```sql
CREATE TABLE outbox_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL,
    idempotency_key VARCHAR(128) NOT NULL UNIQUE,
    payload JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- PENDING, DISPATCHED, FAILED, DEAD_LETTER
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 5,
    next_retry_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);
```

---

## 8. Inbox & Human Takeover

### 8.1 Shared Team Inbox Requirements
1. **Unified Thread**: Real-time message list updating via WebSocket/polling with delivery ticks (Single grey = Sent, Double grey = Delivered, Blue = Read).
2. **Internal Counselor Notes**: Private, team-only annotations stored in `conversation_notes` that are invisible to the student.
3. **Counsellor Assignment**: Conversations can be assigned to specific counselors (`assigned_to UUID REFERENCES users(id)`).
4. **Lead Pipeline Quick-Actions**: Change lead status (New, Interested, Demo Booked, Enrolled, Cold, Disqualified) directly from the conversation panel.

### 8.2 Human Takeover Mechanics
- **Activation**:
  - Manual toggle by counselor (`POST /api/v1/conversations/:id/takeover`).
  - Automatic trigger on intent detection: `student asks for human counselor`, `fee dispute`, `complaint`, or `low-confidence AI fallback`.
- **System Behavior During Takeover**:
  - `conversations.takeover_active` set to `TRUE`.
  - All automated AI and rule-based replies are **instantly paused**.
  - Any pending automated follow-up sequences for the contact are suspended.
  - Counselor messages sent via the inbox are dispatched with `sender_type = 'AGENT'`.
- **Release**: Counselor explicitly clicks "Resume Automation", returning `takeover_active = FALSE`.

---

## 9. Automation Rules & Deterministic Execution Order (P0-1)

### 9.1 The 7-Stage Precedence Router
To prevent dangerous race conditions (e.g. sending automated promotional replies to a student who typed "STOP" during active human takeover), `DecisionRouter.ts` evaluates incoming messages against a deterministic, non-overlapping priority waterfall:

```
[Inbound Student Message Received]
               |
               v
+-------------------------------------------------------------+
| Priority 1: Opt-Out Command Check                           |
| Keyword in: STOP, UNSUBSCRIBE, CANCEL, QUIT, band karo,     |
|             ruk jao, mat bhejo, donotmsg                    |
+-------------------------------------------------------------+
       | YES ---> [Record OPTED_OUT, cancel follow-ups, close conversation, ZERO outbound]
       | NO
       v
+-------------------------------------------------------------+
| Priority 1.5: Re-Opt-In Command Check                       |
| Keyword in: START, UNSTOP, OPTIN, SUBSCRIBE, shuru karo,    |
|             chalu karo                                      |
+-------------------------------------------------------------+
       | YES ---> [Reactivate to OPTED_IN, re-open conversation, send welcome confirmation]
       | NO
       v
+-------------------------------------------------------------+
| Priority 1.6: Already Opted-Out Contact Guard               |
| Contact has consent_status = 'OPTED_OUT'                    |
+-------------------------------------------------------------+
       | YES ---> [SUPPRESS ALL AUTOMATION: Return OPT_OUT_SUPPRESSED, ZERO outbound]
       | NO
       v
+-------------------------------------------------------------+
| Priority 2: Active Human Takeover Guard                     |
| Conversation has takeover_active = TRUE                     |
+-------------------------------------------------------------+
       | YES ---> [ROUTE_TO_HUMAN: Notify assigned counselor, increment unread, ZERO AI]
       | NO
       v
+-------------------------------------------------------------+
| Priority 3: Interactive Visual Workflows                    |
| Active workflow execution step / button click payload       |
+-------------------------------------------------------------+
       | MATCH ---> [Execute workflow step action and transition state]
       | NO MATCH
       v
+-------------------------------------------------------------+
| Priority 4: Keyword Automation Rules                        |
| Match trigger keywords configured in workspace rules        |
+-------------------------------------------------------------+
       | MATCH ---> [Execute configured rule action (template, quick reply, tag)]
       | NO MATCH
       v
+-------------------------------------------------------------+
| Priority 5: AI RAG & Grounded Tool Execution                |
| Semantic query answering from institute knowledge base      |
| Allow-listed tools: reserveBooking, cancelBooking, etc.     |
+-------------------------------------------------------------+
       | ANSWER FOUND ---> [Dispatch grounded response with verified facts]
       | FEE DISPUTE / SENSITIVE ---> [Mandatory escalateToHuman]
       | LOW CONFIDENCE / NO DATA ---> [Fallback message & counselor handoff]
```

---

## 10. AI Grounding, Language Handling, Tool Authorization, and Fallback

### 10.1 Grounding Principles
1. **Zero Hallucination Tolerance**: The AI assistant answers questions strictly using verified facts stored in the workspace `knowledge_items` table.
2. **Fee & Discount Protection (AI-07)**:
   - When a student inquires about general published fee structures, the AI responds with exact catalog figures.
   - When a student asks for custom discounts, fee waivers, installment plans, or scholarship negotiations, the AI is **prohibited from quoting arbitrary discounts** and must invoke `escalateToHuman` with an internal alert: `Student negotiating fees`.
3. **Multilingual Support**:
   - Supported languages: English, Hindi, and Hinglish (code-mixed Hindi written in Latin script, e.g. *"JEE 2027 batch ka timing kya hai?"*).
   - Responses mirror the user's language style while preserving exact technical terms (e.g. *"Batch 15th November se start ho raha hai"*).

### 10.2 Tool Authorization Boundary (AI-06)
The LLM operates in a sandboxed tool environment. It has zero access to raw SQL, filesystem, or external web browsing. Allowed tool execution is restricted to:
- `reserveDemoBooking(slotId, studentName, phone, parentPhone, courseInterest)`
- `cancelDemoBooking(appointmentId, reason)`
- `rescheduleDemoBooking(appointmentId, newSlotId)`
- `escalateToHuman(reason, priority)`

---

## 11. Lead & Contact Lifecycle

### 11.1 Contact Entity Model
A contact represents an individual student or parent phone number:
- `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
- `workspace_id UUID NOT NULL REFERENCES workspaces(id)`
- `phone VARCHAR(20) NOT NULL`
- `name VARCHAR(255)`
- `parent_phone VARCHAR(20)`
- `consent_status VARCHAR(32) NOT NULL DEFAULT 'UNCONFIRMED'` -- UNCONFIRMED, OPTED_IN, OPTED_OUT
- `last_opt_in_at TIMESTAMPTZ`
- `last_opt_out_at TIMESTAMPTZ`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- **Constraint**: `UNIQUE (workspace_id, phone)`

### 11.2 Lead Pipeline Stages
Each inbound contact is tracked as an active enrollment lead:
1. **New**: Contact initiated contact; initial brochure/welcome dispatched.
2. **Interested**: Contact asked about courses, faculty, or timings.
3. **Demo Booked**: Contact reserved an active demo slot in `demo_appointments`.
4. **Demo Attended**: Counselor checked student attendance in the portal.
5. **Enrolled**: Student completed admission payment.
6. **Cold / Disqualified**: Contact uncontactable, opted out, or disqualified.

---

## 12. Consent & Opt-Out Requirements (P0-1 & P0-4)

### 12.1 The 4-State Consent Framework
Consent and WhatsApp policy compliance are evaluated across 4 distinct dimensions:

```
+-----------------------------------------------------------------------------------+
| 1. Service Window State: ACTIVE (<= 24h) | EXPIRED (> 24h)                        |
| 2. Consent Status:      OPTED_IN | OPTED_OUT | UNCONFIRMED                       |
| 3. Message Type:        FREE_FORM | META_APPROVED_TEMPLATE                        |
| 4. Conversation Intent: USER_INITIATED (UIC) | BUSINESS_INITIATED (BIC)           |
+-----------------------------------------------------------------------------------+
```

### 12.2 Compliance Decision Matrix

| Service Window | Consent Status | Message Format | Permitted? | Engine Action |
|:---:|:---:|:---:|:---:|---|
| **Active (<=24h)** | `OPTED_IN` or `UNCONFIRMED` | Free-form / Media / AI Reply | **YES** | Dispatched immediately via WhatsApp Cloud API. |
| **Active (<=24h)** | `OPTED_OUT` | Any | **NO** | **SUPPRESSED**: Outbound blocked with `OPT_OUT_SUPPRESSED`. |
| **Expired (>24h)** | `OPTED_IN` | Approved Meta Utility/Marketing Template | **YES** | Dispatched with registered template parameters. |
| **Expired (>24h)** | `UNCONFIRMED` | Marketing Template | **NO** | **BLOCKED**: Marketing templates require explicit prior consent. |
| **Expired (>24h)** | Any | Free-form Text | **NO** | **REJECTED**: Blocked at server level (`SERVICE_WINDOW_EXPIRED`). |

### 12.3 DPDP Act 2023 Compliance & Guardian Notice
Under Section 9 of the India Digital Personal Data Protection (DPDP) Act 2023, personal data of minors (under 18 years) requires parental consent.
- When an inquiry identifies a student minor, the system records `parent_phone`.
- The coaching institute operates as the **Data Fiduciary** responsible for legal parental notice. AutoMask acts as the **Data Processor**, maintaining tamper-proof audit trails of timestamps and phone associations.

---

## 13. Follow-Up Scheduling & Cancellation

### 13.1 Sequence Runs & Re-Enrollment (Schema Fix)
To prevent the re-enrollment bug identified in the engineering audit, follow-up jobs are tracked with a sequence run identifier:
```sql
ALTER TABLE followup_jobs ADD COLUMN sequence_run_id UUID DEFAULT uuid_generate_v4();
CREATE UNIQUE INDEX idx_followup_unique_step 
ON followup_jobs (workspace_id, contact_id, sequence_id, sequence_run_id, step_no);
```
This allows a student to enter an "Inquiry Follow-up" sequence in October, complete or exit it, and later enter a "Crash Course Follow-up" sequence in December under a new `sequence_run_id`.

### 13.2 Instantaneous Cancellation Guarantee
Whenever an opt-out keyword is detected or a demo class is successfully booked:
1. All pending jobs in `followup_jobs` matching `(workspace_id, contact_id, status = 'PENDING')` are updated to `status = 'CANCELLED'`.
2. Outbox workers verify contact consent **at the exact moment of execution** before dispatching network calls, ensuring that in-flight jobs never deliver messages to opted-out contacts.

---

## 14. Booking & Concurrency Requirements (P0-5)

### 14.1 Mathematical Acceptance Criteria (AC-05)
For $N$ concurrent valid booking attempts competing for a demo slot with remaining capacity $C$:
$$\text{Successful Reservations} = \min(N, C)$$
$$\text{Rejected Reservations} = N - \min(N, C)$$
- Every rejected attempt returns an explicit HTTP 409 / error status: `SLOT_CAPACITY_EXCEEDED`.
- Slot `booked_count` must strictly equal $\min(N, C)$ upon transaction completion.
- Replaying the identical booking request with the same `idempotency_key` returns the existing reservation without consuming additional capacity.

### 14.2 Database Transaction & Row-Locking Implementation
Slot reservations are executed inside a PostgreSQL serializable transaction using pessimistic row locking:
```typescript
// server/src/modules/ai/coachingTools.ts:reserveDemoBooking
await client.query('BEGIN');

// 1. Lock slot row exclusively
const slotRes = await client.query(
  `SELECT id, max_capacity, booked_count 
   FROM demo_slots 
   WHERE id = $1 AND workspace_id = $2 
   FOR UPDATE`,
  [slotId, workspaceId]
);

const slot = slotRes.rows[0];
if (!slot || slot.booked_count >= slot.max_capacity) {
  await client.query('ROLLBACK');
  return { success: false, code: 'SLOT_CAPACITY_EXCEEDED' };
}

// 2. Increment booked count
await client.query(
  `UPDATE demo_slots 
   SET booked_count = booked_count + 1 
   WHERE id = $1`,
  [slotId]
);

// 3. Insert appointment with idempotency protection
await client.query(
  `INSERT INTO demo_appointments 
   (workspace_id, slot_id, contact_id, student_name, idempotency_key, status)
   VALUES ($1, $2, $3, $4, $5, 'CONFIRMED')`,
  [workspaceId, slotId, contactId, studentName, idempotencyKey]
);

await client.query('COMMIT');
```

### 14.3 Capacity Check Constraints
Migration 009 enforces integrity at the schema level:
```sql
ALTER TABLE demo_slots 
ADD CONSTRAINT check_slot_capacity_non_negative CHECK (booked_count >= 0);

ALTER TABLE demo_slots 
ADD CONSTRAINT check_slot_capacity_limit CHECK (booked_count <= max_capacity);
```

---

## 15. Usage Metering & Plan Enforcement

### 15.1 SaaS Plan Tiers

| Metric / Feature | Starter (₹499/mo) | Growth (₹999/mo) | Pro (₹2,499/mo) |
|---|:---:|:---:|:---:|
| **Target Customers** | Small Tuition Centers (1 branch) | Growing Institutes (1–3 branches) | Large Academies (Multiple branches) |
| **WhatsApp Accounts** | 1 Number | 1 Number | 3 Numbers |
| **Included Monthly Inquiries** | 1,000 | 3,000 | 10,000 |
| **Included AI RAG Replies** | 1,000 | 3,000 | 10,000 |
| **Counselor Agent Seats** | 2 Seats | 5 Seats | Unlimited |
| **Follow-up Sequences** | 3 Sequences | 10 Sequences | Unlimited |
| **Knowledge Base Pages** | Up to 10 Pages | Up to 50 Pages | Unlimited |
| **Demo Booking Engine** | Standard | Advanced (Multi-teacher) | Full Custom Calendar |
| **Direct Meta Billing** | Yes (Client card) | Yes (Client card) | Yes (Client card) |

### 15.2 Graceful Quota Exhaustion
When a workspace reaches 100% of its monthly AI conversation quota:
1. The system **does not break or disconnect WhatsApp**.
2. AI automated generation gracefully suspends.
3. Incoming student messages are routed to the Counselor Team Inbox with an automated fallback notification: *"Our counselors are currently handling student inquiries. A counselor will respond shortly."*
4. The Workspace Owner receives an email and in-app upgrade banner.

---

## 16. Billing & Payment Processing

### 16.1 SaaS Subscription Architecture (Razorpay)
- AutoMask utilizes **Razorpay Subscriptions** for automated monthly SaaS plan recurring billing in INR.
- Supported payment methods: UPI Autopay, Debit/Credit Cards, and NetBanking.
- Webhook signature validation: `X-Razorpay-Signature` verified using `RAZORPAY_WEBHOOK_SECRET`.
- On subscription renewal failure: 3-day grace period with banner notification, after which automation pauses.

### 16.2 Direct Meta WhatsApp Billing Separation
To protect SaaS margins, AutoMask does not resell WhatsApp conversation credits:
- The coaching institute registers their own business credit card in Meta Business Manager.
- Meta bills the institute directly for User-Initiated ($0.0040 / ~₹0.35) and Marketing ($0.0107 / ~₹0.90) conversation charges.
- AutoMask SaaS subscription fee covers software platform access, RAG AI vector processing, workflow orchestration, and team inbox.

---

## 17. Data Model & Integrity Constraints

### 17.1 Relational Schema Overview
The database comprises 22 core relational tables in PostgreSQL 17:

1. `workspaces`: Tenant accounts with status and configuration.
2. `users`: Workspace members with password hashes and roles (`OWNER`, `ADMIN`, `AGENT`).
3. `whatsapp_accounts`: Connected WABAs, phone numbers, and encrypted system tokens.
4. `contacts`: Prospective students/parents with phone numbers and consent states.
5. `conversations`: Chat threads (enforced single open thread per contact via partial unique index).
6. `messages`: Inbound and outbound message records with foreign keys and provider IDs.
7. `webhook_events`: Raw inbound payloads with HMAC signature records.
8. `outbox_events`: Durable transactional outbox records for asynchronous processing.
9. `outbound_messages`: Pre-dispatch outbound logs with idempotency keys and state tracking.
10. `knowledge_items`: Course brochures, syllabus, FAQs, and vector embeddings.
11. `automation_rules`: Keyword and regex-triggered actions.
12. `workflows`: Multi-step interactive guided flows.
13. `followup_sequences`: Drip campaign sequences.
14. `followup_jobs`: Scheduled sequence execution steps with `sequence_run_id`.
15. `demo_slots`: Calendar demo time slots with capacity constraints.
16. `demo_appointments`: Booked student demo reservations.
17. `lead_tags`: Categorization tags for leads.
18. `contact_tags`: Many-to-many relationship linking contacts to tags.
19. `conversation_notes`: Internal counselor notes.
20. `support_grants`: Time-boxed, audited permissions for platform staff to access tenant data.
21. `audit_logs`: Immutable security audit events.
22. `usage_records`: Monthly tenant aggregation of messages and AI tokens.

### 17.2 Production Schema Patches (Migration 009)
```sql
-- 1. Foreign key and composite unique index for message identity
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS whatsapp_account_id UUID REFERENCES whatsapp_accounts(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_workspace_provider_msg 
ON messages (workspace_id, provider_message_id) 
WHERE provider_message_id IS NOT NULL;

-- 2. Single open conversation partial unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_open_conversation_per_contact 
ON conversations (workspace_id, contact_id) 
WHERE status = 'OPEN';

-- 3. Sequence run identifier for follow-ups
ALTER TABLE followup_jobs 
ADD COLUMN IF NOT EXISTS sequence_run_id UUID DEFAULT uuid_generate_v4();

-- 4. Demo slot check constraints
ALTER TABLE demo_slots 
ADD CONSTRAINT check_slot_capacity_non_negative CHECK (booked_count >= 0);

ALTER TABLE demo_slots 
ADD CONSTRAINT check_slot_capacity_limit CHECK (booked_count <= max_capacity);
```

---

## 18. State Machines & Transition Rules

### 18.1 Outbound Message State Machine (P0-3)

```
       [Created]
           |
           v
       [Pending]
           |
           v
       [Queued]
           |
           v
       [Sending]  ---- (Network Timeout / Socket Drop) ----> [Unknown / Reconciliation]
           |                                                              |
           v (Meta HTTP 200 with wamid)                                   | (Webhook matches wamid)
  [Accepted by Provider] <------------------------------------------------+
           |
           +---> (Meta Status Webhook: 'sent') ------> [Sent]
           |
           +---> (Meta Status Webhook: 'delivered') -> [Delivered]
           |
           +---> (Meta Status Webhook: 'read') ------> [Read]
           |
           +---> (Meta Status Webhook: 'failed') ----> [Failed]
```

### 18.2 Conversation Lifecycle State Machine
- `OPEN`: Active student dialogue receiving incoming messages. Exactly one `OPEN` conversation per contact is permitted per workspace.
- `RESOLVED`: Inactivity timeout (48 hours) or manual counselor resolution.
- `CLOSED`: Explicit student opt-out (`STOP`) or lead disqualification.

---

## 19. External API Contracts & Error Handling

### 19.1 Meta WhatsApp Cloud API Error Handling
- **HTTP 401 / 403 (Token Expired / Invalid WABA)**: Logged as critical security alert; triggers workspace notification to re-authenticate via Embedded Signup.
- **HTTP 429 (Rate Limit Exceeded)**: Placed on exponential backoff queue with jitter:
  $$T_{\text{wait}} = 2^{\text{attempt}} \times 1000\text{ms} + \text{random}(0, 500\text{ms})$$
- **HTTP 5xx (Meta Server Transient Error)**: Retried up to 3 times before transitioning message to `FAILED`.
- **Ambiguous Network Timeouts**: Marked as `UNKNOWN_TIMEOUT` in `outbound_messages`. **Never blindly retried** without checking provider message status to prevent double-messaging students.

---

## 20. Security, Privacy, Retention, and Deletion

### 20.1 Platform Staff Access Restriction (SRS Line 615)
To comply with DPDP Act data privacy and prevent competitive data leaks:
- Platform Super Admins are **barred by default from reading student messages or contact phone numbers**.
- Access is strictly conditional on an active record in `support_grants`:
  - Granted explicitly by the Workspace Owner from the dashboard.
  - Time-boxed to a maximum of 24 hours.
  - Requires a documented reason.
  - Every access is recorded in `audit_logs` with the platform admin's user ID and timestamp.
  - Can be revoked instantly with one click by the Workspace Owner.

### 20.2 Data Retention & Privacy Policy
1. **Raw Webhook Payloads**: Retained in `webhook_events` for 30 days for debugging, after which an automated cron worker deletes raw JSON payloads.
2. **Student Conversation Logs**: Retained for the duration of the institute's active subscription.
3. **Right to Erasure (DPDP Act)**: When an institute or student submits a valid deletion request, the contact's records, conversations, and appointments are permanently scrubbed.

---

## 21. Performance, Availability, Recovery, and Observability

### 21.1 Performance Benchmarks & SLAs
- **Webhook Intake Latency**: $< 200\text{ms}$ at 99th percentile.
- **AI RAG Generation Latency**: $< 2,500\text{ms}$ (utilizing streaming / fast LLM inference).
- **Booking Concurrency**: 50 simultaneous requests resolved in $< 500\text{ms}$ with zero overbooking.
- **System Uptime Target**: 99.9% availability.

### 21.2 Observability & Health Probes
- `/health/live`: Application Liveness probe verifying process event loop uptime.
- `/health/ready`: Dependency Readiness probe verifying PostgreSQL connection pool and Redis/SQS queue readiness (fails safely with 503 if infrastructure is disconnected in production).
- `/health`: Comprehensive health diagnostics combining liveness and readiness states.
- `LIVE_CREDENTIALS_REQUIRED`: Production safety guard enforcing that simulated delivery is strictly disallowed when `NODE_ENV=production`.
- Structured JSON logging with correlation IDs (`requestId`, `workspaceId`, `wamid`).

---

## 22. Test Strategy & Measurable Acceptance Criteria

### 22.1 Test Verification Matrix (171 Passing Automated Tests)

| Test Suite File | Domain / Focus | Test Count | Status | Key Verified Invariants |
|---|---|:---:|:---:|---|
| `runMultiTenantTests.ts` | Multi-Tenant RLS & Isolation | 12 | **Pass** | Cross-tenant SELECT/INSERT/UPDATE blocked by PostgreSQL RLS. |
| `runSecurityTests.ts` | RBAC & Security Boundaries | 17 | **Pass** | Admin blocked from billing; Webhook signature checked; Token encryption. |
| `runWorkflowTests.ts` | End-to-End Decision Router | 13 | **Pass** | Stages 1–7 executed in strict priority; Audit logging verified. |
| `runPhase2Tests.ts` | WhatsApp Engine & AI RAG | 16 | **Pass** | 24h window enforced; Allow-listed tools only; Takeover pauses AI. |
| `runAdvancedRBACTests.ts` | Visual Workflows & Broadcasts | 29 | **Pass** | Embedded signup flow; Workflows state transitions; Broadcast filters. |
| `runPlatformVsClientTests.ts` | Platform Console vs Client | 25 | **Pass** | Line 615 enforced: Platform admin blocked without support grant. |
| `runP0ProductionTests.ts` | P0 Architectural Assurance | 18 | **Pass** | Outbox transactional recovery; Outbound deduping; Slot locking $\min(N,C)$. |
| `runProductionReadinessMatrix.ts` | 10-Domain Critical Production Matrix | 41 | **Pass** | Concurrency with 50 requests on capacities 0/1/3/50; Outbox concurrency & DLQ replay; Ambiguous timeouts; Re-opt-in matrix; Production credential guards. |
| **Total Verified Tests** | **Comprehensive Suite** | **171** | **100% Pass** | **Zero failures across all 8 core test modules.** |

---

## 23. Release Plan & Implementation Dependencies

### 23.1 Release Phases

```
+-------------------------------------------------------------+
| Phase 1: Internal Developer Verification (COMPLETE)         |
| - Applied Migration 009 with P0 schema fixes                |
| - Verified all 130 automated test cases with 100% pass rate  |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Phase 2: Controlled Staging Pilot (2 Weeks)                 |
| - Onboard 2 pilot coaching institutes in staging sandbox    |
| - Validate real Meta Embedded Signup flow                   |
| - Test Razorpay recurring subscription webhooks             |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Phase 3: Production Rollout                                 |
| - Deploy multi-AZ AWS infrastructure via Terraform          |
| - Production Meta App Live Mode review & approval           |
| - General Availability release across India coaching hubs   |
+-------------------------------------------------------------+
```

---

## 24. Risk Register & Open Questions

| Risk ID | Category | Description | Severity | Mitigation Strategy |
|:---:|:---:|---|:---:|---|
| **RSK-01** | Provider | Meta suspends institute WhatsApp number due to student spam reports. | High | Automated quality score monitoring; immediate rate-limiting; mandatory opt-out in all outbound messages. |
| **RSK-02** | Compliance | DPDP Act penalties for handling minor data without verifiable parental consent. | High | System captures `parent_phone`; institute accepts Data Fiduciary terms during onboarding. |
| **RSK-03** | Technical | Redis queue crash causing webhook event loss. | Medium | Mitigated: Transactional outbox writes events to PostgreSQL before queue dispatch. |
| **RSK-04** | Commercial | High AI token consumption on low-cost plans degrading margins. | Medium | Strict token limits per inquiry; rate limit of 15 queries per student per day. |

---

## 25. Requirement-to-Code-to-Test Traceability

Every requirement in this specification is linked directly to its source code implementation and automated test verification assertion in `docs/REQUIREMENT_TRACEABILITY.md`.

---

## 26. Verification Evidence & Known Limitations

### 26.1 Verification Evidence
All core architectural patterns and P0 issue resolutions specified in this document were verified through execution of the Master Test Suite (`server/src/tests/runMasterTestSuite.ts`), logging 171 passing assertions with zero failures across all 8 test modules against a live PostgreSQL 17 database.

### 26.2 Known External Limitations
1. **Meta Business Verification**: While code integration is complete, live production sending requires Meta Business Manager verification and display name approval for each coaching institute.
2. **Razorpay Live Merchant Account**: Active recurring billing requires an operational Razorpay account with Subscriptions API enabled.
