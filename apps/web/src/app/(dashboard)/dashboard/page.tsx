'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import useSWR, { useSWRConfig } from 'swr';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  Clock,
  MessageSquare,
  Radio,
  RefreshCw,
  Tag,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
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
  { ssr: false, loading: () => <div className="h-60 animate-pulse rounded-xl bg-secondary/50" /> },
);

const fetcher = (url: string) => api.get(url);

// Timestamp relativo (sem dependência externa)
function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'agora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

// Ícone por tipo de atividade
function ActivityIcon({ action }: { action: string }) {
  const lower = action.toLowerCase();
  if (lower.includes('publish') || lower.includes('offer')) return <Tag className="h-3.5 w-3.5" />;
  if (lower.includes('message') || lower.includes('send') || lower.includes('dispatch')) return <MessageSquare className="h-3.5 w-3.5" />;
  if (lower.includes('connect')) return <Radio className="h-3.5 w-3.5" />;
  if (lower.includes('login') || lower.includes('auth')) return <Users className="h-3.5 w-3.5" />;
  if (lower.includes('error') || lower.includes('fail')) return <Activity className="h-3.5 w-3.5 text-destructive" />;
  return <Zap className="h-3.5 w-3.5" />;
}

// Cor do ícone por tipo
function activityColor(action: string): string {
  const lower = action.toLowerCase();
  if (lower.includes('error') || lower.includes('fail')) return 'bg-destructive/10 text-destructive';
  if (lower.includes('publish')) return 'bg-success/10 text-success';
  if (lower.includes('connect')) return 'bg-warning/10 text-warning';
  return 'bg-primary/10 text-primary';
}

