import serverlessExpress from '@codegenie/serverless-express';
import { app } from './app';
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

/**
 * AutoMask AWS Lambda Handler for API Gateway (HTTP API v2 & REST API v1)
 * 
 * Configures:
 * - Express request wrapping with rawBody preservation for Meta WhatsApp Webhook HMAC-SHA256 verification
 * - Non-blocking event loop (context.callbackWaitsForEmptyEventLoop = false) for connection pooling
 * - Cold-start singleton caching across invocations
 */
let serverlessExpressInstance: any;

async function setupServerlessExpress() {
  try {
    const { WebhookQueueService } = await import('./modules/queue/webhookQueue');
    await WebhookQueueService.initQueue();
  } catch (queueErr) {
    console.warn('Queue initialization notice in Lambda:', queueErr);
  }

  serverlessExpressInstance = serverlessExpress({
    app,
    logSettings: {
      level: process.env.NODE_ENV === 'production' ? 'error' : 'info',
    },
  });
  return serverlessExpressInstance;
}

export const handler = async (
  event: any,
  context: any
): Promise<any> => {
  // Allow open database pool sockets without keeping Lambda execution waiting
  context.callbackWaitsForEmptyEventLoop = false;

  // Resolve request method and origin
  const httpMethod = event?.requestContext?.http?.method || event?.httpMethod || 'GET';
  const origin = event?.headers?.origin || event?.headers?.Origin || '*';

  // Immediate Lambda-level preflight handling for CORS
  if (httpMethod.toUpperCase() === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With, X-Hub-Signature-256, Accept',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
      },
      body: ''
    };
  }

  if (!serverlessExpressInstance) {
    await setupServerlessExpress();
  }

  const result = await serverlessExpressInstance(event, context);

  // Guarantee CORS headers on EVERY response
  if (result) {
    result.headers = result.headers || {};
    result.headers['Access-Control-Allow-Origin'] = origin;
    result.headers['Access-Control-Allow-Credentials'] = 'true';
    result.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
    result.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Cookie, X-Requested-With, X-Hub-Signature-256, Accept';
    result.headers['Vary'] = 'Origin';
  }

  return result;
};
