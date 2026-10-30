import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { query } from '../../database/connection';
import { WebhookJobData } from './webhookQueue';
import { WebhookPipeline } from '../../services/webhookPipeline';
import { AuthService } from '../auth/authService';
import { mockStore } from '../../models/mockStore';
import { env } from '../../config/env';
import { DataService } from '../../database/dataService';

export class WebhookWorker {
  private static worker: Worker | null = null;

  public static async initWorker(): Promise<void> {
    try {
      let redisUrl = env.REDIS_URL || process.env.REDIS_URL;
      if (!redisUrl && (env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL) && (env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)) {
        const restUrl = env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL || '';
        const restToken = env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
        const host = restUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        redisUrl = `rediss://default:${restToken}@${host}:6379`;
      }

      const redisConnection = new Redis(redisUrl || 'redis://127.0.0.1:6379', {
        maxRetriesPerRequest: 1,
        connectTimeout: 5000,
        lazyConnect: true,
        enableOfflineQueue: false,
      });

      redisConnection.on('error', () => {
        // Suppress unhandled ioredis event when Redis is unavailable
      });

      await redisConnection.connect();

      this.worker = new Worker<WebhookJobData>(
        'inbound-webhook-queue',
        async (job: Job<WebhookJobData>) => {
          await this.processJob(job.data);
        },
        {
          connection: redisConnection,
          concurrency: 5,
        }
      );

      this.worker.on('failed', async (job, err) => {
        if (job) {
          console.error(`❌ Webhook Job ${job.id} failed:`, err.message);
          await query(
            `UPDATE webhook_events 
             SET retry_count = retry_count + 1, error_message = $1, status = 'FAILED'
             WHERE id = $2;`,
            [err.message, job.data.eventId]
          );
        }
      });

      console.log('✅ BullMQ WebhookWorker initialized with concurrency 5');
    } catch (err: any) {
      if (env.NODE_ENV === 'production') {
        throw new Error(`REDIS_WORKER_CONNECTION_FAILED: Redis server is required in production: ${err?.message}`);
      }
      // Redis not running locally -> worker runs via direct async dispatch
    }
  }

  /**
   * Process webhook job idempotently
   */
  public static async processJob(data: WebhookJobData): Promise<void> {
    const { eventId, payload, providerMessageId } = data;

    try {
      // 1. Mark status as processing
      await query(
        `UPDATE webhook_events SET status = 'PROCESSING' WHERE id = $1;`,
        [eventId]
      );

      // 2. Resolve Workspace from Trusted Account Mapping (Step 4 / Line 641)
      const phoneId = payload.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;
      let workspaceId = mockStore.workspace.id;

      if (phoneId) {
        const mapping = await AuthService.resolveWorkspaceFromPhoneNumberId(phoneId);
        if (!mapping || mapping.status !== 'CONNECTED') {
          if (mockStore.whatsappAccount && mockStore.whatsappAccount.phoneNumberId === phoneId && mockStore.whatsappAccount.status === 'CONNECTED') {
            workspaceId = mockStore.workspace.id;
          } else {
            throw new Error(`UNMAPPED_WHATSAPP_ACCOUNT: WhatsApp Phone Number ID '${phoneId}' is not registered or not connected.`);
          }
        } else {
          workspaceId = mapping.workspaceId;
        }
      }

      // 3. Execute 7-Stage Response Decision Pipeline
      const results = WebhookPipeline.processWebhookEvent(payload);

      // 4. Persist in real PostgreSQL database (contacts, conversations, messages, leads)
      for (const entry of payload.entry || []) {
        for (const change of entry.changes || []) {
          const val = change.value;
          for (const msg of val.messages || []) {
            const studentPhone = `+${msg.from}`;
            const studentName = val.contacts?.[0]?.profile?.name || 'Prospective Student';
            const textBody = msg.text?.body || '';
            const matchedResult = results.find(r => r.providerMessageId === msg.id);
            const botReply = matchedResult?.routeResult?.replyText;

            await DataService.recordInboundMessage({
              workspaceId,
              phone: studentPhone,
              studentName,
              body: textBody,
              providerMessageId: msg.id,
              botReply,
            });
          }
        }
      }

      // 5. Mark status as processed
      await query(
        `UPDATE webhook_events 
         SET status = 'PROCESSED', processed_at = NOW() 
         WHERE id = $1;`,
        [eventId]
      );
    } catch (err: any) {
      console.error(`Error processing webhook event ${eventId}:`, err);
      await query(
        `UPDATE webhook_events 
         SET retry_count = retry_count + 1, error_message = $1, status = 'FAILED' 
         WHERE id = $2;`,
        [err.message, eventId]
      );
      throw err;
    }
  }
}
