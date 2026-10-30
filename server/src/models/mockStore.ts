import { 
  Workspace, 
  WhatsAppAccount, 
  User, 
  Conversation, 
  Message, 
  Lead, 
  Contact,
  AutomationRule, 
  KnowledgeItem, 
  Slot, 
  Appointment, 
  UsageQuota,
  SupportGrant,
  AuditLog,
  CustomRole,
  WorkflowDefinition,
  BroadcastCampaign,
  MessageTemplate,
  KnowledgeDocument,
  TenantAccountSummary,
  PlatformPlanDefinition,
  PlatformHealthTelemetry,
  PlatformSupportTicket,
  PlatformAuditLog,
  PlatformStaffRole
} from './types';
import { DEFAULT_SYSTEM_ROLES, ALL_PERMISSION_KEYS } from './permissionsRegistry';

export class MockDataStore {
  workspace: Workspace = {
    id: 'ws-prakash-01',
    name: 'Prakash Institute',
    category: 'JEE & NEET Coaching',
    timezone: 'Asia/Kolkata',
    planId: 'pro',
    planName: 'Pro Plan',
    planRenewAt: '15 Nov 2026',
  };

  currentUser: User = {
    id: 'usr-sumit-01',
    email: 'sumit@prakashinstitute.edu.in',
    fullName: 'Sumit Bhardwaj',
    role: 'admin',
    status: 'ACTIVE',
    resourceScope: { conversations: 'all', whatsappAccounts: 'all' },
    isOnline: true,
  };

  users: Record<string, User> = {
    'usr-owner-01': { id: 'usr-owner-01', email: 'dr.prakash@prakashinstitute.edu.in', fullName: 'Dr. Prakash Sharma', role: 'owner', status: 'ACTIVE', resourceScope: { conversations: 'all', whatsappAccounts: 'all' }, isOnline: true },
    'usr-sumit-01': { id: 'usr-sumit-01', email: 'sumit@prakashinstitute.edu.in', fullName: 'Sumit Bhardwaj', role: 'admin', status: 'ACTIVE', resourceScope: { conversations: 'all', whatsappAccounts: 'all' }, isOnline: true },
    'usr-priya-02': { id: 'usr-priya-02', email: 'priya.s@prakashinstitute.edu.in', fullName: 'Priya Sharma', role: 'agent', status: 'ACTIVE', resourceScope: { conversations: 'all', whatsappAccounts: 'all' }, isOnline: true },
    'usr-ananya-06': { id: 'usr-ananya-06', email: 'ananya.r@prakashinstitute.edu.in', fullName: 'Ananya Roy', role: 'agent', customRoleId: 'role-custom-support-lead', customRoleName: 'Senior Counselling Lead', status: 'ACTIVE', permissionOverrides: { grants: ['templates.create'], denies: ['contacts.delete'] }, resourceScope: { conversations: 'all', whatsappAccounts: 'all' }, isOnline: true },
    'usr-ecom-neha': { id: 'usr-ecom-neha', email: 'neha@glowaura.in', fullName: 'Neha Gupta', role: 'owner', status: 'ACTIVE', resourceScope: { conversations: 'all', whatsappAccounts: 'all' }, isOnline: true },
    'usr-re-vikram': { id: 'usr-re-vikram', email: 'vikram@urbannest.com', fullName: 'Vikram Oberoi', role: 'owner', status: 'ACTIVE', resourceScope: { conversations: 'all', whatsappAccounts: 'all' }, isOnline: true },
    'usr-health-ananya': { id: 'usr-health-ananya', email: 'ananya@apexcare.health', fullName: 'Dr. Ananya Roy', role: 'owner', status: 'ACTIVE', resourceScope: { conversations: 'all', whatsappAccounts: 'all' }, isOnline: true },
    'usr-serv-karan': { id: 'usr-serv-karan', email: 'karan@stratagem.co', fullName: 'Karan Singhania', role: 'owner', status: 'ACTIVE', resourceScope: { conversations: 'all', whatsappAccounts: 'all' }, isOnline: true },
    'usr-saas-arjun': { id: 'usr-saas-arjun', email: 'arjun@scaleops.io', fullName: 'Arjun Malhotra', role: 'owner', status: 'ACTIVE', resourceScope: { conversations: 'all', whatsappAccounts: 'all' }, isOnline: true },
    'usr-platform-00': { id: 'usr-platform-00', email: 'ops@automask.io', fullName: 'AutoMask Support Ops', role: 'platform_admin', status: 'ACTIVE', isOnline: true },
    'usr-platform-sup': { id: 'usr-platform-sup', email: 'support@automask.io', fullName: 'Rohan Verma (Support Ops)', role: 'platform_support', status: 'ACTIVE', isOnline: true },
    'usr-platform-bill': { id: 'usr-platform-bill', email: 'billing@automask.io', fullName: 'Meera Iyer (Billing Ops)', role: 'platform_billing', status: 'ACTIVE', isOnline: true },
  };

  // Multi-Tenant Platform Directory
  tenants: Record<string, TenantAccountSummary> = {
    '11111111-1111-4111-8111-111111111111': {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Prakash Institute Kota',
      category: 'JEE & NEET Coaching',
      timezone: 'Asia/Kolkata',
      status: 'ACTIVE',
      planId: 'pro',
      planName: 'Pro Tier',
      planRenewAt: '15 Nov 2026',
      ownerName: 'Dr. Prakash Sharma',
      ownerEmail: 'dr.prakash@prakashinstitute.edu.in',
      memberCount: 5,
      wabaConnected: true,
      wabaPhoneNumber: '+91 98765 43210',
      monthlyMessagesUsed: 14250,
      monthlyMessagesLimit: 25000,
      aiRepliesUsed: 4210,
      aiRepliesLimit: 10000,
      activeTicketsCount: 1,
      createdAt: '2026-01-10T08:00:00Z',
    },
    '22222222-2222-4222-8222-222222222222': {
      id: '22222222-2222-4222-8222-222222222222',
      name: 'Apex NEET Academy Jaipur',
      category: 'Medical Entrance Coaching',
      timezone: 'Asia/Kolkata',
      status: 'ACTIVE',
      planId: 'growth',
      planName: 'Growth Tier',
      planRenewAt: '28 Nov 2026',
      ownerName: 'Dr. Rajesh Singhania',
      ownerEmail: 'director@apexneet.com',
      memberCount: 4,
      wabaConnected: true,
      wabaPhoneNumber: '+91 91234 56789',
      monthlyMessagesUsed: 3890,
      monthlyMessagesLimit: 5000,
      aiRepliesUsed: 1240,
      aiRepliesLimit: 1500,
      activeTicketsCount: 1,
      createdAt: '2026-02-14T10:30:00Z',
    },
    '33333333-3333-4333-8333-333333333333': {
      id: '33333333-3333-4333-8333-333333333333',
      name: 'Target JEE Delhi NCR',
      category: 'IIT-JEE Preparation',
      timezone: 'Asia/Kolkata',
      status: 'SUSPENDED',
      planId: 'starter',
      planName: 'Starter Tier',
      planRenewAt: '01 Oct 2026',
      ownerName: 'Vikram Malhotra',
      ownerEmail: 'admin@targetjee.in',
      memberCount: 2,
      wabaConnected: false,
      wabaPhoneNumber: '+91 99887 76655',
      monthlyMessagesUsed: 980,
      monthlyMessagesLimit: 1000,
      aiRepliesUsed: 295,
      aiRepliesLimit: 300,
      activeTicketsCount: 1,
      suspensionReason: 'Overdue invoice for 45 days and suspicious unverified bulk message traffic.',
      suspendedAt: '2026-10-02T14:20:00Z',
      suspendedBy: 'ops@automask.io',
      createdAt: '2026-03-01T12:00:00Z',
    },
  };

