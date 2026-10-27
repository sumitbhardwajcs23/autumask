# AutoMask Platform Architecture Migration & Gap Analysis Report
## Implementation of Two Distinct Management Layers: Platform Management Console & Client Business Workspace

- **Date:** October 2026
- **System Version:** AutoMask Enterprise SaaS v2.0
- **Status:** Complete, Migrated, Verified (112/112 Automated Tests Passing)

---

## 1. Gap Analysis: Pre-Migration vs Post-Migration Architecture

| Dimension | Pre-Migration Architecture | Post-Migration Architecture | Resolution Status |
|---|---|---|:---:|
| **Management Layering** | Single mixed navigation layer with client workspace UI attempting to serve both platform administrators and coaching institutes. | Two completely separated management layers: **Platform Management Console** (AutoMask internal operations) and **Client Business Workspace** (tenant coaching business operations). | Resolved |
| **Platform Staff RBAC** | Single generic `platform_admin` role with no sub-role segregation or operational scoping. | Three segregated platform staff roles: `platform_admin` (Platform Super Admin), `platform_support` (Support & Reliability Ops), and `platform_billing` (Billing & Plan Revenue Ops). | Resolved |
| **Platform Endpoints** | High-privilege platform actions shared endpoints under `/api/v1` without dedicated router segregation. | Isolated platform router mounted at `/api/v1/platform/*`, guarded by `requirePlatformRole` and `requirePlatformPermission`. Client users receive `403 PLATFORM_ACCESS_DENIED`. | Resolved |
| **Tenant Lifecycle Control** | Workspace status could not be systematically suspended with mandatory compliance justification. | Added `PATCH /api/v1/platform/tenants/:id/status` requiring mandatory audit reason. Suspended workspaces immediately block all member API operations with `403 TENANT_SUSPENDED`. | Resolved |
| **Customer Message Privacy (SRS §615)** | Basic middleware check in place, but lacked full multi-tenant grant inspection, expiration countdown, and owner request workflows. | Comprehensive SRS §615 enforcement: platform staff are blocked from message text by default. Active Owner-approved, time-boxed support grants unlock content with automatic audit logging. | Resolved |
| **Platform Telemetry & Queues** | Minimal root `/health` endpoint with basic status strings. | Structured `GET /api/v1/platform/health` telemetry returning BullMQ queue depths, dead-letter counts, worker failure rates, Meta Cloud API latency, and PostgreSQL connection pool stats. | Resolved |
| **Platform-Level Billing Admin** | No dedicated interface or endpoints for AutoMask staff to adjust subscription tier quotas or pricing. | `GET /api/v1/platform/plans` and `PUT /api/v1/platform/plans/:id` allowing Super Admins and Billing Ops to modify global limits, seat quotas, and pricing. Client Admins receive 403 on billing. | Resolved |
| **Global Platform Audit Logging** | Audit logs were solely scoped per tenant workspace. | Added `platform_audit_logs` table and `GET /api/v1/platform/audit-logs` recording all cross-tenant suspensions, plan modifications, and support grants. | Resolved |

---

## 2. Database Schema & Migration 008 Documentation

### 2.1 Forward Migration (`008_platform_management_layers.sql`)
1. **Workspaces Table Extension:**
   - Added `suspension_reason TEXT`
   - Added `suspended_at TIMESTAMPTZ`
   - Added `suspended_by UUID REFERENCES users(id)`
2. **Platform Support Tickets Table (`platform_support_tickets`):**
   - Stores tenant inquiries, category (`TECHNICAL`, `BILLING`, `WHATSAPP_API`, `QUOTA`, `SUSPENSION_APPEAL`), priority, status, and staff resolution notes.
   - Protected by Row-Level Security: tenant members can only query tickets for their own `workspace_id`, while platform staff can query all tickets.
3. **Platform Audit Logs Table (`platform_audit_logs`):**
   - Immutable security log for internal platform operations (`TENANT_SUSPENDED`, `TENANT_ACTIVATED`, `PLAN_MODIFIED`, `SUPPORT_GRANT_REQUESTED`, `SUPPORT_GRANT_ACCESSED`).
   - Protected by PostgreSQL RLS: strictly locked to sessions where `app.is_platform_admin` is set to `'true'`.

### 2.2 Rollback Migration (`008_platform_management_layers.down.sql`)
- Drops RLS policies on `platform_support_tickets` and `platform_audit_logs`.
- Drops tables `platform_support_tickets` and `platform_audit_logs`.
- Removes suspension columns from `workspaces`.

---

## 3. Backend Authorization Architecture & Security Boundaries

