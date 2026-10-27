import { query, withTenantContext } from '../../database/connection';
import { env } from '../../config/env';
import { mockStore } from '../../models/mockStore';
import { CryptoUtils } from '../../utils/cryptoUtils';

export interface SendMessageOptions {
  workspaceId: string;
  toPhone: string;
  body: string;
  conversationId?: string;
  bypassWindowCheck?: boolean;
  isAiGenerated?: boolean;
  senderName?: string;
  idempotencyKey?: string;
}

export interface SendTemplateOptions {
  workspaceId: string;
  toPhone: string;
  templateName: string;
  languageCode?: string;
  components?: any[];
  conversationId?: string;
  senderName?: string;
  idempotencyKey?: string;
}

export interface OutboundMessageResult {
  success: boolean;
  status: 'QUEUED' | 'SUBMITTED' | 'ACCEPTED' | 'DELIVERED' | 'READ' | 'FAILED' | 'UNKNOWN_TIMEOUT';
  providerMessageId?: string;
  messageId?: string;
  error?: string;
  errorCode?: string;
  idempotentReplay?: boolean;
}

export interface WhatsAppStatusPayload {
  id: string; // provider message ID (wamid.xxx)
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: Array<{ code: number; title: string; message: string }>;
}

export class WhatsAppClient {
  private static readonly META_GRAPH_URL = 'https://graph.facebook.com/v21.0';

  /**
   * Resolve credentials for tenant workspace
   */
  public static async getCredentials(workspaceId: string): Promise<{
    phoneNumberId: string;
    accessToken: string;
    wabaId?: string;
  } | null> {
    try {
      const res = await query(
        `SELECT phone_number_id, token_encrypted, waba_id, status FROM whatsapp_accounts WHERE workspace_id = $1 LIMIT 1;`,
        [workspaceId]
      );

      if (res.rows.length === 0 || res.rows[0].status !== 'CONNECTED') {
        // Fallback to mockStore in development
        if (mockStore.whatsappAccount && mockStore.whatsappAccount.status === 'CONNECTED') {
          return {
            phoneNumberId: mockStore.whatsappAccount.phoneNumberId || 'phone-prakash-01',
            accessToken: env.META_ACCESS_TOKEN || 'simulated_meta_token',
            wabaId: mockStore.whatsappAccount.wabaId,
          };
        }
        return null;
      }

      const row = res.rows[0];
      const decryptedToken = row.token_encrypted ? CryptoUtils.decrypt(row.token_encrypted) : null;
      return {
        phoneNumberId: row.phone_number_id,
        accessToken: decryptedToken || env.META_ACCESS_TOKEN || 'simulated_meta_token',
        wabaId: row.waba_id,
      };
    } catch {
      if (mockStore.whatsappAccount && mockStore.whatsappAccount.status === 'CONNECTED') {
        return {
          phoneNumberId: mockStore.whatsappAccount.phoneNumberId || 'phone-prakash-01',
          accessToken: env.META_ACCESS_TOKEN || 'simulated_meta_token',
          wabaId: mockStore.whatsappAccount.wabaId,
        };
      }
      return null;
    }
  }

  /**
   * Verify if customer has opted out
   */
  public static async isOptedOut(workspaceId: string, phone: string): Promise<boolean> {
    try {
      const res = await query(
        `SELECT opt_in_status FROM contacts WHERE workspace_id = $1 AND (phone_e164 = $2 OR phone_e164 = $3) LIMIT 1;`,
        [workspaceId, phone, phone.startsWith('+') ? phone : `+${phone}`]
      );
      if (res.rows.length > 0 && res.rows[0].opt_in_status === 'OPTED_OUT') {
        return true;
      }
    } catch {
      // check mock store fallback
      const conv = mockStore.conversations.find(c => c.phone === phone || c.id === phone);
      if (conv && conv.status === 'CLOSED') return true;
    }
    return false;
  }

