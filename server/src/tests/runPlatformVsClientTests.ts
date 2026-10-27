import http from 'http';
import { AuthService } from '../modules/auth/authService';
import { mockStore } from '../models/mockStore';

// Test Configuration
const BASE_URL = 'http://localhost:5000/api/v1';

interface TestResult {
  name: string;
  passed: boolean;
  expectedStatus: number;
  actualStatus: number;
  details?: string;
}

const results: TestResult[] = [];

// Helper for making HTTP requests
function makeRequest(options: {
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: any;
}): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(options.path, 'http://localhost:5000');
    const req = http.request(
      url,
      {
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          let parsed: any = {};
          try {
            parsed = JSON.parse(rawData);
          } catch {
            parsed = { raw: rawData };
          }
          resolve({ status: res.statusCode || 500, body: parsed });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

function assertTest(
  name: string,
  actualStatus: number,
  expectedStatus: number,
  details?: string
) {
  const passed = actualStatus === expectedStatus;
  results.push({ name, passed, expectedStatus, actualStatus, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} [${actualStatus}] ${name}`);
  if (!passed) {
    console.error(`   Expected ${expectedStatus}, received ${actualStatus}. Details: ${details}`);
  }
}

export async function runPlatformVsClientTests() {
  console.log('\n==============================================================================');
  console.log('🛡️ AutoMask: Platform Management Console vs Client Workspace Automated Tests');
  console.log('==============================================================================\n');

  // Generate tokens for testing
  const platformAdminToken = AuthService.generateToken({
    userId: 'usr-platform-00',
    email: 'ops@automask.io',
    fullName: 'AutoMask Support Ops',
    role: 'platform_admin' as any,
    workspaceId: 'platform',
  });

  const platformSupportToken = AuthService.generateToken({
    userId: 'usr-platform-sup',
    email: 'support@automask.io',
    fullName: 'Rohan Verma (Support Ops)',
    role: 'platform_support' as any,
    workspaceId: 'platform',
  });

  const platformBillingToken = AuthService.generateToken({
    userId: 'usr-platform-bill',
    email: 'billing@automask.io',
    fullName: 'Meera Iyer (Billing Ops)',
    role: 'platform_billing' as any,
    workspaceId: 'platform',
  });

  const workspaceOwnerToken = AuthService.generateToken({
    userId: 'usr-owner-01',
    email: 'dr.prakash@prakashinstitute.edu.in',
    fullName: 'Dr. Prakash Sharma',
    role: 'owner' as any,
    workspaceId: '11111111-1111-4111-8111-111111111111',
  });

  const workspaceAdminToken = AuthService.generateToken({
    userId: 'usr-sumit-01',
    email: 'sumit@prakashinstitute.edu.in',
    fullName: 'Sumit Bhardwaj',
    role: 'admin' as any,
    workspaceId: '11111111-1111-4111-8111-111111111111',
  });

  const workspaceAgentToken = AuthService.generateToken({
    userId: 'usr-priya-02',
    email: 'priya.s@prakashinstitute.edu.in',
    fullName: 'Priya Sharma',
    role: 'agent' as any,
    workspaceId: '11111111-1111-4111-8111-111111111111',
  });

  // ============================================================================
  // 1. Platform Management Console Authorization Boundary
  // ============================================================================
  console.log('--- 1. Platform Management Console Authorization Boundary ---');

  // Test 1: Platform Admin CAN list all client tenants
  const t1 = await makeRequest({
    method: 'GET',
    path: '/api/v1/platform/tenants',
    headers: { Authorization: `Bearer ${platformAdminToken}` },
  });
  assertTest('Platform Admin CAN list all client tenants on /platform/tenants', t1.status, 200, JSON.stringify(t1.body));

  // Test 2: Platform Admin CAN inspect platform health & telemetry
  const t2 = await makeRequest({
    method: 'GET',
    path: '/api/v1/platform/health',
    headers: { Authorization: `Bearer ${platformAdminToken}` },
  });
  assertTest('Platform Admin CAN inspect platform health telemetry', t2.status, 200, JSON.stringify(t2.body));

  // Test 3: Platform Admin CAN list subscription plans
  const t3 = await makeRequest({
    method: 'GET',
    path: '/api/v1/platform/plans',
    headers: { Authorization: `Bearer ${platformAdminToken}` },
  });
  assertTest('Platform Admin CAN view global platform subscription plans', t3.status, 200, JSON.stringify(t3.body));

  // Test 4: Platform Admin CAN view global platform audit logs
  const t4 = await makeRequest({
    method: 'GET',
    path: '/api/v1/platform/audit-logs',
    headers: { Authorization: `Bearer ${platformAdminToken}` },
  });
  assertTest('Platform Admin CAN view global platform audit logs', t4.status, 200, JSON.stringify(t4.body));

  // ============================================================================
  // 2. Privilege Escalation Prevention (Workspace Users Blocked from Platform APIs)
  // ============================================================================
  console.log('\n--- 2. Privilege Escalation: Workspace Users Strictly Blocked from Platform Ops ---');

  // Test 5: Workspace Owner CANNOT access platform console endpoints
  const t5 = await makeRequest({
    method: 'GET',
    path: '/api/v1/platform/tenants',
    headers: { Authorization: `Bearer ${workspaceOwnerToken}` },
  });
  assertTest('[403] Workspace Owner CANNOT access platform tenant list (PLATFORM_ACCESS_DENIED)', t5.status, 403, t5.body?.code);

  // Test 6: Workspace Admin CANNOT access platform console endpoints
  const t6 = await makeRequest({
    method: 'GET',
    path: '/api/v1/platform/tenants',
    headers: { Authorization: `Bearer ${workspaceAdminToken}` },
  });
  assertTest('[403] Workspace Admin CANNOT access platform tenant list (PLATFORM_ACCESS_DENIED)', t6.status, 403, t6.body?.code);

  // Test 7: Workspace Agent CANNOT access platform console endpoints
  const t7 = await makeRequest({
    method: 'GET',
    path: '/api/v1/platform/tenants',
    headers: { Authorization: `Bearer ${workspaceAgentToken}` },
  });
  assertTest('[403] Workspace Agent CANNOT access platform tenant list (PLATFORM_ACCESS_DENIED)', t7.status, 403, t7.body?.code);

  // Test 8: Workspace Admin CANNOT view or edit platform plans
  const t8 = await makeRequest({
    method: 'GET',
    path: '/api/v1/platform/plans',
    headers: { Authorization: `Bearer ${workspaceAdminToken}` },
  });
  assertTest('[403] Workspace Admin CANNOT view platform plans catalog (PLATFORM_ACCESS_DENIED)', t8.status, 403, t8.body?.code);

  // Test 9: Workspace Admin CANNOT view platform audit logs
  const t9 = await makeRequest({
    method: 'GET',
    path: '/api/v1/platform/audit-logs',
    headers: { Authorization: `Bearer ${workspaceAdminToken}` },
  });
  assertTest('[403] Workspace Admin CANNOT view global platform audit logs (PLATFORM_ACCESS_DENIED)', t9.status, 403, t9.body?.code);

  // ============================================================================
  // 3. Billing Boundaries: Workspace Admin vs Owner Restrictions
  // ============================================================================
  console.log('\n--- 3. Workspace Billing Boundaries: Client Admin Blocked from Billing Management ---');

  // Test 10: Workspace Admin CANNOT access workspace billing
  const t10 = await makeRequest({
    method: 'GET',
    path: '/api/v1/billing',
    headers: { Authorization: `Bearer ${workspaceAdminToken}` },
  });
  assertTest('[403] Workspace Admin CANNOT view workspace billing details (SRS Section 3)', t10.status, 403, t10.body?.message);

  // Test 11: Workspace Admin CANNOT upgrade workspace plan
  const t11 = await makeRequest({
    method: 'POST',
    path: '/api/v1/billing/upgrade',
    headers: { Authorization: `Bearer ${workspaceAdminToken}` },
    body: { targetPlanId: 'pro' },
  });
  assertTest('[403] Workspace Admin CANNOT upgrade workspace subscription plan', t11.status, 403, t11.body?.message);

  // Test 12: Workspace Owner CAN view billing
  const t12 = await makeRequest({
    method: 'GET',
    path: '/api/v1/billing',
    headers: { Authorization: `Bearer ${workspaceOwnerToken}` },
  });
  assertTest('[200] Workspace Owner CAN view and manage workspace billing', t12.status, 200, t12.body?.planName);

  // ============================================================================
  // 4. SRS Line 615 Privacy Safeguard: Customer Message Content Disabled by Default
  // ============================================================================
  console.log('\n--- 4. SRS Line 615 Privacy Safeguard: Platform Personnel Access Controls ---');

  // Test 13: Platform Admin WITHOUT support grant is BLOCKED from customer message text
  const t13 = await makeRequest({
    method: 'GET',
    path: '/api/v1/conversations/conv-01/messages',
    headers: { 
      Authorization: `Bearer ${platformAdminToken}`,
      'x-workspace-id': '11111111-1111-4111-8111-111111111111',
    },
  });
  assertTest('[403] Platform Admin WITHOUT support grant is BLOCKED from student message text (SRS Line 615)', t13.status, 403, t13.body?.code);

  // Test 14: Owner creates a 2-hour support grant for Platform Admin
  const t14 = await makeRequest({
    method: 'POST',
    path: '/api/v1/support-grants',
    headers: { Authorization: `Bearer ${workspaceOwnerToken}` },
    body: {
      targetUserId: 'usr-platform-00',
      hoursValid: 2,
      reason: 'Diagnosing webhook latency issue reported by counsellor',
    },
  });
  assertTest('[201] Workspace Owner CAN issue time-boxed support grant to Platform Admin', t14.status, 201, t14.body?.grant?.id);

  const grantId = t14.body?.grant?.id;

  // Test 15: Platform Admin WITH active support grant CAN access message content
  const t15 = await makeRequest({
    method: 'GET',
    path: '/api/v1/conversations/conv-01/messages',
    headers: { 
      Authorization: `Bearer ${platformAdminToken}`,
      'x-workspace-id': '11111111-1111-4111-8111-111111111111',
    },
  });
  assertTest('[200] Platform Admin WITH active Owner support grant CAN access message content', t15.status, 200, `Accessed via grant: ${t15.body?.accessedViaSupportGrant}`);

  // Test 16: Owner revokes support grant
  const t16 = await makeRequest({
    method: 'DELETE',
    path: `/api/v1/support-grants/${grantId}`,
    headers: { Authorization: `Bearer ${workspaceOwnerToken}` },
  });
  assertTest('[200] Workspace Owner CAN revoke support grant at any time', t16.status, 200, t16.body?.grant?.revokedAt);

  // Test 17: Platform Admin with revoked grant is IMMEDIATELY BLOCKED
  const t17 = await makeRequest({
    method: 'GET',
    path: '/api/v1/conversations/conv-01/messages',
    headers: { 
      Authorization: `Bearer ${platformAdminToken}`,
      'x-workspace-id': '11111111-1111-4111-8111-111111111111',
    },
  });
  assertTest('[403] Platform Admin with REVOKED grant is IMMEDIATELY BLOCKED (403)', t17.status, 403, t17.body?.code);

  // ============================================================================
  // 5. Controlled Tenant Account Suspension Lifecycle
  // ============================================================================
  console.log('\n--- 5. Controlled Tenant Suspension Lifecycle ---');

  // Test 18: Platform Admin suspends tenant workspace with mandatory justification
  const t18 = await makeRequest({
    method: 'PATCH',
    path: '/api/v1/platform/tenants/11111111-1111-4111-8111-111111111111/status',
    headers: { Authorization: `Bearer ${platformAdminToken}` },
    body: {
      status: 'SUSPENDED',
      reason: 'Automated policy violation: Unverified high-volume broadcast detected.',
    },
  });
  assertTest('[200] Platform Admin CAN suspend client workspace with audited reason', t18.status, 200, t18.body?.message);

  // Test 19: Suspended tenant's Workspace Admin is IMMEDIATELY BLOCKED from all API actions
  const t19 = await makeRequest({
    method: 'GET',
    path: '/api/v1/conversations',
    headers: { Authorization: `Bearer ${workspaceAdminToken}` },
  });
  assertTest('[403] Suspended tenant members are IMMEDIATELY BLOCKED (TENANT_SUSPENDED)', t19.status, 403, t19.body?.code);

  // Test 20: Platform Admin reactivates tenant workspace
  const t20 = await makeRequest({
    method: 'PATCH',
    path: '/api/v1/platform/tenants/11111111-1111-4111-8111-111111111111/status',
    headers: { Authorization: `Bearer ${platformAdminToken}` },
    body: { status: 'ACTIVE' },
  });
  assertTest('[200] Platform Admin CAN reactivate suspended tenant workspace', t20.status, 200, t20.body?.message);

  // Test 21: Reactivated tenant members regain full access
  const t21 = await makeRequest({
    method: 'GET',
    path: '/api/v1/conversations',
    headers: { Authorization: `Bearer ${workspaceAdminToken}` },
  });
  assertTest('[200] Reactivated tenant members regain access to conversations', t21.status, 200, `Found ${t21.body?.conversations?.length} conversations`);

  // ============================================================================
  // 6. Internal Platform Staff Role Segregation
  // ============================================================================
  console.log('\n--- 6. Internal Platform Staff Role Segregation (Support vs Billing Ops) ---');

  // Test 22: Support Ops CAN view platform health telemetry
  const t22 = await makeRequest({
    method: 'GET',
    path: '/api/v1/platform/health',
    headers: { Authorization: `Bearer ${platformSupportToken}` },
  });
  assertTest('[200] Platform Support Ops CAN view infrastructure health telemetry', t22.status, 200, t22.body?.telemetry?.status);

  // Test 23: Support Ops CANNOT update subscription plan pricing
  const t23 = await makeRequest({
    method: 'PUT',
    path: '/api/v1/platform/plans/pro',
    headers: { Authorization: `Bearer ${platformSupportToken}` },
    body: { priceInr: 12999 },
  });
  assertTest('[403] Platform Support Ops CANNOT modify subscription plan pricing (PLATFORM_PERMISSION_DENIED)', t23.status, 403, t23.body?.code);

  // Test 24: Billing Ops CAN update subscription plan pricing
  const t24 = await makeRequest({
    method: 'PUT',
    path: '/api/v1/platform/plans/pro',
    headers: { Authorization: `Bearer ${platformBillingToken}` },
    body: { priceInr: 14999, maxExecutions: 26000 },
  });
  assertTest('[200] Platform Billing Ops CAN administer plan quotas and pricing', t24.status, 200, t24.body?.plan?.name);

  // Test 25: Billing Ops CANNOT suspend a client workspace
  const t25 = await makeRequest({
    method: 'PATCH',
    path: '/api/v1/platform/tenants/22222222-2222-4222-8222-222222222222/status',
    headers: { Authorization: `Bearer ${platformBillingToken}` },
    body: { status: 'SUSPENDED', reason: 'Unpaid invoice' },
  });
  assertTest('[403] Platform Billing Ops CANNOT suspend tenants (Platform Super Admin only)', t25.status, 403, t25.body?.code);

  // Summary
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log('\n==============================================================================');
  console.log(`📊 Test Results: ${passedCount}/${results.length} PASSED (${failedCount} failed)`);
  console.log('==============================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runPlatformVsClientTests().catch((err) => {
    console.error('Fatal Test Runner Error:', err);
    process.exit(1);
  });
}
