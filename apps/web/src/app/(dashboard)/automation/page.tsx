'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Bot, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { AutomationRule } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toastError, toastSuccess } from '@/lib/toast';

const fetcher = (url: string) => api.get(url);

const RULE_TYPES = [
  { value: 'scheduled_dispatch', label: 'Disparo Agendado' },
  { value: 'auto_reply', label: 'Resposta Automática' },
  { value: 'new_offer_notify', label: 'Notificar Nova Oferta' },
  { value: 'price_drop_alert', label: 'Alerta de Queda de Preço' },
] as const;

const TRIGGERS = [
  { value: 'cron', label: 'Agendamento (Cron)' },
  { value: 'webhook', label: 'Webhook' },
  { value: 'event', label: 'Evento' },
] as const;

const RULE_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  RULE_TYPES.map((rt) => [rt.value, rt.label]),
);
const TRIGGER_LABELS: Record<string, string> = Object.fromEntries(
  TRIGGERS.map((tr) => [tr.value, tr.label]),
);

export default function AutomationPage() {
  const reduce = useReducedMotion();
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
    setForm({
      type: 'scheduled_dispatch',
      name: '',
      description: '',
      trigger: 'cron',
      config: '',
    });
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
      toastSuccess(editingId ? 'Regra atualizada' : 'Regra criada');
    } catch (err: any) {
      toastError(err, 'Erro ao salvar regra');
    } finally {
      setSaving(false);
    }
  }

  async function toggleEnabled(rule: AutomationRule) {
    try {
      await api.put(`/automation/${rule.id}`, { enabled: !rule.enabled });
      mutate();
    } catch (err: any) {
      toastError(err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta regra?')) return;
    try {
      await api.delete(`/automation/${id}`);
      mutate();
      toastSuccess('Regra excluída');
    } catch (err: any) {
      toastError(err);
    }
  }

  const inputCls =
    'border border-input bg-background rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent';

  const row: Variants = {
    hidden: { opacity: 0, y: 6 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: Math.min(i, 14) * 0.03, duration: 0.2, ease: 'easeOut' },
    }),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Automação</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Regras que disparam disparos e alertas sem intervenção manual
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          Nova Regra
        </Button>
      </div>

      {showForm && (
        <motion.form
          initial={reduce ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleSubmit}
          className="surface-card p-4 space-y-3"
        >
          <h3 className="text-sm font-semibold text-foreground">
            {editingId ? 'Editar Regra' : 'Nova Regra'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
              {RULE_TYPES.map((rt) => (
                <option key={rt.value} value={rt.value}>{rt.label}</option>
              ))}
            </select>
            <select value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })} className={inputCls}>
              {TRIGGERS.map((tr) => (
                <option key={tr.value} value={tr.value}>{tr.label}</option>
              ))}
            </select>
            <Input
              placeholder="Nome"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Descrição (opcional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <textarea
            placeholder='Config (JSON) — ex: {"schedule": "0 */2 * * *"}'
            value={form.config}
            onChange={(e) => setForm({ ...form, config: e.target.value })}
            rows={3}
            className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancelar
            </Button>
          </div>
        </motion.form>
      )}

      <div className="surface-card overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Ativo</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Nome</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Tipo</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Trigger</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td colSpan={5} className="px-4 py-3">
                    <div className="h-5 bg-muted animate-pulse rounded w-full" />
                  </td>
                </tr>
              ))
            ) : (rules as AutomationRule[])?.length ? (
              !reduce ? (
                (rules as AutomationRule[]).map((rule, i) => (
                  <motion.tr
                    key={rule.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={row}
                    className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => toggleEnabled(rule)}
                        aria-label={rule.enabled ? 'Desativar regra' : 'Ativar regra'}
                      />
                    </td>
                    <td className="px-4 py-2.5 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-secondary text-muted-foreground">
                          <Bot className="h-3.5 w-3.5" />
                        </span>
                        {rule.name}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{RULE_TYPE_LABELS[rule.type] ?? rule.type}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{TRIGGER_LABELS[rule.trigger] ?? rule.trigger}</td>
                    <td className="px-4 py-2.5 text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(rule)}>
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(rule.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                        Excluir
                      </Button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                (rules as AutomationRule[]).map((rule) => (
                  <tr key={rule.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => toggleEnabled(rule)}
                        aria-label={rule.enabled ? 'Desativar regra' : 'Ativar regra'}
                      />
                    </td>
                    <td className="px-4 py-2.5 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-secondary text-muted-foreground">
                          <Bot className="h-3.5 w-3.5" />
                        </span>
                        {rule.name}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{RULE_TYPE_LABELS[rule.type] ?? rule.type}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{TRIGGER_LABELS[rule.trigger] ?? rule.trigger}</td>
                    <td className="px-4 py-2.5 text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(rule)}>
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(rule.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                        Excluir
                      </Button>
                    </td>
                  </tr>
                ))
              )
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <Bot className="h-5 w-5" />
                    </span>
                    <p className="text-sm text-muted-foreground">Nenhuma regra encontrada</p>
                    <p className="text-xs text-muted-foreground/60">Crie uma regra para automatizar disparos e alertas</p>
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