export type TabType = 
  | 'dashboard'
  | 'inbox'
  | 'leads'
  | 'automation'
  | 'ai'
  | 'bookings'
  | 'templates'
  | 'workflows'
  | 'contacts'
  | 'broadcast'
  | 'analytics'
  | 'team'
  | 'roles'
  | 'integrations'
  | 'billing'
  | 'settings'
  | 'audit_logs';

export type LeadStatus = 
  | 'NEW'
  | 'QUALIFIED'
  | 'INTERESTED'
  | 'DEMO_BOOKED'
  | 'DEMO_ATTENDED'
  | 'ADMITTED'
  | 'LOST';

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

export interface User {
  id: string;
  email: string;
  fullName: string;
  name?: string;
  role: UserRole;
  customRoleId?: string | null;
  customRoleName?: string | null;
  isOnline: boolean;
  status?: 'ACTIVE' | 'SUSPENDED';
  avatarUrl?: string;
  assignedConversationsCount?: number;
  allowedTabs?: TabType[];
}

export interface QuickReply {
  id: string;
  keyword: string;
  title: string;
  body: string;
  category?: string;
}

export interface CustomRole {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  color?: string;
  createdAt?: string;
}

export interface UserPermissionOverride {
  permissionKey: string;
  granted: boolean;
}

export interface ResourceAccessScope {
  resourceType: 'conversations' | 'leads' | 'contacts';
  scope: 'all' | 'assigned_only';
}

export interface PermissionItem {
  key: string;
  module: string;
  resource: string;
  action: string;
  description: string;
  isSensitive?: boolean;
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

export interface Workspace {
  id: string;
  name: string;
  category: string;
  industry?: BusinessSectorId;
  businessName?: string;
  customerTerm?: string;
  timezone: string;
  planId: string;
  planName: string;
  planRenewAt: string;
}

export interface WhatsAppAccount {
  id: string;
  workspaceId: string;
  displayNumber: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'RESTRICTED';
  qualityRating: 'GREEN' | 'YELLOW' | 'RED';
  wabaId: string;
}

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

export interface WorkflowStage {
  stage: number;
  name: string;
  description: string;
  enabled: boolean;
  type: string;
  status?: string;
  handledCount: number;
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
  type: 'text' | 'template' | 'interactive';
  body: string;
  headerText?: string;
  footerText?: string;
  buttons?: InteractiveButton[];
  senderType: 'student' | 'bot' | 'agent' | 'system';
  senderName?: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
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
  takeoverActive: boolean;
  windowExpiresAt: string;
  tags: string[];
  assignedToName?: string;
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
  createdAt: string;
  notes?: string;
  assignedToName?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
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
}

// ==========================================
// Advanced Workflow Canvas Types
// ==========================================
export type WorkflowNodeType = 
  | 'TRIGGER'
  | 'SEND_WHATSAPP'
  | 'INTERACTIVE_BUTTONS'
  | 'SEND_TEMPLATE'
  | 'CONDITION'
  | 'DELAY'
  | 'ASSIGN_AGENT'
  | 'ADD_TAG'
  | 'REMOVE_TAG'
  | 'UPDATE_ATTRIBUTE'
  | 'HUMAN_HANDOFF'
  | 'AI_ASSISTANT'
  | 'END';

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  title: string;
  config: Record<string, any>;
  position?: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  conditionValue?: string | boolean;
  label?: string;
}

export interface WorkflowDefinition {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  triggerType: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  status: 'ACTIVE' | 'DRAFT' | 'PAUSED';
  executionsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// WhatsApp Templates & Broadcast Campaigns
// ==========================================
export interface MessageTemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO';
  text?: string;
  buttons?: Array<{
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
    text: string;
    url?: string;
    phone_number?: string;
  }>;
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

export interface MessageTemplate {
  id: string;
  workspaceId: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  industry?: BusinessSectorId;
  language: string;
  components?: MessageTemplateComponent[];
  bodyText?: string;
  headerText?: string;
  footerText?: string;
  buttons?: InteractiveButton[];
  status: 'APPROVED' | 'PENDING' | 'PENDING_APPROVAL' | 'REJECTED' | 'DRAFT';
  metaTemplateId?: string;
  rejectionReason?: string;
  createdAt?: string;
}

export interface BroadcastCampaign {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  templateId?: string;
  templateName?: string;
  category?: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  industry?: BusinessSectorId;
  headerText?: string;
  customMessageText?: string;
  footerText?: string;
  buttons?: InteractiveButton[];
  audienceFilter?: TargetAudienceFilter;
  status: 'DRAFT' | 'SCHEDULED' | 'QUEUED' | 'SENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  totalRecipients: number;
  sentCount?: number;
  deliveredCount: number;
  readCount?: number;
  failedCount: number;
  excludedCount?: number;
  scheduledAt?: string;
  createdAt?: string;
  completedAt?: string;
  updatedAt?: string;
}

// ==========================================
// Multi-Format Knowledge Base & AI Config
// ==========================================
export interface KnowledgeDocument {
  id: string;
  workspaceId: string;
  title: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'csv';
  fileSize: number;
  chunkCount: number;
  status: 'INDEXED' | 'PROCESSING' | 'FAILED';
  createdAt?: string;
}

export interface AIAssistantConfig {
  enabled: boolean;
  systemPrompt: string;
  confidenceThreshold: number;
  temperature: number;
  fallbackMessage: string;
  handoffKeywords: string[];
  ragSettings: {
    matchCount: number;
    minScore: number;
  };
}

// ==========================================
// Audit Logs
// ==========================================
export interface AuditLogItem {
  id: string;
  workspaceId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}

// ==========================================
// Platform Management Console Types
// ==========================================

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

export interface PlatformAuditLogItem {
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

export interface PlatformSupportGrantItem {
  id: string;
  workspaceId: string;
  tenantName: string;
  grantedByUserId: string;
  targetUserId: string;
  scope: string;
  reason: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  isValid: boolean;
  createdAt: string;
  expiresAt: string;
  revokedAt?: string | null;
}
