import { Request, Response, NextFunction } from 'express';
import { UserRole, Permission, User, SupportGrant, PlatformStaffRole } from '../models/types';
import { mockStore } from '../models/mockStore';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: User;
      workspaceId?: string;
      supportGrant?: SupportGrant;
      supportGrantActive?: boolean;
    }
  }
}

// Role to Permissions mapping based on SRS Section 3
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    'manage:billing',
    'manage:staff',
    'manage:whatsapp',
    'manage:knowledge',
    'manage:rules',
    'manage:bookings_config',
    'view:inbox',
    'read:message_content',
    'send:messages',
    'assign:conversations',
    'manage:leads',
    'export:leads',
    'view:dashboard',
    'view:audit_logs',
    'manage:support_grants',
  ],
  admin: [
    'manage:staff',
    'manage:whatsapp',
    'manage:knowledge',
    'manage:rules',
    'manage:bookings_config',
    'view:inbox',
    'read:message_content',
    'send:messages',
    'assign:conversations',
    'manage:leads',
    'export:leads',
    'view:dashboard',
    'view:audit_logs',
  ],
  agent: [
    'view:inbox',
    'read:message_content',
    'send:messages',
    'assign:conversations',
    'manage:leads',
    'view:dashboard',
  ],
  platform_admin: [
    'view:dashboard',
    'view:inbox', // Metadata only; message content is strictly guarded by checkMessageContentAccess
    'view:audit_logs',
    'suspend:tenant',
  ],
  manager: [
    'view:inbox',
    'read:message_content',
    'send:messages',
    'assign:conversations',
    'manage:leads',
    'export:leads',
    'view:dashboard',
    'manage:rules',
    'manage:bookings_config',
  ],
  analyst: [
    'view:dashboard',
    'view:audit_logs',
    'manage:leads',
  ],
  platform_support: [
    'view:dashboard',
    'view:audit_logs',
  ],
  platform_billing: [
    'view:dashboard',
    'view:audit_logs',
    'manage:billing',
  ],
};

/**
 * Middleware: Resolves User Context from headers or mockStore
 * Headers:
 * - x-user-id: specific user ID (e.g. usr-owner-01, usr-sumit-01, usr-priya-02, usr-platform-00)
 * - x-user-role: override role for testing/switching
 * - x-workspace-id: target tenant workspace
 */
export const resolveUserContext = (req: Request, res: Response, next: NextFunction) => {
  const userIdHeader = req.headers['x-user-id'] as string;
  const roleHeader = req.headers['x-user-role'] as UserRole;
  const workspaceIdHeader = (req.headers['x-workspace-id'] as string) || mockStore.workspace.id;

  req.workspaceId = workspaceIdHeader;

  // Resolve user from mock store by ID if provided
  if (userIdHeader && mockStore.users[userIdHeader]) {
    req.user = { ...mockStore.users[userIdHeader] };
  } else if (roleHeader && ['owner', 'admin', 'agent', 'platform_admin'].includes(roleHeader)) {
    // If only role header is passed (e.g. from UI role switcher)
    const matchingUser = Object.values(mockStore.users).find(u => u.role === roleHeader);
    if (matchingUser) {
      req.user = { ...matchingUser };
    } else {
      req.user = {
        id: `usr-${roleHeader}-temp`,
        email: `${roleHeader}@prakashinstitute.edu.in`,
        fullName: `${roleHeader.toUpperCase()} User`,
        role: roleHeader,
        isOnline: true,
      };
    }
  } else {
    // Default to current admin user (Sumit)
    req.user = { ...mockStore.currentUser };
  }

  next();
};

import { evaluateUserPermission, UserPermissionContext, DEFAULT_SYSTEM_ROLES } from '../models/permissionsRegistry';

/**
 * Middleware: Deny-by-default permission check supporting:
 * - Granular permissions (module.resource.action)
 * - Legacy permissions (manage:billing, etc.)
 * - Explicit user grants and explicit user denies
 * - Custom workspace roles
 * - Suspended member immediate access revocation
 */