  // Platform Subscription Plans Catalog
  platformPlans: Record<string, PlatformPlanDefinition> = {
    free: {
      id: 'free',
      name: 'Free Trial',
      priceInr: 0,
      maxMembers: 1,
      maxExecutions: 100,
      maxAiReplies: 30,
      maxTemplates: 50,
      maxKnowledgeDocuments: 1,
      features: ['Shared WhatsApp Inbox', 'Basic Keyword Rules', 'Trial Demo Slot Booking'],
      isActive: true,
    },
    starter: {
      id: 'starter',
      name: 'Starter Tier',
      priceInr: 2999,
      maxMembers: 3,
      maxExecutions: 1000,
      maxAiReplies: 300,
      maxTemplates: 100,
      maxKnowledgeDocuments: 5,
      features: ['Up to 3 Counsellors', '1,000 Executions / mo', 'Grounded AI FAQ Replies', 'CSV Contacts Import'],
      isActive: true,
    },
    growth: {
      id: 'growth',
      name: 'Growth Tier',
      priceInr: 6999,
      maxMembers: 8,
      maxExecutions: 5000,
      maxAiReplies: 1500,
      maxTemplates: 250,
      maxKnowledgeDocuments: 20,
      features: ['Up to 8 Counsellors', '5,000 Executions / mo', 'Visual Workflows Builder', 'Scheduled Broadcasts', 'Document RAG (PDF/DOCX)'],
      isActive: true,
    },
    pro: {
      id: 'pro',
      name: 'Pro Tier',
      priceInr: 14999,
      maxMembers: 25,
      maxExecutions: 25000,
      maxAiReplies: 10000,
      maxTemplates: 1000,
      maxKnowledgeDocuments: 100,
      features: ['Up to 25 Counsellors', '25,000 Executions / mo', 'Custom Roles & RBAC', 'Priority Webhook Queue', 'Dedicated Meta WABA', 'Audit Trail Export'],
      isActive: true,
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise Custom',
      priceInr: 39999,
      maxMembers: 100,
      maxExecutions: 100000,
      maxAiReplies: 50000,
      maxTemplates: 5000,
      maxKnowledgeDocuments: 500,
      features: ['Unlimited Counsellors', '100,000+ Executions', 'Custom SLA 99.9%', 'Custom AI Fine-tuning', 'Dedicated Account Manager'],
      isActive: true,
    },
  };

  // Platform Support Tickets
  platformTickets: PlatformSupportTicket[] = [
    {
      id: 'ticket-101',
      workspaceId: '11111111-1111-4111-8111-111111111111',
      workspaceName: 'Prakash Institute Kota',
      requesterEmail: 'dr.prakash@prakashinstitute.edu.in',
      requesterName: 'Dr. Prakash Sharma',
      subject: 'Inbound Webhook Verification Latency on Meta Cloud API',
      category: 'TECHNICAL',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedTo: 'usr-platform-sup',
      assignedStaffName: 'Rohan Verma (Support Ops)',
      resolutionNotes: 'Investigating Redis BullMQ worker queue processing times during peak 10 AM batch.',
      createdAt: '2026-10-16T14:30:00Z',
      updatedAt: '2026-10-16T15:45:00Z',
    },
    {
      id: 'ticket-102',
      workspaceId: '22222222-2222-4222-8222-222222222222',
      workspaceName: 'Apex NEET Academy Jaipur',
      requesterEmail: 'director@apexneet.com',
      requesterName: 'Dr. Rajesh Singhania',
      subject: 'Request for Temporary AI Replies Quota Expansion (NEET Crash Course)',
      category: 'QUOTA',
      priority: 'MEDIUM',
      status: 'OPEN',
      assignedTo: 'usr-platform-bill',
      assignedStaffName: 'Meera Iyer (Billing Ops)',
      resolutionNotes: 'Assessing account billing history for 1,000 extra AI tokens.',
      createdAt: '2026-10-16T18:10:00Z',
      updatedAt: '2026-10-16T18:10:00Z',
    },
    {
      id: 'ticket-103',
      workspaceId: '33333333-3333-4333-8333-333333333333',
      workspaceName: 'Target JEE Delhi NCR',
      requesterEmail: 'admin@targetjee.in',
      requesterName: 'Vikram Malhotra',
      subject: 'Appeal Against Account Suspension (Payment Processed)',
      category: 'SUSPENSION_APPEAL',
      priority: 'URGENT',
      status: 'OPEN',
      resolutionNotes: 'Pending NEFT bank reconciliation before account reactivation.',
      createdAt: '2026-10-17T08:15:00Z',
      updatedAt: '2026-10-17T08:15:00Z',
    },
  ];

  // Global Platform Operations Audit Logs
  platformAuditLogs: PlatformAuditLog[] = [
    {
      id: 'plat-audit-01',
      actorId: 'usr-platform-00',
      actorEmail: 'ops@automask.io',
      actorRole: 'platform_admin',
      action: 'TENANT_SUSPENDED',
      targetType: 'tenant',
      targetId: '33333333-3333-4333-8333-333333333333',
      details: { tenantName: 'Target JEE Delhi NCR', reason: 'Overdue invoice for 45 days and suspicious unverified bulk message traffic.' },
      ipAddress: '10.0.4.12',
      createdAt: '2026-10-02T14:20:00Z',
    },
    {
      id: 'plat-audit-02',
      actorId: 'usr-platform-bill',
      actorEmail: 'billing@automask.io',
      actorRole: 'platform_billing',
      action: 'PLAN_MODIFIED',
      targetType: 'plan',
      targetId: 'pro',
      details: { planName: 'Pro Tier', updatedLimits: { maxExecutions: 25000, maxAiReplies: 10000 } },
      ipAddress: '10.0.4.18',
      createdAt: '2026-10-08T11:00:00Z',
    },
    {
      id: 'plat-audit-03',
      actorId: 'usr-platform-sup',
      actorEmail: 'support@automask.io',
      actorRole: 'platform_support',
      action: 'SUPPORT_TICKET_ASSIGNED',
      targetType: 'ticket',
      targetId: 'ticket-101',
      details: { assignedTo: 'Rohan Verma' },
      ipAddress: '10.0.4.15',
      createdAt: '2026-10-16T15:00:00Z',
    },
  ];

