-- Rollback Migration 010: Enterprise Tenancy, Agency Organizations & Industry Architecture

DROP POLICY IF EXISTS tenant_isolation_organization_members ON organization_members;
DROP POLICY IF EXISTS tenant_isolation_organizations ON organizations;

DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

ALTER TABLE workspaces 
DROP COLUMN IF EXISTS organization_id,
DROP COLUMN IF EXISTS industry_type,
DROP COLUMN IF EXISTS industry_config;

DROP FUNCTION IF EXISTS get_current_organization_id();

