'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, CreditCard, QrCode } from 'lucide-react';
import { api } from '@/lib/api';
import {
  type BillingStatus,
  type SubscriptionStatus,
  type PlanConfig,
  PLAN_LABELS,
  STATUS_COLORS,
} from '@/lib/types';
import { PLANS as DEFAULT_PLANS } from '@/lib/plans';
import { Button } from '@/components/ui/button';
import { PixPaymentDialog } from '@/components/pix-payment-dialog';

const fetcher = (url: string) => api.get(url);

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const cls = STATUS_COLORS[status] ?? 'text-muted-foreground bg-muted';
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

function UsageBar({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>{label}</span>
        <span className="font-mono">
          {used.toLocaleString('pt-BR')} / {limit.toLocaleString('pt-BR')}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface PayTarget {
  plan: string;
  amountCents: number;
  title: string;
}

export default function BillingPage() {
  const reduce = useReducedMotion();
  const { data: billing, isLoading, mutate: mutateBilling } = useSWR<BillingStatus>(
    '/billing/status',
    fetcher,
  );
  const { data: invoices, mutate: mutateInvoices } = useSWR<any[]>(
    '/billing/invoices',
    fetcher,
  );
  const { data: remotePlans } = useSWR<PlanConfig[]>('/billing/plans', fetcher);

  const [payTarget, setPayTarget] = useState<PayTarget | null>(null);

  const plans = useMemo(() => {
    if (remotePlans?.length) {
      return remotePlans.map((p) => ({
        tier: p.tier,
        name: p.name,
        priceBRL: p.priceCents / 100,
        features: p.features,
        apiCallsLimit: p.apiCallsLimit,
        dispatchesLimit: p.dispatchesLimit,
        priceCents: p.priceCents,
      }));
    }
    return DEFAULT_PLANS.map((p) => ({
      tier: p.tier,
      name: p.name,
      priceBRL: p.priceBRL,
      features: p.features,
      apiCallsLimit: p.apiCallsLimit,
      dispatchesLimit: p.dispatchesLimit,
      priceCents: Math.round(p.priceBRL * 100),
    }));
  }, [remotePlans]);

  const currentPlan = useMemo(
    () =>
      plans.find((p) => p.tier === billing?.plan) ??
      (billing?.plan ? plans.find((p) => p.tier === billing.plan) : null),
    [plans, billing],
  );

  const isPastDue = billing?.status === 'PAST_DUE' || billing?.status === 'CANCELED';

  function openPayment(tier: string, priceCents: number) {
    const label = PLAN_LABELS[tier as keyof typeof PLAN_LABELS] ?? tier;
    setPayTarget({
      plan: tier,
      amountCents: priceCents,
      title: `Plano ${label}`,
    });
  }

  function handlePaid() {
    mutateBilling();
    mutateInvoices();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">Faturamento</h1>

      {isPastDue && (
        <div className="border border-warning/40 bg-warning/10 rounded-lg p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-warning">
              {billing?.status === 'CANCELED'
                ? 'Plano cancelado'
                : 'Pagamento em atraso'}
            </p>
            <p className="text-sm text-muted-foreground">
              Regularize o pagamento para continuar usando o sistema sem
              interrupção.
            </p>
          </div>
          {currentPlan && (
            <Button
              variant="outline"
              className="shrink-0 border-warning/40 text-warning hover:bg-warning/10 hover:border-warning/60"
              onClick={() =>
                openPayment(currentPlan.tier, currentPlan.priceCents)
              }
            >
              <QrCode className="h-4 w-4 mr-1" />
              Pagar agora
            </Button>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="h-32 bg-muted border border-border rounded-lg animate-pulse" />
      ) : currentPlan && billing ? (
        <div className="surface-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Plano atual
              </p>
              <h2 className="text-xl font-bold text-foreground mt-1">
                {billing.planName ?? currentPlan.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {billing.priceCents > 0
                  ? `R$ ${(billing.priceCents / 100).toFixed(2)} / mês`
                  : ''}
              </p>
            </div>
            <StatusBadge status={billing.status} />
          </div>

          {billing.currentPeriodEnd && (
            <p className="text-xs text-muted-foreground mt-2">
              Renovação em{' '}
              {new Date(billing.currentPeriodEnd).toLocaleDateString('pt-BR')}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <UsageBar
              label="Ofertas processadas"
              used={billing.apiCallsThisMonth}
              limit={billing.apiCallsLimit}
            />
            <UsageBar
              label="Disparos"
              used={billing.dispatchesThisMonth}
              limit={billing.dispatchesLimit}
            />
          </div>

          <div className="mt-5 flex items-center justify-end">
            <Button onClick={() => openPayment(currentPlan.tier, currentPlan.priceCents)}>
              <QrCode className="h-4 w-4 mr-1" />
              Pagar com PIX
            </Button>
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Comparar planos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p, idx) => {
            const isCurrent = billing?.plan === p.tier;
            return (
              <motion.div
                key={p.tier}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: Math.min(idx, 14) * 0.03,
                  duration: 0.2,
                  ease: 'easeOut',
                }}
                className={`surface-card p-5 flex flex-col ${
                  isCurrent ? 'ring-1 ring-primary/40' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{p.name}</h3>
                  {isCurrent && (
                    <span className="text-xs text-primary border border-primary/40 rounded px-2 py-0.5">
                      Atual
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold font-mono text-foreground mt-2">
                  R$ {p.priceBRL.toFixed(2)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /mês
                  </span>
                </p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  disabled={isCurrent}
                  variant={isCurrent ? 'secondary' : 'default'}
                  className="mt-5 w-full"
                  onClick={() => openPayment(p.tier, p.priceCents)}
                >
                  {isCurrent ? 'Plano atual' : 'Trocar plano'}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Histórico de faturas
        </h2>
        {invoices && invoices.length > 0 ? (
          <div className="surface-card overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                  <th className="text-left px-4 py-2.5 font-medium">Data</th>
                  <th className="text-left px-4 py-2.5 font-medium">Descrição</th>
                  <th className="text-left px-4 py-2.5 font-medium">Valor</th>
                  <th className="text-left px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
                  >
                    <td className="px-4 py-2.5 text-foreground font-mono">
                      {new Date(inv.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {inv.description}
                    </td>
                    <td className="px-4 py-2.5 text-foreground font-mono">
                      R$ {(inv.amountCents / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          STATUS_COLORS[inv.status] ??
                          'text-muted-foreground bg-muted'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="surface-card p-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nenhuma fatura emitida ainda. O histórico de cobranças aparece
                aqui após o primeiro pagamento.
              </p>
            </div>
          </div>
        )}
      </div>

      <PixPaymentDialog
        open={!!payTarget}
        onOpenChange={(open) => !open && setPayTarget(null)}
        amountCents={payTarget?.amountCents ?? 0}
        plan={payTarget?.plan}
        title={payTarget?.title ?? 'Pagamento via PIX'}
        onPaid={handlePaid}
      />
    </div>
  );
}