  logPlatformAudit(
    actorId: string,
    actorEmail: string,
    actorRole: PlatformStaffRole,
    action: string,
    targetType: 'tenant' | 'plan' | 'ticket' | 'support_grant' | 'system',
    targetId: string,
    details?: Record<string, any>,
    ipAddress?: string
  ): PlatformAuditLog {
    const entry: PlatformAuditLog = {
      id: `plat-audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actorId,
      actorEmail,
      actorRole,
      action,
      targetType,
      targetId,
      details,
      ipAddress: ipAddress || '10.0.4.10',
      createdAt: new Date().toISOString(),
    };
    this.platformAuditLogs.unshift(entry);
    return entry;
  }

  suspendTenant(tenantId: string, reason: string, actor: { id: string; email: string; role: PlatformStaffRole }): boolean {
    const tenant = this.tenants[tenantId];
    if (!tenant) return false;

    tenant.status = 'SUSPENDED';
    tenant.suspensionReason = reason;
    tenant.suspendedAt = new Date().toISOString();
    tenant.suspendedBy = actor.email;

    if (this.workspace.id === tenantId) {
      (this.workspace as any).status = 'SUSPENDED';
      (this.workspace as any).suspensionReason = reason;
    }

    this.logPlatformAudit(
      actor.id,
      actor.email,
      actor.role,
      'TENANT_SUSPENDED',
      'tenant',
      tenantId,
      { tenantName: tenant.name, reason }
    );
    return true;
  }

  activateTenant(tenantId: string, actor: { id: string; email: string; role: PlatformStaffRole }): boolean {
    const tenant = this.tenants[tenantId];
    if (!tenant) return false;

    tenant.status = 'ACTIVE';
    delete tenant.suspensionReason;
    delete tenant.suspendedAt;
    delete tenant.suspendedBy;

    if (this.workspace.id === tenantId) {
      (this.workspace as any).status = 'ACTIVE';
      delete (this.workspace as any).suspensionReason;
    }

    this.logPlatformAudit(
      actor.id,
      actor.email,
      actor.role,
      'TENANT_ACTIVATED',
      'tenant',
      tenantId,
      { tenantName: tenant.name }
    );
    return true;
  }

  updatePlatformPlan(
    planId: string,
    updates: Partial<PlatformPlanDefinition>,
    actor: { id: string; email: string; role: PlatformStaffRole }
  ): PlatformPlanDefinition | null {
    const plan = this.platformPlans[planId];
    if (!plan) return null;

    Object.assign(plan, updates);

    this.logPlatformAudit(
      actor.id,
      actor.email,
      actor.role,
      'PLAN_MODIFIED',
      'plan',
      planId,
      { updates }
    );
    return plan;
  }

  supportGrants: SupportGrant[] = [];

  auditLogs: AuditLog[] = [];

  logAudit(workspaceId: string, actorId: string, actorName: string, actorRole: any, action: string, target: string, details?: any) {
    const entry: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      workspaceId,
      actorId,
      actorName,
      actorRole,
      action,
      target,
      details,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    return entry;
  }

  roles: CustomRole[] = [
    {
      id: 'role-sys-owner',
      workspaceId: 'ws-prakash-01',
      name: 'Workspace Owner',
      key: 'owner',
      description: 'Full administrative control over all workspace features, billing, and staff permissions',
      isSystem: true,
      permissions: [...ALL_PERMISSION_KEYS],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'role-sys-admin',
      workspaceId: 'ws-prakash-01',
      name: 'Workspace Admin',
      key: 'admin',
      description: 'Manages operational workflows, automations, templates, broadcasts, team, and AI',
      isSystem: true,
      permissions: DEFAULT_SYSTEM_ROLES.admin.permissions,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'role-sys-manager',
      workspaceId: 'ws-prakash-01',
      name: 'Operations Manager',
      key: 'manager',
      description: 'Supervises counsellors, monitors conversations, schedules broadcasts, and manages demo slots',
      isSystem: true,
      permissions: DEFAULT_SYSTEM_ROLES.manager.permissions,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'role-sys-agent',
      workspaceId: 'ws-prakash-01',
      name: 'Agent / Counsellor',
      key: 'agent',
      description: 'Handles student chats, takes over conversations, updates lead status, and schedules trial demos',
      isSystem: true,
      permissions: DEFAULT_SYSTEM_ROLES.agent.permissions,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'role-sys-analyst',
      workspaceId: 'ws-prakash-01',
      name: 'Viewer / Analyst',
      key: 'analyst',
      description: 'Read-only access to metrics, reports, conversation history, and audit logs',
      isSystem: true,
      permissions: DEFAULT_SYSTEM_ROLES.analyst.permissions,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'role-custom-support-lead',
      workspaceId: 'ws-prakash-01',
      name: 'Senior Counselling Lead',
      key: 'custom_support_lead',
      description: 'Custom role with full messaging, template creation, and broadcast scheduling rights',
      isSystem: false,
      permissions: [
        'messages.view', 'messages.send', 'messages.reply', 'messages.assign', 'messages.reassign', 'messages.notes', 'messages.resolve',
        'contacts.view', 'contacts.create', 'contacts.edit',
        'templates.view', 'templates.create', 'templates.submit_for_approval',
        'broadcasts.view', 'broadcasts.create', 'broadcasts.schedule',
        'bookings.view', 'bookings.book_student',
        'analytics.view',
      ],
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z',
    },
  ];

  workflows: WorkflowDefinition[] = [
    {
      id: 'wf-01',
      workspaceId: 'ws-prakash-01',
      name: 'JEE 2027 Inbound Qualification & Trial Booking',
      description: 'Automated 5-step conversational funnel for prospective engineering aspirants',
      status: 'PUBLISHED',
      version: 2,
      nodes: [
        { id: 'node-1', type: 'trigger', name: 'Student WhatsApp Message', config: { triggerType: 'inbound_message' }, position: { x: 50, y: 100 } },
        { id: 'node-2', type: 'condition_if_else', name: 'Opt-Out or Stop Check', config: { condition: 'message_contains', keywords: ['STOP', 'UNSUBSCRIBE'] }, position: { x: 250, y: 100 } },
        { id: 'node-3', type: 'condition_if_else', name: 'Demo Booking Intent', config: { condition: 'intent_match', intent: 'DEMO_REQUEST' }, position: { x: 450, y: 100 } },
        { id: 'node-4', type: 'send_template', name: 'Send Demo Confirmation', config: { templateName: 'demo_reminder_physics' }, position: { x: 650, y: 50 } },
        { id: 'node-5', type: 'ai_assistant', name: 'Grounded RAG Answer', config: { fallbackToHandoff: true, threshold: 0.70 }, position: { x: 650, y: 200 } },
        { id: 'node-6', type: 'end', name: 'End Workflow', config: {}, position: { x: 850, y: 100 } },
      ],
      edges: [
        { id: 'e1-2', source: 'node-1', target: 'node-2' },
        { id: 'e2-3', source: 'node-2', target: 'node-3', label: 'No (Continue)' },
        { id: 'e3-4', source: 'node-3', target: 'node-4', label: 'Yes (Book Demo)' },
        { id: 'e3-5', source: 'node-3', target: 'node-5', label: 'No (General Query)' },
        { id: 'e4-6', source: 'node-4', target: 'node-6' },
        { id: 'e5-6', source: 'node-5', target: 'node-6' },
      ],
      createdAt: '2026-09-15T08:00:00.000Z',
      updatedAt: '2026-10-15T12:00:00.000Z',
    },
  ];

  templates: MessageTemplate[] = [];

  campaigns: BroadcastCampaign[] = [
    {
      id: 'camp-01',
      workspaceId: 'ws-prakash-01',
      name: 'Diwali Dropper Batch Early Bird Announcement',
      description: 'Targeted broadcast to 2026 Class 12 inquiries with 15% tuition waiver',
      templateName: 'batch_admission_open',
      status: 'COMPLETED',
      totalRecipients: 150,
      sentCount: 148,
      deliveredCount: 144,
      readCount: 132,
      failedCount: 2,
      excludedCount: 6, // 6 opted-out contacts safely suppressed!
      createdAt: '2026-10-05T10:00:00.000Z',
      updatedAt: '2026-10-05T12:00:00.000Z',
    },
    {
      id: 'camp-02',
      workspaceId: 'ws-prakash-01',
      name: 'Upcoming Saturday Physics Demo Reminder',
      description: 'Reminder broadcast sent to students who registered for classroom trial',
      templateName: 'demo_reminder_physics',
      status: 'SCHEDULED',
      scheduledAt: '2026-10-18T10:00:00.000Z',
      totalRecipients: 45,
      sentCount: 0,
      deliveredCount: 0,
      readCount: 0,
      failedCount: 0,
      excludedCount: 1,
      createdAt: '2026-10-16T15:00:00.000Z',
      updatedAt: '2026-10-16T15:00:00.000Z',
    },
  ];

  documents: KnowledgeDocument[] = [
    {
      id: 'doc-01',
      workspaceId: 'ws-prakash-01',
      filename: 'Prakash_Kota_Prospectus_2027.pdf',
      fileType: 'pdf',
      fileSize: 2458900,
      status: 'PROCESSED',
      chunksCount: 38,
      metadata: { author: 'Prakash Institute Academic Council', year: 2027 },
      createdAt: '2026-09-01T10:00:00.000Z',
    },
    {
      id: 'doc-02',
      workspaceId: 'ws-prakash-01',
      filename: 'Kota_Hostel_Mess_Guidelines.docx',
      fileType: 'docx',
      fileSize: 840200,
      status: 'PROCESSED',
      chunksCount: 14,
      metadata: { category: 'Hostel Facilities', location: 'Knowledge Park, Kota' },
      createdAt: '2026-09-10T14:00:00.000Z',
    },
  ];

  team: User[] = [
    { 
      id: 'usr-owner-01', 
      email: 'dr.prakash@prakashinstitute.edu.in', 
      fullName: 'Dr. Prakash Sharma', 
      role: 'owner', 
      status: 'ACTIVE',
      resourceScope: { conversations: 'all', whatsappAccounts: 'all' },
      isOnline: true 
    },
    { 
      id: 'usr-sumit-01', 
      email: 'sumit@prakashinstitute.edu.in', 
      fullName: 'Sumit Bhardwaj', 
      role: 'admin', 
      status: 'ACTIVE',
      resourceScope: { conversations: 'all', whatsappAccounts: 'all' },
      isOnline: true 
    },
    { 
      id: 'usr-priya-02', 
      email: 'priya.s@prakashinstitute.edu.in', 
      fullName: 'Priya Sharma', 
      role: 'agent', 
      status: 'ACTIVE',
      resourceScope: { conversations: 'all', whatsappAccounts: 'all' },
      isOnline: true 
    },
    { 
      id: 'usr-ananya-06', 
      email: 'ananya.r@prakashinstitute.edu.in', 
      fullName: 'Ananya Roy', 
      role: 'agent', 
      customRoleId: 'role-custom-support-lead',
      customRoleName: 'Senior Counselling Lead',
      status: 'ACTIVE',
      permissionOverrides: {
        grants: ['templates.create'],
        denies: ['contacts.delete'],
      },
      resourceScope: { conversations: 'all', whatsappAccounts: 'all' },
      isOnline: true 
    },
    { 
      id: 'usr-rohan-03', 
      email: 'rohan.v@prakashinstitute.edu.in', 
      fullName: 'Rohan Verma', 
      role: 'agent', 
      status: 'ACTIVE',
      resourceScope: { conversations: 'assigned_only', whatsappAccounts: 'all' },
      isOnline: true 
    },
    { 
      id: 'usr-kavita-04', 
      email: 'kavita.k@prakashinstitute.edu.in', 
      fullName: 'Kavita Sen', 
      role: 'agent', 
      status: 'SUSPENDED', // Suspended member for testing instant revocation!
      resourceScope: { conversations: 'assigned_only', whatsappAccounts: 'all' },
      isOnline: false 
    },
    { 
      id: 'usr-amit-05', 
      email: 'amit.j@prakashinstitute.edu.in', 
      fullName: 'Amit Joshi', 
      role: 'agent', 
      status: 'ACTIVE',
      resourceScope: { conversations: 'all', whatsappAccounts: 'all' },
      isOnline: false 
    },
  ];

  whatsappAccount: WhatsAppAccount = {
    id: 'wa-acc-01',
    workspaceId: '11111111-1111-4111-8111-111111111111',
    displayNumber: '+1 555-660-3701',
    phoneNumberId: '1317971801407031',
    status: 'CONNECTED',
    qualityRating: 'GREEN',
    wabaId: '1789873612251308',
  };

  usage: UsageQuota = {
    aiRepliesUsed: 32450,
    aiRepliesLimit: 50000,
    executionsUsed: 12340,
    executionsLimit: 20000,
    templateMessagesUsed: 8920,
    templateMessagesLimit: 15000,
  };

  metrics = {
    newEnquiries: 248,
    newEnquiriesGrowth: '+12%',
    qualifiedLeads: 186,
    qualifiedLeadsGrowth: '+18%',
    demoBooked: 74,
    demoBookedGrowth: '+22%',
    admissions: 28,
    admissionsGrowth: '+27%',
    funnel: [
      { stage: 'New Enquiries', count: 248, color: '#10b981' },
      { stage: 'Qualified Leads', count: 186, color: '#38bdf8' },
      { stage: 'Interested', count: 112, color: '#3b82f6' },
      { stage: 'Demo Booked', count: 74, color: '#8b5cf6' },
      { stage: 'Demo Attended', count: 52, color: '#ec4899' },
      { stage: 'Admissions', count: 28, color: '#f59e0b' },
    ],
    sources: [
      { name: 'Website', percentage: 32, count: 79, color: '#0284c7' },
      { name: 'Facebook Ads', percentage: 24, count: 60, color: '#2563eb' },
      { name: 'Instagram', percentage: 18, count: 45, color: '#d946ef' },
      { name: 'Direct Chat', percentage: 14, count: 35, color: '#06b6d4' },
      { name: 'Reference', percentage: 8, count: 20, color: '#f97316' },
      { name: 'Others', percentage: 4, count: 9, color: '#64748b' },
    ],
  };

  conversations: Conversation[] = [
    {
      id: 'conv-01',
      workspaceId: 'ws-prakash-01',
      contactId: 'ct-01',
      contactName: 'Amit Raj',
      phone: '+91 98112 34567',
      status: 'OPEN',
      leadStatus: 'NEW',
      leadCourse: 'JEE Dropper',
      unreadCount: 2,
      lastMessage: 'JEE dropper batch ki fees kya hai?',
      lastMessageAt: '10:24 AM',
      takeoverActive: false,
      windowExpiresAt: new Date(Date.now() + 22 * 3600 * 1000).toISOString(),
      tags: ['JEE', 'Dropper 2027'],
    },
    {
      id: 'conv-02',
      workspaceId: 'ws-prakash-01',
      contactId: 'ct-02',
      contactName: 'Pooja Sharma',
      phone: '+91 98223 45678',
      status: 'OPEN',
      leadStatus: 'DEMO_BOOKED',
      leadCourse: 'NEET Foundation',
      unreadCount: 1,
      lastMessage: 'Demo class ka link bhej dijiye.',
      lastMessageAt: '10:18 AM',
      takeoverActive: false,
      windowExpiresAt: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
      tags: ['NEET', 'Demo Scheduled'],
    },
    {
      id: 'conv-03',
      workspaceId: 'ws-prakash-01',
      contactId: 'ct-03',
      contactName: 'Rahul Kumar',
      phone: '+91 98334 56789',
      status: 'OPEN',
      leadStatus: 'INTERESTED',
      leadCourse: 'JEE Advanced',
      unreadCount: 0,
      lastMessage: 'Hostel facility available hai?',
      lastMessageAt: '09:55 AM',
      takeoverActive: false,
      windowExpiresAt: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
      tags: ['Hostel Query', 'Kota Campus'],
    },
    {
      id: 'conv-04',
      workspaceId: 'ws-prakash-01',
      contactId: 'ct-04',
      contactName: 'Neha Gupta',
      phone: '+91 98445 67890',
      status: 'OPEN',
      leadStatus: 'QUALIFIED',
      leadCourse: 'NEET Regular',
      unreadCount: 0,
      lastMessage: 'NEET batch kab start hoga?',
      lastMessageAt: '09:32 AM',
      takeoverActive: false,
      windowExpiresAt: new Date(Date.now() + 15 * 3600 * 1000).toISOString(),
      tags: ['NEET 2027', 'Class 12'],
    },
    {
      id: 'conv-05',
      workspaceId: 'ws-prakash-01',
      contactId: 'ct-05',
      contactName: 'Vikash Bansal',
      phone: '+91 98556 78901',
      status: 'OPEN',
      leadStatus: 'QUALIFIED',
      leadCourse: 'JEE Foundation',
      unreadCount: 0,
      lastMessage: 'Kal demo attend karunga.',
      lastMessageAt: '08:41 AM',
      takeoverActive: false,
      windowExpiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
      tags: ['Follow Up', 'Demo Reminder'],
    },
  ];

  messages: Record<string, Message[]> = {
    'conv-01': [
      {
        id: 'msg-01-1',
        conversationId: 'conv-01',
        direction: 'INBOUND',
        body: 'Hello sir, mujhe JEE coaching ke bare me poochna hai.',
        senderType: 'student',
        status: 'READ',
        timestamp: '10:20 AM',
        type: 'text',
      },
      {
        id: 'msg-01-2',
        conversationId: 'conv-01',
        direction: 'OUTBOUND',
        body: 'Namaste Amit! 🙏 Welcome to Prakash Institute. Humare JEE Main & Advanced batches ke admissions open hain. Aap Class 11, 12 ya Dropper batch me interested hain?',
        senderType: 'bot',
        status: 'READ',
        timestamp: '10:21 AM',
        type: 'text',
      },
      {
        id: 'msg-01-3',
        conversationId: 'conv-01',
        direction: 'INBOUND',
        body: 'JEE dropper batch ki fees kya hai?',
        senderType: 'student',
        status: 'DELIVERED',
        timestamp: '10:24 AM',
        type: 'text',
      },
    ],
    'conv-02': [
      {
        id: 'msg-02-1',
        conversationId: 'conv-02',
        direction: 'INBOUND',
        body: 'Sir kal demo class register ki thi.',
        senderType: 'student',
        status: 'READ',
        timestamp: '10:15 AM',
        type: 'text',
      },
      {
        id: 'msg-02-2',
        conversationId: 'conv-02',
        direction: 'INBOUND',
        body: 'Demo class ka link bhej dijiye.',
        senderType: 'student',
        status: 'DELIVERED',
        timestamp: '10:18 AM',
        type: 'text',
      },
    ],
    'conv-03': [
      {
        id: 'msg-03-1',
        conversationId: 'conv-03',
        direction: 'INBOUND',
        body: 'Hostel facility available hai?',
        senderType: 'student',
        status: 'READ',
        timestamp: '09:55 AM',
        type: 'text',
      },
      {
        id: 'msg-03-2',
        conversationId: 'conv-03',
        direction: 'OUTBOUND',
        body: 'Haan Rahul ji! Institute ke campus ke paas boys and girls ke liye separate AC/Non-AC hostel facilities aur hygienic mess available hai. Would you like our counsellor to arrange a campus tour?',
        senderType: 'bot',
        status: 'DELIVERED',
        timestamp: '09:56 AM',
        type: 'text',
      },
    ],
    'conv-04': [
      {
        id: 'msg-04-1',
        conversationId: 'conv-04',
        direction: 'INBOUND',
        body: 'NEET batch kab start hoga?',
        senderType: 'student',
        status: 'READ',
        timestamp: '09:32 AM',
        type: 'text',
      },
      {
        id: 'msg-04-2',
        conversationId: 'conv-04',
        direction: 'OUTBOUND',
        body: 'Hello Neha! Next NEET batch Monday 20th Oct se start ho raha hai (Daily 4:00 PM to 7:30 PM). Kya aap online ya offline batch dekh rahe hain?',
        senderType: 'bot',
        status: 'READ',
        timestamp: '09:33 AM',
        type: 'text',
      },
    ],
    'conv-05': [
      {
        id: 'msg-05-1',
        conversationId: 'conv-05',
        direction: 'INBOUND',
        body: 'Kal demo attend karunga.',
        senderType: 'student',
        status: 'READ',
        timestamp: '08:41 AM',
        type: 'text',
      },
    ],
  };

  contacts: Contact[] = [
    {
      id: 'ct-01',
      workspaceId: 'ws-prakash-01',
      phone: '+91 98112 34567',
      name: 'Amit Raj',
      tags: ['JEE', 'Dropper 2027', 'High Intent'],
      optInStatus: 'OPTED_IN',
      optInSource: 'WhatsApp Inbound',
      city: 'Delhi NCR',
      region: 'North Zone',
      country: 'India',
      state: 'Delhi',
      notes: 'Parent inquired about 1-year dropper batch fees',
      createdAt: 'Today, 10:20 AM',
    },
    {
      id: 'ct-02',
      workspaceId: 'ws-prakash-01',
      phone: '+91 98223 45678',
      name: 'Pooja Sharma',
      tags: ['NEET', 'Foundation', 'Demo Booked'],
      optInStatus: 'OPTED_IN',
      optInSource: 'Meta Ad Form',
      city: 'Jaipur',
      region: 'West Zone',
      country: 'India',
      state: 'Rajasthan',
      notes: 'Demo class confirmed for tomorrow 5:00 PM',
      createdAt: 'Yesterday, 4:15 PM',
    },
    {
      id: 'ct-03',
      workspaceId: 'ws-prakash-01',
      phone: '+91 98334 56789',
      name: 'Rahul Kumar',
      tags: ['JEE Advanced', 'Hostel Needed'],
      optInStatus: 'OPTED_IN',
      optInSource: 'Instagram Lead',
      city: 'Kota',
      region: 'Central Hub',
      country: 'India',
      state: 'Rajasthan',
      notes: 'Requires AC hostel accommodation and mess facility',
      createdAt: 'Today, 09:50 AM',
    },
    {
      id: 'ct-04',
      workspaceId: 'ws-prakash-01',
      phone: '+91 98445 67890',
      name: 'Neha Gupta',
      tags: ['NEET 2027', 'Class 12'],
      optInStatus: 'OPTED_IN',
      optInSource: 'Direct Chat',
      city: 'Patna',
      region: 'East Region',
      country: 'India',
      state: 'Bihar',
      notes: 'Looking for evening physics batch',
      createdAt: 'Today, 09:30 AM',
    },
    {
      id: 'ct-05',
      workspaceId: 'ws-prakash-01',
      phone: '+91 98556 78901',
      name: 'Vikash Bansal',
      tags: ['JEE Foundation', 'Demo Attended'],
      optInStatus: 'OPTED_IN',
      optInSource: 'Student Reference',
      city: 'Lucknow',
      region: 'North Zone',
      country: 'India',
      state: 'Uttar Pradesh',
      notes: 'Attended trial class with Dr. Prakash Sharma',
      createdAt: '2 days ago',
    },
    {
      id: 'ct-06',
      workspaceId: 'ws-prakash-01',
      phone: '+91 98999 11111',
      name: 'Test Unsubscriber',
      tags: ['Opted Out'],
      optInStatus: 'OPTED_OUT',
      optInSource: 'SMS Import',
      city: 'Delhi NCR',
      region: 'North Zone',
      country: 'India',
      state: 'Delhi',
      notes: 'Sent STOP on 14 Oct',
      createdAt: '3 days ago',
    },
    {
      id: 'ct-07',
      workspaceId: 'ws-prakash-01',
      phone: '+91 98667 89012',
      name: 'Ananya Verma',
      tags: ['JEE', 'Class11', 'Scholarship'],
      optInStatus: 'OPTED_IN',
      optInSource: 'School Camp',
      city: 'Mumbai',
      region: 'West Zone',
      country: 'India',
      state: 'Maharashtra',
      notes: 'Scholarship applicant scored 92% in 10th boards',
      createdAt: '3 days ago',
    },
    {
      id: 'ct-08',
      workspaceId: 'ws-prakash-01',
      phone: '+91 98778 90123',
      name: 'Siddharth Rao',
      tags: ['JEE', 'Foundation'],
      optInStatus: 'OPTED_IN',
      optInSource: 'Web Webinar',
      city: 'Bengaluru',
      region: 'South Region',
      country: 'India',
      state: 'Karnataka',
      notes: 'Interested in online hybrid batches',
      createdAt: '4 days ago',
    },
    {
      id: 'ct-09',
      workspaceId: 'ws-prakash-01',
      phone: '+971 50 123 4567',
      name: 'Zayd Al-Mansoori',
      tags: ['NRI Admissions', 'JEE 2027', 'High Intent'],
      optInStatus: 'OPTED_IN',
      optInSource: 'NRI Portal',
      city: 'Dubai',
      region: 'Middle East',
      country: 'United Arab Emirates',
      state: 'Dubai',
      notes: 'Gulf NRI student seeking 2-year IIT-JEE distance package',
      createdAt: '5 days ago',
    },
    {
      id: 'ct-10',
      workspaceId: 'ws-prakash-01',
      phone: '+977 98 1234 5678',
      name: 'Kavita Thapa',
      tags: ['International', 'NEET', 'Scholarship'],
      optInStatus: 'OPTED_IN',
      optInSource: 'Kathmandu Seminar',
      city: 'Kathmandu',
      region: 'SAARC Region',
      country: 'Nepal',
      state: 'Bagmati',
      notes: 'Applying for Prakash medical scholarship',
      createdAt: '6 days ago',
    },
  ];

  leads: Lead[] = [
    {
      id: 'lead-01',
      workspaceId: 'ws-prakash-01',
      contactId: 'ct-01',
      contactName: 'Amit Raj',
      phone: '+91 98112 34567',
      course: 'JEE Dropper',
      classGrade: '12th Passed',
      preferredBatch: 'Morning 9 AM - 1 PM',
      city: 'Delhi NCR',
      status: 'NEW',
      source: 'Website',
      score: 75,
      createdAt: 'Today, 10:20 AM',
      notes: 'Asked for dropper batch fee structure.',
    },
    {
      id: 'lead-02',
      workspaceId: 'ws-prakash-01',
      contactId: 'ct-02',
      contactName: 'Pooja Sharma',
      phone: '+91 98223 45678',
      course: 'NEET Foundation',
      classGrade: 'Class 11',
      preferredBatch: 'Evening 4 PM - 7 PM',
      city: 'Jaipur',
      status: 'DEMO_BOOKED',
      source: 'Facebook Ads',
      score: 90,
      createdAt: 'Yesterday, 4:15 PM',
      notes: 'Demo class scheduled for tomorrow 5:00 PM.',
    },
    {
      id: 'lead-03',
      workspaceId: 'ws-prakash-01',
      contactId: 'ct-03',
      contactName: 'Rahul Kumar',
      phone: '+91 98334 56789',
      course: 'JEE Advanced',
      classGrade: 'Class 12',
      preferredBatch: 'Weekend Batch',
      city: 'Patna',
      status: 'INTERESTED',
      source: 'Instagram',
      score: 65,
      createdAt: 'Today, 09:50 AM',
      notes: 'Needs hostel accommodation.',
    },
    {
      id: 'lead-04',
      workspaceId: 'ws-prakash-01',
      contactId: 'ct-04',
      contactName: 'Neha Gupta',
      phone: '+91 98445 67890',
      course: 'NEET Regular',
      classGrade: 'Class 12',
      preferredBatch: 'Evening Batch',
      city: 'Lucknow',
      status: 'QUALIFIED',
      source: 'Direct Chat',
      score: 82,
      createdAt: 'Today, 09:30 AM',
      notes: 'Targeting NEET 2027.',
    },
    {
      id: 'lead-05',
      workspaceId: 'ws-prakash-01',
      contactId: 'ct-05',
      contactName: 'Vikash Bansal',
      phone: '+91 98556 78901',
      course: 'JEE Foundation',
      classGrade: 'Class 11',
      preferredBatch: 'Morning Batch',
      city: 'Chandigarh',
      status: 'DEMO_ATTENDED',
      source: 'Reference',
      score: 88,
      createdAt: '2 days ago',
      notes: 'Attended Physics demo by H.C. Verma faculty.',
    },
  ];

  rules: AutomationRule[] = [
    {
      id: 'rule-01',
      name: 'Welcome Greeting & Quick Menu',
      description: 'Reply to new enquiries with institute greeting and interactive quick replies',
      trigger: 'KEYWORD',
      keywords: ['hi', 'hello', 'namaste', 'hey', 'start'],
      headerText: '🎓 Prakash Institute of Science & Technology',
      replyMessage: 'Namaste! 🙏 Welcome to Prakash Institute (Kota & Delhi NCR).\n\nAdmissions for Academic Session 2027 are now open. How can we guide your preparation today?',
      footerText: '⚡ Tap a quick link below to get instant info',
      buttons: [
        {
          id: 'btn-101',
          title: '📚 Course Fees',
          type: 'QUICK_REPLY',
          payload: 'Prakash Institute Programs:\n• 1-Year JEE Dropper: ₹45,000/yr\n• 2-Year Foundation (11th & 12th): ₹35,000/yr\n• NEET Medical Comprehensive: ₹55,000/yr\n*Includes study kits, daily DPPs & all-India mock tests.'
        },
        {
          id: 'btn-102',
          title: '🎟️ Book Free Demo',
          type: 'QUICK_REPLY',
          payload: 'Great! Upcoming Free Demo Masterclass:\n📅 Physics Mechanics by Dr. Sharma\n⏰ Friday 5:00 PM\nYour trial pass has been reserved.'
        },
        {
          id: 'btn-103',
          title: '📞 Call Counsellor',
          type: 'CALL',
          phoneNumber: '+91 98765 43210',
          payload: 'Connecting you to our Senior Academic Counsellor hotline: +91 98765 43210'
        }
      ],
      actions: ['assign_tag:New Lead', 'set_status:NEW'],
      priority: 1,
      enabled: true,
      executionsCount: 4210,
    },
    {
      id: 'rule-02',
      name: 'Course Enquiry (JEE)',
      description: 'Auto reply with JEE Main & Advanced curriculum breakdown and fee links',
      trigger: 'KEYWORD',
      keywords: ['jee', 'iit', 'engineering', 'dropper', 'jee main'],
      headerText: '⚡ JEE Main & Advanced 2027 Programs',
      replyMessage: 'Prakash Institute JEE Programs:\n• 1-Year Dropper Batch (Target 2027)\n• 2-Year Foundation (Class 11 & 12)\n• Top Rankers Mentorship & Daily DPPs.\n\nChoose an option below for instant details:',
      footerText: 'Prakash Institute • Official WhatsApp Desk',
      buttons: [
        {
          id: 'btn-201',
          title: '💰 Dropper Batch Fees',
          type: 'QUICK_REPLY',
          payload: 'JEE Dropper 1-Year Batch:\n• Tuition Fee: ₹45,000 / year\n• Material & Online Test Series included\n• P-SAT Scholarship up to 40% fee discount available.'
        },
        {
          id: 'btn-202',
          title: '📅 Batch Timings',
          type: 'QUICK_REPLY',
          payload: 'Class Timings:\n• Morning Batch: 8:30 AM - 1:00 PM\n• Evening Batch: 3:30 PM - 8:00 PM\n• Available at Kota Campus & Delhi South Ext.'
        },
        {
          id: 'btn-203',
          title: '📝 Scholarship Test',
          type: 'URL',
          url: 'https://prakashinstitute.edu.in/scholarship',
          payload: 'Register for P-SAT (Prakash Scholarship Admission Test) online at https://prakashinstitute.edu.in/scholarship'
        }
      ],
      actions: ['assign_tag:JEE', 'set_course:JEE Main & Adv'],
      priority: 2,
      enabled: true,
      executionsCount: 3180,
    },
    {
      id: 'rule-03',
      name: 'Demo Booking Flow',
      description: 'Collect student details and book free demo class with interactive slot selection',
      trigger: 'DEMO_REQUEST',
      keywords: ['demo', 'trial', 'demo class', 'free class', 'book demo'],
      headerText: '📅 Free Trial Masterclass Reservation',
      replyMessage: 'Awesome! We have upcoming Free Demo Sessions available in Physics and Chemistry. Select your preferred slot below:',
      footerText: 'Seats strictly limited to 25 students per batch',
      buttons: [
        {
          id: 'btn-301',
          title: 'Fri 5PM (Physics)',
          type: 'QUICK_REPLY',
          payload: 'Confirmed! Your Physics Mechanics trial session with Dr. Sharma is scheduled for Friday 5:00 PM. Classroom link sent.'
        },
        {
          id: 'btn-302',
          title: 'Sat 11AM (Chemistry)',
          type: 'QUICK_REPLY',
          payload: 'Confirmed! Your Chemistry Organic trial session is scheduled for Saturday 11:00 AM. Study sheets emailed.'
        },
        {
          id: 'btn-303',
          title: 'Reschedule Trial',
          type: 'QUICK_REPLY',
          payload: 'No worries! Our counsellor Priya will WhatsApp you alternate demo timings.'
        }
      ],
      actions: ['set_status:DEMO_BOOKED', 'notify_agent'],
      priority: 3,
      enabled: true,
      executionsCount: 1840,
    },
    {
      id: 'rule-04',
      name: 'Fee Enquiry',
      description: 'Send transparent fee structure for all batches with brochure link',
      trigger: 'FEE_QUERY',
      keywords: ['fee', 'fees', 'charges', 'cost', 'kitni fees hai', 'kitna lagega'],
      headerText: '💳 Transparent Fee Schedule (2026-27)',
      replyMessage: 'Prakash Institute Fee Structure:\n• JEE Dropper Target: ₹45,000 / year (includes books & test series)\n• NEET Comprehensive: ₹55,000 / year\n• Class 11 Foundation: ₹35,000 / year\n*Scholarship up to 40% available based on test performance.',
      footerText: '0% EMI Installments available on ICICI & HDFC cards',
      buttons: [
        {
          id: 'btn-401',
          title: '📥 Fee Breakdown PDF',
          type: 'URL',
          url: 'https://prakashinstitute.edu.in/fees.pdf',
          payload: 'Download complete installment schedule & fee breakdown PDF at https://prakashinstitute.edu.in/fees.pdf'
        },
        {
          id: 'btn-402',
          title: '🎟️ Book Demo',
          type: 'QUICK_REPLY',
          payload: 'Attend our free demo class first before paying any fees! Reply with your grade (11th, 12th or Dropper).'
        },
        {
          id: 'btn-403',
          title: '📞 Talk to Accounts',
          type: 'CALL',
          phoneNumber: '+91 98765 43210',
          payload: 'Calling accounts helpline: +91 98765 43210'
        }
      ],
      actions: ['assign_tag:Fee Sent'],
      priority: 4,
      enabled: true,
      executionsCount: 2490,
    },
    {
      id: 'rule-05',
      name: 'After Demo Follow Up',
      description: 'Follow up sequence (3 messages) after student attends demo',
      trigger: 'KEYWORD',
      keywords: ['demo attended', 'feedback'],
      headerText: '🎉 Early Bird Admission Offer',
      replyMessage: 'Hi! Hope you enjoyed yesterday’s demo session. Our admissions counsellor is offering an exclusive early-bird admission discount of ₹5,000 valid for the next 48 hours. Would you like to reserve your seat?',
      footerText: 'Offer expires in 48 hours',
      buttons: [
        {
          id: 'btn-501',
          title: '✅ Claim ₹5000 Off',
          type: 'QUICK_REPLY',
          payload: 'Great! Voucher code EARLYBIRD5K has been applied to your admission dossier. Counsellor Sumit will contact you to finalize seat allocation.'
        },
        {
          id: 'btn-502',
          title: '💬 Ask Faculty Doubt',
          type: 'QUICK_REPLY',
          payload: 'Connecting you with Dr. Sharma for any academic queries regarding the batch curriculum.'
        }
      ],
      actions: ['start_sequence:demo_nurture'],
      priority: 5,
      enabled: true,
      executionsCount: 620,
    },
  ];

  knowledgeItems: KnowledgeItem[] = [
    {
      id: 'ki-01',
      type: 'course',
      title: 'JEE Main & Advanced Dropper Batch',
      content: 'Complete 1-year rigorous classroom program with daily 4 hours lectures, DPPs, weekly testing, and personalized doubt sessions by ex-IITians.',
      fees: '₹45,000 per year',
      batches: 'Morning (8:30 AM - 1:00 PM) & Evening (3:30 PM - 8:00 PM)',
      active: true,
    },
    {
      id: 'ki-02',
      type: 'course',
      title: 'NEET Medical Regular Classroom',
      content: 'Specialized medical entrance training covering NCERT line-by-line, Physics problem-solving drills, and AIIMS standard mock exams.',
      fees: '₹55,000 per year',
      batches: 'Daily 4:00 PM - 7:30 PM',
      active: true,
    },
    {
      id: 'ki-03',
      type: 'faq',
      title: 'Hostel and Mess Facilities',
      content: 'Tie-ups with vetted AC and non-AC hostels within 200m radius of campus. Hygienic vegetarian food, 24/7 security, CCTV, and biometric access.',
      fees: '₹7,500 / month (including food & lodging)',
      batches: 'Separate boys and girls hostels',
      active: true,
    },
    {
      id: 'ki-04',
      type: 'policy',
      title: 'Scholarship Admission Test (PSAT)',
      content: 'Conducted every Sunday. Students scoring >85% receive up to 40% waiver on tuition fees.',
      active: true,
    },
  ];

  slots: Slot[] = [
    {
      id: 'slot-01',
      title: 'JEE Physics Demo - Mechanics Masterclass',
      startAt: 'Tomorrow, 5:00 PM - 6:00 PM',
      endAt: 'Tomorrow, 6:00 PM',
      capacity: 25,
      bookedCount: 19,
      status: 'AVAILABLE',
    },
    {
      id: 'slot-02',
      title: 'NEET Biology Demo - Cell Biology & Genetics',
      startAt: 'Saturday, 11:00 AM - 12:15 PM',
      endAt: 'Saturday, 12:15 PM',
      capacity: 30,
      bookedCount: 28,
      status: 'AVAILABLE',
    },
    {
      id: 'slot-03',
      title: '1-on-1 Academic Counselling with Director',
      startAt: 'Sunday, 3:00 PM - 4:00 PM',
      endAt: 'Sunday, 4:00 PM',
      capacity: 5,
      bookedCount: 5,
      status: 'FULL',
    },
  ];

  appointments: Appointment[] = [
    {
      id: 'app-01',
      slotId: 'slot-01',
      contactId: 'ct-02',
      contactName: 'Pooja Sharma',
      phone: '+91 98223 45678',
      course: 'NEET Foundation',
      startAt: 'Tomorrow, 5:00 PM',
      status: 'CONFIRMED',
      reminderState: 'PENDING',
    },
    {
      id: 'app-02',
      slotId: 'slot-02',
      contactId: 'ct-05',
      contactName: 'Vikash Bansal',
      phone: '+91 98556 78901',
      course: 'JEE Foundation',
      startAt: 'Saturday, 11:00 AM',
      status: 'CONFIRMED',
      reminderState: 'SENT',
    },
  ];

  addMessage(
    conversationId: string, 
    body: string, 
    senderType: 'student' | 'agent' | 'bot' | 'system' = 'agent', 
    status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' = 'SENT',
    providerMessageId?: string,
    senderName?: string
  ): Message {
    const defaultSender = senderType === 'bot' 
      ? '🤖 AutoMask AI Bot' 
      : senderType === 'student' 
        ? undefined 
        : 'Dr. Prakash Sharma';

    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      conversationId,
      direction: senderType === 'student' ? 'INBOUND' : 'OUTBOUND',
      body,
      senderType,
      senderName: senderName || defaultSender,
      status,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      providerMessageId,
    };
    if (!this.messages[conversationId]) {
      this.messages[conversationId] = [];
    }
    this.messages[conversationId].push(newMsg);
    
    const conv = this.conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.lastMessage = body;
      conv.lastMessageAt = 'Just now';
    }
    return newMsg;
  }

  addKnowledgeItem(type: any, title: string, content: string, fees?: string, batches?: string): KnowledgeItem {
    const newItem: KnowledgeItem = {
      id: `ki-${Date.now()}`,
      type: type || 'faq',
      title,
      content,
      fees,
      batches,
      active: true,
    };
    this.knowledgeItems.push(newItem);
    return newItem;
  }

  deleteKnowledgeItem(id: string): boolean {
    const idx = this.knowledgeItems.findIndex(k => k.id === id);
    if (idx !== -1) {
      this.knowledgeItems.splice(idx, 1);
      return true;
    }
    return false;
  }

  addLead(contactName: string, phone: string, course: string): Lead {
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      workspaceId: this.workspace.id,
      contactId: `ct-${Date.now()}`,
      contactName,
      phone,
      course,
      classGrade: 'Class 12',
      preferredBatch: 'Regular Batch',
      city: 'Delhi',
      status: 'NEW',
      source: 'Direct WhatsApp',
      score: 75,
      createdAt: 'Just now',
    };
    this.leads.unshift(newLead);
    return newLead;
  }

  bookSlot(slotId: string, studentName: string, phone: string): Appointment {
    const slot = this.slots.find(s => s.id === slotId);
    if (slot) {
      slot.bookedCount += 1;
      if (slot.bookedCount >= slot.capacity) {
        slot.status = 'FULL';
      }
    }
    const newAppt: Appointment = {
      id: `app-${Date.now()}`,
      slotId,
      contactId: `ct-${Date.now()}`,
      contactName: studentName,
      phone,
      course: 'Coaching Demo',
      startAt: slot?.startAt || 'Upcoming Session',
      status: 'CONFIRMED',
      reminderState: 'PENDING',
    };
    this.appointments.unshift(newAppt);
    return newAppt;
  }

  addContact(name: string, phone: string, tags: string[] = [], optInStatus: 'OPTED_IN' | 'OPTED_OUT' = 'OPTED_IN', notes?: string): Contact {
    const newContact: Contact = {
      id: `ct-${Date.now()}`,
      workspaceId: this.workspace.id,
      phone,
      name,
      tags: tags.length > 0 ? tags : ['New Enquiry'],
      optInStatus,
      optInSource: 'Manual Addition',
      notes: notes || 'Added via Contacts CRM',
      createdAt: 'Just now',
    };
    this.contacts.unshift(newContact);
    return newContact;
  }

  toggleContactOptIn(id: string): Contact | null {
    const contact = this.contacts.find(c => c.id === id);
    if (contact) {
      contact.optInStatus = contact.optInStatus === 'OPTED_IN' ? 'OPTED_OUT' : 'OPTED_IN';
      return contact;
    }
    return null;
  }

  deleteContact(id: string): boolean {
    const idx = this.contacts.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.contacts.splice(idx, 1);
      return true;
    }
    return false;
  }

  deleteRule(id: string): boolean {
    const idx = this.rules.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.rules.splice(idx, 1);
      return true;
    }
    return false;
  }

  updateRule(id: string, updates: Partial<AutomationRule>): AutomationRule | null {
    const rule = this.rules.find(r => r.id === id);
    if (rule) {
      Object.assign(rule, updates);
      return rule;
    }
    return null;
  }

  inviteTeamMember(fullName: string, email: string, role: any, customRoleId?: string, permissionOverrides?: any, resourceScope?: any): User {
    const newMember: User = {
      id: `usr-${Date.now()}`,
      email,
      fullName,
      role: role || 'agent',
      customRoleId,
      status: 'ACTIVE',
      permissionOverrides: permissionOverrides || { grants: [], denies: [] },
      resourceScope: resourceScope || { conversations: 'all', whatsappAccounts: 'all' },
      isOnline: true,
      lastActiveAt: new Date().toISOString(),
    };
    this.team.push(newMember);
    this.users[newMember.id] = newMember;
    return newMember;
  }

  deleteTeamMember(id: string): boolean {
    const idx = this.team.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.team.splice(idx, 1);
      delete this.users[id];
      return true;
    }
    return false;
  }

  toggleTeamMemberStatus(id: string): User | null {
    const member = this.team.find(m => m.id === id);
    if (member) {
      member.isOnline = !member.isOnline;
      return member;
    }
    return null;
  }

  setMemberStatus(id: string, status: 'ACTIVE' | 'SUSPENDED'): User | null {
    const member = this.team.find(m => m.id === id);
    if (member) {
      member.status = status;
      if (this.users[id]) {
        this.users[id].status = status;
      }
      return member;
    }
    return null;
  }

  updateMemberPermissions(
    id: string, 
    updates: { 
      role?: any; 
      customRoleId?: string; 
      customRoleName?: string;
      permissionOverrides?: { grants?: string[]; denies?: string[] };
      resourceScope?: { conversations?: 'all' | 'assigned_only'; whatsappAccounts?: 'all' | string[] };
    }
  ): User | null {
    const member = this.team.find(m => m.id === id);
    if (member) {
      if (updates.role) member.role = updates.role;
      if (updates.customRoleId !== undefined) member.customRoleId = updates.customRoleId;
      if (updates.customRoleName !== undefined) member.customRoleName = updates.customRoleName;
      if (updates.permissionOverrides) member.permissionOverrides = updates.permissionOverrides;
      if (updates.resourceScope) member.resourceScope = updates.resourceScope;

      if (this.users[id]) {
        Object.assign(this.users[id], member);
      }
      return member;
    }
    return null;
  }

  updateTeamMember(id: string, updates: any): User | null {
    return this.updateMemberPermissions(id, updates);
  }

  // Custom Roles Management
  createCustomRole(name: string, description: string, permissions: string[]): CustomRole {
    const newRole: CustomRole = {
      id: `role-custom-${Date.now()}`,
      workspaceId: this.workspace.id,
      name,
      key: name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      description,
      isSystem: false,
      permissions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.roles.push(newRole);
    return newRole;
  }

  updateCustomRole(id: string, updates: Partial<CustomRole>): CustomRole | null {
    const role = this.roles.find(r => r.id === id);
    if (role) {
      if (role.isSystem) return null; // Cannot edit system roles
      Object.assign(role, updates, { updatedAt: new Date().toISOString() });
      return role;
    }
    return null;
  }

  deleteCustomRole(id: string): boolean {
    const idx = this.roles.findIndex(r => r.id === id);
    if (idx !== -1) {
      if (this.roles[idx].isSystem) return false; // Cannot delete system roles
      this.roles.splice(idx, 1);
      return true;
    }
    return false;
  }

  // Workflows Management
  createWorkflow(name: string, description: string, nodes: any[] = [], edges: any[] = []): WorkflowDefinition {
    const newWf: WorkflowDefinition = {
      id: `wf-${Date.now()}`,
      workspaceId: this.workspace.id,
      name,
      description,
      status: 'DRAFT',
      version: 1,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.workflows.unshift(newWf);
    return newWf;
  }

  updateWorkflow(id: string, updates: Partial<WorkflowDefinition>): WorkflowDefinition | null {
    const wf = this.workflows.find(w => w.id === id);
    if (wf) {
      Object.assign(wf, updates, { updatedAt: new Date().toISOString() });
      return wf;
    }
    return null;
  }

  publishWorkflow(id: string): WorkflowDefinition | null {
    const wf = this.workflows.find(w => w.id === id);
    if (wf) {
      wf.status = 'PUBLISHED';
      wf.version += 1;
      wf.updatedAt = new Date().toISOString();
      return wf;
    }
    return null;
  }

  deleteWorkflow(id: string): boolean {
    const idx = this.workflows.findIndex(w => w.id === id);
    if (idx !== -1) {
      this.workflows.splice(idx, 1);
      return true;
    }
    return false;
  }

  // Templates Management
  createTemplate(data: Partial<MessageTemplate>): MessageTemplate {
    const newTmpl: MessageTemplate = {
      id: `tmpl-${Date.now()}`,
      workspaceId: this.workspace.id,
      name: data.name || `template_${Date.now()}`,
      category: data.category || 'UTILITY',
      language: data.language || 'en_US',
      headerType: data.headerType || 'NONE',
      headerText: data.headerText,
      bodyText: data.bodyText || '',
      footerText: data.footerText,
      buttons: data.buttons || [],
      variables: data.variables || [],
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.templates.unshift(newTmpl);
    return newTmpl;
  }

  submitTemplateToMeta(id: string): MessageTemplate | null {
    const tmpl = this.templates.find(t => t.id === id);
    if (tmpl) {
      tmpl.status = 'PENDING_APPROVAL';
      tmpl.updatedAt = new Date().toISOString();
      return tmpl;
    }
    return null;
  }

  approveTemplate(id: string): MessageTemplate | null {
    const tmpl = this.templates.find(t => t.id === id);
    if (tmpl) {
      tmpl.status = 'APPROVED';
      tmpl.updatedAt = new Date().toISOString();
      return tmpl;
    }
    return null;
  }

  deleteTemplate(id: string): boolean {
    const idx = this.templates.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.templates.splice(idx, 1);
      return true;
    }
    return false;
  }

  // Broadcasts Management
  createCampaign(data: Partial<BroadcastCampaign>): BroadcastCampaign {
    const newCamp: BroadcastCampaign = {
      id: `camp-${Date.now()}`,
      workspaceId: this.workspace.id,
      name: data.name || `Campaign ${Date.now()}`,
      description: data.description || '',
      templateName: data.templateName || 'batch_admission_open',
      category: data.category || 'UTILITY',
      headerText: data.headerText,
      customMessageText: data.customMessageText,
      footerText: data.footerText,
      buttons: data.buttons || [],
      audienceFilter: data.audienceFilter,
      status: data.scheduledAt ? 'SCHEDULED' : 'QUEUED',
      scheduledAt: data.scheduledAt,
      totalRecipients: data.totalRecipients || 50,
      sentCount: 0,
      deliveredCount: 0,
      readCount: 0,
      failedCount: 0,
      excludedCount: data.excludedCount || 0,
      variableMappings: data.variableMappings || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.campaigns.unshift(newCamp);
    return newCamp;
  }

  cancelCampaign(id: string): BroadcastCampaign | null {
    const camp = this.campaigns.find(c => c.id === id);
    if (camp) {
      camp.status = 'CANCELLED';
      camp.updatedAt = new Date().toISOString();
      return camp;
    }
    return null;
  }

  // Documents Management
  uploadDocument(data: Partial<KnowledgeDocument>): KnowledgeDocument {
    const newDoc: KnowledgeDocument = {
      id: `doc-${Date.now()}`,
      workspaceId: this.workspace.id,
      filename: data.filename || 'document.pdf',
      fileType: (data.fileType as any) || 'pdf',
      fileSize: data.fileSize || 1024000,
      status: 'PROCESSED',
      chunksCount: data.chunksCount || 12,
      metadata: data.metadata || {},
      createdAt: new Date().toISOString(),
    };
    this.documents.unshift(newDoc);
    return newDoc;
  }

  deleteDocument(id: string): boolean {
    const idx = this.documents.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.documents.splice(idx, 1);
      return true;
    }
    return false;
  }
}

export const mockStore = new MockDataStore();
