'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { motion, useReducedMotion, AnimatePresence, type Variants } from 'framer-motion';
import { Import, RefreshCw, X, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { OfferNormalized, MarketplaceName, NicheTag, OfferStatus } from '@/lib/types';
import {
  MARKETPLACE_LABELS,
  NICHE_LABELS,
  OFFER_STATUS_CLS,
  OFFER_STATUS_LABELS,
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toastError, toastSuccess } from '@/lib/toast';
import { OfferDrawer } from '@/components/offers/offer-drawer';

const fetcher = (url: string) => api.get(url);

const MARKETPLACES: MarketplaceName[] = Object.keys(MARKETPLACE_LABELS) as MarketplaceName[];
const NICHES: NicheTag[] = Object.keys(NICHE_LABELS) as NicheTag[];

export default function OffersPage() {
  const reduce = useReducedMotion();
  const [marketplace, setMarketplace] = useState('');
  const [niche, setNiche] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [isAiSearch, setIsAiSearch] = useState(false);
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
  const [selected, setSelected] = useState<OfferNormalized | null>(null);

  const params = new URLSearchParams();
  if (marketplace) params.set('marketplace', marketplace);
  if (niche) params.set('niche', niche);
  if (status) params.set('status', status);
  if (search) params.set(isAiSearch ? 'query' : 'q', search);
  const queryString = params.toString();
  const url = isAiSearch
    ? `/offers/ai-search${search ? `?query=${encodeURIComponent(search)}` : ''}`
    : `/offers${queryString ? `?${queryString}` : ''}`;

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
      toastSuccess('Oferta importada com sucesso');
    } catch (err: any) {
      toastError(err, 'Erro ao importar oferta');
    } finally {
      setImporting(false);
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
          <h1 className="text-xl font-bold text-foreground">Ofertas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie ofertas minerdas dos marketplaces integrados
          </p>
        </div>
        <Button onClick={() => setShowImport(!showImport)}>
          <Import className="h-4 w-4" />
          Importar Oferta
        </Button>
      </div>

      {showImport && (
        <motion.form
          initial={reduce ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleImport}
          className="bg-card border border-border rounded-lg p-4 space-y-3"
        >
          <h3 className="text-sm font-semibold text-foreground">Importar Oferta Manual</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={importForm.marketplace}
              onChange={(e) => setImportForm({ ...importForm, marketplace: e.target.value as MarketplaceName })}
              className="border border-input bg-background rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {MARKETPLACES.map((m) => (
                <option key={m} value={m}>{MARKETPLACE_LABELS[m]}</option>
              ))}
            </select>
            <Input
              placeholder="URL de afiliado"
              required
              value={importForm.affiliateUrl}
              onChange={(e) => setImportForm({ ...importForm, affiliateUrl: e.target.value })}
            />
            <Input
              placeholder="Título (opcional)"
              value={importForm.title}
              onChange={(e) => setImportForm({ ...importForm, title: e.target.value })}
            />
            <Input
              placeholder="Preço (centavos)"
              type="number"
              value={importForm.priceCents}
              onChange={(e) => setImportForm({ ...importForm, priceCents: e.target.value })}
            />
            <Input
              placeholder="Preço original (centavos)"
              type="number"
              value={importForm.originalPriceCents}
              onChange={(e) => setImportForm({ ...importForm, originalPriceCents: e.target.value })}
            />
            <select
              value={importForm.nicheTag}
              onChange={(e) => setImportForm({ ...importForm, nicheTag: e.target.value as NicheTag | '' })}
              className="border border-input bg-background rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Nicho (opcional)</option>
              {NICHES.map((n) => (
                <option key={n} value={n}>{NICHE_LABELS[n]}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={importing}>
              {importing ? 'Importando...' : 'Importar'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowImport(false)}
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </motion.form>
      )}

      <div className="flex gap-3 flex-wrap items-center">
        <select
          value={marketplace}
          onChange={(e) => setMarketplace(e.target.value)}
          disabled={isAiSearch}
          className="border border-input bg-card rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 transition-opacity"
        >
          <option value="">Todos Marketplaces</option>
          {MARKETPLACES.map((m) => (
            <option key={m} value={m}>{MARKETPLACE_LABELS[m]}</option>
          ))}
        </select>
        <select
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          disabled={isAiSearch}
          className="border border-input bg-card rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 transition-opacity"
        >
          <option value="">Todos Nichos</option>
          {NICHES.map((n) => (
            <option key={n} value={n}>{NICHE_LABELS[n]}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={isAiSearch}
          className="border border-input bg-card rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 transition-opacity"
        >
          <option value="">Todos Status</option>
          {(Object.keys(OFFER_STATUS_LABELS) as OfferStatus[]).map((s) => (
            <option key={s} value={s}>{OFFER_STATUS_LABELS[s]}</option>
          ))}
        </select>
        
        <div className="relative flex items-center w-full sm:w-64">
          <input
            type="text"
            placeholder={isAiSearch ? "Busca inteligente IA..." : "Buscar ofertas..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "border bg-card rounded-md pl-3 pr-8 py-1.5 text-sm text-foreground placeholder:text-muted-foreground w-full focus:outline-none focus:ring-2 focus:border-transparent transition-all",
              isAiSearch 
                ? "border-primary/50 focus:ring-primary/40 ring-1 ring-primary/20" 
                : "border-input focus:ring-primary focus:border-transparent"
            )}
          />
          <button
            type="button"
            onClick={() => setIsAiSearch(!isAiSearch)}
            className={cn(
              "absolute right-2 p-1 rounded transition-colors hover:bg-secondary",
              isAiSearch ? "text-primary bg-primary/10 hover:bg-primary/20" : "text-muted-foreground"
            )}
            title={isAiSearch ? "Desativar busca inteligente por IA" : "Ativar busca inteligente por IA"}
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => mutate()}
          disabled={isLoading}
          aria-label="Recarregar ofertas"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          <span className="hidden sm:inline">Atualizar</span>
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Imagem</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Título</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Preço</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Desc%</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Marketplace</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Nicho</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Capturada</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={8} className="px-4 py-3">
                    <div className="h-5 bg-muted animate-pulse rounded w-full" />
                  </td>
                </tr>
              ))
            ) : (offers as OfferNormalized[])?.length ? (
              !reduce ? (
                (offers as OfferNormalized[]).map((offer, i) => (
                  <motion.tr
                    key={offer.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={row}
                    className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer"
                    onClick={() => setSelected(offer)}
                  >
                    <td className="px-4 py-2.5">
                      {offer.imageUrl ? (
                        <img src={offer.imageUrl} alt="" className="w-10 h-10 rounded-md object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center text-muted-foreground text-xs">—</div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-foreground max-w-xs truncate">{offer.title}</td>
                    <td className="px-4 py-2.5 text-right text-foreground font-mono text-xs">
                      R$ {(offer.priceCents / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {offer.discountPercent > 0 && (
                        <span className="text-success font-medium text-xs">-{offer.discountPercent}%</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{MARKETPLACE_LABELS[offer.marketplace]}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-block bg-secondary text-muted-foreground text-xs px-2 py-0.5 rounded-full">
                        {NICHE_LABELS[offer.nicheTag]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${OFFER_STATUS_CLS[offer.status]}`}>
                        {OFFER_STATUS_LABELS[offer.status]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs font-mono">
                      {new Date(offer.scrapedAt).toLocaleDateString('pt-BR')}
                    </td>
                  </motion.tr>
                ))
              ) : (
                (offers as OfferNormalized[]).map((offer) => (
                  <tr key={offer.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => setSelected(offer)}>
                    <td className="px-4 py-2.5">
                      {offer.imageUrl ? (
                        <img src={offer.imageUrl} alt="" className="w-10 h-10 rounded-md object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center text-muted-foreground text-xs">—</div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-foreground max-w-xs truncate">{offer.title}</td>
                    <td className="px-4 py-2.5 text-right text-foreground font-mono text-xs">
                      R$ {(offer.priceCents / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {offer.discountPercent > 0 && (
                        <span className="text-success font-medium text-xs">-{offer.discountPercent}%</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{MARKETPLACE_LABELS[offer.marketplace]}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-block bg-secondary text-muted-foreground text-xs px-2 py-0.5 rounded-full">
                        {NICHE_LABELS[offer.nicheTag]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${OFFER_STATUS_CLS[offer.status]}`}>
                        {OFFER_STATUS_LABELS[offer.status]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs font-mono">
                      {new Date(offer.scrapedAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))
              )
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-muted-foreground">Nenhuma oferta encontrada</p>
                    <p className="text-xs text-muted-foreground/60">Importe ofertas manualmente ou aguarde a captura automática</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selected && (
          <OfferDrawer
            offer={selected}
            onClose={() => setSelected(null)}
            onChanged={() => {
              setSelected(null);
              mutate();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
