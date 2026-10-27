-- ==============================================================================
-- AutoMask Migration 007 Rollback: Drop advanced RBAC, workflows, broadcasts tables
-- ==============================================================================

DROP TABLE IF EXISTS knowledge_documents CASCADE;
DROP TABLE IF EXISTS broadcast_campaigns CASCADE;
DROP TABLE IF EXISTS message_templates CASCADE;
DROP TABLE IF EXISTS workflow_definitions CASCADE;
DROP TABLE IF EXISTS resource_access_scopes CASCADE;
DROP TABLE IF EXISTS user_permission_overrides CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
