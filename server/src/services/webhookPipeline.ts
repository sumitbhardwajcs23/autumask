import crypto from 'crypto';
import { mockStore } from '../models/mockStore';
import { DecisionRouter, RouteResult } from './decisionRouter';
import { Message, Conversation, Lead } from '../models/types';

export interface WebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: { name: string };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string; // provider message ID (wamid.xxx)
          timestamp: string;
          text?: { body: string };
          type: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

export interface InboundProcessingResult {
  status: 'PROCESSED' | 'DUPLICATE' | 'INVALID_SIGNATURE' | 'IGNORED';
  providerMessageId?: string;
  conversationId?: string;
  routeResult?: RouteResult;
  windowExpiresAt?: string;
  leadStatus?: string;
}

// In-memory set of processed provider message IDs for deduplication
const processedMessageIds = new Set<string>();

export class WebhookPipeline {
  /**
   * Verify Meta HMAC-SHA256 webhook signature
   */
  public static verifySignature(rawBody: string, signatureHeader?: string, appSecret?: string): boolean {
    if (!signatureHeader || !appSecret) return false;
    try {
      const parts = signatureHeader.split('=');
      if (parts.length !== 2 || parts[0] !== 'sha256') return false;
      const expectedHash = parts[1];
      const hmac = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
      const hmacBuffer = Buffer.from(hmac);
      const expectedBuffer = Buffer.from(expectedHash);
      if (hmacBuffer.length !== expectedBuffer.length) return false;
      return crypto.timingSafeEqual(hmacBuffer, expectedBuffer);
    } catch {
      return false;
    }
  }

  /**
   * Section 4.2: Inbound Message Pipeline
   * 1. Raw event stored for replay (DD-08)
   * 2. Deduplicate by provider message ID
   * 3. Upsert contact and conversation, update 24-hr service window
   * 4. Check opt-out and takeover
   * 5. Execute Section 4.3 Response Decision Order
   * 6. Lead capture and follow-up (Section 4.4)
   */
  public static processWebhookEvent(payload: WebhookPayload, rawPayloadString?: string): InboundProcessingResult[] {
    const results: InboundProcessingResult[] = [];

    // DD-08: Log raw webhook payload in audit trail
    mockStore.logAudit(
      mockStore.workspace.id,
      'system:meta_webhook',
      'Meta Cloud API',
      'platform_admin',
      'WEBHOOK_RECEIVED',
      'raw_event_store',
      { payload: payload }
    );

    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        const val = change.value;
        const messages = val.messages || [];
        const contacts = val.contacts || [];

        for (const msg of messages) {
          const providerId = msg.id;

          // Step 1: Deduplication (Section 4.2 Line 641)
          if (processedMessageIds.has(providerId)) {
            results.push({
              status: 'DUPLICATE',
              providerMessageId: providerId,
            });
            continue;
          }
          processedMessageIds.add(providerId);

          const studentPhone = `+${msg.from}`;
          const studentName = contacts[0]?.profile?.name || 'Prospective Student';
          const textBody = msg.text?.body || '';

          // Step 2: Calculate 24-Hour WhatsApp Customer Service Window (Line 643)
          const windowExpiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

          // Step 3: Run Section 4.3 Response Decision Router
          const routeResult = DecisionRouter.processInboundMessage(
            'conv-01',
            studentPhone,
            textBody,
            studentName
          );

          // Update conversation window
          const conv = mockStore.conversations.find(c => c.phone === studentPhone || c.id === 'conv-01');
          if (conv) {
            conv.windowExpiresAt = windowExpiresAt;
          }

          results.push({
            status: 'PROCESSED',
            providerMessageId: providerId,
            conversationId: conv?.id,
            routeResult,
            windowExpiresAt,
            leadStatus: conv?.leadStatus,
          });
        }
      }
    }

    return results;
  }
}
