'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { User, Invite, ApiKeyInfo, WebhookEndpoint, AuthUser } from '@/lib/types';
import { ROLE_LABELS, PLAN_LABELS } from '@/lib/types';
import AiProviderTab from '@/components/settings/ai-provider-tab';

const fetcher = (url: string) => api.get(url);

type SettingsTab = 'geral' | 'equipe' | 'apikeys' | 'webhooks' | 'ai';

const TABS: { key: SettingsTab; label: string }[] = [
  { key: 'geral', label: 'Geral' },
  { key: 'equipe', label: 'Equipe' },
  { key: 'apikeys', label: 'API Keys' },
  { key: 'webhooks', label: 'Webhooks' },
  { key: 'ai', label: 'IA' },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('geral');
  const { data: user } = useSWR('/auth/me', fetcher);
  const { data: users, mutate: mutateUsers } = useSWR('/users', fetcher);
  const { data: apiKeys, mutate: mutateKeys } = useSWR('/api-keys', fetcher);
  const { data: webhooks, mutate: mutateHooks } = useSWR('/webhooks', fetcher);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('DEV_MEMBER');
  const [inviting, setInviting] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [hookUrl, setHookUrl] = useState('');
  const [hookEvents, setHookEvents] = useState('');
  const [creatingHook, setCreatingHook] = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    try {
      await api.post('/invites', { email: inviteEmail, role: inviteRole });
      setInviteEmail('');
      mutateUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setInviting(false);
    }
  }

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault();
    setCreatingKey(true);
    try {
      await api.post('/api-keys', { name: keyName });
      setKeyName('');
      mutateKeys();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreatingKey(false);
    }
  }

  async function handleRevokeKey(id: string) {
    if (!confirm('Revogar esta chave?')) return;
    try {
      await api.delete(`/api-keys/${id}`);
      mutateKeys();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleCreateHook(e: React.FormEvent) {
    e.preventDefault();
    setCreatingHook(true);
    try {
      await api.post('/webhooks', {
        url: hookUrl,
        events: hookEvents.split(',').map((s) => s.trim()),
      });
      setHookUrl('');
      setHookEvents('');
      mutateHooks();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreatingHook(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Configurações</h1>

      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'geral' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase">Organização</label>
            <p className="text-sm font-medium text-gray-800">{(user as AuthUser)?.tenantName || '—'}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase">Plano</label>
            <p className="text-sm font-medium text-gray-800">
              {(user as AuthUser)?.role ? PLAN_LABELS[(user as AuthUser)!.role as keyof typeof PLAN_LABELS] || (user as AuthUser)!.role : '—'}
            </p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase">Função</label>
            <p className="text-sm font-medium text-gray-800">
              {(user as AuthUser)?.role ? ROLE_LABELS[(user as AuthUser)!.role as keyof typeof ROLE_LABELS] || (user as AuthUser)!.role : '—'}
            </p>
          </div>
        </div>
      )}

      {tab === 'equipe' && (
        <div className="space-y-4">
          <form onSubmit={handleInvite} className="bg-white border border-gray-200 rounded-lg p-4 flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Convidar por email</label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Função</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="DEV_MEMBER">Dev Member</option>
                <option value="ORG_ADMIN">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={inviting}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded"
            >
              {inviting ? 'Enviando...' : 'Convidar'}
            </button>
          </form>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Função</th>
                </tr>
              </thead>
              <tbody>
                {(users as User[])?.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100">
                    <td className="px-4 py-2 text-gray-800">{u.email}</td>
                    <td className="px-4 py-2 text-gray-600">{ROLE_LABELS[u.role]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'apikeys' && (
        <div className="space-y-4">
          <form onSubmit={handleCreateKey} className="bg-white border border-gray-200 rounded-lg p-4 flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Nome da chave</label>
              <input
                required
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="Produção"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={creatingKey}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded"
            >
              {creatingKey ? 'Criando...' : 'Criar Chave'}
            </button>
          </form>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Nome</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Prefixo</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Último uso</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-600">Ação</th>
                </tr>
              </thead>
              <tbody>
                {(apiKeys as ApiKeyInfo[])?.map((key) => (
                  <tr key={key.id} className="border-b border-gray-100">
                    <td className="px-4 py-2 font-medium text-gray-800">{key.name}</td>
                    <td className="px-4 py-2 font-mono text-xs text-gray-500">{key.keyPrefix}...</td>
                    <td className="px-4 py-2 text-gray-500 text-xs">
                      {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString('pt-BR') : 'Nunca'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        className="text-red-600 hover:text-red-700 text-xs font-medium"
                      >
                        Revogar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'webhooks' && (
        <div className="space-y-4">
          <form onSubmit={handleCreateHook} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Novo Webhook</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                value={hookUrl}
                onChange={(e) => setHookUrl(e.target.value)}
                placeholder="https://exemplo.com/webhook"
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <input
                value={hookEvents}
                onChange={(e) => setHookEvents(e.target.value)}
                placeholder="Eventos (separados por vírgula)"
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={creatingHook}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded"
            >
              {creatingHook ? 'Criando...' : 'Criar Webhook'}
            </button>
          </form>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-2 font-medium text-gray-600">URL</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Eventos</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Ativo</th>
                </tr>
              </thead>
              <tbody>
                {(webhooks as WebhookEndpoint[])?.map((wh) => (
                  <tr key={wh.id} className="border-b border-gray-100">
                    <td className="px-4 py-2 font-mono text-xs text-gray-800">{wh.url}</td>
                    <td className="px-4 py-2 text-gray-600 text-xs">{wh.events.join(', ')}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${wh.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'ai' && <AiProviderTab />}
    </div>
  );
}
