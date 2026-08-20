import type { Role } from './types';

export type Permission =
  | 'offers:read'
  | 'offers:create'
  | 'offers:publish'
  | 'offers:delete'
  | 'groups:read'
  | 'groups:create'
  | 'groups:update'
  | 'groups:delete'
  | 'messaging:read'
  | 'messaging:send'
  | 'messaging:delete'
  | 'connections:read'
  | 'connections:create'
  | 'connections:update'
  | 'connections:delete'
  | 'automation:read'
  | 'automation:create'
  | 'automation:update'
  | 'automation:delete'
  | 'billing:read'
  | 'billing:manage'
  | 'team:read'
  | 'team:invite'
  | 'team:remove'
  | 'settings:read'
  | 'settings:update'
  | 'logs:read'
  | 'admin:read'
  | 'admin:manage';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: [
    'offers:read', 'offers:create', 'offers:publish', 'offers:delete',
    'groups:read', 'groups:create', 'groups:update', 'groups:delete',
    'messaging:read', 'messaging:send', 'messaging:delete',
    'connections:read', 'connections:create', 'connections:update', 'connections:delete',
    'automation:read', 'automation:create', 'automation:update', 'automation:delete',
    'billing:read', 'billing:manage',
    'team:read', 'team:invite', 'team:remove',
    'settings:read', 'settings:update',
    'logs:read',
    'admin:read', 'admin:manage',
  ],
  ADMIN_MASTER: [
    'offers:read', 'offers:create', 'offers:publish', 'offers:delete',
    'groups:read', 'groups:create', 'groups:update', 'groups:delete',
    'messaging:read', 'messaging:send', 'messaging:delete',
    'connections:read', 'connections:create', 'connections:update', 'connections:delete',
    'automation:read', 'automation:create', 'automation:update', 'automation:delete',
    'billing:read', 'billing:manage',
    'team:read', 'team:invite', 'team:remove',
    'settings:read', 'settings:update',
    'logs:read',
    'admin:read', 'admin:manage',
  ],
  OPERATOR: [
    'offers:read', 'offers:create', 'offers:publish',
    'groups:read', 'groups:create', 'groups:update',
    'messaging:read', 'messaging:send',
    'connections:read', 'connections:create', 'connections:update',
    'automation:read', 'automation:create', 'automation:update',
    'billing:read',
    'team:read',
    'settings:read',
    'logs:read',
  ],
  MEMBER: [
    'offers:read', 'offers:create', 'offers:publish',
    'groups:read', 'groups:create',
    'messaging:read', 'messaging:send',
    'connections:read',
    'automation:read', 'automation:create',
    'billing:read',
    'team:read',
    'settings:read',
    'logs:read',
  ],
  ANALYST: [
    'offers:read',
    'groups:read',
    'messaging:read',
    'connections:read',
    'automation:read',
    'billing:read',
    'team:read',
    'settings:read',
    'logs:read',
  ],
  VIEWER: [
    'offers:read',
    'groups:read',
    'messaging:read',
    'connections:read',
    'automation:read',
    'billing:read',
    'team:read',
    'settings:read',
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function canManageTeam(role: Role): boolean {
  return hasAnyPermission(role, ['team:invite', 'team:remove']);
}

export function canManageBilling(role: Role): boolean {
  return hasPermission(role, 'billing:manage');
}

export function canDeleteOffers(role: Role): boolean {
  return hasPermission(role, 'offers:delete');
}

export function canManageConnections(role: Role): boolean {
  return hasAnyPermission(role, ['connections:create', 'connections:update', 'connections:delete']);
}

export function canManageAutomation(role: Role): boolean {
  return hasAnyPermission(role, ['automation:create', 'automation:update', 'automation:delete']);
}
