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
  serverlessExpressInstance = serverlessExpress({
    app,
    logSettings: {
      level: process.env.NODE_ENV === 'production' ? 'error' : 'info',
    },
  });
  return serverlessExpressInstance;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // Allow open database pool sockets without keeping Lambda execution waiting
  context.callbackWaitsForEmptyEventLoop = false;

  if (!serverlessExpressInstance) {
    await setupServerlessExpress();
  }

  return serverlessExpressInstance(event, context);
};
