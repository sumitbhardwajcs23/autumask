import { mockStore } from '../models/mockStore';
import { Message, Conversation, Lead } from '../models/types';

export interface RouteResult {
  actionTaken: 'OPT_OUT' | 'OPT_OUT_SUPPRESSED' | 'RE_OPT_IN' | 'TAKEOVER_ACTIVE' | 'BOOKING_FLOW' | 'RULE_MATCH' | 'AI_FAQ_MATCH' | 'FALLBACK_HANDOFF';
  replyText?: string;
  matchedRuleName?: string;
  leadUpdated?: boolean;
  buttons?: any[];
  headerText?: string;
  footerText?: string;
}

export class DecisionRouter {
  public static processInboundMessage(
    conversationId: string,
    studentPhone: string,
    messageBody: string,
    studentName: string = 'Prospective Student'
  ): RouteResult {
    const textLower = messageBody.trim().toLowerCase();

    // Find or create conversation
    let conversation = mockStore.conversations.find(c => c.id === conversationId || c.phone === studentPhone);
    if (!conversation) {
      conversation = {
        id: `conv-${Date.now()}`,
        workspaceId: mockStore.workspace.id,
        contactId: `ct-${Date.now()}`,
        contactName: studentName,
        phone: studentPhone,
        status: 'OPEN',
        leadStatus: 'NEW',
        unreadCount: 0,
        lastMessage: messageBody,
        lastMessageAt: 'Just now',
        takeoverActive: false,
        windowExpiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        tags: ['New Enquiry'],
      };
      mockStore.conversations.unshift(conversation);
      mockStore.messages[conversation.id] = [];
    }

    // Append incoming message
    const inboundMsg: Message = {
      id: `msg-${Date.now()}-in`,
      conversationId: conversation.id,
      direction: 'INBOUND',
      body: messageBody,
      senderType: 'student',
      status: 'READ',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
    };
    if (!mockStore.messages[conversation.id]) {
      mockStore.messages[conversation.id] = [];
    }
    mockStore.messages[conversation.id].push(inboundMsg);
    conversation.lastMessage = messageBody;
    conversation.lastMessageAt = 'Just now';

    // Step 1: Check Opt-out Keywords (DD-04, SRS 4.3 P0-1)
    const optOutKeywords = ['stop', 'unsubscribe', 'ruk jao', 'band karo', 'donotmsg'];
    const isOptOutCommand = optOutKeywords.some(kw => textLower === kw || textLower.includes(kw));

    if (isOptOutCommand) {
      const reply = "Aapka WhatsApp subscription cancel kar diya gaya hai. Aage se aapko koi promotional message nahi aayega. You have been opted out successfully.";
      this.sendOutbound(conversation.id, reply, 'bot');
      conversation.status = 'CLOSED';
      conversation.takeoverActive = false; // Takeover is superseded by opt-out

      // Cancel all pending follow-up jobs for this contact if present
      if ((mockStore as any).followupJobs && Array.isArray((mockStore as any).followupJobs)) {
        (mockStore as any).followupJobs = (mockStore as any).followupJobs.filter((j: any) => j.contactId !== conversation!.contactId);
      }

      // Update contact opt-in status in mockStore
      const cleanPhone = studentPhone.replace(/\s+/g, '');
      const contact = mockStore.contacts.find(c => c.phone.replace(/\s+/g, '') === cleanPhone);
      if (contact) {
        contact.optInStatus = 'OPTED_OUT';
        (contact as any).optedOutAt = new Date().toISOString();
      }
      return { actionTaken: 'OPT_OUT', replyText: reply };
    }

    // Step 1.5: Explicit Re-Opt-in (START, UNSTOP, shuru karo)
    const reOptInKeywords = ['start', 'unstop', 'shuru karo', 'optin'];
    const isReOptIn = reOptInKeywords.some(kw => textLower === kw || textLower.startsWith(kw));
    const cleanPhone = studentPhone.replace(/\s+/g, '');
    const contact = mockStore.contacts.find(c => c.phone.replace(/\s+/g, '') === cleanPhone);

    if (isReOptIn && (contact?.optInStatus === 'OPTED_OUT' || conversation.status === 'CLOSED')) {
      if (contact) {
        contact.optInStatus = 'OPTED_IN';
        contact.optInSource = 'EXPLICIT_RE_OPT_IN';
        delete (contact as any).optedOutAt;
      }
      conversation.status = 'OPEN';
      const welcomeBack = "Aapka WhatsApp opt-in fir se active ho gaya hai! AutoMask / Coaching assistance ab aapki seva me uplabdh hai. Aap courses, fees ya demo batch ke baare me pooch sakte hain.";
      this.sendOutbound(conversation.id, welcomeBack, 'bot');
      return { actionTaken: 'RE_OPT_IN', replyText: welcomeBack };
    }

    // Step 1.6: Already Opted-Out Contact Guard (Zero Outbound)
    if (contact?.optInStatus === 'OPTED_OUT' || conversation.status === 'CLOSED') {
      // Message is recorded in thread, but zero automated outbound is generated
      return { actionTaken: 'OPT_OUT_SUPPRESSED' };
    }

    // Step 2: Check Human Takeover Active (DD-04, SRS 4.3)
    if (conversation.takeoverActive) {
      conversation.unreadCount += 1;
      return { actionTaken: 'TAKEOVER_ACTIVE' };
    }

    // Step 3: Check Active Booking intent
    if (textLower.includes('demo') || textLower.includes('trial') || textLower.includes('book slot')) {
      const availableSlot = mockStore.slots.find(s => s.status === 'AVAILABLE');
      const reply = availableSlot 
        ? `Great! Free Demo Session available:\n📅 ${availableSlot.title}\n⏰ ${availableSlot.startAt}\nReply "CONFIRM" to reserve your seat!`
        : "Demo sessions are currently full for today. A counsellor will call you shortly to arrange a customized session.";
      
      this.sendOutbound(conversation.id, reply, 'bot');
      conversation.leadStatus = 'DEMO_BOOKED';
      this.updateLeadStatus(studentPhone, 'DEMO_BOOKED', 'Student requested demo class', studentName);
      mockStore.usage.executionsUsed += 1;
      return { actionTaken: 'BOOKING_FLOW', replyText: reply, leadUpdated: true };
    }

    // Step 3.5: Check Interactive Button Clicks (Quick Replies & Actions)
    for (const rule of mockStore.rules) {
      if (rule.buttons && rule.buttons.length > 0) {
        const clickedBtn = rule.buttons.find(btn => {
          const btnClean = btn.title.toLowerCase().replace(/[^\w\s]/gi, '').trim();
          const inputClean = textLower.replace(/[^\w\s]/gi, '').trim();
          return inputClean === btnClean || inputClean.includes(btnClean) || textLower === btn.id.toLowerCase();
        });
        if (clickedBtn) {
          const reply = clickedBtn.payload || `Information for ${clickedBtn.title}:\nThank you for choosing Prakash Institute! Our counsellor will WhatsApp further details shortly.`;
          this.sendOutbound(conversation.id, reply, 'bot');
          mockStore.usage.executionsUsed += 1;
          return {
            actionTaken: 'RULE_MATCH',
            matchedRuleName: `${rule.name} › ${clickedBtn.title}`,
            replyText: reply,
          };
        }
      }
    }

    // Step 4: Evaluate Automation Rules in Priority Order (DD-03, DD-04)
    const sortedRules = [...mockStore.rules].filter(r => r.enabled).sort((a, b) => a.priority - b.priority);
    for (const rule of sortedRules) {
      const matches = rule.keywords.some(kw => textLower.includes(kw.toLowerCase()));
      if (matches) {
        rule.executionsCount += 1;
        mockStore.usage.executionsUsed += 1;
        this.sendOutbound(conversation.id, rule.replyMessage, 'bot', rule.buttons, rule.headerText, rule.footerText);

        // Apply rule actions
        if (rule.actions.includes('set_status:NEW')) {
          this.updateLeadStatus(studentPhone, 'NEW', undefined, studentName);
        }
        return { 
          actionTaken: 'RULE_MATCH', 
          matchedRuleName: rule.name, 
          replyText: rule.replyMessage,
          buttons: rule.buttons,
          headerText: rule.headerText,
          footerText: rule.footerText,
        };
      }
    }

    // Step 5: Knowledge-grounded AI Assistant (DD-05)
    // Check if question matches knowledge base using token boundaries and stop-word filtering
    const stopWords = new Set(['and', 'for', 'the', 'with', 'from', 'all', 'are', 'you', 'hai', 'kya', 'aur', 'mein', 'par', 'per']);
    const studentTokens = textLower.split(/[\s,.-]+/).filter(w => w.length > 2 && !stopWords.has(w));
    
    const matchedKnowledge = mockStore.knowledgeItems.find(item => {
      const titleTokens = item.title.toLowerCase().split(/[\s,.-]+/).filter(w => w.length > 2 && !stopWords.has(w));
      return titleTokens.some(term => studentTokens.includes(term));
    });

    if (matchedKnowledge) {
      mockStore.usage.aiRepliesUsed += 1;
      const aiReply = `📚 ${matchedKnowledge.title}:\n${matchedKnowledge.content}${matchedKnowledge.fees ? `\n\n💰 Fee: ${matchedKnowledge.fees}` : ''}${matchedKnowledge.batches ? `\n⏰ Batch: ${matchedKnowledge.batches}` : ''}\n\nKya aapko demo class chahiye ya counsellor se baat karni hai?`;
      this.sendOutbound(conversation.id, aiReply, 'bot');
      return { actionTaken: 'AI_FAQ_MATCH', replyText: aiReply };
    }

    // Step 6: Fallback & Human Takeover Handshake
    mockStore.usage.aiRepliesUsed += 1;
    const fallbackReply = "Aapka sawaal note kar liya gaya hai. Humare senior counsellor Sumit / Priya aapko thodi der me reply karenge ya call karenge. 🙏";
    this.sendOutbound(conversation.id, fallbackReply, 'bot');
    conversation.unreadCount += 1;
    return { actionTaken: 'FALLBACK_HANDOFF', replyText: fallbackReply };
  }

