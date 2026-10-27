# AutoMask Software Requirements Specification (SRS) Addendum
## Architecture Update: Two Distinct Management Layers — Platform Management Console & Client Business Workspace

- **Document Version:** 2.0 (Post-MVP Security & Enterprise Architecture)
- **Status:** Approved / Enforced
- **Effective Date:** October 2026
- **Target System:** AutoMask WhatsApp Automation SaaS for Coaching Institutes

---

## 1. Executive Summary & System Partitioning

AutoMask is an enterprise-grade multi-tenant WhatsApp Business Automation platform built on top of the official Meta WhatsApp Cloud API. To ensure enterprise compliance, cross-tenant isolation, customer message privacy, and operational resilience, the platform enforces **two completely distinct management layers**:

```
+---------------------------------------------------------------------------------------------------+
|                                      AUTOMASK CLOUD PLATFORM                                      |
+---------------------------------------------------------------------------------------------------+
                                                  |
           +--------------------------------------+--------------------------------------+
           |                                                                             |
           v                                                                             v
+----------------------------------------------------+  +----------------------------------------------------+
|       LAYER 1: PLATFORM MANAGEMENT CONSOLE         |  |        LAYER 2: CLIENT BUSINESS WORKSPACES         |
|      (AutoMask Internal SaaS Operations)           |  |      (Subscribing Institute Tenant Spaces)         |
+----------------------------------------------------+  +----------------------------------------------------+
| Domain: platform:*                                 |  | Domain: workspace:*                                |
| Users: AutoMask Internal Staff                     |  | Users: Institute Owner, Admins, Counsellors        |
| Scope: Global Multi-Tenant Infrastructure          |  | Scope: Strictly Isolated to Single Tenant (RLS)    |
|                                                    |  |                                                    |
| Capabilities:                                      |  | Capabilities:                                      |
| • Client/Tenant Lifecycle & Account Management     |  | • Isolated Shared Team Inbox & Chat Routing        |
| • Subscription Plans, Limits & Pricing Tier Admin  |  | • Student / Parent CRM & Lead Pipeline             |
| • Health, Webhooks, BullMQ Queue & Meta Latency    |  | • Keyword Automations & Visual Workflow Builder    |
| • Support Tickets & Controlled Tenant Suspension   |  | • Approved Meta Templates & Scheduled Broadcasts   |
| • Internal Staff RBAC (Super Admin, Support, Bill) |  | • Grounded RAG Knowledge Base & AI Assistant       |
| • Global Security Audit Logs                       |  | • WhatsApp Number Integration & Analytics          |
|                                                    |  | • Custom Roles, Granular Overrides, Resource Scopes|
| 🔒 SRS Line 615 Privacy Safeguard:                 |  |                                                    |
| Customer Message Content is BLOCKED by default.    |  | 🛡️ Tenant Security Boundaries:                     |
| Read access requires an explicit, Owner-approved,  |  | Client Admins cannot access other tenants, modify  |
| time-boxed support grant with audit logging.       |  | platform plans, or self-escalate privileges.       |
+----------------------------------------------------+  +----------------------------------------------------+
```

---

## 2. Layer 1: Platform Management Console (Internal SaaS Operations)

### 2.1 Scope & Operational Purpose
The Platform Management Console is accessible **exclusively** to authorized AutoMask operations personnel. It provides the tooling necessary to provision, monitor, bill, and support client workspaces while strictly preventing unauthorized access to customer proprietary conversations.

### 2.2 Platform Staff Roles
| Role Identifier | Role Name | Purpose & Authority |
|---|---|---|
| `platform_admin` | Platform Super Administrator | Full control over platform settings, global subscription plans, tenant status (suspension/reactivation), platform staff management, and system-wide security logs. |
| `platform_support` | Support & Reliability Operations | Monitors platform health, inspects webhook delivery failures, tracks BullMQ queue depths, and handles tenant support tickets. Cannot modify subscription pricing plans. |
| `platform_billing` | Billing & Revenue Operations | Manages subscription plan tiers, sets messaging and AI quota pricing, reviews platform invoices, and handles enterprise quota limits. Cannot suspend tenants or request customer support grants. |

