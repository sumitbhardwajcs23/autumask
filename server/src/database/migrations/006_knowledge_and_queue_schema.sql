-- ==============================================================================
-- AutoMask Migration 006: Knowledge Chunks, Vector Cosine Search & Webhook Queue
-- Supports PostgreSQL RLS-isolated RAG and asynchronous BullMQ ingestion
-- ==============================================================================

-- 1. Cosine Similarity Function for Native Vector Operations
CREATE OR REPLACE FUNCTION cosine_similarity(a FLOAT8[], b FLOAT8[])
RETURNS FLOAT8 AS $$
DECLARE
    dot_product FLOAT8 := 0.0;
    norm_a FLOAT8 := 0.0;
    norm_b FLOAT8 := 0.0;
    len INT;
BEGIN
    len := array_length(a, 1);
    IF len IS NULL OR len != array_length(b, 1) THEN
        RETURN 0.0;
    END IF;

    FOR i IN 1..len LOOP
        dot_product := dot_product + (a[i] * b[i]);
        norm_a := norm_a + (a[i] * a[i]);
        norm_b := norm_b + (b[i] * b[i]);
    END LOOP;

    IF norm_a = 0.0 OR norm_b = 0.0 THEN
        RETURN 0.0;
    END IF;

    RETURN dot_product / (sqrt(norm_a) * sqrt(norm_b));
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

-- Grant execution to application role
GRANT EXECUTE ON FUNCTION cosine_similarity(FLOAT8[], FLOAT8[]) TO automask_app;

-- 2. Add embedding to knowledge_items if not present
ALTER TABLE knowledge_items ADD COLUMN IF NOT EXISTS embedding FLOAT8[];
ALTER TABLE knowledge_items ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 3. Create knowledge_chunks table for granular RAG chunking
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    knowledge_item_id UUID NOT NULL REFERENCES knowledge_items(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding FLOAT8[],
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable & Force RLS on knowledge_chunks
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_knowledge_chunks ON knowledge_chunks;
CREATE POLICY tenant_isolation_knowledge_chunks ON knowledge_chunks
    FOR ALL
    USING (workspace_id = get_current_workspace_id())
    WITH CHECK (workspace_id = get_current_workspace_id());

GRANT ALL ON TABLE knowledge_chunks TO automask_app;

-- 4. Enhance webhook_events with idempotency and retry tracking
ALTER TABLE webhook_events ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255);
ALTER TABLE webhook_events ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;
ALTER TABLE webhook_events ADD COLUMN IF NOT EXISTS error_message TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_events_idempotency_key ON webhook_events(idempotency_key) WHERE idempotency_key IS NOT NULL;
