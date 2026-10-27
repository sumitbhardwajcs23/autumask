import { apiClient, setApiAuthContext, getApiAuthContext, ApiError } from './apiClient';
import { 
  Conversation, 
  Message, 
  Lead, 
  LeadStatus, 
  Contact,
  WorkflowStage,
  AutomationRule, 
  KnowledgeItem, 
  Slot, 
  Appointment, 
  UsageQuota, 
  User, 
  WhatsAppAccount,
  CustomRole,
  UserPermissionOverride,
  ResourceAccessScope,
  PermissionItem,
  WorkflowDefinition,
  MessageTemplate,
  BroadcastCampaign,
  KnowledgeDocument,
  AIAssistantConfig,
  AuditLogItem,
  InteractiveButton
} from '../types';

export { ApiError, setApiAuthContext, getApiAuthContext };

// ==========================================
// 1. Authentication & Session API
// ==========================================
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post<{
      token: string;
      user: User;
      workspace: any;
      role: string;
    }>('/auth/login', { email, password });
    if (res.token) {
      setApiAuthContext({ token: res.token, role: res.user.role, userId: res.user.id });
    }
    return res;
  },

  signup: async (data: { email: string; password: string; fullName: string; phone?: string; workspaceName?: string }) => {
    const res = await apiClient.post<{
      token: string;
      user: User;
      workspace: any;
      role: string;
    }>('/auth/signup', data);
    if (res.token) {
      setApiAuthContext({ token: res.token, role: res.user.role, userId: res.user.id });
    }
    return res;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setApiAuthContext({ token: null });
    }
  },

  getMe: async () => {
    return apiClient.get<{
      user: User;
      workspace: any;
      permissions: string[];
      activeSupportGrant: any | null;
    }>('/auth/me');
  },
};

// ==========================================
// 2. Dashboard & Onboarding API
// ==========================================
export interface DashboardData {
  workspace: any;
  currentUser: User;
  whatsappAccount: WhatsAppAccount;
  metrics: {
    totalConversations: number;
    activeEnquiries: number;
    leadsCaptured: number;
    demosBooked: number;
    admissionsConfirmed: number;
    aiHandledPercent: number;
    responseTimeAvgSec: number;
  };
  usage: UsageQuota | null;
  recentConversations: Conversation[];
  automationRules: AutomationRule[];
  activeRulesCount: number;
  inactiveRulesCount: number;
  teamMembersCount: number;
  onlineMembersCount: number;
  userRole: string;
  isLimitedView: boolean;
}

export const dashboardApi = {
  getDashboard: async (): Promise<DashboardData> => {
    return apiClient.get<DashboardData>('/dashboard');
  },

  getOnboardingStatus: async () => {
    return apiClient.get<{
      workspace: any;
      steps: Array<{ id: string; title: string; completed: boolean }>;
      overallProgress: number;
    }>('/onboarding/status');
  },
};

// ==========================================
// 3. Shared Inbox & Conversations API
// ==========================================
export const conversationsApi = {
  list: async (status?: string, search?: string): Promise<{ conversations: Conversation[] }> => {
    return apiClient.get<{ conversations: Conversation[] }>('/conversations', {
      params: { status, search },
    });
  },

  getMessages: async (convId: string): Promise<{
    conversation: Conversation;
    messages: Message[];
    accessedViaSupportGrant?: boolean;
    grantId?: string | null;
  }> => {
    return apiClient.get(`/conversations/${convId}/messages`);
  },

  sendMessage: async (convId: string, payload: {
    body?: string;
    templateName?: string;
    components?: any[];
    senderName?: string;
  }): Promise<{
    success: boolean;
    status: string;
    providerMessageId?: string;
    message?: Message;
  }> => {
    return apiClient.post(`/conversations/${convId}/messages`, payload);
  },

  toggleTakeover: async (convId: string, takeoverActive?: boolean): Promise<{
    success: boolean;
    takeoverActive: boolean;
  }> => {
    return apiClient.post(`/conversations/${convId}/takeover`, { takeoverActive });
  },
};

// ==========================================
// 4. Student Leads CRM API
// ==========================================
export const leadsApi = {
  list: async (status?: string, course?: string): Promise<{ leads: Lead[] }> => {
    return apiClient.get<{ leads: Lead[] }>('/leads', {
      params: { status, course },
    });
  },

  create: async (data: Partial<Lead>): Promise<{ success: boolean; lead: Lead }> => {
    return apiClient.post<{ success: boolean; lead: Lead }>('/leads', data);
  },

  updateStatus: async (leadId: string, status: LeadStatus): Promise<{ success: boolean; lead: Lead }> => {
    return apiClient.patch<{ success: boolean; lead: Lead }>(`/leads/${leadId}/status`, { status });
  },

  exportCsv: async (): Promise<{ success: boolean; count: number; leads: Lead[] }> => {
    return apiClient.get<{ success: boolean; count: number; leads: Lead[] }>('/leads/export');
  },
};

