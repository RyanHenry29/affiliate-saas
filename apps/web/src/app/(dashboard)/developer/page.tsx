'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Copy, History, KeyRound, Play, Plus, RotateCcw, Trash2, Webhook, X } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toastSuccess, toastError } from '@/lib/toast';

const fetcher = (url: string) => api.get(url);

const WEBHOOK_EVENTS = ['offer.created', 'offer.updated', 'offer.published', 'message.sent', 'message.failed', 'connection.connected', 'connection.disconnected'];

type Tab = 'keys' | 'webhooks' | 'replay';

function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-background/60 px-3 py-2">
      <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{value}</code>
      <button
        onClick={() => {
          void navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
        aria-label="Copiar"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

interface ReplayEvent {
  id: string;
  eventType: string;
  payload: any;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
}

export default function DeveloperPage() {
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<Tab>('keys');

  const { data: keys, mutate: mutateKeys } = useSWR('/api-keys', fetcher);
  const { data: webhooks, mutate: mutateWebhooks } = useSWR('/webhooks', fetcher);
  const { data: events, mutate: mutateEvents } = useSWR('/events', fetcher);

  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const [newUrl, setNewUrl] = useState('');
  const [newEvents, setNewEvents] = useState<string[]>([]);

  const [replaying, setReplaying] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());

  async function handleCreateKey() {
    if (!newKeyName.trim()) return;
    try {
      const res = await api.post('/api-keys', { name: newKeyName.trim() });
      setCreatedKey((res as any).key);
      setNewKeyName('');
      void mutateKeys();
    } catch (err: any) {
      toastError(err, 'Erro ao criar chave');
    }
  }

  async function handleRevoke(id: string) {
    try {
      await api.delete(`/api-keys/${id}`);
      toastSuccess('Chave revogada');
      void mutateKeys();
    } catch (err: any) {
      toastError(err, 'Erro ao revogar chave');
    }
  }

  async function handleCreateWebhook() {
    if (!newUrl.trim() || newEvents.length === 0) return;
    try {
      await api.post('/webhooks', { url: newUrl.trim(), events: newEvents });
      setNewUrl('');
      setNewEvents([]);
      toastSuccess('Webhook criado');
      void mutateWebhooks();
    } catch (err: any) {
      toastError(err, 'Erro ao criar webhook');
    }
  }

  async function handleToggleWebhook(id: string, isActive: boolean) {
    try {
      await api.patch(`/webhooks/${id}`, { active: isActive });
      void mutateWebhooks();
    } catch (err: any) {
      toastError(err, 'Erro ao atualizar webhook');
    }
  }

  async function handleDeleteWebhook(id: string) {
    try {
      await api.delete(`/webhooks/${id}`);
      toastSuccess('Webhook removido');
      void mutateWebhooks();
    } catch (err: any) {
      toastError(err, 'Erro ao remover webhook');
    }
  }

  async function handleReplayEvent(eventId: string) {
    setReplaying(eventId);
    try {
      await api.post(`/events/${eventId}/replay`);
      toastSuccess('Evento reenviado');
      void mutateEvents();
    } catch (err: any) {
      toastError(err, 'Erro ao reenviar evento');
    } finally {
      setReplaying(null);
    }
  }

  async function handleReplaySelected() {
    const ids = Array.from(selectedEvents);
    if (ids.length === 0) return;
    setReplaying('batch');
    try {
      await api.post('/events/replay', { eventIds: ids });
      toastSuccess(`${ids.length} evento(s) reenviado(s)`);
      setSelectedEvents(new Set());
      void mutateEvents();
    } catch (err: any) {
      toastError(err, 'Erro ao reenviar eventos');
    } finally {
      setReplaying(null);
    }
  }

  function toggleEventSelection(id: string) {
    setSelectedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllEvents() {
    const eventList = (events as ReplayEvent[]) ?? [];
    if (selectedEvents.size === eventList.length) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(eventList.map((e) => e.id)));
    }
  }

  const toggleWebhookEvent = (ev: string) =>
    setNewEvents((prev) => (prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Desenvolvedor</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          API keys, webhooks de eventos e replay de eventos.
        </p>
      </div>

      <div className="flex rounded-md border border-border bg-card p-0.5 w-fit overflow-x-auto">
        {(
          [
            ['keys', 'API Keys', KeyRound],
            ['webhooks', 'Webhooks', Webhook],
            ['replay', 'Replay', History],
          ] as const
        ).map(([value, label, Icon]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={cn(
              'flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap',
              tab === value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'keys' && (
        <motion.div
          key="keys"
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">Criar nova chave</h2>
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="Nome (ex.: produção)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
              <Button onClick={() => void handleCreateKey()}>
                <Plus className="h-4 w-4" />
                Criar
              </Button>
            </div>
            {createdKey && (
              <div className="mt-3 rounded-md border border-primary/30 bg-primary/5 p-3">
                <p className="text-xs text-muted-foreground">
                  Copie a chave agora — ela não será exibida novamente.
                </p>
                <div className="mt-2">
                  <CopyField value={createdKey} />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setCreatedKey(null)}
                >
                  <X className="h-3.5 w-3.5" />
                  Fechar
                </Button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Nome</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Chave</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Criada</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Último uso</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {(keys as any[])?.length ? (
                  (keys as any[]).map((k) => (
                    <tr key={k.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-2.5 font-medium text-foreground">{k.name}</td>
                      <td className="px-4 py-2.5">
                        <code className="font-mono text-xs text-muted-foreground">{k.maskedKey}</code>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {new Date(k.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {k.lastUsedAt
                          ? new Date(k.lastUsedAt).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Nunca usado'}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span
                          className={cn(
                            'rounded-full border px-2 py-0.5 text-[10px] font-medium',
                            k.isActive
                              ? 'border-success/30 bg-success/10 text-success'
                              : 'border-border bg-secondary/60 text-muted-foreground',
                          )}
                        >
                          {k.isActive ? 'Ativa' : 'Revogada'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {k.isActive && (
                          <button
                            onClick={() => void handleRevoke(k.id)}
                            aria-label="Revogar"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      Nenhuma chave criada ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {tab === 'webhooks' && (
        <motion.div
          key="webhooks"
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">Novo webhook</h2>
            <div className="mt-3">
              <Input
                placeholder="https://sua-api.com/webhook"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {WEBHOOK_EVENTS.map((ev) => (
                <button
                  key={ev}
                  onClick={() => toggleWebhookEvent(ev)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                    newEvents.includes(ev)
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {ev}
                </button>
              ))}
            </div>
            <Button
              className="mt-3"
              disabled={!newUrl.trim() || newEvents.length === 0}
              onClick={() => void handleCreateWebhook()}
            >
              <Plus className="h-4 w-4" />
              Criar webhook
            </Button>
          </div>

          <div className="space-y-2">
            {(webhooks as any[])?.length ? (
              (webhooks as any[]).map((w) => (
                <div key={w.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <code className="block truncate font-mono text-sm text-foreground">{w.url}</code>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {(w.events as string[]).map((ev) => (
                          <span key={ev} className="rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => void handleToggleWebhook(w.id, !w.isActive)}
                        className={cn(
                          'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                          w.isActive
                            ? 'border-success/30 bg-success/10 text-success'
                            : 'border-border bg-secondary/60 text-muted-foreground',
                        )}
                      >
                        {w.isActive ? 'Ativo' : 'Pausado'}
                      </button>
                      <button
                        onClick={() => void handleDeleteWebhook(w.id)}
                        aria-label="Remover webhook"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
                Nenhum webhook configurado.
              </div>
            )}
          </div>
        </motion.div>
      )}

      {tab === 'replay' && (
        <motion.div
          key="replay"
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Replay de Eventos</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reenvie eventos de webhook que falharam ou foram perdidos.
                </p>
              </div>
              {selectedEvents.size > 0 && (
                <Button
                  size="sm"
                  onClick={() => void handleReplaySelected()}
                  disabled={replaying === 'batch'}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reenviar {selectedEvents.size} selecionado(s)
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {(events as ReplayEvent[])?.length ? (
              <>
                <div className="border-b border-border px-4 py-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedEvents.size === (events as ReplayEvent[]).length}
                    onChange={toggleAllEvents}
                    className="h-4 w-4 rounded border-border"
                  />
                  <span className="text-xs text-muted-foreground">
                    {selectedEvents.size} de {(events as ReplayEvent[]).length} selecionados
                  </span>
                </div>
                <ul className="divide-y divide-border">
                  {(events as ReplayEvent[]).slice(0, 50).map((event) => (
                    <li key={event.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedEvents.has(event.id)}
                        onChange={() => toggleEventSelection(event.id)}
                        className="h-4 w-4 rounded border-border"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-xs text-foreground">{event.eventType}</code>
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-medium',
                              event.status === 'success'
                                ? 'bg-success/10 text-success'
                                : event.status === 'failed'
                                  ? 'bg-destructive/10 text-destructive'
                                  : 'bg-secondary text-muted-foreground',
                            )}
                          >
                            {event.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {new Date(event.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleReplayEvent(event.id)}
                        disabled={replaying === event.id}
                      >
                        <Play className="h-3.5 w-3.5" />
                        {replaying === event.id ? 'Reenviando...' : 'Reenviar'}
                      </Button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                <History className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p>Nenhum evento registrado.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Eventos de webhook aparecem aqui para reenvio.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
