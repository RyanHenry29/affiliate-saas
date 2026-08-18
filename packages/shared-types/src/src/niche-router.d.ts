export type NicheTag = 'DONA_DE_CASA' | 'AUTOMOTIVO' | 'ELETRONICOS' | 'MODA' | 'BELEZA' | 'ESPORTES' | 'INFANTIL' | 'PETS' | 'GERAL';
export interface NicheRule {
    tag: NicheTag;
    keywords: string[];
}
export declare const NICHE_RULES: NicheRule[];
export declare class NicheRouter {
    static classify(title: string): NicheTag;
}
//# sourceMappingURL=niche-router.d.ts.map