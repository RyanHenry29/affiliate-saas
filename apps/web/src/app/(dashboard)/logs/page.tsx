'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { AlertTriangle, Info, RefreshCw, RotateCcw, User, Filter, Play } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toastSuccess, toastError } from '@/lib/toast';

const fetcher = (url: string) => api.get(url);

type Level = 'all' | 'info' | 'error';
type EventFilter = 'all' | 'auth' | 'offer' | 'connection' | 'message' | 'system';

interface LogEntry {
  id: string;
  level: 'info' | 'error';
  createdAt: string;
  message: string;
  detail?: string;
  offerId?: string;
  userId?: string;
  userName?: string;
  eventType: EventFilter;
  metadata?: Record<string, any>;
}

const EVENT_TYPE_LABELS: Record<EventFilter, string> = {
  all: 'Todos',
  auth: 'Autenticação',
  offer: 'Ofertas',
  connection: 'Conexões',
  message: 'Mensagens',
  system: 'Sistema',
};

function getEventType(action: string): EventFilter {
  const lower = action.toLowerCase();
  if (lower.includes('login') || lower.includes('auth') || lower.includes('invite')) return 'auth';
  if (lower.includes('offer') || lower.includes('publish')) return 'offer';
  if (lower.includes('connect') || lower.includes('disconnect')) return 'connection';
  if (lower.includes('message') || lower.includes('send') || lower.includes('dispatch')) return 'message';
  return 'system';
}

