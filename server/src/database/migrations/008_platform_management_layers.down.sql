-- ==============================================================================
-- AutoMask Migration 008 Down: Platform Management Console & Client Workspace Layers
-- ==============================================================================

DROP POLICY IF EXISTS platform_staff_only_audit_logs ON platform_audit_logs;
DROP POLICY IF EXISTS tenant_isolation_platform_support_tickets ON platform_support_tickets;

DROP TABLE IF EXISTS platform_audit_logs;
DROP TABLE IF EXISTS platform_support_tickets;

ALTER TABLE workspaces 
DROP COLUMN IF EXISTS suspension_reason,
DROP COLUMN IF EXISTS suspended_at,
DROP COLUMN IF EXISTS suspended_by;
