export type UserRole = 
  | 'owner' 
  | 'admin' 
  | 'manager' 
  | 'agent' 
  | 'analyst' 
  | 'platform_admin' 
  | 'platform_support' 
  | 'platform_billing';

export type PlatformStaffRole = 'platform_admin' | 'platform_support' | 'platform_billing';

export type Permission =
  | 'manage:billing'
  | 'manage:staff'
  | 'manage:whatsapp'
  | 'manage:knowledge'
  | 'manage:rules'
  | 'manage:bookings_config'
  | 'view:inbox'
  | 'read:message_content'
  | 'send:messages'
  | 'assign:conversations'
  | 'manage:leads'
  | 'export:leads'
  | 'view:dashboard'
  | 'view:audit_logs'
  | 'manage:support_grants'
  | 'suspend:tenant';

export interface TenantAccountSummary {
  id: string;
  name: string;
  subdomain?: string;
  category: string;
  timezone: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PROVISIONING';
  planId: string;
  planName: string;
  planRenewAt: string;
  ownerName: string;
  ownerEmail: string;
  memberCount: number;
  wabaConnected: boolean;
  wabaPhoneNumber?: string;
  monthlyMessagesUsed: number;
  monthlyMessagesLimit: number;
  aiRepliesUsed: number;
  aiRepliesLimit: number;
  activeTicketsCount: number;
  suspensionReason?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  createdAt: string;
}

export interface PlatformPlanDefinition {
  id: string;
  name: string;
  priceInr: number;
  maxMembers: number;
  maxExecutions: number;
  maxAiReplies: number;
  maxTemplates: number;
  maxKnowledgeDocuments: number;
  features: string[];
  isActive: boolean;
}

export interface PlatformHealthTelemetry {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  uptimeSeconds: number;
  timestamp: string;
  webhookWorker: {
    status: 'ACTIVE' | 'PAUSED' | 'IDLE';
    processedLastHour: number;
    failureCountLastHour: number;
    failureRatePercent: number;
  };
  queues: {
    inboundQueueDepth: number;
    outboundQueueDepth: number;
    deadLetterQueueCount: number;
    averageProcessingLatencyMs: number;
  };
  metaCloudApi: {
    connectivity: 'CONNECTED' | 'DISCONNECTED';
    averageLatencyMs: number;
    deliverySuccessRatePercent: number;
    rateLimitRemaining: number;
  };
  database: {
    poolStatus: 'HEALTHY' | 'DEGRADED';
    activeConnections: number;
    rlsEnforcementActive: boolean;
  };
}

