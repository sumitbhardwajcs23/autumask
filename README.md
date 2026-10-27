# AutoMask — AI-Powered WhatsApp Automation SaaS

AutoMask is an enterprise-ready WhatsApp automation platform designed for coaching institutes, educational organizations, and businesses. Powered by the official Meta WhatsApp Cloud API (v21.0), Google Gemini AI, PostgreSQL, and high-performance queue processing.

## 🚀 Key Features
- **Official Meta WhatsApp Cloud API Integration**: Direct Graph API v21.0 integration with HMAC-SHA256 signature verification and durable webhook pipelines.
- **AI-Powered Conversations**: Grounded responses using Google Gemini (`gemini-3.8-flash`) and RAG knowledge retrieval for courses, fees, and FAQ inquiries.
- **Lead Capture & Demo Bookings**: Automated lead qualification, slot booking, and human takeover mechanisms.
- **Broadcast & Campaign Management**: Meta pre-approved template message broadcasts with 24-hour customer service window enforcement.
- **Enterprise Multi-Tenancy & RBAC**: PostgreSQL Row-Level Security (RLS) isolation and granular role-based permissions.

## 🛠️ Architecture & Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, TypeScript, Zod schema validation
- **Database**: PostgreSQL 16+ with Row-Level Security (RLS) migrations
- **AI Providers**: Google Gemini AI (`gemini-3.8-flash`), Groq, OpenAI
- **Messaging**: Meta WhatsApp Cloud API (v21.0)

## 📦 Getting Started

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 15+

### 2. Setup Server
```bash
cd server
npm install
npm run dev
```

### 3. Setup Client
```bash
cd client
npm install
npm run dev
```
