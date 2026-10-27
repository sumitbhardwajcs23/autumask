import { env } from '../../config/env';

export type AIProvider = 'groq' | 'gemini' | 'openai' | 'local';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMCompletionOptions {
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  messages: LLMMessage[];
}

export interface LLMCompletionResult {
  content: string;
  provider: AIProvider;
  model: string;
  latencyMs: number;
  tokensUsed?: number;
}

export interface AgentIntentClassification {
  intent: 'DEMO_REQUEST' | 'FEES_INQUIRY' | 'BATCH_SCHEDULE' | 'OPT_OUT' | 'HUMAN_TAKEOVER' | 'GENERAL_FAQ' | 'UNKNOWN';
  confidence: number;
  extractedStudentName?: string;
  preferredLanguage?: 'en' | 'hi' | 'hi_en';
  summary: string;
}

/**
 * AutoMask Multi-Agent LLM Router
 * 
 * Supports Free-Tier LLMs:
 * 1. Groq Cloud: LPU inference (~500 tokens/sec, Free tier: Llama 3.3 70B & Llama 3.1 8B Instant)
 * 2. Google Gemini: 1M token context window (Free tier: Gemini 2.0 Flash & Gemini 1.5 Flash via AI Studio)
 * 3. Local Deterministic Fallback: 100% offline rule & vector matching
 */
export class LLMRouter {
  /**
   * Universal Chat Completion Router
   */
  public static async complete(options: LLMCompletionOptions): Promise<LLMCompletionResult> {
    const startTime = Date.now();
    const provider = options.provider || (env.DEFAULT_AI_PROVIDER as AIProvider);

    // 1. Groq Cloud (Free Tier - Ultra Fast LPU)
    if (provider === 'groq' && env.GROQ_API_KEY) {
      try {
        const model = options.model || 'llama-3.3-70b-versatile';
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages: options.messages,
            temperature: options.temperature ?? 0.2,
            max_tokens: options.maxTokens ?? 512,
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          return {
            content: data.choices?.[0]?.message?.content || '',
            provider: 'groq',
            model,
            latencyMs: Date.now() - startTime,
            tokensUsed: data.usage?.total_tokens,
          };
        }
      } catch (err: any) {
        console.warn('Groq API call failed, falling back to next available provider:', err?.message);
      }
    }

