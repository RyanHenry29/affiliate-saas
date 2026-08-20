'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { motion, useReducedMotion, AnimatePresence, type Variants } from 'framer-motion';
import {
  CheckCircle2,
  Hash,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
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
  const [search, setSearch] = useState('');

  const groupList = (groups as Group[]) ?? [];
  const active = groupList.filter((g) => g.active).length;
  const inactive = groupList.filter((g) => !g.active).length;

  const filtered = search
    ? groupList.filter(
        (g) =>
          g.name.toLowerCase().includes(search.toLowerCase()) ||
          g.externalId.toLowerCase().includes(search.toLowerCase()) ||
          g.nicheTags.some((t) => (NICHE_LABELS[t as NicheTag] || t).toLowerCase().includes(search.toLowerCase())),
      )
    : groupList;

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
      toastSuccess('Grupo criado com sucesso');
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
      toastSuccess(group.active ? 'Grupo desativado' : 'Grupo ativado');
    } catch (err: any) {
      toastError(err);
    }
  }

  async function deleteGroup(id: string) {
    if (!confirm('Tem certeza que deseja remover este grupo?')) return;
    try {
      await api.delete(`/groups/${id}`);
      mutate();
      toastSuccess('Grupo removido');
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Grupos</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organize suas listas de transmissão por nicho e segmento
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => mutate()} disabled={isLoading}>
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            Novo Grupo
          </Button>
        </div>
      </div>

      {/* Stats */}
      {groupList.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono text-sm font-bold text-foreground tabular-nums">{groupList.length}</span>
            <span className="text-xs text-muted-foreground">total</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 px-3 py-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            <span className="font-mono text-sm font-bold text-foreground tabular-nums">{active}</span>
            <span className="text-xs text-muted-foreground">ativos</span>
          </div>
          {inactive > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2">
              <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono text-sm font-bold text-foreground tabular-nums">{inactive}</span>
              <span className="text-xs text-muted-foreground">inativos</span>
            </div>
          )}
        </div>
      )}

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleCreate}
            className="bg-card border border-border rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Novo grupo</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                placeholder="ID externo (ex: grupo-achados)"
                required
                value={form.externalId}
                onChange={(e) => setForm({ ...form, externalId: e.target.value })}
              />
              <Input
                placeholder="Nome do grupo"
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
                {saving ? 'Criando...' : 'Criar grupo'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Search */}
      {groupList.length > 3 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar grupos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-border bg-card rounded-lg pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      {/* Group cards */}
      <div className="space-y-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-secondary animate-pulse rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-secondary animate-pulse rounded w-1/3" />
                  <div className="h-2 bg-secondary animate-pulse rounded w-1/4" />
                </div>
              </div>
            </div>
          ))
        ) : filtered.length ? (
          filtered.map((group, i) => (
            <motion.div
              key={group.id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={row}
              className={cn(
                'bg-card border rounded-xl p-4 transition-colors',
                group.active ? 'border-border hover:border-border/80' : 'border-border/50 opacity-60',
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', group.active ? 'bg-primary/10' : 'bg-secondary')}>
                  <Users className={cn('h-5 w-5', group.active ? 'text-primary' : 'text-muted-foreground/40')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{group.name}</span>
                    {!group.active && (
                      <span className="text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">inativo</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Hash className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono text-xs text-muted-foreground truncate">{group.externalId}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {group.nicheTags.length > 0 && (
                    <div className="hidden sm:flex gap-1 flex-wrap">
                      {group.nicheTags.slice(0, 3).map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 bg-secondary text-muted-foreground text-[10px] px-2 py-0.5 rounded-full">
                          <Tag className="h-2.5 w-2.5" />
                          {NICHE_LABELS[tag as NicheTag] || tag}
                        </span>
                      ))}
                      {group.nicheTags.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{group.nicheTags.length - 3}</span>
                      )}
                    </div>
                  )}
                  <Switch
                    checked={group.active}
                    onCheckedChange={() => toggleActive(group)}
                    aria-label={group.active ? 'Desativar grupo' : 'Ativar grupo'}
                  />
                  <button
                    onClick={() => deleteGroup(group.id)}
                    className="text-muted-foreground hover:text-destructive p-1"
                    title="Remover grupo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center">
                <Users className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {search ? 'Nenhum grupo encontrado' : 'Nenhum grupo criado'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  {search
                    ? 'Tente buscar com outros termos'
                    : 'Crie grupos para organizar suas listas de transmissão por nicho'}
                </p>
              </div>
              {!search && (
                <Button size="sm" onClick={() => setShowForm(true)}>
                  <Plus className="h-3.5 w-3.5" />
                  Criar primeiro grupo
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
