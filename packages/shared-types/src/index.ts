export type NicheTag =
  | 'DONA_DE_CASA'
  | 'AUTOMOTIVO'
  | 'ELETRONICOS'
  | 'MODA'
  | 'BELEZA'
  | 'ESPORTES'
  | 'INFANTIL'
  | 'PETS'
  | 'GERAL';

export * from './niche-router';

export type MarketplaceName =
  | 'shopee'
  | 'amazon'
  | 'aliexpress'
  | 'awin'
  | 'mercadolivre'
  | 'magalu'
  | 'terabyte'
  | 'kabum';

export type ConnectionStatus =
  | 'DISCONNECTED'
  | 'CONNECTED'
  | 'SYNCING'
  | 'ERROR';

export interface MarketplaceConnectionDTO {
  id: string | null;
  tenantId: string;
  marketplace: MarketplaceName;
  status: ConnectionStatus;
  lastSyncAt: string | null;
  lastError: string | null;
  createdAt: string;
}

export interface ManualOfferInput {
  marketplace: MarketplaceName;
  affiliateUrl: string;
  title?: string;
  priceCents?: number;
  originalPriceCents?: number;
  imageUrl?: string;
  nicheTag?: NicheTag;
}

export type DispatchStatus =
  | 'PENDING'
  | 'SENT'
  | 'FAILED'
  | 'RATE_LIMITED';

export type Role = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'DEV_MEMBER';

export interface AuthUser {
  id: string;
  email: string;
  tenantId: string;
  role: Role;
  isAdminMaster: boolean;
}

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  ORG_ADMIN: 'Admin da Organização',
  DEV_MEMBER: 'Dev Member',
};

export interface WorkspaceInfo {
  id: string;
  name: string;
  role: Role;
  isAdminMaster: boolean;
}

export interface OfferNormalized {
  marketplace: MarketplaceName;
  externalSku: string;
  title: string;
  affiliateUrl: string;
  priceCents: number;
  originalPriceCents: number;
  discountPercent: number;
  rating: number;
  imageUrl?: string;
  nicheTag: NicheTag;
  dedupeHash: string;
}

export interface DispatchJobInput {
  dispatchJobId: string;
  tenantId: string;
  offerId: string;
  groupId: string;
}

export type AiProviderName = 'groq' | 'openai' | 'gemini' | 'ollama' | 'anthropic';

export interface AiProviderCatalog {
  name: AiProviderName;
  label: string;
  baseUrl: string;
  credentialFields: AiCredentialField[];
  defaultModel: string;
  availableModels: string[];
}

export interface AiCredentialField {
  key: string;
  label: string;
  type: 'password' | 'text' | 'url';
  required: boolean;
  placeholder?: string;
}

export interface AiProviderConfigDTO {
  id: string;
  tenantId: string;
  provider: AiProviderName;
  model: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AiGenerateCopyInput {
  title: string;
  priceCents: number;
  affiliateUrl: string;
  nicheTag: string;
  imageUrl?: string;
}

export interface AiGenerateCopyOutput {
  text: string;
  provider: string;
  model: string;
  fallback: boolean;
}
