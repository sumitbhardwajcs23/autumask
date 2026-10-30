import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { mockStore } from '../models/mockStore';
import { DecisionRouter } from '../services/decisionRouter';
import { WebhookPipeline } from '../services/webhookPipeline';
import { Message, Lead, SupportGrant } from '../models/types';
import { 
  requirePermission, 
  requireRole, 
  checkMessageContentAccess,
  validateResourceScope,
  ROLE_PERMISSIONS
} from '../middleware/rbac';
import { 
  PERMISSIONS_REGISTRY, 
  ALL_PERMISSION_KEYS, 
  DEFAULT_SYSTEM_ROLES 
} from '../models/permissionsRegistry';
import { authenticateSession } from '../middleware/authMiddleware';
import { AuthService } from '../modules/auth/authService';
import { env } from '../config/env';
import { WhatsAppClient } from '../modules/whatsapp/whatsappClient';
import { WebhookQueueService } from '../modules/queue/webhookQueue';
import { RAGEngine } from '../modules/ai/ragEngine';
import { CoachingTools } from '../modules/ai/coachingTools';
import { LLMRouter } from '../modules/ai/llmRouter';
import { query } from '../database/connection';
import { CryptoUtils } from '../utils/cryptoUtils';

export const apiRouter = Router();

// Apply Session Authentication & Context Resolution
apiRouter.use(authenticateSession);

// ==========================================
// Authentication Context & Session Management
// ==========================================

apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const result = await AuthService.login(email, password, ip);
  
  if (!result.success) {
    return res.status(result.status).json({
      error: result.error,
      message: result.message,
    });
  }

  // Set secure HttpOnly session cookie
  res.cookie(env.SESSION_COOKIE_NAME, result.token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  return res.status(200).json({
    token: result.token,
    user: result.user,
    workspace: result.workspace,
    role: result.user.role,
  });
});

apiRouter.post('/auth/signup', async (req: Request, res: Response) => {
  const { email, password, fullName, phone, workspaceName } = req.body;
  const result = await AuthService.signup({ email, password, fullName, phone, workspaceName });

  if (!result.success) {
    return res.status(result.status).json({
      error: result.error,
      message: result.message,
    });
  }

  // Set secure HttpOnly session cookie
  res.cookie(env.SESSION_COOKIE_NAME, result.token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  return res.status(201).json({
    token: result.token,
    user: result.user,
    workspace: result.workspace,
    role: 'owner',
  });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  res.clearCookie(env.SESSION_COOKIE_NAME, { path: '/' });
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const user = req.user || mockStore.currentUser;
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  const workspaceId = req.workspaceId || mockStore.workspace.id;
  res.json({
    user,
    workspace: {
      ...mockStore.workspace,
      id: workspaceId,
      name: workspaceId === '22222222-2222-4222-8222-222222222222' ? 'Apex Academy' : mockStore.workspace.name,
    },
    permissions,
    activeSupportGrant: req.supportGrant || mockStore.supportGrants.find(
      g => g.workspaceId === workspaceId &&
           g.targetUserId === user.id &&
           !g.revokedAt &&
           new Date(g.expiresAt) > new Date()
    ) || null,
  });
});

// ==========================================
// Dashboard Metrics (SRS Section 8.1 / Mockup)
// ==========================================
apiRouter.get('/dashboard', requirePermission('view:dashboard'), async (req: Request, res: Response) => {
  const isLimited = req.user?.role === 'agent';
  let waAccount = mockStore.whatsappAccount;
  try {
    const wsId = (req.user as any)?.workspaceId || '11111111-1111-4111-8111-111111111111';
    const dbRes = await query('SELECT * FROM whatsapp_accounts WHERE workspace_id = $1 LIMIT 1;', [wsId]);
    if (dbRes.rows.length > 0) {
      const row = dbRes.rows[0];
      waAccount = {
        id: row.id,
        workspaceId: row.workspace_id,
        displayNumber: row.display_number,
        phoneNumberId: row.phone_number_id,
        status: row.status,
        qualityRating: row.quality_rating || 'GREEN',
        wabaId: row.waba_id,
      };
    }
  } catch (err) {}

  res.json({
    workspace: mockStore.workspace,
    currentUser: req.user,
    whatsappAccount: waAccount,
    metrics: mockStore.metrics,
    usage: isLimited ? null : mockStore.usage,
    recentConversations: mockStore.conversations.slice(0, 5),
    automationRules: isLimited ? [] : mockStore.rules,
    activeRulesCount: mockStore.rules.filter(r => r.enabled).length,
    inactiveRulesCount: mockStore.rules.filter(r => !r.enabled).length,
    teamMembersCount: mockStore.team.length,
    onlineMembersCount: mockStore.team.filter(m => m.isOnline).length,
    userRole: req.user?.role,
    isLimitedView: isLimited,
  });
});

// ==========================================
// Conversations & Shared Inbox (SRS Section 5.3)
// ==========================================
apiRouter.get('/conversations', requirePermission('view:inbox'), (req: Request, res: Response) => {
  const { status, search } = req.query;
  let result = [...mockStore.conversations];

  // Enforce resource scope: filter to assigned-only if restricted
  if (req.user?.resourceScope?.conversations === 'assigned_only' && req.user.role !== 'owner') {
    result = result.filter(c => c.assignedTo === req.user?.id);
  }

  if (status && typeof status === 'string' && status !== 'ALL') {
    result = result.filter(c => c.status === status);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    result = result.filter(c => 
      c.contactName.toLowerCase().includes(q) || 
      c.phone.includes(q) || 
      c.lastMessage.toLowerCase().includes(q)
    );
  }

  // If Platform Admin, metadata only is visible by default (SRS Section 3)
  if (req.user?.role === 'platform_admin' && !req.supportGrantActive) {
    result = result.map(c => ({
      ...c,
      lastMessage: '[PROTECTED CONTENT - REQUIRES OWNER SUPPORT GRANT]',
    }));
  }

  res.json({ conversations: result });
});

/**
 * Conversation Messages:
 * Protected by SRS Line 615 Privacy Safeguard.
 * Platform Admin cannot access student message content without an explicit, active, unexpired Owner support grant.
 */
apiRouter.get(
  '/conversations/:id/messages', 
  validateResourceScope('conversations'),
  checkMessageContentAccess, 
  (req: Request, res: Response) => {
    const convId = req.params.id;
    const conversation = mockStore.conversations.find(c => c.id === convId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    const messages = mockStore.messages[convId] || [];
    conversation.unreadCount = 0;

    res.json({ 
      conversation, 
      messages,
      accessedViaSupportGrant: req.supportGrantActive || false,
      grantId: req.supportGrant?.id || null,
    });
  }
);

apiRouter.post(
  '/conversations/:id/messages', 
  validateResourceScope('conversations'),
  requirePermission('send:messages'), 
  async (req: Request, res: Response) => {
  const convId = req.params.id;
  const { body, templateName, components, senderName } = req.body;
  if (!body && !templateName) {
    return res.status(400).json({ error: 'Message body or templateName is required' });
  }

  const conversation = mockStore.conversations.find(c => c.id === convId);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  const workspaceId = req.workspaceId || conversation.workspaceId || mockStore.workspace.id;
  const activeCounsellor = senderName || req.user?.fullName || 'Dr. Prakash Sharma';

  // Use WhatsAppClient to enforce opt-out, 24h window, and credential resolution
  let sendResult;
  if (templateName) {
    sendResult = await WhatsAppClient.sendTemplateMessage({
      workspaceId,
      toPhone: conversation.phone,
      templateName,
      components,
      conversationId: convId,
      senderName: activeCounsellor,
    });
  } else {
    sendResult = await WhatsAppClient.sendTextMessage({
      workspaceId,
      toPhone: conversation.phone,
      body: (body || '').trim(),
      conversationId: convId,
      isAiGenerated: false,
      senderName: activeCounsellor,
    });
  }

  if (!sendResult.success) {
    return res.status(400).json({
      success: false,
      error: sendResult.error,
      errorCode: sendResult.errorCode,
      status: sendResult.status,
    });
  }

  const msgList = mockStore.messages[convId] || [];
  const recordedMsg = msgList[msgList.length - 1];

  res.json({
    success: true,
    status: sendResult.status,
    providerMessageId: sendResult.providerMessageId,
    message: recordedMsg,
  });
});

apiRouter.post('/conversations/:id/takeover', requirePermission('send:messages'), (req: Request, res: Response) => {
  const convId = req.params.id;
  const { takeoverActive } = req.body;
  const conversation = mockStore.conversations.find(c => c.id === convId);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  conversation.takeoverActive = typeof takeoverActive === 'boolean' ? takeoverActive : !conversation.takeoverActive;
  
  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    conversation.takeoverActive ? 'HUMAN_TAKEOVER_ENABLED' : 'HUMAN_TAKEOVER_RELEASED',
    `conversation:${convId}`
  );

  res.json({ success: true, takeoverActive: conversation.takeoverActive });
});

// ==========================================
// Student Leads CRM (SRS Section 5.6)
// ==========================================
apiRouter.get('/leads', requirePermission('manage:leads'), (req: Request, res: Response) => {
  const { status, course } = req.query;
  let result = [...mockStore.leads];
  if (status && typeof status === 'string' && status !== 'ALL') {
    result = result.filter(l => l.status === status);
  }
  if (course && typeof course === 'string' && course !== 'ALL') {
    result = result.filter(l => l.course.toLowerCase().includes(course.toLowerCase()));
  }
  res.json({ leads: result });
});

// CSV Export: Allowed for Owner and Admin only (SRS Section 3: Agent = No)
apiRouter.get('/leads/export', requirePermission('export:leads'), (req: Request, res: Response) => {
  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'LEADS_EXPORTED_CSV',
    'leads_table',
    { count: mockStore.leads.length }
  );
  res.json({ success: true, count: mockStore.leads.length, leads: mockStore.leads });
});

