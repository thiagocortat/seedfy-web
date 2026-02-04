# PRD-WEB-PARITY-01 — Grupos completos (Criar, Buscar, Convidar, Solicitar entrada) — Sem DB changes

**Status:** Draft  
**Data:** 2026-02-04  
**Dependências:** Web App base (Auth + Shell)  
**Restrição:** sem alterações no banco (schema/migrations).  
**Sem telemetria.**

---

## 1) Objetivo

Trazer paridade com o RN para a feature de Grupos na web:
- Criar grupo
- Buscar grupos discoverable
- Solicitar entrada (join request)
- Convidar usuário existente (por e-mail)
- Inbox para convites e solicitações
- Aprovar/rejeitar (owner/admin)

---

## 2) Tabelas existentes (fonte de verdade)

- `public.groups` (inclui `discoverable`, `join_policy`)
- `public.group_members` (`group_id`, `user_id`, `role`, `joined_at`)
- `public.group_invitations` (`group_id`, `inviter_user_id`, `invited_user_id`, `status`, `created_at`, `responded_at`)
- `public.group_join_requests` (`group_id`, `requester_user_id`, `status`, `created_at`, `resolved_at`, `resolved_by_user_id`)
- `public.users` (`id`, `email`, `name`, `photo_url`, `church_id`, ...)

---

## 3) Rotas e UX

### 3.1 `/app/groups` — Meus Grupos
- Lista: grupos onde `group_members.user_id = auth.uid()`
- CTA primário: **Criar grupo**
- CTA secundário: **Buscar grupos**

Estados:
- loading/skeleton
- empty: “Você ainda não participa de grupos” + CTAs
- error RLS: mensagem clara + “Use o app para esta ação”

### 3.2 `/app/groups/new` — Criar Grupo
Campos:
- nome (obrigatório)
- imagem_url (opcional; apenas URL, sem upload)
- discoverable (boolean)
- join_policy (enum/string: valores já usados pelo RN)

Write:
1) `insert groups`
2) `insert group_members` do criador com `role = 'owner'` (ou o valor usado no RN)

Se insert falhar (RLS):
- manter somente leitura e instruir usar mobile.

### 3.3 `/app/groups/discover` — Buscar Grupos
- Query: `groups where discoverable = true` + busca por `name ilike`
- Cards: nome, imagem, badge join_policy
- CTA por grupo:
  - se `join_policy = 'open'`: **Entrar** (cria `group_members`)
  - se `join_policy` exigir aprovação: **Solicitar entrada** (cria `group_join_requests`)
  - se grupo não for discoverable: não aparece na busca.

### 3.4 `/app/groups/[id]` — Detalhe do Grupo
Se usuário é membro:
- Cabeçalho: nome, imagem
- Tabs:
  - Membros
  - Atividade (opcional, leitura de `group_activity` se já existir)
  - Convites/Solicitações (apenas para owner/admin)

Se usuário não é membro:
- Mostrar cartão “Você não faz parte deste grupo” + CTA (entrar/solicitar) conforme policy.

### 3.5 Inbox: Convites e Solicitações
Pode ser em:
- `/app/groups/inbox` (centralizado)
ou
- dentro de cada grupo (aba “Gestão”)

#### Convites recebidos (para o usuário)
- Query: `group_invitations where invited_user_id = auth.uid() and status='pending'`
Ações:
- Aceitar: `update group_invitations status='accepted'` + `insert group_members`
- Recusar: `update status='declined'`

#### Solicitações pendentes (para owner/admin)
- Query: `group_join_requests where group_id=:id and status='pending'`
Ações:
- Aprovar: `update ... status='approved', resolved_by_user_id=auth.uid()` + `insert group_members`
- Rejeitar: `update ... status='rejected' ...`

### 3.6 Convidar usuário existente (por e-mail)
UI no detalhe do grupo (apenas owner/admin):
- Campo e-mail
- Passo 1 (lookup): buscar `public.users` por email (case-insensitive)
- Passo 2 (invite): `insert group_invitations` com `inviter_user_id=auth.uid()`, `invited_user_id=<user.id>`, `status='pending'`

Falhas:
- e-mail não encontrado: mensagem “Usuário não encontrado”
- já é membro: bloquear
- convite pendente existente: bloquear
- RLS impede: mostrar “Use o app para convidar”

---

## 4) Regras de negócio (mínimo viável)

- Usuário não pode criar convites para si mesmo.
- `group_members` é a fonte de “pertence ao grupo”.
- `join_policy` define qual CTA é apresentado:
  - **open** → entrar direto
  - **request** → criar join request
  - **invite_only** → somente via convite (sem CTA de solicitar)

> Não inventar novos valores de `join_policy`; respeitar os existentes no ambiente.

---

## 5) Critérios de aceite

- Criar grupo funciona (ou degrada com mensagem se RLS bloquear).
- Buscar grupos discoverable lista e permite entrar/solicitar conforme join_policy.
- Convite por e-mail cria `group_invitations` e aparece no inbox do convidado.
- Aceitar convite adiciona membership.
- Owner/admin consegue aprovar join request.

---

## 6) Plano de implementação

1) Listas e detalhe (read-only) + membership gates
2) Criar grupo (writes)
3) Buscar/entrar/solicitar
4) Inbox convites/requests + ações
5) Convidar por e-mail + validações

---

## 7) Riscos

- Policies podem bloquear writes; a UI deve ser resiliente.
- Comparação de e-mail deve ser case-insensitive.
