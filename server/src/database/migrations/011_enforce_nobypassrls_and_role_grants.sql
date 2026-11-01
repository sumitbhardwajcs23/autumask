-- Migration 011: Grant Application Role to Database Admin & Enforce RLS
DO $$
BEGIN
    -- Grant automask_app to current connection user so SET LOCAL ROLE works
    EXECUTE format('GRANT automask_app TO %I;', current_user);
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- Force Row-Level Security on all tables for table owner as well
ALTER TABLE workspaces FORCE ROW LEVEL SECURITY;
ALTER TABLE workspace_members FORCE ROW LEVEL SECURITY;
ALTER TABLE contacts FORCE ROW LEVEL SECURITY;
ALTER TABLE conversations FORCE ROW LEVEL SECURITY;
ALTER TABLE messages FORCE ROW LEVEL SECURITY;
ALTER TABLE leads FORCE ROW LEVEL SECURITY;
ALTER TABLE slots FORCE ROW LEVEL SECURITY;
ALTER TABLE appointments FORCE ROW LEVEL SECURITY;
ALTER TABLE knowledge_items FORCE ROW LEVEL SECURITY;
ALTER TABLE automation_rules FORCE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_accounts FORCE ROW LEVEL SECURITY;