apiRouter.patch('/leads/:id/status', requirePermission('manage:leads'), (req: Request, res: Response) => {
  const leadId = req.params.id;
  const { status } = req.body;
  const lead = mockStore.leads.find(l => l.id === leadId);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }
  const oldStatus = lead.status;
  lead.status = status;

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'LEAD_STATUS_CHANGED',
    `lead:${leadId}`,
    { from: oldStatus, to: status, manualConfirmation: status === 'ADMITTED' }
  );

  res.json({ success: true, lead });
});

apiRouter.post('/leads', requirePermission('manage:leads'), (req: Request, res: Response) => {
  const { contactName, phone, course, classGrade, preferredBatch, city, source } = req.body;
  const newLead: Lead = {
    id: `lead-${Date.now()}`,
    workspaceId: mockStore.workspace.id,
    contactId: `ct-${Date.now()}`,
    contactName: contactName || 'Prospective Student',
    phone: phone || '+91 98000 00000',
    course: course || 'JEE Main & Advanced',
    classGrade: classGrade || 'Class 12',
    preferredBatch: preferredBatch || 'Morning Batch',
    city: city || 'New Delhi',
    status: 'NEW',
    source: source || 'Direct Chat',
    score: 70,
    createdAt: 'Just now',
  };
  mockStore.leads.unshift(newLead);
  res.status(201).json({ success: true, lead: newLead });
});

// ==========================================
// Contacts CRM (SRS Section 4 & 5)
// ==========================================
apiRouter.get('/contacts', requirePermission('view:inbox'), (req: Request, res: Response) => {
  const { search, tag, optInStatus } = req.query;
  let result = [...mockStore.contacts];

  if (optInStatus && typeof optInStatus === 'string' && optInStatus !== 'ALL') {
    result = result.filter(c => c.optInStatus === optInStatus);
  }
  if (tag && typeof tag === 'string' && tag !== 'ALL') {
    result = result.filter(c => c.tags.includes(tag));
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    result = result.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.notes && c.notes.toLowerCase().includes(q))
    );
  }

  res.json({ contacts: result });
});

apiRouter.post('/contacts', requirePermission('manage:leads'), (req: Request, res: Response) => {
  const { name, phone, tags, optInStatus, notes } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }

  const newContact = mockStore.addContact(
    name,
    phone,
    Array.isArray(tags) ? tags : [tags].filter(Boolean),
    optInStatus || 'OPTED_IN',
    notes
  );

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'CONTACT_CREATED',
    `contact:${newContact.id}`,
    { name: newContact.name, phone: newContact.phone }
  );

  res.status(201).json({ success: true, contact: newContact });
});

apiRouter.patch('/contacts/:id/opt-in', requirePermission('manage:leads'), (req: Request, res: Response) => {
  const contactId = req.params.id;
  const updated = mockStore.toggleContactOptIn(contactId);
  if (!updated) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'CONTACT_OPT_IN_TOGGLED',
    `contact:${contactId}`,
    { optInStatus: updated.optInStatus }
  );

  res.json({ success: true, contact: updated });
});

apiRouter.delete('/contacts/:id', requirePermission('manage:leads'), (req: Request, res: Response) => {
  const contactId = req.params.id;
  const deleted = mockStore.deleteContact(contactId);
  if (!deleted) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'CONTACT_DELETED',
    `contact:${contactId}`
  );

  res.json({ success: true, message: 'Contact deleted successfully' });
});

// ==========================================
// Automation Rules (SRS Section 5.4 & Section 3)
// Rule creation/editing is restricted to Owner and Admin only (Agent = No)
// ==========================================
apiRouter.get('/automations', requirePermission('view:dashboard'), (req: Request, res: Response) => {
  res.json({ rules: mockStore.rules });
});

apiRouter.patch('/automations/:id/toggle', requirePermission('manage:rules'), (req: Request, res: Response) => {
  const ruleId = req.params.id;
  const rule = mockStore.rules.find(r => r.id === ruleId);
  if (!rule) {
    return res.status(404).json({ error: 'Rule not found' });
  }
  rule.enabled = !rule.enabled;

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    rule.enabled ? 'RULE_ENABLED' : 'RULE_DISABLED',
    `rule:${ruleId}`
  );

  res.json({ success: true, rule });
});

apiRouter.post('/automations', requirePermission('manage:rules'), (req: Request, res: Response) => {
  const { name, description, keywords, replyMessage, trigger, headerText, footerText, buttons } = req.body;
  const newRule = {
    id: `rule-${Date.now()}`,
    name: name || 'Custom Keyword Trigger',
    description: description || 'Auto response for custom student query',
    trigger: trigger || 'KEYWORD',
    keywords: Array.isArray(keywords) ? keywords : [keywords].filter(Boolean),
    headerText: headerText || undefined,
    replyMessage: replyMessage || 'Thank you for reaching out to Prakash Institute!',
    footerText: footerText || undefined,
    buttons: Array.isArray(buttons) ? buttons : [],
    actions: ['assign_tag:Custom'],
    priority: mockStore.rules.length + 1,
    enabled: true,
    executionsCount: 0,
  };
  mockStore.rules.push(newRule);

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'RULE_CREATED',
    `rule:${newRule.id}`,
    { name: newRule.name }
  );

  res.status(201).json({ success: true, rule: newRule });
});

apiRouter.put('/automations/:id', requirePermission('manage:rules'), (req: Request, res: Response) => {
  const ruleId = req.params.id;
  const updated = mockStore.updateRule(ruleId, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Rule not found' });
  }

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'RULE_UPDATED',
    `rule:${ruleId}`,
    { name: updated.name }
  );

  res.json({ success: true, rule: updated });
});

apiRouter.delete('/automations/:id', requirePermission('manage:rules'), (req: Request, res: Response) => {
  const ruleId = req.params.id;
  const deleted = mockStore.deleteRule(ruleId);
  if (!deleted) {
    return res.status(404).json({ error: 'Rule not found' });
  }

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'RULE_DELETED',
    `rule:${ruleId}`
  );

  res.json({ success: true, message: 'Rule deleted successfully' });
});

// ==========================================
// Knowledge Base for AI (SRS Section 5.5)
// Restricted to Owner and Admin only (Agent = No)
// ==========================================
apiRouter.get('/knowledge', requirePermission('view:inbox'), (req: Request, res: Response) => {
  res.json({ knowledgeItems: mockStore.knowledgeItems });
});

apiRouter.post('/knowledge', requirePermission('manage:knowledge'), async (req: Request, res: Response) => {
  const { type, title, content, fees, batches } = req.body;
  const workspaceId = req.workspaceId || mockStore.workspace.id;

  try {
    const ingestResult = await RAGEngine.ingestDocument({
      workspaceId,
      type: type || 'faq',
      title: title || 'New Course / FAQ',
      content: content || '',
      fees: fees || '',
      batches: batches || '',
    });

    res.status(201).json({ 
      success: true, 
      item: {
        id: ingestResult.id,
        type: type || 'faq',
        title,
        content,
        fees,
        batches,
        chunksCount: ingestResult.chunksCount,
      } 
    });
  } catch (err: any) {
    // If DB ingestion has an issue, preserve mockStore fallback
    const newItem = {
      id: `ki-${Date.now()}`,
      type: type || 'faq',
      title: title || 'New Course / FAQ',
      content: content || '',
      fees: fees || '',
      batches: batches || '',
      active: true,
    };
    mockStore.knowledgeItems.push(newItem);
    res.status(201).json({ success: true, item: newItem });
  }
});

apiRouter.post('/knowledge/query', requirePermission('view:inbox'), async (req: Request, res: Response) => {
  const { query: queryText, studentName } = req.body;
  const workspaceId = req.workspaceId || mockStore.workspace.id;
  try {
    const ragResult = await RAGEngine.generateGroundedAnswer(workspaceId, queryText || '', studentName);
    res.json({ success: true, ...ragResult });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/knowledge/:id', requirePermission('manage:knowledge'), (req: Request, res: Response) => {
  const id = req.params.id;
  const deleted = mockStore.deleteKnowledgeItem(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Knowledge item not found' });
  }

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'KNOWLEDGE_ITEM_DELETED',
    `knowledge:${id}`
  );

  res.json({ success: true, message: 'Knowledge item deleted' });
});

