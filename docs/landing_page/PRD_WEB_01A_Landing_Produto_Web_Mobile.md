# PRD-WEB-01A — Landing “Produto” (Web + Mobile) + Acesso (Login/Signup)

**Status:** Draft  
**Data:** 2026-02-04  
**Dependências:** PRD-WEB-01 — Fundamentos do Web App + Landing (Sem DB changes)  
**Restrição:** Sem alterações no banco (somente UI/rotas/SEO)

---

## 1) Contexto e problema

A landing atual comunica apenas o **App Mobile**. Com o lançamento do **Web App Seedfy**, a home pública precisa reposicionar o Seedfy como **produto multi-plataforma** e, principalmente, oferecer **acesso claro a Login/Signup** (hoje ausente).

---

## 2) Objetivo

Entregar uma landing pública orientada a conversão que:
1) Apresente Seedfy como produto **Web + Mobile**  
2) Direcione usuários para:
   - **Acessar Web** (login / app)  
   - **Baixar o App** (stores)  
3) Garanta acesso persistente e óbvio a **Entrar** e **Criar conta** no header e CTAs estratégicos.

---

## 3) Hipóteses

- Ao destacar “Web + Mobile” e oferecer “Acessar Web” no hero, aumentamos a ativação de usuários no Web App.
- Ao incluir “Entrar / Criar conta” no header fixo, reduzimos fricção e abandono.

---

## 4) Escopo

### 4.1 Em escopo (Landing pública)

**Rotas públicas**
- `/` (Home — “Produto”)
- `/features`
- `/faq`
- `/terms`
- `/privacy`
- `/support`

**Header fixo (todas as rotas públicas)**
- Logo Seedfy (link para `/`)
- Navegação: Produto (scroll ou `/`), Web App, Mobile App, FAQ, Suporte
- Botões:
  - **Entrar** → `/login`
  - **Criar conta** → `/signup` (primário)

**Hero (primeira dobra)**
- Headline e subheadline posicionando “Web + Mobile”
- Mock/prints lado a lado: **Web** e **Mobile**
- CTAs:
  - Primário: **Acessar Web** → `/app` se logado; senão `/login`
  - Secundário: **Baixar o App** → links das stores (com fallback)

**Seção “Web vs App”**
- Dois cards (Web App / Mobile App) com 3–5 bullets cada + CTA correspondente

**Seção “O que você faz no Seedfy”**
- 3–5 blocos de features (copy simples + ícone/ilustração)
  - Conteúdo/Player (teaser)
  - Grupos
  - Desafios (check-in)
  - (Opcional) Igreja (se for pilar atual)

**Seção “Como funciona”**
- 3 passos: Criar conta → Entrar/Grupo → Desafio e check-in

**CTA final**
- “Comece agora no Web ou no App”
- Botões: Criar conta (primário), Entrar, Baixar o app

**Footer**
- Links: Termos, Privacidade, Suporte
- (Opcional) e-mail de contato / social

**SEO/Sharing**
- Metadata por rota (title/description)
- OG image (estática) + favicon
- Sitemap/robots (mínimo)

### 4.2 Em escopo (regras de acesso)

- Usuário não autenticado ao acessar `/app/**` → redirect para `/login` (já previsto no PRD-WEB-01)
- Usuário autenticado ao acessar `/login` ou `/signup` → redirect para `/app`
- CTA “Acessar Web” aplica a mesma regra (smart CTA)

### 4.3 Fora de escopo

- Mudanças no banco / schema
- Conteúdo dinâmico via CMS/backoffice (pode ser fase posterior)
- Telemetria, métricas e A/B testing
- Implementação do player e experiências completas (PRDs específicos)

---

## 5) Requisitos funcionais detalhados

### 5.1 Header e navegação
- Header **fixo** (sticky) com estado “compacto” ao scroll (altura reduzida)
- Em mobile: menu hamburguer contendo links + botões de acesso

### 5.2 CTAs e destinos
- **Acessar Web**
  - Se sessão válida: `/app`
  - Sem sessão: `/login`
- **Entrar**: `/login`
- **Criar conta**: `/signup`
- **Baixar o App**
  - Links App Store / Google Play (quando disponíveis)
  - Se indisponível: página “coming soon” (ou desabilitar com tooltip)

### 5.3 Seções e comportamento
- Home `/` deve suportar:
  - âncoras (ex.: `#produto`, `#web`, `#mobile`, `#como-funciona`, `#faq`), opcional
  - Layout responsivo: side-by-side no desktop; stacked no mobile
- `/features` detalha “Web App” e “Mobile App” com bullets e prints
- `/faq` com 6–12 perguntas (accordion)
- `/terms` e `/privacy` renderizando Markdown com “versão”/data
- `/support`
  - MVP: mailto com template + FAQ link
  - Opcional: form (se já existir provider)

