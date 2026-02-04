# PRD-WEB-01 — Fundamentos do Web App + Landing (Sem DB changes)

**Status:** Draft  
**Data:** 2026-02-04  
**Dependência:** PRD Master Web App  
**Restrição:** sem alterações no banco

---

## 1) Objetivo

Criar o app `apps/web` (Next.js) no monorepo e entregar:
- Landing pública responsiva com páginas institucionais e página de features
- Autenticação (login, signup, reset)
- Estrutura base da área logada `/app` com proteção de rota e layout responsivo

---

## 2) Escopo

### Landing (público)
- Páginas: Home, Features, FAQ, Termos, Privacidade, Suporte/Contato
- CTA: “Baixar o App” e “Acessar Web”
- SEO básico (title/description/OG tags)

### Autenticação
- Login e Signup por e-mail/senha (Supabase Auth)
- Reset de senha
- Persistência de sessão
- Proteção de rotas: `/app/**`

### Shell da área logada
- Rotas vazias/placeholder:
  - `/app` (dashboard simples)
  - `/app/content` (placeholder)
  - `/app/groups` (placeholder)
  - `/app/challenges` (placeholder)
  - `/app/profile` (placeholder)
- Layout:
  - Desktop: sidebar + topbar
  - Mobile web: drawer ou bottom-nav (decisão de UX; implementar 1 padrão consistente)

---

## 3) Fora de escopo

- Player e consumo de conteúdo (vai no PRD-WEB-02)
- Qualquer integração que exija service role no client
- Métricas/telemetria

---

## 4) Requisitos funcionais detalhados

### 4.1 Rotas e acessos
- Visitante acessa landing.
- Usuário não autenticado que tenta `/app/**` é redirecionado para `/login`.
- Usuário autenticado que tenta `/login` é redirecionado para `/app`.

### 4.2 Estados de UI
- Loading de sessão
- Erro de autenticação (mensagem clara)
- Empty state do dashboard (ex.: “Bem-vindo ao Seedfy Web”)

---

## 5) Requisitos não-funcionais

- Responsivo (360px → 1440px+)
- Acessibilidade básica (labels, foco)
- Performance: render inicial rápido na landing

---

## 6) Critérios de aceite

- Landing publicada e navegável
- Login/signup/reset funcionando com Supabase Auth
- Rotas `/app/**` protegidas e com layout responsivo base
- Não há qualquer mudança no schema do banco

---

## 7) Tarefas (alto nível)

- Criar `apps/web` e configurar rotas (App Router)
- Implementar supabase client (anon key) e session provider
- Implementar páginas públicas (landing)
- Implementar auth pages e proteção de rotas
- Implementar layout responsivo `/app`