### 2.3 Platform Permission Registry (`platform:*`)
| Permission Key | Description | `platform_admin` | `platform_support` | `platform_billing` |
|---|---|:---:|:---:|:---:|
| `platform:tenants:read` | List all client workspaces, metadata, plan, and usage stats | ✅ | ✅ | ✅ |
| `platform:tenants:suspend` | Suspend delinquent or violating client workspaces with audited reason | ✅ | ❌ | ❌ |
| `platform:tenants:activate` | Reactivate suspended client workspaces | ✅ | ❌ | ❌ |
| `platform:plans:manage` | Create, modify, and price platform subscription tiers and quotas | ✅ | ❌ | ✅ |
| `platform:health:view` | Inspect real-time webhook health, BullMQ queue status, and Meta API latency | ✅ | ✅ | ❌ |
| `platform:queues:manage` | Retry failed webhook jobs or flush dead-letter queues | ✅ | ✅ | ❌ |
| `platform:tickets:manage` | View and resolve cross-tenant support tickets | ✅ | ✅ | ❌ |
| `platform:support:grant_request` | Request time-boxed support grants from tenant Owners | ✅ | ✅ | ❌ |
| `platform:audit:view` | Inspect global platform security and administrative audit logs | ✅ | ❌ | ❌ |

### 2.4 SRS Line 615 Customer Message Privacy Safeguard
1. **Disabled by Default:** Platform staff (including Super Admins) are strictly forbidden from viewing raw customer message bodies, media attachments, or conversation text by default. Any attempt to query message content returns `403 Forbidden` (`PrivacySafeguardViolation`).
2. **Logged Time-Boxed Support Grants:** Message content access can ONLY be unblocked if:
   - The Workspace Owner explicitly creates a `support_grant` record in the database specifying the `targetUserId`, `reason`, and `durationMinutes` (e.g. 120 minutes).
   - The grant is active, has not passed `expires_at`, and has not been revoked.
3. **Audit Trail:** Every single message viewed under an active support grant produces an immutable entry in the tenant's audit log:
   `actor=ops@automask.io, action=SUPPORT_GRANT_ACCESSED, target=conversation:<id>, grant_id=<grant_id>`.
4. **Immediate Revocation:** The tenant Owner can revoke the support grant at any second. Revocation immediately terminates access on the subsequent API request.

### 2.5 Platform Management API Specifications (`/api/v1/platform/*`)
All endpoints require a verified JWT bearing an internal platform role (`platform_admin`, `platform_support`, `platform_billing`). Requests with client workspace roles (`owner`, `admin`, `agent`) are denied with `403 Forbidden` (`PLATFORM_ACCESS_DENIED`).

- `GET /api/v1/platform/tenants`: Returns list of all registered business accounts, plan tier, status (`ACTIVE`, `SUSPENDED`, `PROVISIONING`), message usage, and member count.
- `PATCH /api/v1/platform/tenants/:id/status`: Updates tenant status (e.g. `SUSPENDED`, `ACTIVE`) with mandatory audit reason.
- `GET /api/v1/platform/plans`: Returns subscription plan configurations, monthly limits, and pricing.
- `PUT /api/v1/platform/plans/:id`: Updates plan quotas (messaging limits, AI reply caps, template limits, seat limits).
- `GET /api/v1/platform/health`: Returns platform telemetry (webhook queue worker status, Redis queue depth, Meta Cloud API latency, error rates).
- `GET /api/v1/platform/support-grants`: Returns all active and historical support access grants across tenants.
- `GET /api/v1/platform/tickets`: Returns operational support tickets submitted by workspace owners.
- `PATCH /api/v1/platform/tickets/:id`: Updates support ticket status and resolution notes.
- `GET /api/v1/platform/audit-logs`: Returns platform-wide administrative audit trail.

---

## 3. Layer 2: Client Business Workspace (Subscribing Tenant Operations)