export interface PlatformSupportTicket {
  id: string;
  workspaceId: string;
  workspaceName: string;
  requesterEmail: string;
  requesterName: string;
  subject: string;
  category: 'TECHNICAL' | 'BILLING' | 'WHATSAPP_API' | 'QUOTA' | 'SUSPENSION_APPEAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assignedTo?: string;
  assignedStaffName?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformAuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: PlatformStaffRole;
  action: string;
  targetType: 'tenant' | 'plan' | 'ticket' | 'support_grant' | 'system';
  targetId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface SupportGrant {
  id: string;
  workspaceId: string;
  grantedByUserId: string;
  targetUserId: string;
  scope: 'read:message_content';
  reason: string;
  createdAt: string;
  expiresAt: string;
  revokedAt?: string | null;
  revokedByUserId?: string | null;
}

export interface AuditLog {
  id: string;
  workspaceId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  target: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  name?: string;
  phone?: string;
  role: UserRole;
  customRoleId?: string;
  customRoleName?: string;
  status?: string; // 'ACTIVE' | 'SUSPENDED' | 'INVITED' | 'OFFLINE' | 'active'
  permissionOverrides?: {
    grants?: string[];
    denies?: string[];
  };
  resourceScope?: {
    conversations?: 'all' | 'assigned_only';
    whatsappAccounts?: 'all' | string[];
  };
  isOnline: boolean;
  avatarUrl?: string;
  lastActiveAt?: string;
}

export interface CustomRole {
  id: string;
  workspaceId: string;
  name: string;
  key: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  data?: { label?: string; [key: string]: any };
  position?: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  label?: string;
}

export interface WorkflowDefinition {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  version: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface TargetAudienceFilter {
  country?: string;
  city?: string;
  region?: string;
  tags?: string[];
  leadStatus?: string[];
  customPhoneNumbers?: string[];
  optInOnly?: boolean;
}

export type BusinessSectorId = 
  | 'ALL'
  | 'GENERAL'
  | 'ECOMMERCE'
  | 'HEALTHCARE'
  | 'REAL_ESTATE'
  | 'HOSPITALITY'
  | 'AUTOMOTIVE'
  | 'EDUCATION'
  | 'FINANCIAL_SERVICES'
  | 'SERVICES';

export interface MessageTemplate {
  id: string;
  workspaceId: string;
  name: string;
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  industry?: BusinessSectorId;
  language: string;
  headerType?: 'NONE' | 'TEXT' | 'IMAGE' | 'DOCUMENT';
  headerText?: string;
  bodyText: string;
  footerText?: string;
  buttons?: InteractiveButton[];
  variables?: string[];
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PAUSED';
  metaTemplateId?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BroadcastCampaign {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  templateId?: string;
  templateName: string;
  wabaAccountId?: string;
  category?: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  industry?: BusinessSectorId;
  headerText?: string;
  customMessageText?: string;
  footerText?: string;
  buttons?: InteractiveButton[];
  audienceFilter?: TargetAudienceFilter;
  status: 'DRAFT' | 'SCHEDULED' | 'QUEUED' | 'SENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  scheduledAt?: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  excludedCount: number;
  variableMappings?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeDocument {
  id: string;
  workspaceId: string;
  filename: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'csv';
  fileSize: number;
  status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  chunksCount: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  category: string;
  industry?: BusinessSectorId;
  businessName?: string;
  customerTerm?: string;
  timezone: string;
  planId: 'free' | 'starter' | 'growth' | 'pro';
  planName: string;
  planRenewAt: string;
}

export interface WhatsAppAccount {
  id: string;
  workspaceId: string;
  displayNumber: string;
  phoneNumberId?: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'RESTRICTED';
  qualityRating: 'GREEN' | 'YELLOW' | 'RED';
  wabaId: string;
}

export type LeadStatus = 
  | 'NEW'
  | 'QUALIFIED'
  | 'INTERESTED'
  | 'DEMO_BOOKED'
  | 'DEMO_ATTENDED'
  | 'ADMITTED'
  | 'LOST';

export interface Contact {
  id: string;
  workspaceId: string;
  phone: string;
  name: string;
  tags: string[];
  optInStatus: 'OPTED_IN' | 'OPTED_OUT';
  optInSource: string;
  city?: string;
  region?: string;
  country?: string;
  state?: string;
  notes?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  workspaceId: string;
  contactId: string;
  contactName: string;
  phone: string;
  course: string;
  classGrade?: string;
  preferredBatch?: string;
  city?: string;
  status: LeadStatus;
  source: string;
  score: number;
  assignedTo?: string;
  notes?: string;
  createdAt: string;
}

export interface InteractiveButton {
  id: string;
  title: string;
  type: 'QUICK_REPLY' | 'URL' | 'CALL' | 'WORKFLOW_STEP';
  payload?: string; // Information delivered when student clicks this button
  url?: string;
  phoneNumber?: string;
  nextStepTitle?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  direction: 'INBOUND' | 'OUTBOUND';
  providerMessageId?: string;
  type: 'text' | 'template' | 'interactive' | 'button';
  body: string;
  headerText?: string;
  footerText?: string;
  buttons?: InteractiveButton[];
  senderType: 'student' | 'bot' | 'agent' | 'system';
  senderName?: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  timestamp: string;
}

export interface Conversation {
  id: string;
  workspaceId: string;
  contactId: string;
  contactName: string;
  phone: string;
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  leadStatus: LeadStatus;
  leadCourse?: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageAt: string;
  takeoverActive: boolean; // True if human counsellor took over
  windowExpiresAt: string; // 24-hr customer service window
  tags: string[];
  assignedTo?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: 'KEYWORD' | 'EXACT_MATCH' | 'DEMO_REQUEST' | 'FEE_QUERY' | string;
  keywords: string[];
  headerText?: string;
  replyMessage: string;
  footerText?: string;
  buttons?: InteractiveButton[];
  actions: string[];
  priority: number;
  enabled: boolean;
  executionsCount: number;
}

export interface KnowledgeItem {
  id: string;
  type: 'course' | 'faq' | 'fee_structure' | 'policy';
  title: string;
  content: string;
  fees?: string;
  batches?: string;
  active: boolean;
}

export interface Slot {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  capacity: number;
  bookedCount: number;
  status: 'AVAILABLE' | 'FULL';
}

export interface Appointment {
  id: string;
  slotId: string;
  contactId: string;
  contactName: string;
  phone: string;
  course: string;
  startAt: string;
  status: 'CONFIRMED' | 'ATTENDED' | 'CANCELLED';
  reminderState: 'PENDING' | 'SENT';
}

export interface UsageQuota {
  aiRepliesUsed: number;
  aiRepliesLimit: number;
  executionsUsed: number;
  executionsLimit: number;
  templateMessagesUsed: number;
  templateMessagesLimit: number;
  teamMembersLimit?: number;
  monthlyActiveStudentsLimit?: number;
}
