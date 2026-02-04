# PRD-WEB-PARITY-02 — Challenges & Jornadas (Explorar, Iniciar, Criar, Entrar) — Sem DB changes

**Status:** Draft  
**Data:** 2026-02-04  
**Dependências:** Web App base + UI de Jornada (Hoje/Trilha) existente  
**Restrição:** sem alterações no banco (schema/migrations).  
**Sem telemetria.**

---

## 1) Objetivo

Completar paridade web para o loop de Challenges/Jornadas:
- Explorar Jornadas (catálogo)
- Iniciar Jornada (cria um `challenge` vinculado a `journey_id` + participant)
- Criar Challenge “comum” (pessoal ou do grupo)
- Entrar em Challenge (join)
- Manter check-in 100% manual (sem inserts automáticos)

---

## 2) Tabelas existentes (fonte de verdade)

- `public.journey_templates` (catálogo; `is_active`, `tags`, `durations_supported`, cover, descrições)
- `public.journey_chapter_templates` (capítulos; `journey_id`, `day_index`, conteúdo, mídia)
- `public.challenges` (`journey_id`, `group_id`, `created_by`, `duration_days`, `start_date`, `end_date`, `status`, `unlock_policy`, `timezone`)
- `public.challenge_participants` (`challenge_id`, `user_id`, `status`, `joined_at`, `progress`)
- `public.daily_checkins` (`challenge_id`, `user_id`, `date_key`, `day_index`, `reflection_text`, `visibility`)

---

## 3) Rotas e UX

### 3.1 `/app/journeys` — Explorar Jornadas
- Query: `journey_templates where is_active=true`
- Filtros:
  - busca por título
  - tags (multi-select)
  - duração (se `durations_supported` existir e for usado)
- Card: cover + title + descrição curta + badges (duração/tags)
- CTA: **Iniciar jornada**

### 3.2 `/app/journeys/[templateId]` — Detalhe da Jornada (template)
- Mostrar: descrição longa, preview (opcional) do capítulo 1
- Selecionar:
  - duração (quando houver `durations_supported`)
  - unlock_policy (somente opções já usadas; default `daily`)
  - timezone (default: browser)
  - (opcional) iniciar vinculada a um grupo (se o RN permitir)

CTA: **Começar**

### 3.3 “Começar” (Iniciar Jornada) — Writes
Ao confirmar:
1) `insert challenges` com:
   - `journey_id = templateId`
   - `created_by = auth.uid()`
   - `duration_days = duration selecionada`
   - `start_date = now()`
   - `end_date = start_date + duration_days`
   - `timezone = timezone selecionada`
   - `unlock_policy = valor existente`
   - `status = 'active'` (ou valor que o RN já usa)
2) `insert challenge_participants` para o usuário (status/joined_at)

Após sucesso:
- redirecionar para `/app/challenges/[challengeId]` (já renderiza Jornada)

Falha (RLS):
- mostrar erro claro + CTA “Iniciar no app”.

### 3.4 `/app/challenges` — Lista (Ativos/Concluídos) + CTA “Criar/Entrar”
- Tabs: Ativos / Concluídos
- CTA: **Criar challenge** e **Explorar jornadas**
- Cada item:
  - badge “Jornada” se `journey_id != null`
  - status do dia (feito/pendente) baseado em `daily_checkins` (regra já definida)
  - progresso (exibir `progress` se confiável; senão calcular por count de checkins)

### 3.5 `/app/challenges/new` — Criar Challenge comum
Campos mínimos:
- título
- duração (dias)
- timezone
- (opcional) vincular a um grupo do usuário (`group_id`)
- start_date (default now)
- unlock_policy (se aplicável)

Writes:
1) `insert challenges` (sem `journey_id`)
2) `insert challenge_participants` do criador

### 3.6 Entrar em Challenge (join)
Para challenges “discoverable” via grupo (modelo mínimo):
- se challenge estiver vinculado a um grupo do qual o usuário é membro:
  - permitir `insert challenge_participants`
- se não estiver:
  - ocultar ou pedir para entrar via grupo no app (dependendo da regra RN)

> Não inventar tabelas/colunas para discoverability de challenges; usar as relações existentes.

---

## 4) Regras importantes

- **Check-in não pode ser criado automaticamente** ao abrir páginas.
- Check-in somente no clique “Concluir capítulo / Fazer check-in”.
- `todayKey` e “Feito hoje” seguem `daily_checkins.date_key` no timezone do challenge quando existir.

---

## 5) Critérios de aceite

- Usuário consegue explorar `journey_templates` e iniciar uma jornada (criando challenge + participant).
- Usuário consegue criar challenge comum pela web (ou recebe mensagem caso RLS bloqueie).
- Usuário consegue entrar em challenges permitidos pelo modelo atual.
- Nenhuma linha em `daily_checkins` é criada sem clique explícito.

---

## 6) Plano de implementação

1) Catálogo `/app/journeys` + detalhe template (read)
2) Iniciar jornada (writes em challenges + participants)
3) Criar challenge comum (writes)
4) Join em challenge (onde aplicável)
5) Revisão de UX e empty states

---

## 7) Riscos

- Policies podem bloquear writes (principalmente insert em challenges/participants).
- `unlock_policy` values precisam ser lidos do dataset atual (não inventar).
