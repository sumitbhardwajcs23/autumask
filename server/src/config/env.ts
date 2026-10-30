import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  
  // Database Configuration
  DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().default(5433),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().default('automask_dev'),
  DB_SSL: z.string().transform(v => v === 'true').default('false'),

  // Authentication & Security
  JWT_SECRET: z.string().default('automask-super-secret-jwt-key-2026-production-ready'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  SESSION_COOKIE_NAME: z.string().default('automask_session'),
  
  // Meta Cloud API Webhook Secrets
  META_APP_SECRET: z.string().default('meta_app_secret_test_placeholder'),
  META_WEBHOOK_VERIFY_TOKEN: z.string().default('automask_webhook_verify_token'),
  META_ACCESS_TOKEN: z.string().optional(),

  // Redis & BullMQ Queue Configuration
  REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  RUN_STANDALONE_WORKER: z.string().transform(v => v === 'true').default('false'),

  // AI & Semantic Grounding (Groq, Gemini, OpenAI)
  OPENAI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  DEFAULT_AI_PROVIDER: z.enum(['groq', 'gemini', 'openai', 'local']).default('groq'),

  // Razorpay Payment Gateway
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  // Production CORS Origin Allow-list
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://127.0.0.1:3000'),
});

export const env = envSchema.parse(process.env);

