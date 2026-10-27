import { app } from './app';
import { env } from './config/env';

const PORT = env.PORT || process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 AutoMask Server running at http://localhost:${PORT}`);
  console.log(`📡 API Endpoints available at http://localhost:${PORT}/api/v1`);

  // Initialize BullMQ Queue & Worker in local / standalone mode
  try {
    const { WebhookQueueService } = await import('./modules/queue/webhookQueue');
    await WebhookQueueService.initQueue();

    if (!env.RUN_STANDALONE_WORKER) {
      const { WebhookWorker } = await import('./modules/queue/webhookWorker');
      await WebhookWorker.initWorker();
    } else {
      console.log('⚡ Standalone Worker mode active: API server will enqueue jobs; dedicated worker process will consume.');
    }
  } catch (err: any) {
    console.warn('Queue/Worker initialization notice:', err?.message || err);
  }
});
