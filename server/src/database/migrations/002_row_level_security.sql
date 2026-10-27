-- ==============================================================================
-- AutoMask Migration 002: PostgreSQL Row-Level Security (RLS)
-- Defense-in-depth isolation across all tenant-owned tables
-- ==============================================================================

-- Helper function to safely read the transaction-local tenant context
CREATE OR REPLACE FUNCTION get_current_workspace_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_workspace_id', true), '')::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- 1. workspaces table
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_workspaces ON workspaces;
CREATE POLICY tenant_isolation_workspaces ON workspaces
    FOR ALL
    USING (id = get_current_workspace_id())
    WITH CHECK (id = get_current_workspace_id());

-- 2. workspace_members table
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_workspace_members ON workspace_members;
CREATE POLICY tenant_isolation_workspace_members ON workspace_members
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 3. whatsapp_accounts table
ALTER TABLE whatsapp_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_accounts FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_whatsapp_accounts ON whatsapp_accounts;
CREATE POLICY tenant_isolation_whatsapp_accounts ON whatsapp_accounts
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 4. contacts table
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_contacts ON contacts;
CREATE POLICY tenant_isolation_contacts ON contacts
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 5. conversations table
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_conversations ON conversations;
CREATE POLICY tenant_isolation_conversations ON conversations
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 6. messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_messages ON messages;
CREATE POLICY tenant_isolation_messages ON messages
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 7. leads table
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_leads ON leads;
CREATE POLICY tenant_isolation_leads ON leads
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 8. lead_events table
ALTER TABLE lead_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_events FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_lead_events ON lead_events;
CREATE POLICY tenant_isolation_lead_events ON lead_events
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 9. knowledge_items table
ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_items FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_knowledge_items ON knowledge_items;
CREATE POLICY tenant_isolation_knowledge_items ON knowledge_items
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 10. automation_rules table
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_automation_rules ON automation_rules;
CREATE POLICY tenant_isolation_automation_rules ON automation_rules
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 11. workflow_executions table
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_workflow_executions ON workflow_executions;
CREATE POLICY tenant_isolation_workflow_executions ON workflow_executions
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 12. followup_sequences table
ALTER TABLE followup_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_sequences FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_followup_sequences ON followup_sequences;
CREATE POLICY tenant_isolation_followup_sequences ON followup_sequences
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 13. followup_jobs table
ALTER TABLE followup_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_jobs FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_followup_jobs ON followup_jobs;
CREATE POLICY tenant_isolation_followup_jobs ON followup_jobs
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 14. slots table
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_slots ON slots;
CREATE POLICY tenant_isolation_slots ON slots
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 15. appointments table
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_appointments ON appointments;
CREATE POLICY tenant_isolation_appointments ON appointments
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 16. orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_orders ON orders;
CREATE POLICY tenant_isolation_orders ON orders
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 17. order_events table
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_events FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_order_events ON order_events;
CREATE POLICY tenant_isolation_order_events ON order_events
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 18. ai_calls table
ALTER TABLE ai_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_calls FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ai_calls ON ai_calls;
CREATE POLICY tenant_isolation_ai_calls ON ai_calls
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 19. usage_events table
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_usage_events ON usage_events;
CREATE POLICY tenant_isolation_usage_events ON usage_events
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 20. audit_logs table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_audit_logs ON audit_logs;
CREATE POLICY tenant_isolation_audit_logs ON audit_logs
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

-- 21. support_grants table
ALTER TABLE support_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_grants FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_support_grants ON support_grants;
CREATE POLICY tenant_isolation_support_grants ON support_grants
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());
