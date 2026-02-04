# Seedfy — PRD: Web App Correções (Dashboard, Conteúdo, Jornadas e UI Parity)

**Status:** Draft  
**Data:** 2026-02-04  
**Owner:** Produto (Thiago)  
**Plataforma:** `apps/web` (Next.js) + Supabase (Auth + DB + Storage)  
**Escopo deste PRD:** correções de implementação após aplicar os PRDs Web iniciais (MVP).  
**Restrição mantida:** **não propor mudanças no banco de dados** (sem novas tabelas/colunas/migrations).  
**Observação:** Sem telemetria/métricas neste PRD.

---

## 1) Contexto e problemas observados

Após a implementação do Web App, foram reportados os seguintes problemas:

1. **Dashboard / Início**: widgets “Meus Grupos”, “Desafios Ativos” e “Conteúdos Recentes” aparecem em branco com “Em breve” (placeholders não foram substituídos por dados reais).
2. **Conteúdo**: a rota/menu “Conteúdo” não lista itens, embora existam `content_items` publicados.
3. **Desafios**: a rota/menu “Desafio”:
   - não contempla **Jornadas (Challenges 2.0)**;
   - exibe “check-in realizado” mesmo quando não foi realizado (bug de cálculo/consulta).
4. **UI/UX**: layout e componentes não se parecem com a aplicação React Native (inconsistência visual e de navegação).

Este PRD define os ajustes necessários para tornar a experiência web **funcional**, **consistente** e **fiel** ao produto existente.

---

## 2) Objetivo

Entregar um Web App que:
- substitui **placeholders** por dados reais no Dashboard;
- lista e reproduz conteúdo do catálogo existente;
- suporta **Challenges legados** e **Jornadas** (quando disponíveis no schema atual);
- corrige o cálculo/estado do **check-in diário**;
- aproxima UI/UX do padrão do app React Native (tokens, cards, navegação e hierarquia visual).

---

## 3) Princípios e decisões

### 3.1 Sem DB changes
- Se alguma feature depender de tabelas/colunas que **não existam** no schema atual, ela deve:
  - entrar como **feature-flag** (desabilitada), ou
  - degradar graciosamente (UI mostra “indisponível” com explicação), sem quebrar o restante.

### 3.2 RLS first
- O Web App deve consumir o Supabase com **anon key** e respeitar RLS (sem service role no browser).

### 3.3 Paridade por valor
- A web não precisa copiar 100% do RN, mas deve replicar:
  - estrutura de navegação,
  - hierarquia visual,
  - padrões de card/lista/detalhe,
  - estados (loading/empty/error),
  - e o core loop (conteúdo, grupos, desafios/jornadas).

---

## 4) Escopo

### 4.1 Inclui
- Dashboard funcional com 3 widgets alimentados por dados:
  - Meus Grupos (top 3–5)
  - Desafios Ativos (top 3–5)
  - Conteúdos Recentes (top 6–10)
- Conteúdo:
  - listagem com filtros e busca
  - detalhe com player
- Desafios:
  - lista unificada de desafios (legado + jornadas)
  - detalhe do desafio
  - check-in correto (legado)
  - jornada: visão “Hoje” + “Trilha” (quando o schema de jornadas existir)
- UI parity:
  - tokens (tipografia, radius, spacing)
  - componentes-chave (Card, Button, Chip, Tab, ListItem)
  - navegação e layout (sidebar + topbar, e modo mobile web)

### 4.2 Não inclui
- Telemetria/métricas
- Notificações
- Criação/edição avançada na web (além do que já estiver funcionando sem novas permissões)
- Qualquer alteração no banco

---

## 5) Requisitos funcionais

## 5.1 Dashboard / Início (substituir “Em breve”)

### Widget A — “Meus Grupos”
**Query base (conceitual)**
- Fonte: `group_members` + `groups`
- Filtro: `group_members.user_id = auth.uid()`

