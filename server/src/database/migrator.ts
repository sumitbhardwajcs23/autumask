import fs from 'fs';
import path from 'path';
import { getPool, query } from './connection';

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

export interface MigrationResult {
  version: string;
  status: 'APPLIED' | 'SKIPPED' | 'FAILED' | 'ROLLED_BACK';
  error?: string;
}

export const ensureMigrationsTable = async (): Promise<void> => {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(100) PRIMARY KEY,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const getAppliedMigrations = async (): Promise<string[]> => {
  await ensureMigrationsTable();
  const res = await query<{ version: string }>(
    'SELECT version FROM schema_migrations ORDER BY version ASC;'
  );
  return res.rows.map(r => r.version);
};

export const runMigrations = async (): Promise<MigrationResult[]> => {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const appliedSet = new Set(applied);

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    throw new Error(`Migrations directory not found: ${MIGRATIONS_DIR}`);
  }

  const allFiles = fs.readdirSync(MIGRATIONS_DIR);
  const forwardMigrations = allFiles
    .filter(f => f.endsWith('.sql') && !f.endsWith('.down.sql'))
    .sort();

  const results: MigrationResult[] = [];
  const pool = getPool();

  for (const file of forwardMigrations) {
    const version = path.basename(file, '.sql');
    if (appliedSet.has(version)) {
      results.push({ version, status: 'SKIPPED' });
      continue;
    }

    const filePath = path.join(MIGRATIONS_DIR, file);
    const sqlContent = fs.readFileSync(filePath, 'utf-8');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      console.log(`⏳ Applying migration: ${version}...`);
      await client.query(sqlContent);
      await client.query(
        'INSERT INTO schema_migrations (version) VALUES ($1);',
        [version]
      );
      await client.query('COMMIT');
      console.log(`✅ Applied migration: ${version}`);
      results.push({ version, status: 'APPLIED' });
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error(`❌ Migration failed: ${version}`, err);
      results.push({ version, status: 'FAILED', error: err.message });
      throw new Error(`Migration ${version} failed: ${err.message}`);
    } finally {
      client.release();
    }
  }

  return results;
};

export const rollbackLastMigration = async (): Promise<MigrationResult | null> => {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  if (applied.length === 0) {
    console.log('No migrations to rollback.');
    return null;
  }

  const latestVersion = applied[applied.length - 1];
  const downFile = path.join(MIGRATIONS_DIR, `${latestVersion}.down.sql`);

  if (!fs.existsSync(downFile)) {
    throw new Error(`Rollback file not found for migration: ${latestVersion} (${downFile})`);
  }

  const sqlContent = fs.readFileSync(downFile, 'utf-8');
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log(`⏳ Rolling back migration: ${latestVersion}...`);
    await client.query(sqlContent);
    await client.query(
      'DELETE FROM schema_migrations WHERE version = $1;',
      [latestVersion]
    );
    await client.query('COMMIT');
    console.log(`✅ Rolled back migration: ${latestVersion}`);
    return { version: latestVersion, status: 'ROLLED_BACK' };
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error(`❌ Rollback failed: ${latestVersion}`, err);
    throw new Error(`Rollback of ${latestVersion} failed: ${err.message}`);
  } finally {
    client.release();
  }
};

// If run directly from CLI
if (require.main === module || (process.argv[1] && process.argv[1].includes('migrator'))) {
  const isRollback = process.argv.includes('--down');
  (async () => {
    try {
      if (isRollback) {
        await rollbackLastMigration();
      } else {
        await runMigrations();
      }
      const pool = getPool();
      await pool.end();
      process.exit(0);
    } catch (err) {
      console.error('Migration command error:', err);
      process.exit(1);
    }
  })();
}
