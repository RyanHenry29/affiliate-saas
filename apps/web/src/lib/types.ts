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
export type InstanceStatus = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'FAILED';
export type Role = 'MEMBER' | 'OWNER' | 'ADMIN_MASTER' | 'OPERATOR' | 'ANALYST' | 'VIEWER';
export type PlanTier = 'STARTER' | 'PRO' | 'AGENCY';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING';

export interface Subscription {
  id: string;
  tenantId: string;
  plan: PlanTier;
  status: SubscriptionStatus;
  currentPeriodEnd: string;
}

export interface PlanConfig {
  tier: PlanTier;
  name: string;
  priceCents: number;
  apiCallsLimit: number;
  dispatchesLimit: number;
  features: string[];
  active: boolean;
  updatedAt?: string;
}

export interface PaymentConfig {
  id: string;
  pixKey: string | null;
  pixMerchantName: string | null;
  pixCity: string | null;
  pixCopiaECola: string | null;
  pixEnabled: boolean;
  pixInstructions: string | null;
}

export interface AdminUser {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  tenant: {
    id: string;
    name: string;
    isAdminMaster: boolean;
  };
}

export interface AdminInvite {
  id: string;
  email: string;
  status: string;
  expiresAt: string | null;
  createdAt: string;
  tenantName: string | null;
}

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
}

export interface LoginResponse extends AuthTokens {
  user: AuthUserResponse;
}

export interface ApiErrorBody {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  tenantId: string;
  role: Role;
  isAdminMaster: boolean;
  tenantName: string;
  subscription?: {
    plan: PlanTier;
    status: SubscriptionStatus;
    currentPeriodEnd: string;
  } | null;
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

export type OfferStatus = 'PENDING' | 'PUBLISHED' | 'IGNORED' | 'FAILED';

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  PENDING: 'Pendente',
  PUBLISHED: 'Publicada',
  IGNORED: 'Ignorada',
  FAILED: 'Com erro',
};

export const OFFER_STATUS_CLS: Record<OfferStatus, string> = {
  PENDING: 'border-warning/30 bg-warning/10 text-warning',
  PUBLISHED: 'border-success/30 bg-success/10 text-success',
  IGNORED: 'border-border bg-secondary/60 text-muted-foreground',
  FAILED: 'border-destructive/30 bg-destructive/10 text-destructive',
};

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
  status: OfferStatus;
  dedupeHash: string;
  scrapedAt: string;
}

export type Offer = OfferNormalized;

export interface Group {
  id: string;
  tenantId: string;
  externalId: string;
  name: string;
  nicheTags: NicheTag[];
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
  currentPeriodEnd: string | null;
  planName: string;
  priceCents: number;
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
  MEMBER: 'Membro',
  OWNER: 'Proprietário',
  ADMIN_MASTER: 'Admin Master',
  OPERATOR: 'Operador',
  ANALYST: 'Analista',
  VIEWER: 'Visualizador',
};

export const ROLE_OPTIONS: Role[] = ['OWNER', 'OPERATOR', 'ANALYST', 'MEMBER', 'VIEWER'];

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
  CONNECTED: 'text-success bg-success/10',
  DISCONNECTED: 'text-muted-foreground bg-muted',
  SYNCING: 'text-primary bg-primary/10',
  ERROR: 'text-destructive bg-destructive/10',
  SENT: 'text-success bg-success/10',
  PENDING: 'text-warning bg-warning/10',
  FAILED: 'text-destructive bg-destructive/10',
  ACTIVE: 'text-success bg-success/10',
  PAST_DUE: 'text-warning bg-warning/10',
  CANCELED: 'text-destructive bg-destructive/10',
  TRIALING: 'text-primary bg-primary/10',
  PAID: 'text-success bg-success/10',
  OPEN: 'text-warning bg-warning/10',
  CONFIRMED: 'text-success bg-success/10',
  ACCEPTED: 'text-success bg-success/10',
};

export const NICHE_TAGS: NicheTag[] = Object.keys(
  NICHE_LABELS,
) as NicheTag[];
