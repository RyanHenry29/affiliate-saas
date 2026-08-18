'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { MessagingInstance } from '@/lib/types';

const fetcher = (url: string) => api.get(url);

const STATUS_COLORS: Record<string, string> = {
  CONNECTED: 'bg-green-500',
  DISCONNECTED: 'bg-gray-400',
  SYNCING: 'bg-blue-500',
  ERROR: 'bg-red-500',
};

export default function MessagingPage() {
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
    } catch (err: any) {
      alert(err.message || 'Erro ao criar instância');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Mensagens</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          Criar Instância
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Nova Instância</h3>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.provider}
              onChange={(e) => setForm({ ...form, provider: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="evolution">Evolution API</option>
              <option value="waha">WAHA</option>
              <option value="baileys">Baileys</option>
            </select>
            <input
              placeholder="External ID"
              required
              value={form.externalId}
              onChange={(e) => setForm({ ...form, externalId: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded"
            >
              {saving ? 'Criando...' : 'Criar'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-2 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Provider</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">External ID</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td colSpan={4} className="px-4 py-3">
                    <div className="h-5 bg-gray-100 animate-pulse rounded w-full" />
                  </td>
                </tr>
              ))
            ) : (instances as MessagingInstance[])?.length ? (
              (instances as MessagingInstance[]).map((inst) => (
                <tr key={inst.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[inst.status] || 'bg-gray-400'} ${
                          inst.status === 'CONNECTED' ? 'animate-pulse-green' : ''
                        }`}
                      />
                      <span className="text-xs text-gray-600">{inst.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-800 capitalize">{inst.provider}</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{inst.externalId}</td>
                  <td className="px-4 py-2 text-gray-500 text-xs">
                    {new Date(inst.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">Nenhuma instância encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
