import { getPool, query, withTenantContext } from './connection';
import { runMigrations, getAppliedMigrations } from './migrator';

/**
 * AutoMask RDS Deployment & Multi-Tenant RLS Security Verification Script
 * 
 * Verifies:
 * 1. SSL Database Connectivity
 * 2. Migrations 001 - 008 application
 * 3. Least-Privilege automask_app role properties (NOSUPERUSER, NOBYPASSRLS)
 * 4. Cross-Tenant Isolation and Fail-Closed Security
 */
export async function verifyRdsDeployment(): Promise<{
  success: boolean;
  version: string;
  appliedMigrations: string[];
  roleSecurity: {
    roleName: string;
    isSuperuser: boolean;
    bypassesRls: boolean;
  };
  isolationPassed: boolean;
}> {
  console.log('========================================================================');
  console.log('🛡️ AutoMask: Amazon RDS / Aurora PostgreSQL Deployment Verification');
  console.log('========================================================================');

  const pool = getPool();

  // 1. Connectivity & Version Check
  const versionRes = await query('SELECT version();');
  const pgVersion = versionRes.rows[0].version;
  console.log(`✅ Connected to PostgreSQL: ${pgVersion}`);

  // 2. Run / Verify Migrations
  console.log('\n📦 Checking schema migrations...');
  await runMigrations();
  const appliedMigrations = await getAppliedMigrations();
  console.log(`✅ Applied Migrations (${appliedMigrations.length}): ${appliedMigrations.join(', ')}`);

  // 3. Inspect Application Role Privileges in pg_roles
  console.log('\n🔒 Checking automask_app database role security attributes...');
  const roleRes = await query(`
    SELECT rolname, rolsuper, rolbypassrls 
    FROM pg_roles 
    WHERE rolname = 'automask_app';
  `);

  if (roleRes.rows.length === 0) {
    throw new Error("SECURITY_FAILURE: Role 'automask_app' was not found in pg_roles!");
  }

  const roleMeta = roleRes.rows[0];
  const isSuperuser = roleMeta.rolsuper;
  const bypassesRls = roleMeta.rolbypassrls;

  console.log(`   Role: ${roleMeta.rolname}`);
  console.log(`   isSuperuser: ${isSuperuser} (Expected: false)`);
  console.log(`   bypassesRls: ${bypassesRls} (Expected: false)`);

  if (isSuperuser || bypassesRls) {
    throw new Error(
      `SECURITY_VIOLATION: automask_app MUST NOT be a superuser or bypass RLS! (rolsuper=${isSuperuser}, rolbypassrls=${bypassesRls})`
    );
  }
  console.log('✅ Least-privilege role verified: NOSUPERUSER, NOBYPASSRLS');

  // 4. Test Fail-Closed Isolation (No workspace context set)
  console.log('\n🧪 Testing Fail-Closed Isolation (No workspace context)...');
  const client = await pool.connect();
  let failClosedOk = false;
  try {
    // Switch to automask_app role for verification
    await client.query('SET ROLE automask_app;');
    const unauthenticatedRes = await client.query('SELECT count(*) as count FROM conversations;');
    const count = parseInt(unauthenticatedRes.rows[0].count, 10);
    console.log(`   Conversations visible without tenant context: ${count}`);
    if (count === 0) {
      failClosedOk = true;
      console.log('✅ Fail-closed verified: Unauthenticated/missing context returns 0 rows');
    } else {
      console.error(`❌ Security breach: ${count} rows returned without workspace context!`);
    }
  } finally {
    await client.query('RESET ROLE;');
    client.release();
  }

  // 5. Test Cross-Tenant RLS Boundaries
  console.log('\n🛡️ Testing Cross-Tenant RLS Boundaries between Tenant A and Tenant B...');
  const tenantA = '11111111-1111-4111-8111-111111111111';
  const tenantB = '22222222-2222-4222-8222-222222222222';

  let tenantAOwnCount = 0;
  let tenantACrossCount = 0;

  await withTenantContext(tenantA, async (tx) => {
    await tx.query('SET ROLE automask_app;');
    const ownRes = await tx.query('SELECT count(*) as count FROM conversations WHERE workspace_id = $1;', [tenantA]);
    tenantAOwnCount = parseInt(ownRes.rows[0].count, 10);

    const crossRes = await tx.query('SELECT count(*) as count FROM conversations WHERE workspace_id = $1;', [tenantB]);
    tenantACrossCount = parseInt(crossRes.rows[0].count, 10);
    await tx.query('RESET ROLE;');
  });

  console.log(`   Tenant A visible own records: ${tenantAOwnCount}`);
  console.log(`   Tenant A visible Tenant B records: ${tenantACrossCount}`);

  const isolationPassed = failClosedOk && tenantACrossCount === 0;
  if (!isolationPassed) {
    throw new Error('SECURITY_FAILURE: Tenant A was able to read Tenant B records under RLS!');
  }
  console.log('✅ Multi-tenant RLS isolation strictly enforced!');

  console.log('\n========================================================================');
  console.log('🎉 RDS DEPLOYMENT & SECURITY VERIFICATION COMPLETED SUCCESSFULLY');
  console.log('========================================================================\n');

  return {
    success: true,
    version: pgVersion,
    appliedMigrations,
    roleSecurity: {
      roleName: 'automask_app',
      isSuperuser,
      bypassesRls,
    },
    isolationPassed,
  };
}

if (require.main === module || (process.argv[1] && process.argv[1].includes('verifyRdsDeployment'))) {
  verifyRdsDeployment()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('RDS Verification Error:', err);
      process.exit(1);
    });
}
