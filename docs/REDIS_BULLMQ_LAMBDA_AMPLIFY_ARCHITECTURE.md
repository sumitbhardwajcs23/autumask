# AutoMask Production Architecture: Redis + BullMQ + PostgreSQL + AWS Amplify + AWS Lambda

This technical blueprint details the end-to-end design, data flow, configuration, and deployment procedures for running AutoMask on:
- **Frontend**: **AWS Amplify Hosting** (React 18 + Vite SPA on Global Edge CDN)
- **Backend API**: **AWS Lambda** (Express.js via `@codegenie/serverless-express` + API Gateway HTTP API v2)
- **Database**: **Amazon RDS PostgreSQL** (Multi-tenant with Row-Level Security)
- **Queue & Cache**: **Redis + BullMQ** (AWS ElastiCache Redis / Upstash Serverless Redis)
- **Queue Worker**: **AWS ECS Fargate Task** (Standalone persistent BullMQ worker) or **Dual-Mode SQS Lambda**

---

## 1. High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph Clients["1. Client Layer"]
        User["End Users / Sales / Students"]
        Meta["Meta WhatsApp Cloud API"]
    end

    subgraph Frontend["2. Frontend (AWS Amplify Hosting)"]
        Amplify["AWS Amplify CDN / CloudFront<br/>React 18 + Vite SPA<br/>Auto CI/CD & SSL"]
    end

    subgraph API_Layer["3. Serverless API (AWS Lambda)"]
        APIGW["Amazon API Gateway HTTP API v2<br/>Path: /api/v1/*"]
        LambdaAPI["AutoMask Express API (AWS Lambda)<br/>serverless-express | Node.js 20.x<br/>Auto-scaling 0 to N"]
    end

    subgraph Storage["4. Database & Queue Layer"]
        RDS[("Amazon RDS PostgreSQL<br/>Port 5432 | Row-Level Security<br/>automask_app (NOBYPASSRLS)")]
        Redis[("Redis Cluster / ElastiCache<br/>Port 6379 / TLS<br/>BullMQ Persistence & Cache")]
    end

    subgraph Workers["5. Asynchronous Processing (BullMQ Worker)"]
        FargateWorker["BullMQ Dedicated Worker (AWS ECS Fargate)<br/>npm run worker (server/src/worker.ts)<br/>Pulls jobs from inbound-webhook-queue"]
    end

    User -->|"HTTPS / SPA Deep Links"| Amplify
    Amplify -->|"REST API / JWT Session<br/>VITE_API_BASE_URL"| APIGW
    Meta -->|"POST Webhook Events<br/>X-Hub-Signature-256"| APIGW
    APIGW -->|"Proxy /{proxy+}"| LambdaAPI

    LambdaAPI -->|"Grounded Query / Tenant Context"| RDS
    LambdaAPI -->|"Enqueue Job in < 10ms<br/>inbound-webhook-queue"| Redis

    FargateWorker -->|"Active Long-Polling / Lock Renewals<br/>Concurrency: 5"| Redis
    FargateWorker -->|"Grounded RAG / CRM Updates<br/>withTenantContext"| RDS
    FargateWorker -->|"Outbound WhatsApp Replies"| Meta
