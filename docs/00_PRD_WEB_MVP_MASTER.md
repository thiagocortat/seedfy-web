# Seedfy — PRD Web (Backoffice + Landing) — Plano de Entrega (MVP)

**Data:** 2026-01-22  
**Escopo deste documento:** Construção de duas aplicações web em **Next.js** para suportar o app mobile Seedfy (React Native já existente):  
1) **Backoffice (Admin)** para gestão de conteúdo (e, em fase posterior, gestão de igrejas/moderação).  
2) **Landing Page** pública para aquisição (download, posicionamento, FAQ, termos/privacidade, suporte).

> Contexto: o app mobile já possui navegação e módulos de Conteúdo/Player, Grupos/Desafios e Integração com Igreja, com stack Supabase + Expo/React Native. fileciteturn15file6

---

## 1) Objetivos do MVP (Web)

### 1.1 Landing (público)
- Explicar claramente “o que é o Seedfy” e direcionar para instalação (App Store / Google Play).
- Prover páginas obrigatórias (Privacidade, Termos) e canal de suporte.
- Servir como base SEO + link de compartilhamento (OpenGraph) para campanhas e divulgação.

### 1.2 Backoffice (interno)
- Permitir que um operador/admin **cadastre e edite conteúdo multimídia** consumido pelo app (podcast/vídeo/música) conforme a tabela `content_items`.  
- Permitir manutenção básica do catálogo de igrejas conforme tabela `churches`.
- Evitar mudanças de banco e políticas no início (conforme sua diretriz); endurecer segurança e papéis **apenas nas etapas finais**.

---

## 2) Restrições e Decisões

### 2.1 Restrições de curto prazo
- **Sem alterações no banco nas etapas iniciais** (sem novas tabelas, sem novos campos).
- **Segurança avançada e papéis de admin** ficam para a etapa final.

### 2.2 Decisões de arquitetura
- Monorepo com **Next.js (Admin)** + **Next.js (Landing)**.
- Integração com Supabase:
  - Landing: leitura pública/estática (sem necessidade de service-role).
  - Admin: leituras via Supabase client; **mutações via rotas server-side** (Next.js Route Handlers) usando **SUPABASE_SERVICE_ROLE** no servidor para não expor chaves no cliente (mesmo antes de RLS mais rígido).

---

## 3) Escopo do MVP

### 3.1 Landing (MVP)
**Páginas**
- Home (Hero + proposta + prints mockados/estáticos + CTA download)
- FAQ (mínimo)
- Termos
- Privacidade
- Suporte/Contato (form simples ou mailto)
- Página “Igrejas” (opcional no MVP: listagem simples; pode ser só um placeholder)

**Conteúdo**
- Texto institucional (tom moderno e acolhedor).
- Seção de destaque de features:
  - Conteúdo multimídia (podcasts, vídeos, músicas). fileciteturn15file6
  - Grupos e desafios (núcleo social/gamificado). fileciteturn15file0

### 3.2 Backoffice (MVP)
**Módulos**
1) **Content Library**
   - Listar `content_items` com filtros por `type` e busca por `title`
   - Criar / editar / remover item
   - Upload de capa e mídia para Supabase Storage (gera URL e grava em `cover_url` / `media_url`)
   - Alternar `is_live` e editar `title` / `description`
2) **Church Directory**
   - Listar `churches`
   - Criar/editar nome, cidade, estado, logo_url (upload opcional)
3) **Acesso**
   - Login via Supabase Auth (email/senha) e **whitelist de e-mails** via `.env` (sem DB changes)
   - Páginas do admin protegidas por middleware

> Observação: o app mobile prevê “Feed de atualizações baseado na igreja selecionada”. fileciteturn15file6  
> Como não existe `church_posts` no schema atual, este item fica **fora do MVP web** e volta no backlog para etapa com mudança de modelo de dados.

---

## 4) Fora de Escopo (neste momento)
- Papéis/roles completos (RBAC), RLS hardening e auditoria detalhada.
- Moderação de UGC e feed social (caso exista).
- CMS avançado, agendamento, destaque/featured ordering (não há campos no `content_items` hoje).
- Métricas/KPIs e instrumentação (você pediu para não incluir por agora).

---

## 5) Plano por Etapas (alto nível)

**Etapa 0 — Monorepo Foundation**  
Repo + padrões + CI + deploys base (Vercel).

**Etapa 1 — Landing MVP**  
Site público com páginas essenciais + SEO básico + links lojas.

**Etapa 2 — Admin MVP (CRUD de conteúdo e igrejas)**  
Listagem + forms + validação + upload em storage + proteção simples.

**Etapa 3 — Polimento (Qualidade/UX/Admin Ops)**  
Estados vazios, bulk actions simples, preview, logs de erro, DX.

**Etapa 4 — Segurança & Papéis (por último)**  
RBAC, RLS, auditoria, políticas de storage, segregação por ambientes.

---

## 6) Critérios de Aceite (MVP)

### Landing
- Publicação online (Vercel) com URLs estáveis e pagespeed aceitável.
- Home com CTA para App Store / Google Play.
- Termos + Privacidade acessíveis no rodapé.
- OpenGraph (title/description/image) configurado.

### Admin
- Usuário autorizado consegue logar e:
  - Criar e editar `content_items` (podcast/vídeo/música) e ver aparecer no app (via consumo já existente).
  - Fazer upload de capa/mídia e persistir URLs no banco.
  - Criar e editar `churches`.
- Usuário não autorizado **não acessa** rotas do admin.

---

## 7) Backlog (itens dependentes de DB changes — propositalmente depois)
- `content_items.status` (draft/published/archived)
- `content_items.featured_order` ou “featured flags”
- `church_posts` (feed por igreja) + moderação
- Papéis (admin/editor/viewer) e trilha de auditoria
