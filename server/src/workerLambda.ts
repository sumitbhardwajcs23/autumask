import { SQSEvent, SQSBatchResponse, Context } from 'aws-lambda';
import { WebhookWorker } from './modules/queue/webhookWorker';
import { WebhookJobData } from './modules/queue/webhookQueue';

/**
 * AutoMask AWS Lambda SQS Event Worker Handler
 * 
 * Consumes webhook and asynchronous automation events from Amazon SQS.
 * Features:
 * - Serverless event-driven execution (zero cost when queue is idle)
 * - Concurrency control via SQS event source mapping
 * - Partial batch failure reporting (ReportBatchItemFailures)
 * - Poison message protection via Dead-Letter Queue (DLQ)
 * - Database idempotency enforcement
 */
export const handler = async (
  event: SQSEvent,
  context: Context
): Promise<SQSBatchResponse> => {
  context.callbackWaitsForEmptyEventLoop = false;

  const batchItemFailures: { itemIdentifier: string }[] = [];

  for (const record of event.Records) {
    try {
      console.log(`[SQS Worker] Processing record ${record.messageId}`);
      const jobData: WebhookJobData = JSON.parse(record.body);

      if (!jobData || !jobData.eventId) {
        throw new Error('MALFORMED_SQS_PAYLOAD: Missing eventId or payload');
      }

      await WebhookWorker.processJob(jobData);
      console.log(`[SQS Worker] Successfully processed event ${jobData.eventId} (Message: ${record.messageId})`);
    } catch (err: any) {
      console.error(`[SQS Worker] Failed processing record ${record.messageId}:`, err);
      // Mark specific message for retry / DLQ without failing entire batch
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};
