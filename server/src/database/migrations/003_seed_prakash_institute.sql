-- ==============================================================================
-- AutoMask Migration 003: Seed Plans and Baseline Tenant Data
-- ==============================================================================

-- 1. Insert SaaS Plans
INSERT INTO plans (id, name, price_inr, max_members, max_executions, max_ai_replies, max_templates)
VALUES 
  ('starter', 'Starter Plan', 499, 2, 1000, 300, 200),
  ('growth', 'Growth Plan', 999, 5, 3000, 1000, 500),
  ('pro', 'Pro Plan', 2499, 15, 20000, 50000, 15000)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Users
-- Default password: PrakashSecure2026!
INSERT INTO users (id, email, password_hash, full_name, phone, status, email_verified_at)
VALUES 
  ('10000000-0000-4000-8000-000000000001', 'dr.prakash@prakashinstitute.edu.in', '$2b$10$OGE71fBO7M2yxcxNNZ/VXekTvutW9wQzNlARs36v4xlL6qAECLuEm', 'Dr. Prakash Sharma', '+91 98111 00001', 'active', NOW()),
  ('10000000-0000-4000-8000-000000000002', 'sumit@prakashinstitute.edu.in', '$2b$10$OGE71fBO7M2yxcxNNZ/VXekTvutW9wQzNlARs36v4xlL6qAECLuEm', 'Sumit Bhardwaj', '+91 98111 00002', 'active', NOW()),
  ('10000000-0000-4000-8000-000000000003', 'priya.s@prakashinstitute.edu.in', '$2b$10$OGE71fBO7M2yxcxNNZ/VXekTvutW9wQzNlARs36v4xlL6qAECLuEm', 'Priya Sharma', '+91 98111 00003', 'active', NOW()),
  ('00000000-0000-4000-8000-000000000000', 'ops@automask.io', '$2b$10$OGE71fBO7M2yxcxNNZ/VXekTvutW9wQzNlARs36v4xlL6qAECLuEm', 'AutoMask Support Ops', '+91 80000 00000', 'active', NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Workspace: Prakash Institute
INSERT INTO workspaces (id, name, category, timezone, plan_id, plan_renew_at, status)
VALUES (
  '11111111-1111-4111-8111-111111111111',
  'Prakash Institute',
  'JEE & NEET Coaching',
  'Asia/Kolkata',
  'pro',
  NOW() + INTERVAL '30 days',
  'active'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Memberships for Prakash Institute
INSERT INTO workspace_members (workspace_id, user_id, role, status, is_online)
VALUES
  ('11111111-1111-4111-8111-111111111111', '10000000-0000-4000-8000-000000000001', 'owner', 'active', TRUE),
  ('11111111-1111-4111-8111-111111111111', '10000000-0000-4000-8000-000000000002', 'admin', 'active', TRUE),
  ('11111111-1111-4111-8111-111111111111', '10000000-0000-4000-8000-000000000003', 'agent', 'active', TRUE)
ON CONFLICT (workspace_id, user_id) DO NOTHING;

-- 5. WhatsApp Account for Prakash Institute
INSERT INTO whatsapp_accounts (workspace_id, waba_id, phone_number_id, display_number, status, quality_rating)
VALUES (
  '11111111-1111-4111-8111-111111111111',
  'waba-prakash-9821',
  'phone-id-01928',
  '+91 98112 34567',
  'CONNECTED',
  'GREEN'
)
ON CONFLICT (workspace_id) DO NOTHING;

-- 6. Knowledge Items (Grounded RAG)
INSERT INTO knowledge_items (workspace_id, type, title, content, fees, batches, active)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'course', 'JEE Main & Advanced 1-Year Dropper Batch', 'Comprehensive full-syllabus coaching for 12th passed students targeting JEE 2027.', '₹45,000 per year', 'Mon-Sat 9:00 AM - 1:30 PM', TRUE),
  ('11111111-1111-4111-8111-111111111111', 'course', 'NEET Medical Regular Classroom', 'Specialized medical entrance training covering NCERT line-by-line.', '₹55,000 per year', 'Daily 4:00 PM - 7:30 PM', TRUE),
  ('11111111-1111-4111-8111-111111111111', 'faq', 'Hostel and Mess Facilities', 'Tie-ups with vetted AC and non-AC hostels within 200m radius of campus.', '₹7,500 / month (including food & lodging)', 'Separate boys and girls hostels', TRUE)
ON CONFLICT DO NOTHING;

-- 7. Demo Booking Slots
INSERT INTO slots (workspace_id, title, start_at, end_at, capacity, booked_count, status)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'JEE Physics Demo - Mechanics Masterclass', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 1 hour', 25, 19, 'AVAILABLE'),
  ('11111111-1111-4111-8111-111111111111', 'NEET Biology Demo - Cell Biology & Genetics', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 1 hour', 30, 28, 'AVAILABLE')
ON CONFLICT DO NOTHING;
