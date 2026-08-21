import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  hasAnyPermission,
  getRolePermissions,
  canManageTeam,
  canManageBilling,
  canDeleteOffers,
  canManageConnections,
  canManageAutomation,
} from '@/lib/permissions';
import type { Role } from '@/lib/types';

describe('hasPermission', () => {
  it('OWNER has all permissions', () => {
    expect(hasPermission('OWNER', 'offers:read')).toBe(true);
    expect(hasPermission('OWNER', 'offers:delete')).toBe(true);
    expect(hasPermission('OWNER', 'admin:manage')).toBe(true);
    expect(hasPermission('OWNER', 'billing:manage')).toBe(true);
  });

  it('ADMIN_MASTER has all permissions', () => {
    expect(hasPermission('ADMIN_MASTER', 'offers:read')).toBe(true);
    expect(hasPermission('ADMIN_MASTER', 'admin:manage')).toBe(true);
  });

  it('VIEWER has only read permissions', () => {
    expect(hasPermission('VIEWER', 'offers:read')).toBe(true);
    expect(hasPermission('VIEWER', 'offers:create')).toBe(false);
    expect(hasPermission('VIEWER', 'offers:delete')).toBe(false);
    expect(hasPermission('VIEWER', 'admin:manage')).toBe(false);
  });

  it('ANALYST has only read permissions', () => {
    expect(hasPermission('ANALYST', 'offers:read')).toBe(true);
    expect(hasPermission('ANALYST', 'logs:read')).toBe(true);
    expect(hasPermission('ANALYST', 'offers:create')).toBe(false);
  });

  it('MEMBER can create but not delete', () => {
    expect(hasPermission('MEMBER', 'offers:create')).toBe(true);
    expect(hasPermission('MEMBER', 'offers:delete')).toBe(false);
    expect(hasPermission('MEMBER', 'groups:create')).toBe(true);
    expect(hasPermission('MEMBER', 'groups:delete')).toBe(false);
  });

  it('OPERATOR can manage more than MEMBER', () => {
    expect(hasPermission('OPERATOR', 'groups:update')).toBe(true);
    expect(hasPermission('OPERATOR', 'connections:create')).toBe(true);
    expect(hasPermission('OPERATOR', 'connections:delete')).toBe(false);
    expect(hasPermission('MEMBER', 'groups:update')).toBe(false);
  });

  it('returns false for invalid role', () => {
    expect(hasPermission('INVALID' as Role, 'offers:read')).toBe(false);
  });
});

describe('hasAnyPermission', () => {
  it('returns true if role has at least one permission', () => {
    expect(hasAnyPermission('MEMBER', ['offers:delete', 'offers:create'])).toBe(true);
  });

  it('returns false if role has none of the permissions', () => {
    expect(hasAnyPermission('VIEWER', ['offers:create', 'offers:delete'])).toBe(false);
  });
});

describe('getRolePermissions', () => {
  it('returns correct count for each role', () => {
    expect(getRolePermissions('OWNER').length).toBe(29);
    expect(getRolePermissions('ADMIN_MASTER').length).toBe(29);
    expect(getRolePermissions('VIEWER').length).toBe(8);
  });

  it('returns empty array for invalid role', () => {
    expect(getRolePermissions('INVALID' as Role)).toEqual([]);
  });
});

describe('canManageTeam', () => {
  it('OWNER and ADMIN_MASTER can manage team', () => {
    expect(canManageTeam('OWNER')).toBe(true);
    expect(canManageTeam('ADMIN_MASTER')).toBe(true);
  });

  it('OPERATOR, MEMBER, ANALYST, VIEWER cannot', () => {
    expect(canManageTeam('OPERATOR')).toBe(false);
    expect(canManageTeam('MEMBER')).toBe(false);
    expect(canManageTeam('ANALYST')).toBe(false);
    expect(canManageTeam('VIEWER')).toBe(false);
  });
});

describe('canManageBilling', () => {
  it('only OWNER and ADMIN_MASTER', () => {
    expect(canManageBilling('OWNER')).toBe(true);
    expect(canManageBilling('ADMIN_MASTER')).toBe(true);
    expect(canManageBilling('OPERATOR')).toBe(false);
    expect(canManageBilling('MEMBER')).toBe(false);
  });
});

describe('canDeleteOffers', () => {
  it('OWNER and ADMIN_MASTER can delete', () => {
    expect(canDeleteOffers('OWNER')).toBe(true);
    expect(canDeleteOffers('ADMIN_MASTER')).toBe(true);
  });

  it('OPERATOR, MEMBER, ANALYST, VIEWER cannot', () => {
    expect(canDeleteOffers('OPERATOR')).toBe(false);
    expect(canDeleteOffers('MEMBER')).toBe(false);
    expect(canDeleteOffers('ANALYST')).toBe(false);
    expect(canDeleteOffers('VIEWER')).toBe(false);
  });
});

describe('canManageConnections', () => {
  it('OWNER, ADMIN_MASTER, OPERATOR can manage', () => {
    expect(canManageConnections('OWNER')).toBe(true);
    expect(canManageConnections('OPERATOR')).toBe(true);
  });

  it('MEMBER cannot create/update/delete', () => {
    expect(canManageConnections('MEMBER')).toBe(false);
  });
});

describe('canManageAutomation', () => {
  it('OWNER, ADMIN_MASTER, OPERATOR can manage', () => {
    expect(canManageAutomation('OWNER')).toBe(true);
    expect(canManageAutomation('OPERATOR')).toBe(true);
  });

  it('MEMBER can create but not update/delete', () => {
    expect(hasPermission('MEMBER', 'automation:create')).toBe(true);
    expect(hasPermission('MEMBER', 'automation:update')).toBe(false);
    expect(hasPermission('MEMBER', 'automation:delete')).toBe(false);
    expect(canManageAutomation('MEMBER')).toBe(true); // has automation:create
  });
});
