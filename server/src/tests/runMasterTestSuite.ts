import { runPlatformVsClientTests } from './runPlatformVsClientTests';
import { spawn } from 'child_process';
import path from 'path';

const SUITES = [
  { name: 'Multi-Tenant PostgreSQL RLS & Isolation', file: 'runMultiTenantTests.ts' },
  { name: 'RBAC Security & Privacy Controls', file: 'runSecurityTests.ts' },
  { name: 'Section 4 End-to-End Workflows & Decision Router', file: 'runWorkflowTests.ts' },
  { name: 'Phase 2 WhatsApp Queue & AI/RAG Engine', file: 'runPhase2Tests.ts' },
  { name: 'Advanced RBAC, Visual Workflows & Broadcasts', file: 'runAdvancedRBACTests.ts' },
  { name: 'Platform Management Console vs Client Workspace', file: 'runPlatformVsClientTests.ts' },
  { name: 'P0 Architectural Assurance & Production Reliability', file: 'runP0ProductionTests.ts' },
  { name: 'Production Readiness Critical Test Matrix (10 Domains)', file: 'runProductionReadinessMatrix.ts' },
];

function runSubprocess(file: string): Promise<{ code: number; name: string }> {
  return new Promise((resolve) => {
    const tsxPath = path.join(__dirname, file);
    const child = spawn('npx', ['tsx', tsxPath], {
      stdio: 'inherit',
      shell: true,
      cwd: path.resolve(__dirname, '../..'),
    });

    child.on('close', (code) => {
      resolve({ code: code || 0, name: file });
    });

    child.on('error', (err) => {
      console.error(`Failed to launch ${file}:`, err);
      resolve({ code: 1, name: file });
    });
  });
}

async function main() {
  console.log('========================================================================');
  console.log('🚀 AutoMask Master Automated Test Suite Runner (All 8 Test Modules)');
  console.log('========================================================================\n');

  let anyFailed = false;
  const suiteResults: { name: string; status: string }[] = [];

  for (const suite of SUITES) {
    console.log(`\n▶️ Executing Suite: ${suite.name}...`);
    const res = await runSubprocess(suite.file);
    if (res.code === 0) {
      suiteResults.push({ name: suite.name, status: 'PASSED' });
    } else {
      suiteResults.push({ name: suite.name, status: 'FAILED' });
      anyFailed = true;
    }
  }

  console.log('\n========================================================================');
  console.log('🏁 AutoMask Master Test Run Summary');
  console.log('========================================================================');
  suiteResults.forEach((s) => {
    const icon = s.status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} [${s.status}] ${s.name}`);
  });
  console.log('========================================================================\n');

  if (anyFailed) {
    console.error('❌ One or more test suites failed.');
    process.exit(1);
  } else {
    console.log('🎉 ALL 8 AUTOMATED TEST SUITES PASSED WITH 100% SUCCESS!');
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal runner error:', err);
    process.exit(1);
  });
}