export const requirePermission = (permission: Permission | string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication context required',
      });
    }

    // 1. Check user account suspended state: suspended users are blocked immediately
    if (req.user.status === 'SUSPENDED') {
      return res.status(403).json({
        error: 'Forbidden',
        code: 'ACCOUNT_SUSPENDED',
        message: 'User account is suspended. Access revoked.',
      });
    }

    // 1b. Check workspace/tenant suspended state: if tenant is suspended, block client operations
    if (!req.user.role.startsWith('platform_')) {
      const currentWsId = req.workspaceId || mockStore.workspace.id;
      const targetTenant = mockStore.tenants[currentWsId];
      if (targetTenant && targetTenant.status === 'SUSPENDED') {
        return res.status(403).json({
          error: 'Forbidden',
          code: 'TENANT_SUSPENDED',
          message: 'This business workspace has been suspended by AutoMask platform operations.',
          reason: targetTenant.suspensionReason || 'Account suspended',
        });
      }
    }

    // 2. Fetch custom role permissions if user is assigned to a custom role
    let customRolePermissions: string[] | undefined = undefined;
    if (req.user.customRoleId) {
      const customRole = mockStore.roles.find(r => r.id === req.user?.customRoleId);
      if (customRole) {
        customRolePermissions = customRole.permissions;
      }
    }

    const userCtx: UserPermissionContext = {
      id: req.user.id,
      role: req.user.role,
      customRoleId: req.user.customRoleId,
      customRolePermissions,
      permissionOverrides: req.user.permissionOverrides,
      resourceScope: req.user.resourceScope,
    };

    const evaluation = evaluateUserPermission(userCtx, permission as string);

    if (!evaluation.allowed) {
      // Log failed authorization attempt in immutable audit log
      mockStore.logAudit(
        req.workspaceId || mockStore.workspace.id,
        req.user.id,
        req.user.fullName,
        req.user.role,
        'ACCESS_DENIED',
        String(permission),
        { path: req.originalUrl, method: req.method, requiredPermission: permission, reason: evaluation.reason }
      );

      return res.status(403).json({
        error: 'Forbidden',
        message: `Action denied. ${evaluation.reason}`,
        role: req.user.role,
        requiredPermission: permission,
      });
    }

    next();
  };
};

export const requireGranularPermission = requirePermission;

/**
 * Middleware: Resource scope validator (e.g. assigned_only conversations)
 */
export const validateResourceScope = (resourceType: 'conversations' | 'whatsappAccounts' = 'conversations') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next();
    if (req.user.role === 'owner') return next(); // Owner has full scope

    const scope = req.user.resourceScope;
    if (!scope) return next();

    if (resourceType === 'conversations' && scope.conversations === 'assigned_only') {
      const convId = req.params.id || req.params.convId || req.body?.conversationId;
      if (convId) {
        const conv = mockStore.conversations.find(c => c.id === convId);
        if (conv) {
          const assignee = (conv as any).assignedTo || (conv as any).assigneeId;
          if (assignee !== req.user.id) {
            return res.status(403).json({
              error: 'Forbidden',
              code: 'RESOURCE_SCOPE_RESTRICTED',
              message: 'Access restricted: Conversation is not assigned to you',
            });
          }
        }
      }
    }

    next();
  };
};

/**
 * Middleware: Role check for high-level gate
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Allowed roles: ${allowedRoles.join(', ')}`,
        currentRole: req.user?.role,
      });
    }
    next();
  };
};

export const PLATFORM_ROLES: PlatformStaffRole[] = ['platform_admin', 'platform_support', 'platform_billing'];

/**
 * Middleware: Enforces that the request is made by internal AutoMask platform operations staff.
 * Client workspace users (owner, admin, agent, manager, etc.) are strictly denied with 403 Forbidden.
 */