  /**
   * Verify 24-hour customer service window
   */
  public static async isWindowActive(workspaceId: string, conversationId?: string, phone?: string): Promise<boolean> {
    try {
      let res;
      if (conversationId) {
        res = await query(
          `SELECT window_expires_at, takeover_active FROM conversations WHERE id = $1 LIMIT 1;`,
          [conversationId]
        );
      } else if (phone) {
        res = await query(
          `SELECT c.window_expires_at, c.takeover_active 
           FROM conversations c 
           JOIN contacts ct ON ct.id = c.contact_id 
           WHERE c.workspace_id = $1 AND ct.phone_e164 = $2 LIMIT 1;`,
          [workspaceId, phone.startsWith('+') ? phone : `+${phone}`]
        );
      }

      if (res && res.rows.length > 0) {
        const expiresAt = res.rows[0].window_expires_at;
        if (!expiresAt) return false;
        return new Date(expiresAt).getTime() > Date.now();
      }
    } catch {
      // In-memory fallback
      const conv = mockStore.conversations.find(c => c.id === conversationId || c.phone === phone);
      if (conv && conv.windowExpiresAt) {
        return new Date(conv.windowExpiresAt).getTime() > Date.now();
      }
    }
    return false;
  }

  /**
   * Check if human takeover is active on conversation
   */
  public static async isTakeoverActive(workspaceId: string, conversationId?: string, phone?: string): Promise<boolean> {
    try {
      if (conversationId) {
        const res = await query(`SELECT takeover_active FROM conversations WHERE id = $1 LIMIT 1;`, [conversationId]);
        if (res.rows.length > 0) return Boolean(res.rows[0].takeover_active);
      }
    } catch {}
    const conv = mockStore.conversations.find(c => c.id === conversationId || c.phone === phone);
    return Boolean(conv?.takeoverActive);
  }

