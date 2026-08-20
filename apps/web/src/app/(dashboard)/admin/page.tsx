'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  Building2,
  CreditCard,
  Flag,
  KeyRound,
  LayoutDashboard,
  Lock,
  MailCheck,
  Pencil,
  QrCode,
  ScrollText,
  Activity,
  Tag,
  Trash2,
  UserCog,
  Webhook,
} from 'lucide-react';
import { api } from '@/lib/api';
import type {
  AdminInvite,
  AdminUser,
  AuthUser,
  PaymentConfig,
  PlanConfig,
  PlanTier,
  Role,
  SubscriptionStatus,
  Tenant,
} from '@/lib/types';
import { PLAN_LABELS, ROLE_LABELS, STATUS_COLORS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toastError, toastSuccess } from '@/lib/toast';

const fetcher = (url: string) => api.get(url);

type AdminTab =
  | 'overview'
  | 'tenants'
  | 'users'
  | 'plans'
  | 'payment'
  | 'invites'
  | 'flags'
  | 'apikeys'
  | 'webhooks'
  | 'audit'
  | 'monitoring';

const TABS: { key: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'overview', label: 'Visão geral', icon: LayoutDashboard },
  { key: 'tenants', label: 'Tenants', icon: Building2 },
  { key: 'users', label: 'Usuários', icon: UserCog },
  { key: 'plans', label: 'Planos & Preços', icon: Tag },
  { key: 'payment', label: 'Pagamento (PIX)', icon: QrCode },
  { key: 'invites', label: 'Convites', icon: MailCheck },
  { key: 'flags', label: 'Flags', icon: Flag },
  { key: 'apikeys', label: 'API Keys', icon: KeyRound },
  { key: 'webhooks', label: 'Webhooks', icon: Webhook },
  { key: 'audit', label: 'Auditoria', icon: ScrollText },
  { key: 'monitoring', label: 'Monitoramento', icon: Activity },
];

const PLAN_TIERS: PlanTier[] = ['STARTER', 'PRO', 'AGENCY'];
const SUB_STATUSES: SubscriptionStatus[] = ['ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED'];