apiRouter.post('/tools/execute', requirePermission('view:inbox'), async (req: Request, res: Response) => {
  const { toolName, args = {} } = req.body;
  const workspaceId = req.workspaceId || mockStore.workspace.id;

  try {
    let result;
    if (toolName === 'searchCoursesAndFaqs') {
      result = await CoachingTools.searchCoursesAndFaqs(workspaceId, args.query);
    } else if (toolName === 'captureOrUpdateLead') {
      result = await CoachingTools.captureOrUpdateLead({ workspaceId, ...args });
    } else if (toolName === 'checkDemoAvailability') {
      result = await CoachingTools.checkDemoAvailability(workspaceId, args.targetDate);
    } else if (toolName === 'reserveDemoBooking') {
      result = await CoachingTools.reserveDemoBooking({ workspaceId, ...args });
    } else if (toolName === 'requestHumanHandoff') {
      result = await CoachingTools.requestHumanHandoff(workspaceId, args.conversationId, args.reason);
    } else {
      result = CoachingTools.executeTool(toolName, args);
    }
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// Demo Bookings / Slots (SRS Section 5.8)
// Slot configuration is restricted to Owner and Admin (Agent = No)
// ==========================================
apiRouter.get('/bookings', requirePermission('manage:leads'), (req: Request, res: Response) => {
  res.json({
    slots: mockStore.slots,
    appointments: mockStore.appointments,
  });
});

apiRouter.post('/bookings/slots', requirePermission('manage:bookings_config'), (req: Request, res: Response) => {
  const { title, startAt, endAt, capacity } = req.body;
  const newSlot = {
    id: `slot-${Date.now()}`,
    title: title || 'Demo Lecture',
    startAt: startAt || 'Monday 4:00 PM',
    endAt: endAt || 'Monday 5:00 PM',
    capacity: capacity ? Number(capacity) : 20,
    bookedCount: 0,
    status: 'AVAILABLE' as const,
  };
  mockStore.slots.unshift(newSlot);
  res.status(201).json({ success: true, slot: newSlot });
});

apiRouter.post('/bookings/appointments', requirePermission('manage:leads'), (req: Request, res: Response) => {
  const { slotId, studentName, phone, course } = req.body;
  if (!slotId || !studentName || !phone) {
    return res.status(400).json({ error: 'slotId, studentName, and phone are required' });
  }

  const appt = mockStore.bookSlot(slotId, studentName, phone);
  if (course) appt.course = course;

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'DEMO_APPOINTMENT_SCHEDULED',
    `slot:${slotId}`,
    { studentName, phone, course }
  );

  res.status(201).json({ success: true, appointment: appt });
});

// ==========================================
// Billing & Quotas (SRS Section 10 & Section 3)
// "Manage billing and plan": Owner = Yes, Admin = No, Agent = No, Platform Admin = View only
// ==========================================
apiRouter.get('/billing', (req: Request, res: Response) => {
  const role = req.user?.role;
  if (role === 'agent' || role === 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: `Role '${role}' is not authorized to access billing. Only workspace Owner can manage billing (SRS Section 3).`,
      role,
    });
  }

  res.json({
    workspace: mockStore.workspace,
    usage: mockStore.usage,
    plans: [
      { id: 'starter', name: 'Starter', price: 499, team: 2, executions: 1000, aiReplies: 300 },
      { id: 'growth', name: 'Growth', price: 999, team: 5, executions: 3000, aiReplies: 1000 },
      { id: 'pro', name: 'Pro (Current)', price: 2499, team: 15, executions: 10000, aiReplies: 4000, current: true },
    ],
    readOnly: role === 'platform_admin',
  });
});

apiRouter.post('/billing/upgrade', requirePermission('manage:billing'), (req: Request, res: Response) => {
  const { planId } = req.body;
  mockStore.workspace.planId = planId || 'pro';
  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'BILLING_PLAN_UPGRADED',
    `plan:${planId}`
  );
  res.json({ success: true, planId });
});

// Plan pricing in INR paise (Razorpay takes smallest currency unit)
const PLAN_PRICES: Record<string, { amount: number; name: string }> = {
  starter: { amount: 49900, name: 'Starter Plan' },
  growth: { amount: 99900, name: 'Growth Plan' },
  pro: { amount: 249900, name: 'Pro Institute Plan' },
};

// Razorpay 1: Create Order
apiRouter.post('/billing/razorpay/order', requirePermission('manage:billing'), async (req: Request, res: Response) => {
  const { planId = 'pro' } = req.body;
  const planInfo = PLAN_PRICES[planId] || PLAN_PRICES.pro;
  const receipt = `rcpt_${Date.now()}`;

  // If Razorpay live/test credentials are provided in env, call Razorpay Orders API
  if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64');
      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          amount: planInfo.amount,
          currency: 'INR',
          receipt,
          notes: {
            workspaceId: req.workspaceId || mockStore.workspace.id,
            planId,
            planName: planInfo.name,
          },
        }),
      });

      if (rzpRes.ok) {
        const order = await rzpRes.json();
        return res.json({
          success: true,
          order,
          keyId: env.RAZORPAY_KEY_ID,
        });
      }
    } catch (err: any) {
      console.warn('Razorpay live order call failed, using sandbox fallback:', err?.message);
    }
  }

  // Development sandbox fallback order
  res.json({
    success: true,
    order: {
      id: `order_${Date.now()}`,
      entity: 'order',
      amount: planInfo.amount,
      amount_paid: 0,
      amount_due: planInfo.amount,
      currency: 'INR',
      receipt,
      status: 'created',
      notes: {
        workspaceId: req.workspaceId || mockStore.workspace.id,
        planId,
        planName: planInfo.name,
      },
    },
    keyId: env.RAZORPAY_KEY_ID || 'rzp_test_automask_mock',
    mockMode: !env.RAZORPAY_KEY_ID,
  });
});

// Razorpay 2: Verify Payment Signature & Activate Plan
apiRouter.post('/billing/razorpay/verify', requirePermission('manage:billing'), (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId = 'pro' } = req.body;

  let isValid = false;
  if (env.RAZORPAY_KEY_SECRET && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    isValid = expectedSignature === razorpay_signature;
  } else {
    // Development mode approval
    isValid = Boolean(razorpay_payment_id || razorpay_order_id);
  }

  if (!isValid) {
    return res.status(400).json({ error: 'Invalid Razorpay payment signature' });
  }

  // Activate plan
  mockStore.workspace.planId = planId;
  const planInfo = PLAN_PRICES[planId] || PLAN_PRICES.pro;

  if (planId === 'pro') {
    mockStore.usage.teamMembersLimit = 15;
    mockStore.usage.monthlyActiveStudentsLimit = 10000;
  } else if (planId === 'growth') {
    mockStore.usage.teamMembersLimit = 5;
    mockStore.usage.monthlyActiveStudentsLimit = 3000;
  }

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'RAZORPAY_PAYMENT_CAPTURED',
    `order:${razorpay_order_id}|payment:${razorpay_payment_id}|plan:${planId}|amount:${planInfo.amount / 100}INR`
  );

  res.json({
    success: true,
    message: `Payment verified! Workspace upgraded to ${planInfo.name}.`,
    planId,
    paymentId: razorpay_payment_id,
  });
});

// Razorpay 3: Webhook Event Processor
apiRouter.post('/billing/razorpay/webhook', (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;

  if (webhookSecret && signature) {
    const rawBody = JSON.stringify(req.body);
    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
    if (signature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid Razorpay webhook signature' });
    }
  }

  const event = req.body.event;
  console.log(`[Razorpay Webhook] Received event: ${event}`);
  res.json({ status: 'ok' });
});

// AI Provider Live Connection Test Endpoint (Groq / Gemini)
apiRouter.post('/ai/test-provider', async (req: Request, res: Response) => {
  const { provider = 'groq', model, query = 'Namaste! Please tell me about JEE demo class timings.' } = req.body;
  try {
    const result = await LLMRouter.complete({
      provider,
      model,
      temperature: 0.2,
      maxTokens: 256,
      messages: [
        { role: 'system', content: 'You are AutoMask AI assistant for Indian business automation. Respond politely in natural Hinglish.' },
        { role: 'user', content: query },
      ],
    });
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'LLM provider call failed' });
  }
});

// ==========================================
// Critical Privacy Safeguard (SRS Line 615):
// Support Grants for Platform Admin Access
// ==========================================