  private static sendOutbound(
    conversationId: string, 
    body: string, 
    senderType: 'bot' | 'agent',
    buttons?: any[],
    headerText?: string,
    footerText?: string
  ) {
    const outboundMsg: Message = {
      id: `msg-${Date.now()}-out`,
      conversationId: conversationId,
      direction: 'OUTBOUND',
      body,
      headerText,
      footerText,
      buttons,
      senderType,
      status: 'DELIVERED',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: buttons && buttons.length > 0 ? 'interactive' : 'text',
    };
    if (!mockStore.messages[conversationId]) {
      mockStore.messages[conversationId] = [];
    }
    mockStore.messages[conversationId].push(outboundMsg);

    const conv = mockStore.conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.lastMessage = body;
      conv.lastMessageAt = 'Just now';
    }
  }

  private static updateLeadStatus(phone: string, status: any, reason?: string, name: string = 'Prospective Student') {
    const cleanPhone = phone.replace(/\s+/g, '');
    let lead = mockStore.leads.find(l => l.phone.replace(/\s+/g, '') === cleanPhone);
    if (lead) {
      lead.status = status;
      if (reason) lead.notes = (lead.notes ? `${lead.notes} | ` : '') + reason;
    } else {
      const newLead = {
        id: `lead-${Date.now()}`,
        workspaceId: mockStore.workspace.id,
        contactId: `ct-${Date.now()}`,
        contactName: name,
        phone,
        course: 'General Inquiry',
        classGrade: 'Class 12',
        preferredBatch: 'Undecided',
        city: 'Delhi NCR',
        status: status,
        source: 'Direct Chat',
        score: 75,
        createdAt: 'Just now',
        notes: reason || 'Inbound WhatsApp Lead',
      };
      mockStore.leads.unshift(newLead);
    }
  }
}