    // 2. Google Gemini (Free Tier - 1M Context Window)
    if ((provider === 'gemini' || !env.GROQ_API_KEY) && env.GEMINI_API_KEY) {
      try {
        const model = options.model || 'gemini-3.8-flash';
        // Google AI Studio OpenAI-compatible endpoint
        const res = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.GEMINI_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages: options.messages,
            temperature: options.temperature ?? 0.2,
            max_tokens: options.maxTokens ?? 512,
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          return {
            content: data.choices?.[0]?.message?.content || '',
            provider: 'gemini',
            model,
            latencyMs: Date.now() - startTime,
            tokensUsed: data.usage?.total_tokens,
          };
        }
      } catch (err: any) {
        console.warn('Gemini API call failed, falling back to local reasoning:', err?.message);
      }
    }

    // 3. OpenAI (If Key is present)
    if (provider === 'openai' && env.OPENAI_API_KEY) {
      try {
        const model = options.model || 'gpt-4o-mini';
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages: options.messages,
            temperature: options.temperature ?? 0.2,
            max_tokens: options.maxTokens ?? 512,
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          return {
            content: data.choices?.[0]?.message?.content || '',
            provider: 'openai',
            model,
            latencyMs: Date.now() - startTime,
            tokensUsed: data.usage?.total_tokens,
          };
        }
      } catch (err: any) {
        console.warn('OpenAI API call failed:', err?.message);
      }
    }

    // 4. Local Deterministic Fallback (Offline / Zero Cost)
    const userPrompt = options.messages.filter(m => m.role === 'user').map(m => m.content).join(' ');
    return {
      content: `Hello! I received your inquiry about: "${userPrompt.slice(0, 80)}". Our coaching team is available to assist you with detailed fee and batch admissions.`,
      provider: 'local',
      model: 'local-rule-engine-v1',
      latencyMs: Date.now() - startTime,
      tokensUsed: 0,
    };
  }

  /**
   * Agent 1: Fast WhatsApp Triage & Intent Classifier (Runs on Groq Llama 3.1 8B Instant <250ms)
   */
  public static async classifyIntent(userMessage: string): Promise<AgentIntentClassification> {
    const prompt = `You are a high-speed WhatsApp triage classifier for a business SaaS platform.
Analyze this incoming WhatsApp message: "${userMessage}"

Respond ONLY with valid JSON in this exact structure:
{
  "intent": "DEMO_REQUEST" | "FEES_INQUIRY" | "BATCH_SCHEDULE" | "OPT_OUT" | "HUMAN_TAKEOVER" | "GENERAL_FAQ" | "UNKNOWN",
  "confidence": number between 0.0 and 1.0,
  "extractedStudentName": string or null,
  "preferredLanguage": "en" | "hi" | "hi_en",
  "summary": "1 sentence explanation"
}`;

    try {
      const result = await this.complete({
        provider: env.GROQ_API_KEY ? 'groq' : env.GEMINI_API_KEY ? 'gemini' : 'local',
        model: env.GROQ_API_KEY ? 'llama-3.1-8b-instant' : 'gemini-3.8-flash',
        temperature: 0.1,
        maxTokens: 256,
        messages: [
          { role: 'system', content: 'You are a deterministic JSON classifier. Output nothing except JSON.' },
          { role: 'user', content: prompt },
        ],
      });

      const cleanJson = result.content.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        intent: parsed.intent || 'GENERAL_FAQ',
        confidence: parsed.confidence || 0.85,
        extractedStudentName: parsed.extractedStudentName || undefined,
        preferredLanguage: parsed.preferredLanguage || 'hi_en',
        summary: parsed.summary || 'Classified via AutoMask AI Agent',
      };
    } catch {
      // Rule-based fallback
      const lower = userMessage.toLowerCase();
      if (lower.includes('stop') || lower.includes('unsubscribe')) {
        return { intent: 'OPT_OUT', confidence: 0.99, preferredLanguage: 'en', summary: 'Keyword opt-out detected' };
      }
      if (lower.includes('demo') || lower.includes('trial') || lower.includes('class')) {
        return { intent: 'DEMO_REQUEST', confidence: 0.9, preferredLanguage: 'hi_en', summary: 'Demo booking request' };
      }
      if (lower.includes('fee') || lower.includes('price') || lower.includes('cost') || lower.includes('kitna')) {
        return { intent: 'FEES_INQUIRY', confidence: 0.9, preferredLanguage: 'hi_en', summary: 'Course fees inquiry' };
      }
      if (lower.includes('human') || lower.includes('agent') || lower.includes('call') || lower.includes('baat')) {
        return { intent: 'HUMAN_TAKEOVER', confidence: 0.95, preferredLanguage: 'hi_en', summary: 'Escalation to human requested' };
      }
      return { intent: 'GENERAL_FAQ', confidence: 0.7, preferredLanguage: 'hi_en', summary: 'General inquiry' };
    }
  }

  /**
   * Agent 2: Empathetic WhatsApp Admissions Counsellor (Groq 70B / Gemini Flash)
   */
  public static async generateCounsellorReply(params: {
    studentName?: string;
    studentQuery: string;
    groundedContext: string;
    language?: 'en' | 'hi' | 'hi_en';
    instituteName?: string;
  }): Promise<{ reply: string; provider: AIProvider; model: string; latencyMs: number }> {
    const { studentName, studentQuery, groundedContext, language = 'hi_en', instituteName = 'AutoMask Institute' } = params;

    const systemPrompt = `You are the official WhatsApp Senior Admissions Counsellor for ${instituteName}.
Tone: Friendly, highly respectful, reassuring, helpful, and concise (WhatsApp chat format, max 3-4 short sentences).
Language Style: ${language === 'hi_en' ? 'Natural Hinglish (mixture of polite Hindi and English written in Latin script, e.g., "Namaste Rohit! Dropper batch ki classes Monday se shuru ho rahi hain.")' : language === 'hi' ? 'Polite Hindi' : 'Polite English'}.
Crucial Rule: Base your answer STRICTLY on the Verified Institute Facts provided below. Do not invent fees or promises. If information is not in the facts, politely offer to connect them with the counselor.

Verified Institute Facts:
${groundedContext}`;

    const completion = await this.complete({
      provider: env.GROQ_API_KEY ? 'groq' : env.GEMINI_API_KEY ? 'gemini' : 'local',
      model: env.GROQ_API_KEY ? 'llama-3.3-70b-versatile' : 'gemini-3.8-flash',
      temperature: 0.3,
      maxTokens: 300,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Student (${studentName || 'Student'}): ${studentQuery}` },
      ],
    });

    return {
      reply: completion.content,
      provider: completion.provider,
      model: completion.model,
      latencyMs: completion.latencyMs,
    };
  }
}
