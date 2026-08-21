'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  Clock,
  Menu,
  Send,
  ShieldAlert,
  ShieldCheck,
  Store,
  Target,
  TrendingUp,
  Users,
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
] as const;

const FEATURES = [
  {
    icon: Store,
    title: 'Captura automática de ofertas',
    body: 'Shopee, Amazon, AliExpress e AWIN — via API oficial. Preço, desconto e comissão caem direto no painel, sem planilha.',
    highlight: true,
  },
  {
    icon: Target,
    title: 'Disparo pro grupo certo',
    body: 'Cada grupo tem uma tag (Tech, Moda, Casa...). Oferta de eletrônicos só vai pro grupo de eletrônicos.',
  },
  {
    icon: Send,
    title: 'Fila com retry',
    body: 'Se o WhatsApp falhar, tenta de novo. Rate limit automático. Não perde disparo.',
  },
  {
    icon: Bot,
    title: 'Regras que rodar sozinhas',
    body: '"Desconto > 30% e nicho Eletrônicos → Grupo X". Cria a regra e esquece — o sistema cuida.',
  },
  {
    icon: TrendingUp,
    title: 'Sabe o que está funcionando',
    body: 'Analytics por marketplace, nicho e período. Qual grupo converte mais. Onde está o dinheiro.',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Conecta as APIs',
    body: 'Entra nas credenciais da Shopee, Amazon ou AliExpress. O sistema começa a capturar ofertas na hora.',
  },
  {
    number: '02',
    title: 'Organiza por nicho',
    body: 'Cada grupo de WhatsApp ou Telegram ganha uma tag. A segmentação faz a oferta certa chegar no público certo.',
  },
  {
    number: '03',
    title: 'Automatiza e acompanha',
    body: 'Cria as regras, vê a fila andando, confere o analytics. Você controla sem ficar grudado no painel.',
  },
] as const;

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

  const recommendedTier = offersInput <= 3000 ? 'STARTER' : offersInput <= 25000 ? 'PRO' : 'AGENCY';
  const recommendedPlan = plans.find((p: any) => p.tier === recommendedTier);

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      {/* Grain texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

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
                Testar grátis
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
                <Link href="/register">Testar grátis</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </header>

      {/* HERO - Assimétrico com personalidade */}
      <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 lg:px-6 lg:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
          {/* Lado esquerdo - Texto */}
          <div>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/5 px-3 py-1 text-xs text-success"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Funcionando agora
            </motion.div>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05, ease: 'easeOut' }}
              className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] leading-[1.1]"
            >
              Para de abrir marketplace{' '}
              <span className="relative inline-block">
                por marketplace
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M1 5.5C40 2 80 1 100 3C120 5 160 6 199 2" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
              className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg leading-relaxed"
            >
              O painel que você vai deixar aberto o dia todo. Captura ofertas,
              aplica regras e manda pros seus grupos — tudo automático.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' }}
              className="mt-8 flex flex-col items-start gap-3 sm:flex-row"
            >
              <Button size="lg" asChild>
                <Link href="/register">
                  Testar grátis por 7 dias
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link href="/login">Já tenho conta</Link>
              </Button>
            </motion.div>

            {/* Números quebrados - não redondos */}
            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex items-center gap-6 text-sm text-muted-foreground"
            >
              <div>
                <span className="font-mono font-bold text-foreground">1.247</span>{' '}
                ofertas processadas hoje
              </div>
              <div className="h-4 w-px bg-border" />
              <div>
                <span className="font-mono font-bold text-foreground">98.7%</span>{' '}
                uptime
              </div>
            </motion.div>
          </div>

          {/* Lado direito - Mockup com "imperfeições" */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
            className="relative"
          >
            {/* Glow sutil atrás do mockup */}
            <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl" />

            <div className="relative surface-raised overflow-hidden rounded-xl border border-border/60">
              {/* Browser chrome */}
              <div className="flex items-center justify-between border-b border-border/60 bg-card/80 px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  app.affiliateos.com.br/ofertas
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/5 px-2 py-0.5 text-[10px] text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Live
                </span>
              </div>

              {/* Conteúdo do mockup */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Ofertas</h3>
                    <p className="text-[10px] text-muted-foreground">
                      Última sync: 13:21
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-success/10 px-2 py-1 text-[10px] font-medium text-success font-mono">
                      1.284 disparos hoje
                    </span>
                  </div>
                </div>

                {/* Tabela simplificada */}
                <div className="space-y-1.5">
                  {[
                    { name: 'Fritadeira Air Fryer 5L', disc: '-38%', mp: 'Shopee', status: 'ok' },
                    { name: 'SSD NVMe 1TB', disc: '-22%', mp: 'Amazon', status: 'pendente' },
                    { name: 'Teclado mecânico RGB', disc: '-41%', mp: 'AliExpress', status: 'ok' },
                    { name: 'Carregador GaN 65W', disc: '-27%', mp: 'AliExpress', status: 'skip' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                            item.status === 'ok'
                              ? 'bg-success'
                              : item.status === 'pendente'
                                ? 'bg-warning'
                                : 'bg-muted-foreground/40'
                          }`}
                        />
                        <span className="truncate text-foreground font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-muted-foreground text-[10px]">{item.mp}</span>
                        <span className="font-mono text-success font-medium">{item.disc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-center text-[9px] uppercase tracking-wider text-muted-foreground/50">
                  Interface real do produto
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CAPABILIDADES - Layout quebrado, não grid perfeito */}
      <section className="border-y border-border/60 bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              ['4+', 'marketplaces via API oficial'],
              ['9', 'nichos prontos pra usar'],
              ['2', 'canais (WhatsApp + Telegram)'],
              ['2x', 'retry automático'],
            ].map(([value, label], i) => (
              <Reveal key={label} delay={Math.min(i, 14) * 0.03}>
                <div className="text-center">
                  <p className="font-mono text-3xl font-bold text-primary tabular-nums">
                    {value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* RECURSOS - Layout assimétrico (2+3, não 3+3) */}
      <section id="recursos" className="mx-auto max-w-6xl px-4 py-20 lg:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            O que você faz hoje em 3h, aqui leva 3 minutos
          </h2>
          <p className="mt-3 text-muted-foreground">
            Da captura da oferta ao disparo no grupo — sem planilha, sem bot que quebra, sem copiar e colar.
          </p>
        </Reveal>

        {/* Grid assimétrico: 2 colunas grandes + 3 menores */}
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-6">
          {/* Card grande - destaque */}
          <Reveal className="md:col-span-3" delay={0}>
            <div className="surface-card surface-hover flex h-full flex-col gap-3 p-6 border border-primary/10">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Store className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-foreground text-lg">Captura automática de ofertas</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Shopee, Amazon, AliExpress e AWIN — via API oficial. Preço, desconto e comissão
                caem direto no painel, sem você precisar abrir o marketplace.
              </p>
              <div className="mt-auto pt-3 flex gap-2">
                {['Shopee', 'Amazon', 'AliExpress', 'AWIN'].map((mp) => (
                  <span key={mp} className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                    {mp}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Card médio */}
          <Reveal className="md:col-span-3" delay={0.05}>
            <div className="surface-card surface-hover flex h-full flex-col gap-3 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
                  <Target className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-foreground text-lg">Disparo pro grupo certo</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Cada grupo de WhatsApp ou Telegram tem uma tag (Tech, Moda, Casa...). Oferta de
                eletrônicos só vai pro grupo de eletrônicos. Sem spam, sem irrelevantes.
              </p>
            </div>
          </Reveal>

          {/* 3 cards menores */}
          <Reveal className="md:col-span-2" delay={0.1}>
            <div className="surface-card surface-hover flex h-full flex-col gap-3 p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <Send className="h-4 w-4" />
              </span>
              <h3 className="font-semibold text-foreground">Fila com retry</h3>
              <p className="text-sm text-muted-foreground">
                Se o WhatsApp falhar, tenta de novo automaticamente. Rate limit embutido.
              </p>
            </div>
          </Reveal>

          <Reveal className="md:col-span-2" delay={0.15}>
            <div className="surface-card surface-hover flex h-full flex-col gap-3 p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </span>
              <h3 className="font-semibold text-foreground">Regras automáticas</h3>
              <p className="text-sm text-muted-foreground">
                "Desconto {'>'} 30% e nicho Eletrônicos → Grupo X". Cria e esquece.
              </p>
            </div>
          </Reveal>

          <Reveal className="md:col-span-2" delay={0.2}>
            <div className="surface-card surface-hover flex h-full flex-col gap-3 p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground/5 text-foreground">
                <BarChart3 className="h-4 w-4" />
              </span>
              <h3 className="font-semibold text-foreground">Analytics que importa</h3>
              <p className="text-sm text-muted-foreground">
                Qual marketplace converte mais. Qual grupo compra. Onde tá o dinheiro.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* COMO FUNCIONA - Tom conversacional */}
      <section id="como-funciona" className="border-y border-border/60 bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-20 lg:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Como funciona na prática
            </h2>
            <p className="mt-3 text-muted-foreground">
              Três passos. Sem curso, sem tutorial de 2 horas.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <Reveal key={step.number} delay={Math.min(i, 14) * 0.05}>
                <div className="relative surface-card p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 font-mono text-base font-bold text-primary">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TRANSPARENCIA - Tom direto */}
      <section id="transparencia" className="mx-auto max-w-6xl px-4 py-20 lg:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            A gente não esconde os riscos
          </h2>
          <p className="mt-3 text-muted-foreground">
            Conexões não oficiais podem ser limitadas. A gente deixa isso claro na interface —
            nãoierte atrás de UX bonitinho.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Reveal>
            <div className="surface-card flex gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-foreground">
                  Só APIs oficiais de marketplace
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  Shopee, Amazon PA-API, AliExpress e AWIN. Scraping de terceiros — tipo o do
                  Mercado Livre — fica de fora por risco legal. Se não tem API oficial, a gente não usa.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="surface-card flex gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-foreground">
                  WhatsApp pode banir. A gente avisa.
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  Conexões via Baileys/Evolution não são suportadas pela Meta. O painel mostra
                  o status de cada instância. Se pode, usa Telegram — é mais seguro.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PLANOS - Calculador simples, sem 3 cards genéricos */}
      <section id="planos" className="border-t border-border/60 bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-20 lg:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Calcula o que faz sentido pro seu bolso
            </h2>
            <p className="mt-3 text-muted-foreground">
              Arrasta o slider e vê o plano. Sem letra miúda, sem surpresa na hora de pagar.
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
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
                  className="flex-1 accent-primary h-2"
                />
                <span className="w-28 shrink-0 text-right font-mono text-lg font-bold text-foreground tabular-nums">
                  {offersInput.toLocaleString('pt-BR')}
                </span>
              </div>

              {/* Resultado do calculador */}
              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Plano recomendado</p>
                    <p className="text-xl font-bold text-foreground mt-1">
                      {recommendedPlan?.name ?? 'Scale'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Até{' '}
                      {recommendedTier === 'STARTER'
                        ? '3.000'
                        : recommendedTier === 'PRO'
                          ? '25.000'
                          : '100.000'}{' '}
                      ofertas/mês
                    </p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="font-mono text-3xl font-bold text-foreground tabular-nums">
                      R${' '}
                      {(recommendedPlan?.priceBRL ?? 497).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground">/mês</p>
                  </div>
                  <Button size="lg" asChild>
                    <Link href="/register">
                      Começar agora
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Features do plano */}
              <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(recommendedPlan?.features ?? []).slice(0, 6).map((feature: string) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 shrink-0 text-success" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROVA SOCIAL - Números quebrados */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              ['1.247', 'ofertas processadas hoje'],
              ['98.7%', 'de uptime nos últimos 30 dias'],
              ['3.4', 'segundos tempo médio de disparo'],
              ['42', 'grupos ativos no平台'],
            ].map(([value, label], i) => (
              <div key={label}>
                <p className="font-mono text-2xl font-bold text-foreground tabular-nums">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* CTA FINAL - Tom pessoal */}
      <section className="mx-auto max-w-6xl px-4 py-20 lg:px-6">
        <Reveal>
          <div className="surface-raised relative overflow-hidden rounded-2xl p-8 text-center sm:p-12">
            {/* Gradient sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />

            <div className="relative">
              <h2 className="mx-auto max-w-xl text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Chega de planilha e bot que quebra
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                Testa grátis por 7 dias. Sem cartão, sem compromisso. Se não
                servir, a gente nem cobra.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/register">
                    Testar grátis por 7 dias
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" asChild>
                  <Link href="/login">Já tenho conta</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER COMPLETO - Colunas */}
      <footer className="border-t border-border/60 bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {/* Produto */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Produto</h4>
              <ul className="space-y-2">
                <li><a href="#recursos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Recursos</a></li>
                <li><a href="#planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Preços</a></li>
                <li><a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Como funciona</a></li>
                <li><Link href="/status" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Status</Link></li>
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Empresa</h4>
              <ul className="space-y-2">
                <li><a href="#transparencia" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sobre</a></li>
                <li><Link href="/contato" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contato</Link></li>
              </ul>
            </div>

            {/* Suporte */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Suporte</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Central de ajuda</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacidade" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacidade</Link></li>
                <li><Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cookies</Link></li>
                <li><Link href="/termos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Termos</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
            <Logo />
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} AffiliateOS. Feito por quem opera.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
