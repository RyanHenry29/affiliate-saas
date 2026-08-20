'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Plus, Users, X } from 'lucide-react';
import { api } from '@/lib/api';
import type { Group, NicheTag } from '@/lib/types';
import { NICHE_LABELS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toastError, toastSuccess } from '@/lib/toast';

const fetcher = (url: string) => api.get(url);

export default function GroupsPage() {
  const reduce = useReducedMotion();
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
      toastSuccess('Grupo criado');
    } catch (err: any) {
      toastError(err, 'Erro ao criar grupo');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(group: Group) {
    try {
      await api.put(`/groups/${group.id}`, { active: !group.active });
      mutate();
    } catch (err: any) {
      toastError(err);
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
          <h1 className="text-xl font-bold text-foreground">Grupos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organize suas listas de transmissão por nicho
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          Adicionar Grupo
        </Button>
      </div>

      {showForm && (
        <motion.form
          initial={reduce ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleCreate}
          className="bg-card border border-border rounded-lg p-4 space-y-3"
        >
          <h3 className="text-sm font-semibold text-foreground">Novo Grupo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              placeholder="External ID"
              required
              value={form.externalId}
              onChange={(e) => setForm({ ...form, externalId: e.target.value })}
            />
            <Input
              placeholder="Nome"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Tags (separadas por vírgula)"
              value={form.nicheTags}
              onChange={(e) => setForm({ ...form, nicheTags: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Criar'}
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
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">External ID</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Nome</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Tags</th>
              <th className="text-center px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Ativo</th>
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
            ) : (groups as Group[])?.length ? (
              !reduce ? (
                (groups as Group[]).map((group, i) => (
                  <motion.tr
                    key={group.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={row}
                    className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{group.externalId}</td>
                    <td className="px-4 py-2.5 font-medium text-foreground">{group.name}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1 flex-wrap">
                        {group.nicheTags.map((tag) => (
                          <span key={tag} className="inline-block bg-secondary text-muted-foreground text-xs px-2 py-0.5 rounded-full">
                            {NICHE_LABELS[tag as NicheTag] || tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Switch
                        checked={group.active}
                        onCheckedChange={() => toggleActive(group)}
                        aria-label={group.active ? "Desativar grupo" : "Ativar grupo"}
                      />
                    </td>
                  </motion.tr>
                ))
              ) : (
                (groups as Group[]).map((group) => (
                  <tr key={group.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{group.externalId}</td>
                    <td className="px-4 py-2.5 font-medium text-foreground">{group.name}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1 flex-wrap">
                        {group.nicheTags.map((tag) => (
                          <span key={tag} className="inline-block bg-secondary text-muted-foreground text-xs px-2 py-0.5 rounded-full">
                            {NICHE_LABELS[tag as NicheTag] || tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Switch
                        checked={group.active}
                        onCheckedChange={() => toggleActive(group)}
                        aria-label={group.active ? "Desativar grupo" : "Ativar grupo"}
                      />
                    </td>
                  </tr>
                ))
              )
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <Users className="h-5 w-5" />
                    </span>
                    <p className="text-sm text-muted-foreground">Nenhum grupo encontrado</p>
                    <p className="text-xs text-muted-foreground/60">Crie grupos para organizar suas listas de transmissão</p>
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