// ==========================================
// 4b. Contacts CRM API
// ==========================================
export const contactsApi = {
  list: async (optInStatus?: string, tag?: string, search?: string): Promise<{ contacts: Contact[] }> => {
    return apiClient.get<{ contacts: Contact[] }>('/contacts', {
      params: { optInStatus, tag, search },
    });
  },

  create: async (data: Partial<Contact>): Promise<{ success: boolean; contact: Contact }> => {
    return apiClient.post<{ success: boolean; contact: Contact }>('/contacts', data);
  },

  toggleOptIn: async (id: string): Promise<{ success: boolean; contact: Contact }> => {
    return apiClient.patch<{ success: boolean; contact: Contact }>(`/contacts/${id}/opt-in`);
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/contacts/${id}`);
  },
};

// ==========================================
// 5. Automation Rules API
// ==========================================
export const automationsApi = {
  list: async (): Promise<{ rules: AutomationRule[] }> => {
    return apiClient.get<{ rules: AutomationRule[] }>('/automations');
  },

  toggle: async (ruleId: string): Promise<{ success: boolean; rule: AutomationRule }> => {
    return apiClient.patch<{ success: boolean; rule: AutomationRule }>(`/automations/${ruleId}/toggle`);
  },

  create: async (data: Partial<AutomationRule>): Promise<{ success: boolean; rule: AutomationRule }> => {
    return apiClient.post<{ success: boolean; rule: AutomationRule }>('/automations', data);
  },

  update: async (ruleId: string, data: Partial<AutomationRule>): Promise<{ success: boolean; rule: AutomationRule }> => {
    return apiClient.put<{ success: boolean; rule: AutomationRule }>(`/automations/${ruleId}`, data);
  },

  delete: async (ruleId: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/automations/${ruleId}`);
  },
};

