# AutoMask WhatsApp Automation SaaS — AWS Production Deployment Runbook

This guide covers the deployment, configuration, verification, security enforcement, and operational maintenance of **AutoMask** using **AWS Amplify Hosting**, **AWS Lambda**, **Amazon API Gateway**, **Amazon SQS**, and **Amazon RDS PostgreSQL 17**.

---

## 1. Architectural Blueprint

```mermaid
flowchart TD
    User([End Users / Coaches / Students])
    Meta([Meta WhatsApp Cloud API])
    Amplify[AWS Amplify Hosting<br/>React + Vite Static SPA CDN]
    APIGW[Amazon API Gateway HTTP API v2<br/>Public HTTPS Endpoint]
    ApiLambda[Backend Express API Lambda<br/>serverless-express | Timeout: 30s]
    WorkerLambda[Background Worker Lambda<br/>Event-Source Mapping | Timeout: 90s]
    SQS[Amazon SQS Queue<br/>inbound-webhook-queue]
    DLQ[Amazon SQS Dead-Letter Queue<br/>automask-webhook-dlq]
    EventBridge[Amazon EventBridge Scheduler<br/>15-min Maintenance Cron]
    RDS[(Amazon RDS PostgreSQL 17<br/>Multi-Tenant Row-Level Security)]
    Secrets[AWS Secrets Manager<br/>DB Credentials, JWT, Meta Secrets]

    User -->|"HTTPS (SPA Deep Links)"| Amplify
    Amplify -->|"REST API / JWT Auth<br/>VITE_API_BASE_URL"| APIGW
    Meta -->|"POST Webhook Events<br/>X-Hub-Signature-256"| APIGW
    APIGW -->|"Proxy Any /{proxy+}"| ApiLambda
    ApiLambda -->|"Durable Event Enqueue"| SQS
    SQS -->|"Trigger Batch (max 5)"| WorkerLambda
    SQS -.->|"Retries Exceeded (3x)"| DLQ
    EventBridge -->|"Scheduled Maintenance"| ApiLambda
    ApiLambda -->|"Least-Privilege Connection<br/>automask_app (NOBYPASSRLS)"| RDS
    WorkerLambda -->|"Grounded RAG / CRM<br/>withTenantContext"| RDS
    ApiLambda -.->|"Retrieve Runtime Secrets"| Secrets
    WorkerLambda -.->|"Retrieve Runtime Secrets"| Secrets
```

---

## 2. Frontend Deployment (AWS Amplify Hosting)

### 2.1 Monorepo Configuration
AutoMask is structured as a monorepo containing `client/` (Frontend React SPA) and `server/` (Backend Express API).

The repository includes both root `amplify.yml` and `client/amplify.yml`:
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
        - echo "Building AutoMask React SPA for Amplify Hosting..."
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
```

### 2.2 SPA Deep-Link Rewrites
In AWS Amplify Hosting Console under **App Settings > Rewrites and redirects**, configure:

| Source Address | Target Address | Type | Country |
| :--- | :--- | :--- | :--- |
| `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>` | `/index.html` | `200 (Rewrite)` | - |

*(Alternatively provided via `client/public/_redirects` which is automatically copied to `dist/` on build).*

### 2.3 Build-Time Environment Variables
In the AWS Amplify Console under **App Settings > Environment variables**, define:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Public HTTPS URL of the deployed API Gateway | `https://xxxxxx.execute-api.us-east-1.amazonaws.com/api/v1` |

---

## 3. Backend Express on AWS Lambda

### 3.1 Architecture Adaptation
1. **Modular Express Core (`server/src/app.ts`)**: Encapsulates all CORS, cookie-parser, health checks, routing, and raw body preservation for HMAC validation.
2. **AWS Lambda Adapter (`server/src/lambda.ts`)**: Wraps `app` using `@codegenie/serverless-express` and configures `context.callbackWaitsForEmptyEventLoop = false` so idle PostgreSQL pool sockets do not block execution.
3. **Standalone Server Option (`server/src/server.ts`)**: Preserved for local development, Docker, and containerized scaling.