### 3.1 Permission Domains
- **Platform Domain (`platform:*`)**:
  - `platform:tenants:read`: List all client accounts, usage vs limits.
  - `platform:tenants:suspend`: Suspend client accounts with audited reason (Platform Super Admin only).
  - `platform:tenants:activate`: Reactivate suspended accounts (Platform Super Admin only).
  - `platform:plans:manage`: Administer subscription plan quotas & pricing (Super Admin + Billing Ops).
  - `platform:health:view`: Inspect webhook workers, BullMQ queues, Meta API latency (Super Admin + Support Ops).
  - `platform:queues:manage`: Retry failed jobs / purge queues (Super Admin + Support Ops).
  - `platform:tickets:manage`: Resolve cross-tenant support tickets (Super Admin + Support Ops).
  - `platform:support:grant_request`: Request time-boxed support grant from tenant Owner.
  - `platform:audit:view`: View global platform audit logs (Super Admin only).
- **Workspace Domain (`workspace:*`)**:
  - `billing:view`, `billing:manage`: Owner-only financial management. Client Admins receive 403.
  - `rules:*`, `workflows:*`, `broadcasts:*`, `messages:*`, `contacts:*`, `knowledge_base:*`.

### 3.2 Security Enforcement Points
1. **Zero-Trust Token Resolution:** `authenticateSession` verifies cryptographic JWTs. Client-supplied headers cannot override authenticated token identity.
2. **PostgreSQL RLS:** All tenant queries execute within a database transaction enforcing `workspace_id = get_current_workspace_id()`.
3. **Tenant Suspension Barrier:** In `requirePermission`, if a tenant workspace is marked `SUSPENDED`, all subsequent API calls from any member of that workspace are rejected immediately with `403 Forbidden` (`TENANT_SUSPENDED`).
4. **SRS §615 Customer Message Privacy Safeguard:** In `checkMessageContentAccess`, platform personnel are blocked from reading student message bodies unless an unexpired support grant issued by the tenant Owner is active in `support_grants`.

---

## 4. Frontend Architecture & User Experience

### 4.1 Layer 1: Platform Management Console (`PlatformConsoleView.tsx`)
- Renders automatically whenever the logged-in staff has a platform role (`platform_admin`, `platform_support`, `platform_billing`).
- Dedicated tabs:
  1. **Client Workspaces**: Full tenant directory with search, status pills (`ACTIVE`, `SUSPENDED`), monthly message & AI reply usage bars, WABA connection health, and "Suspend/Reactivate" action with audited justification modal.
  2. **Subscription Plans & Limits**: Platform subscription tier grid with editable pricing, seat allowances, execution limits, and AI reply caps.
  3. **Platform Health & Queues**: Real-time telemetry cards for Webhook Ingestion, Redis BullMQ Queues, Meta Cloud API latency, and PostgreSQL connection pool.
  4. **SRS §615 Privacy Grants**: Support grants inspector with expiration countdowns, "Request Support Grant from Owner" modal, and interactive "Test Privacy Barrier" button.
  5. **Support Tickets**: Filterable queue of client tickets with priority indicators and staff resolution controls.
  6. **Global Platform Audit Log**: Searchable table of internal platform actions.

### 4.2 Layer 2: Client Business Workspace
- Renders for subscribing coaching institute staff (Owner, Admin, Manager, Agent).
- Isolated shared inbox, leads CRM pipeline, keyword automations, drag-and-drop visual workflow canvas, approved Meta WhatsApp templates, broadcast wizard with opt-out suppression, document RAG knowledge base, demo booking slot calendars, and institute audit logs.
- Client Admins are prevented from modifying billing, accessing platform-wide configurations, or viewing other workspaces.

---

## 5. Automated Verification & Test Execution Results

All 6 automated test modules were executed sequentially and verified in the terminal:

