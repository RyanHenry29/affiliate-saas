'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { Group, NicheTag } from '@/lib/types';
import { NICHE_LABELS } from '@/lib/types';

const fetcher = (url: string) => api.get(url);

export default function GroupsPage() {
  const { data: groups, isLoading, mutate } = useSWR('/groups', fetcher);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ externalId: '', name: '', nicheTags: '' });
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/groups', {
        externalId: form.externalId,
        name: form.name,
        nicheTags: form.nicheTags ? form.nicheTags.split(',').map((s) => s.trim()) : [],
      });
      setShowForm(false);
      setForm({ externalId: '', name: '', nicheTags: '' });
      mutate();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar grupo');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(group: Group) {
    try {
      await api.put(`/groups/${group.id}`, { active: !group.active });
      mutate();
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Grupos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          Adicionar Grupo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Novo Grupo</h3>
          <div className="grid grid-cols-3 gap-3">
            <input
              placeholder="External ID"
              required
              value={form.externalId}
              onChange={(e) => setForm({ ...form, externalId: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <input
              placeholder="Nome"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <input
              placeholder="Tags (separadas por vírgula)"
              value={form.nicheTags}
              onChange={(e) => setForm({ ...form, nicheTags: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded"
            >
              {saving ? 'Salvando...' : 'Criar'}
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
              <th className="text-left px-4 py-2 font-medium text-gray-600">External ID</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Nome</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Tags</th>
              <th className="text-center px-4 py-2 font-medium text-gray-600">Ativo</th>
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
            ) : (groups as Group[])?.length ? (
              (groups as Group[]).map((group) => (
                <tr key={group.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{group.externalId}</td>
                  <td className="px-4 py-2 font-medium text-gray-800">{group.name}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1 flex-wrap">
                      {group.nicheTags.map((tag) => (
                        <span key={tag} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                          {NICHE_LABELS[tag as NicheTag] || tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => toggleActive(group)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        group.active ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                          group.active ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">Nenhum grupo encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
