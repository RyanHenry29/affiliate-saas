'use client';

import useSWR from 'swr';
import { Activity, AlertTriangle, MessageCircle, Radio, ShieldAlert } from 'lucide-react';
import { api } from '@/lib/api';
import type { MessagingInstance } from '@/lib/types';

const fetcher = (url: string) => api.get(url);

const STATUS_DOT: Record<string, string> = {
  CONNECTED: 'bg-success',
  DISCONNECTED: 'bg-muted-foreground',
  SYNCING: 'bg-primary',
  ERROR: 'bg-destructive',
};

const STATUS_TEXT: Record<string, string> = {
  CONNECTED: 'text-success',
  DISCONNECTED: 'text-muted-foreground',
  SYNCING: 'text-primary',
  ERROR: 'text-destructive',
};

const STATUS_LABEL: Record<string, string> = {
  CONNECTED: 'Conectada',
  DISCONNECTED: 'Desconectada',
  SYNCING: 'Sincronizando',
  ERROR: 'Erro',
};

function MetricCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="surface-card p-4 flex flex-col items-center gap-1">
      <span className={tone}>{icon}</span>
      <p className="text-2xl font-bold font-mono text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default function MonitoringPage() {
  const { data: instances, isLoading } = useSWR('/messaging/instances', fetcher);
  const { data: queueHealth, isLoading: loadingQueue } = useSWR('/monitoring/queue', fetcher);
  const { data: errors, isLoading: loadingErrors } = useSWR('/monitoring/errors', fetcher);

  const instanceList = (instances as MessagingInstance[]) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Monitoramento</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Saúde das instâncias, fila de disparos e erros em tempo real
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {instanceList.map((inst) => (
          <div
            key={inst.id}
            className="surface-card surface-hover p-4 flex items-center gap-3"
          >
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT[inst.status] || 'bg-muted-foreground'}`} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{inst.externalId}</p>
              <p className="text-xs text-muted-foreground capitalize">{inst.provider}</p>
            </div>
          </div>
        ))}
        {isLoading &&
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        {!isLoading && instanceList.length === 0 && (
          <div className="col-span-full surface-card p-6 text-center text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Nenhuma instância conectada. Crie uma em Mensagens para monitorar.
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="surface-card p-4 lg:col-span-1">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Radio className="h-4 w-4 text-muted-foreground" />
            Saúde da Fila
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {loadingQueue ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="surface-card p-4 flex flex-col items-center gap-1">
                  <div className="h-5 w-8 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                </div>
              ))
            ) : (
              <>
                <MetricCard
                  icon={<AlertTriangle className="h-4 w-4" />}
                  label="Pendentes"
                  value={(queueHealth as any)?.pending ?? 0}
                  tone="text-warning"
                />
                <MetricCard
                  icon={<Activity className="h-4 w-4" />}
                  label="Processados"
                  value={(queueHealth as any)?.processed ?? 0}
                  tone="text-success"
                />
                <MetricCard
                  icon={<ShieldAlert className="h-4 w-4" />}
                  label="Falhas"
                  value={(queueHealth as any)?.failed ?? 0}
                  tone="text-destructive"
                />
              </>
            )}
          </div>
        </div>

        <div className="surface-card p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            Erros Recentes
          </h2>
          {loadingErrors && !(errors as any[])?.length ? (
            <div className="space-y-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          ) : (errors as any[])?.length ? (
            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              {(errors as any[]).map((err: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-md px-2 py-2 text-sm hover:bg-secondary/50 transition-colors"
                >
                  <span className="text-muted-foreground text-xs whitespace-nowrap mt-0.5 font-mono">
                    {new Date(err.timestamp).toLocaleTimeString('pt-BR')}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-destructive">{err.message}</p>
                    {err.context && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{err.context}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhum erro recente</p>
              <p className="text-xs text-muted-foreground/60">
                Falhas de disparo e conexão aparecem aqui em tempo real.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}