'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { Tenant, AuthUser } from '@/lib/types';
import { PLAN_LABELS, STATUS_COLORS } from '@/lib/types';

const fetcher = (url: string) => api.get(url);

type AdminTab = 'tenants' | 'invites' | 'flags';

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('tenants');
  const { data: user } = useSWR('/auth/me', fetcher);
  const { data: tenants, mutate: mutateTenants } = useSWR('/admin/tenants', fetcher);
  const { data: invites, mutate: mutateInvites } = useSWR('/admin/invites', fetcher);
  const { data: flags, mutate: mutateFlags } = useSWR('/admin/flags', fetcher);

  if (!(user as AuthUser)?.isAdminMaster) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Acesso Restrito</h1>
          <p className="text-gray-500">Somente administradores masters podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  async function toggleFlag(flagKey: string, currentValue: boolean) {
    try {
      await api.put(`/admin/flags/${flagKey}`, { enabled: !currentValue });
      mutateFlags();
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Admin</h1>

      <div className="flex gap-1 border-b border-gray-200">
        {(['tenants', 'invites', 'flags'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'tenants' ? 'Tenants' : t === 'invites' ? 'Convites' : 'Flags'}
          </button>
        ))}
      </div>

      {tab === 'tenants' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-2 font-medium text-gray-600">Nome</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Plano</th>
                <th className="text-center px-4 py-2 font-medium text-gray-600">Usuários</th>
                <th className="text-center px-4 py-2 font-medium text-gray-600">Grupos</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {(tenants as Tenant[])?.map((t) => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-800">{t.name}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {t.subscription ? PLAN_LABELS[t.subscription.plan] : '—'}
                  </td>
                  <td className="px-4 py-2 text-center text-gray-600">{t._count?.users ?? 0}</td>
                  <td className="px-4 py-2 text-center text-gray-600">{t._count?.groups ?? 0}</td>
                  <td className="px-4 py-2">
                    {t.subscription?.status && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[t.subscription.status] || ''}`}>
                        {t.subscription.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'invites' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-2 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Função</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Expira em</th>
              </tr>
            </thead>
            <tbody>
              {(invites as any[])?.map((inv: any) => (
                <tr key={inv.id} className="border-b border-gray-100">
                  <td className="px-4 py-2 text-gray-800">{inv.email}</td>
                  <td className="px-4 py-2 text-gray-600">{inv.role}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      inv.status === 'PENDING' ? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500 text-xs">
                    {new Date(inv.expiresAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'flags' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          {(flags as any[])?.map((flag: any) => (
            <div key={flag.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{flag.key}</p>
                {flag.description && <p className="text-xs text-gray-500">{flag.description}</p>}
              </div>
              <button
                onClick={() => toggleFlag(flag.key, flag.enabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  flag.enabled ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                    flag.enabled ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
