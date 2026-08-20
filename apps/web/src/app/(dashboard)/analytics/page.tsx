'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { BarChart3, Flame, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

const fetcher = (url: string) => api.get(url);

type Period = '7d' | '30d' | '90d';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d');
  const { data: dispatchStats, isLoading: loadingDispatch } = useSWR(`/analytics/dispatches-by-marketplace?period=${period}`, fetcher);
  const { data: niches, isLoading: loadingNiches } = useSWR(`/analytics/top-niches?period=${period}`, fetcher);
  const { data: conversion, isLoading: loadingConversion } = useSWR(`/analytics/conversion?period=${period}`, fetcher);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Desempenho dos disparos por marketplace e nicho
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-secondary p-0.5">
          {(['7d', '30d', '90d'] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setPeriod(p)}
              className={period === p ? 'bg-accent' : ''}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      <div className="surface-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Disparos por Marketplace
        </h2>
        {loadingDispatch && !(dispatchStats as any[])?.length ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-5 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (dispatchStats as any[])?.length ? (
          <div className="space-y-3">
            {(dispatchStats as any[]).map((item: any) => {
              const maxCount = Math.max(...(dispatchStats as any[]).map((d: any) => d.count), 1);
              return (
                <div key={item.marketplace} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-28 truncate">{item.marketplace}</span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono w-10 text-right">{item.count}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Sem dados para este período.
          </p>
        )}
      </div>

      <div className="surface-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Flame className="h-4 w-4 text-muted-foreground" />
          Top Nichos
        </h2>
        {loadingNiches && !(niches as any[])?.length ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-9 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        ) : (niches as any[])?.length ? (
          <div className="space-y-1">
            {(niches as any[])?.slice(0, 5).map((item: any, idx: number) => (
              <div key={item.niche} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-secondary/50 transition-colors">
                <span className="text-xs font-bold text-muted-foreground w-5">#{idx + 1}</span>
                <span className="text-sm font-medium text-foreground flex-1">{item.niche}</span>
                <span className="text-sm text-muted-foreground">{item.count} disparos</span>
                {item.conversionRate !== undefined && (
                  <span className="text-xs text-success font-medium">{item.conversionRate}%</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Sem dados para este período.
          </p>
        )}
      </div>

      <div className="surface-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          Métricas de Conversão
        </h2>
        {loadingConversion ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg bg-secondary/50 p-4 text-center">
                <div className="h-7 w-12 mx-auto bg-muted animate-pulse rounded" />
                <div className="h-3 w-16 mx-auto mt-2 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg bg-secondary/50 p-4 text-center">
            <p className="text-2xl font-bold font-mono text-foreground">
              {(conversion as any)?.totalDispatches ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total Disparos</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-4 text-center">
            <p className="text-2xl font-bold font-mono text-success">
              {(conversion as any)?.sentCount ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Enviados</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-4 text-center">
            <p className="text-2xl font-bold font-mono text-destructive">
              {(conversion as any)?.failedCount ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Falhas</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-4 text-center">
            <p className="text-2xl font-bold font-mono text-success">
              {(conversion as any)?.successRate ?? 0}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Taxa de Sucesso</p>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}