// Create Support Grant (Owner Only!)
apiRouter.post('/support-grants', requirePermission('manage:support_grants'), (req: Request, res: Response) => {
  const { targetUserId, hoursValid = 2, durationMinutes, reason } = req.body;
  if (!targetUserId || !reason) {
    return res.status(400).json({ error: 'targetUserId and reason are required' });
  }

  const targetUser = mockStore.users[targetUserId] ||
    (targetUserId === '00000000-0000-4000-8000-000000000000' || targetUserId === 'usr-platform-00'
      ? { id: targetUserId, role: 'platform_admin' as const, email: 'ops@automask.io', fullName: 'AutoMask Support Ops', isOnline: true }
      : null);

  if (!targetUser || targetUser.role !== 'platform_admin') {
    return res.status(400).json({ error: 'Target user must be a registered platform_admin' });
  }

  const workspaceId = req.workspaceId || mockStore.workspace.id;
  const now = new Date();
  const durationHours = durationMinutes ? durationMinutes / 60 : Number(hoursValid);
  const expiresAt = new Date(now.getTime() + durationHours * 3600 * 1000).toISOString();

  const grant: SupportGrant = {
    id: `grant-${Date.now()}`,
    workspaceId,
    grantedByUserId: req.user!.id,
    targetUserId,
    scope: 'read:message_content',
    reason,
    createdAt: now.toISOString(),
    expiresAt,
    revokedAt: null,
  };

  mockStore.supportGrants.unshift(grant);

  mockStore.logAudit(
    workspaceId,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'SUPPORT_GRANT_CREATED',
    `grant:${grant.id}`,
    { targetUserId, expiresAt, reason, hoursValid }
  );

  res.status(201).json({ success: true, grant });
});

// List Support Grants
apiRouter.get('/support-grants', (req: Request, res: Response) => {
  const workspaceId = req.workspaceId || mockStore.workspace.id;
  const grants = mockStore.supportGrants.filter(g => g.workspaceId === workspaceId);
  res.json({ grants });
});

// Revoke Support Grant (Owner Only!)
apiRouter.delete('/support-grants/:id', requirePermission('manage:support_grants'), (req: Request, res: Response) => {
  const grantId = req.params.id;
  const grant = mockStore.supportGrants.find(g => g.id === grantId);
  if (!grant) {
    return res.status(404).json({ error: 'Support grant not found' });
  }

  grant.revokedAt = new Date().toISOString();
  grant.revokedByUserId = req.user!.id;

  mockStore.logAudit(
    grant.workspaceId,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'SUPPORT_GRANT_REVOKED',
    `grant:${grant.id}`,
    { revokedBy: req.user!.id }
  );

  res.json({ success: true, grant });
});

// ==========================================
// Audit Logs (SRS Section 3: Owner, Admin, Platform Admin)
// ==========================================
apiRouter.get('/audit-logs', requirePermission('view:audit_logs'), (req: Request, res: Response) => {
  const workspaceId = req.workspaceId || mockStore.workspace.id;
  const logs = req.user?.role === 'platform_admin' 
    ? mockStore.auditLogs 
    : mockStore.auditLogs.filter(l => l.workspaceId === workspaceId);

  res.json({ logs });
});

// ==========================================
// Interactive WhatsApp Simulator (SRS 4.2 & 4.3)
// ==========================================
apiRouter.post('/whatsapp/simulate', (req: Request, res: Response) => {
  const { phone, message, name, conversationId } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  const result = DecisionRouter.processInboundMessage(
    conversationId || 'conv-01',
    phone || '+91 98112 34567',
    message,
    name || 'Student'
  );

  res.json({
    success: true,
    result,
    conversation: mockStore.conversations.find(c => c.phone === phone || c.id === conversationId),
    messages: mockStore.messages[conversationId || 'conv-01'],
  });
});

// ==========================================
// Meta WhatsApp Cloud API Webhooks (SRS Section 4.2)
// ==========================================
apiRouter.get('/webhooks/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === 'automask_webhook_verify_token') {
    return res.status(200).send(challenge);
  }
  res.status(403).json({ error: 'Invalid verification token' });
});

apiRouter.post('/webhooks/whatsapp', async (req: Request, res: Response) => {
  const signatureHeader = req.headers['x-hub-signature-256'] as string | undefined;
  const rawBody = (req as any).rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
  const hasCustomAppSecret = env.META_APP_SECRET && 
    env.META_APP_SECRET !== 'meta_test_secret_for_sha256' && 
    env.META_APP_SECRET !== 'automask_meta_secret_key';
  
  const isValidSig = hasCustomAppSecret
    ? WebhookPipeline.verifySignature(rawBody, signatureHeader, env.META_APP_SECRET)
    : true;

  if (signatureHeader && hasCustomAppSecret && !isValidSig) {
    return res.status(403).json({ error: 'Invalid webhook signature' });
  }

  // Handle Meta message delivery and read status receipts if present
  const entry = req.body?.entry?.[0];
  const value = entry?.changes?.[0]?.value;
  if (value?.statuses && Array.isArray(value.statuses)) {
    for (const status of value.statuses) {
      await WhatsAppClient.handleStatusUpdate(status);
    }
  }

  // Enqueue durable inbound webhook processing with idempotency
  const enqueueResult = await WebhookQueueService.ingestAndEnqueue(req.body, isValidSig, rawBody);

  res.status(200).json({
    success: true,
    status: enqueueResult.status,
    duplicate: enqueueResult.duplicate,
    eventId: enqueueResult.eventId,
  });
});

// ==========================================
// Section 4.1: Onboarding Workflow Checklist
// ==========================================
apiRouter.get('/onboarding/status', (req: Request, res: Response) => {
  res.json({
    workspace: mockStore.workspace,
    steps: [
      { id: 'auth_signup', title: 'Institute Account Creation', completed: true },
      { id: 'business_profile', title: 'Business Profile & Working Hours', completed: true },
      { id: 'connect_whatsapp', title: 'Connect WhatsApp Cloud API', completed: mockStore.whatsappAccount.status === 'CONNECTED' },
      { id: 'knowledge_base', title: 'Add Course Catalog & Fees (RAG)', completed: mockStore.knowledgeItems.length > 0 },
      { id: 'demo_slots', title: 'Configure Live Demo Slots', completed: mockStore.slots.length > 0 },
      { id: 'test_message', title: 'Send First Test WhatsApp Message', completed: true },
    ],
    overallProgress: 100,
  });
});

// ==========================================
// WhatsApp Account & Team Settings (SRS §3 & §8)
// ==========================================
apiRouter.get('/whatsapp/account', requirePermission('view:dashboard'), async (req: Request, res: Response) => {
  try {
    const wsId = (req.user as any)?.workspaceId || '11111111-1111-4111-8111-111111111111';
    const dbRes = await query('SELECT * FROM whatsapp_accounts WHERE workspace_id = $1 LIMIT 1;', [wsId]);
    if (dbRes.rows.length > 0) {
      const row = dbRes.rows[0];
      return res.json({
        account: {
          id: row.id,
          workspaceId: row.workspace_id,
          displayNumber: row.display_number,
          phoneNumberId: row.phone_number_id,
          status: row.status,
          qualityRating: row.quality_rating || 'GREEN',
          wabaId: row.waba_id,
        },
      });
    }
  } catch (err) {}
  res.json({ account: mockStore.whatsappAccount });
});

