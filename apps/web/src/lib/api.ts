"use client";

import { createClient } from "@/lib/supabase/client";
import type {
  ApiErrorBody,
  AuthUserResponse,
  Group,
  MessagingInstance,
  NicheTag,
  Offer,
} from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

function apiError(data: ApiErrorBody | undefined, status: number): Error {
  const msg = Array.isArray(data?.message)
    ? data!.message!.join(", ")
    : data?.message;
  const err = new Error(msg ?? `Erro na requisição (${status})`);
  (err as Error & { status?: number }).status = status;
  return err;
}

let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
  const supabase = createClient();
  if (!refreshPromise) {
    refreshPromise = supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) throw new Error("Sem sessão");
    });
  }
  try {
    await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  let res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && session) {
    try {
      await refreshAccessToken();
      const {
        data: { session: fresh },
      } = await supabase.auth.getSession();
      if (fresh?.access_token) {
        headers.set("Authorization", `Bearer ${fresh.access_token}`);
        res = await fetch(`${API_URL}${path}`, {
          ...options,
          headers,
        });
      }
    } catch {
      await supabase.auth.signOut();
      throw new Error("Sessão expirada. Faça login novamente.");
    }
  }

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => null);
  if (!res.ok) throw apiError(body, res.status);
  return body as T;
}

