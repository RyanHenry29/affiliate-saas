import { SetMetadata } from '@nestjs/common';

export type ApiRole =
  | 'MEMBER'
  | 'OWNER'
  | 'ADMIN_MASTER'
  | 'OPERATOR'
  | 'ANALYST'
  | 'VIEWER';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ApiRole[]) => SetMetadata(ROLES_KEY, roles);
