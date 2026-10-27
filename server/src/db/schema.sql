-- ==============================================================================
-- AutoMask WhatsApp Automation Platform - MVP PostgreSQL Schema
-- Version 1.0 (Compliant with WhatsApp_Automation_MVP_SRS.docx Section 6)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table (Global identity)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    email_verified_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active', -- active, suspended, invited
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Subscription Plans
CREATE TABLE IF NOT EXISTS plans (
    id VARCHAR(50) PRIMARY KEY, -- free, starter, growth, pro
    name VARCHAR(100) NOT NULL,
    price_inr INTEGER NOT NULL DEFAULT 0,
    max_members INTEGER NOT NULL DEFAULT 1,
    max_executions INTEGER NOT NULL DEFAULT 100,
    max_ai_replies INTEGER NOT NULL DEFAULT 30,
    max_templates INTEGER NOT NULL DEFAULT 50,
    features JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Workspaces (Tenant Root)
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) DEFAULT 'Coaching Institute', -- JEE/NEET, SSC/Banking, Coding, etc.
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    business_hours JSONB DEFAULT '{"start": "09:00", "end": "19:00", "days": [1,2,3,4,5,6]}'::jsonb,
    plan_id VARCHAR(50) REFERENCES plans(id) DEFAULT 'pro',
    plan_renew_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Workspace Members (RBAC: owner, admin, agent)
CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'agent', -- owner, admin, agent
    invited_by UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'active',
    is_online BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workspace_id, user_id)
);

-- 5. WhatsApp Accounts (One WABA phone number per workspace in MVP - DD-01)
CREATE TABLE IF NOT EXISTS whatsapp_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    waba_id VARCHAR(100),
    phone_number_id VARCHAR(100),
    display_number VARCHAR(50) NOT NULL, -- e.g. +91 98765 43210
    token_encrypted TEXT,
    webhook_secret VARCHAR(255),
    quality_rating VARCHAR(50) DEFAULT 'GREEN',
    status VARCHAR(50) DEFAULT 'CONNECTED', -- CONNECTED, DISCONNECTED, RESTRICTED
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workspace_id)
);

-- 6. Raw Webhook Events (for audit and replay - DD-08)
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(50) DEFAULT 'meta_whatsapp',
    signature_valid BOOLEAN DEFAULT TRUE,
    payload_json JSONB NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'PROCESSED' -- PENDING, PROCESSED, FAILED
);

-- 7. Contacts (Student/Parent records)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    phone_e164 VARCHAR(30) NOT NULL,
    name VARCHAR(150),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    opt_in_status VARCHAR(50) DEFAULT 'OPTED_IN', -- OPTED_IN, OPTED_OUT
    opt_in_source VARCHAR(100) DEFAULT 'INBOUND_MESSAGE',
    opted_out_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workspace_id, phone_e164)
);