### 3.2 Raw Body Preservation for Meta WhatsApp Webhooks
To verify Meta webhook signatures (`X-Hub-Signature-256`), Express must preserve the exact untouched raw byte payload:
```typescript
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));
```
When Meta delivers an inbound message webhook, `server/src/services/webhookPipeline.ts` computes:
```typescript
const computedSignature = crypto
  .createHmac('sha256', env.META_APP_SECRET)
  .update(req.rawBody)
  .digest('hex');
```
If the header `sha256=${computedSignature}` does not match, the request is immediately rejected with HTTP 401.

---

## 4. Database Provisioning & Multi-Tenant Security

### 4.1 PostgreSQL 17 RDS / Aurora Setup
The CloudFormation template (`infrastructure/template.yaml`) provisions:
- **Engine**: PostgreSQL 16.4 / 17
- **Instance**: `db.t4g.micro` (Staging) or `db.t4g.small` / Aurora Serverless v2 (Production)
- **Subnets**: Private Multi-AZ Subnets (`10.0.11.0/24`, `10.0.12.0/24`)
- **Security Group**: Ingress on Port 5432 restricted strictly to `LambdaSecurityGroup`.

### 4.2 Application Role (`automask_app`) vs Admin Role
1. **`automask_admin`**: Used exclusively during CI/CD to apply migrations.
2. **`automask_app`**: Used by Lambda runtime.
   - Attributes: `NOSUPERUSER`, `NOBYPASSRLS`
   - Every tenant transaction sets:
     ```sql
     SELECT set_config('app.current_workspace_id', $1, true);
     ```
   - When no tenant context is set, queries on tenant tables return **0 rows** (Fail-Closed).

### 4.3 Automated Migration & Verification Runner
Run the automated verification script:
```bash
npm run verify:rds
```
This tests:
- PostgreSQL SSL connection
- Migrations 001 to 008 applied
- `automask_app` role security attributes in `pg_roles`
- Fail-closed isolation test
- Cross-tenant RLS boundaries test

---

## 5. Background Jobs (Amazon SQS + Worker Lambda)

### 5.1 Architecture
Normal request-handling Lambdas must respond to WhatsApp webhooks in **under 3 seconds** to avoid Meta retry storms.

1. **Ingest Phase**: API Lambda verifies the signature, persists the webhook to PostgreSQL `webhook_events`, and sends the job payload to `AutoMaskWebhookQueue` in Amazon SQS.
2. **Worker Phase**: `AutoMaskWorkerFunction` (`server/src/workerLambda.ts`) is triggered automatically by AWS SQS Event Source Mapping in batches of up to 5 messages.
3. **Idempotency & Retries**:
   - Unique constraint on `webhook_events.idempotency_key` ensures duplicate WhatsApp webhook deliveries are safely deduplicated.
   - If a transient failure occurs (e.g. OpenAI rate limit), `ReportBatchItemFailures` flags only the failed message ID for retry.
   - After 3 failed attempts, the message moves to `AutoMaskWebhookDLQ` with a 14-day retention period.

### 5.2 Scheduled Maintenance (EventBridge)
Every 15 minutes, an Amazon EventBridge Rule invokes the maintenance endpoint to:
- Sweep and expire past-due Support Grants (SRS Line 615).
- Release unclaimed coaching demo booking reservations.

---

## 6. AWS Account Permissions Audit

Our automated scan of the active AWS identity:
- **Account ID**: `945125987314`
- **IAM Identity**: `arn:aws:iam::945125987314:user/s1`