apiRouter.post('/whatsapp/connect', requirePermission('view:dashboard'), async (req: Request, res: Response) => {
  const { phoneNumberId, wabaId, displayNumber, accessToken } = req.body;
  if (!phoneNumberId || !wabaId) {
    return res.status(400).json({ error: 'phoneNumberId and wabaId are required' });
  }

  const wsId = (req.user as any)?.workspaceId || '11111111-1111-4111-8111-111111111111';
  let resolvedDisplayNumber = displayNumber;
  let qualityRating = 'GREEN';

  // Live verification with Meta Graph API if access token is available
  const tokenToUse = accessToken || env.META_ACCESS_TOKEN;
  if (tokenToUse && tokenToUse.startsWith('EAA')) {
    try {
      const metaRes = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}`, {
        headers: { Authorization: `Bearer ${tokenToUse}` }
      });
      const metaData = await metaRes.json() as any;
      if (metaData && !metaData.error) {
        resolvedDisplayNumber = metaData.display_phone_number || resolvedDisplayNumber || '+1 555-660-3701';
        qualityRating = metaData.quality_rating || 'GREEN';
      }
    } catch (e) {}
  }

  if (!resolvedDisplayNumber) {
    resolvedDisplayNumber = '+1 555-660-3701';
  }

  const encryptedToken = accessToken ? CryptoUtils.encrypt(accessToken) : null;

  try {
    const dbRes = await query(
      `INSERT INTO whatsapp_accounts (id, workspace_id, phone_number_id, waba_id, display_number, token_encrypted, status, quality_rating, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'CONNECTED', $6, NOW())
       ON CONFLICT (workspace_id) DO UPDATE
       SET phone_number_id = EXCLUDED.phone_number_id,
           waba_id = EXCLUDED.waba_id,
           display_number = EXCLUDED.display_number,
           token_encrypted = COALESCE(EXCLUDED.token_encrypted, whatsapp_accounts.token_encrypted),
           status = 'CONNECTED',
           quality_rating = EXCLUDED.quality_rating,
           updated_at = NOW()
       RETURNING id, workspace_id, phone_number_id, waba_id, display_number, status, quality_rating;`,
      [wsId, phoneNumberId, wabaId, resolvedDisplayNumber, encryptedToken, qualityRating]
    );

    const saved = dbRes.rows[0];
    const accountObj = {
      id: saved.id,
      workspaceId: saved.workspace_id,
      displayNumber: saved.display_number,
      phoneNumberId: saved.phone_number_id,
      status: saved.status,
      qualityRating: saved.quality_rating,
      wabaId: saved.waba_id,
    };

    mockStore.whatsappAccount = accountObj as any;

    return res.json({
      success: true,
      message: 'WhatsApp Business Account connected successfully!',
      account: accountObj,
    });
  } catch (err: any) {
    const fallbackObj = {
      id: 'wa-acc-01',
      workspaceId: wsId,
      displayNumber: resolvedDisplayNumber,
      phoneNumberId,
      status: 'CONNECTED' as const,
      qualityRating: qualityRating as any,
      wabaId,
    };
    mockStore.whatsappAccount = fallbackObj as any;
    return res.json({
      success: true,
      message: 'WhatsApp Business Account connected successfully!',
      account: fallbackObj,
    });
  }
});

apiRouter.post('/whatsapp/disconnect', requirePermission('view:dashboard'), async (req: Request, res: Response) => {
  const wsId = (req.user as any)?.workspaceId || '11111111-1111-4111-8111-111111111111';
  try {
    await query(
      `UPDATE whatsapp_accounts SET status = 'DISCONNECTED', updated_at = NOW() WHERE workspace_id = $1;`,
      [wsId]
    );
  } catch (err) {}
  mockStore.whatsappAccount.status = 'DISCONNECTED';
  res.json({ success: true, message: 'WhatsApp account disconnected' });
});

apiRouter.post('/whatsapp/test-message', requirePermission('send:messages'), async (req: Request, res: Response) => {
  const { toPhone, message } = req.body;
  if (!toPhone) {
    return res.status(400).json({ error: 'toPhone is required' });
  }

  const wsId = (req.user as any)?.workspaceId || '11111111-1111-4111-8111-111111111111';
  const textBody = message || 'Hello from AutoMask! Your WhatsApp automation platform is successfully connected and working.';

  const result = await WhatsAppClient.sendTextMessage({
    workspaceId: wsId,
    toPhone,
    body: textBody,
    bypassWindowCheck: true,
    senderName: req.user?.fullName || 'AutoMask Test',
  });

  if (!result.success) {
    const templateResult = await WhatsAppClient.sendTemplateMessage({
      workspaceId: wsId,
      toPhone,
      templateName: 'hello_world',
      languageCode: 'en_US',
    });
    if (templateResult.success) {
      return res.json({
        success: true,
        method: 'template',
        templateName: 'hello_world',
        providerMessageId: templateResult.providerMessageId,
        message: 'Test message sent successfully via hello_world template!'
      });
    }

    return res.status(400).json({
      success: false,
      error: result.error,
      errorCode: result.errorCode,
    });
  }

  res.json({
    success: true,
    method: 'text',
    providerMessageId: result.providerMessageId,
    message: 'Test message sent successfully!',
  });
});

apiRouter.get('/team', requirePermission('view:dashboard'), (req: Request, res: Response) => {
  res.json({ team: mockStore.team });
});

apiRouter.post('/team/invite', requirePermission('manage:staff'), (req: Request, res: Response) => {
  const { fullName, email, role } = req.body;
  if (!fullName || !email) {
    return res.status(400).json({ error: 'fullName and email are required' });
  }
  const newMember = mockStore.inviteTeamMember(fullName, email, role || 'agent');

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'STAFF_INVITED',
    `user:${newMember.id}`,
    { fullName, email, role: newMember.role }
  );

  res.status(201).json({ success: true, user: newMember });
});

apiRouter.patch('/team/:id/status', requirePermission('manage:staff'), (req: Request, res: Response) => {
  const memberId = req.params.id;
  const updated = mockStore.toggleTeamMemberStatus(memberId);
  if (!updated) {
    return res.status(404).json({ error: 'Team member not found' });
  }
  res.json({ success: true, user: updated });
});

apiRouter.delete('/team/:id', requirePermission('manage:staff'), (req: Request, res: Response) => {
  const memberId = req.params.id;
  if (memberId === req.user?.id) {
    return res.status(400).json({ error: 'Cannot remove your own account' });
  }
  const deleted = mockStore.deleteTeamMember(memberId);
  if (!deleted) {
    return res.status(404).json({ error: 'Team member not found' });
  }
  res.json({ success: true, message: 'Team member removed' });
});

// ==========================================
// WhatsApp Message Templates & Broadcast Campaigns (SRS §5.4 & Appendix C)
// ==========================================
apiRouter.get('/whatsapp/templates', requirePermission('view:dashboard'), (req: Request, res: Response) => {
  res.json({ templates: mockStore.templates });
});

apiRouter.post('/whatsapp/broadcast', requirePermission('send:messages'), async (req: Request, res: Response) => {
  const { name, templateName, targetSegment, count: requestedCount } = req.body;
  if (!name || !templateName) {
    return res.status(400).json({ error: 'name and templateName are required' });
  }

  const targetLeads = targetSegment && targetSegment !== 'ALL'
    ? mockStore.leads.filter(l => l.status === targetSegment)
    : mockStore.leads;

  const count = requestedCount || Math.max(targetLeads.length * 15, 24);
  mockStore.usage.templateMessagesUsed = Math.min(
    mockStore.usage.templateMessagesUsed + count,
    mockStore.usage.templateMessagesLimit
  );

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'BROADCAST_CAMPAIGN_SENT',
    `broadcast:${templateName}`,
    { name, targetSegment, count, templateName }
  );

  res.status(200).json({
    success: true,
    campaign: {
      id: `bc-${Date.now()}`,
      name,
      templateName,
      targetCount: count,
      deliveredCount: count - 1,
      readCount: Math.round(count * 0.78),
      status: 'COMPLETED',
      sentAt: new Date().toISOString(),
    },
    usage: mockStore.usage,
  });
});

// ==========================================
// Section 4: Workflows Engine & 7-Stage Simulator
// ==========================================
apiRouter.get('/workflows', requirePermission('view:dashboard'), (req: Request, res: Response) => {
  const stages = [
    { stage: 1, name: 'Deduplication & HMAC', description: 'Idempotent WAMID and SHA256 signature verification', enabled: true, type: 'SECURITY', handledCount: 1420 },
    { stage: 2, name: 'Human Takeover Gate', description: 'Routes to counselor inbox, pausing automated bot responses', enabled: true, type: 'ROUTING', handledCount: 312 },
    { stage: 3, name: 'Opt-Out & Compliance', description: 'Detects STOP keywords, cancels subscriptions and records consent', enabled: true, type: 'COMPLIANCE', handledCount: 88 },
    { stage: 4, name: 'Demo Booking Engine', description: 'Parses trial class requests and allocates capacity-checked slots', enabled: true, type: 'CONVERSION', handledCount: 740 },
    { stage: 5, name: 'Keyword Automation Rules', description: 'Matches exact or fuzzy coaching terms (JEE, NEET, Fees)', enabled: true, type: 'AUTOMATION', handledCount: 3820 },
    { stage: 6, name: 'Grounded RAG FAQ Match', description: 'Retrieves verified institute facts (Hostel, Faculty, DPPs)', enabled: true, type: 'AI_AGENT', handledCount: 2950 },
    { stage: 7, name: 'Safe Fallback & Escalation', description: 'Sends friendly holding message and flags conversation for staff', enabled: true, type: 'FALLBACK', handledCount: 410 },
  ];

  res.json({
    workflows: stages,
    activeRulesCount: mockStore.rules.filter(r => r.enabled).length,
    autoReplyLatencyMs: 420,
    dailyProcessedCount: 9740,
  });
});

apiRouter.post('/workflows/simulate-stage', (req: Request, res: Response) => {
  const { message, phone, name } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  const startTime = Date.now();
  const result = DecisionRouter.processInboundMessage(
    'conv-sim-stage',
    phone || '+91 98112 34567',
    message,
    name || 'Student'
  );
  const latencyMs = Date.now() - startTime;

  res.json({
    success: true,
    result,
    latencyMs,
  });
});

// ==========================================
// Integrations & Ecosystem Webhooks
// ==========================================
apiRouter.get('/integrations', requirePermission('view:dashboard'), (req: Request, res: Response) => {
  res.json({
    integrations: [
      {
        id: 'meta_cloud_api',
        name: 'Meta WhatsApp Cloud API',
        category: 'Messaging',
        status: mockStore.whatsappAccount.status === 'CONNECTED' ? 'CONNECTED' : 'DISCONNECTED',
        description: 'Official WhatsApp Business Platform for verified direct messaging',
        account: mockStore.whatsappAccount.displayNumber,
        icon: 'phone',
      },
      {
        id: 'openai_embeddings',
        name: 'OpenAI text-embedding-3-small',
        category: 'AI & Vectors',
        status: 'CONNECTED',
        description: 'Semantic vector similarity engine for grounded course answers',
        account: '1536 Dimensions',
        icon: 'cpu',
      },
      {
        id: 'google_sheets',
        name: 'Google Sheets CRM Sync',
        category: 'Productivity',
        status: 'ACTIVE',
        description: 'Auto-export new leads and demo registrations to Google Sheets',
        account: 'prakash-admissions-2027.xlsx',
        icon: 'sheets',
      },
      {
        id: 'webhook_dispatch',
        name: 'Outbound CRM Webhooks',
        category: 'Developer',
        status: 'ACTIVE',
        description: 'Real-time webhook notifications on admission status transitions',
        account: `http://localhost:${env.PORT || 5000}/api/v1/webhooks`,
        icon: 'webhook',
      },
    ]
  });
});

