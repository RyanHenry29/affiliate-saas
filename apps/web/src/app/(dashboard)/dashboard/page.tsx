'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { AuditLog, BillingStatus, OfferNormalized, MessagingInstance } from '@/lib/types';

const fetcher = (url: string) => api.get(url);

function KPICard({ label, value, loading }: { label: string; value: number | string; loading: boolean }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1">
        {loading ? <span className="inline-block w-12 h-7 bg-gray-200 animate-pulse rounded" /> : value}
      </p>
    </div>
  );
}

function AuditFeed({ items, loading }: { items: AuditLog[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (!items?.length) {
    return <p className="text-sm text-gray-500">Nenhuma atividade recente.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((log) => (
        <div key={log.id} className="flex items-start gap-3 text-sm">
          <span className="text-gray-400 text-xs whitespace-nowrap mt-0.5">
            {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div>
            <span className="font-medium text-gray-700">{log.action}</span>
            {log.entity && (
              <span className="text-gray-500"> em {log.entity}{log.entityId ? `#${log.entityId.slice(0, 8)}` : ''}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data: billing, isLoading: billingLoading } = useSWR('/billing/status', fetcher);
  const { data: offers } = useSWR('/offers', fetcher);
  const { data: instances } = useSWR('/messaging/instances', fetcher);
  const { data: auditData, isLoading: auditLoading } = useSWR('/audit', fetcher);
  const { data: dispatchStats } = useSWR('/analytics/dispatches-by-hour', fetcher);

  const [ChartComponent, setChartComponent] = useState<any>(null);

  useEffect(() => {
    import('recharts').then((mod) => {
      setChartComponent(() => mod.BarChart || mod.default?.BarChart);
    });
  }, []);

  const totalOffers = (offers as OfferNormalized[])?.length ?? 0;
  const totalDispatches = (billing as BillingStatus)?.dispatchesThisMonth ?? 0;
  const activeInstances = (instances as MessagingInstance[])?.filter((i) => i.status === 'CONNECTED').length ?? 0;
  const apiCalls = (billing as BillingStatus)?.apiCallsThisMonth ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Total Ofertas" value={totalOffers} loading={billingLoading} />
        <KPICard label="Disparos (mês)" value={totalDispatches} loading={billingLoading} />
        <KPICard label="Instâncias Ativas" value={activeInstances} loading={billingLoading} />
        <KPICard label="Chamadas API" value={apiCalls} loading={billingLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Disparos por Hora</h2>
          {ChartComponent && (dispatchStats as any[])?.length ? (
            <ChartComponent data={dispatchStats} width={500} height={250}>
              {/* BarChart children will be set via recharts directly */}
            </ChartComponent>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
              {dispatchStats === undefined ? 'Carregando...' : 'Sem dados disponíveis'}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Atividade Recente</h2>
          <AuditFeed items={(auditData as AuditLog[])?.slice(0, 10) ?? []} loading={auditLoading} />
        </div>
      </div>
    </div>
  );
}
