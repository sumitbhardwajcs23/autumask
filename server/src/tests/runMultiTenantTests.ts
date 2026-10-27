/**
 * Automated Multi-Tenant Security & Isolation Test Suite
 * Step 7: Multi-tenant security tests for AutoMask SaaS Platform
 * 
 * Tests real database-level tenant isolation, PostgreSQL RLS policies,
 * cryptographic session verification, connection-pool context isolation,
 * and Meta webhook workspace resolution.
 */

import { Pool, PoolClient } from 'pg';
import { AuthService } from '../modules/auth/authService';

// Admin connection for seeding and database maintenance
const ADMIN_DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5433'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: 'automask_test',
};

// Application connection role: NOSUPERUSER, NOBYPASSRLS (Production-grade least privilege)
const APP_DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5433'),
  user: 'automask_app',
  password: 'automask_app_secure_pass',
  database: 'automask_test',
};

const BASE_URL = 'http://localhost:5000/api/v1';

// Tenant A: Prakash Institute
const TENANT_A_ID = '11111111-1111-4111-8111-111111111111';
const TENANT_A_OWNER_ID = '10000000-0000-4000-8000-000000000001';
const TENANT_A_AGENT_ID = '10000000-0000-4000-8000-000000000003';
const TENANT_A_PHONE_ID = 'phone-id-01928';

// Tenant B: Apex Academy
const TENANT_B_ID = '22222222-2222-4222-8222-222222222222';
const TENANT_B_OWNER_ID = '20000000-0000-4000-8000-000000000001';
const TENANT_B_AGENT_ID = '20000000-0000-4000-8000-000000000002';
const TENANT_B_PHONE_ID = 'phone-id-09876';

// Test record IDs
const TENANT_A_LEAD_ID = '11111111-1000-4000-8000-000000000001';
const TENANT_B_LEAD_ID = '22222222-1000-4000-8000-000000000001';
const TENANT_A_CONV_ID = '11111111-cc00-4000-8000-000000000001';
const TENANT_B_CONV_ID = '22222222-cc00-4000-8000-000000000001';