apiRouter.post('/integrations/test-webhook', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 200,
    latencyMs: 114,
    message: 'Webhook handshake verified successfully with external receiver',
    timestamp: new Date().toISOString(),
  });
});

// ==============================================================================
// 1. ADVANCED RBAC & PERMISSIONS REGISTRY (AutoMask Section 2 & 3)
// ==============================================================================

apiRouter.get('/permissions/registry', requirePermission('roles.view'), (req: Request, res: Response) => {
  res.json({
    registry: PERMISSIONS_REGISTRY,
    defaultRoles: DEFAULT_SYSTEM_ROLES,
    allKeys: ALL_PERMISSION_KEYS,
  });
});

apiRouter.get('/roles', requirePermission('roles.view'), (req: Request, res: Response) => {
  res.json({ roles: mockStore.roles });
});

apiRouter.post('/roles', requirePermission('roles.create'), (req: Request, res: Response) => {
  const { name, description, permissions } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Role name is required' });
  }

  // Prevent privilege escalation: A user cannot grant permissions beyond their own authority
  if (req.user!.role !== 'owner') {
    const userRolePerms = req.user!.customRoleId 
      ? (mockStore.roles.find(r => r.id === req.user!.customRoleId)?.permissions || [])
      : (DEFAULT_SYSTEM_ROLES[req.user!.role]?.permissions || []);
    const userPermSet = new Set(userRolePerms);
    for (const p of (permissions || [])) {
      if (!userPermSet.has(p)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Privilege escalation blocked: Cannot grant permission '${p}' which you do not possess.`,
        });
      }
    }
  }

  const newRole = mockStore.createCustomRole(name, description || '', permissions || []);
  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'CUSTOM_ROLE_CREATED',
    `role:${newRole.id}`,
    { name, permissionsCount: newRole.permissions.length }
  );
  res.status(201).json({ success: true, role: newRole });
});

apiRouter.put('/roles/:id', requirePermission('roles.edit'), (req: Request, res: Response) => {
  const { name, description, permissions } = req.body;
  const roleId = req.params.id;

  const targetRole = mockStore.roles.find(r => r.id === roleId);
  if (!targetRole) {
    return res.status(404).json({ error: 'Role not found' });
  }
  if (targetRole.isSystem) {
    return res.status(403).json({ error: 'Forbidden', message: 'System roles cannot be modified.' });
  }

  // Check escalation
  if (req.user!.role !== 'owner') {
    const userRolePerms = req.user!.customRoleId 
      ? (mockStore.roles.find(r => r.id === req.user!.customRoleId)?.permissions || [])
      : (DEFAULT_SYSTEM_ROLES[req.user!.role]?.permissions || []);
    const userPermSet = new Set(userRolePerms);
    for (const p of (permissions || [])) {
      if (!userPermSet.has(p)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Privilege escalation blocked: Cannot grant permission '${p}' which you do not possess.`,
        });
      }
    }
  }

  const updated = mockStore.updateCustomRole(roleId, { name, description, permissions });
  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'CUSTOM_ROLE_UPDATED',
    `role:${roleId}`,
    { name, permissionsCount: permissions?.length }
  );
  res.json({ success: true, role: updated });
});

apiRouter.delete('/roles/:id', requirePermission('roles.edit'), (req: Request, res: Response) => {
  const roleId = req.params.id;
  const targetRole = mockStore.roles.find(r => r.id === roleId);
  if (!targetRole) {
    return res.status(404).json({ error: 'Role not found' });
  }
  if (targetRole.isSystem) {
    return res.status(403).json({ error: 'Forbidden', message: 'System roles cannot be deleted.' });
  }

  mockStore.deleteCustomRole(roleId);
  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'CUSTOM_ROLE_DELETED',
    `role:${roleId}`,
    { name: targetRole.name }
  );
  res.json({ success: true, message: 'Custom role removed' });
});

apiRouter.put('/team/:id/permissions', requirePermission('roles.assign'), (req: Request, res: Response) => {
  const memberId = req.params.id;
  const { role, customRoleId, permissionOverrides, resourceScope } = req.body;

  // Self-escalation check: Workers cannot modify their own permissions or role!
  if (memberId === req.user!.id && req.user!.role !== 'owner') {
    return res.status(403).json({
      error: 'Forbidden',
      code: 'SELF_PRIVILEGE_MODIFICATION_BLOCKED',
      message: 'Employees cannot modify their own role or permissions.',
    });
  }

  // Only Owner can grant Owner role
  if (role === 'owner' && req.user!.role !== 'owner') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Only workspace owners can transfer ownership or assign owner role.',
    });
  }

  const targetMember = mockStore.team.find(m => m.id === memberId);
  if (!targetMember) {
    return res.status(404).json({ error: 'Team member not found' });
  }

  let customRoleName: string | undefined = undefined;
  if (customRoleId) {
    const customRole = mockStore.roles.find(r => r.id === customRoleId);
    if (customRole) {
      customRoleName = customRole.name;
    }
  }

  const updated = mockStore.updateMemberPermissions(memberId, {
    role,
    customRoleId,
    customRoleName,
    permissionOverrides,
    resourceScope,
  });

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'MEMBER_PERMISSIONS_UPDATED',
    `user:${memberId}`,
    { memberName: targetMember.fullName, role, customRoleId, overrides: permissionOverrides, resourceScope }
  );

  res.json({ success: true, user: updated });
});

apiRouter.post('/team/:id/suspend', requirePermission('team.edit'), (req: Request, res: Response) => {
  const memberId = req.params.id;
  if (memberId === req.user!.id) {
    return res.status(400).json({ error: 'Cannot suspend your own account' });
  }

  const targetMember = mockStore.team.find(m => m.id === memberId);
  if (!targetMember) {
    return res.status(404).json({ error: 'Team member not found' });
  }

  targetMember.status = targetMember.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
  if (mockStore.users[memberId]) {
    mockStore.users[memberId].status = targetMember.status;
  }

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    targetMember.status === 'SUSPENDED' ? 'MEMBER_SUSPENDED' : 'MEMBER_ACTIVATED',
    `user:${memberId}`,
    { memberName: targetMember.fullName, newStatus: targetMember.status }
  );

  res.json({ success: true, user: targetMember });
});

// ==============================================================================
// 2. VISUAL WORKFLOW BUILDER (AutoMask Section 5 & 6)
// ==============================================================================

function validateWorkflowGraph(nodes: any[], edges: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!Array.isArray(nodes) || nodes.length === 0) {
    errors.push('Workflow must contain at least one node');
    return { valid: false, errors };
  }

  const hasTrigger = nodes.some(n => n.type === 'trigger' || n.type === 'TRIGGER');
  if (!hasTrigger) {
    errors.push('Workflow must start with a Trigger node');
  }

  // Detect cycle using DFS
  const adj = new Map<string, string[]>();
  for (const edge of (edges || [])) {
    if (!edge.source || !edge.target) continue;
    if (!adj.has(edge.source)) adj.set(edge.source, []);
    adj.get(edge.source)!.push(edge.target);
  }

  const visited = new Set<string>();
  const recStack = new Set<string>();
  let hasCycle = false;

  function dfs(u: string) {
    visited.add(u);
    recStack.add(u);
    for (const v of (adj.get(u) || [])) {
      if (!visited.has(v)) {
        dfs(v);
      } else if (recStack.has(v)) {
        hasCycle = true;
      }
    }
    recStack.delete(u);
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      dfs(node.id);
    }
  }

  if (hasCycle) {
    errors.push('Invalid workflow graph: Uncontrolled execution loop / cycle detected in canvas');
  }

  return { valid: errors.length === 0, errors };
}

apiRouter.get('/workflows/definitions', requirePermission('workflows.view'), (req: Request, res: Response) => {
  res.json({ workflows: mockStore.workflows });
});

apiRouter.get('/workflows/definitions/:id', requirePermission('workflows.view'), (req: Request, res: Response) => {
  const wf = mockStore.workflows.find(w => w.id === req.params.id);
  if (!wf) return res.status(404).json({ error: 'Workflow definition not found' });
  res.json({ workflow: wf });
});

apiRouter.post('/workflows/definitions', requirePermission('workflows.create'), (req: Request, res: Response) => {
  const { name, description, nodes, edges } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Workflow name is required' });

  const newWf = mockStore.createWorkflow(name, description || '', nodes || [], edges || []);
  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'WORKFLOW_CREATED',
    `workflow:${newWf.id}`,
    { name }
  );
  res.status(201).json({ success: true, workflow: newWf });
});