// ==========================================
// 6. Knowledge Base & Grounded RAG API
// ==========================================
export const knowledgeApi = {
  list: async (): Promise<{ knowledgeItems: KnowledgeItem[] }> => {
    return apiClient.get<{ knowledgeItems: KnowledgeItem[] }>('/knowledge');
  },

  add: async (data: Partial<KnowledgeItem>): Promise<{ success: boolean; item: KnowledgeItem }> => {
    return apiClient.post<{ success: boolean; item: KnowledgeItem }>('/knowledge', data);
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/knowledge/${id}`);
  },

  query: async (queryText: string, studentName?: string): Promise<{
    success: boolean;
    answer: string;
    confidence: number;
    sourcesCount: number;
    sources: any[];
  }> => {
    return apiClient.post('/knowledge/query', { query: queryText, studentName });
  },
};

// ==========================================
// 7. Demo Bookings & Capacity Slots API
// ==========================================
export const bookingsApi = {
  list: async (): Promise<{ slots: Slot[]; appointments: Appointment[] }> => {
    return apiClient.get<{ slots: Slot[]; appointments: Appointment[] }>('/bookings');
  },

  addSlot: async (data: Partial<Slot>): Promise<{ success: boolean; slot: Slot }> => {
    return apiClient.post<{ success: boolean; slot: Slot }>('/bookings/slots', data);
  },

  bookAppointment: async (data: {
    slotId: string;
    studentName: string;
    phone: string;
    course?: string;
  }): Promise<{ success: boolean; appointment: Appointment }> => {
    return apiClient.post<{ success: boolean; appointment: Appointment }>('/bookings/appointments', data);
  },
};

// 8. Billing & Quota Limits API (Owner Only)
// ==========================================
export const billingApi = {
  get: async (): Promise<{
    workspace: any;
    usage: UsageQuota;
    plans: any[];
    readOnly: boolean;
  }> => {
    return apiClient.get('/billing');
  },

  upgrade: async (planId: string): Promise<{ success: boolean; planId: string }> => {
    return apiClient.post('/billing/upgrade', { planId });
  },

  createRazorpayOrder: async (planId: string): Promise<{
    success: boolean;
    order: any;
    keyId: string;
    mockMode?: boolean;
  }> => {
    return apiClient.post('/billing/razorpay/order', { planId });
  },

  verifyRazorpayPayment: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    planId: string;
  }): Promise<{
    success: boolean;
    message: string;
    planId: string;
    paymentId: string;
  }> => {
    return apiClient.post('/billing/razorpay/verify', data);
  },
};

export const aiProviderApi = {
  testProvider: async (data: { provider: string; model?: string; query?: string }): Promise<{
    success: boolean;
    result?: {
      content: string;
      provider: string;
      model: string;
      latencyMs: number;
    };
    error?: string;
  }> => {
    return apiClient.post('/ai/test-provider', data);
  },
};

// ==========================================
// 9. Privacy Safeguard: Support Grants API (SRS Line 615)
// ==========================================
export const supportGrantsApi = {
  list: async (): Promise<{ grants: any[] }> => {
    return apiClient.get('/support-grants');
  },

  create: async (data: { targetUserId: string; hoursValid: number; reason: string }): Promise<{
    success: boolean;
    grant: any;
  }> => {
    return apiClient.post('/support-grants', data);
  },

  revoke: async (grantId: string): Promise<{ success: boolean; grant: any }> => {
    return apiClient.delete(`/support-grants/${grantId}`);
  },
};

// ==========================================
// 10. WhatsApp Cloud API & Broadcast Campaigns
// ==========================================
export const whatsappApi = {
  getAccount: async (): Promise<{ account: WhatsAppAccount }> => {
    return apiClient.get('/whatsapp/account');
  },

  getTemplates: async (): Promise<{ templates: any[] }> => {
    return apiClient.get('/whatsapp/templates');
  },

  sendBroadcast: async (data: {
    name: string;
    templateName: string;
    targetSegment?: string;
    count?: number;
  }): Promise<{
    success: boolean;
    campaign: any;
    usage: UsageQuota;
  }> => {
    return apiClient.post('/whatsapp/broadcast', data);
  },

  simulate: async (data: {
    phone: string;
    message: string;
    name?: string;
    conversationId?: string;
  }): Promise<{
    success: boolean;
    result: {
      replyText: string;
      matchedStage?: number;
      stageName?: string;
      leadStatus?: string;
      headerText?: string;
      footerText?: string;
      buttons?: InteractiveButton[];
    };
    conversation?: Conversation;
    messages?: Message[];
  }> => {
    return apiClient.post('/whatsapp/simulate', data);
  },
};

// ==========================================
// 11. Team Members & System Health API
// ==========================================
export const teamApi = {
  list: async (): Promise<{ team: User[] }> => {
    return apiClient.get('/team');
  },

  invite: async (data: { fullName: string; email: string; role?: string }): Promise<{ success: boolean; user: User }> => {
    return apiClient.post<{ success: boolean; user: User }>('/team/invite', data);
  },

  toggleStatus: async (id: string): Promise<{ success: boolean; user: User }> => {
    return apiClient.patch<{ success: boolean; user: User }>(`/team/${id}/status`);
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/team/${id}`);
  },
};

// ==========================================
// 12. Workflows & Pipeline Simulator API
// ==========================================
export const workflowsApi = {
  get: async (): Promise<{
    workflows: WorkflowStage[];
    activeRulesCount: number;
    autoReplyLatencyMs: number;
    dailyProcessedCount: number;
  }> => {
    return apiClient.get('/workflows');
  },

  simulateStage: async (data: {
    message: string;
    phone?: string;
    name?: string;
  }): Promise<{
    success: boolean;
    result: {
      actionTaken: string;
      matchedStage: number;
      stageName: string;
      replyText?: string;
      leadStatus?: string;
      matchedRuleName?: string;
    };
    latencyMs: number;
  }> => {
    return apiClient.post('/workflows/simulate-stage', data);
  },
};

// ==========================================
// 13. Ecosystem Integrations API
// ==========================================
export const integrationsApi = {
  get: async (): Promise<{
    integrations: Array<{
      id: string;
      name: string;
      category: string;
      status: string;
      description: string;
      account: string;
      icon: string;
    }>;
  }> => {
    return apiClient.get('/integrations');
  },

  testWebhook: async (): Promise<{
    success: boolean;
    status: number;
    latencyMs: number;
    message: string;
    timestamp: string;
  }> => {
    return apiClient.post('/integrations/test-webhook');
  },

  connect: async (id: string): Promise<{ success: boolean; message: string; integrationId: string }> => {
    return apiClient.post('/integrations/connect', { integrationId: id });
  },

  disconnect: async (id: string): Promise<{ success: boolean; message: string; integrationId: string }> => {
    return apiClient.post('/integrations/disconnect', { integrationId: id });
  },
};