### 3.1 Scope & Operational Purpose
Each subscribing coaching institute or educational consultancy operates within an isolated, self-contained business workspace. All workspace state (conversations, leads, workflows, knowledge documents) is partitioned and protected by PostgreSQL Row-Level Security (RLS).

### 3.2 Client Workspace Roles
| Role Identifier | Role Name | Purpose & Authority |
|---|---|---|
| `owner` | Workspace Owner (e.g. Dr. Prakash) | Complete sovereignty over the workspace. Only role authorized to manage subscription billing, purchase upgrades, issue time-boxed support grants, create custom roles, and configure employee permission overrides. |
| `admin` | Workspace Admin (e.g. Sumit) | Manages everyday operations: visual workflows, automation rules, WhatsApp templates, broadcast campaigns, staff roster, AI knowledge documents, and CRM leads. **Cannot access other workspaces, modify platform subscription plans, or manage institute billing.** |
| `manager` | Operations Manager | Oversees student conversations, assigns leads to counsellors, reviews broadcast performance, and configures trial demo slots. |
| `agent` | Counsellor / Worker (e.g. Priya) | Front-line staff responding to student WhatsApp inquiries, updating lead qualification statuses, and booking trial masterclass appointments. |
| `custom` | Tailored Institute Role | Defined dynamically by the Workspace Owner with arbitrary granular permissions (e.g. "Weekend Telecaller", "Content Manager"). |

### 3.3 Client Workspace Permission Registry (`workspace:*`)
| Module | Permission Key | Description | High Privilege |
|---|---|---|:---:|
| **Messages** | `messages.view` | View assigned or all conversations | No |
| | `messages.send` | Send outbound text replies | No |
| | `messages.assign` | Assign conversations to counsellors | No |
| | `messages.export` | Export chat transcripts to CSV | Yes |
| **Contacts** | `contacts.view` | View student and parent contact directory | No |
| | `contacts.create` | Create individual contact | No |
| | `contacts.import` | Bulk import contact directory via CSV | No |
| | `contacts.export` | Export student contact directory to CSV | Yes |
| **Workflows** | `workflows.view` | View visual workflow graphs | No |
| | `workflows.create` | Create draft visual workflow canvas | No |
| | `workflows.publish` | Validate and publish workflow to live WhatsApp queue | Yes |
| **Broadcasts** | `broadcasts.view` | View broadcast campaigns and analytics | No |
| | `broadcasts.create` | Draft broadcast campaign | No |
| | `broadcasts.send` | Dispatch bulk message queue | Yes |
| **AI & RAG** | `knowledge_base.view` | View course brochures, fees, and FAQs | No |
| | `knowledge_base.upload` | Upload PDF/DOCX/TXT/CSV knowledge documents | No |
| | `ai_assistant.configure` | Configure AI persona, prompt, and confidence gates | Yes |
| **Team & Roles**| `team.view` | View employee roster and online status | No |
| | `team.invite` | Send employee invitations | No |
| | `roles.manage` | Create custom roles and permission overrides (Owner only) | Yes |
| **Billing** | `billing.view` | View institute invoices and plan usage (Owner only) | Yes |
| | `billing.manage` | Upgrade subscription tier or add quota (Owner only) | Yes |
| **Support Grants**| `support_grants.manage`| Issue or revoke time-boxed support grants (Owner only) | Yes |

### 3.4 Strict Client Admin Privilege Restrictions
To prevent privilege escalation and unauthorized financial impact, the following hard boundaries are enforced on Client Admins:
1. **No Cross-Tenant Access:** A Client Admin of "Prakash Institute Kota" can NEVER query, inspect, or modify records belonging to "Apex NEET Academy Jaipur". This is enforced cryptographically (JWT token workspace binding) and at the database layer (PostgreSQL RLS).
2. **No Platform Configuration:** Client Admins cannot alter platform health, platform subscription tier definitions, or platform-wide routing rules.
3. **No Subscription Plan Alteration:** Client Admins cannot modify plan pricing, upgrade/downgrade subscription tiers, or alter quota caps. Attempting to hit `/billing/upgrade` returns `403 Forbidden` (`Action denied: Role 'admin' is not authorized to manage billing`).
4. **No Ownership Transfer or Self-Privilege Escalation:** Client Admins cannot assign themselves the `owner` role, remove Owner-imposed explicit denies, or bypass resource access scopes.

