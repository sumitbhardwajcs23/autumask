import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api';
import { platformRouter } from './routes/platform';
import { env } from './config/env';

dotenv.config();

const app = express();

// Production CORS with explicit frontend-origin allow-list
const allowedOrigins = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, Meta webhooks)
    if (!origin) return callback(null, true);
    if (env.NODE_ENV !== 'production' || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error(`Origin '${origin}' is not permitted by AutoMask CORS policy`));
  },
  credentials: true,
}));

app.use(cookieParser());

// Crucial: preserve raw request body for Meta HMAC SHA256 signature verification
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root Health Probe
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'AutoMask WhatsApp Automation SaaS API',
    version: '2.0.0',
    documentation: '/api/v1',
  });
});

// 1. Application Liveness Probe (process is running and event loop is alive)
app.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'AutoMask SaaS API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 2. Dependency Readiness Probe (evaluates DB connection and queue readiness)
app.get('/health/ready', async (req, res) => {
  let dbStatus = 'DISCONNECTED';
  let dbLatencyMs = -1;
  try {
    const start = Date.now();
    const { query } = await import('./database/connection');
    await query('SELECT 1;');
    dbLatencyMs = Date.now() - start;
    dbStatus = 'CONNECTED';
  } catch (err: any) {
    dbStatus = `ERROR: ${err.message}`;
  }

  let queueCheck: { ready: boolean; queueType: string; reason?: string } = { ready: true, queueType: 'UNKNOWN' };
  try {
    const { WebhookQueueService } = await import('./modules/queue/webhookQueue');
    queueCheck = WebhookQueueService.validateProductionReadiness();
  } catch (err: any) {
    queueCheck = { ready: false, queueType: 'ERROR', reason: err.message };
  }

  const isDbReady = dbStatus === 'CONNECTED';
  const isQueueReady = queueCheck.ready;
  const isReady = isDbReady && isQueueReady;

  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'READY' : 'NOT_READY',
    service: 'AutoMask SaaS API',
    environment: env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    dependencies: {
      database: { status: dbStatus, latencyMs: dbLatencyMs, ready: isDbReady },
      queue: { ...queueCheck },
    },
  });
});

// 3. Comprehensive Health Probe (Liveness + Readiness Diagnostics)
app.get('/health', async (req, res) => {
  let dbStatus = 'DISCONNECTED';
  let dbLatencyMs = -1;
  try {
    const start = Date.now();
    const { query } = await import('./database/connection');
    await query('SELECT 1;');
    dbLatencyMs = Date.now() - start;
    dbStatus = 'CONNECTED';
  } catch (err: any) {
    dbStatus = `ERROR: ${err.message}`;
  }

  let queueCheck: { ready: boolean; queueType: string; reason?: string } = { ready: true, queueType: 'UNKNOWN' };
  try {
    const { WebhookQueueService } = await import('./modules/queue/webhookQueue');
    queueCheck = WebhookQueueService.validateProductionReadiness();
  } catch (err: any) {
    queueCheck = { ready: false, queueType: 'ERROR', reason: err.message };
  }

  const isHealthy = dbStatus === 'CONNECTED' && queueCheck.ready;
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'AutoMask SaaS API',
    version: '2.0.0',
    environment: env.NODE_ENV || 'production',
    serverless: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
    time: new Date().toISOString(),
    components: {
      liveness: { status: 'UP', uptime: process.uptime() },
      database: { status: dbStatus, latencyMs: dbLatencyMs },
      queue: queueCheck,
    },
  });
});

// Platform Management Console Routes (AutoMask Internal SaaS Operations)
app.use('/api/v1/platform', platformRouter);
app.use('/api/platform', platformRouter);

// Workspace API Routes (Subscribing Business Workspace Operations)
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err?.message || 'Unknown error' });
});

export { app };
