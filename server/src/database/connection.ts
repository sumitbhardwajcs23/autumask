import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { env } from '../config/env';

let pool: Pool | null = null;

export const getPool = (): Pool => {
  if (!pool) {
    const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
    const maxConnections = isLambda ? 2 : 20;

    const isSsl = env.DB_SSL || (env.DATABASE_URL ? (env.DATABASE_URL.includes('sslmode=require') || env.DATABASE_URL.includes('neon.tech')) : false);

    if (env.DATABASE_URL) {
      pool = new Pool({
        connectionString: env.DATABASE_URL,
        ssl: isSsl ? { rejectUnauthorized: false } : false,
        max: maxConnections,
        idleTimeoutMillis: isLambda ? 10000 : 30000,
        connectionTimeoutMillis: 10000,
      });
    } else {
      pool = new Pool({
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        max: maxConnections,
        idleTimeoutMillis: isLambda ? 10000 : 30000,
        connectionTimeoutMillis: 5000,
      });
    }

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client pool', err);
    });
  }
  return pool;
};

/**
 * Execute query directly on pool without tenant-scoped transaction
 */
export const query = async <T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
  const p = getPool();
  return p.query<T>(text, params);
};

/**
 * Transactional Tenant Context Execution (Row-Level Security Defense-in-Depth)
 * 
 * Enforces transaction-local context via:
 *   SELECT set_config('app.current_workspace_id', $1, true);
 * 
 * The `true` parameter makes the setting local to the current transaction.
 * When COMMIT or ROLLBACK runs, the setting is automatically cleared,
 * ensuring connection pool reuse CANNOT leak tenant context between requests.
 */
export const withTenantContext = async <T>(
  workspaceId: string,
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  if (!workspaceId || typeof workspaceId !== 'string') {
    throw new Error('Tenant context error: valid workspaceId is required');
  }

  const p = getPool();
  const client = await p.connect();

  try {
    await client.query('BEGIN');
    // Set transaction-local tenant context (3rd parameter = true => local to transaction)
    await client.query("SELECT set_config('app.current_workspace_id', $1, true)", [workspaceId]);

    const result = await callback(client);

    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Check connectivity to PostgreSQL
 */
export const checkDatabaseConnection = async (): Promise<{ connected: boolean; version?: string; error?: string }> => {
  try {
    const res = await query('SELECT version();');
    return { connected: true, version: res.rows[0].version };
  } catch (err: any) {
    return { connected: false, error: err.message };
  }
};

/**
 * Close pool during graceful shutdown or tests
 */
export const closeDatabasePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};
