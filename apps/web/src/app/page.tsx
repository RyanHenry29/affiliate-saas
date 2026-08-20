'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  Menu,
  Send,
  ShieldAlert,
  ShieldCheck,
  Store,
  Target,
  X,
  Zap,
} from 'lucide-react';
import { PLANS as DEFAULT_PLANS } from '@/lib/plans';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

const fetcher = (url: string) => api.get(url);

const NAV_LINKS = [
  ['#recursos', 'Recursos'],
  ['#como-funciona', 'Como funciona'],
  ['#transparencia', 'Transparência'],
  ['#planos', 'Planos'],
  ['/status', 'Status'],
  ['/changelog', 'Changelog'],
] as const;

const FEATURES = [
  {
    icon: Store,
    title: 'Captura multi-marketplace',
    body: 'Shopee, Amazon, AliExpress e AWIN via API oficial de afiliados. As ofertas são normalizadas e deduplicadas automaticamente.',
  },
  {
    icon: Target,
    title: 'Segmentação por nicho',
    body: 'Nove nichos prontos. Cada oferta é distribuída apenas para os grupos onde ela faz sentido.',
  },
  {
    icon: Send,
    title: 'Disparo segmentado',
    body: 'WhatsApp e Telegram com fila, retry e controle de rate limit por instância.',
  },
  {
    icon: Bot,
    title: 'Automação por regras',
    body: 'Regras do tipo “desconto maior que 30% e categoria eletrônicos vão para o grupo X”. Rodam sem abrir o painel.',
  },
  {
    icon: Activity,
    title: 'Monitoramento em tempo real',
    body: 'Instâncias, fila de disparos, erros e histórico no mesmo lugar.',
  },
  {
    icon: BarChart3,
    title: 'Analytics de conversão',
    body: 'Disparos por marketplace e nicho, taxa de sucesso e conversão por período.',
  },
];

const STEPS = [
  {
    title: 'Conecte seus marketplaces',
    body: 'Entre com as credenciais das APIs oficiais de afiliados. O sistema passa a capturar ofertas e normalizar preços e descontos.',
  },
  {
    title: 'Organize os grupos por nicho',
    body: 'Cada grupo de WhatsApp ou Telegram recebe uma tag. A segmentação garante que a oferta certa chegue ao público certo.',
  },
  {
    title: 'Automatize e monitore',
    body: 'Crie regras de disparo, acompanhe a fila em tempo real e revise o analytics. Você automatiza sem abrir mão do controle.',
  },
] as const;

const MOCKUP_NAV = [
  'Visão geral',
  'Ofertas',
  'Disparos',
  'Canais',
  'Regras',
  'Integrações',
  'Logs',
  'Configurações',
];

type OfferStatus = 'Publicada' | 'Pendente' | 'Ignorada' | 'Com erro';

const MOCKUP_ROWS: {
  product: string;
  mp: string;
  disc: string;
  commission: string;
  status: OfferStatus;
}[] = [
  { product: 'Fritadeira Air Fryer 5L', mp: 'Shopee', disc: '-38%', commission: 'R$ 12,40', status: 'Publicada' },
  { product: 'SSD NVMe 1TB', mp: 'Amazon', disc: '-22%', commission: 'R$ 8,72', status: 'Pendente' },
  { product: 'Teclado mecânico RGB', mp: 'AliExpress', disc: '-41%', commission: 'R$ 16,31', status: 'Publicada' },
  { product: 'Carregador GaN 65W', mp: 'AliExpress', disc: '-27%', commission: 'R$ 4,98', status: 'Ignorada' },
  { product: 'Cafeteira Elétrica 110V', mp: 'Shopee', disc: '-32%', commission: 'R$ 9,60', status: 'Com erro' },
];

const STATUS_CLS: Record<OfferStatus, string> = {
  Publicada: 'border-success/30 bg-success/10 text-success',
  Pendente: 'border-warning/30 bg-warning/10 text-warning',
  Ignorada: 'border-border bg-secondary/60 text-muted-foreground',
  'Com erro': 'border-destructive/30 bg-destructive/10 text-destructive',
};

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Zap className="h-4 w-4" />
        </div>
      <div className="leading-none">
        <span className="text-sm font-bold tracking-tight text-foreground">
          Affiliate<span className="text-primary">OS</span>
        </span>
      </div>
    </Link>
  );
}

