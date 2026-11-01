-- ==============================================================================
-- AutoMask Migration 010: Enterprise Tenancy, Agency Organizations & Industry Architecture
-- Hierarchical Architecture: Platform -> Agency Organization -> Client Workspaces
-- Direct Customer -> Independent Workspace
-- ==============================================================================

-- 1. Create Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'AGENCY', -- 'AGENCY', 'ENTERPRISE', 'DIRECT'
    plan_id VARCHAR(50) REFERENCES plans(id) DEFAULT 'pro',
    max_workspaces INTEGER NOT NULL DEFAULT 10,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'suspended'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);

-- 2. Create Organization Members Table (Agency-level RBAC)
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'agency_staff', -- 'agency_owner', 'agency_admin', 'agency_manager', 'agency_staff'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'suspended'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_org_member UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);

-- 3. Extend Workspaces with Organization Link & Industry Type
ALTER TABLE workspaces
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS industry_type VARCHAR(50) DEFAULT 'EDUCATION',
ADD COLUMN IF NOT EXISTS industry_config JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_workspaces_organization ON workspaces(organization_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_industry ON workspaces(industry_type);

-- 4. Seed Default Agency Organization for Demonstration
INSERT INTO organizations (id, name, slug, type, plan_id, max_workspaces, status)
VALUES (
    'a1111111-1111-4111-8111-111111111111',
    'ScaleOps Digital Agency',
    'scaleops-agency',
    'AGENCY',
    'pro',
    25,
    'active'
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, updated_at = CURRENT_TIMESTAMP;

-- Link Prakash Institute workspace as an independent workspace or direct customer
-- and establish link for multi-workspace agency testing
UPDATE workspaces 
SET industry_type = 'EDUCATION',
    industry_config = jsonb_build_object(
        'term', 'Student',
        'pluralTerm', 'Students',
        'kpis', jsonb_build_array('admissions', 'demoBookings', 'activeEnquiries'),
        'primaryAction', 'Book Demo Class'
    )
WHERE id = '11111111-1111-4111-8111-111111111111';

-- 5. Helper Function for Organization Context
CREATE OR REPLACE FUNCTION get_current_organization_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_organization_id', true), '')::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- 6. Row-Level Security for Organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_organizations ON organizations;
CREATE POLICY tenant_isolation_organizations ON organizations
    FOR ALL
    USING (
        id = get_current_organization_id()
        OR current_setting('app.is_platform_admin', true) = 'true'
        OR EXISTS (
            SELECT 1 FROM workspaces w 
            WHERE w.id = get_current_workspace_id() AND w.organization_id = organizations.id
        )
    )
    WITH CHECK (
        id = get_current_organization_id()
        OR current_setting('app.is_platform_admin', true) = 'true'
    );

-- 7. Row-Level Security for Organization Members
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_organization_members ON organization_members;
CREATE POLICY tenant_isolation_organization_members ON organization_members
    FOR ALL
    USING (
        organization_id = get_current_organization_id()
        OR current_setting('app.is_platform_admin', true) = 'true'
    )
    WITH CHECK (
        organization_id = get_current_organization_id()
        OR current_setting('app.is_platform_admin', true) = 'true'
    );

