# PRD — WebApp: Criação de Challenge alinhada ao App (Tipo • Presets • Grupo)

**ID:** PRD-WEB-05A  
**Relacionados:** PRD.md (Core), PRD-WEB-05 (Desafios & Check-in)  
**Status:** Draft (para implementação)  
**Data:** 2026-02-06

## 1) Contexto
Há uma inconsistência entre o **App (React Native)** e o **WebApp (Next.js)** no fluxo de criação de Challenges.

- **App**: solicita **Tipo** (Leitura/Meditação/Jejum/Comunhão) → **Título** → **Duração (presets 3/7/14/21)** → **Selecionar Grupo**.
- **WebApp atual**: solicita **Nome** → **Duração livre** → **Data de início** → **Liberação de conteúdo (Diária / Tudo aberto)**.

O PRD core do Seedfy define criação de desafios com **tipos suportados** (`reading|meditation|fasting|communion`), **duração em presets (3/7/14/21)** e **vínculo obrigatório a um grupo**. Portanto, o WebApp deve espelhar o App.

## 2) Objetivo
Unificar o “contrato” de criação de challenge entre App e Web:
- Mesmos campos e ordem de decisões;
- Mesmas validações;
- Sem alterações de banco e sem backoffice.

## 3) Não objetivos
- Não adicionar “liberação de conteúdo” no modelo (não existe no schema atual).
- Não suportar criação com duração customizada no Web (apenas presets).
- Não permitir agendamento (start_date manual) no MVP de consistência.
- Não implementar edição avançada do challenge no Web (somente criação + consumo/check-in).

## 4) Escopo (WebApp)
### 4.1 Fluxo de criação (wizard leve ou modal em passos)
**Entry points**
- Botão “Criar Challenge” em `/app/challenges`.

**Passos**
1. **Tipo**
   - Opções:  
     - Leitura Bíblica → `reading`  
     - Meditação → `meditation`  
     - Jejum → `fasting`  
     - Comunhão → `communion`
2. **Detalhes**
   - Campo: `title` (obrigatório, 3–60 chars)
   - Campo: `duration_days` (obrigatório) com presets: **3, 7, 14, 21**
3. **Grupo**
   - Select obrigatório: grupo do usuário (apenas grupos em que o usuário é membro)
4. **Confirmar**
   - Resumo: Tipo • Título • Duração • Grupo
   - CTA: “Criar”

### 4.2 Campos removidos/ocultados (para consistência)
- `start_date` (input manual) → **remover do UI**.  
  - `start_date` será setado automaticamente no momento de criação.
- “Liberação de conteúdo: Diária / Tudo aberto” → **remover do UI** (não faz parte do contrato e não existe no modelo atual).

## 5) Regras de negócio
### 5.1 Criação
Ao confirmar:
1) Criar `challenges`:
- `type` = tipo selecionado
- `title` = título informado
- `duration_days` = 3/7/14/21
- `group_id` = grupo selecionado
- `created_by` = auth user
- `status` = `active`
- `start_date` = `now()` (server time)
- `end_date` = `start_date + (duration_days - 1) dias` (opcional, ver 5.3)

2) Criar `challenge_participants` para o criador:
- (`challenge_id`, `user_id`, `status='active'`, `progress=0`)

> Observação: se hoje o mobile já cria automaticamente o participant (inscrição do criador), o Web deve replicar exatamente.

### 5.2 Validações
- Sem tipo selecionado: bloquear avanço.
- `title` vazio: bloquear.
- `duration_days` fora do conjunto {3,7,14,21}: bloquear.
- Sem grupo: bloquear.

### 5.3 start_date / end_date (decisão implementável sem DB)
**MVP recomendado:**
- `start_date`: setar automaticamente para `now()` no momento de criação.
- `end_date`: calcular e persistir (para facilitar UI/queries) **se isso já for padrão no App**.

Se preferir manter simples:
- Persistir apenas `start_date` e derivar `end_date` no client.
- Porém, como a tabela já tem `end_date`, persistir dá menos divergência.

