'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { OfferNormalized, MarketplaceName, NicheTag } from '@/lib/types';
import { MARKETPLACE_LABELS, NICHE_LABELS } from '@/lib/types';

const fetcher = (url: string) => api.get(url);

const MARKETPLACES: MarketplaceName[] = Object.keys(MARKETPLACE_LABELS) as MarketplaceName[];
const NICHES: NicheTag[] = Object.keys(NICHE_LABELS) as NicheTag[];

export default function OffersPage() {
  const [marketplace, setMarketplace] = useState('');
  const [niche, setNiche] = useState('');
  const [search, setSearch] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importForm, setImportForm] = useState({
    marketplace: 'shopee' as MarketplaceName,
    affiliateUrl: '',
    title: '',
    priceCents: '',
    originalPriceCents: '',
    imageUrl: '',
    nicheTag: '' as NicheTag | '',
  });
  const [importing, setImporting] = useState(false);

  const params = new URLSearchParams();
  if (marketplace) params.set('marketplace', marketplace);
  if (niche) params.set('niche', niche);
  if (search) params.set('q', search);
  const queryString = params.toString();
  const url = `/offers${queryString ? `?${queryString}` : ''}`;

  const { data: offers, isLoading, mutate } = useSWR(url, fetcher);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    setImporting(true);
    try {
      await api.post('/offers/import', {
        marketplace: importForm.marketplace,
        affiliateUrl: importForm.affiliateUrl,
        title: importForm.title || undefined,
        priceCents: importForm.priceCents ? Number(importForm.priceCents) : undefined,
        originalPriceCents: importForm.originalPriceCents ? Number(importForm.originalPriceCents) : undefined,
        imageUrl: importForm.imageUrl || undefined,
        nicheTag: importForm.nicheTag || undefined,
      });
      setShowImport(false);
      setImportForm({ marketplace: 'shopee', affiliateUrl: '', title: '', priceCents: '', originalPriceCents: '', imageUrl: '', nicheTag: '' });
      mutate();
    } catch (err: any) {
      alert(err.message || 'Erro ao importar oferta');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Ofertas</h1>
        <button
          onClick={() => setShowImport(!showImport)}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          Importar Oferta
        </button>
      </div>

      {showImport && (
        <form onSubmit={handleImport} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Importar Oferta Manual</h3>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={importForm.marketplace}
              onChange={(e) => setImportForm({ ...importForm, marketplace: e.target.value as MarketplaceName })}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              {MARKETPLACES.map((m) => (
                <option key={m} value={m}>{MARKETPLACE_LABELS[m]}</option>
              ))}
            </select>
            <input
              placeholder="URL de afiliado"
              required
              value={importForm.affiliateUrl}
              onChange={(e) => setImportForm({ ...importForm, affiliateUrl: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <input
              placeholder="Título (opcional)"
              value={importForm.title}
              onChange={(e) => setImportForm({ ...importForm, title: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <input
              placeholder="Preço (centavos)"
              type="number"
              value={importForm.priceCents}
              onChange={(e) => setImportForm({ ...importForm, priceCents: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <input
              placeholder="Preço original (centavos)"
              type="number"
              value={importForm.originalPriceCents}
              onChange={(e) => setImportForm({ ...importForm, originalPriceCents: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <select
              value={importForm.nicheTag}
              onChange={(e) => setImportForm({ ...importForm, nicheTag: e.target.value as NicheTag | '' })}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">Nicho (opcional)</option>
              {NICHES.map((n) => (
                <option key={n} value={n}>{NICHE_LABELS[n]}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={importing}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded"
            >
              {importing ? 'Importando...' : 'Importar'}
            </button>
            <button
              type="button"
              onClick={() => setShowImport(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="flex gap-3 flex-wrap">
        <select
          value={marketplace}
          onChange={(e) => setMarketplace(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
        >
          <option value="">Todos Marketplaces</option>
          {MARKETPLACES.map((m) => (
            <option key={m} value={m}>{MARKETPLACE_LABELS[m]}</option>
          ))}
        </select>
        <select
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
        >
          <option value="">Todos Nichos</option>
          {NICHES.map((n) => (
            <option key={n} value={n}>{NICHE_LABELS[n]}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-2 font-medium text-gray-600">Imagem</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Título</th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">Preço</th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">Desc%</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Marketplace</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Nicho</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Scraped</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td colSpan={7} className="px-4 py-3">
                    <div className="h-5 bg-gray-100 animate-pulse rounded w-full" />
                  </td>
                </tr>
              ))
            ) : (offers as OfferNormalized[])?.length ? (
              (offers as OfferNormalized[]).map((offer) => (
                <tr key={offer.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {offer.imageUrl ? (
                      <img src={offer.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">—</div>
                    )}
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-800 max-w-xs truncate">{offer.title}</td>
                  <td className="px-4 py-2 text-right text-gray-700">R$ {(offer.priceCents / 100).toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">
                    {offer.discountPercent > 0 && (
                      <span className="text-green-600 font-medium">-{offer.discountPercent}%</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{MARKETPLACE_LABELS[offer.marketplace]}</td>
                  <td className="px-4 py-2">
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                      {NICHE_LABELS[offer.nicheTag]}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500 text-xs">
                    {new Date(offer.scrapedAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">Nenhuma oferta encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
