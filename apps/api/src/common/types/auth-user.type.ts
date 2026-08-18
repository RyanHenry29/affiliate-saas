export interface AuthUser {
  id: string;
  email: string;
  tenantId: string;
  role: string;
  isAdminMaster: boolean;
  name: string;
}
