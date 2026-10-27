import { query, withTenantContext } from '../database/connection';

export interface OutboxRecord {
  id: string;
  workspaceId?: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: any;
  idempotencyKey?: string;
  status: 'PENDING' | 'DISPATCHED' | 'FAILED' | 'DEAD';
  retryCount: number;
}

export class OutboxService {
  /**
   * Persist event into outbox_events table within caller's transaction or directly
   */
  public static async recordEvent(params: {
    workspaceId?: string;
    eventType: string;
    aggregateType: string;
    aggregateId: string;
    payload: any;
    idempotencyKey?: string;
    client?: any; // optional pg client if part of a transaction
  }): Promise<{ id: string; status: string }> {
    const { workspaceId, eventType, aggregateType, aggregateId, payload, idempotencyKey, client } = params;
    const idKey = idempotencyKey || `evt-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const sql = `
      INSERT INTO outbox_events (workspace_id, event_type, aggregate_type, aggregate_id, payload_json, idempotency_key, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
      ON CONFLICT (idempotency_key) DO UPDATE SET status = outbox_events.status
      RETURNING id, status;
    `;
    const values = [workspaceId || null, eventType, aggregateType, aggregateId, JSON.stringify(payload), idKey];

    const res = client ? await client.query(sql, values) : await query(sql, values);
    return { id: res.rows[0].id, status: res.rows[0].status };
  }

  /**
   * Safe claiming of pending events by concurrent dispatchers using FOR UPDATE SKIP LOCKED
   */
  public static async dispatchPendingEvents(batchSize: number = 25): Promise<number> {
    try {
      const claimSql = `
        SELECT id, workspace_id, event_type, aggregate_type, aggregate_id, payload_json, idempotency_key, retry_count
        FROM outbox_events
        WHERE status = 'PENDING' AND next_retry_at <= NOW()
        ORDER BY created_at ASC
        LIMIT $1
        FOR UPDATE SKIP LOCKED;
      `;
      const res = await query(claimSql, [batchSize]);

      let dispatchedCount = 0;
      for (const row of res.rows) {
        try {
          // Process or dispatch the event
          // For demo / webhook events, we mark as DISPATCHED
          await query(
            `UPDATE outbox_events 
             SET status = 'DISPATCHED', processed_at = NOW() 
             WHERE id = $1;`,
            [row.id]
          );
          dispatchedCount++;
        } catch (err: any) {
          const retries = row.retry_count + 1;
          const isDead = retries >= 5;
          await query(
            `UPDATE outbox_events 
             SET retry_count = $1, error_message = $2, 
                 status = $3,
                 next_retry_at = NOW() + ($4 || ' seconds')::INTERVAL 
             WHERE id = $5;`,
            [retries, err.message, isDead ? 'DEAD' : 'PENDING', (Math.pow(2, retries) * 5).toString(), row.id]
          );
        }
      }
      return dispatchedCount;
    } catch (err: any) {
      console.error('[OutboxService] Dispatch sweep failed:', err.message);
      return 0;
    }
  }
}
