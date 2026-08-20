'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { motion, useReducedMotion, AnimatePresence, type Variants } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Send,
  ShieldAlert,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { MessagingInstance } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toastError, toastSuccess } from '@/lib/toast';

const fetcher = (url: string) => api.get(url);

const PROVIDER_INFO: Record<string, { name: string; desc: string; color: string }> = {
  evolution: { name: 'Evolution API', desc: 'API REST para WhatsApp', color: 'text-success' },
  waha: { name: 'WAHA', desc: 'WhatsApp HTTP API', color: 'text-primary' },
  baileys: { name: 'Baileys', desc: 'WhatsApp Web JS', color: 'text-warning' },
};

const STATUS_INFO: Record<string, { label: string; color: string; dot: string }> = {
  CONNECTED: { label: 'Conectado', color: 'text-success', dot: 'bg-success' },
  DISCONNECTED: { label: 'Desconectado', color: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  SYNCING: { label: 'Sincronizando', color: 'text-primary', dot: 'bg-primary' },
  ERROR: { label: 'Erro', color: 'text-destructive', dot: 'bg-destructive' },
};

export default function MessagingPage() {
  const reduce = useReducedMotion();
  const { data: instances, isLoading, mutate } = useSWR('/messaging/instances', fetcher);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ provider: 'evolution', externalId: '' });
  const [saving, setSaving] = useState(false);

  const instanceList = (instances as MessagingInstance[]) ?? [];
  const connected = instanceList.filter((i) => i.status === 'CONNECTED').length;
  const disconnected = instanceList.filter((i) => i.status === 'DISCONNECTED').length;
  const errored = instanceList.filter((i) => i.status === 'ERROR').length;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/messaging/instances', form);
      setShowForm(false);
      setForm({ provider: 'evolution', externalId: '' });
      mutate();
      toastSuccess('Instância criada com sucesso');
    } catch (err: any) {
      toastError(err, 'Erro ao criar instância');
    } finally {
      setSaving(false);
    }
  }

  async function deleteInstance(id: string) {
    if (!confirm('Tem certeza que deseja remover esta instância?')) return;
    try {
      await api.delete(`/messaging/instances/${id}`);
      mutate();
      toastSuccess('Instância removida');
    } catch (err: any) {
      toastError(err);
    }
  }

  const row: Variants = {
    hidden: { opacity: 0, y: 6 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: Math.min(i, 14) * 0.03,
        duration: 0.2,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Mensagens</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {instanceList.length > 0
              ? `${connected}/${instanceList.length} instâncias conectadas`
              : 'Conecte WhatsApp ou Telegram para disparar ofertas'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => mutate()} disabled={isLoading}>
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            Criar Instância
          </Button>
        </div>
      </div>

      {/* Warning */}
      <div className="border border-warning/20 bg-warning/5 rounded-xl p-3 flex items-start gap-3 text-xs">
        <ShieldAlert className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground">WhatsApp via API não oficial</p>
          <p className="text-muted-foreground mt-0.5">
            Evolution API e Baileys usam protocolo não oficial. A Meta pode banir contas usadas
            para automação. Use números dedicados e priorize o Telegram para operações de alto volume.
          </p>
        </div>
      </div>

      {/* Stats */}
      {instanceList.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <Wifi className="h-3.5 w-3.5 text-success" />
            <span className="font-mono text-sm font-bold text-foreground tabular-nums">{connected}</span>
            <span className="text-xs text-muted-foreground">online</span>
          </div>
          {disconnected > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono text-sm font-bold text-foreground tabular-nums">{disconnected}</span>
              <span className="text-xs text-muted-foreground">offline</span>
            </div>
          )}
          {errored > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              <span className="font-mono text-sm font-bold text-foreground tabular-nums">{errored}</span>
              <span className="text-xs text-muted-foreground">com erro</span>
            </div>
          )}
        </div>
      )}

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleCreate}
            className="bg-card border border-border rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Nova instância</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                className="border border-input bg-background rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="evolution">Evolution API</option>
                <option value="waha">WAHA</option>
                <option value="baileys">Baileys</option>
              </select>
              <Input
                placeholder="ID externo (ex: numero-whatsapp)"
                required
                value={form.externalId}
                onChange={(e) => setForm({ ...form, externalId: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Criando...' : 'Criar instância'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Instance cards */}
      <div className="space-y-3">
        {isLoading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-secondary animate-pulse rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-secondary animate-pulse rounded w-1/3" />
                  <div className="h-2 bg-secondary animate-pulse rounded w-1/4" />
                </div>
                <div className="h-6 w-16 bg-secondary animate-pulse rounded-full" />
              </div>
            </div>
          ))
        ) : instanceList.length ? (
          instanceList.map((inst, i) => {
            const provider = PROVIDER_INFO[inst.provider] ?? { name: inst.provider, desc: '', color: 'text-muted-foreground' };
            const status = STATUS_INFO[inst.status] ?? { label: inst.status, color: 'text-muted-foreground', dot: 'bg-muted-foreground' };
            return (
              <motion.div
                key={inst.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={row}
                className="bg-card border border-border rounded-xl p-4 hover:border-border/80 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-sm font-medium', provider.color)}>{provider.name}</span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground">{provider.desc}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="font-mono text-xs text-muted-foreground truncate">{inst.externalId}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(inst.externalId);
                          toastSuccess('Copiado');
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-1', inst.status === 'CONNECTED' ? 'border-success/20 bg-success/5' : inst.status === 'ERROR' ? 'border-destructive/20 bg-destructive/5' : 'border-border bg-secondary/30')}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', status.dot, inst.status === 'CONNECTED' && 'animate-pulse')} />
                      <span className={cn('text-[10px] font-medium', status.color)}>{status.label}</span>
                    </div>
                    <button
                      onClick={() => deleteInstance(inst.id)}
                      className="text-muted-foreground hover:text-destructive p-1"
                      title="Remover instância"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center">
                <MessageCircle className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Nenhuma instância conectada</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  Crie uma instância para conectar um número de WhatsApp ou canal de Telegram
                </p>
              </div>
              <Button size="sm" onClick={() => setShowForm(true)}>
                <Plus className="h-3.5 w-3.5" />
                Criar primeira instância
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