```

---

## 2. Core Architectural Roles & Separation

| Component | Technology | Role & Behavior |
| :--- | :--- | :--- |
| **Frontend** | **AWS Amplify Hosting** | Hosts the pre-compiled React 18 SPA (`client/dist`). Provides automated branch builds from Git, global CloudFront edge delivery, SSL, and custom domains (e.g. `app.automask.io`). |
| **Backend API** | **AWS Lambda + API Gateway** | Executes the Express.js API via `@codegenie/serverless-express`. Handles authentication, JWTs, Meta webhook signature validation, tenant routing, and **acts as the BullMQ Producer**. Scales automatically to 0 when idle. |
| **Database** | **PostgreSQL (Amazon RDS)** | Stores tenant entities, audit logs, and conversations. Strictly enforced via **PostgreSQL Row-Level Security (RLS)** using least-privilege `automask_app` database user. |
| **Queue & Cache** | **Redis + BullMQ** | In-memory datastore for fast job persistence (`inbound-webhook-queue`, broadcast dispatches, follow-up timers, deduplication idempotency keys). |
| **Queue Worker** | **AWS ECS Fargate / Standalone Process** | Executes `server/src/worker.ts` with BullMQ `Worker`. Maintains persistent Redis connections, job locks, concurrency controls, and retries. |

---

## 3. How BullMQ and AWS Lambda Interact

### The Challenge of BullMQ Workers in Pure Lambda:
- **AWS Lambda** is ephemeral and request-driven: instances freeze or terminate when there are no active HTTP invocations.
- A **BullMQ Worker** (`new Worker(...)`) uses Redis blocking operations (`BLMOVE`, `BRPOPLPUSH`) and requires an active Node.js event loop to renew locks and detect delayed jobs.

### The Proven Solution (Hybrid Serverless):
1. **Lambda = BullMQ Producer**:
   - The Lambda API handles incoming HTTP requests and Meta webhooks.
   - It writes durably to PostgreSQL (`webhook_events`), pushes a job into BullMQ (`inbound-webhook-queue`), and returns HTTP 200 to Meta in under **50ms**.
   ```typescript
   // Inside server/src/modules/queue/webhookQueue.ts:
   await this.queue.add('process-webhook', jobData, {
     attempts: 3,
     backoff: { type: 'exponential', delay: 1000 },
     removeOnComplete: 100,
   });
   ```

2. **ECS Fargate = BullMQ Consumer (Worker)**:
   - A single, lightweight ECS Fargate task (`0.25 vCPU`, `0.5 GB RAM` — costs ~$7-9/month) runs `npm run worker:prod` (`server/src/worker.ts`).
   - It runs 24/7 inside the same VPC as Redis and RDS, processing webhook queues, RAG answers, and automated follow-ups with zero dropouts.

3. **Dual-Mode SQS Fallback (Already in Codebase)**:
   - If 100% serverless with zero persistent containers is desired, AutoMask *also* includes `server/src/workerLambda.ts`. Setting `SQS_QUEUE_URL` activates SQS event-source mapping to invoke worker Lambdas only when messages arrive.

---

## 4. Component Configuration & Setup

### 4.1 Frontend on AWS Amplify (`amplify.yml`)
Amplify detects `amplify.yml` in the project root:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd client
        - npm ci
    build:
      commands:
        - echo "Building AutoMask React SPA for Amplify..."
        - npm run build
  artifacts:
    baseDirectory: client/dist
    files:
      - '**/*'
  cache:
    paths:
      - client/node_modules/**/*
customHeaders:
  - pattern: '**/*'
    headers:
      - key: 'Strict-Transport-Security'
        value: 'max-age=31536000; includeSubDomains; preload'
      - key: 'X-Content-Type-Options'
        value: 'nosniff'
      - key: 'X-Frame-Options'
        value: 'DENY'
      - key: 'Referrer-Policy'
        value: 'strict-origin-when-cross-origin'
```

#### Amplify Environment Variables:
| Variable | Value Example | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://api.automask.io/api/v1` | Public API Gateway endpoint |

#### Amplify SPA Rewrite Rule (App Settings > Rewrites):
| Source Address | Target Address | Type |
| :--- | :--- | :--- |
| `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>` | `/index.html` | `200 (Rewrite)` |

---

### 4.2 Backend on AWS Lambda (`server/src/lambda.ts`)
The serverless wrapper converts API Gateway HTTP API v2 events into standard Express requests while preserving the raw buffer for Meta HMAC-SHA256 verification:

```typescript
import serverlessExpress from '@codegenie/serverless-express';
import { app } from './app';
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

let serverlessExpressInstance: any;

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // Prevent open Redis/PostgreSQL connections from keeping Lambda waiting
  context.callbackWaitsForEmptyEventLoop = false;

  if (!serverlessExpressInstance) {
    serverlessExpressInstance = serverlessExpress({
      app,
      logSettings: {
        level: process.env.NODE_ENV === 'production' ? 'error' : 'info',
      },
    });
  }

  return serverlessExpressInstance(event, context);
};
```

