import dotenv from 'dotenv';
dotenv.config();

import { WebhookWorker } from './modules/queue/webhookWorker';
import { env } from './config/env';

/**
 * AutoMask Dedicated Queue Worker
 *
 * Scales independently of Express HTTP API instances in containerized / serverless
 * environments. Consumes BullMQ jobs from `inbound-webhook-queue` with bounded concurrency
 * and automatic retry tracking.
 */
async function startWorker() {
  console.log('====================================================');
  console.log('  AutoMask WhatsApp Standalone Queue Worker');
  console.log(`  Environment: ${env.NODE_ENV}`);
  console.log(`  Redis URL:   ${env.REDIS_URL ? env.REDIS_URL.replace(/:[^:@]+@/, ':****@') : 'redis://127.0.0.1:6379'}`);
  console.log('====================================================');

  try {
    await WebhookWorker.initWorker();
    console.log('🚀 Standalone queue worker is actively listening for jobs...');
  } catch (error: any) {
    console.error('❌ Failed to start standalone queue worker:', error.message);
    process.exit(1);
  }

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Shutting down worker gracefully...`);
    try {
      // Allow in-flight jobs 5 seconds to complete
      setTimeout(() => {
        console.warn('⚠️ Force exiting worker after shutdown timeout');
        process.exit(0);
      }, 5000).unref();

      process.exit(0);
    } catch (err: any) {
      console.error('Error during worker shutdown:', err);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startWorker().catch((err) => {
  console.error('Fatal worker process error:', err);
  process.exit(1);
});