const inputCls =
  'border border-input bg-card rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full';

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="surface-card p-4 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold font-mono text-foreground leading-none">
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('overview');
  const { data: user } = useSWR('/auth/me', fetcher);
  const { data: metrics } = useSWR('/admin/metrics', fetcher);
  const { data: tenants, mutate: mutateTenants } = useSWR('/admin/tenants', fetcher);
  const { data: users, mutate: mutateUsers } = useSWR('/admin/users', fetcher);
  const { data: plans, mutate: mutatePlans } = useSWR('/admin/plans', fetcher);
  const { data: paymentConfig, mutate: mutatePayment } = useSWR('/admin/payment-config', fetcher);
  const { data: invites, mutate: mutateInvites } = useSWR('/admin/invites', fetcher);
  const { data: flags, mutate: mutateFlags } = useSWR('/admin/feature-flags', fetcher);
  const { data: apiKeys, mutate: mutateKeys } = useSWR('/api-keys', fetcher);
  const { data: webhooks, mutate: mutateWebhooks } = useSWR('/webhooks', fetcher);
  const { data: audit, mutate: mutateAudit } = useSWR('/audit', fetcher);
  const { data: queue } = useSWR('/monitoring/queue', fetcher);
  const { data: monitorErrors } = useSWR('/monitoring/errors', fetcher);

  const [showCreateTenant, setShowCreateTenant] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [saving, setSaving] = useState(false);

  if (!(user as AuthUser)?.isAdminMaster) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="surface-card p-8 text-center max-w-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-bold text-foreground mb-1">Acesso Restrito</h1>
          <p className="text-sm text-muted-foreground">
            Somente administradores podem acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  async function run(action: () => Promise<unknown>, successMsg: string) {
    setSaving(true);
    try {
      await action();
      toastSuccess(successMsg);
    } catch (err: any) {
      toastError(err);
    } finally {
      setSaving(false);
    }
  }

  const metricsItems: { label: string; value: number; icon: React.ReactNode }[] = [
    { label: 'Tenants', value: (metrics as any)?.tenants ?? 0, icon: <Building2 className="h-5 w-5" /> },
    { label: 'Usuários', value: (metrics as any)?.users ?? 0, icon: <UserCog className="h-5 w-5" /> },
    { label: 'Grupos', value: (metrics as any)?.groups ?? 0, icon: <UserCog className="h-5 w-5" /> },
    { label: 'Ofertas', value: (metrics as any)?.offers ?? 0, icon: <Tag className="h-5 w-5" /> },
    { label: 'Instâncias', value: (metrics as any)?.instances ?? 0, icon: <CreditCard className="h-5 w-5" /> },
    { label: 'Disparos', value: (metrics as any)?.dispatches ?? 0, icon: <LayoutDashboard className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Administração</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestão global do SaaS: tenants, usuários, planos e pagamento
          </p>
        </div>
        {(tab === 'tenants') && (
          <Button onClick={() => setShowCreateTenant(true)}>
            <Building2 className="h-4 w-4 mr-1" />
            Novo tenant
          </Button>
        )}
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

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {metricsItems.map((m) => (
              <MetricCard key={m.label} {...m} />
            ))}
          </div>
          <div className="surface-card overflow-x-auto">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">
                Últimos tenants
              </h2>
            </div>
            <div className="divide-y divide-border">
              {(tenants as Tenant[])?.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.subscription
                        ? `${PLAN_LABELS[t.subscription.plan]} · ${t.subscription.status}`
                        : 'Sem assinatura'}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingTenant(t)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={`Gerenciar ${t.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {!(tenants as Tenant[])?.length && (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhum tenant cadastrado.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'tenants' && (
        <div className="surface-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Nome</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Plano</th>
                <th className="text-center px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Usuários</th>
                <th className="text-center px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Grupos</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(tenants as Tenant[])?.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-foreground">
                    {t.name}
                    {t.isAdminMaster && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-primary border border-primary/30 rounded px-1.5 py-0.5">
                        Master
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {t.subscription ? PLAN_LABELS[t.subscription.plan] : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono text-muted-foreground">
                    {t._count?.users ?? 0}
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono text-muted-foreground">
                    {t._count?.groups ?? 0}
                  </td>
                  <td className="px-4 py-2.5">
                    {t.subscription?.status && (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[t.subscription.status] || 'text-muted-foreground bg-muted'}`}>
                        {t.subscription.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Gerenciar ${t.name}`}
                        onClick={() => setEditingTenant(t)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {!t.isAdminMaster && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Excluir ${t.name}`}
                          onClick={() =>
                            run(async () => {
                              await api.admin.deleteTenant(t.id);
                              mutateTenants();
                            }, 'Tenant excluído')
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!(tenants as Tenant[])?.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Nenhum tenant cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'users' && (
        <div className="surface-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Tenant</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Função</th>
                <th className="text-center px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Ativo</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(users as AdminUser[])?.map((u) => {
                const isMasterUser = u.tenant.isAdminMaster;
                return (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-2.5 text-foreground">{u.email}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{u.tenant.name}</td>
                    <td className="px-4 py-2.5">
                      <select
                        className={inputCls + ' w-auto'}
                        value={u.role}
                        disabled={isMasterUser || saving}
                        onChange={(e) =>
                          run(async () => {
                            await api.admin.setUserRole(u.id, e.target.value);
                            mutateUsers();
                          }, `Função atualizada para ${ROLE_LABELS[e.target.value as Role]}`)
                        }
                      >
                        {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Switch
                        checked={u.isActive}
                        disabled={isMasterUser || saving}
                        onCheckedChange={(checked) =>
                          run(async () => {
                            await api.admin.setUserStatus(u.id, checked);
                            mutateUsers();
                          }, checked ? 'Usuário ativado' : 'Usuário desativado')
                        }
                        aria-label={`Ativar/desativar ${u.email}`}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end">
                        {!isMasterUser && (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Excluir ${u.email}`}
                            onClick={() =>
                              run(async () => {
                                await api.admin.deleteUser(u.id);
                                mutateUsers();
                              }, 'Usuário excluído')
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!(users as AdminUser[])?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'plans' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {(plans as PlanConfig[])?.map((plan) => (
            <PlanEditor
              key={plan.tier}
              plan={plan}
              saving={saving}
              onSave={async (data) => {
                await api.admin.updatePlan(plan.tier, data);
                mutatePlans();
              }}
            />
          ))}
          {!(plans as PlanConfig[])?.length && (
            <p className="text-sm text-muted-foreground col-span-full text-center py-8">
              Nenhum plano configurado. Rode o seed para criar os padrões.
            </p>
          )}
        </div>
      )}

      {tab === 'payment' && (
        <PaymentSettingsEditor
          config={paymentConfig as PaymentConfig}
          saving={saving}
          onSave={async (data) => {
            await api.admin.updatePaymentConfig(data);
            mutatePayment();
          }}
        />
      )}

      {tab === 'invites' && (
        <div className="surface-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Tenant</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Criado em</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Expira em</th>
              </tr>
            </thead>
            <tbody>
              {(invites as AdminInvite[])?.map((inv) => (
                <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-2.5 text-foreground">{inv.email}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{inv.tenantName ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      inv.status === 'PENDING'
                        ? 'text-warning bg-warning/10'
                        : 'text-success bg-success/10'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs font-mono">
                    {new Date(inv.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs font-mono">
                    {inv.expiresAt
                      ? new Date(inv.expiresAt).toLocaleDateString('pt-BR')
                      : '—'}
                  </td>
                </tr>
              ))}
              {!(invites as AdminInvite[])?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Nenhum convite cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'flags' && (
        <div className="surface-card p-4 space-y-3 max-w-xl">
          {(flags as any[])?.map((flag: any) => (
            <div key={`${flag.key}-${flag.tenantId ?? 'global'}`} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground font-mono">{flag.key}</p>
                {flag.description && <p className="text-xs text-muted-foreground mt-0.5">{flag.description}</p>}
                {flag.tenantId && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Aplicada apenas ao tenant {flag.tenantId}
                  </p>
                )}
              </div>
              <Switch
                checked={flag.enabled}
                disabled={saving}
                onCheckedChange={() =>
                  run(async () => {
                    await api.admin.upsertFeatureFlag({
                      key: flag.key,
                      enabled: !flag.enabled,
                      tenantId: flag.tenantId,
                      description: flag.description,
                    });
                    mutateFlags();
                  }, `Flag ${flag.key} ${!flag.enabled ? 'ativada' : 'desativada'}`)
                }
                aria-label={`Alternar flag ${flag.key}`}
              />
            </div>
          ))}
          {!(flags as any[])?.length && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma flag cadastrada.</p>
          )}
        </div>
      )}

      {tab === 'apikeys' && (
        <ApiKeysPanel
          keys={(apiKeys as any[]) ?? []}
          saving={saving}
          onCreate={async (name) => {
            await api.apiKeys.create({ name });
            mutateKeys();
          }}
          onRevoke={async (id) => {
            await api.apiKeys.revoke(id);
            mutateKeys();
          }}
        />
      )}

      {tab === 'webhooks' && (
        <WebhooksPanel
          webhooks={(webhooks as any[]) ?? []}
          saving={saving}
          onCreate={async (url, events) => {
            await api.webhooks.create({ url, events });
            mutateWebhooks();
          }}
          onUpdate={async (id, data) => {
            await api.webhooks.update(id, data);
            mutateWebhooks();
          }}
          onDelete={async (id) => {
            await api.webhooks.delete(id);
            mutateWebhooks();
          }}
        />
      )}

      {tab === 'audit' && <AuditPanel rows={(audit as any[]) ?? []} />}

      {tab === 'monitoring' && (
        <MonitoringPanel queue={queue as any} errors={(monitorErrors as any[]) ?? []} />
      )}

      {showCreateTenant && (
        <CreateTenantDialog
          onClose={() => setShowCreateTenant(false)}
          onCreated={async (name, plan) => {
            await api.admin.createTenant({ name, plan });
            mutateTenants();
          }}
          saving={saving}
        />
      )}

      {editingTenant && (
        <TenantSubscriptionDialog
          tenant={editingTenant}
          onClose={() => setEditingTenant(null)}
          onSaved={async (data) => {
            await api.admin.setTenantSubscription(editingTenant.id, data);
            mutateTenants();
          }}
          saving={saving}
        />
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function PlanEditor({
  plan,
  saving,
  onSave,
}: {
  plan: PlanConfig;
  saving: boolean;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}) {
  const [name, setName] = useState(plan.name);
  const [priceBRL, setPriceBRL] = useState((plan.priceCents / 100).toFixed(2));
  const [apiCallsLimit, setApiCallsLimit] = useState(plan.apiCallsLimit);
  const [dispatchesLimit, setDispatchesLimit] = useState(plan.dispatchesLimit);
  const [features, setFeatures] = useState(plan.features.join('\n'));
  const [active, setActive] = useState(plan.active);

  return (
    <div className="surface-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{PLAN_LABELS[plan.tier]}</h3>
        <Switch checked={active} onCheckedChange={setActive} aria-label={`Ativar plano ${plan.tier}`} />
      </div>
      <Field label="Nome do plano">
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Preço (R$/mês)">
          <input
            className={inputCls}
            type="number"
            step="0.01"
            value={priceBRL}
            onChange={(e) => setPriceBRL(e.target.value)}
          />
        </Field>
        <Field label="Ofertas processadas/mês">
          <input
            className={inputCls}
            type="number"
            value={apiCallsLimit}
            onChange={(e) => setApiCallsLimit(Number(e.target.value))}
          />
        </Field>
      </div>
      <Field label="Disparos/mês">
        <input
          className={inputCls}
          type="number"
          value={dispatchesLimit}
          onChange={(e) => setDispatchesLimit(Number(e.target.value))}
        />
      </Field>
      <Field label="Benefícios (um por linha)">
        <textarea
          className={inputCls + ' min-h-[120px] resize-y'}
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
        />
      </Field>
      <Button
        className="w-full"
        disabled={saving}
        onClick={() =>
          onSave({
            name,
            priceCents: Math.round(Number(priceBRL) * 100),
            apiCallsLimit,
            dispatchesLimit,
            features: features.split('\n').map((f) => f.trim()).filter(Boolean),
            active,
          }).then(() => toastSuccess(`Plano ${plan.tier} salvo`))
        }
      >
        Salvar plano
      </Button>
    </div>
  );
}

function PaymentSettingsEditor({
  config,
  saving,
  onSave,
}: {
  config: PaymentConfig;
  saving: boolean;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}) {
  const [pixKey, setPixKey] = useState(config?.pixKey ?? '');
  const [pixMerchantName, setPixMerchantName] = useState(config?.pixMerchantName ?? '');
  const [pixCity, setPixCity] = useState(config?.pixCity ?? '');
  const [pixCopiaECola, setPixCopiaECola] = useState(config?.pixCopiaECola ?? '');
  const [pixEnabled, setPixEnabled] = useState(config?.pixEnabled ?? false);
  const [pixInstructions, setPixInstructions] = useState(config?.pixInstructions ?? '');

  return (
    <div className="max-w-2xl space-y-5">
      <div className="surface-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">PIX de recebimento</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              QR code usado nos pagamentos quando o gateway (Mercado Pago) não
              está configurado.
            </p>
          </div>
          <Switch checked={pixEnabled} onCheckedChange={setPixEnabled} aria-label="Ativar PIX manual" />
        </div>
        <Field label="Chave PIX">
          <input className={inputCls} value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder="email, CPF, CNPJ ou celular" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nome do recebedor">
            <input className={inputCls} value={pixMerchantName} onChange={(e) => setPixMerchantName(e.target.value)} />
          </Field>
          <Field label="Cidade">
            <input className={inputCls} value={pixCity} onChange={(e) => setPixCity(e.target.value)} />
          </Field>
        </div>
        <Field label="Código copia-e-cola (gerado pelo seu banco)">
          <textarea
            className={inputCls + ' min-h-[120px] resize-y font-mono text-xs'}
            value={pixCopiaECola}
            onChange={(e) => setPixCopiaECola(e.target.value)}
            placeholder="00020126..."
          />
        </Field>
        <Field label="Instruções exibidas ao cliente">
          <textarea
            className={inputCls + ' min-h-[80px] resize-y'}
            value={pixInstructions}
            onChange={(e) => setPixInstructions(e.target.value)}
          />
        </Field>
        <Button
          className="w-full"
          disabled={saving}
          onClick={() =>
            onSave({
              pixKey,
              pixMerchantName,
              pixCity,
              pixCopiaECola,
              pixEnabled,
              pixInstructions,
            }).then(() => toastSuccess('Configuração de pagamento salva'))
          }
        >
          Salvar configuração
        </Button>
      </div>
      <div className="surface-card p-4 text-sm text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground">Como funciona</p>
        <p>
          Quando <code className="text-primary font-mono text-xs">MERCADOPAGO_ACCESS_TOKEN</code>{' '}
          estiver definido no ambiente da API, o PIX é gerado automaticamente pelo gateway e o QR
          exibido vem do Mercado Pago. Sem o token, o sistema usa este QR copia-e-cola estático — o
          pagamento é confirmado manualmente (ou pelo webhook de confirmação).
        </p>
      </div>
    </div>
  );
}

function CreateTenantDialog({
  onClose,
  onCreated,
  saving,
}: {
  onClose: () => void;
  onCreated: (name: string, plan?: string) => Promise<void>;
  saving: boolean;
}) {
  const [name, setName] = useState('');
  const [plan, setPlan] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="surface-card w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-foreground">Criar tenant</h3>
        <Field label="Nome do tenant">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </Field>
        <Field label="Plano inicial (opcional)">
          <select className={inputCls} value={plan} onChange={(e) => setPlan(e.target.value)}>
            <option value="">Sem plano (trial)</option>
            {PLAN_TIERS.map((t) => (
              <option key={t} value={t}>{PLAN_LABELS[t]}</option>
            ))}
          </select>
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            disabled={saving || !name.trim()}
            onClick={() =>
              onCreated(name.trim(), plan || undefined).then(() => {
                toastSuccess('Tenant criado');
                onClose();
              })
            }
          >
            Criar
          </Button>
        </div>
      </div>
    </div>
  );
}

function TenantSubscriptionDialog({
  tenant,
  onClose,
  onSaved,
  saving,
}: {
  tenant: Tenant;
  onClose: () => void;
  onSaved: (data: { plan: string; status: string; currentPeriodEnd?: string }) => Promise<void>;
  saving: boolean;
}) {
  const [plan, setPlan] = useState<PlanTier>(tenant.subscription?.plan ?? 'STARTER');
  const [status, setStatus] = useState<SubscriptionStatus>(tenant.subscription?.status ?? 'TRIALING');
  const [periodEnd, setPeriodEnd] = useState(
    tenant.subscription?.currentPeriodEnd
      ? new Date(tenant.subscription.currentPeriodEnd).toISOString().slice(0, 10)
      : '',
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="surface-card w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-foreground">
          Assinatura — {tenant.name}
        </h3>
        <Field label="Plano">
          <select className={inputCls} value={plan} onChange={(e) => setPlan(e.target.value as PlanTier)}>
            {PLAN_TIERS.map((t) => (
              <option key={t} value={t}>{PLAN_LABELS[t]}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}>
            {SUB_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Renovação (data)">
          <input className={inputCls} type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            disabled={saving}
            onClick={() =>
              onSaved({
                plan,
                status,
                currentPeriodEnd: periodEnd
                  ? new Date(periodEnd + 'T12:00:00').toISOString()
                  : undefined,
              }).then(() => {
                toastSuccess('Assinatura atualizada');
                onClose();
              })
            }
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}

function ApiKeysPanel({
  keys,
  saving,
  onCreate,
  onRevoke,
}: {
  keys: any[];
  saving: boolean;
  onCreate: (name: string) => Promise<void>;
  onRevoke: (id: string) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const act = async (fn: () => Promise<void>, msg: string) => {
    try {
      await fn();
      toastSuccess(msg);
    } catch (e: any) {
      toastError(e);
    }
  };
  return (
    <div className="space-y-4">
      <div className="surface-card p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Nome da chave
          </label>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Integração interna"
          />
        </div>
        <Button
          disabled={saving || !name.trim()}
          onClick={() => act(async () => { await onCreate(name.trim()); setName(''); }, 'API Key criada')}
        >
          Criar chave
        </Button>
      </div>
      <div className="surface-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Nome</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Prefixo</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Criada em</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Último uso</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                <td className="px-4 py-2.5 text-foreground">{k.name}</td>
                <td className="px-4 py-2.5 font-mono text-muted-foreground">{k.prefix}</td>
                <td className="px-4 py-2.5 text-muted-foreground text-xs font-mono">
                  {k.createdAt ? new Date(k.createdAt).toLocaleString('pt-BR') : '—'}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground text-xs font-mono">
                  {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString('pt-BR') : 'nunca'}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Revogar ${k.name}`}
                    disabled={saving}
                    onClick={() => act(async () => { await onRevoke(k.id); }, 'API Key revogada')}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {!keys.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhuma API key cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WebhooksPanel({
  webhooks,
  saving,
  onCreate,
  onUpdate,
  onDelete,
}: {
  webhooks: any[];
  saving: boolean;
  onCreate: (url: string, events: string[]) => Promise<void>;
  onUpdate: (id: string, data: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState('');
  const act = async (fn: () => Promise<void>, msg: string) => {
    try {
      await fn();
      toastSuccess(msg);
    } catch (e: any) {
      toastError(e);
    }
  };
  return (
    <div className="space-y-4">
      <div className="surface-card p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">URL do webhook</label>
          <input
            className={inputCls}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://exemplo.com/webhook"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Eventos (vírgula)</label>
          <input
            className={inputCls}
            value={events}
            onChange={(e) => setEvents(e.target.value)}
            placeholder="offer.published, dispatch.sent"
          />
        </div>
        <Button
          disabled={saving || !url.trim()}
          onClick={() =>
            act(async () => {
              await onCreate(
                url.trim(),
                events.split(',').map((s) => s.trim()).filter(Boolean),
              );
              setUrl('');
              setEvents('');
            }, 'Webhook criado')
          }
        >
          Criar webhook
        </Button>
      </div>
      <div className="surface-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">URL</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Eventos</th>
              <th className="text-center px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Ativo</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody>
            {webhooks.map((w) => (
              <tr key={w.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                <td className="px-4 py-2.5 text-foreground break-all">{w.url}</td>
                <td className="px-4 py-2.5 text-muted-foreground text-xs">{(w.events ?? []).join(', ')}</td>
                <td className="px-4 py-2.5 text-center">
                  <Switch
                    checked={!!w.isActive}
                    disabled={saving}
                    onCheckedChange={(v) =>
                      act(async () => { await onUpdate(w.id, { isActive: v }); }, 'Webhook atualizado')
                    }
                    aria-label={`Ativar ${w.url}`}
                  />
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir ${w.url}`}
                    disabled={saving}
                    onClick={() => act(async () => { await onDelete(w.id); }, 'Webhook excluído')}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {!webhooks.length && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhum webhook cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditPanel({ rows }: { rows: any[] }) {
  return (
    <div className="surface-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Data</th>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Ação</th>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Entidade</th>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">ID</th>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id ?? i} className="border-b border-border last:border-0 hover:bg-secondary/50">
              <td className="px-4 py-2.5 text-muted-foreground text-xs font-mono whitespace-nowrap">
                {r.createdAt ? new Date(r.createdAt).toLocaleString('pt-BR') : '—'}
              </td>
              <td className="px-4 py-2.5 text-foreground">{r.action}</td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {r.entity}
                {r.tenantId ? ` · ${r.tenantId}` : ''}
              </td>
              <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{r.entityId ?? '—'}</td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-xs truncate">
                {r.details ? JSON.stringify(r.details) : '—'}
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                Nenhum registro de auditoria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function MonitoringPanel({ queue, errors }: { queue: any; errors: any[] }) {
  const q = queue ?? {};
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Na fila" value={q.waiting ?? 0} icon={<Activity className="h-5 w-5" />} />
        <MetricCard label="Ativos" value={q.active ?? 0} icon={<Activity className="h-5 w-5" />} />
        <MetricCard label="Concluídos" value={q.completed ?? 0} icon={<Activity className="h-5 w-5" />} />
        <MetricCard label="Falhados" value={q.failed ?? 0} icon={<Activity className="h-5 w-5" />} />
      </div>
      <div className="surface-card overflow-x-auto">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Erros recentes</h2>
        </div>
        <div className="divide-y divide-border">
          {(errors ?? []).map((e, i) => (
            <div key={e.id ?? i} className="px-4 py-3 text-sm">
              <p className="text-foreground">{e.message ?? e.error ?? 'Erro'}</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                {e.createdAt ? new Date(e.createdAt).toLocaleString('pt-BR') : ''}{' '}
                {e.context ? JSON.stringify(e.context) : ''}
              </p>
            </div>
          ))}
          {!(errors ?? []).length && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum erro registrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}