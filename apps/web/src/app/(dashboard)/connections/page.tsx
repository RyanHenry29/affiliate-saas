'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { MarketplaceConnectionDTO, MarketplaceName, ConnectionStatus } from '@/lib/types';
import { MARKETPLACE_LABELS } from '@/lib/types';
import { STATUS_COLORS } from '@/lib/types';

const fetcher = (url: string) => api.get(url);

const STATUS_DOT: Record<ConnectionStatus, string> = {
  CONNECTED: 'bg-green-500',
  DISCONNECTED: 'bg-gray-400',
  SYNCING: 'bg-blue-500',
  ERROR: 'bg-red-500',
};

const MARKETPLACES: MarketplaceName[] = Object.keys(MARKETPLACE_LABELS) as MarketplaceName[];

export default function ConnectionsPage() {
  const { data: connections, isLoading, mutate } = useSWR('/connections', fetcher);
  const [connecting, setConnecting] = useState<MarketplaceName | null>(null);
  const [credentials, setCredentials] = useState({ apiKey: '', apiSecret: '', sellerId: '' });
  const [saving, setSaving] = useState(false);

  function getConnection(mp: MarketplaceName): MarketplaceConnectionDTO | undefined {
    return (connections as MarketplaceConnectionDTO[])?.find((c) => c.marketplace === mp);
  }

  async function handleConnect(mp: MarketplaceName) {
    setSaving(true);
    try {
      await api.post('/connections', {
        marketplace: mp,
        ...credentials,
      });
      setConnecting(null);
      setCredentials({ apiKey: '', apiSecret: '', sellerId: '' });
      mutate();
    } catch (err: any) {
      alert(err.message || 'Erro ao conectar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnect(mp: MarketplaceName) {
    const conn = getConnection(mp);
    if (!conn?.id) return;
    if (!confirm(`Desconectar ${MARKETPLACE_LABELS[mp]}?`)) return;
    try {
      await api.delete(`/connections/${conn.id}`);
      mutate();
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Conexões</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MARKETPLACES.map((mp) => {
          const conn = getConnection(mp);
          const status = conn?.status ?? 'DISCONNECTED';

          return (
            <div key={mp} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">{MARKETPLACE_LABELS[mp]}</h3>
                <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[status]}`} />
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[status] || 'text-gray-500 bg-gray-50'}`}>
                  {status === 'CONNECTED' ? 'Conectado' : status === 'SYNCING' ? 'Sincronizando' : status === 'ERROR' ? 'Erro' : 'Desconectado'}
                </span>
              </div>

              {conn?.lastSyncAt && (
                <p className="text-xs text-gray-500">
                  Último sync: {new Date(conn.lastSyncAt).toLocaleString('pt-BR')}
                </p>
              )}

              {conn?.lastError && (
                <p className="text-xs text-red-500 truncate" title={conn.lastError}>{conn.lastError}</p>
              )}

              {connecting === mp ? (
                <form onSubmit={(e) => { e.preventDefault(); handleConnect(mp); }} className="space-y-2">
                  <input
                    placeholder="API Key"
                    type="password"
                    required
                    value={credentials.apiKey}
                    onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
                  />
                  <input
                    placeholder="API Secret"
                    type="password"
                    value={credentials.apiSecret}
                    onChange={(e) => setCredentials({ ...credentials, apiSecret: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
                  />
                  <input
                    placeholder="Seller ID"
                    value={credentials.sellerId}
                    onChange={(e) => setCredentials({ ...credentials, sellerId: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
                  />
                  <div className="flex gap-1">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-medium py-1.5 rounded"
                    >
                      {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConnecting(null)}
                      className="text-xs text-gray-500 hover:text-gray-700 px-2"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : status === 'CONNECTED' ? (
                <button
                  onClick={() => handleDisconnect(mp)}
                  className="w-full text-red-600 hover:bg-red-50 text-xs font-medium py-1.5 rounded border border-red-200 transition-colors"
                >
                  Desconectar
                </button>
              ) : (
                <button
                  onClick={() => setConnecting(mp)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1.5 rounded transition-colors"
                >
                  Conectar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