export default function LandingPage() {
  const reduce = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [offersInput, setOffersInput] = useState(12000);

  const { data: remotePlans } = useSWR('/billing/plans', fetcher, {
    dedupingInterval: 60_000,
  });

  const plans = useMemo(() => {
    if (remotePlans?.length) {
      const defaults = Object.fromEntries(
        DEFAULT_PLANS.map((p) => [p.tier, p]),
      ) as Record<string, (typeof DEFAULT_PLANS)[number]>;
      return remotePlans.map((p: any) => ({
        tier: p.tier,
        name: p.name,
        priceBRL: p.priceCents / 100,
        tagline: defaults[p.tier]?.tagline ?? '',
        features: p.features,
      }));
    }
    return DEFAULT_PLANS;
  }, [remotePlans]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/register">
                Testar gratuitamente
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-md border border-input md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
        {mobileOpen && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="border-t border-border/60 bg-background px-4 py-4 md:hidden"
          >
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-3">
              <Button variant="outline" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Testar gratuitamente</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </header>

      {/* HERO */}
      <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 lg:px-6 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/5 px-3 py-1 text-xs text-success"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Plataforma operacional para canais de ofertas
          </motion.div>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05, ease: 'easeOut' }}
            className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Centralize suas ofertas{' '}
            <span className="text-primary">e automatize os disparos</span>.
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
            className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg"
          >
            Encontre produtos, aplique regras de segmentação e publique nos
            seus canais sem operar marketplace por marketplace.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button size="lg" asChild>
              <Link href="/register">
                Testar gratuitamente
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Entrar no painel</Link>
            </Button>
          </motion.div>
        </div>

        {/* Mockup do produto */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25, ease: 'easeOut' }}
          className="surface-raised mx-auto mt-14 max-w-4xl overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              app.affiliateos.com.br/dashboard/ofertas
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/5 px-2 py-0.5 text-[11px] text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Operacional
            </span>
          </div>

          <div className="grid grid-cols-[150px_1fr] lg:grid-cols-[180px_1fr]">
            <aside className="hidden border-r border-border p-3 sm:block">
              <div className="mb-4 flex items-center gap-2 px-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Zap className="h-3 w-3" />
                </span>
                <span className="text-[11px] font-bold tracking-tight">
                  Affiliate<span className="text-primary">OS</span>
                </span>
              </div>
              <nav className="space-y-0.5">
                {MOCKUP_NAV.map((item) => (
                  <span
                    key={item}
                    className={`block rounded-md px-2 py-1.5 text-[11px] ${
                      item === 'Ofertas'
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </nav>
            </aside>

            <div className="min-w-0 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Ofertas</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Última sincronização às 13:21
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground sm:flex">
                    Disparos hoje: <span className="font-mono font-medium text-foreground">1.284</span>
                  </span>
                  <span className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground">
                    Sincronizar agora
                  </span>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-md border border-border">
                <div className="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-border bg-secondary/40 px-3 py-2 text-[10px] uppercase tracking-wide text-muted-foreground sm:grid-cols-[1.6fr_1fr_0.8fr_0.9fr_0.9fr]">
                  <span>Produto</span>
                  <span className="hidden sm:block">Marketplace</span>
                  <span className="hidden text-right sm:block">Desconto</span>
                  <span className="hidden text-right sm:block">Comissão</span>
                  <span className="text-right">Status</span>
                </div>
                {MOCKUP_ROWS.map((row) => (
                  <div
                    key={row.product}
                    className="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-border px-3 py-2.5 last:border-0 hover:bg-secondary/30 sm:grid-cols-[1.6fr_1fr_0.8fr_0.9fr_0.9fr]"
                  >
                    <span className="truncate text-xs font-medium text-foreground">
                      {row.product}
                    </span>
                    <span className="hidden text-xs text-muted-foreground sm:block">
                      {row.mp}
                    </span>
                    <span className="hidden text-right font-mono text-xs font-medium text-success sm:block">
                      {row.disc}
                    </span>
                    <span className="hidden text-right font-mono text-xs text-foreground sm:block">
                      {row.commission}
                    </span>
                    <span
                      className={`justify-self-end rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_CLS[row.status]}`}
                    >
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-right text-[10px] uppercase tracking-wide text-muted-foreground">
                Interface de demonstração
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CAPABILIDADES */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 lg:grid-cols-4 lg:px-6">
          {[
            ['4+', 'marketplaces via API oficial'],
            ['9', 'nichos de segmentação'],
            ['2', 'canais de disparo (WhatsApp/Telegram)'],
            ['2', 'retry automático nos disparos'],
          ].map(([value, label], i) => (
            <Reveal key={label} delay={Math.min(i, 14) * 0.03}>
              <div className="text-center">
                <p className="font-mono text-2xl font-bold text-foreground tabular-nums lg:text-3xl">
                  {value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="mx-auto max-w-6xl px-4 py-20 lg:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Tudo que um operador de grupos precisa
          </h2>
          <p className="mt-3 text-muted-foreground">
            Da captura ao disparo, com regras, fila e retry — sem planilha e
            sem bot que quebra.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={Math.min(i, 14) * 0.03}>
                <div className="surface-card surface-hover flex h-full flex-col gap-3 p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-20 lg:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Do marketplace ao grupo em três passos
            </h2>
            <p className="mt-3 text-muted-foreground">
              Conecte as contas, defina as regras e acompanhe a fila de
              disparos.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={Math.min(i, 14) * 0.05}>
                <div className="relative surface-card p-5">
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-bold text-primary">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TRANSPARÊNCIA OPERACIONAL */}
      <section id="transparencia" className="mx-auto max-w-6xl px-4 py-20 lg:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Riscos operacionais transparentes
          </h2>
          <p className="mt-3 text-muted-foreground">
            Conexões não oficiais podem ser limitadas pela plataforma. Deixamos
            isso claro na interface, com o status de cada instância.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Reveal>
            <div className="surface-card flex gap-3 p-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-semibold text-foreground">
                  Só marketplaces com API oficial
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Shopee, Amazon PA-API, AliExpress e AWIN. Scraping de terceiros
                  — como o do Mercado Livre — fica de fora da v1 por risco legal.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="surface-card flex gap-3 p-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-semibold text-foreground">
                  WhatsApp tem risco real de ban
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Conexões via Baileys/Evolution não são suportadas pela Meta.
                  O painel mostra o status de cada instância. Sempre que
                  possível, use Telegram.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-20 lg:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Planos que crescem com a operação
            </h2>
            <p className="mt-3 text-muted-foreground">
              Selecione o volume de ofertas processadas por mês.
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="mx-auto mt-10 max-w-2xl rounded-lg border border-border bg-card p-5">
              <label
                htmlFor="calc-ofertas"
                className="block text-sm font-medium text-foreground"
              >
                Quantas ofertas você processa por mês?
              </label>
              <div className="mt-4 flex items-center gap-4">
                <input
                  id="calc-ofertas"
                  type="range"
                  min={1000}
                  max={100000}
                  step={1000}
                  value={offersInput}
                  onChange={(e) => setOffersInput(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="w-28 shrink-0 text-right font-mono text-sm font-bold text-foreground tabular-nums">
                  {offersInput.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-md border border-border bg-background/50 px-4 py-3 sm:flex-row">
                <div>
                  <p className="text-xs text-muted-foreground">Plano recomendado</p>
                  <p className="text-sm font-semibold text-foreground">
                    {(() => {
                      const tier = offersInput <= 3000 ? 'STARTER' : offersInput <= 25000 ? 'PRO' : 'AGENCY';
                      return plans.find((p: any) => p.tier === tier)?.name ?? 'Scale';
                    })()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-bold text-foreground tabular-nums">
                    R${' '}
                    {(() => {
                      const tier = offersInput <= 3000 ? 'STARTER' : offersInput <= 25000 ? 'PRO' : 'AGENCY';
                      return (plans.find((p: any) => p.tier === tier)?.priceBRL ?? 497).toLocaleString('pt-BR');
                    })()}
                    <span className="text-xs font-normal text-muted-foreground">/mês</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {offersInput <= 3000
                      ? 'Até 3.000 ofertas'
                      : offersInput <= 25000
                        ? 'Até 25.000 ofertas'
                        : 'Até 100.000 ofertas'}
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link href="/register">Começar</Link>
                </Button>
              </div>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            {plans.map((plan: any, i: number) => {
              const highlight = plan.tier === 'PRO';
              return (
                <Reveal key={plan.tier} delay={Math.min(i, 14) * 0.05}>
                  <div
                    className={`surface-card flex h-full flex-col p-6 ${
                      highlight ? 'ring-1 ring-primary/40' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{plan.name}</h3>
                      {highlight && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Mais popular
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
                    <p className="mt-4 font-mono text-3xl font-bold text-foreground tabular-nums">
                      R$ {plan.priceBRL.toLocaleString('pt-BR')}
                      <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </p>
                    <ul className="mt-5 flex-1 space-y-2 text-sm text-muted-foreground">
                      {plan.features.map((feature: string) => (
                        <li key={feature} className="flex gap-2">
                          <Check className="h-4 w-4 shrink-0 text-success" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-6 w-full"
                      variant={highlight ? 'default' : 'outline'}
                      asChild
                    >
                      <Link href="/register">Começar com {plan.name}</Link>
                    </Button>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-6xl px-4 py-20 lg:px-6">
        <Reveal>
          <div className="surface-raised relative overflow-hidden p-8 text-center sm:p-12">
            <h2 className="mx-auto max-w-xl text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Sua operação de ofertas, em um único lugar
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Conecte os marketplaces, defina as regras e acompanhe cada
              disparo.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">
                  Testar gratuitamente
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Já tenho conta</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row lg:px-6">
          <Logo />
          <nav className="flex gap-4">
            {NAV_LINKS.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AffiliateOS. Feito para operadores.
          </p>
        </div>
      </footer>
    </div>
  );
}