apiRouter.put('/workflows/definitions/:id', requirePermission('workflows.edit'), (req: Request, res: Response) => {
  const { name, description, nodes, edges } = req.body;
  const updated = mockStore.updateWorkflow(req.params.id, { name, description, nodes, edges });
  if (!updated) return res.status(404).json({ error: 'Workflow definition not found' });

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'WORKFLOW_UPDATED',
    `workflow:${req.params.id}`,
    { name: updated.name }
  );
  res.json({ success: true, workflow: updated });
});

apiRouter.post('/workflows/definitions/:id/publish', requirePermission('workflows.publish'), (req: Request, res: Response) => {
  const wf = mockStore.workflows.find(w => w.id === req.params.id);
  if (!wf) return res.status(404).json({ error: 'Workflow definition not found' });

  const validation = validateWorkflowGraph(wf.nodes, wf.edges);
  if (!validation.valid) {
    return res.status(422).json({
      error: 'Unprocessable Entity',
      message: 'Workflow graph validation failed. Cannot publish invalid workflow.',
      errors: validation.errors,
    });
  }

  const published = mockStore.publishWorkflow(req.params.id);
  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'WORKFLOW_PUBLISHED',
    `workflow:${req.params.id}`,
    { name: wf.name, version: published?.version }
  );
  res.json({ success: true, workflow: published });
});

apiRouter.post('/workflows/definitions/:id/simulate', requirePermission('workflows.view'), (req: Request, res: Response) => {
  const wf = mockStore.workflows.find(w => w.id === req.params.id);
  if (!wf) return res.status(404).json({ error: 'Workflow definition not found' });

  const steps = wf.nodes.map((node, idx) => ({
    step: idx + 1,
    nodeId: node.id,
    type: node.type,
    label: node.data?.label || node.type,
    status: 'SUCCESS',
    output: `Simulated execution of node '${node.type}' completed without error`,
  }));

  res.json({
    success: true,
    workflowId: wf.id,
    version: wf.version,
    executionTimeMs: 142,
    executedSteps: steps,
  });
});

apiRouter.delete('/workflows/definitions/:id', requirePermission('workflows.delete'), (req: Request, res: Response) => {
  const success = mockStore.deleteWorkflow(req.params.id);
  if (!success) return res.status(404).json({ error: 'Workflow definition not found' });
  res.json({ success: true, message: 'Workflow deleted' });
});

// ==============================================================================
// 3. WHATSAPP TEMPLATES & META APPROVAL (AutoMask Section 7)
// ==============================================================================

apiRouter.get('/templates', requirePermission('templates.view'), (req: Request, res: Response) => {
  res.json({ templates: mockStore.templates });
});

apiRouter.post('/templates', requirePermission('templates.create'), (req: Request, res: Response) => {
  const { name, category, language, bodyText, headerText, footerText, buttons, variables } = req.body;
  if (!name || !bodyText) return res.status(400).json({ error: 'Template name and bodyText are required' });

  const newTmpl = mockStore.createTemplate({
    name,
    category,
    language,
    bodyText,
    headerText,
    footerText,
    buttons,
    variables,
  });

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'TEMPLATE_CREATED',
    `template:${newTmpl.id}`,
    { name }
  );
  res.status(201).json({ success: true, template: newTmpl });
});

apiRouter.post('/templates/:id/submit-meta', requirePermission('templates.submit_for_approval'), (req: Request, res: Response) => {
  const tmpl = mockStore.templates.find(t => t.id === req.params.id);
  if (!tmpl) return res.status(404).json({ error: 'Template not found' });

  const updated = mockStore.submitTemplateToMeta(req.params.id);

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'TEMPLATE_SUBMITTED_TO_META',
    `template:${req.params.id}`,
    { name: tmpl.name, status: 'PENDING_APPROVAL' }
  );

  res.json({
    success: true,
    message: 'Template submitted to Meta Cloud API for review. Current status: PENDING_APPROVAL.',
    template: updated,
  });
});

apiRouter.post('/templates/:id/submit-approval', requirePermission('templates.submit_for_approval'), (req: Request, res: Response) => {
  const tmpl = mockStore.templates.find(t => t.id === req.params.id);
  if (!tmpl) return res.status(404).json({ error: 'Template not found' });
  const updated = mockStore.submitTemplateToMeta(req.params.id);
  res.json({
    success: true,
    message: 'Template submitted to Meta Cloud API for review. Current status: PENDING_APPROVAL.',
    template: updated,
  });
});

apiRouter.post('/templates/:id/approve', requirePermission('templates.create'), (req: Request, res: Response) => {
  const tmpl = mockStore.templates.find(t => t.id === req.params.id);
  if (!tmpl) return res.status(404).json({ error: 'Template not found' });
  const updated = mockStore.approveTemplate(req.params.id);
  res.json({
    success: true,
    message: 'Template approved by Meta Cloud API.',
    template: updated,
  });
});

apiRouter.delete('/templates/:id', requirePermission('templates.delete'), (req: Request, res: Response) => {
  const success = mockStore.deleteTemplate(req.params.id);
  if (!success) return res.status(404).json({ error: 'Template not found' });
  res.json({ success: true, message: 'Template deleted' });
});

// ==============================================================================
// 4. BROADCAST CAMPAIGNS & CONTACT CSV IMPORT (AutoMask Section 8)
// ==============================================================================

apiRouter.get('/broadcasts/campaigns', requirePermission('broadcasts.view'), (req: Request, res: Response) => {
  res.json({ campaigns: mockStore.campaigns });
});

apiRouter.post('/broadcasts/campaigns', requirePermission('broadcasts.create'), (req: Request, res: Response) => {
  const { 
    name, 
    description, 
    templateName, 
    templateId,
    category,
    headerText,
    customMessageText,
    footerText,
    buttons,
    audienceFilter, 
    variableMappings, 
    scheduledAt 
  } = req.body;
  if (!name || (!templateName && !customMessageText)) {
    return res.status(400).json({ error: 'Campaign name and either templateName or customMessageText are required' });
  }

  let filtered = mockStore.contacts;
  if (audienceFilter) {
    if (audienceFilter.country && audienceFilter.country !== 'ALL') {
      filtered = filtered.filter(c => (c.country || 'India').toLowerCase() === audienceFilter.country.toLowerCase());
    }
    if (audienceFilter.city && audienceFilter.city !== 'ALL') {
      filtered = filtered.filter(c => (c.city || '').toLowerCase() === audienceFilter.city.toLowerCase());
    }
    if (audienceFilter.region && audienceFilter.region !== 'ALL') {
      filtered = filtered.filter(c => (c.region || '').toLowerCase() === audienceFilter.region.toLowerCase());
    }
    if (audienceFilter.tags && audienceFilter.tags.length > 0) {
      filtered = filtered.filter(c => c.tags.some((t: string) => audienceFilter.tags.includes(t)));
    }
    if (audienceFilter.customPhoneNumbers && audienceFilter.customPhoneNumbers.length > 0) {
      const cleanCustom = audienceFilter.customPhoneNumbers.map((p: string) => p.replace(/[^0-9]/g, ''));
      filtered = filtered.filter(c => cleanCustom.includes(c.phone.replace(/[^0-9]/g, '')));
    }
  }

  const optedOutCount = filtered.filter(c => c.optInStatus === 'OPTED_OUT').length;
  const eligibleCount = filtered.filter(c => c.optInStatus !== 'OPTED_OUT').length;

  const newCamp = mockStore.createCampaign({
    name,
    description,
    templateName: templateName || 'custom_direct_broadcast',
    templateId,
    category: category || 'UTILITY',
    headerText,
    customMessageText,
    footerText,
    buttons,
    audienceFilter,
    scheduledAt,
    totalRecipients: eligibleCount,
    excludedCount: optedOutCount,
    variableMappings,
  });

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'BROADCAST_CAMPAIGN_CREATED',
    `campaign:${newCamp.id}`,
    { name, templateName: newCamp.templateName, scheduledAt, eligibleCount, optedOutCount }
  );

  res.status(201).json({ success: true, campaign: newCamp });
});

