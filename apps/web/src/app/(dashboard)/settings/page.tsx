'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Copy, Check, Eye, EyeOff, KeyRound, Mail, Shield, UserCog, Webhook, Zap, Clock, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import type { User, Invite, ApiKeyInfo, WebhookEndpoint, AuthUser } from '@/lib/types';
import { ROLE_LABELS, PLAN_LABELS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toastError, toastSuccess } from '@/lib/toast';
import AiProviderTab from '@/components/settings/ai-provider-tab';

const fetcher = (url: string) => api.get(url);

type SettingsTab = 'geral' | 'equipe' | 'apikeys' | 'webhooks' | 'ai';

const TABS: { key: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'geral', label: 'Geral', icon: Shield },
  { key: 'equipe', label: 'Equipe', icon: UserCog },
  { key: 'apikeys', label: 'API Keys', icon: KeyRound },
  { key: 'webhooks', label: 'Webhooks', icon: Webhook },
  { key: 'ai', label: 'IA', icon: Mail },
];

const API_EVENTS = [
  'offer.scraped', 'offer.published', 'offer.failed', 'offer.ignored',
  'group.updated', 'message.sent', 'message.failed',
  'connection.connected', 'connection.disconnected', 'connection.reconnecting',
  'subscription.updated', 'subscription.expiring',
];

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('geral');
  const { data: user } = useSWR('/auth/me', fetcher);
  const { data: users, mutate: mutateUsers } = useSWR('/users', fetcher);
  const { data: apiKeys, mutate: mutateKeys } = useSWR('/api-keys', fetcher);
  const { data: webhooks, mutate: mutateHooks } = useSWR('/webhooks', fetcher);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [inviting, setInviting] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [showKeyOnce, setShowKeyOnce] = useState<string | null>(null);
  const [hookUrl, setHookUrl] = useState('');
  const [hookEvents, setHookEvents] = useState<string[]>(['offer.published', 'message.failed']);
  const [creatingHook, setCreatingHook] = useState(false);
  const [testingHook, setTestingHook] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const inputCls =
    'border border-input bg-background rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent';

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    try {
      await api.post('/invites', { email: inviteEmail, role: inviteRole });
      setInviteEmail('');
      mutateUsers();
      toastSuccess('Convite enviado');
    } catch (err: any) {
      toastError(err);
    } finally {
      setInviting(false);
    }
  }

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault();
    setCreatingKey(true);
    try {
      const result = await api.post('/api-keys', { name: keyName }) as any;
      setKeyName('');
      setShowKeyOnce(result?.secret);
      mutateKeys();
      toastSuccess('Chave criada — copie agora, não será mostrada novamente');
    } catch (err: any) {
      toastError(err);
    } finally {
      setCreatingKey(false);
    }
  }

  async function handleRevokeKey(id: string) {
    if (!confirm('Revogar esta chave? A integração que usa ela vai parar de funcionar.')) return;
    try {
      await api.delete(`/api-keys/${id}`);
      mutateKeys();
      toastSuccess('Chave revogada');
    } catch (err: any) {
      toastError(err);
    }
  }

  async function handleCreateHook(e: React.FormEvent) {
    e.preventDefault();
    setCreatingHook(true);
    try {
      await api.post('/webhooks', {
        url: hookUrl,
        events: hookEvents,
      });
      setHookUrl('');
      setHookEvents(['offer.published', 'message.failed']);
      mutateHooks();
      toastSuccess('Webhook criado');
    } catch (err: any) {
      toastError(err);
    } finally {
      setCreatingHook(false);
    }
  }

  async function handleTestHook(hookId: string) {
    setTestingHook(hookId);
    try {
      await api.post(`/webhooks/${hookId}/test`);
      toastSuccess('Evento de teste enviado');
    } catch (err: any) {
      toastError(err);
    } finally {
      setTestingHook(null);
    }
  }

  async function handleToggleHook(hookId: string, active: boolean) {
    try {
      await api.patch(`/webhooks/${hookId}`, { active: !active });
      mutateHooks();
      toastSuccess(active ? 'Webhook desativado' : 'Webhook ativado');
    } catch (err: any) {
      toastError(err);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Organização, equipe, chaves de API e webhooks
        </p>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                active
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'geral' && (
        <div className="surface-card p-6 space-y-4 max-w-lg">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Organização</label>
            <p className="text-sm font-medium text-foreground mt-0.5">{(user as AuthUser)?.tenantName || '—'}</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Plano</label>
            <p className="text-sm font-medium text-foreground mt-0.5">
              {(user as AuthUser)?.subscription
                ? PLAN_LABELS[(user as AuthUser)!.subscription!.plan] ?? '—'
                : '—'}
            </p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Função</label>
            <p className="text-sm font-medium text-foreground mt-0.5">
              {(user as AuthUser)?.role ? ROLE_LABELS[(user as AuthUser)!.role as keyof typeof ROLE_LABELS] || (user as AuthUser)!.role : '—'}
            </p>
          </div>
        </div>
      )}

      {tab === 'equipe' && (
        <div className="space-y-4">
          <form onSubmit={handleInvite} className="surface-card p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground mb-1 block">Convidar por email</label>
              <Input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Função</label>
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className={inputCls}>
                <option value="OPERATOR">Operador</option>
                <option value="ANALYST">Analista</option>
                <option value="MEMBER">Membro</option>
                <option value="VIEWER">Visualizador</option>
                <option value="OWNER">Proprietário</option>
              </select>
            </div>
            <Button type="submit" disabled={inviting}>
              {inviting ? 'Enviando...' : 'Convidar'}
            </Button>
          </form>

          <div className="surface-card p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Permissões por função</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="rounded-lg border border-border bg-background/50 p-3">
                <p className="text-sm font-medium text-foreground">Proprietário</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Acesso total. Gerencia equipe, billing e configurações.</p>
              </div>
              <div className="rounded-lg border border-border bg-background/50 p-3">
                <p className="text-sm font-medium text-foreground">Operador</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Publica ofertas, gerencia grupos, automações e conexões.</p>
              </div>
              <div className="rounded-lg border border-border bg-background/50 p-3">
                <p className="text-sm font-medium text-foreground">Membro</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Publica ofertas e cria automações. Sem delete.</p>
              </div>
              <div className="rounded-lg border border-border bg-background/50 p-3">
                <p className="text-sm font-medium text-foreground">Analista</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Somente leitura em tudo. Acessa logs e analytics.</p>
              </div>
              <div className="rounded-lg border border-border bg-background/50 p-3">
                <p className="text-sm font-medium text-foreground">Visualizador</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Leitura básica. Sem logs nem billing.</p>
              </div>
            </div>
          </div>

          <div className="surface-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Função</th>
                </tr>
              </thead>
              <tbody>
                {(users as User[])?.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-2.5 text-foreground">{u.email}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{ROLE_LABELS[u.role]}</td>
                  </tr>
                ))}
                {!(users as User[])?.length && (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Nenhum membro além de você ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'apikeys' && (
        <div className="space-y-4">
          {showKeyOnce && (
            <div className="rounded-lg border border-success/30 bg-success/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <KeyRound className="h-4 w-4 text-success" />
                <span className="text-sm font-semibold text-success">Chave criada — salve agora</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Esta chave só será mostrada uma vez. Copie e guarde em local seguro.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-background px-3 py-2 font-mono text-xs text-foreground break-all">
                  {showKeyOnce}
                </code>
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(showKeyOnce);
                    setCopiedKey(true);
                    setTimeout(() => setCopiedKey(false), 2000);
                  }}
                >
                  {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowKeyOnce(null)}>
                Fechar
              </Button>
            </div>
          )}

          <form onSubmit={handleCreateKey} className="surface-card p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground mb-1 block">Nome da chave</label>
              <Input
                required
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="Produção · Integração com bot"
              />
            </div>
            <Button type="submit" disabled={creatingKey}>
              {creatingKey ? 'Criando...' : 'Criar Chave'}
            </Button>
          </form>

          <div className="surface-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Nome</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Prefixo</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Criada em</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Último uso</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Ação</th>
                </tr>
              </thead>
              <tbody>
                {(apiKeys as ApiKeyInfo[])?.map((key) => (
                  <tr key={key.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-foreground">{key.name}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{key.keyPrefix}...</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">
                      {key.createdAt ? new Date(key.createdAt).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">
                      {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString('pt-BR') : 'Nunca'}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeKey(key.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Revogar
                      </Button>
                    </td>
                  </tr>
                ))}
                {!(apiKeys as ApiKeyInfo[])?.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Nenhuma chave criada. Crie uma para acessar a API programaticamente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Como usar</h3>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>Inclua o header <code className="rounded bg-background px-1.5 py-0.5 font-mono text-foreground">Authorization: Bearer sk_...</code> em todas as requisições.</p>
              <p>Exemplo: <code className="rounded bg-background px-1.5 py-0.5 font-mono text-foreground">curl -H "Authorization: Bearer sk_abc123" https://api.affiliateos.com/offers</code></p>
            </div>
          </div>
        </div>
      )}

      {tab === 'webhooks' && (
        <div className="space-y-4">
          <form onSubmit={handleCreateHook} className="surface-card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Novo Webhook</h3>
            <Input
              required
              value={hookUrl}
              onChange={(e) => setHookUrl(e.target.value)}
              placeholder="https://exemplo.com/webhook"
            />
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Eventos</label>
              <div className="flex flex-wrap gap-1.5">
                {API_EVENTS.map((evt) => {
                  const selected = hookEvents.includes(evt);
                  return (
                    <button
                      key={evt}
                      type="button"
                      onClick={() => setHookEvents((prev) =>
                        selected ? prev.filter((e) => e !== evt) : [...prev, evt]
                      )}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        selected
                          ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {evt}
                    </button>
                  );
                })}
              </div>
            </div>
            <Button type="submit" disabled={creatingHook}>
              {creatingHook ? 'Criando...' : 'Criar Webhook'}
            </Button>
          </form>

          <div className="space-y-3">
            {(webhooks as WebhookEndpoint[])?.map((wh) => (
              <div key={wh.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${wh.active ? 'bg-success' : 'bg-muted-foreground/40'}`} />
                      <code className="font-mono text-sm text-foreground break-all">{wh.url}</code>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {wh.events.map((evt) => (
                        <span key={evt} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                          {evt}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTestHook(wh.id)}
                      disabled={testingHook === wh.id}
                    >
                      <Zap className="h-3.5 w-3.5" />
                      {testingHook === wh.id ? 'Enviando...' : 'Testar'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleHook(wh.id, wh.active)}
                    >
                      {wh.active ? 'Desativar' : 'Ativar'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {!(webhooks as WebhookEndpoint[])?.length && (
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <Webhook className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum webhook cadastrado.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Webhooks enviam eventos em tempo real para sua integração.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'ai' && <AiProviderTab />}
    </div>
  );
}
