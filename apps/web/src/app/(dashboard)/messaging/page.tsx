'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { MessageCircle, Plus, RefreshCw, ShieldAlert, X } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { MessagingInstance } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toastError, toastSuccess } from '@/lib/toast';

const fetcher = (url: string) => api.get(url);

const STATUS_COLORS: Record<string, string> = {
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

export default function MessagingPage() {
  const reduce = useReducedMotion();
  const { data: instances, isLoading, mutate } = useSWR('/messaging/instances', fetcher);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ provider: 'evolution', externalId: '' });
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/messaging/instances', form);
      setShowForm(false);
      setForm({ provider: 'evolution', externalId: '' });
      mutate();
      toastSuccess('Instância criada');
    } catch (err: any) {
      toastError(err, 'Erro ao criar instância');
    } finally {
      setSaving(false);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Mensagens</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie instâncias de WhatsApp e Telegram
          </p>
        </div>
        <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => mutate()} disabled={isLoading} aria-label="Recarregar instâncias">
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
        </Button>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          Criar Instância
        </Button>
      </div>
      </div>

      <div className="surface-card p-3 flex items-start gap-3 text-xs">
        <ShieldAlert className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <p className="text-muted-foreground">
          Conexão de WhatsApp via Baileys/Evolution API não é oficialmente
          suportada pela Meta e pode resultar em banimento da conta. Use
          com moderação e priorize o Telegram quando possível.
        </p>
      </div>

      {showForm && (
        <motion.form
          initial={reduce ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleCreate}
          className="bg-card border border-border rounded-lg p-4 space-y-3"
        >
          <h3 className="text-sm font-semibold text-foreground">Nova Instância</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={form.provider}
              onChange={(e) => setForm({ ...form, provider: e.target.value })}
              className="border border-input bg-background rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="evolution">Evolution API</option>
              <option value="waha">WAHA</option>
              <option value="baileys">Baileys</option>
            </select>
            <Input
              placeholder="External ID"
              required
              value={form.externalId}
              onChange={(e) => setForm({ ...form, externalId: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Criando...' : 'Criar'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </motion.form>
      )}

      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Provider</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">External ID</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={4} className="px-4 py-3">
                    <div className="h-5 bg-muted animate-pulse rounded w-full" />
                  </td>
                </tr>
              ))
            ) : (instances as MessagingInstance[])?.length ? (
              !reduce ? (
                (instances as MessagingInstance[]).map((inst, i) => (
                  <motion.tr
                    key={inst.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={row}
                    className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[inst.status] || 'bg-muted-foreground'}`} />
                        <span className={`text-xs ${STATUS_TEXT[inst.status] || 'text-muted-foreground'}`}>
                          {inst.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-foreground capitalize">{inst.provider}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{inst.externalId}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs font-mono">
                      {new Date(inst.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </motion.tr>
                ))
              ) : (
                (instances as MessagingInstance[]).map((inst) => (
                  <tr key={inst.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[inst.status] || 'bg-muted-foreground'}`} />
                        <span className={`text-xs ${STATUS_TEXT[inst.status] || 'text-muted-foreground'}`}>
                          {inst.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-foreground capitalize">{inst.provider}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{inst.externalId}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs font-mono">
                      {new Date(inst.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))
              )
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <MessageCircle className="h-5 w-5" />
                    </span>
                    <p className="text-sm text-muted-foreground">Nenhuma instância encontrada</p>
                    <p className="text-xs text-muted-foreground/60">Crie uma instância para conectar WhatsApp ou Telegram</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
