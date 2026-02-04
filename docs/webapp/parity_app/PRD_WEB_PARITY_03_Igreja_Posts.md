# PRD-WEB-PARITY-03 — Igreja e Posts (Minha Igreja, Feed, Quick Actions) — Sem DB changes

**Status:** Draft  
**Data:** 2026-02-04  
**Dependências:** Auth + Perfil básico  
**Restrição:** sem alterações no banco (schema/migrations).  
**Sem telemetria.**

---

## 1) Objetivo

Implementar no Web App o eixo “Igreja” do RN:
- Minha Igreja (perfil)
- Feed de posts da igreja (publicados)
- Detalhe do post
- Ações rápidas da igreja

---

## 2) Tabelas existentes (fonte de verdade)

- `public.users` (inclui `church_id` **text**)
- `public.churches` (`id` uuid, `name`, `logo_url`, `city`, `state`)
- `public.church_posts` (`church_id` uuid, `status`, `pinned`, `published_at`, `title`, `body`, `excerpt`, `image_url`, `link_url`)
- `public.church_quick_actions` (`church_id`, `type`, `label`, `url`, `sort_order`, `is_enabled`, `open_mode`)

---

## 3) Rotas e UX

### 3.1 `/app/church` — Minha Igreja
- Carregar `users` (auth.uid) e ler `church_id`.
- Se `church_id` vazio:
  - mostrar “Você ainda não selecionou uma igreja” + CTA “Fazer no app” (por enquanto).
- Se `church_id` presente:
  - buscar igreja em `churches` por `id::text = users.church_id` (sem DB change)
  - exibir: nome, logo, cidade/estado
  - seções:
    - Quick Actions (se houver)
    - Posts (feed)

### 3.2 Quick Actions
- Query: `church_quick_actions where church_id=:id and is_enabled=true order by sort_order asc`
- Render:
  - botões/tiles com `label`
  - abrir `url` conforme `open_mode` (same_tab/new_tab/in_app)

### 3.3 Feed de Posts
- Query: `church_posts where church_id=:id and status='published' and published_at <= now()`
- Ordenação:
  - pinned desc
  - published_at desc
- Card:
  - image_url (se houver)
  - title
  - excerpt
  - published_at (formato local)

### 3.4 `/app/church/posts/[id]` — Detalhe do Post
- Render:
  - title, image_url, body
  - link_url (se existir)
- Se o post não estiver publicado (ou RLS bloquear):
  - mostrar “Post indisponível”.

---

## 4) Regras de negócio

- Somente posts `status='published'` devem aparecer.
- Pinned no topo.
- Não implementar criação/edição de posts (isso é Backoffice).

---

## 5) Critérios de aceite

- Usuário com `church_id` vê a igreja e um feed de posts publicados.
- Usuário sem `church_id` vê estado vazio com orientação.
- Quick actions aparecem e abrem URLs corretamente.
- Detalhe do post funciona.

---

## 6) Plano de implementação

1) Tela Minha Igreja (church lookup via `id::text`)
2) Quick actions
3) Feed + detalhe
4) Refinos de UI

---

## 7) Riscos

- `users.church_id` como text pode conter valor não compatível (não-uuid). A UI deve lidar com “igreja não encontrada”.
- RLS pode restringir leitura de posts/quick actions; degradar com mensagem clara.