#### Key Lambda Environment Variables:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://automask_app:AppSecurePass123!@automask-db.xxxx.rds.amazonaws.com:5432/automask_db?sslmode=require
REDIS_URL=rediss://default:RedisPassword@automask-redis.xxxx.cache.amazonaws.com:6379
JWT_SECRET=super_secret_32_char_cryptographic_jwt_key
META_APP_SECRET=your_meta_app_secret
META_WEBHOOK_VERIFY_TOKEN=your_meta_webhook_verify_token
META_ACCESS_TOKEN=your_meta_permanent_access_token
CORS_ORIGIN=https://app.automask.io,https://main.xxxx.amplifyapp.com
```

---

### 4.3 Redis Setup (AWS ElastiCache or Upstash)
- **AWS ElastiCache for Redis (VPC)**:
  - Create Redis replication group in the private VPC subnets.
  - Enable In-Transit Encryption (TLS) and specify a Redis Auth token.
  - Connection string format: `rediss://:YourAuthToken@master.automask-redis.xxxx.cache.amazonaws.com:6379`
- **Upstash Redis (Serverless)**:
  - Connectable over standard Redis protocol via `REDIS_URL=rediss://default:xxxx@xxxx.upstash.io:6379`.
  - Automatically handles connection pooling and scales to zero.

---

### 4.4 BullMQ Dedicated Worker (AWS ECS Fargate Task)
To run the BullMQ worker continuously on AWS:

1. **Docker Container (`server/Dockerfile.worker`)**:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
ENV NODE_ENV=production
CMD ["node", "dist/worker.js"]
```

2. **ECS Task Definition**:
- **CPU**: 256 (.25 vCPU)
- **Memory**: 512 MB
- **Network Mode**: `awsvpc` (placed inside the same Private Subnet as RDS and ElastiCache)
- **Restart Policy**: Always restart on crash (`desiredCount: 1`)

---

## 5. Deployment Step Sequence

```text
Step 1: PostgreSQL Setup (RDS)
        └── Create RDS instance in VPC Private Subnet
        └── Run migrations: npm run migrate

Step 2: Redis Cluster Setup (ElastiCache or Upstash)
        └── Deploy Redis with TLS & Auth Token
        └── Open port 6379 to Lambda & ECS Security Groups

Step 3: Backend Lambda Deployment (SAM or Serverless Framework)
        └── Build: npm run build in server/
        └── Deploy template.yaml with API Gateway HTTP API v2

Step 4: BullMQ Worker Deployment (ECS Fargate)
        └── Push server Docker image to Amazon ECR
        └── Start ECS Fargate Service with 1 replica

Step 5: Frontend Amplify Deployment
        └── Connect GitHub repo to AWS Amplify Console
        └── Set VITE_API_BASE_URL to API Gateway HTTPS endpoint
        └── Deploy main branch

Step 6: Meta WhatsApp Webhook Registration
        └── In Meta App Dashboard, register Webhook Callback URL:
            https://<api-gateway-id>.execute-api.<region>.amazonaws.com/api/v1/whatsapp/webhook
        └── Verify token handshake (HTTP 200 challenge response)
```

---

## 6. Verification & Health Check Commands

| Check | Target | Command | Expected Output |
| :--- | :--- | :--- | :--- |
| **API Health** | Lambda API | `curl -f https://<api-gw-url>/api/v1/health` | `HTTP 200 {"status":"OK"}` |
| **Redis & Queue** | BullMQ Status | `curl -f https://<api-gw-url>/api/v1/health/queue` | `{"queue":"REDIS_BULLMQ","status":"connected"}` |
| **Meta Webhook** | Handshake | `curl "https://<api-gw-url>/api/v1/whatsapp/webhook?hub.mode=subscribe&hub.challenge=test_123&hub.verify_token=<token>"` | `HTTP 200 test_123` |
| **Amplify SPA** | Frontend CDN | `curl -I https://app.automask.io/inbox` | `HTTP 200 OK` (index.html fallback) |
