'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { AutomationRule } from '@/lib/types';

const fetcher = (url: string) => api.get(url);

const RULE_TYPES = [
  { value: 'scheduled_dispatch', label: 'Disparo Agendado' },
  { value: 'auto_reply', label: 'Resposta Automática' },
  { value: 'new_offer_notify', label: 'Notificar Nova Oferta' },
  { value: 'price_drop_alert', label: 'Alerta de Queda de Preço' },
];

const TRIGGERS = [
  { value: 'cron', label: 'Agendamento (Cron)' },
  { value: 'webhook', label: 'Webhook' },
  { value: 'event', label: 'Evento' },
];

export default function AutomationPage() {
  const { data: rules, isLoading, mutate } = useSWR('/automation', fetcher);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: 'scheduled_dispatch',
    name: '',
    description: '',
    trigger: 'cron',
    config: '',
  });
  const [saving, setSaving] = useState(false);

  function openEdit(rule: AutomationRule) {
    setEditingId(rule.id);
    setForm({
      type: rule.type,
      name: rule.name,
      description: rule.description || '',
      trigger: rule.trigger,
      config: rule.config ? JSON.stringify(rule.config, null, 2) : '',
    });
    setShowForm(true);
  }

  function openNew() {
    setEditingId(null);
    setForm({ type: 'scheduled_dispatch', name: '', description: '', trigger: 'cron', config: '' });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        type: form.type,
        name: form.name,
        description: form.description || undefined,
        trigger: form.trigger,
        config: form.config ? JSON.parse(form.config) : {},
      };
      if (editingId) {
        await api.put(`/automation/${editingId}`, payload);
      } else {
        await api.post('/automation', payload);
      }
      setShowForm(false);
      setEditingId(null);
      mutate();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar regra');
    } finally {
      setSaving(false);
    }
  }

  async function toggleEnabled(rule: AutomationRule) {
    try {
      await api.put(`/automation/${rule.id}`, { enabled: !rule.enabled });
      mutate();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta regra?')) return;
    try {
      await api.delete(`/automation/${id}`);
      mutate();
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Automação</h1>
        <button
          onClick={openNew}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          Nova Regra
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">
            {editingId ? 'Editar Regra' : 'Nova Regra'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              {RULE_TYPES.map((rt) => (
                <option key={rt.value} value={rt.value}>{rt.label}</option>
              ))}
            </select>
            <select
              value={form.trigger}
              onChange={(e) => setForm({ ...form, trigger: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              {TRIGGERS.map((tr) => (
                <option key={tr.value} value={tr.value}>{tr.label}</option>
              ))}
            </select>
            <input
              placeholder="Nome"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <input
              placeholder="Descrição (opcional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <textarea
            placeholder='Config (JSON) — ex: {"schedule": "0 */2 * * *"}'
            value={form.config}
            onChange={(e) => setForm({ ...form, config: e.target.value })}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingId(null); }}
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
              <th className="text-left px-4 py-2 font-medium text-gray-600">Ativo</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Nome</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Tipo</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Trigger</th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td colSpan={5} className="px-4 py-3">
                    <div className="h-5 bg-gray-100 animate-pulse rounded w-full" />
                  </td>
                </tr>
              ))
            ) : (rules as AutomationRule[])?.length ? (
              (rules as AutomationRule[]).map((rule) => (
                <tr key={rule.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleEnabled(rule)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        rule.enabled ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                          rule.enabled ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-800">{rule.name}</td>
                  <td className="px-4 py-2 text-gray-600">{rule.type}</td>
                  <td className="px-4 py-2 text-gray-600">{rule.trigger}</td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button
                      onClick={() => openEdit(rule)}
                      className="text-green-600 hover:text-green-700 text-xs font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="text-red-600 hover:text-red-700 text-xs font-medium"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">Nenhuma regra encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
