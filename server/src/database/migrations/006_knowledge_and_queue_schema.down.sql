-- Rollback Migration 006
DROP TABLE IF EXISTS knowledge_chunks CASCADE;
ALTER TABLE knowledge_items DROP COLUMN IF EXISTS embedding;
ALTER TABLE knowledge_items DROP COLUMN IF EXISTS metadata;
DROP INDEX IF EXISTS idx_webhook_events_idempotency_key;
ALTER TABLE webhook_events DROP COLUMN IF EXISTS idempotency_key;
ALTER TABLE webhook_events DROP COLUMN IF EXISTS retry_count;
ALTER TABLE webhook_events DROP COLUMN IF EXISTS error_message;
DROP FUNCTION IF EXISTS cosine_similarity(FLOAT8[], FLOAT8[]);