// ==========================================
// 14. Granular RBAC & Roles API
// ==========================================
export const permissionsApi = {
  getRegistry: async (): Promise<{
    success: boolean;
    count: number;
    modules: Record<string, string[]>;
    systemRoles: Record<string, { name: string; description: string; permissions: string[] }>;
    permissions: PermissionItem[];
  }> => {
    return apiClient.get('/permissions/registry');
  },

  listRoles: async (): Promise<{ success: boolean; roles: CustomRole[] }> => {
    return apiClient.get('/roles');
  },

  createRole: async (data: {
    name: string;
    description?: string;
    permissions: string[];
    color?: string;
  }): Promise<{ success: boolean; role: CustomRole }> => {
    return apiClient.post('/roles', data);
  },

  updateRole: async (id: string, data: {
    name?: string;
    description?: string;
    permissions?: string[];
    color?: string;
  }): Promise<{ success: boolean; role: CustomRole }> => {
    return apiClient.put(`/roles/${id}`, data);
  },

  deleteRole: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/roles/${id}`);
  },

  getMemberPermissions: async (userId: string): Promise<{
    success: boolean;
    userId: string;
    role: string;
    customRole: CustomRole | null;
    overrides: UserPermissionOverride[];
    resourceScope: ResourceAccessScope | null;
    effectivePermissions: string[];
  }> => {
    return apiClient.get(`/team/${userId}/permissions`);
  },

  updateMemberPermissions: async (userId: string, data: {
    role?: string;
    customRoleId?: string | null;
    grants?: string[];
    denies?: string[];
    resourceScope?: { scope: 'all' | 'assigned_only' };
  }): Promise<{ success: boolean; message: string; userId: string }> => {
    return apiClient.put(`/team/${userId}/permissions`, data);
  },

  suspendMember: async (userId: string, suspended: boolean): Promise<{
    success: boolean;
    message: string;
    userId: string;
    status: 'SUSPENDED' | 'ACTIVE';
  }> => {
    return apiClient.post(`/team/${userId}/suspend`, { suspended });
  },
};

// ==========================================
// 15. Advanced Workflow Definitions Canvas API
// ==========================================
export const workflowsCanvasApi = {
  list: async (): Promise<{ success: boolean; workflows: WorkflowDefinition[] }> => {
    return apiClient.get('/workflows/definitions');
  },

  create: async (data: Partial<WorkflowDefinition>): Promise<{ success: boolean; workflow: WorkflowDefinition }> => {
    return apiClient.post('/workflows/definitions', data);
  },

  update: async (id: string, data: Partial<WorkflowDefinition>): Promise<{ success: boolean; workflow: WorkflowDefinition }> => {
    return apiClient.put(`/workflows/definitions/${id}`, data);
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/workflows/definitions/${id}`);
  },

  simulate: async (id: string, initialPayload?: any): Promise<{
    success: boolean;
    workflowId: string;
    simulatedSteps: number;
    log: string[];
    completed: boolean;
    haltedAtNode?: string;
    reason?: string;
  }> => {
    return apiClient.post(`/workflows/definitions/${id}/simulate`, { initialPayload });
  },
};

// ==========================================
// 16. WhatsApp Message Templates API
// ==========================================
export const templatesApi = {
  list: async (): Promise<{ success: boolean; templates: MessageTemplate[] }> => {
    return apiClient.get('/templates');
  },

  create: async (data: Partial<MessageTemplate>): Promise<{ success: boolean; template: MessageTemplate }> => {
    return apiClient.post('/templates', data);
  },

  submitApproval: async (id: string): Promise<{ success: boolean; template: MessageTemplate }> => {
    return apiClient.post(`/templates/${id}/submit-approval`);
  },

  approveTemplate: async (id: string): Promise<{ success: boolean; template: MessageTemplate }> => {
    return apiClient.post(`/templates/${id}/approve`);
  },
};

// ==========================================
// 17. Broadcast Campaigns API
// ==========================================
export const broadcastsApi = {
  listCampaigns: async (): Promise<{ success: boolean; campaigns: BroadcastCampaign[] }> => {
    return apiClient.get('/broadcasts/campaigns');
  },

  createCampaign: async (data: Partial<BroadcastCampaign>): Promise<{ success: boolean; campaign: BroadcastCampaign }> => {
    return apiClient.post('/broadcasts/campaigns', data);
  },

  sendCampaign: async (id: string): Promise<{
    success: boolean;
    message: string;
    campaign: BroadcastCampaign;
    result: {
      eligibleContacts: number;
      optedOutSuppressed: number;
      delivered: number;
      failed: number;
    };
  }> => {
    return apiClient.post(`/broadcasts/campaigns/${id}/send`);
  },
};