## 6) UX / UI specs (Next.js)
### 6.1 Componentes
- `CreateChallengeButton`
- `CreateChallengeWizard` (modal ou página)
  - `StepType`
  - `StepDetails` (title + duration presets)
  - `StepGroupSelect`
  - `StepConfirm`
- `DurationPresetSelector`
  - chips/botões: 3, 7, 14, 21
- `GroupSelect`
  - lista de grupos do usuário (nome + contagem membros opcional)

### 6.2 Copy (PT-BR)
- Step 1 título: “Escolha o tipo de desafio”
- Step 2 título: “Detalhes do desafio”
- Duração label: “Duração”
- Step 3 título: “Escolha um grupo”
- Confirm: “Revisar”
- CTA: “Criar challenge”
- Erro genérico: “Não foi possível criar o challenge. Tente novamente.”

### 6.3 Loading & feedback
- Loading no CTA “Criar challenge”
- Toast de sucesso: “Challenge criado”
- Redirect: ir para `/app/challenges/[id]` (detalhe) ou voltar para lista com item no topo.

## 7) Impacto nas telas existentes
### 7.1 `/app/challenges` (lista)
- O botão “Criar challenge” abre o wizard.
- A lista continua exibindo desafios ativos/concluídos/desistidos conforme PRD-WEB-05.

### 7.2 `/app/challenges/[id]` (detalhe)
- Nada muda além do fato de que os novos challenges criados na web seguirão o mesmo contrato do mobile.

## 8) Compatibilidade com dados antigos (importante)
Se existirem challenges criados anteriormente no Web com:
- `duration_days` diferente de 3/7/14/21; ou
- `start_date` manual; ou
- qualquer “policy” não persistida no DB,

**tratamento recomendado:**
- Exibir normalmente no detalhe e na lista (o sistema já lida com qualquer `duration_days`).
- Na UI de criação, **restringir** para os presets.
- Não oferecer edição (evita inconsistência/complexidade).

## 9) Critérios de aceite (Gherkin)
### 9.1 Fluxo igual ao mobile
- Dado que estou em `/app/challenges`
- Quando clico em “Criar challenge”
- Então vejo os passos: Tipo → Detalhes (título + presets) → Grupo → Confirmar

### 9.2 Presets obrigatórios
- Dado que estou no passo de duração
- Quando tento criar com duração fora de 3/7/14/21
- Então o sistema bloqueia e não permite avançar/criar

### 9.3 Grupo obrigatório
- Dado que não selecionei grupo
- Quando tento confirmar criação
- Então o botão “Criar challenge” permanece desabilitado

### 9.4 Cria participant do criador
- Dado que criei um challenge com sucesso
- Então existe um registro em `challenge_participants` para o criador com status `active`

## 10) Checklist implementável (Next.js)
- [ ] Remover campos: start_date manual e “liberação de conteúdo”
- [ ] Implementar wizard/modal em passos
- [ ] Implementar seletor de tipo (4 opções)
- [ ] Implementar `DurationPresetSelector` (3/7/14/21)
- [ ] Implementar `GroupSelect` (somente grupos do usuário)
- [ ] Mutation: inserir em `challenges`
- [ ] Mutation: inserir em `challenge_participants` (criador)
- [ ] Atualizar listagem após criação (refetch / revalidate)
- [ ] Redirect para detalhe do challenge
- [ ] Tratar estados de erro/loading/toast

## 11) Notas de implementação (Supabase)
Tabela alvo (já existente):
- `public.challenges` (type, title, duration_days, start_date, end_date, group_id, status)
- `public.challenge_participants` (challenge_id, user_id, status)

Recomendação:
- Usar transação via RPC (se existir) para garantir atomicidade (cria challenge + participant).
- Caso não exista RPC, executar duas operações sequenciais e tratar rollback lógico (se participant falhar, deletar challenge recém-criado) — apenas se necessário.

---
