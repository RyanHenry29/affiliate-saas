'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { motion, useReducedMotion } from 'framer-motion';
import { Cable, Link2, LockKeyhole, Plug, Unplug } from 'lucide-react';
import { api } from '@/lib/api';
import type { MarketplaceConnectionDTO, MarketplaceName, ConnectionStatus } from '@/lib/types';
import { MARKETPLACE_LABELS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toastError, toastSuccess } from '@/lib/toast';

const fetcher = (url: string) => api.get(url);

const STATUS_DOT: Record<ConnectionStatus, string> = {
  CONNECTED: 'bg-success',
  DISCONNECTED: 'bg-muted-foreground',
  SYNCING: 'bg-primary',
  ERROR: 'bg-destructive',
};

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  CONNECTED: 'Conectado',
  DISCONNECTED: 'Desconectado',
  SYNCING: 'Sincronizando',
  ERROR: 'Erro',
};

const MARKETPLACES: MarketplaceName[] = Object.keys(MARKETPLACE_LABELS) as MarketplaceName[];

export default function ConnectionsPage() {
  const reduce = useReducedMotion();
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
      toastSuccess('Conexão salva');
    } catch (err: any) {
      toastError(err, 'Erro ao conectar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnect(mp: MarketplaceName) {
    const conn = getConnection(mp);
    if (!conn?.id) return;
    if (!confirm(`Desconectar ${MARKETPLACE_LABELS[mp]}?`)) return;
    try {
      await api.connections.delete(conn.id);
      mutate();
      toastSuccess('Conexão removida');
    } catch (err: any) {
      toastError(err);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Conexões</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Credenciais e status dos marketplaces de afiliados integrados
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MARKETPLACES.map((mp, idx) => {
            const conn = getConnection(mp);
            const status: ConnectionStatus = conn?.status ?? 'DISCONNECTED';

            return (
              <motion.div
                key={mp}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx, 14) * 0.03, duration: 0.2, ease: 'easeOut' }}
                className="surface-card surface-hover p-4 space-y-3 flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{MARKETPLACE_LABELS[mp]}</h3>
                  <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                    status === 'CONNECTED'
                      ? 'text-success bg-success/10'
                      : status === 'SYNCING'
                        ? 'text-primary bg-primary/10'
                        : status === 'ERROR'
                          ? 'text-destructive bg-destructive/10'
                          : 'text-muted-foreground bg-muted'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
                    {STATUS_LABEL[status]}
                  </span>
                </div>

                {conn?.lastSyncAt && (
                  <p className="text-xs text-muted-foreground">
                    Último sync:{' '}
                    <span className="font-mono">
                      {new Date(conn.lastSyncAt).toLocaleString('pt-BR')}
                    </span>
                  </p>
                )}

                {conn?.lastError && (
                  <p className="text-xs text-destructive truncate" title={conn.lastError}>
                    {conn.lastError}
                  </p>
                )}

                <div className="mt-auto">
                  {connecting === mp ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleConnect(mp); }} className="space-y-2">
                      <Input
                        placeholder="API Key"
                        type="password"
                        required
                        value={credentials.apiKey}
                        onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                        className="h-8 text-xs"
                      />
                      <Input
                        placeholder="API Secret"
                        type="password"
                        value={credentials.apiSecret}
                        onChange={(e) => setCredentials({ ...credentials, apiSecret: e.target.value })}
                        className="h-8 text-xs"
                      />
                      <Input
                        placeholder="Seller ID"
                        value={credentials.sellerId}
                        onChange={(e) => setCredentials({ ...credentials, sellerId: e.target.value })}
                        className="h-8 text-xs"
                      />
                      <div className="flex gap-2 pt-1">
                        <Button type="submit" size="sm" disabled={saving} className="flex-1">
                          <LockKeyhole className="h-3.5 w-3.5" />
                          {saving ? 'Salvando...' : 'Salvar'}
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => setConnecting(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  ) : status === 'CONNECTED' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50 hover:bg-destructive/10"
                      onClick={() => handleDisconnect(mp)}
                    >
                      <Unplug className="h-3.5 w-3.5" />
                      Desconectar
                    </Button>
                  ) : (
                    <Button size="sm" className="w-full" onClick={() => setConnecting(mp)}>
                      <Plug className="h-3.5 w-3.5" />
                      Conectar
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="surface-card p-4 flex items-start gap-3 text-sm">
        <Cable className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-muted-foreground">
          A v1 integra apenas marketplaces com API oficial de afiliados
          (Shopee, Amazon, AliExpress, AWIN). Mercado Livre via scraping não é
          suportado.
        </p>
      </div>
    </div>
  );
}