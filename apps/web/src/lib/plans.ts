import { type PlanTier } from './types';

export interface PlanInfo {
  tier: PlanTier;
  name: string;
  priceBRL: number;
  tagline: string;
  features: string[];
  apiCallsLimit: number;
  dispatchesLimit: number;
}

export const PLANS: PlanInfo[] = [
  {
    tier: 'STARTER',
    name: 'Starter',
    priceBRL: 97,
    tagline: 'Até 3.000 ofertas processadas por mês.',
    features: [
      'Até 3.000 ofertas processadas / mês',
      '1.000 disparos / mês',
      'Shopee + Amazon (APIs oficiais)',
      'WhatsApp e Telegram',
      'Fila com retry e rate limit',
    ],
    apiCallsLimit: 3000,
    dispatchesLimit: 1000,
  },
  {
    tier: 'PRO',
    name: 'Professional',
    priceBRL: 197,
    tagline: 'Até 25.000 ofertas processadas por mês.',
    features: [
      'Até 25.000 ofertas processadas / mês',
      '10.000 disparos / mês',
      'Todos os marketplaces + scoring',
      'Automações ilimitadas',
      'Analytics de conversão',
    ],
    apiCallsLimit: 25000,
    dispatchesLimit: 10000,
  },
  {
    tier: 'AGENCY',
    name: 'Scale',
    priceBRL: 497,
    tagline: 'Até 100.000 ofertas processadas por mês.',
    features: [
      'Até 100.000 ofertas processadas / mês',
      '50.000 disparos / mês',
      'Instâncias ilimitadas',
      'Multi-tenant para agências',
      'Webhooks de API',
    ],
    apiCallsLimit: 100000,
    dispatchesLimit: 50000,
  },
];

export function getPlanInfo(tier: PlanTier): PlanInfo {
  return PLANS.find((p) => p.tier === tier) ?? PLANS[0];
}