function KPICard({
  label,
  value,
  loading,
  icon,
  delay,
  trend,
  trendLabel,
}: {
  label: string;
  value: number | string;
  loading: boolean;
  icon: React.ReactNode;
  delay: number;
  trend?: number;
  trendLabel?: string;
}) {
  const reduce = useReducedMotion();
  const [glowing, setGlowing] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value && !loading) {
      setGlowing(true);
      const timer = setTimeout(() => setGlowing(false), 2000);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value, loading]);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(delay, 14) * 0.03, duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'surface-card relative overflow-hidden p-4 transition-all duration-300',
        glowing && 'ring-1 ring-primary/30',
      )}
    >
      {/* Glow effect */}
      <AnimatePresence>
        {glowing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
            {label}
          </p>
          <span className="text-muted-foreground/50">{icon}</span>
        </div>
        <p className="text-2xl font-bold mt-1.5 font-mono text-foreground tabular-nums">
          {loading ? (
            <span className="inline-block w-14 h-7 bg-secondary animate-pulse rounded" />
          ) : typeof value === 'number' ? (
            <CountUp value={value} />
          ) : (
            value
          )}
        </p>
        {trend !== undefined && !loading && (
          <div className="mt-1.5 flex items-center gap-1">
            <span
              className={cn(
                'text-[10px] font-medium',
                trend >= 0 ? 'text-success' : 'text-destructive',
              )}
            >
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
            {trendLabel && (
              <span className="text-[10px] text-muted-foreground">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
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
          <div key={i} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-secondary animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-secondary animate-pulse rounded w-3/4" />
              <div className="h-2 bg-secondary animate-pulse rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className="py-8 text-center">
        <Activity className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">
          Nenhuma atividade ainda.
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Publicações, erros e conexões aparecem aqui em tempo real.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((log, i) => {
        const date = new Date(log.createdAt);
        const initial = (log.action[0] ?? 'A').toUpperCase();
        return (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i, 14) * 0.03, duration: 0.2 }}
            className="flex items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-secondary/30 transition-colors"
          >
            {/* Avatar/ícone */}
            <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold', activityColor(log.action))}>
              <ActivityIcon action={log.action} />
            </div>

            {/* Conteúdo */}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground leading-snug">
                <span className="font-medium">{log.action}</span>
                {log.entity && (
                  <span className="text-muted-foreground">
                    {' '}em {log.entity}
                    {log.entityId ? `#${log.entityId.slice(0, 8)}` : ''}
                  </span>
                )}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {timeAgo(date)}
              </p>
            </div>

            {/* Timestamp exato */}
            <span className="shrink-0 font-mono text-[10px] text-muted-foreground/60 tabular-nums mt-0.5">
              {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

function StatusBanner({ instances }: { instances: MessagingInstance[] }) {
  const connected = instances.filter((i) => i.status === 'CONNECTED').length;
  const total = instances.length;
  const allConnected = connected === total && total > 0;

  if (total === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center justify-between rounded-xl border p-3',
        allConnected
          ? 'border-success/20 bg-success/5'
          : 'border-warning/20 bg-warning/5',
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <span className={cn('h-2.5 w-2.5 rounded-full', allConnected ? 'bg-success' : 'bg-warning')} />
          {allConnected && (
            <span className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-success animate-ping opacity-30" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {allConnected ? 'Sistemas operacionais' : 'Instâncias com problema'}
          </p>
          <p className="text-xs text-muted-foreground">
            {connected}/{total} canais conectados
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {instances.slice(0, 4).map((inst) => (
          <span
            key={inst.id}
            className={cn(
              'h-2 w-2 rounded-full',
              inst.status === 'CONNECTED' ? 'bg-success' : inst.status === 'SYNCING' ? 'bg-warning' : 'bg-destructive',
            )}
            title={`${inst.provider}: ${inst.status}`}
          />
        ))}
      </div>
    </motion.div>
  );
}

function LastOfferCard({ offers }: { offers: OfferNormalized[] }) {
  const lastOffer = offers[0];
  if (!lastOffer) return null;

  const discount =
    lastOffer.originalPriceCents > lastOffer.priceCents
      ? Math.round((1 - lastOffer.priceCents / lastOffer.originalPriceCents) * 100)
      : lastOffer.discountPercent;

  return (
    <div className="surface-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Última oferta capturada
        </h2>
        <span className="flex items-center gap-1 text-[10px] text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Live
        </span>
      </div>
      <div className="flex items-center gap-3">
        {lastOffer.imageUrl ? (
          <img src={lastOffer.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-xs text-muted-foreground">
            —
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">{lastOffer.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">{lastOffer.marketplace}</span>
            <span className="text-xs font-mono text-success font-medium">-{discount}%</span>
          </div>
        </div>
        <span className="font-mono text-sm font-bold text-foreground">
          R$ {(lastOffer.priceCents / 100).toFixed(2)}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { mutate } = useSWRConfig();
  const [refreshing, setRefreshing] = useState(false);
  const { data: billing, isLoading: billingLoading } = useSWR(
    '/billing/status',
    fetcher,
  );
  const { data: offers } = useSWR('/offers', fetcher, { refreshInterval: 10_000 });
  const { data: instances } = useSWR('/messaging/instances', fetcher, {
    refreshInterval: 5_000,
  });
  const { data: auditData, isLoading: auditLoading } = useSWR(
    '/audit',
    fetcher,
    { refreshInterval: 15_000 },
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Operação</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visão geral da sua operação em tempo real
          </p>
        </div>
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

      {/* Status banner */}
      <StatusBanner instances={instanceList} />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Ofertas Hoje"
          value={totalOffers}
          loading={billingLoading}
          icon={<Tag className="h-4 w-4" />}
          delay={0}
          trend={12}
          trendLabel="vs ontem"
        />
        <KPICard
          label="Disparos (mês)"
          value={totalDispatches}
          loading={billingLoading}
          icon={<MessageSquare className="h-4 w-4" />}
          delay={1}
          trend={8}
          trendLabel="vs mês anterior"
        />
        <KPICard
          label="Canais Ativos"
          value={`${activeInstances}/${instanceList.length}`}
          loading={billingLoading}
          icon={<Radio className="h-4 w-4" />}
          delay={2}
        />
        <KPICard
          label="Processadas"
          value={apiCalls}
          loading={billingLoading}
          icon={<Clock className="h-4 w-4" />}
          delay={3}
          trend={-3}
          trendLabel="vs semana passada"
        />
      </div>

      {/* Onboarding hint */}
      {((groups as Group[])?.length ?? 0) === 0 || instanceList.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card flex flex-wrap items-center justify-between gap-3 p-4 border border-primary/10"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Sua operação ainda não está pronta</p>
              <p className="text-xs text-muted-foreground">Conclua a configuração inicial para começar a capturar ofertas.</p>
            </div>
          </div>
          <Button size="sm" asChild>
            <Link href="/onboarding">
              Configurar agora
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </motion.div>
      ) : null}

      {/* Última oferta + Instâncias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LastOfferCard offers={(offers as OfferNormalized[]) ?? []} />

        <div className="surface-card p-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Canais de mensagem
          </h2>
          {instanceList.length === 0 ? (
            <div className="py-6 text-center">
              <Radio className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum canal conectado</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Conecte WhatsApp ou Telegram em{' '}
                <Link href="/messaging" className="text-primary hover:underline">Mensageria</Link>
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
              {instanceList.slice(0, 4).map((inst, i) => (
                <motion.li
                  key={inst.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i, 14) * 0.03, duration: 0.2 }}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2 w-2">
                      <span
                        className={cn(
                          'absolute inline-flex h-full w-full rounded-full opacity-75',
                          inst.status === 'CONNECTED'
                            ? 'bg-success animate-ping'
                            : inst.status === 'SYNCING'
                              ? 'bg-warning'
                              : 'bg-destructive',
                        )}
                      />
                      <span
                        className={cn(
                          'relative inline-flex h-2 w-2 rounded-full',
                          inst.status === 'CONNECTED'
                            ? 'bg-success'
                            : inst.status === 'SYNCING'
                              ? 'bg-warning'
                              : 'bg-destructive',
                        )}
                      />
                    </span>
                    <div>
                      <span className="text-sm font-medium text-foreground capitalize">
                        {inst.provider}
                      </span>
                      <span className="ml-2 text-[10px] text-muted-foreground font-mono">
                        {inst.externalId?.slice(0, 12)}...
                      </span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-medium',
                      inst.status === 'CONNECTED'
                        ? 'bg-success/10 text-success'
                        : inst.status === 'SYNCING'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-destructive/10 text-destructive',
                    )}
                  >
                    {inst.status === 'CONNECTED' ? 'Online' : inst.status === 'SYNCING' ? 'Sync' : 'Offline'}
                  </span>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Gráfico + Atividade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="surface-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Disparos por hora
            </h2>
            <span className="text-[10px] text-muted-foreground">Últimas 24h</span>
          </div>
          {(dispatchStats as any[])?.length ? (
            <DispatchChart data={dispatchStats as any[]} />
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              {dispatchStats === undefined ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Carregando...
                </div>
              ) : (
                'Sem dados de disparos ainda'
              )}
            </div>
          )}
        </div>

        <div className="surface-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Atividade recente
            </h2>
            <Link href="/logs" className="text-[10px] text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <AuditFeed
            items={(auditData as AuditLog[])?.slice(0, 8) ?? []}
            loading={auditLoading}
          />
        </div>
      </div>
    </div>
  );
}
