import { TabType, User, UserRole } from '../types';

export const DEFAULT_ROLE_TABS: Record<UserRole, TabType[]> = {
  owner: [
    'dashboard',
    'inbox',
    'leads',
    'automation',
    'ai',
    'bookings',
    'templates',
    'workflows',
    'contacts',
    'broadcast',
    'analytics',
    'team',
    'roles',
    'integrations',
    'billing',
    'settings',
    'audit_logs'
  ],
  admin: [
    'dashboard',
    'inbox',
    'leads',
    'automation',
    'ai',
    'bookings',
    'templates',
    'workflows',
    'contacts',
    'broadcast',
    'analytics',
    'team',
    'integrations',
    'settings',
    'audit_logs'
  ],
  manager: [
    'dashboard',
    'inbox',
    'leads',
    'automation',
    'ai',
    'bookings',
    'templates',
    'workflows',
    'contacts',
    'broadcast',
    'analytics',
    'team',
    'settings'
  ],
  agent: [
    'dashboard',
    'inbox',
    'leads',
    'contacts'
  ],
  analyst: [
    'dashboard',
    'leads',
    'contacts',
    'analytics'
  ],
  platform_admin: [
    'dashboard',
    'audit_logs',
    'settings'
  ],
  platform_support: [
    'dashboard',
    'audit_logs',
    'settings'
  ],
  platform_billing: [
    'dashboard',
    'audit_logs',
    'settings'
  ]
};

export const ALL_WORKSPACE_TABS: Array<{ id: TabType; label: string; description: string }> = [
  { id: 'dashboard', label: 'Dashboard', description: 'WhatsApp Business connectivity, live health & metrics' },
  { id: 'inbox', label: 'Shared Inbox', description: 'Real-time student WhatsApp conversations & 24h window' },
  { id: 'leads', label: 'Leads CRM', description: 'Student pipeline, admissions qualification & courses' },
  { id: 'automation', label: 'Automation Rules', description: 'Keyword matching & priority automated responses' },
  { id: 'ai', label: 'AI Assistant', description: 'Document-driven knowledge base & RAG grounded answers' },
  { id: 'bookings', label: 'Demo Bookings', description: 'Live slot reservations & capacity-checked calendars' },
  { id: 'templates', label: 'WhatsApp Templates', description: 'Meta Cloud API verified templates & submissions' },
  { id: 'workflows', label: 'Visual Workflows', description: 'Drag-and-drop DAG workflow canvas & simulator' },
  { id: 'contacts', label: 'Contacts CRM', description: 'Student phone directory & opt-in consent tracking' },
  { id: 'broadcast', label: 'Broadcast Campaigns', description: 'Bulk message dispatches with opt-out protection' },
  { id: 'analytics', label: 'Analytics & Reports', description: 'Delivery rates, response times & conversion funnels' },
  { id: 'team', label: 'Team Management', description: 'Counsellor seats & staff roster' },
  { id: 'roles', label: 'Roles & Permissions', description: 'Granular PBAC matrix & member override policies' },
  { id: 'integrations', label: 'Integrations', description: 'Webhooks, Zapier, CRMs & LMS connectivity' },
  { id: 'billing', label: 'Billing & Plan', description: 'Subscription plans, WhatsApp limits & invoices' },
  { id: 'settings', label: 'Settings', description: 'WhatsApp Cloud API credentials & workspace profile' },
  { id: 'audit_logs', label: 'Audit Trail', description: 'Immutable log of administrative & security events' },
];

export function isTabAccessible(tab: TabType, user?: User): boolean {
  if (!user) return true;
  if (user.role === 'owner') return true;

  // If the owner explicitly configured allowedTabs for this user, respect that exact list
  if (user.allowedTabs && Array.isArray(user.allowedTabs)) {
    return user.allowedTabs.includes(tab);
  }

  // Otherwise fallback to default system role tabs
  const defaultAllowed = DEFAULT_ROLE_TABS[user.role] || DEFAULT_ROLE_TABS.agent;
  return defaultAllowed.includes(tab);
}
