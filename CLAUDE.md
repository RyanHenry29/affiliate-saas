# affiliate-saas — Design System & Regras de UI (Claude Code / Cursor)

Este arquivo é carregado automaticamente em toda sessão de codegen neste repo.
Não repita/regenere este contexto manualmente por tela — cole apenas o prompt
específico da tela (ver `docs/prompts-ui.md`).

> Os tokens abaixo já estão implementados em `apps/web/src/app/globals.css` e
> `apps/web/tailwind.config.ts`. Se for alterar um token, altere lá primeiro e
> atualize este arquivo depois — este documento descreve o código, não o contrário.

## Produto

SaaS B2B de automação de marketing de afiliados (mineração de ofertas + disparo
segmentado para WhatsApp/Telegram). Público: donos de grupos de "achadinhos" que
gerenciam múltiplos números de WhatsApp e milhares de ofertas/dia. É uma ferramenta
operacional que fica aberta o dia todo, como um painel de trading ou de observabilidade.
Priorize legibilidade de dados densos e feedback de estado (conectado/desconectado,
ativo/pausado) sobre decoração.

## Stack

- Next.js 14 App Router, TypeScript strict
- Tailwind CSS + shadcn/ui (componentes já em `src/components/ui/`) — não reinvente
  inputs/selects/dialogs, use os que já existem
- Framer Motion — sem outras libs de animação (nada de GSAP/Lottie/three.js)
- Recharts para gráficos (não Framer Motion)
- Ícones: lucide-react

## Design tokens (implementados em `globals.css` — não redefinir por tela)

Modo escuro como padrão (usuário opera de madrugada monitorando disparos).

| Token | Valor | Uso |
|---|---|---|
| `--background` | `#0B0D10` | base quase-preta |
| `--card` / `--popover` | `#12151A` | superfícies em camadas |
| `--secondary` / `--muted` / `--accent` | `#1A1E24` | superfícies secundárias |
| `--foreground` | `#E7E9EC` | texto primário |
| `--muted-foreground` | `#8B92A0` | texto secundário |
| `--primary` / `--ring` | `#5B8DEF` | ação primária / link (azul) |
| `--success` | `#3ECF8E` | instância conectada/ativa (verde) |
| `--warning` | `#E8A33D` | atenção/reconectando (âmbar) |
| `--destructive` | `#E5484D` | desconectado/falha (vermelho) |
| `--border` / `--input` | `#2A2F37` | bordas |
| `--radius` | `0.5rem` (8px) | cards — 6px em inputs/botões |

Accent de status, **não decorativo**: verde/âmbar/vermelho só devem aparecer para
comunicar estado real (conectado, atenção, falha). Não usar fora desses estados.

Tipografia: Inter (UI/dados) + `.font-mono` (JetBrains Mono) só para valores
numéricos que mudam em tempo real (preços, contadores, timestamps) — o mono sinaliza
"isso é dado ao vivo".

Densidade: espaçamento compacto (Tailwind spacing 2-4 como base). Painel operacional,
não landing page.

## Regras de motion (obrigatórias em todo componente animado)

1. `prefers-reduced-motion` sempre respeitado — usar `useReducedMotion()` do Framer
   Motion e desligar transform/scale quando `true` (manter fade simples).
2. Animação de entrada de listas/tabelas: stagger máximo de 30ms por item, **nunca**
   acima de 15 itens simultâneos (acima disso, sem animação — perf > efeito). Ver
   `dashboard/page.tsx` para o padrão já usado (`delay: i * 0.03`).
3. Nenhuma animação contínua/infinita (pulse, spin decorativo) fora de indicadores de
   loading real (ex.: `animate-spin` só enquanto `refreshing === true`).
4. Transições de estado (conectado→desconectado, ativo→pausado) sempre têm animação —
   é a exceção à regra 3, porque aqui a animação carrega informação, não decoração.
5. Duração padrão: 150-200ms para micro-interações, 250-350ms para transições de
   layout. Nunca acima de 400ms em nada que bloqueie a próxima ação do usuário.
6. Animar apenas `transform`/`opacity` (não `width`/`height`/`top`/`left`). Para
   redimensionar, usar a prop `layout` do Framer Motion (usa FLIP internamente).

## Acessibilidade (não negociável)

- Foco visível em todo elemento interativo (outline, não apenas mudança de cor).
- Contraste mínimo AA em texto sobre superfícies escuras.
- Estados de erro/vazio escritos na voz da interface: dizer o que aconteceu e o que
  fazer, nunca "Ops!" genérico. Ver o empty state em `dashboard/page.tsx` como
  referência de tom.

## O que NÃO fazer

- Gradientes decorativos sem função (accent de status já cobre isso).
- Glassmorphism/blur pesado em componentes que renderizam com frequência (a tabela
  de ofertas re-renderiza a cada poll — blur custa GPU).
- Confetti, particles, ou qualquer "efeito de celebração" — é ferramenta operacional
  B2B, não app de gamificação.
- Mais de um elemento "hero"/chamativo por tela.

## Estado atual do frontend (`apps/web/src/app/(dashboard)/`)

As 5 telas principais já existem e seguem os tokens acima: `dashboard`, `offers`,
`messaging`, `billing`, `groups`. Componentes reutilizáveis relevantes:
`components/count-up.tsx`, `components/status-badge.tsx`,
`components/layout/app-header.tsx`, `components/layout/app-sidebar.tsx`.
Antes de criar um componente novo, verifique se já existe um equivalente aí.

## Avisos operacionais (do README do repo — não ignorar)

- **Scraping do Mercado Livre via cookies de terceiros está descartado para a v1**
  (risco legal). Só marketplaces com API oficial de afiliados (Shopee, Amazon
  PA-API, AliExpress, Awin). Não gere UI que assuma ML scraping como fonte de dados.
- **WhatsApp via Baileys/Evolution API não é suportado pela Meta** — contas podem
  ser banidas. A UI de `messaging` deve deixar isso visível operacionalmente (não é
  problema de UI resolver, mas não esconda o risco atrás de uma UX "tudo certo").
- O `.env` do repo tem valores de desenvolvimento local — nunca commitar `.env` com
  valores reais de produção (Stripe, JWT secrets, etc.).