export default function LogsPage() {
  const reduce = useReducedMotion();
  const [level, setLevel] = useState<Level>('all');
  const [eventType, setEventType] = useState<EventFilter>('all');
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState<string>('all');

  const { data: audit, mutate: mutateAudit, isLoading: loadingAudit } = useSWR('/audit', fetcher);
  const { data: errors, mutate: mutateErrors, isLoading: loadingErrors } = useSWR('/monitoring/errors', fetcher);
  const { data: users } = useSWR('/users', fetcher);

  const entries = useMemo<LogEntry[]>(() => {
    const list: LogEntry[] = [];

    const auditData = (audit as any)?.data;
    if (Array.isArray(auditData)) {
      for (const item of auditData) {
        const eventType = getEventType(item.action);
        list.push({
          id: `a-${item.id}`,
          level: 'info',
          createdAt: item.createdAt,
          message: item.action,
          detail: item.entity ? `${item.entity}${item.entityId ? ` #${item.entityId.slice(0, 8)}` : ''}` : undefined,
          userId: item.userId,
          userName: item.userEmail || item.userName || 'Sistema',
          eventType,
          metadata: item.metadata,
        });
      }
    }

    if (Array.isArray(errors)) {
      for (const err of errors) {
        list.push({
          id: `e-${err.id}`,
          level: 'error',
          createdAt: err.createdAt,
          message: err.status === 'RATE_LIMITED' ? 'Disparo limitado por rate limit' : 'Falha no disparo',
          detail: err.offerTitle
            ? `${err.offerTitle} · ${err.attempts} tentativa${err.attempts > 1 ? 's' : ''}`
            : `${err.attempts} tentativa${err.attempts > 1 ? 's' : ''}`,
          offerId: err.offerId,
          eventType: 'message',
          metadata: { status: err.status, attempts: err.attempts },
        });
      }
    }

    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [audit, errors]);

  const uniqueUsers = useMemo(() => {
    const userMap = new Map<string, string>();
    entries.forEach((e) => {
      if (e.userId && e.userName) {
        userMap.set(e.userId, e.userName);
      }
    });
    return Array.from(userMap.entries()).map(([id, name]) => ({ id, name }));
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (level !== 'all' && e.level !== level) return false;
      if (eventType !== 'all' && e.eventType !== eventType) return false;
      if (userFilter !== 'all' && e.userId !== userFilter) return false;
      if (search) {
        const hay = `${e.message} ${e.detail ?? ''} ${e.userName ?? ''}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [entries, level, eventType, userFilter, search]);

  const row: Variants = {
    hidden: { opacity: 0, y: 4 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: Math.min(i, 14) * 0.03, duration: 0.15, ease: 'easeOut' },
    }),
  };

  const [replaying, setReplaying] = useState<string | null>(null);

  async function handleReplay(entry: LogEntry) {
    if (!entry.offerId) return;
    setReplaying(entry.id);
    try {
      await api.post(`/offers/${entry.offerId}/reopen`);
      toastSuccess('Oferta reaberta para nova tentativa');
      void mutateErrors();
      void mutateAudit();
    } catch (err: any) {
      toastError(err, 'Falha ao reabrir oferta');
    } finally {
      setReplaying(null);
    }
  }

  function RowActions({ entry }: { entry: LogEntry }) {
    if (entry.level !== 'error' || !entry.offerId) return null;
    return (
      <button
        onClick={() => void handleReplay(entry)}
        disabled={replaying === entry.id}
        className="flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-60"
      >
        <RotateCcw className={cn('h-3 w-3', replaying === entry.id && 'animate-spin')} />
        Reabrir
      </button>
    );
  }

  function EventBadge({ eventType }: { eventType: EventFilter }) {
    const colors: Record<EventFilter, string> = {
      all: 'bg-secondary text-muted-foreground',
      auth: 'bg-primary/10 text-primary',
      offer: 'bg-success/10 text-success',
      connection: 'bg-warning/10 text-warning',
      message: 'bg-foreground/10 text-foreground',
      system: 'bg-secondary text-muted-foreground',
    };
    return (
      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', colors[eventType])}>
        {EVENT_TYPE_LABELS[eventType]}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Log de Atividades</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Auditoria completa: quem fez o quê, quando. Filtrar por usuário, tipo de evento ou período.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void mutateAudit();
            void mutateErrors();
          }}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-md border border-border bg-card p-0.5">
          {(
            [
              ['all', 'Todos'],
              ['info', 'Atividade'],
              ['error', 'Erros'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setLevel(value)}
              className={cn(
                'rounded px-3 py-1 text-xs font-medium transition-colors',
                level === value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex rounded-md border border-border bg-card p-0.5 overflow-x-auto">
          {(Object.keys(EVENT_TYPE_LABELS) as EventFilter[]).map((value) => (
            <button
              key={value}
              onClick={() => setEventType(value)}
              className={cn(
                'rounded px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap',
                eventType === value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {EVENT_TYPE_LABELS[value]}
            </button>
          ))}
        </div>

        {uniqueUsers.length > 0 && (
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="rounded-md border border-border bg-card px-3 py-1 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todos os usuários</option>
            {uniqueUsers.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        )}

        <input
          type="text"
          placeholder="Buscar no log..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 border border-input bg-card rounded-md px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Log entries */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {filtered.length === 0 ? (
          loadingAudit || loadingErrors ? (
            <div className="px-4 py-12 text-center">
              <div className="mx-auto h-5 w-32 bg-muted animate-pulse rounded" />
            </div>
          ) : (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-muted-foreground">Nenhuma entrada no log.</p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Eventos de disparo, publicações e falhas aparecem aqui.
              </p>
            </div>
          )
        ) : (
          <ul className="divide-y divide-border">
            {!reduce
              ? filtered.slice(0, 200).map((entry, i) => (
                  <motion.li
                    key={entry.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={row}
                    className="flex items-start gap-3 px-4 py-2.5 hover:bg-secondary/30 transition-colors"
                  >
                    <span className="mt-0.5 shrink-0">
                      {entry.level === 'error' ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                      ) : (
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm text-foreground">{entry.message}</p>
                        <EventBadge eventType={entry.eventType} />
                      </div>
                      {entry.detail && (
                        <p className="truncate text-xs text-muted-foreground mt-0.5">{entry.detail}</p>
                      )}
                      {entry.userName && (
                        <p className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <User className="h-3 w-3" />
                          {entry.userName}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase',
                        entry.level === 'error'
                          ? 'border-destructive/30 bg-destructive/10 text-destructive'
                          : 'border-border bg-secondary/60 text-muted-foreground',
                      )}
                    >
                      {entry.level}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                      {new Date(entry.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                    <RowActions entry={entry} />
                  </motion.li>
                ))
              : filtered.slice(0, 200).map((entry) => (
                  <li key={entry.id} className="flex items-start gap-3 px-4 py-2.5 hover:bg-secondary/30 transition-colors">
                    <span className="mt-0.5 shrink-0">
                      {entry.level === 'error' ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                      ) : (
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm text-foreground">{entry.message}</p>
                        <EventBadge eventType={entry.eventType} />
                      </div>
                      {entry.detail && (
                        <p className="truncate text-xs text-muted-foreground mt-0.5">{entry.detail}</p>
                      )}
                      {entry.userName && (
                        <p className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <User className="h-3 w-3" />
                          {entry.userName}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase',
                        entry.level === 'error'
                          ? 'border-destructive/30 bg-destructive/10 text-destructive'
                          : 'border-border bg-secondary/60 text-muted-foreground',
                      )}
                    >
                      {entry.level}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                      {new Date(entry.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                    <RowActions entry={entry} />
                  </li>
                ))}
          </ul>
        )}
        {filtered.length > 200 && (
          <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
            Exibindo os 200 mais recentes de {filtered.length}.
          </p>
        )}
      </div>
    </div>
  );
}
