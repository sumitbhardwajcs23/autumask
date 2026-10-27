# AutoMask — Independent Frontend & Backend Deployment Guide

This guide details the architecture, configuration, containerization, deployment pipelines, rollback procedures, and smoke testing for independently building, deploying, and scaling the **AutoMask** SaaS platform.

---

## 1. Architectural Architecture & Service Separation

AutoMask is architected as decoupled, independently deployable services:

```mermaid
graph TD
    Client["Client (React 18 + Vite + Nginx)<br/>Port 80/3000<br/>Static SPA Hosting"]
    Meta["Meta WhatsApp Cloud API<br/>(Inbound & Status Webhooks)"]
    API["Backend API (Node.js + Express + TS)<br/>Port 5000<br/>Horizontal Scaling"]
    Worker["Queue Worker (BullMQ + Node.js)<br/>Independent Scaling<br/>Concurrency: 5"]
    DB[("PostgreSQL 17 Database<br/>Port 5432/5433<br/>Row-Level Security (RLS)")]
    Redis[("Redis 7 Cache & Queue<br/>Port 6379<br/>BullMQ Persistence")]

    Client -->|"HTTPS / REST API<br/>credentials: include"| API
    Meta -->|"Public HTTPS Webhooks<br/>HMAC-SHA256 Signed"| API
    API -->|"Enqueues Jobs<br/>(inbound-webhook-queue)"| Redis
    Worker -->|"Pulls Jobs<br/>(Concurrency: 5)"| Redis
    API -->|"Tenant-Scoped Queries<br/>automask_app (NOBYPASSRLS)"| DB
    Worker -->|"Grounded RAG / CRM<br/>withTenantContext"| DB
```

### Component Boundaries:
1. **Frontend (`client/`)**: Pure static React Single Page Application (SPA). Zero server dependencies, zero backend secrets. Distributable via CDN / S3 / Nginx / Vercel / Cloudflare Pages.
2. **Backend API (`server/`)**: Express REST API handling authenticated traffic, webhook ingestion, tenant authorization, and RLS enforcement.
3. **Queue Worker (`server/src/worker.ts`)**: Standalone BullMQ worker process consuming from `inbound-webhook-queue`. Scales horizontally based on queue depth without increasing HTTP server count.
4. **PostgreSQL Database**: Isolated multi-tenant storage with Row Level Security (RLS) policies and least-privilege `automask_app` database user.
5. **Redis Store**: In-memory message queue broker and caching layer for webhook idempotency and delayed retry jobs.

---

## 2. Frontend Deployment (`client/`)

### 2.1 Build & Output Directory
- **Source Directory**: `client/`
- **Build Command**: `npm run build` (runs `tsc && vite build`)
- **Output Directory**: `client/dist/`
- **Output Assets**:
  - `dist/index.html` (Single-page app entry)
  - `dist/assets/index-[hash].js` (Minified JavaScript bundle)
  - `dist/assets/index-[hash].css` (Compiled Tailwind CSS)

### 2.2 Environment Configuration
Frontend environment variables are configured at **build time** via Vite:

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes** | Deployed Backend API base URL including version prefix | `https://api.automask.io/api/v1` |

> [!CAUTION]
> **Zero Secret Leakage Rule:**
> Vite exposes all `VITE_*` environment variables to the public client browser bundle. **NEVER** include database credentials, JWT secrets, Redis passwords, Meta App Secrets, or OpenAI keys in `client/.env`.

### 2.3 Single Page Application (SPA) Routing Fallback
Because AutoMask uses client-side routing, any direct page reload on deep links (e.g. `/inbox`, `/leads`, `/settings`) must be redirected to `/index.html`:

- **Nginx (`client/nginx.conf`)**:
  ```nginx
  location / {
      try_files $uri $uri/ /index.html;
  }
  ```
- **Vercel (`vercel.json`)**:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
- **Netlify (`_redirects`)**:
  ```text
  /*    /index.html   200
  ```
- **AWS S3 + CloudFront**: Set CloudFront Error Response for HTTP 403 & 404 to respond with `/index.html` and HTTP 200.

### 2.4 Containerized Deployment
```bash
# Build the Docker image with your production API URL
docker build --build-arg VITE_API_BASE_URL=https://api.automask.io/api/v1 -t automask-client:latest ./client

# Run container on port 80
docker run -d --name automask_client -p 80:80 automask-client:latest
```

---

## 3. Backend Deployment (`server/`)

