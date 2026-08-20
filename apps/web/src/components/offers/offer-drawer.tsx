"use client";

import { motion, useReducedMotion } from "framer-motion";
import useSWR from "swr";
import { Check, Copy, ExternalLink, RotateCcw, Send, X, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";
import type { OfferNormalized } from "@/lib/types";
import {
  MARKETPLACE_LABELS,
  NICHE_LABELS,
  OFFER_STATUS_CLS,
  OFFER_STATUS_LABELS,
} from "@/lib/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toastSuccess, toastError } from "@/lib/toast";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground tabular-nums">
          {Math.round(value * 100)}%
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }}
        />
      </div>
    </div>
  );
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const w = 120;
  const h = 28;
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => `${(i * step).toFixed(1)},${(h - ((p - min) / span) * (h - 4) - 2).toFixed(1)}`);
  const path = `M${coords.join(" L")}`;
  const last = coords[coords.length - 1];
  const isDown = points[points.length - 1] <= points[0];
  const color = isDown ? "var(--success)" : "var(--destructive)";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-full" aria-hidden="true">
      <polyline points={coords.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last.split(",")[0]} cy={last.split(",")[1]} r="2" fill={color} />
    </svg>
  );
}

function PublishReasons({ offer }: { offer: OfferNormalized }) {
  const discount =
    offer.originalPriceCents > offer.priceCents
      ? Math.round((1 - offer.priceCents / offer.originalPriceCents) * 100)
      : offer.discountPercent;

  const reasons: { ok: boolean; label: string; detail: string }[] = [];

  reasons.push({
    ok: discount >= 30,
    label: `Desconto ≥ 30%`,
    detail: `Encontrado: ${discount}%`,
  });
  reasons.push({
    ok: offer.rating >= 4.0,
    label: `Avaliação ≥ 4.0`,
    detail: `Encontrado: ${offer.rating.toFixed(1)}`,
  });
  reasons.push({
    ok: offer.priceCents > 0,
    label: "Preço válido",
    detail: `R$ ${(offer.priceCents / 100).toFixed(2)}`,
  });
  reasons.push({
    ok: true,
    label: `Categoria: ${NICHE_LABELS[offer.nicheTag]}`,
    detail: "Grupo ativo encontrado",
  });

  const passed = reasons.filter((r) => r.ok).length;

  if (offer.status === "PUBLISHED") {
    return (
      <div className="rounded-lg border border-success/30 bg-success/5 p-3">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <span className="text-xs font-semibold text-success">Publicada automaticamente</span>
        </div>
        <div className="space-y-1.5">
          {reasons.map((r) => (
            <div key={r.label} className="flex items-center gap-2 text-xs">
              {r.ok ? (
                <Check className="h-3 w-3 text-success shrink-0" />
              ) : (
                <X className="h-3 w-3 text-destructive shrink-0" />
              )}
              <span className={r.ok ? "text-foreground" : "text-muted-foreground line-through"}>
                {r.label}
              </span>
              <span className="text-muted-foreground ml-auto">{r.detail}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {passed}/{reasons.length} critérios atendidos · Score: {Math.min(100, Math.round(
            Math.min(50, discount * 1.1) + Math.min(25, offer.rating * 5) + 25,
          ))}/100
        </p>
      </div>
    );
  }

  if (offer.status === "IGNORED" || offer.status === "FAILED") {
    const failedReasons = reasons.filter((r) => !r.ok);
    return (
      <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <span className="text-xs font-semibold text-warning">
            {offer.status === "FAILED" ? "Falha no processamento" : "Rejeitada por regras"}
          </span>
        </div>
        {failedReasons.length > 0 ? (
          <div className="space-y-1.5">
            {failedReasons.map((r) => (
              <div key={r.label} className="flex items-center gap-2 text-xs">
                <XCircle className="h-3 w-3 text-destructive shrink-0" />
                <span className="text-foreground font-medium">{r.label}</span>
                <span className="text-muted-foreground ml-auto">{r.detail}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Oferta rejeitada manualmente pelo operador.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-background/50 p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-foreground">Critérios de publicação</span>
      </div>
      <div className="space-y-1.5">
        {reasons.map((r) => (
          <div key={r.label} className="flex items-center gap-2 text-xs">
            {r.ok ? (
              <Check className="h-3 w-3 text-success shrink-0" />
            ) : (
              <X className="h-3 w-3 text-destructive shrink-0" />
            )}
            <span className={r.ok ? "text-foreground" : "text-muted-foreground"}>
              {r.label}
            </span>
            <span className="text-muted-foreground ml-auto">{r.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OfferDrawer({
  offer,
  onClose,
  onChanged,
}: {
  offer: OfferNormalized | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const historyKey = offer ? `/offers/${offer.id}/history` : null;
  const { data: history } = useSWR(historyKey, (u: string) => api.get(u), {
    dedupingInterval: 30_000,
  });

  if (!offer) return null;

  const affiliateUrl = offer.affiliateUrl;
  const offerId = offer.id;

  const discount =
    offer.originalPriceCents > offer.priceCents
      ? Math.round((1 - offer.priceCents / offer.originalPriceCents) * 100)
      : offer.discountPercent;

  const prices = (history as { priceCents: number; createdAt: string }[] | undefined)?.map((h) => h.priceCents) ?? [];
  const minPrice = prices.length ? Math.min(...prices) : null;
  const lowestNow = minPrice !== null && offer.priceCents <= minPrice;

  const score = Math.min(
    100,
    Math.round(
      Math.min(50, discount * 1.1) + Math.min(25, offer.rating * 5) + (lowestNow ? 25 : 0),
    ),
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(affiliateUrl);
      setCopied(true);
      toastSuccess("Link de afiliado copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível
    }
  }

  async function handleAction(action: "publish" | "ignore" | "reopen") {
    setBusy(action);
    try {
      await api.post(`/offers/${offerId}/${action}`);
      toastSuccess(
        action === "publish"
          ? "Oferta publicada e adicionada à fila de disparos"
          : action === "ignore"
            ? "Oferta ignorada"
            : "Oferta reaberta para revisão",
      );
      onChanged();
    } catch (err: any) {
      toastError(err, "Falha ao atualizar oferta");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 bg-black/60"
        onClick={onClose}
      />
      <motion.aside
        initial={reduce ? { x: "100%" } : { x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
        role="dialog"
        aria-label="Detalhes da oferta"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border p-4">
          <div className="flex items-center gap-3">
            {offer.imageUrl ? (
              <img src={offer.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-muted-foreground text-xs">
                —
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground">{offer.title}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {MARKETPLACE_LABELS[offer.marketplace]}
                </span>
                <span className="rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {NICHE_LABELS[offer.nicheTag]}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${OFFER_STATUS_CLS[offer.status]}`}
                >
                  {OFFER_STATUS_LABELS[offer.status]}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar detalhes"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border bg-background/50 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Preço atual
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-foreground tabular-nums">
                R$ {(offer.priceCents / 100).toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background/50 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Preço anterior
              </p>
              <p className="mt-1 font-mono text-sm text-foreground tabular-nums">
                R$ {(offer.originalPriceCents / 100).toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background/50 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Desconto
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-success tabular-nums">
                -{discount}%
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-border bg-background/50 p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Score calculado
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-foreground tabular-nums">
                  {score}
                  <span className="text-sm font-normal text-muted-foreground">/100</span>
                </p>
              </div>
              {minPrice !== null && (
                <p className="text-right text-[11px] leading-tight text-muted-foreground">
                  Menor preço (histórico)
                  <span className="block font-mono font-medium text-foreground">
                    R$ {(minPrice / 100).toFixed(2)}
                  </span>
                </p>
              )}
            </div>
            <div className="mt-3 space-y-2.5">
              <ScoreBar label="Desconto" value={Math.min(50, discount * 1.1) / 50} />
              <ScoreBar label="Avaliação" value={Math.min(25, offer.rating * 5) / 25} />
              <ScoreBar label="Posição do preço" value={lowestNow ? 1 : 0} />
            </div>
          </div>

          {prices.length > 0 && (
            <div className="mt-4 rounded-lg border border-border bg-background/50 p-4">
              <p className="mb-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                Histórico de preço
              </p>
              <Sparkline points={prices} />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {prices.length} registro{prices.length > 1 ? 's' : ''} · {lowestNow ? 'preço no menor nível' : 'preço acima do menor nível'}
              </p>
            </div>
          )}

          <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-background/50 px-3">
            <DetailRow label="Marketplace" value={MARKETPLACE_LABELS[offer.marketplace]} />
            <DetailRow label="Nicho" value={NICHE_LABELS[offer.nicheTag]} />
            <DetailRow label="Avaliação" value={`${offer.rating.toFixed(1)} / 5`} />
            <DetailRow
              label="Capturada em"
              value={
                <span className="font-mono text-xs">
                  {new Date(offer.scrapedAt).toLocaleDateString('pt-BR')} ·{' '}
                  {new Date(offer.scrapedAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              }
            />
            <DetailRow
              label="SKU externo"
              value={<span className="font-mono text-xs">{offer.externalSku || '—'}</span>}
            />
          </div>

          <div className="mt-4">
            <PublishReasons offer={offer} />
          </div>
        </div>

        <footer className="border-t border-border p-4">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => void handleCopy()}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copiado' : 'Copiar link'}
            </Button>
            <Button asChild>
              <a href={affiliateUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Abrir oferta
              </a>
            </Button>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-2">
            {offer.status !== 'PUBLISHED' && (
              <Button onClick={() => void handleAction('publish')} disabled={!!busy}>
                <Send className="h-4 w-4" />
                {busy === 'publish' ? 'Publicando...' : 'Publicar agora'}
              </Button>
            )}
            {offer.status === 'PENDING' && (
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => void handleAction('ignore')}
                disabled={!!busy}
              >
                <X className="h-4 w-4" />
                {busy === 'ignore' ? 'Ignorando...' : 'Ignorar oferta'}
              </Button>
            )}
            {(offer.status === 'IGNORED' || offer.status === 'FAILED') && (
              <Button
                variant="outline"
                onClick={() => void handleAction('reopen')}
                disabled={!!busy}
              >
                <RotateCcw className="h-4 w-4" />
                {busy === 'reopen' ? 'Reabrindo...' : 'Reabrir para revisão'}
              </Button>
            )}
          </div>
        </footer>
      </motion.aside>
    </>
  );
}