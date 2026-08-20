'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import useSWR, { useSWRConfig } from 'swr';
import { motion, useReducedMotion } from 'framer-motion';
import { Clock, MessageSquare, Radio, RefreshCw, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import {
  type AuditLog,
  type BillingStatus,
  type Group,
  type OfferNormalized,
  type MessagingInstance,
  STATUS_COLORS,
} from '@/lib/types';
import { CountUp } from '@/components/count-up';
import { Button } from '@/components/ui/button';

const DispatchChart = dynamic(() =>
  import('@/components/dispatch-chart').then((m) => m.DispatchChart),
  { ssr: false, loading: () => <div className="h-60 animate-pulse rounded-md bg-muted" /> },
);

const fetcher = (url: string) => api.get(url);

function KPICard({
  label,
  value,
  loading,
  icon,
  delay,
}: {
  label: string;
  value: number | string;
  loading: boolean;
  icon: React.ReactNode;
  delay: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(delay, 14) * 0.03, duration: 0.2, ease: 'easeOut' }}
      className="surface-card surface-hover p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <span className="text-muted-foreground/70">{icon}</span>
      </div>
      <p className="text-2xl font-bold mt-1 font-mono text-foreground tabular-nums">
        {loading ? (
          <span className="inline-block w-12 h-7 bg-muted animate-pulse rounded" />
        ) : typeof value === 'number' ? (
          <CountUp value={value} />
        ) : (
          value
        )}
      </p>
    </motion.div>
  );
}

function AuditFeed({
  items,
  loading,
}: {
  items: AuditLog[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (!items?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma atividade recente. Os eventos de disparo e erro aparecem aqui em
        tempo real assim que houver movimento.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((log) => (
        <div key={log.id} className="flex items-start gap-3 text-sm">
          <span className="text-muted-foreground text-xs whitespace-nowrap mt-0.5 font-mono">
            {new Date(log.createdAt).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <div>
            <span className="font-medium text-foreground">{log.action}</span>
            {log.entity && (
              <span className="text-muted-foreground">
                em {log.entity}
                {log.entityId ? `#${log.entityId.slice(0, 8)}` : ''}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'CONNECTED'
      ? 'bg-success'
      : status === 'SYNCING'
        ? 'bg-warning'
        : status === 'ERROR'
          ? 'bg-destructive'
          : 'bg-muted-foreground';
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />;
}

export default function DashboardPage() {
  const { mutate } = useSWRConfig();
  const [refreshing, setRefreshing] = useState(false);
  const { data: billing, isLoading: billingLoading } = useSWR(
    '/billing/status',
    fetcher,
  );
  const { data: offers } = useSWR('/offers', fetcher);
  const { data: instances } = useSWR('/messaging/instances', fetcher);
  const { data: auditData, isLoading: auditLoading } = useSWR(
    '/audit',
    fetcher,
  );
  const { data: dispatchStats } = useSWR(
    '/analytics/dispatches-by-hour',
    fetcher,
  );
  const { data: groups } = useSWR('/groups', fetcher, {
    dedupingInterval: 60_000,
    errorRetryCount: 1,
  });

  const totalOffers = (offers as OfferNormalized[])?.length ?? 0;
  const totalDispatches = (billing as BillingStatus)?.dispatchesThisMonth ?? 0;
  const activeInstances =
    (instances as MessagingInstance[])?.filter((i) => i.status === 'CONNECTED')
      .length ?? 0;
  const apiCalls = (billing as BillingStatus)?.apiCallsThisMonth ?? 0;

  const instanceList = (instances as MessagingInstance[]) ?? [];

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await Promise.all([
        mutate('/billing/status'),
        mutate('/offers'),
        mutate('/messaging/instances'),
        mutate('/audit'),
        mutate('/analytics/dispatches-by-hour'),
      ]);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Operação</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')}
          />
          {refreshing ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Total Ofertas"
          value={totalOffers}
          loading={billingLoading}
          icon={<Tag className="h-4 w-4" />}
          delay={0}
        />
        <KPICard
          label="Disparos (mês)"
          value={totalDispatches}
          loading={billingLoading}
          icon={<MessageSquare className="h-4 w-4" />}
          delay={1}
        />
        <KPICard
          label="Instâncias Ativas"
          value={activeInstances}
          loading={billingLoading}
          icon={<Radio className="h-4 w-4" />}
          delay={2}
        />
        <KPICard
          label="Ofertas Processadas"
          value={apiCalls}
          loading={billingLoading}
          icon={<Clock className="h-4 w-4" />}
          delay={3}
        />
      </div>

      {((groups as Group[])?.length ?? 0) === 0 || (instances as MessagingInstance[])?.length === 0 ? (
        <div className="surface-card flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm text-muted-foreground">
            Sua operação ainda não está configurada. Conclua os passos iniciais
            para começar a capturar e publicar ofertas.
          </p>
          <Button size="sm" asChild>
            <Link href="/onboarding">Concluir configuração</Link>
          </Button>
        </div>
      ) : null}

      {instanceList.length === 0 && !billingLoading ? (
        <div className="surface-card p-6 text-sm text-muted-foreground flex items-start gap-3">
          <Radio className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p>
            Nenhuma instância de WhatsApp/Telegram conectada. Conecte uma conta
            em <span className="text-foreground font-medium">Mensagens</span>{' '}
            para começar a monitorar disparos.
          </p>
        </div>
      ) : (
        <div className="surface-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Instâncias
          </h2>
          <ul className="space-y-1">
            {instanceList.slice(0, 5).map((inst, i) => (
              <motion.li
                key={inst.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i, 14) * 0.03, duration: 0.2, ease: 'easeOut' }}
                className="flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-secondary/50 transition-colors"
              >
                <span className="flex items-center gap-2 text-foreground">
                  <StatusDot status={inst.status} />
                  <span className="capitalize">{inst.provider}</span>
                  <span className="text-muted-foreground text-xs font-mono">
                    {inst.externalId}
                  </span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[inst.status] ?? 'text-muted-foreground bg-muted'}`}
                >
                  {inst.status}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="surface-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Disparos por Hora
          </h2>
          {(dispatchStats as any[])?.length ? (
            <DispatchChart data={dispatchStats as any[]} />
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              {dispatchStats === undefined
                ? 'Carregando...'
                : 'Sem dados disponíveis'}
            </div>
          )}
        </div>

        <div className="surface-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Atividade Recente
          </h2>
          <AuditFeed
            items={(auditData as AuditLog[])?.slice(0, 10) ?? []}
            loading={auditLoading}
          />
        </div>
      </div>
    </div>
  );
}
