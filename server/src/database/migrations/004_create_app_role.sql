-- ==============================================================================
-- AutoMask Migration 004: Create Non-Superuser Application Role
-- Enforces NOBYPASSRLS, NOSUPERUSER for Least-Privilege Execution
-- ==============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'automask_app') THEN
        CREATE ROLE automask_app WITH LOGIN PASSWORD 'automask_app_secure_pass' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
    END IF;
END $$;

GRANT USAGE ON SCHEMA public TO automask_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO automask_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO automask_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO automask_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO automask_app;
