-- ==============================================================================
-- AutoMask Migration 009 Down: Production Readiness & P0 Architectural Fixes
-- ==============================================================================

DROP POLICY IF EXISTS tenant_isolation_outbound_messages ON outbound_messages;
DROP POLICY IF EXISTS tenant_isolation_outbox_events ON outbox_events;

DROP TABLE IF EXISTS outbound_messages;
DROP TABLE IF EXISTS outbox_events;

ALTER TABLE slots DROP CONSTRAINT IF EXISTS check_slot_capacity_limit;
ALTER TABLE slots DROP CONSTRAINT IF EXISTS check_slot_capacity_non_negative;

DROP INDEX IF EXISTS idx_followup_jobs_run;
ALTER TABLE followup_jobs DROP COLUMN IF EXISTS sequence_run_id;

DROP INDEX IF EXISTS idx_one_open_conversation_per_contact;

DROP INDEX IF EXISTS idx_messages_workspace_provider_id;
DROP INDEX IF EXISTS idx_messages_account_provider;
ALTER TABLE messages DROP COLUMN IF EXISTS whatsapp_account_id;
