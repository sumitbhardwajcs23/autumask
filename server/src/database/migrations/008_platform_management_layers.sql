-- ==============================================================================
-- AutoMask Migration 008: Platform Management Console & Client Workspace Layers
-- Enforces separation between Platform Operations and Tenant Workspace Operations
-- ==============================================================================

-- 1. Extend workspaces with controlled suspension metadata
ALTER TABLE workspaces 
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES users(id);

-- 2. Platform Support Tickets
CREATE TABLE IF NOT EXISTS platform_support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    requester_email VARCHAR(255) NOT NULL,
    requester_name VARCHAR(150) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'TECHNICAL', -- TECHNICAL, BILLING, WHATSAPP_API, QUOTA, SUSPENSION_APPEAL
    priority VARCHAR(50) DEFAULT 'MEDIUM',     -- LOW, MEDIUM, HIGH, URGENT
    status VARCHAR(50) DEFAULT 'OPEN',         -- OPEN, IN_PROGRESS, RESOLVED, CLOSED
    assigned_to UUID REFERENCES users(id),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_platform_tickets_workspace ON platform_support_tickets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_platform_tickets_status ON platform_support_tickets(status);

-- 3. Global Platform Audit Logs (Immutable audit trail for internal platform operations)
CREATE TABLE IF NOT EXISTS platform_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id VARCHAR(100) NOT NULL,
    actor_email VARCHAR(255) NOT NULL,
    actor_role VARCHAR(50) NOT NULL, -- platform_admin, platform_support, platform_billing
    action VARCHAR(100) NOT NULL,     -- TENANT_SUSPENDED, TENANT_ACTIVATED, PLAN_MODIFIED, etc.
    target_type VARCHAR(50) NOT NULL, -- tenant, plan, ticket, support_grant
    target_id VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_platform_audit_actor ON platform_audit_logs(actor_role, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_audit_target ON platform_audit_logs(target_type, target_id);

-- 4. Row-Level Security for Platform Support Tickets
ALTER TABLE platform_support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_support_tickets FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_platform_support_tickets ON platform_support_tickets;
CREATE POLICY tenant_isolation_platform_support_tickets ON platform_support_tickets
    FOR ALL
    USING (
        workspace_id = get_current_workspace_id() 
        OR current_setting('app.is_platform_admin', true) = 'true'
    )
    WITH CHECK (
        workspace_id = get_current_workspace_id() 
        OR current_setting('app.is_platform_admin', true) = 'true'
    );

-- 5. Row-Level Security for Platform Audit Logs (Only accessible when app.is_platform_admin is 'true')
ALTER TABLE platform_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_audit_logs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS platform_staff_only_audit_logs ON platform_audit_logs;
CREATE POLICY platform_staff_only_audit_logs ON platform_audit_logs
    FOR ALL
    USING (current_setting('app.is_platform_admin', true) = 'true')
    WITH CHECK (current_setting('app.is_platform_admin', true) = 'true');