  /**
   * Send Official Meta Outbound Text Message
   */
  public static async sendTextMessage(opts: SendMessageOptions): Promise<OutboundMessageResult> {
    const { workspaceId, toPhone, body, conversationId, bypassWindowCheck, isAiGenerated } = opts;

    // 1. Opt-Out Guard
    const optedOut = await this.isOptedOut(workspaceId, toPhone);
    if (optedOut) {
      return {
        success: false,
        status: 'FAILED',
        error: 'Recipient has explicitly opted out of WhatsApp messages',
        errorCode: 'RECIPIENT_OPTED_OUT',
      };
    }

    // 2. Human Takeover Guard (for automated AI messages)
    if (isAiGenerated) {
      const takeover = await this.isTakeoverActive(workspaceId, conversationId, toPhone);
      if (takeover) {
        return {
          success: false,
          status: 'FAILED',
          error: 'Human agent takeover is currently active. AI automated replies are suspended.',
          errorCode: 'HUMAN_TAKEOVER_ACTIVE',
        };
      }
    }

    // 3. 24-Hour Customer Service Window Guard
    if (!bypassWindowCheck) {
      const windowValid = await this.isWindowActive(workspaceId, conversationId, toPhone);
      if (!windowValid) {
        return {
          success: false,
          status: 'FAILED',
          error: '24-Hour WhatsApp customer service window has expired. A pre-approved template message must be used.',
          errorCode: 'SERVICE_WINDOW_EXPIRED',
        };
      }
    }

    // 4. Resolve Credentials
    const creds = await this.getCredentials(workspaceId);
    if (!creds) {
      return {
        success: false,
        status: 'FAILED',
        error: 'No active WhatsApp Business Account credentials found for this workspace',
        errorCode: 'WABA_NOT_CONNECTED',
      };
    }

    // Format destination phone (digits only without leading + for Meta API)
    const cleanPhone = toPhone.replace(/\D/g, '');
    const idKey = opts.idempotencyKey || `out-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // 4.5 Idempotency Check: Avoid duplicate dispatches if already submitted/accepted
    if (opts.idempotencyKey) {
      try {
        const existing = await query(
          `SELECT id, status, provider_message_id, error_code 
           FROM outbound_messages 
           WHERE workspace_id = $1 AND idempotency_key = $2 LIMIT 1;`,
          [workspaceId, opts.idempotencyKey]
        );
        if (existing.rows.length > 0) {
          const row = existing.rows[0];
          if (['ACCEPTED', 'DELIVERED', 'READ', 'DISPATCHED'].includes(row.status)) {
            return {
              success: true,
              status: row.status,
              providerMessageId: row.provider_message_id,
              messageId: row.id,
              idempotentReplay: true,
            };
          }
        }
      } catch {}
    }

    // Persist intent before network dispatch (P0-3)
    try {
      await query(
        `INSERT INTO outbound_messages (workspace_id, conversation_id, to_phone, message_type, idempotency_key, payload_json, status, dispatched_at)
         VALUES ($1, $2, $3, 'text', $4, $5, 'DISPATCHED', NOW())
         ON CONFLICT (idempotency_key) DO UPDATE SET status = 'DISPATCHED', updated_at = NOW();`,
        [workspaceId, conversationId || null, toPhone, idKey, JSON.stringify({ body, senderName: opts.senderName })]
      );
    } catch {}

    // 5. Submit to Meta Cloud API (or simulate in test environments)
    const isLiveMetaToken = env.META_ACCESS_TOKEN && env.META_ACCESS_TOKEN.startsWith('EAA');

    try {
      let providerMessageId: string;

      if (isLiveMetaToken) {
        // Real HTTP request to Meta Graph API
        const response = await fetch(`${this.META_GRAPH_URL}/${creds.phoneNumberId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${creds.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanPhone,
            type: 'text',
            text: { preview_url: false, body },
          }),
        });

        const data = (await response.json()) as any;
        if (!response.ok || data.error) {
          const errMessage = data.error?.message || 'Meta API rejected message';
          const errCode = data.error?.code?.toString() || 'META_API_ERROR';
          try {
            await query(
              `UPDATE outbound_messages 
               SET status = 'FAILED', error_code = $1, error_message = $2, updated_at = NOW() 
               WHERE idempotency_key = $3;`,
              [errCode, errMessage, idKey]
            );
          } catch {}
          return {
            success: false,
            status: 'FAILED',
            error: errMessage,
            errorCode: errCode,
          };
        }

        providerMessageId = data.messages?.[0]?.id || `wamid.${Date.now()}`;
      } else {
        // Enforce explicit test/development mode: production MUST NOT silently simulate delivery
        if (env.NODE_ENV === 'production') {
          const prodErr = 'Production environment requires valid Meta Cloud API credentials (EAA...). Simulated delivery is disallowed in production mode.';
          try {
            await query(
              `UPDATE outbound_messages 
               SET status = 'FAILED', error_code = 'LIVE_CREDENTIALS_REQUIRED', error_message = $1, updated_at = NOW() 
               WHERE idempotency_key = $2;`,
              [prodErr, idKey]
            );
          } catch {}
          return {
            success: false,
            status: 'FAILED',
            error: prodErr,
            errorCode: 'LIVE_CREDENTIALS_REQUIRED',
          };
        }
        // Deterministic, realistic Meta Cloud API accepted response for testing/sandbox
        providerMessageId = `wamid.HBgL${Date.now()}MetaAccepted`;
      }

      // Record in mockStore for backwards compatibility
      mockStore.addMessage(
        conversationId || 'conv-01',
        body,
        isAiGenerated ? 'bot' : 'agent',
        'SENT',
        providerMessageId,
        opts.senderName
      );

      // Update outbound_messages status to ACCEPTED
      try {
        await query(
          `UPDATE outbound_messages 
           SET status = 'ACCEPTED', provider_message_id = $1, acknowledged_at = NOW(), updated_at = NOW() 
           WHERE idempotency_key = $2;`,
          [providerMessageId, idKey]
        );
      } catch {}

      return {
        success: true,
        status: 'ACCEPTED',
        providerMessageId,
      };
    } catch (err: any) {
      const isTimeout = err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET' || (err.message && err.message.toLowerCase().includes('timeout'));
      const finalStatus = isTimeout ? 'UNKNOWN_TIMEOUT' : 'FAILED';
      const finalCode = isTimeout ? 'TIMEOUT_AMBIGUOUS_RESULT' : 'NETWORK_OR_TIMEOUT_ERROR';
      try {
        await query(
          `UPDATE outbound_messages 
           SET status = $1, error_code = $2, error_message = $3, updated_at = NOW() 
           WHERE idempotency_key = $4;`,
          [finalStatus, finalCode, err.message, idKey]
        );
      } catch {}
      return {
        success: false,
        status: finalStatus,
        error: err.message,
        errorCode: finalCode,
      };
    }
  }

  /**
   * Send Pre-Approved Template Message (Allowed outside the 24-hour service window)
   */
  public static async sendTemplateMessage(opts: SendTemplateOptions): Promise<OutboundMessageResult> {
    const { workspaceId, toPhone, templateName, languageCode = 'en', components = [], conversationId } = opts;

    // Opt-out guard still strictly enforced
    const optedOut = await this.isOptedOut(workspaceId, toPhone);
    if (optedOut) {
      return {
        success: false,
        status: 'FAILED',
        error: 'Recipient has opted out of WhatsApp messages',
        errorCode: 'RECIPIENT_OPTED_OUT',
      };
    }

    const creds = await this.getCredentials(workspaceId);
    if (!creds) {
      return {
        success: false,
        status: 'FAILED',
        error: 'No active WhatsApp account found for workspace',
        errorCode: 'WABA_NOT_CONNECTED',
      };
    }

    const cleanPhone = toPhone.replace(/\D/g, '');
    const isLiveMetaToken = env.META_ACCESS_TOKEN && env.META_ACCESS_TOKEN.startsWith('EAA');

    try {
      let providerMessageId: string;

      if (isLiveMetaToken) {
        const response = await fetch(`${this.META_GRAPH_URL}/${creds.phoneNumberId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${creds.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanPhone,
            type: 'template',
            template: {
              name: templateName,
              language: { code: languageCode },
              components,
            },
          }),
        });

        const data = (await response.json()) as any;
        if (!response.ok || data.error) {
          return {
            success: false,
            status: 'FAILED',
            error: data.error?.message || 'Meta rejected template dispatch',
            errorCode: data.error?.code?.toString() || 'TEMPLATE_DISPATCH_FAILED',
          };
        }
        providerMessageId = data.messages?.[0]?.id || `wamid.${Date.now()}`;
      } else {
        if (env.NODE_ENV === 'production') {
          return {
            success: false,
            status: 'FAILED',
            error: 'Production environment requires valid Meta Cloud API credentials (EAA...). Simulated template dispatch is disallowed in production mode.',
            errorCode: 'LIVE_CREDENTIALS_REQUIRED',
          };
        }
        providerMessageId = `wamid.HBgL${Date.now()}TemplateAccepted`;
      }

      mockStore.addMessage(
        conversationId || 'conv-01',
        `[Template: ${templateName}]`,
        'agent',
        'SENT',
        providerMessageId,
        opts.senderName
      );

      return {
        success: true,
        status: 'ACCEPTED',
        providerMessageId,
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        error: err.message,
        errorCode: 'TEMPLATE_NETWORK_ERROR',
      };
    }
  }

  /**
   * Process Meta Delivery & Read Status Receipts
   */
  public static async handleStatusUpdate(statusPayload: WhatsAppStatusPayload): Promise<boolean> {
    const { id: providerMessageId, status, timestamp, errors } = statusPayload;

    try {
      const mappedStatus = status.toUpperCase(); // DELIVERED, READ, FAILED
      const errorCode = errors?.[0]?.code ? String(errors[0].code) : null;

      // Update in PostgreSQL database
      await query(
        `UPDATE messages 
         SET status = $1, error_code = $2, metadata = jsonb_set(metadata, '{status_updated_at}', to_jsonb(NOW()))
         WHERE provider_message_id = $3;`,
        [mappedStatus, errorCode, providerMessageId]
      );

      await query(
        `UPDATE outbound_messages 
         SET status = $1, error_code = $2, acknowledged_at = NOW(), updated_at = NOW() 
         WHERE provider_message_id = $3;`,
        [mappedStatus, errorCode, providerMessageId]
      );

      // Update mockStore conversation messages
      for (const msgList of Object.values(mockStore.messages)) {
        const msg = msgList.find(m => m.providerMessageId === providerMessageId);
        if (msg) {
          msg.status = mappedStatus as any;
          return true;
        }
      }
      return true;
    } catch (err) {
      return false;
    }
  }
}