```
========================================================================
🚀 AutoMask Master Automated Test Suite Runner (All 6 Test Modules)
========================================================================

▶️ Executing Suite: Multi-Tenant PostgreSQL RLS & Isolation...
✅ Multi-Tenant Security Results: 12/12 PASSED (0 failed)

▶️ Executing Suite: RBAC Security & Privacy Controls...
✅ RBAC & Security Test Results: 17/17 PASSED (0 failed)

▶️ Executing Suite: Section 4 End-to-End Workflows & Decision Router...
✅ Section 4 Workflow Results: 13/13 PASSED (0 failed)

▶️ Executing Suite: Phase 2 WhatsApp Queue & AI/RAG Engine...
✅ Phase 2 Production Tests: 16/16 PASSED (0 failed)

▶️ Executing Suite: Advanced RBAC, Visual Workflows & Broadcasts...
✅ Advanced RBAC & Features Test Results: 29/29 PASSED (0 failed)

▶️ Executing Suite: Platform Management Console vs Client Workspace...
✅ Platform vs Client Separation Results: 25/25 PASSED (0 failed)

========================================================================
🏁 AutoMask Master Test Run Summary
========================================================================
✅ [PASSED] Multi-Tenant PostgreSQL RLS & Isolation (12 tests)
✅ [PASSED] RBAC Security & Privacy Controls (17 tests)
✅ [PASSED] Section 4 End-to-End Workflows & Decision Router (13 tests)
✅ [PASSED] Phase 2 WhatsApp Queue & AI/RAG Engine (16 tests)
✅ [PASSED] Advanced RBAC, Visual Workflows & Broadcasts (29 tests)
✅ [PASSED] Platform Management Console vs Client Workspace (25 tests)
========================================================================

🎉 ALL 6 AUTOMATED TEST SUITES PASSED WITH 100% SUCCESS (112 / 112 Tests Green)
```

### 5.1 Detail of Platform vs Client Test Scenarios (25/25)
1. `Platform Admin CAN list all client tenants on /platform/tenants` -> **200 OK**
2. `Platform Admin CAN inspect platform health telemetry` -> **200 OK**
3. `Platform Admin CAN view global platform subscription plans` -> **200 OK**
4. `Platform Admin CAN view global platform audit logs` -> **200 OK**
5. `Workspace Owner CANNOT access platform tenant list` -> **403 Forbidden (PLATFORM_ACCESS_DENIED)**
6. `Workspace Admin CANNOT access platform tenant list` -> **403 Forbidden (PLATFORM_ACCESS_DENIED)**
7. `Workspace Agent CANNOT access platform tenant list` -> **403 Forbidden (PLATFORM_ACCESS_DENIED)**
8. `Workspace Admin CANNOT view platform plans catalog` -> **403 Forbidden (PLATFORM_ACCESS_DENIED)**
9. `Workspace Admin CANNOT view global platform audit logs` -> **403 Forbidden (PLATFORM_ACCESS_DENIED)**
10. `Workspace Admin CANNOT view workspace billing details` -> **403 Forbidden (SRS Section 3)**
11. `Workspace Admin CANNOT upgrade workspace subscription plan` -> **403 Forbidden (manage:billing required)**
12. `Workspace Owner CAN view and manage workspace billing` -> **200 OK**
13. `Platform Admin WITHOUT support grant is BLOCKED from student message text` -> **403 Forbidden (SRS Line 615)**
14. `Workspace Owner CAN issue time-boxed support grant to Platform Admin` -> **201 Created**
15. `Platform Admin WITH active Owner support grant CAN access message content` -> **200 OK (Audited)**
16. `Workspace Owner CAN revoke support grant at any time` -> **200 OK**
17. `Platform Admin with REVOKED grant is IMMEDIATELY BLOCKED` -> **403 Forbidden**
18. `Platform Admin CAN suspend client workspace with audited reason` -> **200 OK**
19. `Suspended tenant members are IMMEDIATELY BLOCKED from API operations` -> **403 Forbidden (TENANT_SUSPENDED)**
20. `Platform Admin CAN reactivate suspended tenant workspace` -> **200 OK**
21. `Reactivated tenant members regain access to conversations` -> **200 OK**
22. `Platform Support Ops CAN view infrastructure health telemetry` -> **200 OK**
23. `Platform Support Ops CANNOT modify subscription plan pricing` -> **403 Forbidden (PLATFORM_PERMISSION_DENIED)**
24. `Platform Billing Ops CAN administer plan quotas and pricing` -> **200 OK**
25. `Platform Billing Ops CANNOT suspend tenants (Super Admin only)` -> **403 Forbidden (PLATFORM_PERMISSION_DENIED)**

---

## 6. Production Deployment Instructions

1. **Database Migration:**
   ```bash
   cd server
   npm run migrate
   ```
   Applies `008_platform_management_layers.sql` in transaction order.
2. **Build Server & Client:**
   ```bash
   npm run build:server
   npm run build:client
   ```
3. **Execute Automated Verification:**
   ```bash
   cd server
   npm run test:all
   ```
   Confirms all 112 tests pass.
4. **Environment Variables:**
   Ensure `SESSION_COOKIE_NAME`, `JWT_SECRET`, `DATABASE_URL`, and `REDIS_URL` are configured in `.env`.
