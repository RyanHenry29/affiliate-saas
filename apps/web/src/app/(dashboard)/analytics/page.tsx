'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';

const fetcher = (url: string) => api.get(url);

type Period = '7d' | '30d' | '90d';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d');
  const { data: dispatchStats } = useSWR(`/analytics/dispatches-by-marketplace?period=${period}`, fetcher);
  const { data: niches } = useSWR(`/analytics/top-niches?period=${period}`, fetcher);
  const { data: conversion } = useSWR(`/analytics/conversion?period=${period}`, fetcher);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {(['7d', '30d', '90d'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                period === p
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Disparos por Marketplace</h2>
          <div className="space-y-3">
            {(dispatchStats as any[])?.map((item: any) => {
              const maxCount = Math.max(...(dispatchStats as any[]).map((d: any) => d.count), 1);
              return (
                <div key={item.marketplace} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-28 truncate">{item.marketplace}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full transition-all"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right">{item.count}</span>
                </div>
              );
            })}
            {!(dispatchStats as any[])?.length && (
              <p className="text-sm text-gray-400 text-center py-4">Sem dados para este período.</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Top Nichos</h2>
          <div className="space-y-2">
            {(niches as any[])?.slice(0, 5).map((item: any, idx: number) => (
              <div key={item.niche} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-xs font-bold text-gray-400 w-5">#{idx + 1}</span>
                <span className="text-sm font-medium text-gray-800 flex-1">{item.niche}</span>
                <span className="text-sm text-gray-500">{item.count} disparos</span>
                {item.conversionRate !== undefined && (
                  <span className="text-xs text-green-600 font-medium">{item.conversionRate}%</span>
                )}
              </div>
            ))}
            {!(niches as any[])?.length && (
              <p className="text-sm text-gray-400 text-center py-4">Sem dados para este período.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Métricas de Conversão</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {(conversion as any)?.totalDispatches ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total Disparos</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {(conversion as any)?.sentCount ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Enviados</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">
              {(conversion as any)?.failedCount ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Falhas</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {(conversion as any)?.successRate ?? 0}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Taxa de Sucesso</p>
          </div>
        </div>
      </div>
    </div>
  );
}
