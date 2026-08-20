'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { motion, useReducedMotion, AnimatePresence, type Variants } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  Import,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  X,
  XCircle,
} from 'lucide-react';
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

function StatBadge({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className={cn('flex items-center gap-2 rounded-lg border px-3 py-2', color)}>
      <span className="font-mono text-sm font-bold text-foreground tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

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

  const offerList = (offers as OfferNormalized[]) ?? [];
  const published = offerList.filter((o) => o.status === 'PUBLISHED').length;
  const pending = offerList.filter((o) => o.status === 'PENDING').length;
  const ignored = offerList.filter((o) => o.status === 'IGNORED').length;
  const failed = offerList.filter((o) => o.status === 'FAILED').length;

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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Ofertas</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {offerList.length > 0
              ? `${offerList.length} ofertas capturadas · Última sync: ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
              : 'Ofertas capturadas dos marketplaces integrados'}
          </p>
        </div>
        <Button onClick={() => setShowImport(!showImport)}>
          <Import className="h-4 w-4" />
          Importar
        </Button>
      </div>

      {/* Stats summary */}
      {offerList.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <StatBadge label="total" value={offerList.length} color="border-border bg-card" />
          <StatBadge label="publicadas" value={published} color="border-success/20 bg-success/5" />
          <StatBadge label="pendentes" value={pending} color="border-warning/20 bg-warning/5" />
          <StatBadge label="ignoradas" value={ignored} color="border-border bg-secondary/30" />
          {failed > 0 && (
            <StatBadge label="com erro" value={failed} color="border-destructive/20 bg-destructive/5" />
          )}
        </div>
      )}

      {/* Import form */}
      <AnimatePresence>
        {showImport && (
          <motion.form
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleImport}
            className="bg-card border border-border rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Importar oferta manual</h3>
              <button
                type="button"
                onClick={() => setShowImport(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={importForm.marketplace}
                onChange={(e) => setImportForm({ ...importForm, marketplace: e.target.value as MarketplaceName })}
                className="border border-input bg-background rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="border border-input bg-background rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
              <Button type="button" variant="ghost" onClick={() => setShowImport(false)}>
                Cancelar
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
          Filtros:
        </div>
        <select
          value={marketplace}
          onChange={(e) => setMarketplace(e.target.value)}
          disabled={isAiSearch}
          className="border border-border bg-card rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        >
          <option value="">Marketplace</option>
          {MARKETPLACES.map((m) => (
            <option key={m} value={m}>{MARKETPLACE_LABELS[m]}</option>
          ))}
        </select>
        <select
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          disabled={isAiSearch}
          className="border border-border bg-card rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        >
          <option value="">Nicho</option>
          {NICHES.map((n) => (
            <option key={n} value={n}>{NICHE_LABELS[n]}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={isAiSearch}
          className="border border-border bg-card rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        >
          <option value="">Status</option>
          {(Object.keys(OFFER_STATUS_LABELS) as OfferStatus[]).map((s) => (
            <option key={s} value={s}>{OFFER_STATUS_LABELS[s]}</option>
          ))}
        </select>

        <div className="relative flex items-center flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder={isAiSearch ? "Busca inteligente..." : "Buscar ofertas..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full border bg-card rounded-lg pl-9 pr-10 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all",
              isAiSearch
                ? "border-primary/40 focus:ring-primary/30"
                : "border-border focus:ring-primary",
            )}
          />
          <button
            type="button"
            onClick={() => setIsAiSearch(!isAiSearch)}
            className={cn(
              "absolute right-2.5 p-1 rounded-md transition-colors",
              isAiSearch ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-secondary",
            )}
            title={isAiSearch ? "Desativar busca IA" : "Ativar busca IA"}
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => mutate()}
          disabled={isLoading}
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-border bg-secondary/20">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Oferta</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Preço</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Desc%</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Marketplace</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Nicho</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Quando</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td colSpan={7} className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-secondary animate-pulse rounded-lg" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-secondary animate-pulse rounded w-2/3" />
                          <div className="h-2 bg-secondary animate-pulse rounded w-1/3" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : offerList.length ? (
                offerList.map((offer, i) => {
                  const discount =
                    offer.originalPriceCents > offer.priceCents
                      ? Math.round((1 - offer.priceCents / offer.originalPriceCents) * 100)
                      : offer.discountPercent;
                  return (
                    <motion.tr
                      key={offer.id}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={row}
                      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => setSelected(offer)}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          {offer.imageUrl ? (
                            <img src={offer.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-muted-foreground text-xs">
                              <Tag className="h-4 w-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[200px]">{offer.title}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{offer.externalSku || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs font-medium text-foreground">
                        R$ {(offer.priceCents / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {discount > 0 && (
                          <span className="font-mono text-xs font-medium text-success">-{discount}%</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs text-muted-foreground">{MARKETPLACE_LABELS[offer.marketplace]}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-block bg-secondary text-muted-foreground text-[10px] px-2 py-0.5 rounded-full">
                          {NICHE_LABELS[offer.nicheTag]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium', OFFER_STATUS_CLS[offer.status])}>
                          {offer.status === 'PUBLISHED' && <CheckCircle2 className="h-3 w-3" />}
                          {offer.status === 'FAILED' && <AlertTriangle className="h-3 w-3" />}
                          {offer.status === 'IGNORED' && <XCircle className="h-3 w-3" />}
                          {OFFER_STATUS_LABELS[offer.status]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">
                        {new Date(offer.scrapedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center">
                        <Tag className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Nenhuma oferta encontrada</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {search || marketplace || niche || status
                            ? 'Tente ajustar os filtros'
                            : 'Importe uma oferta ou aguarde a captura automática'}
                        </p>
                      </div>
                      {!search && !marketplace && !niche && !status && (
                        <Button size="sm" onClick={() => setShowImport(true)}>
                          <Import className="h-3.5 w-3.5" />
                          Importar primeira oferta
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
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
