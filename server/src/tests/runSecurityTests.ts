/**
 * Automated RBAC & Privacy Safeguard (SRS Line 615) Security Test Suite
 * Tests role permissions, deny-by-default, and time-boxed Owner support grants.
 */

import express from 'express';
import cookieParser from 'cookie-parser';
import { apiRouter } from '../routes/api';
import { mockStore } from '../models/mockStore';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1', apiRouter);

let server: any;
let BASE_URL = 'http://127.0.0.1:5000/api/v1';

async function startServer(): Promise<void> {
  return new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const port = (server.address() as any).port;
      BASE_URL = `http://127.0.0.1:${port}/api/v1`;
      resolve();
    });
  });
}

interface TestResult {
  name: string;
  passed: boolean;
  expectedStatus: number;
  actualStatus: number;
  details?: string;
}

const results: TestResult[] = [];

async function assertApi(
  name: string,
  method: string,
  endpoint: string,
  headers: Record<string, string>,
  body: any = null,
  expectedStatus: number,
  expectedBodyCheck?: (body: any) => boolean
) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    const statusMatch = res.status === expectedStatus;
    const bodyMatch = expectedBodyCheck ? expectedBodyCheck(data) : true;
    const passed = statusMatch && bodyMatch;

    results.push({
      name,
      passed,
      expectedStatus,
      actualStatus: res.status,
      details: passed ? 'PASSED' : `FAILED: ${JSON.stringify(data)}`,
    });

    const statusBadge = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${statusBadge} [${expectedStatus}] ${name}`);
    if (!passed) {
      console.error(`   Expected ${expectedStatus}, received ${res.status}. Body:`, data);
    }
  } catch (err: any) {
    results.push({
      name,
      passed: false,
      expectedStatus,
      actualStatus: 0,
      details: err?.message,
    });
    console.error(`❌ FAIL [Exception] ${name}:`, err?.message);
  }
}

async function runSecurityTestSuite() {
  await startServer();
  console.log('\n=============================================================');
  console.log('🔒 Starting AutoMask RBAC & SRS Line 615 Security Test Suite');
  console.log('=============================================================\n');

  // -------------------------------------------------------------
  // 1. AGENT ROLE TESTS (Least Privilege)
  // -------------------------------------------------------------
  console.log('--- 1. Testing Agent (Priya Sharma - usr-priya-02) ---');

  await assertApi(
    'Agent CANNOT access billing (Deny-by-default)',
    'GET',
    '/billing',
    { 'x-user-role': 'agent', 'x-user-id': 'usr-priya-02' },
    null,
    403
  );

  await assertApi(
    'Agent CANNOT toggle automation rules',
    'PATCH',
    '/automations/rule-01/toggle',
    { 'x-user-role': 'agent', 'x-user-id': 'usr-priya-02' },
    null,
    403
  );

  await assertApi(
    'Agent CANNOT create automation rules',
    'POST',
    '/automations',
    { 'x-user-role': 'agent', 'x-user-id': 'usr-priya-02' },
    { name: 'Unauthorized Rule', keywords: ['test'], replyMessage: 'hello' },
    403
  );

  await assertApi(
    'Agent CANNOT export student leads to CSV',
    'GET',
    '/leads/export',
    { 'x-user-role': 'agent', 'x-user-id': 'usr-priya-02' },
    null,
    403
  );

  await assertApi(
    'Agent CAN access shared inbox conversations',
    'GET',
    '/conversations',
    { 'x-user-role': 'agent', 'x-user-id': 'usr-priya-02' },
    null,
    200
  );

  await assertApi(
    'Agent CAN send message in conversation',
    'POST',
    '/conversations/conv-01/messages',
    { 'x-user-role': 'agent', 'x-user-id': 'usr-priya-02' },
    { body: 'Hello student, this is counsellor Priya.' },
    200
  );

  // -------------------------------------------------------------
  // 2. ADMIN ROLE TESTS (Sumit Bhardwaj - usr-sumit-01)
  // -------------------------------------------------------------
  console.log('\n--- 2. Testing Admin (Sumit Bhardwaj - usr-sumit-01) ---');

  await assertApi(
    'Admin CANNOT manage or view billing (Owner only per SRS Section 3)',
    'GET',
    '/billing',
    { 'x-user-role': 'admin', 'x-user-id': 'usr-sumit-01' },
    null,
    403
  );

  await assertApi(
    'Admin CAN toggle automation rules',
    'PATCH',
    '/automations/rule-01/toggle',
    { 'x-user-role': 'admin', 'x-user-id': 'usr-sumit-01' },
    null,
    200
  );

  await assertApi(
    'Admin CAN export student leads to CSV',
    'GET',
    '/leads/export',
    { 'x-user-role': 'admin', 'x-user-id': 'usr-sumit-01' },
    null,
    200
  );

  await assertApi(
    'Admin CANNOT issue support grants for Platform Admins (Owner only)',
    'POST',
    '/support-grants',
    { 'x-user-role': 'admin', 'x-user-id': 'usr-sumit-01' },
    { targetUserId: 'usr-platform-00', hoursValid: 2, reason: 'Admin attempt' },
    403
  );

  // -------------------------------------------------------------
  // 3. OWNER ROLE TESTS (Dr. Prakash Sharma - usr-owner-01)
  // -------------------------------------------------------------
  console.log('\n--- 3. Testing Workspace Owner (Dr. Prakash - usr-owner-01) ---');

  await assertApi(
    'Owner CAN view and manage billing & subscription',
    'GET',
    '/billing',
    { 'x-user-role': 'owner', 'x-user-id': 'usr-owner-01' },
    null,
    200
  );

  await assertApi(
    'Owner CAN view system audit logs',
    'GET',
    '/audit-logs',
    { 'x-user-role': 'owner', 'x-user-id': 'usr-owner-01' },
    null,
    200
  );

  // -------------------------------------------------------------
  // 4. CRITICAL PRIVACY SAFEGUARD (SRS LINE 615): PLATFORM ADMIN
  // -------------------------------------------------------------
  console.log('\n--- 4. Testing SRS Line 615 Privacy Safeguard (Platform Admin) ---');

  await assertApi(
    'Platform Admin WITHOUT support grant is BLOCKED from student message content',
    'GET',
    '/conversations/conv-01/messages',
    { 'x-user-role': 'platform_admin', 'x-user-id': 'usr-platform-00' },
    null,
    403,
    (body) => body.code === 'SRS_LINE_615_SUPPORT_GRANT_REQUIRED'
  );

  // Owner creates an active, time-boxed support grant (2 hours)
  console.log('\n>> Owner issuing 2-hour support grant to Platform Admin...');
  let grantId = '';
  await assertApi(
    'Owner CAN create time-boxed support grant for Platform Admin',
    'POST',
    '/support-grants',
    { 'x-user-role': 'owner', 'x-user-id': 'usr-owner-01' },
    {
      targetUserId: 'usr-platform-00',
      hoursValid: 2,
      reason: 'Diagnosing Meta webhook delivery error on conversation conv-01',
    },
    201,
    (body) => {
      grantId = body.grant?.id;
      return !!grantId && body.grant?.scope === 'read:message_content';
    }
  );

  // Platform Admin WITH valid active support grant CAN access message content
  await assertApi(
    'Platform Admin WITH active support grant CAN access message content',
    'GET',
    '/conversations/conv-01/messages',
    { 'x-user-role': 'platform_admin', 'x-user-id': 'usr-platform-00' },
    null,
    200,
    (body) => body.accessedViaSupportGrant === true
  );

  // Owner revokes the support grant
  console.log('\n>> Owner revoking the support grant...');
  await assertApi(
    'Owner CAN revoke the support grant at any time',
    'DELETE',
    `/support-grants/${grantId}`,
    { 'x-user-role': 'owner', 'x-user-id': 'usr-owner-01' },
    null,
    200
  );

  // Platform Admin with REVOKED grant is immediately BLOCKED again
  await assertApi(
    'Platform Admin with REVOKED grant is IMMEDIATELY BLOCKED (403)',
    'GET',
    '/conversations/conv-01/messages',
    { 'x-user-role': 'platform_admin', 'x-user-id': 'usr-platform-00' },
    null,
    403,
    (body) => body.code === 'SRS_LINE_615_SUPPORT_GRANT_REQUIRED'
  );

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  if (server) server.close();
  console.log('\n=============================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  console.log(`📊 Test Results: ${passed}/${total} PASSED (${failed} failed)`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTestSuite();