export const api = {
  login: (email: string, password: string) =>
    apiRequest<{ user: AuthUserResponse }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, tenantName: string) =>
    apiRequest<{ user: AuthUserResponse }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, tenantName }),
    }),
  logout: () => apiRequest<void>("/auth/logout", { method: "POST" }),
  me: () => apiRequest<AuthUserResponse>("/auth/me"),
  listGroups: () => apiRequest<Group[]>("/groups"),
  createGroup: (data: {
    externalId: string;
    name: string;
    nicheTags: NicheTag[];
    active?: boolean;
  }) =>
    apiRequest<Group>("/groups", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateGroup: (id: string, data: Partial<Group>) =>
    apiRequest<Group>(`/groups/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteGroup: (id: string) =>
    apiRequest<{ id: string }>(`/groups/${id}`, { method: "DELETE" }),
  listOffers: (nicheTag?: NicheTag) =>
    apiRequest<Offer[]>(
      `/offers${nicheTag ? `?nicheTag=${encodeURIComponent(nicheTag)}` : ""}`,
    ),
  mineShopee: () =>
    apiRequest<{
      inserted: number;
      duplicates: number;
      dispatched: number;
    }>("/offers/mine/shopee", { method: "POST" }),
  listInstances: () =>
    apiRequest<MessagingInstance[]>("/messaging/instances"),
  createInstance: (provider: string, externalId: string) =>
    apiRequest<MessagingInstance>("/messaging/instances", {
      method: "POST",
      body: JSON.stringify({ provider, externalId }),
    }),
  refreshInstanceStatuses: () =>
    apiRequest<{ id: string; status: string }[]>(
      "/messaging/instances/refresh",
      { method: "POST" },
    ),
  aiProvider: {
    get: () => apiRequest<unknown>("/ai-provider"),
    upsert: (data: Record<string, unknown>) =>
      apiRequest<unknown>("/ai-provider", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },
  automation: {
    list: () => apiRequest<unknown[]>("/automation"),
    create: (data: Record<string, unknown>) =>
      apiRequest<unknown>("/automation", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Record<string, unknown>) =>
      apiRequest<unknown>(`/automation/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<void>(`/automation/${id}`, { method: "DELETE" }),
  },
  billing: {
    get: () => apiRequest<unknown>("/billing"),
    status: () => apiRequest<import("./types").BillingStatus>("/billing/status"),
    invoices: () =>
      apiRequest<
        Array<{
          id: string;
          createdAt: string;
          amountCents: number;
          status: string;
          method: string;
          description: string;
        }>
      >("/billing/invoices"),
    plans: () => apiRequest<import("./types").PlanConfig[]>("/billing/plans"),
    paymentConfig: () =>
      apiRequest<import("./types").PaymentConfig>("/billing/payment-config"),
  },
  payments: {
    pix: (data: { amount: number; description?: string; plan?: string }) =>
      apiRequest<{ paymentId: string; pix: any; external: boolean }>(
        "/payments/pix",
        { method: "POST", body: JSON.stringify(data) },
      ),
    get: (id: string) => apiRequest<any>(`/payments/${id}`),
  },
  connections: {
    list: () => apiRequest<unknown[]>("/connections"),
    upsert: (data: Record<string, unknown>) =>
      apiRequest<unknown>("/connections", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<void>(`/connections/${id}`, { method: "DELETE" }),
    sync: (id: string) =>
      apiRequest<unknown>(`/connections/${id}/sync`, { method: "POST" }),
  },
  admin: {
    tenants: () => apiRequest<unknown[]>("/admin/tenants"),
    createTenant: (data: Record<string, unknown>) =>
      apiRequest<unknown>("/admin/tenants", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateTenant: (id: string, data: Record<string, unknown>) =>
      apiRequest<unknown>(`/admin/tenants/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteTenant: (id: string) =>
      apiRequest<void>(`/admin/tenants/${id}`, { method: "DELETE" }),
    setTenantSubscription: (
      id: string,
      data: { plan: string; status: string; currentPeriodEnd?: string },
    ) =>
      apiRequest<unknown>(`/admin/tenants/${id}/subscription`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    users: () => apiRequest<import("./types").AdminUser[]>("/admin/users"),
    setUserRole: (id: string, role: string) =>
      apiRequest<unknown>(`/admin/users/${id}/role`, {
        method: "PUT",
        body: JSON.stringify({ role }),
      }),
    setUserStatus: (id: string, isActive: boolean) =>
      apiRequest<unknown>(`/admin/users/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ isActive }),
      }),
    deleteUser: (id: string) =>
      apiRequest<void>(`/admin/users/${id}`, { method: "DELETE" }),
    plans: () => apiRequest<import("./types").PlanConfig[]>("/admin/plans"),
    updatePlan: (tier: string, data: Record<string, unknown>) =>
      apiRequest<unknown>(`/admin/plans/${tier}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    paymentConfig: () =>
      apiRequest<import("./types").PaymentConfig>("/admin/payment-config"),
    updatePaymentConfig: (data: Record<string, unknown>) =>
      apiRequest<unknown>("/admin/payment-config", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    invites: () => apiRequest<import("./types").AdminInvite[]>("/admin/invites"),
    metrics: () => apiRequest<Record<string, number>>("/admin/metrics"),
    featureFlags: () => apiRequest<unknown[]>("/admin/feature-flags"),
    upsertFeatureFlag: (data: Record<string, unknown>) =>
      apiRequest<unknown>("/admin/feature-flags", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  audit: {
    list: () => apiRequest<unknown[]>("/audit"),
  },
  apiKeys: {
    list: () => apiRequest<unknown[]>("/api-keys"),
    create: (data: Record<string, unknown>) =>
      apiRequest<unknown>("/api-keys", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    revoke: (id: string) =>
      apiRequest<void>(`/api-keys/${id}`, { method: "DELETE" }),
  },
  webhooks: {
    list: () => apiRequest<unknown[]>("/webhooks"),
    create: (data: Record<string, unknown>) =>
      apiRequest<unknown>("/webhooks", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Record<string, unknown>) =>
      apiRequest<unknown>(`/webhooks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<void>(`/webhooks/${id}`, { method: "DELETE" }),
  },
  analytics: {
    overview: (period?: string) =>
      apiRequest<unknown>(
        `/analytics/overview${period ? `?period=${period}` : ""}`,
      ),
    dispatchesByHour: () => apiRequest<unknown[]>("/analytics/dispatches-by-hour"),
    marketplaceDispatches: (period?: string) =>
      apiRequest<unknown[]>(
        `/analytics/dispatches-by-marketplace${period ? `?period=${period}` : ""}`,
      ),
    topNiches: (period?: string) =>
      apiRequest<unknown[]>(
        `/analytics/top-niches${period ? `?period=${period}` : ""}`,
      ),
    conversion: (period?: string) =>
      apiRequest<unknown>(
        `/analytics/conversion${period ? `?period=${period}` : ""}`,
      ),
  },
  monitoring: {
    queue: () => apiRequest<unknown>("/monitoring/queue"),
    errors: () => apiRequest<unknown[]>("/monitoring/errors"),
  },
  get: <T = any>(path: string) => apiRequest<T>(path),
  post: <T = any>(path: string, body?: unknown) =>
    apiRequest<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T = any>(path: string, body?: unknown) =>
    apiRequest<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T = any>(path: string, body?: unknown) =>
    apiRequest<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T = any>(path: string) =>
    apiRequest<T>(path, { method: "DELETE" }),
};

export const aiProviderApi = {
  list: () => apiRequest<unknown>("/ai-provider"),
  upsert: (data: { provider: string; apiKey: string; model: string }) =>
    apiRequest<unknown>("/ai-provider", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  test: (id: string) =>
    apiRequest<{ message?: string }>(`/ai-provider/${id}/test`, {
      method: "POST",
    }),
  remove: (id: string) =>
    apiRequest<void>(`/ai-provider/${id}`, { method: "DELETE" }),
};

export type { ApiErrorBody };