### 3.1 Build, Start, and Migration Commands
- **Source Directory**: `server/`
- **Build Command**: `npm run build` (compiles `src/**/*.ts` to `dist/**/*.js` via `tsc`)
- **API Start Command**: `npm start` (runs `node dist/server.js`)
- **Queue Worker Start Command**: `npm run worker:prod` (runs `node dist/worker.js`)
- **Database Migration**: `npm run migrate` (executes versioned migrations `001` through `006`)
- **Database Rollback**: `npm run migrate:down` (reverts previous migration)
- **Health Checks**:
  - `GET http://localhost:5000/health` (Root health probe)
  - `GET http://localhost:5000/api/v1/health` (API status & uptime)

### 3.2 Required Environment Variables
Server environment variables must be injected into the server container/environment at **runtime**:

| Variable | Required | Description | Production Example |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | **Yes** | Node environment mode (`production` disables mocks & fails fast on missing infrastructure) | `production` |
| `PORT` | No | Port for Express API server (defaults to 5000) | `5000` |
| `DATABASE_URL` | **Yes** | Connection URI for PostgreSQL database | `postgres://automask_app:password@db.internal:5432/automask_prod` |
| `DB_SSL` | No | Enable SSL for PostgreSQL connection (required for AWS RDS, Neon, Supabase) | `true` |
| `REDIS_URL` | **Yes (Prod)** | Redis connection URI for BullMQ queues | `redis://:redis_secret@redis.internal:6379` |
| `CORS_ORIGIN` | **Yes** | Comma-separated list of trusted frontend origins | `https://app.automask.io,https://admin.automask.io` |
| `JWT_SECRET` | **Yes** | Minimum 32-character cryptographic string for session tokens | `c28b5e7d9...min_32_chars` |
| `JWT_EXPIRES_IN` | No | JWT expiration duration | `7d` |
| `SESSION_COOKIE_NAME` | No | Cookie name for credentialed sessions | `automask_session` |
| `META_APP_SECRET` | **Yes** | Meta App Secret for SHA256 webhook signature validation | `9f3c7e...` |
| `META_WEBHOOK_VERIFY_TOKEN` | **Yes** | Secret token registered with Meta Webhook Developer Portal | `automask_webhook_verify_token_2026` |
| `META_ACCESS_TOKEN` | **Yes** | System User permanent WhatsApp access token for outbound dispatch | `EAAB...` |
| `OPENAI_API_KEY` | **Yes** | OpenAI API key for 1536-dimensional semantic vector embeddings | `sk-...` |
| `RUN_STANDALONE_WORKER` | No | If `true`, runs queue worker in separate process rather than inside API server | `true` |

---

## 4. Database & Queue Configuration

### 4.1 PostgreSQL Migrations & Least-Privilege Role Setup
AutoMask enforces defense-in-depth security using PostgreSQL Row Level Security (RLS). 

1. **Provision the Database**:
   ```sql
   CREATE DATABASE automask_prod;
   CREATE USER automask_admin WITH PASSWORD 'admin_password';
   GRANT ALL PRIVILEGES ON DATABASE automask_prod TO automask_admin;
   ```
2. **Execute Migrations**:
   Run with admin credentials:
   ```bash
   DATABASE_URL="postgres://automask_admin:admin_password@localhost:5432/automask_prod" npm run migrate
   ```
3. **Application Least-Privilege Role (`automask_app`)**:
   Migration `001_initial_schema.sql` automatically creates the non-superuser `automask_app` role:
   - `NOSUPERUSER`, `NOBYPASSRLS`
   - Explicit `WITH CHECK` and `USING` policies enforcing `workspace_id = current_setting('app.current_workspace_id', true)`
   - Production API services **must** connect using `automask_app` credentials so RLS cannot be bypassed.

### 4.2 Standalone Queue Worker (`worker.ts`)
To process inbound WhatsApp webhooks and execute AI/RAG answer generation at scale:

1. **Deploy Dedicated Worker Containers**:
   ```bash
   # Build the server image
   docker build -t automask-server:latest ./server

   # Run as standalone worker (independent from HTTP API)
   docker run -d --name automask_worker \
     --env-file ./server/.env.production \
     automask-server:latest npm run worker:prod
   ```
2. **Production Fail-Closed Guarantee**:
   When `NODE_ENV=production`, the worker strictly requires an active Redis cluster. It will refuse to silently fall back to an in-memory queue, preventing silent webhook loss during deployment restarts.

---

## 5. Security & Networking Configuration

