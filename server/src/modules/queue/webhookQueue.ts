import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { query } from '../../database/connection';
import { env } from '../../config/env';
import { WebhookPayload } from '../../services/webhookPipeline';

export interface WebhookJobData {
  eventId: string;
  payload: WebhookPayload;
  providerMessageId?: string;
  timestamp: number;
}

export class WebhookQueueService {
  private static queue: Queue<WebhookJobData> | null = null;
  private static redisClient: Redis | null = null;
  private static isRedisAvailable: boolean = false;
  private static inMemoryQueue: Array<{ job: WebhookJobData; attempts: number }> = [];

  public static async initQueue(): Promise<void> {
    try {
      this.redisClient = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
        maxRetriesPerRequest: 1,
        connectTimeout: 1000,
        lazyConnect: true,
        enableOfflineQueue: false,
      });

      this.redisClient.on('error', () => {
        // Suppress unhandled ioredis event when Redis is unavailable
      });

      await this.redisClient.connect();
      this.isRedisAvailable = true;

      this.queue = new Queue<WebhookJobData>('inbound-webhook-queue', {
        connection: this.redisClient,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 100,
          removeOnFail: 200,
        },
      });
      console.log('✅ BullMQ connected to Redis on inbound-webhook-queue');
    } catch {
      this.isRedisAvailable = false;
      this.queue = null;
      console.log('ℹ️ Redis not detected locally. Operating in resilient direct/in-memory queue mode.');
    }
  }

  /**
   * Section B Flow:
   * 1. Validate signature & structure
   * 2. Persist durably to PostgreSQL webhook_events with unique idempotency_key
   * 3. Enqueue job ONLY after successful database persistence
   * 4. Return HTTP success response immediately (< 3s)
   */
  public static async ingestAndEnqueue(
    payload: WebhookPayload,
    signatureValid: boolean,
    rawPayloadString?: string
  ): Promise<{
    success: boolean;
    eventId?: string;
    duplicate: boolean;
    status: string;
  }> {
    // Extract provider message ID if present
    const firstMsg = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const providerMessageId = firstMsg?.id;
    const idempotencyKey = providerMessageId || `evt-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // 1. Idempotency Check in Database
    try {
      if (providerMessageId) {
        const existing = await query(
          `SELECT id, status FROM webhook_events WHERE idempotency_key = $1 LIMIT 1;`,
          [providerMessageId]
        );
        if (existing.rows.length > 0) {
          return {
            success: true,
            eventId: existing.rows[0].id,
            duplicate: true,
            status: 'DEDUPLICATED',
          };
        }
      }

      // 2. Durable Persistence BEFORE Queuing
      const insertRes = await query(
        `INSERT INTO webhook_events (source, signature_valid, payload_json, idempotency_key, status)
         VALUES ('meta_whatsapp', $1, $2, $3, 'PENDING')
         RETURNING id;`,
        [signatureValid, JSON.stringify(payload), idempotencyKey]
      );
      const eventId = insertRes.rows[0].id;

      const jobData: WebhookJobData = {
        eventId,
        payload,
        providerMessageId,
        timestamp: Date.now(),
      };

      // 3. Enqueue Job (Amazon SQS Serverless -> BullMQ Redis -> Local In-Memory Fallback)
      const sqsQueueUrl = process.env.SQS_QUEUE_URL;
      if (sqsQueueUrl) {
        try {
          const { SQSClient, SendMessageCommand } = await import('@aws-sdk/client-sqs');
          const sqsClient = new SQSClient({});
          await sqsClient.send(new SendMessageCommand({
            QueueUrl: sqsQueueUrl,
            MessageBody: JSON.stringify(jobData),
            MessageAttributes: {
              EventId: { DataType: 'String', StringValue: eventId },
              ProviderMessageId: { DataType: 'String', StringValue: providerMessageId || 'NONE' },
            },
          }));
          console.log(`[WebhookQueue] Dispatched event ${eventId} to Amazon SQS: ${sqsQueueUrl}`);
        } catch (sqsErr: any) {
          console.error(`[WebhookQueue] Amazon SQS dispatch failed, falling back to direct execution:`, sqsErr.message);
          setImmediate(async () => {
            const { WebhookWorker } = await import('./webhookWorker');
            await WebhookWorker.processJob(jobData);
          });
        }
      } else if (this.isRedisAvailable && this.queue) {
        await this.queue.add('process-webhook', jobData, {
          jobId: idempotencyKey,
        });
      } else {
        // Asynchronous in-memory execution for local dev / tests
        setImmediate(async () => {
          try {
            const { WebhookWorker } = await import('./webhookWorker');
            await WebhookWorker.processJob(jobData);
          } catch (workerErr: any) {
            // WebhookWorker already logs and records failure in DB
          }
        });
      }

      return {
        success: true,
        eventId,
        duplicate: false,
        status: 'ENQUEUED',
      };
    } catch (err: any) {
      if (err.code === '23505') {
        // Unique violation on idempotency_key -> duplicate webhook
        return {
          success: true,
          duplicate: true,
          status: 'DEDUPLICATED',
        };
      }
      throw err;
    }
  }

  public static isRedisConnected(): boolean {
    return this.isRedisAvailable && this.queue !== null;
  }

  /**
   * Validate if queue infrastructure meets production readiness standards
   */
  public static validateProductionReadiness(): { ready: boolean; queueType: string; reason?: string } {
    if (process.env.SQS_QUEUE_URL) {
      return { ready: true, queueType: 'AWS_SQS' };
    }
    if (this.isRedisAvailable && this.queue) {
      return { ready: true, queueType: 'REDIS_BULLMQ' };
    }
    if (env.NODE_ENV === 'production') {
      return {
        ready: false,
        queueType: 'IN_MEMORY_FALLBACK',
        reason: 'Production environment requires external Redis or AWS SQS queue. In-memory fallback is unsafe for multi-instance deployments.',
      };
    }
    return { ready: true, queueType: 'IN_MEMORY_DEV' };
  }

  /**
   * Transactional Outbox / Recovery Sweeper:
   * Inspects and re-enqueues events stuck in 'PENDING' state (e.g. if worker/server crashed during ingestion).
   */
  public static async recoverPendingEvents(maxAgeSeconds: number = 30): Promise<number> {
    try {
      const res = await query(
        `SELECT id, payload_json, idempotency_key 
         FROM webhook_events 
         WHERE status = 'PENDING' AND received_at < NOW() - ($1 || ' seconds')::INTERVAL
         LIMIT 50;`,
        [maxAgeSeconds.toString()]
      );

      let recoveredCount = 0;
      for (const row of res.rows) {
        const payload: WebhookPayload = typeof row.payload_json === 'string' 
          ? JSON.parse(row.payload_json) 
          : row.payload_json;

        const jobData: WebhookJobData = {
          eventId: row.id,
          payload,
          providerMessageId: row.idempotency_key,
          timestamp: Date.now(),
        };

        if (this.isRedisAvailable && this.queue) {
          await this.queue.add('process-webhook', jobData, {
            jobId: `${row.idempotency_key}-retry-${Date.now()}`,
          });
        } else {
          setImmediate(async () => {
            try {
              const { WebhookWorker } = await import('./webhookWorker');
              await WebhookWorker.processJob(jobData);
            } catch (workerErr: any) {
              // WebhookWorker already logs and records failure in DB
            }
          });
        }
        recoveredCount++;
      }
      return recoveredCount;
    } catch (err: any) {
      console.error('Error during pending webhook event recovery:', err.message);
      return 0;
    }
  }

  public static getQueue(): Queue<WebhookJobData> | null {
    return this.queue;
  }
}