export const requirePlatformRole = (...allowedRoles: PlatformStaffRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication context required for platform operations',
      });
    }

    if (!PLATFORM_ROLES.includes(req.user.role as PlatformStaffRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        code: 'PLATFORM_ACCESS_DENIED',
        message: 'Access denied: Endpoint restricted exclusively to AutoMask internal platform staff.',
        currentRole: req.user.role,
      });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role as PlatformStaffRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        code: 'PLATFORM_ROLE_INSUFFICIENT',
        message: `Action denied. Required platform staff role: ${allowedRoles.join(' or ')}`,
        currentRole: req.user.role,
      });
    }

    next();
  };
};

/**
 * Middleware: Enforces specific platform permission (e.g. platform:tenants:suspend, platform:plans:manage)
 */
export const requirePlatformPermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication context required for platform operations',
      });
    }

    if (!PLATFORM_ROLES.includes(req.user.role as PlatformStaffRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        code: 'PLATFORM_ACCESS_DENIED',
        message: 'Access denied: Endpoint restricted exclusively to AutoMask internal platform staff.',
        currentRole: req.user.role,
      });
    }

    const userCtx: UserPermissionContext = {
      id: req.user.id,
      role: req.user.role,
      permissionOverrides: req.user.permissionOverrides,
    };

    const evaluation = evaluateUserPermission(userCtx, permission);

    if (!evaluation.allowed) {
      return res.status(403).json({
        error: 'Forbidden',
        code: 'PLATFORM_PERMISSION_DENIED',
        message: `Platform action denied: Required permission '${permission}'. ${evaluation.reason}`,
        role: req.user.role,
        requiredPermission: permission,
      });
    }

    next();
  };
};

/**
 * Critical Privacy Safeguard — SRS Line 615:
 * Platform Admin access to student message content must remain disabled by default.
 * Requires an active, unexpired, unrevoked support grant issued by the workspace Owner.
 */
export const checkMessageContentAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // If normal workspace staff (owner, admin, manager, agent, etc.), allow reading message content
  if (!req.user.role.startsWith('platform_')) {
    return next();
  }

  // If Platform Staff (admin, support, billing), check for explicit, active, unexpired Owner Support Grant
  if (req.user.role.startsWith('platform_')) {
    const targetWorkspace = (req.headers['x-workspace-id'] as string) || req.workspaceId || mockStore.workspace.id;
    const now = new Date();

    const activeGrant = mockStore.supportGrants.find(grant => 
      grant.workspaceId === targetWorkspace &&
      grant.targetUserId === req.user?.id &&
      grant.scope === 'read:message_content' &&
      !grant.revokedAt &&
      new Date(grant.expiresAt) > now
    );

    if (!activeGrant) {
      mockStore.logAudit(
        targetWorkspace,
        req.user.id,
        req.user.fullName,
        req.user.role,
        'PLATFORM_ADMIN_ACCESS_BLOCKED',
        'message_content',
        { reason: 'No active Owner support grant found (SRS Line 615)' }
      );

      return res.status(403).json({
        error: 'PrivacySafeguardViolation',
        code: 'SRS_LINE_615_SUPPORT_GRANT_REQUIRED',
        message: 'Platform Admin access to student message content is disabled by default. An active, time-boxed support grant from the workspace Owner is required.',
        metadataOnlyAllowed: true,
      });
    }

    // Active grant exists! Log audit access and proceed
    req.supportGrant = activeGrant;
    req.supportGrantActive = true;

    mockStore.logAudit(
      targetWorkspace,
      req.user.id,
      req.user.fullName,
      req.user.role,
      'SUPPORT_GRANT_ACCESSED',
      'message_content',
      { grantId: activeGrant.id, expiresAt: activeGrant.expiresAt, reason: activeGrant.reason }
    );

    return next();
  }

  return res.status(403).json({ error: 'Forbidden', message: 'Unauthorized role' });
};