interface TestResult {
  id: number;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function recordResult(id: number, name: string, passed: boolean, details?: string) {
  results.push({ id, name, passed, details });
  const badge = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${badge} [Scenario ${id}] ${name}`);
  if (!passed && details) {
    console.error(`   Details: ${details}`);
  }
}

async function seedTestTenants(adminPool: Pool) {
  console.log('🌱 Seeding multi-tenant test data for Prakash Institute & Apex Academy...');

  // 1. Ensure Tenant B (Apex Academy) Workspace exists
  await adminPool.query(`
    INSERT INTO workspaces (id, name, category, timezone, plan_id, status)
    VALUES ($1, 'Apex Academy', 'UPSC & State PSC Coaching', 'Asia/Kolkata', 'pro', 'active')
    ON CONFLICT (id) DO NOTHING;
  `, [TENANT_B_ID]);

  // 2. Ensure Tenant B Users exist
  const passwordHash = await AuthService.hashPassword('ApexSecure2026!');
  await adminPool.query(`
    INSERT INTO users (id, email, password_hash, full_name, phone, status, email_verified_at)
    VALUES 
      ($1, 'director@apexacademy.in', $2, 'Vikram Malhotra', '+91 98222 00001', 'active', NOW()),
      ($3, 'rahul@apexacademy.in', $2, 'Rahul Varma', '+91 98222 00002', 'active', NOW())
    ON CONFLICT (id) DO NOTHING;
  `, [TENANT_B_OWNER_ID, passwordHash, TENANT_B_AGENT_ID]);

  // 3. Memberships for Apex Academy
  await adminPool.query(`
    INSERT INTO workspace_members (workspace_id, user_id, role, status, is_online)
    VALUES
      ($1, $2, 'owner', 'active', TRUE),
      ($1, $3, 'agent', 'active', TRUE)
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
  `, [TENANT_B_ID, TENANT_B_OWNER_ID, TENANT_B_AGENT_ID]);

  // 4. WhatsApp Accounts in automask_test
  await adminPool.query(`
    INSERT INTO whatsapp_accounts (workspace_id, waba_id, phone_number_id, display_number, status, quality_rating)
    VALUES 
      ($1, 'waba-apex-4455', $2, '+91 98222 54321', 'CONNECTED', 'GREEN')
    ON CONFLICT (workspace_id) DO UPDATE SET phone_number_id = $2;
  `, [TENANT_B_ID, TENANT_B_PHONE_ID]);

  // Also ensure accounts in automask_dev for server-side resolution
  const devPool = new Pool({ ...ADMIN_DB_CONFIG, database: 'automask_dev' });
  try {
    await devPool.query(
      `INSERT INTO workspaces (id, name, plan_id, status) VALUES ($1, 'Apex Academy', 'pro', 'active') ON CONFLICT (id) DO NOTHING;`,
      [TENANT_B_ID]
    );
    await devPool.query(
      `INSERT INTO whatsapp_accounts (workspace_id, waba_id, phone_number_id, display_number, status)
       VALUES ($1, 'waba-apex-4455', $2, '+91 98222 54321', 'CONNECTED')
       ON CONFLICT (workspace_id) DO UPDATE SET phone_number_id = $2;`,
      [TENANT_B_ID, TENANT_B_PHONE_ID]
    );
  } catch (e) {
    // Non-fatal if dev DB sync encounters conflict
  } finally {
    await devPool.end();
  }

  // 5. Contacts & Conversations
  await adminPool.query(`
    INSERT INTO contacts (id, workspace_id, phone_e164, name)
    VALUES 
      ('11111111-c000-4000-8000-000000000001', $1, '+919811111111', 'Aarav Patel (Prakash)'),
      ('22222222-c000-4000-8000-000000000001', $2, '+919822222222', 'Rohan Verma (Apex)')
    ON CONFLICT (id) DO NOTHING;
  `, [TENANT_A_ID, TENANT_B_ID]);

  await adminPool.query(`
    INSERT INTO conversations (id, workspace_id, contact_id, status)
    VALUES 
      ($1, $2, '11111111-c000-4000-8000-000000000001', 'OPEN'),
      ($3, $4, '22222222-c000-4000-8000-000000000001', 'OPEN')
    ON CONFLICT (id) DO NOTHING;
  `, [TENANT_A_CONV_ID, TENANT_A_ID, TENANT_B_CONV_ID, TENANT_B_ID]);

  // 6. Leads
  await adminPool.query(`
    INSERT INTO leads (id, workspace_id, contact_id, course, status, notes)
    VALUES 
      ($1, $2, '11111111-c000-4000-8000-000000000001', 'JEE Dropper Batch', 'NEW', 'Prakash lead notes'),
      ($3, $4, '22222222-c000-4000-8000-000000000001', 'UPSC Prelims + Mains', 'DEMO_BOOKED', 'Apex lead notes')
    ON CONFLICT (id) DO NOTHING;
  `, [TENANT_A_LEAD_ID, TENANT_A_ID, TENANT_B_LEAD_ID, TENANT_B_ID]);

  // 7. Knowledge Items
  await adminPool.query(`
    INSERT INTO knowledge_items (id, workspace_id, type, title, content)
    VALUES
      ('11111111-a000-4000-8000-000000000001', $1, 'course', 'Prakash JEE Dropper', 'Full syllabus coaching for JEE 2027'),
      ('22222222-a000-4000-8000-000000000001', $2, 'course', 'Apex UPSC Foundation', 'Comprehensive coaching for Civil Services 2027')
    ON CONFLICT (id) DO NOTHING;
  `, [TENANT_A_ID, TENANT_B_ID]);

  console.log('✅ Multi-tenant test data initialized.\n');
}

/**
 * Execute query inside tenant-scoped transaction using application role
 */
async function withTenant<T>(appPool: Pool, workspaceId: string, fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await appPool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.current_workspace_id', $1, true)", [workspaceId]);
    const res = await fn(client);
    await client.query('COMMIT');
    return res;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function runMultiTenantTestSuite() {
  console.log('========================================================================');
  console.log('🛡️ AutoMask Multi-Tenant Security & PostgreSQL RLS Test Suite');
  console.log('   Tenant A: Prakash Institute (ID: ' + TENANT_A_ID + ')');
  console.log('   Tenant B: Apex Academy      (ID: ' + TENANT_B_ID + ')');
  console.log('   Application Role: automask_app (NOSUPERUSER, NOBYPASSRLS)');
  console.log('========================================================================\n');

  const adminPool = new Pool(ADMIN_DB_CONFIG);
  const appPool = new Pool(APP_DB_CONFIG);

  try {
    await seedTestTenants(adminPool);

    // Cryptographic JWT tokens for API testing
    const tenantAOwnerToken = AuthService.generateToken({
      userId: TENANT_A_OWNER_ID,
      workspaceId: TENANT_A_ID,
      role: 'owner',
      email: 'dr.prakash@prakashinstitute.edu.in',
      fullName: 'Dr. Prakash Sharma',
    });

    const tenantAAgentToken = AuthService.generateToken({
      userId: TENANT_A_AGENT_ID,
      workspaceId: TENANT_A_ID,
      role: 'agent',
      email: 'priya.s@prakashinstitute.edu.in',
      fullName: 'Priya Sharma',
    });

    const platformAdminToken = AuthService.generateToken({
      userId: '00000000-0000-4000-8000-000000000000',
      workspaceId: TENANT_A_ID,
      role: 'platform_admin',
      email: 'ops@automask.io',
      fullName: 'AutoMask Support Ops',
    });

    // -------------------------------------------------------------------------
    // Test 1: Tenant A can read its own authorized records
    // -------------------------------------------------------------------------
    try {
      const records = await withTenant(appPool, TENANT_A_ID, async (client) => {
        const leadRes = await client.query('SELECT id, course FROM leads WHERE id = $1', [TENANT_A_LEAD_ID]);
        const convRes = await client.query('SELECT id FROM conversations WHERE id = $1', [TENANT_A_CONV_ID]);
        return { leads: leadRes.rows, convs: convRes.rows };
      });

      const passed = records.leads.length === 1 && records.convs.length === 1;
      recordResult(1, 'Tenant A can read its own authorized records', passed);
    } catch (err: any) {
      recordResult(1, 'Tenant A can read its own authorized records', false, err.message);
    }

    // -------------------------------------------------------------------------
    // Test 2: Tenant A cannot read Tenant B records by changing IDs
    // -------------------------------------------------------------------------
    try {
      const records = await withTenant(appPool, TENANT_A_ID, async (client) => {
        const leadRes = await client.query('SELECT id FROM leads WHERE id = $1', [TENANT_B_LEAD_ID]);
        const convRes = await client.query('SELECT id FROM conversations WHERE id = $1', [TENANT_B_CONV_ID]);
        return { leads: leadRes.rows, convs: convRes.rows };
      });

      // RLS must hide Tenant B records completely (0 rows returned)
      const passed = records.leads.length === 0 && records.convs.length === 0;
      recordResult(2, "Tenant A cannot read Tenant B's records by changing IDs (RLS 0 rows)", passed);
    } catch (err: any) {
      recordResult(2, "Tenant A cannot read Tenant B's records by changing IDs", false, err.message);
    }

    // -------------------------------------------------------------------------
    // Test 3: Tenant A cannot modify or delete Tenant B records
    // -------------------------------------------------------------------------
    try {
      const mutationResults = await withTenant(appPool, TENANT_A_ID, async (client) => {
        const updateRes = await client.query(
          "UPDATE leads SET notes = 'HACKED' WHERE id = $1",
          [TENANT_B_LEAD_ID]
        );
        const deleteRes = await client.query(
          'DELETE FROM leads WHERE id = $1',
          [TENANT_B_LEAD_ID]
        );
        return { updated: updateRes.rowCount, deleted: deleteRes.rowCount };
      });

      // RLS must prevent updates and deletes: rowCount must be 0
      const passed = mutationResults.updated === 0 && mutationResults.deleted === 0;
      recordResult(3, "Tenant A cannot modify or delete Tenant B's records (0 rows affected)", passed);
    } catch (err: any) {
      recordResult(3, "Tenant A cannot modify or delete Tenant B's records", false, err.message);
    }

    // -------------------------------------------------------------------------
    // Test 4: Cross-tenant inserts and relationships are rejected
    // -------------------------------------------------------------------------
    try {
      let rejected = false;
      await withTenant(appPool, TENANT_A_ID, async (client) => {
        try {
          // Attempt cross-tenant insert (inserting Tenant B workspace_id while context is Tenant A)
          await client.query(
            "INSERT INTO contacts (workspace_id, phone_e164, name) VALUES ($1, '+919999900000', 'Infiltrator')",
            [TENANT_B_ID]
          );
        } catch (err: any) {
          // PostgreSQL RLS WITH CHECK violation produces error code 42501 (insufficient_privilege)
          rejected = err.code === '42501' || err.message.includes('row-level security');
        }
      });

      recordResult(4, 'Cross-tenant inserts and relationships are rejected by RLS WITH CHECK policy', rejected);
    } catch (err: any) {
      recordResult(4, 'Cross-tenant inserts and relationships are rejected', false, err.message);
    }

    // -------------------------------------------------------------------------
    // Test 5: Missing workspace context fails closed
    // -------------------------------------------------------------------------
    try {
      // Connect without setting tenant context (app.current_workspace_id is NULL)
      const client = await appPool.connect();
      try {
        const leadRes = await client.query('SELECT COUNT(*) as cnt FROM leads;');
        const convRes = await client.query('SELECT COUNT(*) as cnt FROM conversations;');
        const knwRes = await client.query('SELECT COUNT(*) as cnt FROM knowledge_items;');

        // Without tenant context, FORCE ROW LEVEL SECURITY ensures 0 rows are visible
        const leadCnt = parseInt(leadRes.rows[0].cnt);
        const convCnt = parseInt(convRes.rows[0].cnt);
        const knwCnt = parseInt(knwRes.rows[0].cnt);

        const passed = leadCnt === 0 && convCnt === 0 && knwCnt === 0;
        recordResult(5, 'Missing workspace context fails closed (0 rows returned across tenant tables)', passed);
      } finally {
        client.release();
      }
    } catch (err: any) {
      recordResult(5, 'Missing workspace context fails closed', false, err.message);
    }

    // -------------------------------------------------------------------------
    // Test 6: Untrusted workspace headers cannot override authenticated identity
    // -------------------------------------------------------------------------
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tenantAOwnerToken}`,
          'x-workspace-id': TENANT_B_ID, // Spoofed header targeting Tenant B
        },
      });

      const data = (await res.json()) as any;
      // Server must lock workspace to token payload (Tenant A) and ignore x-workspace-id
      const passed = res.status === 200 && data.workspace?.id === TENANT_A_ID;
      recordResult(6, 'Untrusted workspace headers cannot override authenticated identity', passed, `Resolved workspace: ${data.workspace?.id}`);
    } catch (err: any) {
      recordResult(6, 'Untrusted workspace headers cannot override authenticated identity', false, err.message);
    }

    // -------------------------------------------------------------------------
    // Test 7: Unauthenticated requests cannot access protected endpoints
    // -------------------------------------------------------------------------
    try {
      // Test invalid token
      const res = await fetch(`${BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid.cryptographic.jwt.token',
        },
      });

      const passed = res.status === 401;
      recordResult(7, 'Unauthenticated or invalid token requests cannot access protected endpoints (401)', passed);
    } catch (err: any) {
      recordResult(7, 'Unauthenticated requests cannot access protected endpoints', false, err.message);
    }

    // -------------------------------------------------------------------------
    // Test 8: Unauthorized roles cannot perform privileged actions
    // -------------------------------------------------------------------------
    try {
      // Agent attempting to access billing
      const res = await fetch(`${BASE_URL}/billing`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tenantAAgentToken}`,
        },
      });

      const passed = res.status === 403;
      recordResult(8, 'Unauthorized roles cannot perform privileged actions (Agent 403 on billing)', passed);
    } catch (err: any) {
      recordResult(8, 'Unauthorized roles cannot perform privileged actions', false, err.message);
    }

    // -------------------------------------------------------------------------
    // Test 9: A reused database connection cannot leak a previous workspace context
    // -------------------------------------------------------------------------
    try {
      const client = await appPool.connect();
      try {
        // Step A: Set context to Tenant A inside transaction, then COMMIT
        await client.query('BEGIN');
        await client.query("SELECT set_config('app.current_workspace_id', $1, true)", [TENANT_A_ID]);
        const inTx = await client.query("SELECT current_setting('app.current_workspace_id', true) as val;");
        await client.query('COMMIT');

        // Step B: Query context on the exact SAME client outside transaction
        const postTx = await client.query("SELECT current_setting('app.current_workspace_id', true) as val;");
        const ctxLeaked = postTx.rows[0].val !== '' && postTx.rows[0].val !== null;

        // Step C: Verify RLS query fails closed on the reused connection
        const leakCheck = await client.query('SELECT COUNT(*) as cnt FROM leads;');
        const leakedRows = parseInt(leakCheck.rows[0].cnt);

        const passed = inTx.rows[0].val === TENANT_A_ID && !ctxLeaked && leakedRows === 0;
        recordResult(9, 'Reused database connection cannot leak previous workspace context (auto-cleared on COMMIT)', passed);
      } finally {
        client.release();
      }
    } catch (err: any) {
      recordResult(9, 'Reused database connection cannot leak workspace context', false, err.message);
    }

    // -------------------------------------------------------------------------
    // Test 10: RLS blocks cross-tenant access independently of API filters
    // -------------------------------------------------------------------------
    try {
      // Execute naked SELECT * FROM leads (NO WHERE clause!)
      const tenantALeads = await withTenant(appPool, TENANT_A_ID, async (client) => {
        const res = await client.query('SELECT id, workspace_id, course FROM leads;');
        return res.rows;
      });

      const tenantBLeads = await withTenant(appPool, TENANT_B_ID, async (client) => {
        const res = await client.query('SELECT id, workspace_id, course FROM leads;');
        return res.rows;
      });

      const allAHaveWsA = tenantALeads.every(r => r.workspace_id === TENANT_A_ID);
      const allBHaveWsB = tenantBLeads.every(r => r.workspace_id === TENANT_B_ID);
      const crossLeakAtoB = tenantALeads.some(r => r.workspace_id === TENANT_B_ID);
      const crossLeakBtoA = tenantBLeads.some(r => r.workspace_id === TENANT_A_ID);

      const passed = allAHaveWsA && allBHaveWsB && !crossLeakAtoB && !crossLeakBtoA && tenantALeads.length > 0 && tenantBLeads.length > 0;
      recordResult(10, 'RLS blocks cross-tenant access independently of API filters (naked SELECT isolation)', passed);
    } catch (err: any) {
      recordResult(10, 'RLS blocks cross-tenant access independently of API filters', false, err.message);
    }

    // -------------------------------------------------------------------------
    // Test 11: Webhook workspace resolution uses trusted account mappings
    // -------------------------------------------------------------------------
    try {
      const mappingA = await AuthService.resolveWorkspaceFromPhoneNumberId(TENANT_A_PHONE_ID);
      const mappingB = await AuthService.resolveWorkspaceFromPhoneNumberId(TENANT_B_PHONE_ID);
      const mappingUnknown = await AuthService.resolveWorkspaceFromPhoneNumberId('unmapped-phone-999');

      const passed = 
        mappingA?.workspaceId === TENANT_A_ID &&
        mappingB?.workspaceId === TENANT_B_ID &&
        mappingUnknown === null;

      recordResult(11, 'Webhook workspace resolution uses trusted database records (rejects unmapped accounts)', passed);
    } catch (err: any) {
      recordResult(11, 'Webhook workspace resolution uses trusted account mappings', false, err.message);
    }

    // -------------------------------------------------------------------------
    // Test 12: Existing support-grant restrictions remain enforced (SRS Line 615)
    // -------------------------------------------------------------------------
    try {
      // Step A: Platform Admin without grant -> BLOCKED (403)
      const resBlocked = await fetch(`${BASE_URL}/conversations/conv-01/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${platformAdminToken}`,
        },
      });

      // Step B: Owner creates 2-hour support grant
      const resCreateGrant = await fetch(`${BASE_URL}/support-grants`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tenantAOwnerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: '00000000-0000-4000-8000-000000000000',
          scope: 'read:message_content',
          durationMinutes: 120,
          reason: 'Diagnosing tenant isolation test support workflow',
        }),
      });
      const grantData = (await resCreateGrant.json()) as any;

      // Step C: Platform Admin with active grant -> ALLOWED (200)
      const resAllowed = await fetch(`${BASE_URL}/conversations/conv-01/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${platformAdminToken}`,
        },
      });

      // Step D: Revoke grant -> immediately BLOCKED (403)
      await fetch(`${BASE_URL}/support-grants/${grantData.grant.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tenantAOwnerToken}`,
        },
      });

      const resRevoked = await fetch(`${BASE_URL}/conversations/conv-01/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${platformAdminToken}`,
        },
      });

      const passed = resBlocked.status === 403 && resAllowed.status === 200 && resRevoked.status === 403;
      recordResult(12, 'SRS Line 615 support-grant privacy restrictions remain strictly enforced for Platform Admins', passed);
    } catch (err: any) {
      recordResult(12, 'Existing support-grant restrictions remain enforced', false, err.message);
    }

    // -------------------------------------------------------------------------
    // SUMMARY REPORT
    // -------------------------------------------------------------------------
    console.log('\n========================================================================');
    const passedCount = results.filter(r => r.passed).length;
    console.log(`📊 Multi-Tenant Security Results: ${passedCount}/${results.length} PASSED (${results.length - passedCount} failed)`);
    console.log('========================================================================\n');

    await adminPool.end();
    await appPool.end();

    if (passedCount !== results.length) {
      process.exit(1);
    }
    process.exit(0);
  } catch (err: any) {
    console.error('Fatal Test Suite Error:', err);
    await adminPool.end();
    await appPool.end();
    process.exit(1);
  }
}

runMultiTenantTestSuite();
