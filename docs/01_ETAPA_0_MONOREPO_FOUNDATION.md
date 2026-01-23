# Etapa 0 — Monorepo Foundation (Next.js Admin + Next.js Landing)

## Objetivo
Criar a base de engenharia para evoluir Landing e Backoffice com consistência, reuso e deploy simples.

## Entregáveis
- Monorepo com workspaces (pnpm ou npm workspaces)
- Apps:
  - `apps/admin` (Next.js App Router)
  - `apps/landing` (Next.js App Router)
- Packages:
  - `packages/shared` (supabase client/server helpers, zod schemas, types)
  - `packages/ui` (componentes de UI reutilizáveis)
  - `packages/config` (eslint, tsconfig, prettier)
- Pipeline de deploy:
  - Vercel (2 projetos ou 1 projeto com subpaths)
  - Variáveis de ambiente separadas por app

## Especificações
- TypeScript end-to-end
- App Router + Server Components
- Tailwind + design tokens mínimos (cores, spacing, radius)
- Auth (admin): Supabase Auth (email/senha) + whitelist por `.env` (sem DB)
- Integração Supabase:
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` apenas no servidor do `admin`

## Tarefas
1) Repo e tooling
- [ ] Inicializar monorepo
- [ ] Configurar lint/format
- [ ] Husky + lint-staged (opcional)
- [ ] Padronizar estrutura de pastas

2) Setup apps
- [ ] Criar `apps/admin` (Next.js)
- [ ] Criar `apps/landing` (Next.js)
- [ ] Configurar Tailwind em ambos

3) Shared packages
- [ ] Criar supabase client (browser) e supabase server (service-role) em `packages/shared`
- [ ] Criar zod schemas para `content_items` e `churches`
- [ ] Criar utilitários de validação de `.env`

4) Deploy base
- [ ] Configurar Vercel landing
- [ ] Configurar Vercel admin (com proteção por auth)
- [ ] Testar build e preview URLs
