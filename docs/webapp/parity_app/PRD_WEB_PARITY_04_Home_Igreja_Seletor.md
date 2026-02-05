# PRD-WEB-PARITY-04 — Home com Igreja + Posts e Troca de Igreja (Web App) — Sem DB changes

**Status:** Draft  
**Data:** 2026-02-04  
**Owner:** Produto (Thiago)  
**Plataforma:** `apps/web` (Next.js) + Supabase  
**Restrição:** **sem alterações no banco** (schema/migrations proibidos).  
**Sem telemetria.**

---

## 1) Contexto

Faltam duas peças importantes para paridade com o RN:
1) Na **Home (/app)** é essencial exibir a **igreja do usuário** e os **últimos posts**.
2) Na página **Igreja (/app/church)** falta a opção de **trocar de igreja** (existe no RN).

Este PRD adiciona:
- Bloco “Minha Igreja” na Home com posts recentes.
- Fluxo completo de **seleção e troca de igreja** (componente reutilizável).

---

## 2) Objetivo

- Dar contexto imediato na Home (igreja + conteúdo recente).
- Permitir que o usuário altere sua igreja na web atualizando `public.users.church_id` (text).

---

## 3) Fonte de verdade (schema existente)

- `public.users`: `id`, `church_id` (text), `name`, `photo_url`, `onboarding_completed`...
- `public.churches`: `id` (uuid), `name`, `logo_url`, `city`, `state`
- `public.church_posts`: `church_id` (uuid), `status`, `pinned`, `published_at`, `title`, `excerpt`, `image_url`, `link_url`
- `public.church_quick_actions`: `church_id` (uuid), `is_enabled`, `sort_order`, `label`, `url`, `open_mode`

**Nota de compatibilidade:** `users.church_id` é text e `churches.id` é uuid. Sem DB change, assumir que `users.church_id` guarda o uuid como string.

---

## 4) Escopo

### Inclui
- Home (/app): bloco “Minha Igreja” + posts recentes + CTA “Ver Igreja”
- Igreja (/app/church): CTA “Trocar igreja”
- Componente `ChurchPicker` (modal/drawer) com busca e seleção
- Update em `public.users.church_id` ao selecionar

### Não inclui
- Backoffice (criar/editar igreja)
- Upload de assets
- Telemetria/métricas

---

## 5) Requisitos funcionais

### 5.1 Home (/app): Bloco “Minha Igreja” (novo)

#### 5.1.1 Identificação da igreja
- Ler `public.users` do usuário logado e obter `church_id`.
- Se `church_id` vazio:
  - bloco vazio com:
    - título: “Minha Igreja”
    - texto: “Selecione sua igreja para ver posts e ações.”
    - CTA: “Selecionar igreja” (abre `ChurchPicker`)
- Se `church_id` presente:
  - buscar igreja em `public.churches` pelo `id` correspondente ao uuid string em `church_id`.
  - render:
    - logo (se houver)
    - nome + cidade/estado
    - CTA primário “Ver Igreja” → `/app/church`
    - CTA secundário “Trocar” → abre `ChurchPicker`

#### 5.1.2 Últimos posts da igreja (Home)
- Fonte: `public.church_posts`
- Filtro:
  - `church_id = <uuid da igreja>`
  - `status = 'published'`
  - `published_at <= now()`
- Ordenação: `pinned desc`, depois `published_at desc`
- Limite: 3 posts
- Ações:
  - “Ver todos” → `/app/church`
  - clicar em post → `/app/church/posts/[id]`

Estados:
- loading: skeleton
- empty: “Ainda não há posts publicados”
- error: “Não foi possível carregar posts”

#### 5.1.3 Quick actions (opcional na Home)
- Se existirem `church_quick_actions` habilitadas:
  - mostrar 2–4 atalhos
- Caso contrário: ocultar seção

---

### 5.2 Igreja (/app/church): Trocar igreja (novo)

#### 5.2.1 Botão “Trocar igreja”
- Sempre visível quando logado.
- Ao clicar:
  - abre `ChurchPicker`
  - ao confirmar:
    - `update public.users set church_id = <church.id string> where id = auth.uid()`

#### 5.2.2 Recarregar conteúdo após troca
- Invalidar caches (react-query/swr):
  - profile do usuário
  - igreja atual
  - posts
  - quick actions
- Feedback: “Igreja atualizada”
- Em erro (RLS):
  - mensagem clara “Não foi possível alterar sua igreja neste ambiente.”

---

### 5.3 Componente `ChurchPicker` (reutilizável)

#### UX
- Desktop: modal
- Mobile: bottom sheet / drawer
- Search input (nome/cidade)
- Lista scrollável
- Seleção única (radio)
- Botões: “Cancelar” e “Selecionar”

#### Query
- Fonte: `public.churches`
- Busca: `name ilike %query%` (opcional city/state)
- Ordenação: `name asc`
- Empty: “Nenhuma igreja encontrada”

Acessibilidade:
- foco no input
- navegação por teclado
- ESC fecha modal

---

## 6) Critérios de aceite

Home:
1) Usuário com `church_id` vê igreja + 3 posts recentes (se existirem).
2) Usuário sem `church_id` vê estado vazio e consegue selecionar igreja.
3) Clique em post abre detalhe.

Troca:
4) Em `/app/church`, “Trocar igreja” abre picker e atualiza `users.church_id`.
5) Após troca, posts e quick actions refletem a nova igreja.
6) Em erro, UI informa claramente (sem falhar silenciosamente).

---

## 7) Plano de implementação

1) `ChurchPicker` (read-only)
2) Update `users.church_id` (write) + erros
3) Home bloco “Minha Igreja” + posts
4) Página igreja com CTA trocar + recarregamento
5) Refinos de UI

---

## 8) Riscos

- `users.church_id` pode conter string inválida → igreja não encontrada + permitir selecionar.
- RLS pode bloquear update em `public.users` → fallback e mensagem clara.
