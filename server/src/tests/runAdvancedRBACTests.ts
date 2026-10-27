/**
 * AutoMask Advanced RBAC, Workflows, Templates & Broadcasts Test Suite
 * Validates granular permissions, custom roles, explicit user overrides (grant vs deny),
 * resource scoping (assigned_only), graph validation, and bulk broadcast controls.
 */

const BASE_URL = 'http://localhost:5000/api/v1';

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
      details: passed ? 'PASSED' : `FAILED: Status ${res.status} vs ${expectedStatus}, Data: ${JSON.stringify(data)}`,
    });

    const statusBadge = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${statusBadge} [${expectedStatus}] ${name}`);
    if (!passed) {
      console.log(`   -> Error Details: ${JSON.stringify(data)}`);
    }
  } catch (err: any) {
    results.push({
      name,
      passed: false,
      expectedStatus,
      actualStatus: 0,
      details: `Exception: ${err.message}`,
    });
    console.log(`❌ FAIL [${expectedStatus}] ${name} (Exception: ${err.message})`);
  }
}

async function runAdvancedRBACSuite() {
  console.log('\n========================================================================');
  console.log('🛡️ AutoMask Advanced RBAC, Workflows & Broadcasts Automated Test Suite');
  console.log('========================================================================\n');

  const agentId = 'usr-priya-02';
  const adminId = 'usr-sumit-01';
  const ownerId = 'usr-owner-01';

  // -------------------------------------------------------------
  // 1. GRANULAR ACCESS CONTROL & LEAST PRIVILEGE
  // -------------------------------------------------------------
  console.log('--- 1. Granular Access Control & Privilege Boundaries ---');

  await assertApi(
    'Worker with messaging permission CANNOT edit integrations (403)',
    'POST',
    '/integrations/connect',
    { 'x-user-role': 'agent', 'x-user-id': agentId },
    { provider: 'meta' },
    403
  );

  await assertApi(
    'Worker CANNOT create broadcast campaigns without broadcasts.create permission (403)',
    'POST',
    '/broadcasts/campaigns',
    { 'x-user-role': 'agent', 'x-user-id': agentId },
    { name: 'Unauthorized Campaign', templateName: 'demo_reminder_physics' },
    403
  );

  await assertApi(
    'Worker CANNOT create custom roles without roles.create permission (403)',
    'POST',
    '/roles',
    { 'x-user-role': 'agent', 'x-user-id': agentId },
    { name: 'Rogue Role', permissions: ['billing.manage'] },
    403
  );

  await assertApi(
    'Worker CANNOT escalate their own role or permissions (403)',
    'PUT',
    `/team/${agentId}/permissions`,
    { 'x-user-role': 'agent', 'x-user-id': agentId },
    { role: 'owner' },
    403,
    (body) => body.error === 'Forbidden'
  );

  // -------------------------------------------------------------
  // 2. EXPLICIT USER OVERRIDES: GRANTS & EXPLICIT DENY PRECEDENCE
  // -------------------------------------------------------------
  console.log('\n--- 2. Deterministic Overrides: Grants & Deny Precedence ---');

  // Owner assigns explicit grant to agent: grant 'workflows.view'
  await assertApi(
    'Owner configures explicit grant on Agent (workflows.view)',
    'PUT',
    `/team/${agentId}/permissions`,
    { 'x-user-role': 'owner', 'x-user-id': ownerId },
    { permissionOverrides: { grants: ['workflows.view'], denies: [] } },
    200
  );

  await assertApi(
    'Explicit Grant: Agent granted workflows.view CAN view visual workflows (200)',
    'GET',
    '/workflows/definitions',
    { 'x-user-role': 'agent', 'x-user-id': agentId },
    null,
    200
  );

  // Owner assigns explicit deny to Admin: deny 'contacts.export'
  await assertApi(
    'Owner configures explicit deny on Admin (contacts.export)',
    'PUT',
    `/team/${adminId}/permissions`,
    { 'x-user-role': 'owner', 'x-user-id': ownerId },
    { permissionOverrides: { grants: [], denies: ['contacts.export'] } },
    200
  );

  await assertApi(
    'Explicit Deny Precedence: Admin with explicit deny on contacts.export is BLOCKED (403)',
    'GET',
    '/leads/export',
    { 'x-user-role': 'admin', 'x-user-id': adminId },
    null,
    403,
    (body) => body.message && body.message.includes('EXPLICIT_USER_DENY')
  );

  // Clean up overrides via Owner
  await assertApi(
    'Owner cleans up Agent overrides',
    'PUT',
    `/team/${agentId}/permissions`,
    { 'x-user-role': 'owner', 'x-user-id': ownerId },
    { permissionOverrides: { grants: [], denies: [] } },
    200
  );
  await assertApi(
    'Owner cleans up Admin overrides',
    'PUT',
    `/team/${adminId}/permissions`,
    { 'x-user-role': 'owner', 'x-user-id': ownerId },
    { permissionOverrides: { grants: [], denies: [] } },
    200
  );

  // -------------------------------------------------------------
  // 3. IMMEDIATE ACCESS REVOCATION FOR SUSPENDED USERS
  // -------------------------------------------------------------
  console.log('\n--- 3. Immediate Session & Access Revocation (Suspension) ---');

  // Owner suspends agent
  await assertApi(
    'Owner suspends Agent account',
    'POST',
    `/team/${agentId}/suspend`,
    { 'x-user-role': 'owner', 'x-user-id': ownerId },
    null,
    200,
    (body) => body.user?.status === 'SUSPENDED'
  );

  await assertApi(
    'Suspended member has all protected actions immediately BLOCKED (403 ACCOUNT_SUSPENDED)',
    'GET',
    '/conversations',
    { 'x-user-role': 'agent', 'x-user-id': agentId },
    null,
    403,
    (body) => body.code === 'ACCOUNT_SUSPENDED'
  );

  // Reactivate Agent
  await assertApi(
    'Owner reactivates Agent account',
    'POST',
    `/team/${agentId}/suspend`,
    { 'x-user-role': 'owner', 'x-user-id': ownerId },
    null,
    200,
    (body) => body.user?.status === 'ACTIVE'
  );

  // -------------------------------------------------------------
  // 4. RESOURCE-LEVEL RESTRICTIONS (ASSIGNED CONVERSATIONS ONLY)
  // -------------------------------------------------------------
  console.log('\n--- 4. Resource Scoping: Assigned-Only Conversations ---');

  // Owner sets Agent resource scope to assigned_only
  await assertApi(
    'Owner restricts Agent resource scope to assigned_only',
    'PUT',
    `/team/${agentId}/permissions`,
    { 'x-user-role': 'owner', 'x-user-id': ownerId },
    { resourceScope: { conversations: 'assigned_only', whatsappAccounts: 'all' } },
    200
  );

  // Agent attempts to send message to conv-01 (which is unassigned or assigned to someone else)
  await assertApi(
    'Resource Scope: Agent restricted to assigned_only CANNOT send messages to unassigned conversation (403)',
    'POST',
    '/conversations/conv-01/messages',
    { 'x-user-role': 'agent', 'x-user-id': agentId },
    { body: 'Trying to intrude on another counsellors chat' },
    403,
    (body) => body.code === 'RESOURCE_SCOPE_RESTRICTED'
  );

  // Restore Agent resource scope to all
  await assertApi(
    'Owner restores Agent resource scope to all conversations',
    'PUT',
    `/team/${agentId}/permissions`,
    { 'x-user-role': 'owner', 'x-user-id': ownerId },
    { resourceScope: { conversations: 'all', whatsappAccounts: 'all' } },
    200
  );

  // -------------------------------------------------------------
  // 5. VISUAL WORKFLOW GRAPH VALIDATION & EXECUTION SIMULATION
  // -------------------------------------------------------------
  console.log('\n--- 5. Visual Workflow Builder: Validation & Execution ---');

  let invalidWfId = '';
  await assertApi(
    'Owner CAN draft a workflow definition (201)',
    'POST',
    '/workflows/definitions',
    { 'x-user-role': 'owner', 'x-user-id': ownerId },
    {
      name: 'Cyclic Infinite Loop Workflow',
      description: 'Testing cycle detection',
      nodes: [
        { id: 'node-1', type: 'trigger', name: 'Inbound Message', config: {} },
        { id: 'node-2', type: 'condition', name: 'Check Intent', config: {} },
      ],
      edges: [
        { id: 'e1', source: 'node-1', target: 'node-2' },
        { id: 'e2', source: 'node-2', target: 'node-1' },
      ],
    },
    201,
    (body) => {
      invalidWfId = body.workflow?.id;
      return !!invalidWfId;
    }
  );

  await assertApi(
    'Publishing cyclic workflow is REJECTED with 422 Unprocessable Entity',
    'POST',
    `/workflows/definitions/${invalidWfId}/publish`,
    { 'x-user-role': 'owner', 'x-user-id': ownerId },
    null,
    422,
    (body) => body.errors && body.errors.some((e: string) => e.includes('loop / cycle detected'))
  );

  // Dry-run simulation of valid existing workflow wf-01
  await assertApi(
    'Owner CAN run dry-run simulation of valid workflow graph wf-01 (200)',
    'POST',
    '/workflows/definitions/wf-01/simulate',
    { 'x-user-role': 'owner', 'x-user-id': ownerId },
    { testPayload: { message: 'I want JEE coaching fees' } },
    200,
    (body) => body.executedSteps && body.executedSteps.length > 0
  );

  // -------------------------------------------------------------
  // 6. WHATSAPP TEMPLATES & META APPROVAL LIFECYCLE
  // -------------------------------------------------------------
  console.log('\n--- 6. WhatsApp Templates & Meta Approval Enforcement ---');

  let draftTmplId = '';
  await assertApi(
    'Admin CAN create a message template draft (201)',
    'POST',
    '/templates',
    { 'x-user-role': 'admin', 'x-user-id': adminId },
    {
      name: 'annual_sports_meet_alert',
      category: 'MARKETING',
      language: 'en_US',
      bodyText: 'Hello {{1}}, join our annual sports meet on Sunday!',
      variables: ['Student Name'],
    },
    201,
    (body) => {
      draftTmplId = body.template?.id;
      return !!draftTmplId && body.template?.status === 'DRAFT';
    }
  );

  await assertApi(
    'Admin CAN submit draft template to Meta Cloud API (PENDING_APPROVAL)',
    'POST',
    `/templates/${draftTmplId}/submit-meta`,
    { 'x-user-role': 'admin', 'x-user-id': adminId },
    null,
    200,
    (body) => body.template?.status === 'PENDING_APPROVAL'
  );

  // -------------------------------------------------------------
  // 7. BROADCAST CAMPAIGNS & OPT-OUT SUPPRESSION
  // -------------------------------------------------------------
  console.log('\n--- 7. Broadcast Campaigns & Opt-Out Suppression ---');

  let unapprovedCampId = '';
  await assertApi(
    'Admin CAN draft a broadcast campaign (201)',
    'POST',
    '/broadcasts/campaigns',
    { 'x-user-role': 'admin', 'x-user-id': adminId },
    {
      name: 'Unapproved Template Blast',
      templateName: 'annual_sports_meet_alert',
    },
    201,
    (body) => {
      unapprovedCampId = body.campaign?.id;
      return !!unapprovedCampId;
    }
  );

  await assertApi(
    'Dispatching broadcast with UNAPPROVED template is REJECTED (400 TemplateNotApproved)',
    'POST',
    `/broadcasts/campaigns/${unapprovedCampId}/send`,
    { 'x-user-role': 'admin', 'x-user-id': adminId },
    null,
    400,
    (body) => body.error === 'TemplateNotApproved'
  );

  let approvedCampId = '';
  await assertApi(
    'Admin drafts campaign with approved template (201)',
    'POST',
    '/broadcasts/campaigns',
    { 'x-user-role': 'admin', 'x-user-id': adminId },
    {
      name: 'Physics Demo Reminder Wave 2',
      templateName: 'demo_reminder_physics',
    },
    201,
    (body) => {
      approvedCampId = body.campaign?.id;
      return !!approvedCampId;
    }
  );

  await assertApi(
    'Admin CAN launch campaign; Opt-out contacts are automatically suppressed',
    'POST',
    `/broadcasts/campaigns/${approvedCampId}/send`,
    { 'x-user-role': 'admin', 'x-user-id': adminId },
    null,
    200,
    (body) => body.campaign?.excludedCount > 0 && body.campaign?.status === 'COMPLETED'
  );

  await assertApi(
    'Duplicate dispatch of already-completed campaign is BLOCKED with 409 Conflict',
    'POST',
    `/broadcasts/campaigns/${approvedCampId}/send`,
    { 'x-user-role': 'admin', 'x-user-id': adminId },
    null,
    409
  );

  // -------------------------------------------------------------
  // 8. CONTACT CSV IMPORT & DATA VALIDATION
  // -------------------------------------------------------------
  console.log('\n--- 8. Contact CSV Import: Normalization, Duplicates & Validation ---');

  const uniqueSuffix = Date.now().toString().slice(-4);
  const phone1 = `987654${uniqueSuffix}`;
  const phone2 = `987655${uniqueSuffix}`;

  await assertApi(
    'CSV Import normalizes valid rows, excludes invalid formats, and detects duplicates (200)',
    'POST',
    '/contacts/import',
    { 'x-user-role': 'admin', 'x-user-id': adminId },
    {
      contacts: [
        { name: 'Kavita Singh', phone: phone1, tags: 'NEET 2027, Delhi' },
        { name: 'Deepak Varma', phone: phone2, tags: 'JEE Dropper' },
        { name: 'Invalid Phone Row', phone: '12345', tags: 'Bad Row' },
        { name: 'Duplicate Row', phone: phone1, tags: 'Duplicate' },
      ],
    },
    200,
    (body) => {
      return (
        body.summary?.importedCount === 2 &&
        body.summary?.invalidCount === 1 &&
        body.summary?.duplicateCount === 1
      );
    }
  );

  // -------------------------------------------------------------
  // 9. AI KNOWLEDGE DOCUMENTS UPLOAD & WORKSPACE SCOPE
  // -------------------------------------------------------------
  console.log('\n--- 9. AI Knowledge Base: Document Upload & Workspace RAG ---');

  let docId = '';
  await assertApi(
    'Admin CAN upload document (PDF/DOCX/TXT/CSV) with chunk generation (201)',
    'POST',
    '/knowledge/upload',
    { 'x-user-role': 'admin', 'x-user-id': adminId },
    {
      filename: 'jee_advanced_2027_syllabus.pdf',
      fileType: 'pdf',
      fileSize: 1048576,
      extractedText: 'Full Physics, Chemistry, and Mathematics curriculum breakdown for JEE Advanced 2027 batches at Prakash Institute.',
      title: 'JEE Advanced 2027 Syllabus & Fee Structure',
    },
    201,
    (body) => {
      docId = body.document?.id;
      return !!docId && body.document?.chunksCount > 0;
    }
  );

  await assertApi(
    'Admin CAN delete knowledge document and vector chunks (200)',
    'DELETE',
    `/knowledge/documents/${docId}`,
    { 'x-user-role': 'admin', 'x-user-id': adminId },
    null,
    200
  );

  // -------------------------------------------------------------
  // TEST SUMMARY
  // -------------------------------------------------------------
  console.log('\n========================================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  console.log(`📊 Advanced RBAC & Features Test Results: ${passed}/${total} PASSED (${failed} failed)`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAdvancedRBACSuite();
