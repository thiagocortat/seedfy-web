# Seedfy — PRD: Correções Web App — Challenges & Jornadas (v1)

**Status:** Draft  
**Data:** 2026-02-04  
**Owner:** Produto (Thiago)  
**Plataforma:** `apps/web` (Next.js) + Supabase  
**Restrição:** sem alterações no banco (schema/migrations proibidos)

---

## 1) Problemas reportados

1) Status “Feito hoje” incorreto  
Na Web, todos os desafios/jornadas aparecem como “feitos hoje”, porém o usuário não realizou check-in no dia.

2) Jornada tratada como challenge comum  
Quando `challenges.journey_id` está preenchido, a tela não exibe a UX de Jornada (Hoje / Trilha / Capítulo do dia).

---

## 2) Objetivo

- Corrigir “Feito hoje ✅ / Pendente” por challenge/jornada.
- Implementar Jornada na Web quando `journey_id` existir:
  - visão Hoje com capítulo do dia
  - visão Trilha com estados (concluído/disponível/bloqueado)
  - check-in com reflexão

---

## 3) Fonte de verdade (schema existente)

- `public.challenges` (timezone, unlock_policy, journey_id, start_date, duration_days)
- `public.challenge_participants`
- `public.daily_checkins` (date_key, day_index)
- `public.journey_templates`
- `public.journey_chapter_templates` (journey_id, day_index, conteúdo)

---

## 4) Correção crítica: cálculo do “Feito hoje”

### 4.1 Regra correta
Para `challenge_id` e `uid`, “Feito hoje” é verdadeiro somente se existir linha em `daily_checkins` com:
- challenge_id = challenge_id
- user_id = uid
- date_key = todayKey(challenge.timezone || browserTZ)

**Proibido** inferir por:
- `progress` (challenge_participants.progress)
- “tem qualquer check-in”
- `completed_at` sem normalização de timezone

### 4.2 todayKey com timezone do challenge
- Usar `challenges.timezone` quando preenchido (IANA).
- Senão usar timezone do browser.

Recomendação: `date-fns-tz` (`formatInTimeZone(new Date(), tz, 'yyyy-MM-dd')`).

### 4.3 Lista: evitar N+1 (recomendado)
- Buscar desafios (ids + timezone)
- Agrupar por timezone
- Para cada timezone: buscar `daily_checkins` com `user_id=uid` + `date_key=todayKey(tz)` + `challenge_id in (...)`
- Mapear `{challenge_id -> hasCheckinToday}`

### 4.4 Critérios de aceite
- Sem check-in do dia → Pendente
- Ao inserir check-in → muda para Feito hoje ✅ imediatamente
- Virada do dia → recalcula no load

---

## 5) Jornadas na Web

### 5.1 Identificação
- `challenges.journey_id != null` ⇒ render Jornada

### 5.2 todayDayIndex
- Derivar por data no timezone do challenge:
  - `dayIndex = daysBetween(start_date_in_tz, now_in_tz) + 1`
  - clamp: 1..duration_days (ou número de capítulos existentes)

### 5.3 Hoje
- Buscar capítulo:
  - `journey_chapter_templates` por `journey_id` + `day_index=todayDayIndex`
- Render:
  - title, narrative, focus, practice, verse_reference, verse_text, reflection_prompt, prayer
  - media_url/media_type (se houver)
- CTA “Concluir capítulo”:
  - inserir `daily_checkins` com:
    - challenge_id, user_id, date_key=todayKey, day_index=todayDayIndex
    - reflection_text opcional

### 5.4 Trilha
- Listar capítulos por day_index
- Estado:
  - concluído: existe daily_checkins.day_index=X para challenge/user
  - disponível/bloqueado: conforme unlock_policy + todayDayIndex

### 5.5 unlock_policy (mínimo viável)
Mapear apenas valores existentes no banco:
- daily: só capítulo do dia
- catchup: capítulos até o dia atual
- free: todos (se existir no dataset)

---

## 6) Rotas e componentes

- `/app/challenges` lista unificada
- `/app/challenges/[id]` detalhe (Jornada ou Legado)

Componentes:
- ChallengeCard (badge Desafio/Jornada + status do dia)
- JourneyTodayView
- JourneyTrailView
- CheckinButton (depende de hasCheckinToday)
- ChapterCard

---

## 7) Checklist de debugging

SQL (substituir `<UID>` e `<CHALLENGE_ID>`):
- Check-ins do usuário:
  - select challenge_id, date_key, day_index, completed_at from daily_checkins where user_id='<UID>' order by completed_at desc limit 50;
- Check-ins do challenge:
  - select * from daily_checkins where user_id='<UID>' and challenge_id='<CHALLENGE_ID>' order by date_key desc limit 10;

Client logs:
- challenge.timezone
- todayKey calculado
- resultado real da query (existe ou não existe)

---

## 8) Critérios de aceite (Jornadas)

- journey_id ⇒ tabs Hoje/Trilha aparecem
- Hoje renderiza capítulo correto do dia
- Trilha reflete concluídos vs pendentes corretamente
- Legado continua funcionando com check-in simples

---

## 9) Entregáveis

- Bugfix “Feito hoje” (dashboard + lista + detalhe)
- Jornada (Hoje/Trilha) completa na Web
- Ajustes de UI nesses fluxos para aproximar do RN