---

## 6) Requisitos não-funcionais

- Responsivo (360px → 1440px+)
- Acessibilidade básica:
  - foco visível, labels, contraste mínimo, aria em menu/accordion
- Performance:
  - Hero otimizado (Next/Image), lazy load de prints abaixo da dobra
- Consistência visual com o Design System (PRD-WEB-06), sem depender dele para lançar

---

## 7) Critérios de aceite

- Landing comunica claramente **Web + Mobile** na primeira dobra
- Header exibe **Entrar** e **Criar conta** em todas as páginas públicas
- CTA “Acessar Web” redireciona corretamente com/sem sessão
- Páginas públicas implementadas e navegáveis (sem 404)
- Lighthouse: sem erros graves (A11y/SEO/perf)

---

## 8) Conteúdo (diretrizes de copy)

- PT-BR, tom: moderno, acolhedor, objetivo (não “institucional” demais)
- Evitar promessas de features não entregues no web/app
- Priorizar mensagens de:
  - constância
  - comunidade
  - simplicidade do ritual (check-in)

---

## 9) Checklist implementável (Next.js)

> **Suposição:** monorepo com `apps/web` (Next.js App Router), Tailwind, Supabase Auth, e páginas públicas server-rendered quando possível.

### 9.1 Rotas e estrutura
- [ ] Criar/ajustar rotas públicas:
  - [ ] `app/(public)/page.tsx` (Home)
  - [ ] `app/(public)/features/page.tsx`
  - [ ] `app/(public)/faq/page.tsx`
  - [ ] `app/(public)/terms/page.tsx`
  - [ ] `app/(public)/privacy/page.tsx`
  - [ ] `app/(public)/support/page.tsx`
- [ ] Garantir rotas de auth existentes:
  - [ ] `app/(auth)/login/page.tsx`
  - [ ] `app/(auth)/signup/page.tsx`
  - [ ] `app/(auth)/reset/page.tsx` (se já previsto)
- [ ] Garantir proteção de `/app/**` (middleware ou layout guard)

### 9.2 Layout público reutilizável
- [ ] Criar `PublicLayout` em `app/(public)/layout.tsx`
- [ ] Criar componentes:
  - [ ] `PublicHeader` (sticky + mobile menu)
  - [ ] `PublicFooter`
- [ ] Adicionar navegação e botões (Entrar/Criar conta)

### 9.3 Home (seções)
- [ ] `Hero` com:
  - [ ] headline/subheadline
  - [ ] 2 CTAs (Acessar Web / Baixar App)
  - [ ] 2 imagens (Web + Mobile) via `next/image`
- [ ] `PlatformSplit` (“Web vs App”) com dois cards e CTAs
- [ ] `FeatureHighlights` (3–5 itens)
- [ ] `HowItWorks` (3 passos)
- [ ] `FinalCTA`

### 9.4 Smart CTA “Acessar Web”
- [ ] Criar helper `getRedirectForWebCTA(session)`:
  - [ ] se logado → `/app`
  - [ ] senão → `/login`
- [ ] Implementar como:
  - [ ] Server Component com leitura de sessão (preferível) **ou**
  - [ ] Client Component com hook de sessão (fallback)

### 9.5 SEO e assets
- [ ] Implementar `metadata` por rota (title/description)
- [ ] OG image:
  - [ ] `public/og.png`
  - [ ] `openGraph.images`
- [ ] `favicon.ico` / `apple-touch-icon`
- [ ] `robots.txt` e `sitemap.xml` (mínimo)

### 9.6 Conteúdo legal e suporte
- [ ] Render Markdown para `/terms` e `/privacy`
  - [ ] armazenar conteúdo em `content/legal/*.md`
  - [ ] exibir “versão”/data no topo
- [ ] `/support`:
  - [ ] botão `mailto:` com assunto e corpo pré-preenchidos
  - [ ] link para `/faq`

### 9.7 Qualidade e validação
- [ ] Responsividade:
  - [ ] mobile 360/390
  - [ ] tablet 768
  - [ ] desktop 1280/1440
- [ ] A11y:
  - [ ] menu com aria
  - [ ] accordions acessíveis
  - [ ] foco e tab order ok
- [ ] Performance:
  - [ ] imagens otimizadas
  - [ ] evitar JS desnecessário na landing
- [ ] Smoke test de redirects:
  - [ ] visitante → `/app` redireciona `/login`
  - [ ] logado → `/login` redireciona `/app`

---

## 10) Open questions (não bloqueantes)

- Links das lojas já existem? (App Store / Google Play)
- Qual o padrão de navegação do `/app` no mobile web (drawer vs bottom-nav) — PRD-WEB-01 sugere escolher 1 padrão.

