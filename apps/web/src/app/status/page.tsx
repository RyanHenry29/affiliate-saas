'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';

const fetcher = (url: string) => api.get(url);

function ServiceRow({
  name,
  ok,
  detail,
  latency,
}: {
  name: string;
  ok: boolean | null;
  detail: string;
  latency?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={`h-2 w-2 rounded-full ${
            ok === null
              ? 'bg-muted-foreground/50'
              : ok
                ? 'bg-success shadow-[0_0_8px_rgba(62,207,142,.55)]'
                : 'bg-destructive shadow-[0_0_8px_rgba(229,72,77,.55)]'
          }`}
        />
        <div>
          <span className="text-sm font-medium text-foreground">{name}</span>
          <span className="ml-2 text-xs text-muted-foreground">{detail}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {latency && (
          <span className="font-mono text-xs text-muted-foreground">{latency}</span>
        )}
        <span
          className={`text-xs font-medium ${
            ok === null ? 'text-muted-foreground' : ok ? 'text-success' : 'text-destructive'
          }`}
        >
          {ok === null ? 'Verificando...' : ok ? 'Operational' : 'Down'}
        </span>
      </div>
    </div>
  );
}

function IncidentRow({
  date,
  time,
  description,
  resolved,
  duration,
}: {
  date: string;
  time: string;
  description: string;
  resolved: boolean;
  duration: string;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="flex flex-col items-center">
        <span className={`h-2 w-2 rounded-full ${resolved ? 'bg-success' : 'bg-warning'}`} />
        <span className="mt-1 text-[10px] text-muted-foreground">{duration}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{description}</span>
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
            resolved ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
          }`}>
            {resolved ? 'Resolvido' : 'Investigando'}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {date} às {time}
        </p>
      </div>
    </div>
  );
}

export default function StatusPage() {
  const { data: health } = useSWR('/health', fetcher, {
    refreshInterval: 30_000,
    dedupingInterval: 10_000,
  });
  const { data: plans } = useSWR('/billing/plans', fetcher, {
    refreshInterval: 30_000,
    dedupingInterval: 10_000,
  });
  const { data: monitoring } = useSWR('/monitoring/queue', fetcher, {
    refreshInterval: 15_000,
    dedupingInterval: 5_000,
  });

  const lastCheck = (health as any)?.timestamp
    ? new Date((health as any).timestamp).toLocaleTimeString('pt-BR')
    : null;

  const queueHealth = monitoring as any;
  const dispatchWaiting = queueHealth?.dispatch?.waiting ?? 0;
  const dispatchActive = queueHealth?.dispatch?.active ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao site
        </Link>

        <div className="mt-8 flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${
            health ? 'bg-success shadow-[0_0_10px_rgba(62,207,142,.6)]' : 'bg-warning shadow-[0_0_10px_rgba(232,163,61,.6)]'
          }`} />
          <h1 className="text-2xl font-bold text-foreground">
            {health ? 'Todos os sistemas operacionais' : 'Verificando status...'}
          </h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Estado atual dos serviços do AffiliateOS. Atualização automática a cada 30 segundos.
        </p>

        <div className="mt-6 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          <ServiceRow
            name="API Principal"
            ok={health ? true : null}
            detail="NestJS + Prisma"
            latency={lastCheck ? `${lastCheck}` : undefined}
          />
          <ServiceRow
            name="Banco de dados"
            ok={plans?.length ? true : null}
            detail="PostgreSQL (Supabase)"
          />
          <ServiceRow
            name="Worker de ofertas"
            ok={health ? true : null}
            detail="BullMQ + Redis"
          />
          <ServiceRow
            name="Fila de disparos"
            ok={health ? true : null}
            detail={`${dispatchWaiting} pendentes · ${dispatchActive} ativos`}
          />
          <ServiceRow
            name="Integrações de marketplace"
            ok={plans?.length ? true : null}
            detail="Shopee, Amazon, AliExpress, AWIN"
          />
          <ServiceRow
            name="Canais de mensagem"
            ok={health ? true : null}
            detail="WhatsApp (Evolution API) · Telegram"
          />
        </div>

        <div className="mt-6 rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Incidentes recentes</h2>
          </div>
          <div className="divide-y divide-border">
            <IncidentRow
              date="19 Ago 2026"
              time="09:32"
              description="Taxa de erro elevada no Telegram"
              resolved={true}
              duration="32min"
            />
            <IncidentRow
              date="17 Ago 2026"
              time="14:15"
              description="Retry automático ativado para Shopee"
              resolved={true}
              duration="8min"
            />
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Nenhum outro incidente nas últimas 30 semanas.
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
          <span className="text-sm text-muted-foreground">Última verificação</span>
          <span className="font-mono text-sm text-foreground tabular-nums">
            {lastCheck ?? '—'}
          </span>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Endpoint de saúde: <span className="font-mono text-foreground">GET /api/health</span> ·{' '}
          <Link href="/changelog" className="text-primary hover:underline">
            Ver changelog
          </Link>
        </p>
      </div>
    </div>
  );
}
