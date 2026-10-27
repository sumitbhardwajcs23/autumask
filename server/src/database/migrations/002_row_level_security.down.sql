-- ==============================================================================
-- AutoMask Migration 002 Rollback: Drop RLS Policies
-- ==============================================================================

DROP POLICY IF EXISTS tenant_isolation_support_grants ON support_grants;
ALTER TABLE support_grants DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_audit_logs ON audit_logs;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_usage_events ON usage_events;
ALTER TABLE usage_events DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_ai_calls ON ai_calls;
ALTER TABLE ai_calls DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_order_events ON order_events;
ALTER TABLE order_events DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_orders ON orders;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_appointments ON appointments;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_slots ON slots;
ALTER TABLE slots DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_followup_jobs ON followup_jobs;
ALTER TABLE followup_jobs DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_followup_sequences ON followup_sequences;
ALTER TABLE followup_sequences DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_workflow_executions ON workflow_executions;
ALTER TABLE workflow_executions DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_automation_rules ON automation_rules;
ALTER TABLE automation_rules DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_knowledge_items ON knowledge_items;
ALTER TABLE knowledge_items DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_lead_events ON lead_events;
ALTER TABLE lead_events DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_leads ON leads;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_messages ON messages;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_conversations ON conversations;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_contacts ON contacts;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_whatsapp_accounts ON whatsapp_accounts;
ALTER TABLE whatsapp_accounts DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_workspace_members ON workspace_members;
ALTER TABLE workspace_members DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_workspaces ON workspaces;
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;

DROP FUNCTION IF EXISTS get_current_workspace_id();