// ==========================================
// 18. Contacts CSV Bulk Import API
// ==========================================
export const contactsImportApi = {
  importCsv: async (csvContent: string, overwriteDuplicates = false): Promise<{
    success: boolean;
    importedCount: number;
    skippedDuplicates: number;
    invalidRowsCount: number;
    totalProcessed: number;
    duplicates: string[];
  }> => {
    return apiClient.post('/contacts/import', { csvContent, overwriteDuplicates });
  },
};

// ==========================================
// 19. Multi-Format Knowledge Base & RAG Docs API
// ==========================================
export const knowledgeDocsApi = {
  list: async (): Promise<{ success: boolean; documents: KnowledgeDocument[] }> => {
    return apiClient.get('/knowledge/documents');
  },

  upload: async (data: {
    title: string;
    fileType: 'pdf' | 'docx' | 'txt' | 'csv';
    rawContent: string;
    chunkSize?: number;
  }): Promise<{ success: boolean; document: KnowledgeDocument }> => {
    return apiClient.post('/knowledge/documents', data);
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/knowledge/documents/${id}`);
  },

  getConfig: async (): Promise<{ success: boolean; config: AIAssistantConfig }> => {
    return apiClient.get('/ai-assistant/config');
  },

  updateConfig: async (config: Partial<AIAssistantConfig>): Promise<{ success: boolean; config: AIAssistantConfig }> => {
    return apiClient.put('/ai-assistant/config', config);
  },
};

// ==========================================
// 20. Audit Logs API
// ==========================================
export const auditLogsApi = {
  list: async (): Promise<{ success: boolean; logs: AuditLogItem[] }> => {
    return apiClient.get('/audit-logs');
  },
};

// ==========================================
// 21. System Health API
// ==========================================
export const systemApi = {
  getHealth: async (): Promise<{
    status: string;
    service: string;
    version: string;
    components: {
      api: { status: string };
      database: { status: string; latencyMs: number };
      redisQueue: { status: string };
    };
  }> => {
    // Note: /health is on the root path of the server
    return apiClient.get('/../../health');
  },
};

// ==========================================
// 22. Platform Operations API
// ==========================================
export const platformApi = {
  getTenants: async (): Promise<{ success: boolean; total: number; tenants: any[] }> => {
    return apiClient.get('/platform/tenants');
  },

  getTenant: async (id: string): Promise<{ success: boolean; tenant: any; activeSupportGrant: any }> => {
    return apiClient.get(`/platform/tenants/${id}`);
  },

  updateTenantStatus: async (id: string, status: 'ACTIVE' | 'SUSPENDED', reason?: string): Promise<{ success: boolean; message: string; tenant: any }> => {
    return apiClient.patch(`/platform/tenants/${id}/status`, { status, reason });
  },

  getPlans: async (): Promise<{ success: boolean; total: number; plans: any[] }> => {
    return apiClient.get('/platform/plans');
  },

  updatePlan: async (id: string, updates: any): Promise<{ success: boolean; message: string; plan: any }> => {
    return apiClient.put(`/platform/plans/${id}`, updates);
  },

  getHealth: async (): Promise<{ success: boolean; telemetry: any }> => {
    return apiClient.get('/platform/health');
  },

  getSupportGrants: async (): Promise<{ success: boolean; total: number; activeCount: number; grants: any[]; privacyNotice: string }> => {
    return apiClient.get('/platform/support-grants');
  },

  requestSupportGrant: async (workspaceId: string, reason: string, durationMinutes?: number): Promise<{ success: boolean; message: string; ticket: any }> => {
    return apiClient.post('/platform/support-grants/request', { workspaceId, reason, durationMinutes });
  },

  getTickets: async (): Promise<{ success: boolean; total: number; tickets: any[] }> => {
    return apiClient.get('/platform/tickets');
  },

  updateTicket: async (id: string, updates: { status?: string; resolutionNotes?: string; assignedTo?: string }): Promise<{ success: boolean; message: string; ticket: any }> => {
    return apiClient.patch(`/platform/tickets/${id}`, updates);
  },

  getAuditLogs: async (): Promise<{ success: boolean; total: number; logs: any[] }> => {
    return apiClient.get('/platform/audit-logs');
  },
};


