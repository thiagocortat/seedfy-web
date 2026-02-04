# PRD-WEB-05 — Desafios e Check-in (Sem DB changes)

**Status:** Draft  
**Data:** 2026-02-04  
**Dependência:** PRD-WEB-01  
**Restrição:** sem alterações no banco

---

## 1) Objetivo

Habilitar o core loop de desafios no Web App com base nas tabelas já existentes (`challenges`, `challenge_participants`, `daily_checkins`).

---

## 2) Escopo

### Lista de desafios (`/app/challenges`)
- Desafios do usuário via `challenge_participants.user_id = auth.uid()`
- Filtrar por status (ativo/concluído) se existir coluna/status

### Detalhe do desafio (`/app/challenges/[id]`)
- Título, descrição, período (se existir), progresso
- Mostrar últimas atividades/check-ins (se existir join disponível)

### Check-in diário
- Inserir em `daily_checkins` respeitando constraint existente
- Tratar duplicidade:
  - se tentativa repetida → UI informa “check-in do dia já realizado”

---

## 3) Fora de escopo

- Criação/edição avançada de desafios na web se isso não existir no mobile ou exigir permissões adicionais
- Social (comentários, ranking) se depender de tabelas ausentes

---

## 4) Critérios de aceite

- Usuário lista desafios e abre detalhe
- Usuário realiza check-in diário com validação de duplicidade
- Sem mudanças no banco
