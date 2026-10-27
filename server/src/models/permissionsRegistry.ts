/**
 * AutoMask Centralized Granular Permission Registry
 * Structure: module.resource.action or module.action
 * Compliant with AutoMask Advanced RBAC Specification
 */

export interface PermissionDefinition {
  key: string;
  module: string;
  action: string;
  label: string;
  description: string;
  isHighPrivilege?: boolean;
}

export interface PermissionModuleGroup {
  moduleId: string;
  moduleName: string;
  description: string;
  actions: PermissionDefinition[];
}

// 1. Master Granular Permissions Registry
export const PERMISSIONS_REGISTRY: PermissionModuleGroup[] = [
  {
    moduleId: 'messages',
    moduleName: 'Messaging & Inbox',
    description: 'Shared WhatsApp inbox, real-time customer conversations, notes, and replies',
    actions: [
      { key: 'messages.view', module: 'messages', action: 'view', label: 'View Conversations', description: 'View conversation threads in the inbox' },
      { key: 'messages.send', module: 'messages', action: 'send', label: 'Send Messages', description: 'Initiate outbound WhatsApp messages' },
      { key: 'messages.reply', module: 'messages', action: 'reply', label: 'Reply to Messages', description: 'Reply to existing incoming student conversations' },
      { key: 'messages.assign', module: 'messages', action: 'assign', label: 'Assign Conversations', description: 'Assign conversation to oneself or another counsellor' },
      { key: 'messages.reassign', module: 'messages', action: 'reassign', label: 'Reassign Conversations', description: 'Reassign already-assigned conversations' },
      { key: 'messages.notes', module: 'messages', action: 'notes', label: 'Internal Counsellor Notes', description: 'Add and view private counsellor notes' },
      { key: 'messages.resolve', module: 'messages', action: 'resolve', label: 'Resolve & Close', description: 'Mark student conversation as resolved or closed' },
      { key: 'messages.export', module: 'messages', action: 'export', label: 'Export Chat History', description: 'Export conversation transcripts to CSV/JSON', isHighPrivilege: true },
    ],
  },
  {
    moduleId: 'contacts',
    moduleName: 'Contacts & CRM',
    description: 'Student and parent contact directory, tags, and consent records',
    actions: [
      { key: 'contacts.view', module: 'contacts', action: 'view', label: 'View Contacts', description: 'Browse and search student contacts' },
      { key: 'contacts.create', module: 'contacts', action: 'create', label: 'Create Contacts', description: 'Add individual new student contacts' },
      { key: 'contacts.edit', module: 'contacts', action: 'edit', label: 'Edit Contacts', description: 'Update student contact information and tags' },
      { key: 'contacts.delete', module: 'contacts', action: 'delete', label: 'Delete Contacts', description: 'Remove contacts from workspace', isHighPrivilege: true },
      { key: 'contacts.import', module: 'contacts', action: 'import', label: 'Import Contacts (CSV)', description: 'Bulk upload student lists from CSV' },
      { key: 'contacts.export', module: 'contacts', action: 'export', label: 'Export Contacts (CSV)', description: 'Export student records to CSV', isHighPrivilege: true },
    ],
  },
  {
    moduleId: 'automations',
    moduleName: 'Automation Rules',
    description: 'Keyword-based priority triggers, auto-replies, and quick response flows',
    actions: [
      { key: 'automations.view', module: 'automations', action: 'view', label: 'View Automations', description: 'View configured keyword rules' },
      { key: 'automations.create', module: 'automations', action: 'create', label: 'Create Automations', description: 'Create new automation rules' },
      { key: 'automations.edit', module: 'automations', action: 'edit', label: 'Edit Automations', description: 'Modify trigger keywords and reply messages' },
      { key: 'automations.activate', module: 'automations', action: 'activate', label: 'Toggle/Activate Rules', description: 'Enable or disable live automation rules' },
      { key: 'automations.delete', module: 'automations', action: 'delete', label: 'Delete Automations', description: 'Permanently remove automation rules', isHighPrivilege: true },
    ],
  },
  {
    moduleId: 'workflows',
    moduleName: 'Visual Workflow Builder',
    description: 'Drag-and-drop workflow canvas with conditions, delays, and branch logic',
    actions: [
      { key: 'workflows.view', module: 'workflows', action: 'view', label: 'View Workflows', description: 'View visual workflow diagrams and states' },
      { key: 'workflows.create', module: 'workflows', action: 'create', label: 'Create Workflows', description: 'Build new draft workflow canvases' },
      { key: 'workflows.edit', module: 'workflows', action: 'edit', label: 'Edit Workflows', description: 'Modify canvas nodes, edges, and logic' },
      { key: 'workflows.publish', module: 'workflows', action: 'publish', label: 'Publish Workflows', description: 'Validate and deploy workflows to live production', isHighPrivilege: true },
      { key: 'workflows.delete', module: 'workflows', action: 'delete', label: 'Delete Workflows', description: 'Delete workflow definitions', isHighPrivilege: true },
    ],
  },
  {
    moduleId: 'templates',
    moduleName: 'Message Templates',
    description: 'Meta WhatsApp approved message templates and submission lifecycle',
    actions: [
      { key: 'templates.view', module: 'templates', action: 'view', label: 'View Templates', description: 'Browse approved and pending templates' },
      { key: 'templates.create', module: 'templates', action: 'create', label: 'Create Templates', description: 'Draft new message templates' },
      { key: 'templates.edit', module: 'templates', action: 'edit', label: 'Edit Templates', description: 'Update draft templates and parameters' },
      { key: 'templates.submit_for_approval', module: 'templates', action: 'submit_for_approval', label: 'Submit to Meta', description: 'Submit templates to Meta Cloud API for review' },
      { key: 'templates.delete', module: 'templates', action: 'delete', label: 'Delete Templates', description: 'Delete draft or archived templates', isHighPrivilege: true },
    ],
  },
  {
    moduleId: 'broadcasts',
    moduleName: 'Broadcast Campaigns',
    description: 'Bulk messaging campaigns, scheduled notifications, and audience segments',
    actions: [
      { key: 'broadcasts.view', module: 'broadcasts', action: 'view', label: 'View Broadcasts', description: 'View scheduled and past broadcast campaigns' },
      { key: 'broadcasts.create', module: 'broadcasts', action: 'create', label: 'Create Campaign', description: 'Draft a new broadcast campaign' },
      { key: 'broadcasts.edit', module: 'broadcasts', action: 'edit', label: 'Edit Campaign', description: 'Modify draft campaigns and variable mappings' },
      { key: 'broadcasts.schedule', module: 'broadcasts', action: 'schedule', label: 'Schedule Broadcast', description: 'Set scheduled send time for campaigns' },
      { key: 'broadcasts.send', module: 'broadcasts', action: 'send', label: 'Send / Launch Broadcast', description: 'Trigger execution of bulk message queue', isHighPrivilege: true },
      { key: 'broadcasts.cancel', module: 'broadcasts', action: 'cancel', label: 'Cancel Campaign', description: 'Halt an active or scheduled broadcast' },
    ],
  },
  {
    moduleId: 'knowledge_base',
    moduleName: 'Knowledge Base & Documents',
    description: 'Document uploads (PDF, DOCX, TXT, CSV), text extraction, and grounded RAG chunks',
    actions: [
      { key: 'knowledge_base.view', module: 'knowledge_base', action: 'view', label: 'View Knowledge Items', description: 'View catalogued courses, FAQs, and fees' },
      { key: 'knowledge_base.upload', module: 'knowledge_base', action: 'upload', label: 'Upload Documents', description: 'Upload PDF, DOCX, TXT for vector indexing' },
      { key: 'knowledge_base.edit', module: 'knowledge_base', action: 'edit', label: 'Edit Knowledge', description: 'Update course fees, batch timings, and text' },
      { key: 'knowledge_base.delete', module: 'knowledge_base', action: 'delete', label: 'Delete Knowledge', description: 'Remove documents and vector embeddings', isHighPrivilege: true },
    ],
  },
  {
    moduleId: 'ai_assistant',
    moduleName: 'AI Assistant Configuration',
    description: 'AI model parameters, system persona, confidence thresholds, and guardrails',
    actions: [
      { key: 'ai_assistant.view', module: 'ai_assistant', action: 'view', label: 'View AI Settings', description: 'View AI configuration and guardrails' },
      { key: 'ai_assistant.configure', module: 'ai_assistant', action: 'configure', label: 'Configure AI Persona', description: 'Edit system prompts, language tone, and handoff triggers', isHighPrivilege: true },
    ],
  },
  {
    moduleId: 'bookings',
    moduleName: 'Demo Slots & Scheduler',
    description: 'Classroom trial session slots, student appointment booking, and capacity controls',
    actions: [
      { key: 'bookings.view', module: 'bookings', action: 'view', label: 'View Slots & Bookings', description: 'View demo slots and scheduled student appointments' },
      { key: 'bookings.create_slot', module: 'bookings', action: 'create_slot', label: 'Create Demo Slots', description: 'Add new trial masterclass slots with capacity limits' },
      { key: 'bookings.book_student', module: 'bookings', action: 'book_student', label: 'Schedule Students', description: 'Book students into demo slots' },
    ],
  },
  {
    moduleId: 'integrations',
    moduleName: 'Ecosystem & Cloud Integrations',
    description: 'Meta WhatsApp Cloud API, OpenAI Embeddings, and Webhook dispatching',
    actions: [
      { key: 'integrations.view', module: 'integrations', action: 'view', label: 'View Integrations', description: 'View connection status of external services' },
      { key: 'integrations.connect', module: 'integrations', action: 'connect', label: 'Connect Integration', description: 'Connect new APIs or update credentials', isHighPrivilege: true },
      { key: 'integrations.edit', module: 'integrations', action: 'edit', label: 'Edit Configuration', description: 'Update webhook URLs and verify tokens' },
      { key: 'integrations.disconnect', module: 'integrations', action: 'disconnect', label: 'Disconnect Integration', description: 'Revoke external service access', isHighPrivilege: true },
    ],
  },
  {
    moduleId: 'team',
    moduleName: 'Team & Staff',
    description: 'Employee invitations, access control, staff roster, and availability',
    actions: [
      { key: 'team.view', module: 'team', action: 'view', label: 'View Team Members', description: 'Browse staff roster and availability' },
      { key: 'team.invite', module: 'team', action: 'invite', label: 'Invite Employees', description: 'Send email invitations to new team members' },
      { key: 'team.edit', module: 'team', action: 'edit', label: 'Edit Member Details', description: 'Update staff status and assignments' },
      { key: 'team.remove', module: 'team', action: 'remove', label: 'Remove / Deactivate Member', description: 'Revoke workspace access for a team member', isHighPrivilege: true },
    ],
  },
  {
    moduleId: 'roles',
    moduleName: 'Roles & Permissions Editor',
    description: 'Custom role creation, granular permission matrix, and individual overrides',
    actions: [
      { key: 'roles.view', module: 'roles', action: 'view', label: 'View Roles & Matrix', description: 'View system roles and permission matrix' },
      { key: 'roles.create', module: 'roles', action: 'create', label: 'Create Custom Roles', description: 'Create new roles with tailored permissions', isHighPrivilege: true },
      { key: 'roles.edit', module: 'roles', action: 'edit', label: 'Edit Custom Roles', description: 'Modify permissions assigned to custom roles', isHighPrivilege: true },
      { key: 'roles.assign', module: 'roles', action: 'assign', label: 'Assign Roles & Overrides', description: 'Assign roles and grant/deny overrides to employees', isHighPrivilege: true },
    ],
  },
  {
    moduleId: 'analytics',
    moduleName: 'Analytics & Reporting',
    description: 'Messaging quotas, response times, lead conversion rates, and ROI',
    actions: [
      { key: 'analytics.view', module: 'analytics', action: 'view', label: 'View Analytics', description: 'View dashboard metrics and quota usage charts' },
      { key: 'analytics.export', module: 'analytics', action: 'export', label: 'Export Reports', description: 'Download analytics reports as CSV/PDF' },
    ],
  },
  {
    moduleId: 'settings',
    moduleName: 'Workspace Settings',
    description: 'Institute branding, business hours, timezone, and phone profile',
    actions: [
      { key: 'settings.view', module: 'settings', action: 'view', label: 'View Settings', description: 'View general workspace information' },
      { key: 'settings.edit', module: 'settings', action: 'edit', label: 'Edit Settings', description: 'Update business hours and contact metadata' },
      { key: 'settings.suspend_tenant', module: 'settings', action: 'suspend_tenant', label: 'Suspend Tenant Workspace', description: 'Platform Admin action to suspend delinquent tenants', isHighPrivilege: true },
    ],
  },
  {
    moduleId: 'billing',
    moduleName: 'Subscription & Billing',
    description: 'Owner-only financial controls: subscription tier, invoices, and payment cards',
    actions: [
      { key: 'billing.view', module: 'billing', action: 'view', label: 'View Billing', description: 'View subscription plans and payment history', isHighPrivilege: true },
      { key: 'billing.manage', module: 'billing', action: 'manage', label: 'Upgrade / Manage Plan', description: 'Upgrade plan, change card, cancel subscription', isHighPrivilege: true },
    ],
  },
  {
    moduleId: 'support_grants',
    moduleName: 'Privacy & Support Grants',
    description: 'Owner-only SRS Line 615 time-boxed support access grants for platform engineers',
    actions: [
      { key: 'support_grants.view', module: 'support_grants', action: 'view', label: 'View Support Grants', description: 'View active and expired support access grants', isHighPrivilege: true },
      { key: 'support_grants.manage', module: 'support_grants', action: 'manage', label: 'Issue / Revoke Support Grants', description: 'Owner-only creation of time-boxed access grants', isHighPrivilege: true },
    ],
  },
  {
    moduleId: 'audit_logs',
    moduleName: 'Audit Logs & Privacy',
    description: 'Immutable security log of role changes, invitations, broadcasts, and support access',
    actions: [
      { key: 'audit_logs.view', module: 'audit_logs', action: 'view', label: 'View Security Audit Logs', description: 'Inspect timestamped actor actions', isHighPrivilege: true },
    ],
  },
];

