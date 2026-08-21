# Affiliate SaaS

Automação de marketing de afiliados (mineração de ofertas + disparo segmentado para
WhatsApp/Telegram). SaaS B2B operacional, com foco em legibilidade de dados densos e
feedback de estado em tempo real.

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript strict, Tailwind, shadcn/ui, Framer Motion, Recharts
- **Backend (API):** NestJS + Prisma + PostgreSQL (Supabase) + Redis (BullMQ)
- **Worker:** NestJS (filas BullMQ)
- **Auth:** Supabase Auth (Google/GitHub) + JWT interno da API
- **Deploy:** Vercel (frontend) · Render (API + Worker)

Veja `CLAUDE.md` para o design system e regras de UI (tokens, motion, acessibilidade).

## Estrutura do monorepo

```
apps/
  web/      # Next.js 14 — frontend (Vercel)
  api/      # NestJS — API REST (Render; opcionalmente Vercel serverless)
  worker/   # NestJS — processamento de filas (Render)
packages/
  contracts/      # contratos compartilhados
  shared-types/   # tipos compartilhados
infra/docker/     # Postgres + Redis para dev local (docker-compose)
```

## Deploy

### Frontend → Vercel
- **Root Directory:** raiz do repositório (o `vercel.json` na raiz orquestra o build:
  `pnpm --filter web build` → `apps/web/.next`).
- Se preferir Root Directory = `apps/web`, o `apps/web/vercel.json` garante as mesmas
  env vars.
- O `vercel.json` já define `NEXT_PUBLIC_API_URL`, então não depende de configuração
  manual no dashboard.

### API + Worker → Render
- `render.yaml` provisiona o Redis e os serviços `web` (API) e `worker`.
- A API também pode rodar na Vercel (serverless) — `apps/api/vercel.json` faz rewrite
  de `/*` para a função `/api/serverless` (handler em `apps/api/src/lambda.ts`).

### Variáveis de ambiente

**Frontend (Vercel — `NEXT_PUBLIC_*`, expostas no browser):**

| Var | Obrigatória | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | sim | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sim | Chave anon do Supabase |
| `NEXT_PUBLIC_API_URL` | sim | `https://affiliate-saas-api.vercel.app/api` (já no `vercel.json`) |

**API (Render / Vercel — server-side):**

| Var | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | sim | PostgreSQL (Supabase) |
| `REDIS_URL` | sim | Redis para BullMQ |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | sim | JWTs internos da API |
| `ENCRYPTION_KEY` | sim | chave de criptografia (32 chars) |
| `SUPABASE_JWT_SECRET` | sim | valida JWTs do Supabase |
| `CORS_ORIGIN` | sim | origem do frontend (`https://affiliate-saas-chi.vercel.app`; inclua localhost para dev) |
| `EVOLUTION_API_URL` / `EVOLUTION_API_KEY` | não | gateway de mensagens |
| `LLM_*` | não | provedor de LLM (fallback) |

> Atenção: não comite `.env` com valores reais. Use `.env.example` como referência.

## Desenvolvimento local

Pré-requisitos: Node 20+, pnpm 9+, PostgreSQL, Redis.

```bash
pnpm install
docker compose -f infra/docker/docker-compose.yml up -d   # Postgres + Redis
cp .env.example .env                                       # preencha os valores
pnpm dev:web        # frontend  (apps/web, porta 3001)
pnpm dev:api        # api       (apps/api)
pnpm dev:worker     # worker    (apps/worker)
```

Qualidade (CI em `.github/workflows/ci.yml`):

```bash
pnpm lint
pnpm test
pnpm --filter web build && pnpm --filter api build
```

## Notas de correção (histórico recente)

- **404 `Cannot GET /` na API:** o NestJS usa `setGlobalPrefix('api')`, então `GET /`
  não tinha handler. Adicionado `GET /` em `apps/api/src/main.ts` (e no handler
  serverless `apps/api/src/lambda.ts`) retornando `200 { status: 'ok' }`.
- **Header/sidebar com dados do tenant:** o frontend lê `/auth/me` e usa o formato
  **flat** retornado pela API (`tenantName`, `subscription`, `isAdminMaster`), não
  aninhado.
