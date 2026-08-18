'use client';
import useSWR from 'swr';
import { api } from './api';

const fetcher = (url: string) => api.get(url);

export function useOffers() {
  const { data, error, isLoading, mutate } = useSWR('/offers', fetcher, {
    refreshInterval: 30_000,
  });
  return { offers: data as any[], error, isLoading, refresh: mutate };
}

export function useInstances() {
  const { data, error, isLoading, mutate } = useSWR('/messaging/instances', fetcher, {
    refreshInterval: 10_000,
  });
  return { instances: data as any[], error, isLoading, refresh: mutate };
}

export function useAudit() {
  const { data, error, isLoading, mutate } = useSWR('/audit', fetcher, {
    refreshInterval: 15_000,
  });
  return { audit: data as any[], error, isLoading, refresh: mutate };
}

export function useBillingStatus() {
  const { data, error, isLoading, mutate } = useSWR('/billing/status', fetcher);
  return { billing: data as any, error, isLoading, refresh: mutate };
}

export function useAiProviders() {
  const { data, error, isLoading, mutate } = useSWR('/ai-provider', fetcher);
  return { providers: data as any[], error, isLoading, refresh: mutate };
}

export function useAutomationRules() {
  const { data, error, isLoading, mutate } = useSWR('/automation', fetcher);
  return { rules: data as any[], error, isLoading, refresh: mutate };
}
