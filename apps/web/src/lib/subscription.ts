import type { Subscription } from "./types";

export interface PlanInfo {
  id: Subscription["plan"];
  name: string;
  price: string;
  instances: string;
  groups: string;
  dispatchLimit: string;
  highlight?: boolean;
}

export const PLANS: PlanInfo[] = [
  {
    id: "STARTER",
    name: "Iniciante",
    price: "R$ 49/mês",
    instances: "1 número",
    groups: "Até 3 grupos",
    dispatchLimit: "50 disparos/dia",
  },
  {
    id: "PRO",
    name: "Profissional",
    price: "R$ 149/mês",
    instances: "3 números",
    groups: "Grupos ilimitados",
    dispatchLimit: "Disparos ilimitados",
    highlight: true,
  },
  {
    id: "AGENCY",
    name: "Agency",
    price: "R$ 399/mês",
    instances: "Instâncias ilimitadas",
    groups: "Grupos ilimitados",
    dispatchLimit: "API dedicada",
  },
];

export function getMockSubscription(): Subscription {
  return {
    id: "mock-sub-1",
    tenantId: "current",
    plan: "STARTER",
    status: "ACTIVE",
    currentPeriodEnd: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

export interface Invoice {
  id: string;
  date: string;
  description: string;
  amountCents: number;
  status: "PAID" | "OPEN" | "PAST_DUE";
}

export const MOCK_INVOICES: Invoice[] = [
  {
    id: "INV-0012",
    date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Assinatura Iniciante — Mensal",
    amountCents: 4900,
    status: "PAID",
  },
  {
    id: "INV-0011",
    date: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Assinatura Iniciante — Mensal",
    amountCents: 4900,
    status: "PAID",
  },
  {
    id: "INV-0010",
    date: new Date(Date.now() - 78 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Assinatura Iniciante — Mensal",
    amountCents: 4900,
    status: "PAID",
  },
];