// Helper to get flat array of all permission keys
export const ALL_PERMISSION_KEYS = PERMISSIONS_REGISTRY.flatMap(g => g.actions.map(a => a.key));

// 2. Default Initial Roles Configuration
export const DEFAULT_SYSTEM_ROLES: Record<string, {
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
}> = {
  owner: {
    name: 'Workspace Owner',
    description: 'Full administrative control over all workspace features, billing, and staff permissions',
    isSystem: true,
    permissions: [...ALL_PERMISSION_KEYS],
  },
  admin: {
    name: 'Workspace Admin',
    description: 'Manages operational workflows, automations, templates, broadcasts, team, and AI',
    isSystem: true,
    permissions: ALL_PERMISSION_KEYS.filter(p => !p.startsWith('billing.') && !p.startsWith('support_grants.') && p !== 'settings.suspend_tenant'),
  },
  manager: {
    name: 'Operations Manager',
    description: 'Supervises counsellors, monitors conversations, schedules broadcasts, and manages demo slots',
    isSystem: true,
    permissions: [
      'messages.view', 'messages.send', 'messages.reply', 'messages.assign', 'messages.reassign', 'messages.notes', 'messages.resolve',
      'contacts.view', 'contacts.create', 'contacts.edit', 'contacts.import',
      'automations.view', 'automations.create', 'automations.edit', 'automations.activate',
      'workflows.view',
      'templates.view', 'templates.create', 'templates.submit_for_approval',
      'broadcasts.view', 'broadcasts.create', 'broadcasts.edit', 'broadcasts.schedule', 'broadcasts.send',
      'knowledge_base.view', 'knowledge_base.upload',
      'ai_assistant.view',
      'bookings.view', 'bookings.create_slot', 'bookings.book_student',
      'team.view',
      'analytics.view', 'analytics.export',
      'settings.view',
      'audit_logs.view',
    ],
  },
  agent: {
    name: 'Agent / Counsellor',
    description: 'Handles student chats, takes over conversations, updates lead status, and schedules trial demos',
    isSystem: true,
    permissions: [
      'messages.view', 'messages.send', 'messages.reply', 'messages.assign', 'messages.notes', 'messages.resolve',
      'contacts.view', 'contacts.create',
      'bookings.view', 'bookings.book_student',
      'analytics.view',
    ],
  },
  analyst: {
    name: 'Viewer / Analyst',
    description: 'Read-only access to metrics, reports, conversation history, and audit logs',
    isSystem: true,
    permissions: [
      'messages.view',
      'contacts.view',
      'automations.view',
      'workflows.view',
      'templates.view',
      'broadcasts.view',
      'knowledge_base.view',
      'ai_assistant.view',
      'bookings.view',
      'team.view',
      'analytics.view', 'analytics.export',
      'settings.view',
      'audit_logs.view',
    ],
  },
  platform_admin: {
    name: 'Platform Administrator',
    description: 'AutoMask SaaS Operations Super Admin (Message content restricted by SRS Line 615 Support Grants)',
    isSystem: true,
    permissions: [
      'platform:tenants:read',
      'platform:tenants:suspend',
      'platform:tenants:activate',
      'platform:plans:manage',
      'platform:health:view',
      'platform:queues:manage',
      'platform:tickets:manage',
      'platform:support:grant_request',
      'platform:audit:view',
      'analytics.view',
      'settings.view',
      'audit_logs.view',
      'settings.suspend_tenant',
      'messages.view',
    ],
  },
  platform_support: {
    name: 'Platform Support & Reliability',
    description: 'AutoMask Internal Support: monitors queues, delivery errors, handles support tickets',
    isSystem: true,
    permissions: [
      'platform:tenants:read',
      'platform:health:view',
      'platform:queues:manage',
      'platform:tickets:manage',
      'platform:support:grant_request',
      'analytics.view',
      'settings.view',
      'messages.view',
    ],
  },
  platform_billing: {
    name: 'Platform Billing Operations',
    description: 'AutoMask Revenue & Billing Ops: manages subscription tiers and quota limits',
    isSystem: true,
    permissions: [
      'platform:tenants:read',
      'platform:plans:manage',
      'platform:tickets:manage',
      'analytics.view',
      'settings.view',
    ],
  },
};

