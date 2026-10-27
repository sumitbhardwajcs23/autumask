-- ==============================================================================
-- AutoMask Migration 005: Trusted Webhook Account Resolution Function
-- Enables secure Meta phone_number_id -> workspace_id resolution
-- using a SECURITY DEFINER function that enforces search_path isolation.
-- ==============================================================================

CREATE OR REPLACE FUNCTION resolve_workspace_by_phone_number_id(p_phone_id VARCHAR)
RETURNS TABLE (workspace_id UUID, status VARCHAR) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT w.workspace_id, w.status
    FROM whatsapp_accounts w
    WHERE w.phone_number_id = p_phone_id
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION resolve_workspace_by_phone_number_id(VARCHAR) TO automask_app;
