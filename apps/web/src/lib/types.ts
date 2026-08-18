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

export type MarketplaceName =
  | 'shopee'
  | 'amazon'
  | 'aliexpress'
  | 'awin'
  | 'mercadolivre'
  | 'magalu'
  | 'terabyte'
  | 'kabum';

export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTED' | 'SYNCING' | 'ERROR';
export type DispatchStatus = 'PENDING' | 'SENT' | 'FAILED' | 'RATE_LIMITED';
export type Role = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'DEV_MEMBER';
export type PlanTier = 'STARTER' | 'PRO' | 'AGENCY';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING';

export interface AuthUser {
  id: string;
  email: string;
  tenantId: string;
  role: Role;
  isAdminMaster: boolean;
  tenantName: string;
}

export interface WorkspaceInfo {
  id: string;
  name: string;
  role: Role;
  isAdminMaster: boolean;
}

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

export interface OfferNormalized {
  id: string;
  marketplace: MarketplaceName;
  externalSku: string;
  title: string;
  affiliateUrl: string;
  imageUrl?: string;
  priceCents: number;
  originalPriceCents: number;
  discountPercent: number;
  rating: number;
  nicheTag: NicheTag;
  dedupeHash: string;
  scrapedAt: string;
}

export interface Group {
  id: string;
  externalId: string;
  name: string;
  nicheTags: string[];
  active: boolean;
}

export interface MessagingInstance {
  id: string;
  provider: string;
  externalId: string;
  status: string;
  createdAt: string;
}

export interface DispatchJob {
  id: string;
  tenantId: string;
  offerId: string;
  groupId: string;
  status: DispatchStatus;
  attempts: number;
  scheduledFor: string;
  createdAt: string;
  sentAt: string | null;
}

export interface AuditLog {
  id: string;
  tenantId: string | null;
  userId: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  metadata: unknown;
  ip: string | null;
  createdAt: string;
}

export interface BillingStatus {
  plan: PlanTier;
  status: SubscriptionStatus;
  currentPeriodEnd: string;
  apiCallsThisMonth: number;
  apiCallsLimit: number;
  dispatchesThisMonth: number;
  dispatchesLimit: number;
}

export interface Tenant {
  id: string;
  name: string;
  isAdminMaster: boolean;
  createdAt: string;
  subscription?: {
    plan: PlanTier;
    status: SubscriptionStatus;
    currentPeriodEnd: string;
  };
  _count?: {
    users: number;
    groups: number;
    connections: number;
  };
}

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  memberships?: Array<{
    tenantId: string;
    role: Role;
    tenant: { name: string };
  }>;
}

export interface Invite {
  id: string;
  email: string;
  role: Role;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export interface ApiKeyInfo {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  createdAt: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

export interface AiProviderName {
  value: string;
}

export type AiProvider = 'groq' | 'openai' | 'gemini' | 'ollama' | 'anthropic';

export interface AiProviderCatalog {
  name: AiProvider;
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
  provider: AiProvider;
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

export interface AutomationRule {
  id: string;
  tenantId: string;
  type: string;
  name: string;
  description: string | null;
  enabled: boolean;
  trigger: string;
  config: unknown;
  createdAt: string;
  updatedAt: string;
}

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  ORG_ADMIN: 'Admin da Organização',
  DEV_MEMBER: 'Dev Member',
};

export const PLAN_LABELS: Record<PlanTier, string> = {
  STARTER: 'Starter',
  PRO: 'Pro',
  AGENCY: 'Agency',
};

export const MARKETPLACE_LABELS: Record<MarketplaceName, string> = {
  shopee: 'Shopee',
  amazon: 'Amazon',
  aliexpress: 'AliExpress',
  awin: 'AWIN',
  mercadolivre: 'Mercado Livre',
  magalu: 'Magazine Luiza',
  terabyte: 'Terabyteshop',
  kabum: 'KaBuM!',
};

export const NICHE_LABELS: Record<NicheTag, string> = {
  DONA_DE_CASA: 'Dona de Casa',
  AUTOMOTIVO: 'Automotivo',
  ELETRONICOS: 'Eletrônicos',
  MODA: 'Moda',
  BELEZA: 'Beleza',
  ESPORTES: 'Esportes',
  INFANTIL: 'Infantil',
  PETS: 'Pets',
  GERAL: 'Geral',
};

export const STATUS_COLORS: Record<string, string> = {
  CONNECTED: 'text-green-600 bg-green-50',
  DISCONNECTED: 'text-gray-500 bg-gray-50',
  SYNCING: 'text-blue-600 bg-blue-50',
  ERROR: 'text-red-600 bg-red-50',
  SENT: 'text-green-600 bg-green-50',
  PENDING: 'text-yellow-600 bg-yellow-50',
  FAILED: 'text-red-600 bg-red-50',
  ACTIVE: 'text-green-600 bg-green-50',
  PAST_DUE: 'text-orange-600 bg-orange-50',
  CANCELED: 'text-red-600 bg-red-50',
  TRIALING: 'text-blue-600 bg-blue-50',
};