// 3. Backward-Compatibility Legacy Permission Mapping
// Maps old permissions like 'manage:billing' to granular keys so existing 58 tests pass unchanged.
export const LEGACY_PERMISSION_MAP: Record<string, string[]> = {
  'manage:billing': ['billing.manage', 'billing.view'],
  'manage:staff': ['team.invite', 'team.edit', 'team.remove', 'roles.assign'],
  'manage:whatsapp': ['integrations.connect', 'integrations.edit', 'integrations.disconnect'],
  'manage:knowledge': ['knowledge_base.upload', 'knowledge_base.edit', 'knowledge_base.delete'],
  'manage:rules': ['automations.create', 'automations.edit', 'automations.activate', 'automations.delete'],
  'manage:bookings_config': ['bookings.create_slot'],
  'view:inbox': ['messages.view'],
  'read:message_content': ['messages.view'],
  'send:messages': ['messages.send', 'messages.reply'],
  'assign:conversations': ['messages.assign', 'messages.reassign'],
  'manage:leads': ['contacts.create', 'contacts.edit'],
  'export:leads': ['contacts.export'],
  'view:dashboard': ['analytics.view'],
  'view:audit_logs': ['audit_logs.view'],
  'manage:support_grants': ['support_grants.manage'],
  'suspend:tenant': ['settings.suspend_tenant'],
};