**Comportamento**
- Mostrar até 5 grupos.
- Cada item:
  - nome do grupo
  - contagem de membros (se disponível sem query pesada; opcional)
  - CTA: “Abrir”
- Empty state: “Você ainda não participa de nenhum grupo” + CTA “Ver Grupos”.

### Widget B — “Desafios Ativos”
**Query base**
- Fonte: `challenge_participants` + `challenges`
- Filtro: `challenge_participants.user_id = auth.uid()`
- Ativos: por `status` (se existir) ou por janela de datas (`start_date` + `duration_days`).

**Comportamento**
- Mostrar até 5 desafios.
- Cada item:
  - título
  - “Dia X de N” (se possível calcular)
  - status do check-in hoje (ver regra 5.4)
  - CTA: “Abrir”

### Widget C — “Conteúdos Recentes”
**Query base**
- Fonte: `content_items`
- Filtro: `is_live = true` (quando existir)
- Ordenação: `created_at desc` (ou `published_at` se existir)

**Comportamento**
- Mostrar 6–10 cards.
- Card:
  - cover
  - title
  - type
  - CTA: “Ouvir/Assistir”

---

## 5.2 Menu “Conteúdo” (lista e detalhe)

### Listagem (`/app/content`)
**Requisitos**
- Buscar em `content_items` (RLS deve permitir leitura do catálogo publicado).
- Exibir apenas `is_live = true`.
- Filtros:
  - tipo (podcast|video|music)
  - busca por título (contains/ilike)

**Falhas comuns a corrigir**
- `is_live` filtrado como string ("true") em vez de boolean.
- RLS impedindo select: exibir erro específico e instrução (“Sem permissão para ler conteúdo publicado”).
- `media_url`/`cover_url` com CORS: exibir fallback e mensagem.

### Detalhe (`/app/content/[id]`)
- Render do item + player HTML5.
- “Voltar” e “Próximo” (opcional).

---

## 5.3 Menu “Desafios” — unificar Legado + Jornadas

### Lista (`/app/challenges`)
**Comportamento**
- Tabs/Segmented:
  - “Ativos”
  - “Concluídos”
- Cada item:
  - título
  - tipo: “Desafio” (legado) ou “Jornada” (se `journey_id` existir no registro)
  - “Dia X de N”
  - status do check-in hoje: “Feito hoje ✅” ou “Pendente”

### Detalhe (`/app/challenges/[id]`)
#### Legado (sem jornada)
- Título, descrição (se existir), grupo (se existir)
- Progresso (dias concluídos / duração)
- Botão check-in do dia (habilitado se ainda não feito hoje)

#### Jornada (quando suportado no schema atual)
- Tabs:
  - **Hoje**: capítulo do dia + CTA “Concluir capítulo”
  - **Trilha**: lista 1..N com estados (concluído/disponível/bloqueado)
- Leitura:
  - `journey_templates` e `journey_chapter_templates` devem existir e permitir select.
- Se tabelas/colunas de jornada não existirem:
  - Mostrar o desafio como legado e ocultar tabs de jornada.
  - Badge: “Jornadas indisponíveis na web (configuração atual)”.

---

## 5.4 Correção crítica: “check-in realizado sempre”

### Regra correta (legado e jornada)
“Check-in feito hoje” é verdadeiro **somente se** existir registro em `daily_checkins` com:
- `challenge_id = :id`
- `user_id = auth.uid()`
- `date_key = TODAY_LOCAL` (YYYY-MM-DD no fuso do usuário)

**Regras adicionais**
- Nunca inferir check-in por “existência de qualquer check-in” no desafio.
- Nunca usar `created_at >= start_of_day_utc` sem converter corretamente o timezone.
- Se `date_key` não existir no schema, usar `completed_at` com normalização local.

### Implementação recomendada (client)
1) Calcular `todayKey` com timezone do navegador.
2) Query:
   - `select 1 from daily_checkins where challenge_id = :id and user_id = :uid and date_key = :todayKey limit 1`