---

## 4. Security Boundaries & Zero-Trust Enforcement Architecture

### 4.1 Canonical Resolution via Cryptographic JWTs
- The server NEVER trusts client-supplied tenant identifiers (e.g. `x-workspace-id`, `x-user-role`) in production.
- All requests must supply a valid `Bearer` JWT or HttpOnly session cookie signed with the server's private secret.
- The authentication middleware decodes the token, queries the active `workspace_members` table, and securely binds `req.workspaceId` and `req.user.role`.

### 4.2 Database Isolation via PostgreSQL Row-Level Security (RLS)
- Every relational query executes within an active session having `app.current_workspace_id` configured to the authenticated user's workspace ID.
- Policies on tables (`conversations`, `messages`, `contacts`, `workflow_definitions`, `broadcast_campaigns`, `knowledge_items`, `roles`) enforce:
  `USING (workspace_id = current_setting('app.current_workspace_id', true)::uuid)`
- Even if an attacker manipulates API parameters or SQL queries, the PostgreSQL engine physically restricts returned rows to the authenticated workspace.

### 4.3 Immediate Session & Access Revocation for Suspended Tenants
- When a Platform Admin sets a tenant's status to `SUSPENDED` on `/api/v1/platform/tenants/:id/status`:
  1. The workspace status is updated in the database and audit log.
  2. The authentication and RBAC middleware immediately checks the workspace status for all subsequent requests.
  3. Any incoming request from any member of that tenant (Owner, Admin, or Agent) is immediately blocked with `403 Forbidden` (`TENANT_SUSPENDED: This business workspace has been suspended by AutoMask platform operations.`).

---

## 5. Automated Acceptance Criteria & Test Verification

| ID | Test Scenario | Expected Outcome | Verification Status |
|---|---|---|:---:|
| **AC-01** | Platform Admin lists all client tenants on `/api/v1/platform/tenants` | Returns 200 with tenant directory and quota statistics | Verified |
| **AC-02** | Client Workspace Owner attempts to access `/api/v1/platform/tenants` | Returns 403 Forbidden (`PLATFORM_ACCESS_DENIED`) | Verified |
| **AC-03** | Client Workspace Admin attempts to access `/api/v1/platform/plans` | Returns 403 Forbidden (`PLATFORM_ACCESS_DENIED`) | Verified |
| **AC-04** | Client Workspace Admin attempts to modify workspace billing tier | Returns 403 Forbidden (`manage:billing` required; Owner only) | Verified |
| **AC-05** | Client Workspace Admin attempts to query another tenant's contacts or messages | Returns empty set / 403 (enforced by PostgreSQL RLS) | Verified |
| **AC-06** | Platform Admin attempts to read customer message body without support grant | Returns 403 Forbidden (`SRS_LINE_615_SUPPORT_GRANT_REQUIRED`) | Verified |
| **AC-07** | Platform Admin queries message body with active, unexpired Owner support grant | Returns 200 with message content and writes audit log entry | Verified |
| **AC-08** | Workspace Owner revokes active support grant | Platform Admin's next message query returns 403 Forbidden immediately | Verified |
| **AC-09** | Platform Admin suspends tenant workspace with audited reason | Returns 200; Workspace status transitions to `SUSPENDED` | Verified |
| **AC-10** | Suspended tenant member makes an API request | Returns 403 Forbidden (`TENANT_SUSPENDED`) | Verified |
| **AC-11** | Platform Support Ops attempts to edit platform plan pricing | Returns 403 Forbidden (`platform:plans:manage` required; Admin/Billing only) | Verified |
| **AC-12** | Platform Billing Ops attempts to suspend a tenant workspace | Returns 403 Forbidden (`platform:tenants:suspend` required; Admin only) | Verified |