### Current Permission Audit Results:
| Service | Action Tested | Result | Resolution |
| :--- | :--- | :--- | :--- |
| **AWS Lambda** | `lambda:ListFunctions` | ✅ **PERMITTED** | Existing `airvix-backend-api` function detected |
| **AWS Lambda** | `lambda:GetFunction` | ✅ **PERMITTED** | Can inspect and read Lambda configurations |
| **AWS Amplify** | `amplify:ListApps` | ❌ **AccessDenied** | Needs `amplify:*` policy attached |
| **CloudFormation** | `cloudformation:ListStacks` | ❌ **AccessDenied** | Needs `cloudformation:*` policy attached |
| **API Gateway** | `apigateway:GET` | ❌ **AccessDenied** | Needs `apigateway:*` policy attached |
| **Amazon S3** | `s3:ListAllMyBuckets` | ❌ **AccessDenied** | Needs `s3:*` policy attached |
| **Amazon RDS** | `rds:DescribeDBInstances` | ❌ **AccessDenied** | Needs `rds:*` policy attached |
| **Amazon SQS** | `sqs:ListQueues` | ❌ **AccessDenied** | Needs `sqs:*` policy attached |
| **IAM** | `iam:GetUser` | ❌ **AccessDenied** | Needs `iam:PassRole` and IAM role creation for Lambda |

### Action Required by AWS Administrator:
Attach the provided IAM policy in `infrastructure/iam-deployment-policy.json` to user `s1` or run the deployment using an AWS Administrator / CI/CD execution role.

---

## 7. Expected Monthly Infrastructure Costs

### Staging Environment (~$25 - $35 / month)
| Component | Configuration | Monthly Cost (Est.) |
| :--- | :--- | :--- |
| **AWS Amplify Hosting** | 5 GB storage, 15 GB bandwidth | ~$0.50 (Mostly Free Tier) |
| **API Gateway HTTP API** | 500,000 requests/mo ($1.00 / million) | ~$0.50 |
| **AWS Lambda (API + Worker)** | 500,000 invocations, 1GB RAM, 200ms avg | ~$1.67 (Free Tier covers 1M reqs) |
| **Amazon SQS + DLQ** | 200,000 messages/mo | $0.00 (Free Tier 1M requests) |
| **Amazon RDS PostgreSQL** | `db.t4g.micro`, 20GB GP3 storage | ~$15.00 - $18.00 |
| **NAT Gateway** | 1 Single-AZ NAT Gateway | ~$32.00 (Can use VPC Endpoints to reduce) |
| **Total Staging** | | **~$35 - $50 / month** |

### Production Environment (~$65 - $110 / month)
| Component | Configuration | Monthly Cost (Est.) |
| :--- | :--- | :--- |
| **AWS Amplify Hosting** | Custom domain with global CloudFront CDN | ~$5.00 |
| **API Gateway HTTP API** | 5M requests/mo | ~$5.00 |
| **AWS Lambda** | 5M invocations across API and SQS workers | ~$16.00 |
| **Amazon RDS PostgreSQL** | `db.t4g.small` or Aurora Serverless v2 | ~$35.00 - $55.00 |
| **Amazon SQS** | High-throughput buffer | ~$2.00 |
| **AWS Secrets Manager** | 2 active secrets ($0.40/secret) | ~$0.80 |
| **Total Production** | | **~$65 - $80 / month** |

---

## 8. Deployment Execution Steps

Once the IAM policy is attached to user `s1`:

```powershell
# 1. Package and compile assets
cd d:\SD\Agents\WhatsappAutomationSAS
node scripts/package-lambda.js

# 2. Deploy AWS Serverless Stack (API Gateway + Lambda + SQS + RDS)
cd infrastructure
.\deploy.ps1 -Environment staging -Region us-east-1

# 3. Connect AWS Amplify Hosting:
# Go to AWS Amplify Console > Create new app > Host web app > Connect GitHub repo
# Set App root to "." and build settings will automatically detect amplify.yml
# Set VITE_API_BASE_URL to the HttpApiUrl output from deploy.ps1
```
