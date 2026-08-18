export * from '@affiliate-saas/shared-types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  tenantId: string;
  role: string;
  isAdminMaster: boolean;
  tenantName: string;
  workspaces: WorkspaceInfo[];
}

export interface LoginResponse extends AuthTokens {
  user: AuthUserResponse;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