### 5.1 Production CORS Allow-List
AutoMask uses dynamic origin validation:
- Any incoming HTTP request with an `Origin` header is checked against `env.CORS_ORIGIN` (split by commas).
- If the origin is in the allow-list, the server responds with:
  ```http
  Access-Control-Allow-Origin: https://app.automask.io
  Access-Control-Allow-Credentials: true
  Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization, x-user-role, x-user-id, x-workspace-id
  ```
- Server-to-server and non-browser callers (such as Meta webhook pings, curl requests, and load balancer health checks) lack an `Origin` header and are permitted by default.

### 5.2 HTTPS & Cookie Security
When `NODE_ENV=production`:
- Cookies set via `/api/v1/auth/login` include:
  ```typescript
  res.cookie(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,        // Enforces HTTPS transmission
    sameSite: 'none',    // Allows cross-site cookie transmission between frontend and backend domains
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  ```

### 5.3 Meta Webhook Registration
Meta WhatsApp Cloud API delivers inbound messages and delivery status updates to:
```text
https://api.automask.io/api/v1/webhook
```
1. **Verification Request (GET)**:
   Meta sends `hub.mode=subscribe`, `hub.challenge`, and `hub.verify_token`. AutoMask validates the verify token against `env.META_WEBHOOK_VERIFY_TOKEN` and echoes the challenge with HTTP 200.
2. **Payload Dispatch (POST)**:
   Meta delivers notifications with header `x-hub-signature-256: sha256=...`. AutoMask computes the HMAC-SHA256 signature using `env.META_APP_SECRET`. Invalid signatures are rejected with HTTP 401.

---

## 6. Deployment Order & Rollback Plan

### 6.1 Recommended Deployment Order
To ensure zero downtime and prevent migration lockouts:

```text
Step 1: PostgreSQL Migrations  ---> Apply database schema & RLS policies
Step 2: Redis Cluster          ---> Verify healthy Redis connectivity
Step 3: Backend API Server     ---> Deploy new API server instances (vN)
Step 4: Queue Workers          ---> Deploy/restart standalone worker processes
Step 5: Frontend Client        ---> Upload new static assets to CDN / S3 / Nginx
```

### 6.2 Rollback Procedures

#### Database Rollback:
```bash
# In server directory:
DATABASE_URL="postgres://automask_admin:password@localhost:5432/automask_prod" npm run migrate:down
```

#### Backend API & Worker Rollback:
- Roll back container image tag to previous stable digest (`automask-server:v1.0.4`).
- Traffic shifts immediately to previous container task.

#### Frontend Rollback:
- Re-point CDN distribution or S3 bucket origin to previous static asset build folder.

---

## 7. Deployment Smoke Test Runbook

Execute this verification sequence immediately following any deployment:

| # | Check | Command / Action | Expected Result |
| :---: | :--- | :--- | :--- |
| **1** | Backend Health Probe | `curl -f https://api.automask.io/health` | `HTTP 200 {"status":"healthy"}` |
| **2** | API Health Probe | `curl -f https://api.automask.io/api/v1/health` | `HTTP 200 {"status":"OK"}` |
| **3** | Database RLS Verification | Run automated test suite: `npm run test:multitenant` | `12/12 PASSED` |
| **4** | RBAC & Support-Grant Check | Run security test suite: `npm run test:security` | `17/17 PASSED` (Agent 403 on billing, Admin restricted from message content) |
| **5** | Frontend Static Serving | `curl -I https://app.automask.io` | `HTTP 200 OK`, `Content-Type: text/html` |
| **6** | Frontend SPA Fallback | `curl -I https://app.automask.io/leads` | `HTTP 200 OK` (Served index.html, NOT 404) |
| **7** | CORS Options Preflight | `curl -I -X OPTIONS https://api.automask.io/api/v1/dashboard -H "Origin: https://app.automask.io" -H "Access-Control-Request-Method: GET"` | `HTTP 204/200` with `Access-Control-Allow-Origin: https://app.automask.io` |
| **8** | Meta Webhook Handshake | `curl "https://api.automask.io/api/v1/webhook?hub.mode=subscribe&hub.challenge=test_123&hub.verify_token=automask_webhook_verify_token"` | `HTTP 200 test_123` |
| **9** | Webhook HMAC Enforcement | `curl -X POST https://api.automask.io/api/v1/webhook -H "Content-Type: application/json" -d "{}"` | `HTTP 401 {"error":"Invalid webhook signature"}` |

---

## 8. Docker Compose One-Step Deployment (Reference)

For unified local or single-host staging deployments:

```bash
# Start all 5 services with production settings
docker-compose up -d --build

# Inspect service logs
docker-compose logs -f api worker

# Verify running containers
docker-compose ps
```
