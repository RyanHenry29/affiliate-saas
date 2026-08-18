export type NicheTag = 'DONA_DE_CASA' | 'AUTOMOTIVO' | 'ELETRONICOS' | 'MODA' | 'BELEZA' | 'ESPORTES' | 'INFANTIL' | 'PETS' | 'GERAL';
export * from './niche-router';
export type MarketplaceName = 'shopee' | 'amazon' | 'aliexpress' | 'awin';
export type DispatchStatus = 'PENDING' | 'SENT' | 'FAILED' | 'RATE_LIMITED';
export interface AuthUser {
    id: string;
    email: string;
    tenantId: string;
    role: 'MEMBER' | 'OWNER' | 'ADMIN_MASTER';
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
//# sourceMappingURL=index.d.ts.map