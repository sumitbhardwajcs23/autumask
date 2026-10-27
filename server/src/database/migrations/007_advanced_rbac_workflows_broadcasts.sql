-- ==============================================================================
-- AutoMask Migration 007: Advanced RBAC, Workflows, Templates, Broadcasts & Documents
-- Enforces PostgreSQL Row-Level Security (RLS) across all newly introduced tables
-- ==============================================================================

-- 1. Custom & Workspace Roles
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roles_workspace_id ON roles(workspace_id);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_roles ON roles;
CREATE POLICY tenant_isolation_roles ON roles
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 2. User Permission Overrides (Explicit Grants & Explicit Denies)
CREATE TABLE IF NOT EXISTS user_permission_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    grants JSONB NOT NULL DEFAULT '[]'::jsonb,
    denies JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_user_permission_overrides_lookup ON user_permission_overrides(workspace_id, user_id);

ALTER TABLE user_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permission_overrides FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_user_permission_overrides ON user_permission_overrides;
CREATE POLICY tenant_isolation_user_permission_overrides ON user_permission_overrides
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 3. Resource Access Scopes (Assigned conversations vs all, whatsapp accounts)
CREATE TABLE IF NOT EXISTS resource_access_scopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    conversations VARCHAR(32) NOT NULL DEFAULT 'all',
    whatsapp_accounts JSONB NOT NULL DEFAULT '"all"'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_resource_access_scopes_lookup ON resource_access_scopes(workspace_id, user_id);

ALTER TABLE resource_access_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_access_scopes FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_resource_access_scopes ON resource_access_scopes;
CREATE POLICY tenant_isolation_resource_access_scopes ON resource_access_scopes
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 4. Workflow Definitions (Visual drag-and-drop canvas diagrams)
CREATE TABLE IF NOT EXISTS workflow_definitions (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    trigger_type VARCHAR(64) NOT NULL DEFAULT 'INCOMING_MESSAGE',
    nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
    edges JSONB NOT NULL DEFAULT '[]'::jsonb,
    version INT NOT NULL DEFAULT 1,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_definitions_workspace ON workflow_definitions(workspace_id);

ALTER TABLE workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_definitions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_workflow_definitions ON workflow_definitions;
CREATE POLICY tenant_isolation_workflow_definitions ON workflow_definitions
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 5. Message Templates (Meta WhatsApp approved templates)
CREATE TABLE IF NOT EXISTS message_templates (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(32) NOT NULL DEFAULT 'MARKETING',
    language VARCHAR(10) NOT NULL DEFAULT 'en_US',
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    header JSONB,
    body TEXT NOT NULL,
    footer TEXT,
    buttons JSONB NOT NULL DEFAULT '[]'::jsonb,
    variables JSONB NOT NULL DEFAULT '[]'::jsonb,
    meta_template_id VARCHAR(128),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_templates_workspace ON message_templates(workspace_id);

ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_message_templates ON message_templates;
CREATE POLICY tenant_isolation_message_templates ON message_templates
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 6. Broadcast Campaigns (Bulk Messaging)
CREATE TABLE IF NOT EXISTS broadcast_campaigns (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    template_id VARCHAR(64) REFERENCES message_templates(id),
    whatsapp_account_id UUID REFERENCES whatsapp_accounts(id),
    audience_filter JSONB NOT NULL DEFAULT '{}'::jsonb,
    variable_mappings JSONB NOT NULL DEFAULT '{}'::jsonb,
    scheduled_at TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    total_recipients INT NOT NULL DEFAULT 0,
    sent_count INT NOT NULL DEFAULT 0,
    delivered_count INT NOT NULL DEFAULT 0,
    read_count INT NOT NULL DEFAULT 0,
    failed_count INT NOT NULL DEFAULT 0,
    excluded_count INT NOT NULL DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_broadcast_campaigns_workspace ON broadcast_campaigns(workspace_id);

ALTER TABLE broadcast_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_campaigns FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_broadcast_campaigns ON broadcast_campaigns;
CREATE POLICY tenant_isolation_broadcast_campaigns ON broadcast_campaigns
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 7. Knowledge Documents (Uploaded files for RAG extraction)
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT NOT NULL DEFAULT 0,
    file_type VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'INDEXED',
    extracted_text TEXT,
    chunk_count INT NOT NULL DEFAULT 0,
    error_message TEXT,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_workspace ON knowledge_documents(workspace_id);

ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_knowledge_documents ON knowledge_documents;
CREATE POLICY tenant_isolation_knowledge_documents ON knowledge_documents
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- Explicitly grant permissions to application role
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'automask_app') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON roles, user_permission_overrides, resource_access_scopes, workflow_definitions, message_templates, broadcast_campaigns, knowledge_documents TO automask_app;
    END IF;
END $$;
