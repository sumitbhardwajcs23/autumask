-- ==============================================================================
-- AutoMask Migration 009: Production Readiness & P0 Architectural Fixes
-- Covers: Transactional Outbox, Outbound State Machine, Concurrency Constraints,
-- Composite Uniqueness, Re-enrollment Identifiers, and One-Open-Conversation Rules
-- ==============================================================================

-- 1. Messages: Explicit whatsapp_account_id & Provider Message Deduplication
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS whatsapp_account_id UUID REFERENCES whatsapp_accounts(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_messages_account_provider 
ON messages(whatsapp_account_id, provider_message_id) 
WHERE provider_message_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_workspace_provider_id 
ON messages(workspace_id, provider_message_id) 
WHERE provider_message_id IS NOT NULL;

-- 2. Conversations: Clean up any existing duplicate OPEN records before enforcing partial unique constraint
UPDATE conversations c1
SET status = 'CLOSED'
WHERE status = 'OPEN'
  AND EXISTS (
    SELECT 1 FROM conversations c2
    WHERE c2.workspace_id = c1.workspace_id
      AND c2.contact_id = c1.contact_id
      AND c2.status = 'OPEN'
      AND (c2.created_at > c1.created_at OR (c2.created_at = c1.created_at AND c2.id > c1.id))
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_open_conversation_per_contact 
ON conversations(workspace_id, contact_id) 
WHERE status = 'OPEN';

-- 3. Follow-up Jobs: Sequence Run Identifier for Re-enrollment Support
ALTER TABLE followup_jobs 
ADD COLUMN IF NOT EXISTS sequence_run_id UUID DEFAULT uuid_generate_v4();

CREATE INDEX IF NOT EXISTS idx_followup_jobs_run 
ON followup_jobs(workspace_id, contact_id, sequence_id, sequence_run_id, step_no);

-- 4. Slots: Integrity Constraint Preventing Capacity Overbooking at Engine Level
ALTER TABLE slots 
ADD CONSTRAINT check_slot_capacity_non_negative CHECK (booked_count >= 0);

ALTER TABLE slots 
ADD CONSTRAINT check_slot_capacity_limit CHECK (booked_count <= capacity);

-- 5. Transactional Outbox Table (Durable Event Dispatching & Crash Recovery)
CREATE TABLE IF NOT EXISTS outbox_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(150) NOT NULL,
    payload_json JSONB NOT NULL,
    idempotency_key VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, DISPATCHED, FAILED, DEAD
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    next_retry_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_outbox_events_status 
ON outbox_events(status, next_retry_at) 
WHERE status = 'PENDING';

-- 6. Outbound Message State Machine & Idempotency Tracking
CREATE TABLE IF NOT EXISTS outbound_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    to_phone VARCHAR(30) NOT NULL,
    message_type VARCHAR(50) NOT NULL, -- text, template, interactive
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    payload_json JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, DISPATCHED, ACCEPTED, DELIVERED, READ, FAILED, UNKNOWN_TIMEOUT
    provider_message_id VARCHAR(150),
    error_code VARCHAR(100),
    error_message TEXT,
    dispatched_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_outbound_messages_workspace_key 
ON outbound_messages(workspace_id, idempotency_key);

CREATE INDEX IF NOT EXISTS idx_outbound_messages_provider_id 
ON outbound_messages(provider_message_id) 
WHERE provider_message_id IS NOT NULL;

-- 7. Row Level Security for Outbox & Outbound Message Tables
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_events FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_outbox_events ON outbox_events;
CREATE POLICY tenant_isolation_outbox_events ON outbox_events
    FOR ALL
    USING (
        workspace_id IS NULL 
        OR workspace_id = get_current_workspace_id() 
        OR current_setting('app.is_platform_admin', true) = 'true'
    )
    WITH CHECK (
        workspace_id IS NULL 
        OR workspace_id = get_current_workspace_id() 
        OR current_setting('app.is_platform_admin', true) = 'true'
    );

ALTER TABLE outbound_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_messages FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_outbound_messages ON outbound_messages;
CREATE POLICY tenant_isolation_outbound_messages ON outbound_messages
    FOR ALL
    USING (
        workspace_id = get_current_workspace_id() 
        OR current_setting('app.is_platform_admin', true) = 'true'
    )
    WITH CHECK (
        workspace_id = get_current_workspace_id() 
        OR current_setting('app.is_platform_admin', true) = 'true'
    );

-- 8. Grant Application Role Permissions
GRANT ALL ON TABLE outbox_events TO automask_app;
GRANT ALL ON TABLE outbound_messages TO automask_app;
