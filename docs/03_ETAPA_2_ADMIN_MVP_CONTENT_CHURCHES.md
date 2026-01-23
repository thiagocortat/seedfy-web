# Etapa 2 — Admin MVP: Gestão de Conteúdo e Igrejas (sem DB changes)

## Objetivo
Disponibilizar um backoffice funcional para alimentar a biblioteca de conteúdo e o diretório de igrejas consumidos pelo Seedfy.

## Escopo
### 1) Content Library (`content_items`)
Campos existentes no schema:
- `type` (podcast | video | music)
- `title` (obrigatório)
- `description` (opcional)
- `cover_url` (opcional)
- `media_url` (opcional)
- `is_live` (boolean)
- `play_count` (somente leitura/telemetria do app)

Funcionalidades:
- Listagem com paginação (ou infinite), filtro por type, busca por title
- Create / Edit / Delete
- Upload de capa e mídia (Supabase Storage) e gravação das URLs nos campos

### 2) Churches (`churches`)
Campos existentes:
- `name` (obrigatório)
- `logo_url`, `city`, `state` (opcionais)

Funcionalidades:
- Listagem + Create/Edit/Delete
- Upload de logo (opcional) e gravação de `logo_url`

### 3) Acesso (simples, sem DB)
- Login via Supabase Auth (email/senha)
- Whitelist de e-mails via `.env` (ex.: `ADMIN_ALLOWED_EMAILS=a@x.com,b@y.com`)
- Middleware bloqueando rotas se não autenticado/permitido

## Regras e UX
- Form com validação (zod):
  - title obrigatório
  - type obrigatório
  - URLs opcionais, mas se existir, validar formato
- Upload:
  - Mostrar progresso
  - Gerar path padronizado (ex.: `content/{type}/{uuid}/cover.jpg`)
- Preview:
  - Se `media_url` existir, botão “Preview” abre modal (audio/video)

## Tarefas
1) Autenticação e proteção
- [ ] Implementar login email/senha (Supabase)
- [ ] Implementar whitelist por env
- [ ] Implementar middleware de proteção

2) Content Library
- [ ] List page (table/cards)
- [ ] Create/Edit form
- [ ] Delete com confirmação
- [ ] Preview modal
- [ ] Upload cover/media para storage

3) Churches
- [ ] List + form
- [ ] Upload logo

4) DX/Qualidade
- [ ] Toasts e estados de loading/erro
- [ ] Validar permissões em server routes