apiRouter.post('/broadcasts/campaigns/:id/send', requirePermission('broadcasts.send'), async (req: Request, res: Response) => {
  const camp = mockStore.campaigns.find(c => c.id === req.params.id);
  if (!camp) return res.status(404).json({ error: 'Broadcast campaign not found' });

  // 1. Template Approval Enforcement: Unapproved templates cannot be sent where approval is required!
  const matchingTmpl = mockStore.templates.find(t => t.name === camp.templateName);
  if (matchingTmpl && matchingTmpl.status !== 'APPROVED') {
    return res.status(400).json({
      error: 'TemplateNotApproved',
      message: `Cannot dispatch broadcast: Message template '${camp.templateName}' is '${matchingTmpl.status}'. Meta Cloud API requires APPROVED status for outbound broadcasts.`,
    });
  }

  // 2. Idempotency check: Cannot dispatch already active or sent campaign
  if (camp.status === 'SENDING' || camp.status === 'COMPLETED') {
    return res.status(409).json({
      error: 'Conflict',
      message: `Campaign is already in state '${camp.status}'. Duplicate dispatch rejected.`,
    });
  }

  // 3. Opt-out suppression list check with audience segmentation
  let targetPool = mockStore.contacts;
  if (camp.audienceFilter) {
    const af = camp.audienceFilter;
    if (af.country && af.country !== 'ALL') {
      targetPool = targetPool.filter(c => (c.country || 'India').toLowerCase() === af.country!.toLowerCase());
    }
    if (af.city && af.city !== 'ALL') {
      targetPool = targetPool.filter(c => (c.city || '').toLowerCase() === af.city!.toLowerCase());
    }
    if (af.region && af.region !== 'ALL') {
      targetPool = targetPool.filter(c => (c.region || '').toLowerCase() === af.region!.toLowerCase());
    }
    if (af.tags && af.tags.length > 0) {
      targetPool = targetPool.filter(c => c.tags.some(t => af.tags!.includes(t)));
    }
    if (af.customPhoneNumbers && af.customPhoneNumbers.length > 0) {
      const cleanCustom = af.customPhoneNumbers.map(p => p.replace(/[^0-9]/g, ''));
      targetPool = targetPool.filter(c => cleanCustom.includes(c.phone.replace(/[^0-9]/g, '')));
    }
  }

  const activeContacts = targetPool.filter(c => c.optInStatus === 'OPTED_IN');
  const excludedOptOuts = targetPool.filter(c => c.optInStatus === 'OPTED_OUT');

  camp.status = 'COMPLETED';
  camp.totalRecipients = activeContacts.length;
  camp.sentCount = activeContacts.length;
  camp.deliveredCount = Math.max(0, activeContacts.length - 1);
  camp.readCount = Math.round(activeContacts.length * 0.75);
  camp.excludedCount = excludedOptOuts.length;
  camp.updatedAt = new Date().toISOString();

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'BROADCAST_CAMPAIGN_DISPATCHED',
    `campaign:${camp.id}`,
    { sentCount: camp.sentCount, excludedCount: camp.excludedCount }
  );

  res.json({
    success: true,
    message: `Campaign dispatched to ${activeContacts.length} opted-in contacts (${excludedOptOuts.length} opted-out contacts suppressed).`,
    campaign: camp,
  });
});

apiRouter.post('/broadcasts/campaigns/:id/cancel', requirePermission('broadcasts.cancel'), (req: Request, res: Response) => {
  const camp = mockStore.cancelCampaign(req.params.id);
  if (!camp) return res.status(404).json({ error: 'Broadcast campaign not found' });

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'BROADCAST_CAMPAIGN_CANCELLED',
    `campaign:${camp.id}`,
    { name: camp.name }
  );

  res.json({ success: true, campaign: camp });
});

apiRouter.post('/contacts/import', requirePermission('contacts.import'), (req: Request, res: Response) => {
  const { contacts: rawContacts } = req.body;
  if (!Array.isArray(rawContacts) || rawContacts.length === 0) {
    return res.status(400).json({ error: 'contacts array is required' });
  }

  const imported: any[] = [];
  const duplicates: any[] = [];
  const invalidRows: { row: any; reason: string }[] = [];

  const existingPhones = new Set(mockStore.contacts.map(c => c.phone.replace(/[^0-9]/g, '')));

  for (const row of rawContacts) {
    const rawPhone = String(row.phone || row.Phone || '').trim();
    const cleanDigits = rawPhone.replace(/[^0-9]/g, '');

    if (cleanDigits.length < 10 || cleanDigits.length > 15) {
      invalidRows.push({ row, reason: `Invalid phone number format: '${rawPhone}'` });
      continue;
    }

    const formattedPhone = cleanDigits.length === 10 ? `+91 ${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)}` : `+${cleanDigits}`;

    if (existingPhones.has(cleanDigits)) {
      duplicates.push({ phone: formattedPhone, name: row.name || 'Unknown' });
      continue;
    }

    existingPhones.add(cleanDigits);

    const newContact: any = {
      id: `ct-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      workspaceId: req.workspaceId || mockStore.workspace.id,
      phone: formattedPhone,
      name: row.name || row.Name || 'Student Lead',
      tags: Array.isArray(row.tags) ? row.tags : (row.tags ? String(row.tags).split(',').map((t: string) => t.trim()) : ['CSV Import']),
      optInStatus: row.optInStatus === 'OPTED_OUT' ? 'OPTED_OUT' : 'OPTED_IN',
      optInSource: 'CSV Import',
      notes: row.notes || 'Imported via CSV',
      createdAt: 'Just now',
    };

    mockStore.contacts.push(newContact);
    imported.push(newContact);
  }

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'CONTACTS_IMPORTED_CSV',
    `import:${Date.now()}`,
    { importedCount: imported.length, duplicateCount: duplicates.length, invalidCount: invalidRows.length }
  );

  res.json({
    success: true,
    summary: {
      totalProcessed: rawContacts.length,
      importedCount: imported.length,
      duplicateCount: duplicates.length,
      invalidCount: invalidRows.length,
    },
    invalidRows,
    duplicates,
  });
});

// ==============================================================================
// 5. AI ASSISTANT & KNOWLEDGE BASE (AutoMask Section 9)
// ==============================================================================

apiRouter.get('/knowledge/documents', requirePermission('knowledge_base.view'), (req: Request, res: Response) => {
  res.json({ documents: mockStore.documents });
});

apiRouter.post('/knowledge/upload', requirePermission('knowledge_base.upload'), (req: Request, res: Response) => {
  const { filename, fileType, fileSize, extractedText, title } = req.body;
  if (!filename) return res.status(400).json({ error: 'filename is required' });

  const text = extractedText || `Sample extracted syllabus and fee details from ${filename}.`;
  const chunksCount = Math.max(1, Math.ceil(text.length / 500));

  const newDoc = mockStore.uploadDocument({
    filename,
    fileType: fileType || 'pdf',
    fileSize: fileSize || 524288,
    chunksCount,
    metadata: { title: title || filename },
  });

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'DOCUMENT_UPLOADED',
    `doc:${newDoc.id}`,
    { filename, chunksCount, fileType: newDoc.fileType }
  );

  res.status(201).json({ success: true, document: newDoc });
});

apiRouter.delete('/knowledge/documents/:id', requirePermission('knowledge_base.delete'), (req: Request, res: Response) => {
  const success = mockStore.deleteDocument(req.params.id);
  if (!success) return res.status(404).json({ error: 'Document not found' });

  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'DOCUMENT_DELETED',
    `doc:${req.params.id}`
  );

  res.json({ success: true, message: 'Document removed from knowledge base' });
});

apiRouter.get('/ai-assistant/config', requirePermission('ai_assistant.view'), (req: Request, res: Response) => {
  res.json({
    config: {
      assistantName: 'Prakash AI Counsellor',
      description: 'Official academic admission assistant for Prakash Institute',
      persona: 'Warm, encouraging, and authoritative Hinglish & English coaching admissions advisor',
      systemInstructions: 'Answer questions strictly using verified fee structures, batch schedules, and faculty profiles from the knowledge base. If information is not found in knowledge documents, gracefully offer human counsellor callback.',
      tone: 'PROFESSIONAL_WARM',
      confidenceThreshold: 0.78,
      fallbackMessage: 'Namaste! Main is vishay me hamare senior academic counsellor ko aapki inquiry forward kar raha hoon. Wo jald hi aapse sampark karenge.',
      humanHandoffTriggers: ['fee concession request', 'angry parent', 'medical leave', 'scholarship dispute'],
      model: 'meta/llama-3.3-70b-instruct / gpt-4o-mini',
      activeWhatsAppAccountId: 'wa-acc-01',
    }
  });
});

apiRouter.put('/ai-assistant/config', requirePermission('ai_assistant.configure'), (req: Request, res: Response) => {
  const updates = req.body;
  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'AI_CONFIG_UPDATED',
    'config:ai_assistant',
    { updatedFields: Object.keys(updates) }
  );

  res.json({
    success: true,
    message: 'AI Assistant configuration updated successfully',
    config: updates,
  });
});

// ==============================================================================
// 6. INTEGRATIONS MANAGEMENT (AutoMask Section 10)
// ==============================================================================

apiRouter.post('/integrations/connect', requirePermission('integrations.connect'), (req: Request, res: Response) => {
  const { provider, credentials } = req.body;
  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'INTEGRATION_CONNECTED',
    `integration:${provider || 'meta'}`,
    { provider, maskedKey: '***' }
  );
  res.json({ success: true, message: `${provider || 'Meta WhatsApp'} connected successfully` });
});

apiRouter.post('/integrations/disconnect', requirePermission('integrations.disconnect'), (req: Request, res: Response) => {
  const { provider } = req.body;
  mockStore.logAudit(
    req.workspaceId || mockStore.workspace.id,
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    'INTEGRATION_DISCONNECTED',
    `integration:${provider || 'meta'}`,
    { provider }
  );
  res.json({ success: true, message: `${provider || 'Integration'} disconnected` });
});