3) Estado:
   - se existe → “Feito hoje ✅”
   - senão → “Pendente”

### Casos-limite
- Virada do dia: ao abrir `/app`, recalcular e refazer query.
- Timezone: usar o timezone do navegador para `todayKey`.

---

## 6) UI/UX: aproximar do React Native

### 6.1 Padrões visuais
- Tokens de radius, spacing e tipografia próximos do RN.
- Cards com:
  - título forte
  - descrição curta
  - metadados (badge tipo, status)
- Botões primários/secondary consistentes.
- Empty states “humanos” (não placeholder “Em breve”).

### 6.2 Navegação
- Desktop: sidebar + topbar com labels alinhados às abas RN: Home, Groups, Content, Challenges, Church, Profile.
- Mobile web:
  - preferir bottom-nav quando largura < breakpoint (mais próximo do RN).

### 6.3 Componentes mínimos
- `AppShell`, `PageHeader`
- `Card`, `Tabs/SegmentedControl`, `Badge/Chip`
- `Skeleton`, `EmptyState`, `ErrorState`
- `MediaCard`, `ChallengeCard`

---

## 7) Critérios de aceite

### Dashboard
1) “Meus Grupos” lista grupos reais ou empty state com CTA.
2) “Desafios Ativos” lista desafios reais e mostra status do check-in do dia corretamente.
3) “Conteúdos Recentes” lista itens reais `is_live=true`.

### Conteúdo
4) Menu “Conteúdo” lista itens existentes do catálogo.
5) Detalhe abre e player executa ao menos 1 áudio e 1 vídeo reais (quando URLs forem públicas).

### Desafios / Jornadas
6) Lista “Desafios” mostra ativos/concluídos.
7) Check-in NÃO aparece como feito quando não existe `daily_checkins` no `date_key` do dia.
8) Ao realizar check-in (se permitido por RLS), o estado muda imediatamente para “Feito hoje ✅”.
9) Para desafios com `journey_id` e tabelas de jornada disponíveis: UI exibe “Hoje/Trilha” e trilha reflete capítulos concluídos.
10) Se o schema de jornada não estiver disponível: UI degrada sem quebrar o restante.

### UI parity
11) Cards, tipografia e navegação do Web App se aproximam do RN (validação visual por comparação com screenshots do app).

---

## 8) Plano de implementação

### Sprint 1 — Dados reais no Dashboard
- Implementar 3 queries e componentes de lista
- Estados loading/empty/error
- Garantir joins e filtros compatíveis com RLS

### Sprint 2 — Conteúdo
- Corrigir query `content_items` (boolean + order)
- List + detalhe + player
- Fallbacks de CORS/URLs (somente UI)

### Sprint 3 — Desafios + Check-in bugfix
- Função única `getTodayKey()` e `hasCheckinToday(challengeId)`
- Ajustar lista/detalhe para usar regra correta
- Tratamento de erro de RLS no insert

### Sprint 4 — Jornadas na Web (se suportado)
- Detecção defensiva de suporte
- Implementar “Hoje/Trilha”
- Sincronizar trilha usando check-ins existentes

### Sprint 5 — UI parity
- Consolidar tokens e componentes em `packages/ui`
- Bottom-nav no mobile web
- Ajustes finos (spacing/typography/cards)

---

## 9) Dependências e riscos

- **RLS**: se `content_items` não for legível para usuário final, o menu Conteúdo ficará vazio; a UI deve mostrar erro claro.
- **Jornadas**: se tabelas/colunas não existirem no ambiente atual, a web opera em modo legado.
- **Timezone/date_key**: principal causa provável do “check-in sempre feito” é query incorreta ou comparação errada.

---

## 10) Entregáveis

- Atualizações no `apps/web`:
  - Dashboard funcional (3 widgets)
  - Conteúdo funcional (lista + detalhe + player)
  - Desafios com check-in correto
  - Jornadas quando suportado
  - UI parity (tokens + componentes)
