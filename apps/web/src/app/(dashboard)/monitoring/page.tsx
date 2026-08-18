'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import type { MessagingInstance } from '@/lib/types';

const fetcher = (url: string) => api.get(url);

const STATUS_DOT: Record<string, string> = {
  CONNECTED: 'bg-green-500',
  DISCONNECTED: 'bg-gray-400',
  SYNCING: 'bg-blue-500',
  ERROR: 'bg-red-500',
};

export default function MonitoringPage() {
  const { data: instances, isLoading } = useSWR('/messaging/instances', fetcher);
  const { data: queueHealth } = useSWR('/monitoring/queue', fetcher);
  const { data: errors } = useSWR('/monitoring/errors', fetcher);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Monitoramento</h1>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Status das Instâncias</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
            ))
          ) : (instances as MessagingInstance[])?.length ? (
            (instances as MessagingInstance[]).map((inst) => (
              <div
                key={inst.id}
                className="flex items-center gap-3 border border-gray-100 rounded-lg p-3"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[inst.status] || 'bg-gray-400'}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{inst.externalId}</p>
                  <p className="text-xs text-gray-500 capitalize">{inst.provider}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 col-span-full text-center py-4">Nenhuma instância.</p>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Saúde da Fila</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">
              {(queueHealth as any)?.pending ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Pendentes</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {(queueHealth as any)?.processed ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Processados</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">
              {(queueHealth as any)?.failed ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Falhas</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Erros Recentes</h2>
        {(errors as any[])?.length ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(errors as any[]).map((err: any, idx: number) => (
              <div key={idx} className="flex items-start gap-3 text-sm py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(err.timestamp).toLocaleTimeString('pt-BR')}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-red-600">{err.message}</p>
                  {err.context && <p className="text-xs text-gray-500 mt-0.5">{err.context}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Nenhum erro recente.</p>
        )}
      </div>
    </div>
  );
}