-- 8. Conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, CLOSED, RESOLVED
    assignee_id UUID REFERENCES workspace_members(id),
    window_expires_at TIMESTAMP WITH TIME ZONE, -- 24h WhatsApp Service Window
    takeover_active BOOLEAN DEFAULT FALSE, -- DD-04: pauses bot when human is chatting
    unread_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_message_preview TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    direction VARCHAR(20) NOT NULL, -- INBOUND, OUTBOUND
    provider_message_id VARCHAR(150), -- Meta wamid.xxx
    type VARCHAR(50) DEFAULT 'text', -- text, template, interactive, button, image, document
    body TEXT NOT NULL,
    sender_type VARCHAR(50) DEFAULT 'student', -- student, bot, agent, system
    status VARCHAR(50) DEFAULT 'SENT', -- SENT, DELIVERED, READ, FAILED
    error_code VARCHAR(100),
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Leads (Student CRM)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    class_grade VARCHAR(50), -- Class 11, Class 12, Dropper
    course VARCHAR(100), -- JEE, NEET, Foundation, SSC, Spoken English
    preferred_batch VARCHAR(100), -- Morning, Evening, Weekend
    city VARCHAR(100),
    status VARCHAR(50) DEFAULT 'NEW', -- NEW, QUALIFIED, INTERESTED, DEMO_BOOKED, DEMO_ATTENDED, ADMITTED, LOST
    source VARCHAR(100) DEFAULT 'Website', -- Website, Facebook Ads, Instagram, Direct Chat, Reference, Others
    score INTEGER DEFAULT 50, -- 0 to 100 lead score
    owner_id UUID REFERENCES workspace_members(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Lead Status Audit Events
CREATE TABLE IF NOT EXISTS lead_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    actor VARCHAR(100) NOT NULL, -- System / Bot / User Name
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Knowledge Items (Grounded RAG for AI Assistant - DD-05)
CREATE TABLE IF NOT EXISTS knowledge_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- course, faq, fee_structure, policy
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    fees VARCHAR(100), -- Strict fee amount (e.g. ₹45,000 / year)
    batches TEXT, -- e.g. Mon-Fri 4PM to 7PM
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Automation Rules (Form-based trigger-condition-action - DD-03)
CREATE TABLE IF NOT EXISTS automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    trigger VARCHAR(100) NOT NULL, -- KEYWORD, EXACT_MATCH, INTENT_MATCH, DEMO_REQUEST
    conditions_json JSONB NOT NULL DEFAULT '[]'::jsonb, -- keywords, regex, tags
    actions_json JSONB NOT NULL DEFAULT '[]'::jsonb, -- reply_text, send_template, assign_tag, notify_team
    priority INTEGER NOT NULL DEFAULT 10,
    stop_flag BOOLEAN DEFAULT TRUE, -- Stop evaluating lower priority rules
    enabled BOOLEAN DEFAULT TRUE,
    executions_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Workflow Executions
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES automation_rules(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'SUCCESS', -- SUCCESS, FAILED
    error TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Follow-up Sequences
CREATE TABLE IF NOT EXISTS followup_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    trigger_status VARCHAR(50) DEFAULT 'DEMO_ATTENDED',
    steps_json JSONB NOT NULL DEFAULT '[]'::jsonb, -- delay_hours, template_name, message_body
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Follow-up Jobs (Scheduled queue entries)
CREATE TABLE IF NOT EXISTS followup_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    sequence_id UUID NOT NULL REFERENCES followup_sequences(id) ON DELETE CASCADE,
    step_no INTEGER NOT NULL DEFAULT 1,
    run_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'SCHEDULED', -- SCHEDULED, EXECUTED, CANCELLED, FAILED
    attempts INTEGER DEFAULT 0,
    job_key VARCHAR(150) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Booking Availability Rules & Slots (Built-in Slot Engine - DD-02)
CREATE TABLE IF NOT EXISTS availability_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday ... 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INTEGER DEFAULT 45,
    max_capacity_per_slot INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title VARCHAR(150) DEFAULT 'Demo / Counselling Session',
    start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at TIMESTAMP WITH TIME ZONE NOT NULL,
    capacity INTEGER DEFAULT 15,
    booked_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'AVAILABLE' -- AVAILABLE, FULL, CANCELLED
);

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_id UUID NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id),
    status VARCHAR(50) DEFAULT 'CONFIRMED', -- CONFIRMED, ATTENDED, CANCELLED, NO_SHOW
    idempotency_key VARCHAR(150) UNIQUE,
    confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reminder_state VARCHAR(50) DEFAULT 'PENDING'
);

-- 18. AI Calls (Telemetry & Cost Tracking)
CREATE TABLE IF NOT EXISTS ai_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id),
    model VARCHAR(100) DEFAULT 'gpt-4o',
    tokens_in INTEGER DEFAULT 0,
    tokens_out INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    intent VARCHAR(100),
    tools_called JSONB DEFAULT '[]'::jsonb,
    outcome VARCHAR(50) DEFAULT 'ANSWERED' -- ANSWERED, FALLBACK, HANDOFF
);

-- 19. Usage Events (Quota enforcement - DD-07)
CREATE TABLE IF NOT EXISTS usage_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- ai_reply, workflow_exec, template_msg
    qty INTEGER NOT NULL DEFAULT 1,
    ref_id VARCHAR(150),
    at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    actor VARCHAR(150) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target VARCHAR(150),
    details JSONB DEFAULT '{}'::jsonb,
    ip VARCHAR(50),
    at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- Indexes for Performance & Workspace Isolation
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_conversations_workspace ON conversations(workspace_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, timestamp ASC);
CREATE INDEX IF NOT EXISTS idx_leads_workspace ON leads(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_contacts_workspace_phone ON contacts(workspace_id, phone_e164);
CREATE INDEX IF NOT EXISTS idx_rules_workspace ON automation_rules(workspace_id, enabled, priority ASC);
CREATE INDEX IF NOT EXISTS idx_knowledge_workspace ON knowledge_items(workspace_id, active);
CREATE INDEX IF NOT EXISTS idx_slots_workspace_time ON slots(workspace_id, start_at ASC);
CREATE INDEX IF NOT EXISTS idx_usage_events_workspace_type ON usage_events(workspace_id, type, at);
