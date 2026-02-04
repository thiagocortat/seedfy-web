# PRD-WEB-04 — Grupos (Meus Grupos, Detalhe, Membros, Criação) (Sem DB changes)

**Status:** Draft  
**Data:** 2026-02-04  
**Dependência:** PRD-WEB-01  
**Restrição:** sem alterações no banco

---

## 1) Objetivo

Entregar o núcleo de grupos no Web App, reaproveitando `groups` e `group_members` (e demais tabelas já existentes).

---

## 2) Escopo

### Meus grupos (`/app/groups`)
- Listar grupos onde `group_members.user_id = auth.uid()`
- Ordenação: recentes (se houver `created_at`/`last_activity_at`)

### Detalhe do grupo (`/app/groups/[id]`)
- Cabeçalho: nome, imagem/capa, descrição (se existir)
- Membros:
  - Listar membros via `group_members` + `users`
  - Exibir role (owner/admin/member) se existir no schema

### Criar grupo (`/app/groups/new`)
- Permitido somente se:
  - o mobile já cria grupo via inserts em `groups` e `group_members`
  - policies RLS já permitirem
- Passos:
  - criar grupo
  - inserir membership do criador como owner

---

## 3) Convites e Solicitações (regra de restrição)

A web **não cria** novas estruturas para convites/solicitações. Portanto:
- Se já houver tabelas/fluxos existentes (ex.: `group_invites`, `group_join_requests`), a web pode implementar **somente** leitura/ação compatível.
- Se não houver, manter apenas:
  - convite por link (deep link) se já existir no produto atual
  - e a gestão avançada (inbox, aprovar/rejeitar) fica como backlog fora deste PRD.

---

## 4) Critérios de aceite

- Usuário vê lista de grupos e abre detalhe
- Lista de membros funciona
- Criação de grupo funciona (se policies permitirem) ou fica feature-flagged/off por padrão
- Sem mudanças no banco