/**
 * Deterministic Permission Evaluation Function
 * Precedence Order:
 * 1. Owner always has full authority.
 * 2. Explicit User Deny always wins (even over role or explicit grant).
 * 3. Explicit User Grant overrides role.
 * 4. Assigned Role (Custom or Default) permissions.
 * 5. Deny by default.
 */
export interface UserPermissionContext {
  id: string;
  role: string;
  customRoleId?: string;
  customRolePermissions?: string[];
  permissionOverrides?: {
    grants?: string[];
    denies?: string[];
  };
  resourceScope?: {
    conversations?: 'all' | 'assigned_only';
    whatsappAccounts?: 'all' | string[];
  };
}

export function evaluateUserPermission(
  user: UserPermissionContext,
  permission: string
): { allowed: boolean; reason?: string } {
  // 1. Owner has absolute workspace authority
  if (user.role === 'owner') {
    return { allowed: true, reason: 'WORKSPACE_OWNER_FULL_AUTHORITY' };
  }

  // Normalize legacy permission if needed
  const targetPermissions = LEGACY_PERMISSION_MAP[permission] || [permission];

  const denies = new Set(user.permissionOverrides?.denies || []);
  const grants = new Set(user.permissionOverrides?.grants || []);

  // 2. Check Explicit Denies (Denies take absolute precedence!)
  for (const p of targetPermissions) {
    if (denies.has(p)) {
      return { allowed: false, reason: `EXPLICIT_USER_DENY: ${p}` };
    }
  }

  // 3. Check Explicit Grants
  for (const p of targetPermissions) {
    if (grants.has(p)) {
      return { allowed: true, reason: `EXPLICIT_USER_GRANT: ${p}` };
    }
  }

  // 4. Check Role Permissions (Custom Role or Default System Role)
  let rolePerms: string[] = [];
  if (user.customRolePermissions && user.customRolePermissions.length > 0) {
    rolePerms = user.customRolePermissions;
  } else if (DEFAULT_SYSTEM_ROLES[user.role]) {
    rolePerms = DEFAULT_SYSTEM_ROLES[user.role].permissions;
  }

  const rolePermSet = new Set(rolePerms);

  // Check if at least one matching granular permission is held
  for (const p of targetPermissions) {
    if (rolePermSet.has(p)) {
      return { allowed: true, reason: `ROLE_PERMISSION_GRANTED: ${user.role} has ${p}` };
    }
  }

  return { allowed: false, reason: `NO_PERMISSION: Role '${user.role}' lacks '${permission}'` };
}
