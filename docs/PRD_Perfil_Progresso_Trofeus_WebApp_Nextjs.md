# PRD — WebApp (Next.js) — Perfil: Consistência e Troféus

**Base:** PRD geral “Perfil: Consistência e Troféus” (sem DB/backoffice)  
**Plataforma:** WebApp (Next.js)

## 1. Objetivo no Web
Adicionar ao Perfil do usuário:
- Card “Consistência”
- Seção “Troféus” com preview + página de lista e detalhe

## 2. Escopo (Web)
### Inclui
- Componentes no Perfil
- Data fetching via Supabase (server actions / route handlers / client query)
- Página “/profile/trophies”
- Página “/profile/trophies/[challengeId]” (ou modal)

### Exclui
- Badges
- Backoffice
- Mudanças de banco

## 3. Rotas
- `/profile` — Perfil
- `/profile/trophies` — Lista completa
- `/profile/trophies/[challengeId]` — Detalhe

## 4. Componentes (Web)
### 4.1. `ConsistencyCard`
- 3 KPIs
- Skeleton no carregamento

### 4.2. `TrophiesPreview`
- Grid 2–3 colunas (responsivo)
- Botão “Ver todos” (link)
- Cards clicáveis

### 4.3. `TrophyDetail`
- Layout em 2 colunas (desktop) / 1 coluna (mobile)
- Seção check-ins (lista de datas) opcional

## 5. Estratégia de data fetching
Recomendação (Next.js App Router):
- Buscar `ProfileProgressDTO` em **server component** (quando possível) para reduzir roundtrips
- Revalidar (cache) por 60–300s, dependendo do padrão do app
- Para detalhe, buscar server-side também

### 5.1. Funções (server) sugeridas
- `getProfileProgress(userId): ProfileProgressDTO`
  - chama queries de active days, distinct dates, completed challenges
  - calcula streak server-side (Node) usando o mesmo algoritmo do RN (portado)

> Importante: manter consistência com o RN. Ideal: colocar a lógica de streak em pacote compartilhado (monorepo), senão replicar fielmente.

## 6. Queries (Supabase)
Mesmas do PRD geral. Implementar via `supabase-js`:
- distinct `date_key` desc
- joins entre `challenge_participants` e `challenges`
- fallback com group/having (se necessário)

## 7. UX e estados
- Sem check-ins: CTA para começar desafio (link para página de desafios)
- Sem troféus: empty state com CTA

## 8. Segurança
- Páginas exigem auth
- Consultas sempre filtradas por `user_id = auth.uid()`
- Validar no server: não permitir acessar `challengeId` de outro usuário no detalhe

## 9. Critérios de aceite (Web)
1) `/profile` mostra card Consistência e preview de troféus coerentes com o mobile.
2) `/profile/trophies` lista completa paginada.
3) `/profile/trophies/[id]` mostra detalhe somente se o usuário tiver concluído/participado.
4) Datas exibidas no fuso do usuário.

## 10. Checklist implementável (Next.js)
- [ ] Criar `lib/profileProgress.ts` (server functions)
- [ ] Criar `lib/streakCalculator.ts` (ou pacote compartilhado)
- [ ] Criar componentes `ConsistencyCard`, `TrophiesPreview`, `TrophyCard`
- [ ] Implementar rota `/profile/trophies`
- [ ] Implementar rota `/profile/trophies/[challengeId]`
- [ ] Adicionar empty states e skeletons
- [ ] Testar com usuários: 0 check-ins, streak 0, streak > 0, concluídos 0, concluídos > 0
