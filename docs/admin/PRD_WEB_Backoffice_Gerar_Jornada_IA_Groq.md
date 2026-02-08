# PRD — Backoffice: Gerar Jornada com IA (Groq LLM)

**Produto:** Seedfy Web Backoffice (Next.js)  
**Feature:** Geração dinâmica de *Journey Template* + *Journey Chapter Templates* via LLM (Groq)  
**Status:** Proposto  
**Autor:** (auto)  
**Data:** 2026-02-07  
**Versão:** 1.0

---

## 1. Visão geral

O backoffice do Seedfy permite criar e gerenciar **Jornadas** (journey templates) compostas por **capítulos diários** (journey chapter templates), seguindo o padrão de conteúdo devocional (ex.: “Jornada da Gratidão” do seed).

Esta feature adiciona um fluxo **“Gerar com IA”** usando um LLM (Groq) para **gerar automaticamente uma nova Jornada completa** (metadata + capítulos por dia), a partir de um **briefing editorial**. O resultado será **um rascunho revisável**, com **preview** e **validações**, antes de permitir **ativação/publicação** (`is_active=true`).

---

## 2. Problema / oportunidade

### 2.1 Problema
Criar Jornadas manualmente é um trabalho editorial repetitivo:
- Exige criação de título, descrições, tags, capa
- Exige criação de N capítulos (7/14/21), cada um com narrativa, prática, pergunta, oração, versículo
- Aumenta tempo e custo de produção de conteúdo

### 2.2 Oportunidade
Automatizar a primeira versão com IA:
- Reduz tempo de criação
- Aumenta volume de Jornadas disponíveis
- Mantém qualidade via revisão humana (*human-in-the-loop*)
- Mantém consistência de estrutura com o app

---

## 3. Objetivos e não-objetivos

### 3.1 Objetivos
1) Permitir que um admin/editor gere uma **Jornada completa** (template + capítulos) a partir de um briefing.  
2) Garantir **consistência estrutural** com o modelo Seed atual (campos e padrão editorial).  
3) Fornecer um fluxo de **revisão + edição** antes de salvar/ativar.  
4) Permitir **regeneração** parcial (capítulo específico) e total.  
5) Garantir **segurança editorial** mínima (filtros e validações) para impedir publicação de conteúdo inadequado.

### 3.2 Não-objetivos (fora do escopo inicial)
- Tradução automática multi-idioma (ficar em `pt-BR` no MVP)
- “Autopublicação” sem revisão humana
- Geração de mídia (imagem/áudio/vídeo) por IA (apenas sugestão de query para capa)
- Telemetria avançada (métricas detalhadas; pode ser etapa posterior)
- Personalização por igreja/denominação (MVP deve ser neutro e amplamente aplicável)

---

## 4. Stakeholders

- **Admin/Editor de Conteúdo**: cria/revisa Jornadas
- **Equipe Produto**: define padrões e curadoria
- **Equipe Engenharia**: Next.js + Supabase + integração Groq
- **Usuário final (mobile/webapp)**: consome Jornadas geradas

---

## 5. Personas & permissões

### 5.1 Personas
- **Editor**: cria e edita conteúdo; pode gerar com IA; salva rascunho; publica se permitido.
- **Admin**: tudo do Editor + gerencia configurações e limites.

### 5.2 Permissões (MVP)
- Apenas usuários com role `admin` ou `editor` no backoffice podem acessar “Gerar com IA”.
- “Salvar e ativar” (publicar) pode ser restrito a `admin` (recomendado) ou permitido a `editor` dependendo do seu RBAC atual.

---

## 6. Glossário

- **Jornada**: `journey_templates` (template reutilizável)
- **Capítulo de Jornada**: `journey_chapter_templates` (conteúdo diário)
- **Duração suportada**: array de dias suportados no template (ex.: `[7,14,21]`)
- **Ativo**: `is_active=true` indica disponível para usuários
- **Rascunho**: `is_active=false`

---

## 7. Requisitos funcionais (FR)

### FR-01 — Acesso ao fluxo “Gerar com IA”
- Na listagem de Jornadas, existir CTA: **“Gerar com IA”**
- Alternativa: dentro de “Criar Jornada” → “Gerar com IA”
- Ao clicar, abrir **Wizard** de geração

### FR-02 — Wizard de geração em 3 etapas
O fluxo terá 3 etapas:

#### Etapa A — Briefing
Campos obrigatórios:
- **Tema/Assunto** (texto livre, 3–120 chars)
- **Duração base** (select): 7 / 14 / 21  
  - No MVP, a geração cria capítulos até a maior duração selecionada
- **Tom** (select): Acolhedor / Direto / Contemplativo / Didático (default: Acolhedor)
- **Objetivo espiritual** (multi-select opcional): Crescimento, Cura, Disciplina, Identidade, Comunidade, Oração, Bíblia, Serviço
- **Público-alvo** (select opcional): Geral / Novos convertidos / Jovens / Líderes / Casais / Mulheres / Homens

Campos opcionais:
- **Referência bíblica** (texto livre): ex. “Salmos”, “Evangelhos”, “Cartas Paulinas”
- **Restrições editoriais** (checkboxes):
  - Evitar linguagem denominacional (default ON)
  - Evitar termos sensíveis/polêmicos (default ON)
- **Incluir oração** (toggle default ON)
- **Incluir versículos** (toggle default ON)
- **Tags sugeridas** (chips editáveis, 0..6)
- **Durações suportadas** (multi-select): por padrão `[7,14,21]` (editável)
- **Idioma**: fixo `pt-BR` (MVP)

CTA:
- “Gerar Jornada” (primary)
- “Cancelar” (secondary)

#### Etapa B — Geração
- Mostrar estado de loading e progresso.
- Exibir logs amigáveis:
  - “Gerando estrutura…”
  - “Gerando capítulos…”
  - “Validando consistência…”
- Suportar cancelamento (client-side) se possível.

#### Etapa C — Revisão e edição
- Mostrar preview da Jornada:
  - `title`
  - `description_short`
  - `description_long`
  - `tags`
  - `durations_supported`
  - `cover_image_url` ou `cover_image_query` (ver seção capa)
- Mostrar lista de capítulos (Dia 1..N):
  - Expand/collapse por dia
  - Editor inline para cada campo do capítulo
- Ações por capítulo:
  - “Regenerar capítulo” (gera novo conteúdo apenas para o dia X)
  - “Restaurar versão original” (se o usuário editou)
- Ações globais:
  - “Regenerar todos” (gera novamente toda a Jornada)
  - “Ajustar tom” (dropdown: mais curto / mais profundo / mais prático)
- CTAs finais:
  - **Salvar como rascunho** (`is_active=false`)
  - **Salvar e ativar** (`is_active=true`) — somente se validações passarem
  - “Voltar” (para editar briefing)
  - “Cancelar”

### FR-03 — Persistência no banco (create/update)
Ao salvar:
1) Criar/atualizar `journey_templates`
2) Upsert de `journey_chapter_templates` para (journey_id, day_index)

O backoffice deve permitir:
- Criar uma nova Jornada gerada
- Atualizar uma Jornada gerada (ex.: gerar novamente e substituir capítulos)

### FR-04 — Regeneração parcial (capítulo)
- O usuário escolhe o dia X e clica “Regenerar capítulo”
- O sistema chama o endpoint de geração com:
  - briefing original + ajustes + contexto do dia
  - opcionalmente inclui o texto atual para “revisar” e reescrever
- Substitui apenas aquele capítulo no preview

### FR-05 — Validações obrigatórias antes de ativar
Bloquear “Salvar e ativar” se:
- Jornada sem `title`, `description_short`, `description_long`
- `durations_supported` vazio
- Se o maior valor em `durations_supported` for N, então devem existir capítulos **1..N**
- Capítulos com campos obrigatórios vazios:
  - `title`, `focus`, `narrative`, `practice`, `reflection_prompt`
- Se “Incluir oração” ON → `prayer` obrigatório
- Se “Incluir versículos” ON → `verse_reference` e `verse_text` obrigatórios
- Capítulos duplicados por `day_index`
- Textos muito curtos abaixo do mínimo (configurável; recomendado):
  - `narrative` >= 300 chars
  - `practice` >= 20 chars
  - `reflection_prompt` >= 20 chars

### FR-06 — Guardrails editoriais (segurança)
- A resposta do LLM deve incluir `risk_flags`.
- Se `risk_flags` contiver algo diferente de `none`:
  - Exigir salvar como rascunho
  - Exibir alerta “Revisão necessária”
- Conteúdos proibidos para publicação:
  - Incentivo a autoagressão
  - Discurso de ódio/ataques
  - Conteúdo sexual explícito
  - Recomendações médicas/psicológicas prescritivas
- MVP: fazer a checagem com:
  - heurística simples (palavras-chave) + risk_flags do modelo  
  - (opcional futuro) segunda chamada de “moderation/classifier”

### FR-07 — Capa (cover image)
MVP aceita 2 modos:
1) **Manual**: editor insere `cover_image_url` (padrão atual)
2) **Sugestão por IA**:
   - LLM retorna `cover_image_query` (ex.: “hands praying sunrise”)
   - O backoffice mostra a query e opcionalmente permite colar uma URL
   - (Futuro) buscar imagens automaticamente

### FR-08 — Controle de custo e abuso
- Rate limit por usuário: ex. 20 gerações/dia (config via env)
- Cooldown por ação: ex. 10s entre “Regenerar todos”
- O endpoint deve rejeitar requests acima do limite com mensagem amigável.

### FR-09 — Auditoria mínima (MVP)
Salvar no banco (ou logs server) ao menos:
- `created_by`, `updated_by`
- timestamp da geração
- briefing usado (pode ser JSON em coluna de metadata ou tabela de logs)
- id do modelo usado (ex.: `groq:llama-3.1-70b`)

---

## 8. Requisitos não-funcionais (NFR)

- **NFR-01 Segurança de credenciais:** API key Groq somente no servidor (env), nunca no client.
- **NFR-02 Resiliência:** tratar timeouts; oferecer retry; não perder edição local do usuário.
- **NFR-03 Performance:** geração de 21 dias pode demorar; UX deve indicar progresso.
- **NFR-04 Confiabilidade:** validação estrita do JSON de saída; não aceitar texto fora do schema.
- **NFR-05 Observabilidade (mínima):** log de erros e latência do endpoint.
- **NFR-06 Compatibilidade:** Next.js App Router + Supabase (conforme stack do projeto).

---

## 9. Modelo de dados

### 9.1 Tabelas existentes (referência)
- `public.journey_templates`
- `public.journey_chapter_templates`

Campos relevantes (conforme seed):
- `journey_templates`: `id, title, description_short, description_long, cover_image_url, tags (json), durations_supported (int[]), is_active`
- `journey_chapter_templates`: `journey_id, day_index, title, focus, narrative, practice, reflection_prompt, prayer, verse_reference, verse_text, media_type`

### 9.2 Propostas de extensão (opcionais, MVP+)
**A) Metadata no template**
- `ai_metadata jsonb`:
  - `{ provider: "groq", model: "...", prompt_version: "1.0", briefing: {...}, generated_at: "...", risk_flags: [...] }`

**B) Tabela de logs de geração**
- `journey_ai_generations`:
  - `id, journey_id nullable, user_id, provider, model, briefing_json, output_json, created_at, status, error`

> MVP pode começar com `ai_metadata` no template para reduzir esforço.

---

## 10. API / Integração Groq

### 10.1 Endpoints (server-only)
1) `POST /api/admin/journeys/ai-generate`
   - gera jornada completa (N dias)

2) `POST /api/admin/journeys/ai-regenerate-day`
   - gera apenas um dia X

3) (opcional) `POST /api/admin/journeys/ai-rewrite-field`
   - reescreve apenas um campo (ex.: practice do dia 3)

### 10.2 Request (ai-generate)
```json
{
  "briefing": {
    "theme": "Ansiedade",
    "goal": ["Cura", "Oração"],
    "tone": "Acolhedor",
    "audience": "Geral",
    "language": "pt-BR",
    "avoid_denomination": true,
    "avoid_polemics": true,
    "include_prayer": true,
    "include_verses": true,
    "tags_suggested": ["Paz", "Fé"],
    "durations_supported": [7,14,21],
    "max_days": 21,
    "reference_bible": "Salmos e Evangelhos"
  },
  "prompt_version": "1.0"
}
```

### 10.3 Response (JourneyAIOutput — JSON estrito)
```json
{
  "journey": {
    "title": "string",
    "description_short": "string",
    "description_long": "string",
    "cover_image_query": "string",
    "cover_image_url": null,
    "tags": ["string"],
    "durations_supported": [7,14,21],
    "language": "pt-BR"
  },
  "chapters": [
    {
      "day_index": 1,
      "title": "string",
      "focus": "string",
      "narrative": "string",
      "practice": "string",
      "reflection_prompt": "string",
      "prayer": "string|null",
      "verse_reference": "string|null",
      "verse_text": "string|null",
      "media_type": null
    }
  ],
  "safety": {
    "notes": "string",
    "risk_flags": ["none"]
  }
}
```

### 10.4 Regras de validação do JSON
- Parse JSON (sem markdown)
- Validar com Zod (ou equivalente)
- Rejeitar caso:
  - Não seja JSON válido
  - Campos faltando
  - `chapters.length < max_days`
  - `day_index` fora de 1..max_days

---

## 11. Prompting (detalhado)

### 11.1 Estratégia
- Usar “Seed Journey” como referência implícita de estrutura editorial:
  - Cada dia contém: **título**, **foco**, **narrativa**, **prática**, **pergunta**, **oração**, **versículo**
- Forçar retorno em JSON estrito
- Instruir a evitar:
  - polêmica denominacional
  - afirmações médicas
  - linguagem de julgamento/ataque

### 11.2 System Prompt (template)
> **IMPORTANTE:** Este texto é um template; a implementação deve manter a instrução “retorne apenas JSON válido”.

**System:**
- Você é um editor cristão devocional em português (pt-BR).
- Você escreve conteúdo pastoral com tom {tone} e linguagem acessível.
- Gere uma jornada diária com capítulos do dia 1 ao dia {max_days}.
- Cada capítulo deve conter narrativa, prática, pergunta, oração (se habilitado) e versículo (se habilitado).
- Evite linguagem denominacional e polêmica; não critique igrejas, grupos ou pessoas.
- Não faça aconselhamento médico/psicológico prescritivo; no máximo encoraje procurar ajuda profissional quando aplicável.
- Retorne **apenas** um JSON válido no schema fornecido. Sem markdown. Sem texto extra.

### 11.3 User Prompt (template)
- Incluir briefing do wizard.
- Incluir constraints:
  - limites de tamanho por campo
  - evitar repetição de versículos
  - progressão temática dia a dia

**User:**
- Tema: {theme}
- Objetivos: {goal}
- Público: {audience}
- Tom: {tone}
- Restrições:
  - Evitar denominacionalismo: {avoid_denomination}
  - Evitar polêmicas: {avoid_polemics}
- Incluir oração: {include_prayer}
- Incluir versículos: {include_verses}
- Referências bíblicas preferidas: {reference_bible}
- Durações suportadas: {durations_supported}
- Gerar até {max_days} dias
- Tags sugeridas: {tags_suggested}

- **Regras editoriais por capítulo:**
  - `title`: curto e memorável
  - `focus`: 1 linha
  - `narrative`: 700–1200 caracteres (1–2 parágrafos)
  - `practice`: 1 ação concreta e simples
  - `reflection_prompt`: 1 pergunta aberta
  - `prayer`: 1 parágrafo curto (se habilitado)
  - `verse_reference` e `verse_text`: 1 versículo (se habilitado)

- **Output**: retorne JSON no schema.

### 11.4 Regeneração de capítulo (template)
Incluir contexto:
- Dia X
- Resumo do plano do dia anterior/posterior (opcional)
- Texto atual (se existir) e instrução do que melhorar: “mais prático”, “menos longo”, etc.

---

## 12. UX / UI (especificação)

### 12.1 Localização do CTA
- Página: **Backoffice → Jornadas**
- Header actions:
  - “Criar Jornada”
  - “Gerar com IA” (novo)

### 12.2 Wizard — Etapa A (Briefing)
Componentes:
- Input “Tema/Assunto”
- Select “Tom”
- Multi-select “Objetivos”
- Select “Público”
- Multi-select “Durações suportadas” (default 7/14/21)
- Toggle “Incluir oração”
- Toggle “Incluir versículos”
- Checkboxes restrições editoriais
- Chips “Tags sugeridas”
- (Opcional) Campo “Referências bíblicas preferidas”
- CTA primary “Gerar Jornada”

Erros inline:
- Tema vazio
- durations_supported vazio
- max_days = max(durations_supported)

### 12.3 Wizard — Etapa B (Geração)
- Stepper com status
- Spinner e texto
- Exibir mensagens de erro amigáveis (timeout, rate limit, parse error)

### 12.4 Wizard — Etapa C (Revisão)
Layout sugerido:
- Coluna esquerda: “Detalhes da Jornada”
- Coluna direita: “Capítulos”
- Capítulos em acordeão (Dia 1..N)
- Dentro do capítulo:
  - inputs textarea para narrative/prayer/verse_text
  - inputs text para title/focus/verse_reference
  - CTA “Regenerar capítulo”
  - CTA “Restaurar original”
- Ações no topo:
  - “Regenerar todos”
  - “Ajustar tom”
- Rodapé:
  - “Salvar como rascunho”
  - “Salvar e ativar”
  - “Voltar”
  - “Cancelar”

### 12.5 Estados especiais
- **Conteúdo inválido:** destacar campo com erro + tooltip.
- **Risk flag:** banner amarelo/vermelho com explicação e bloqueio de publish.
- **Não perder alterações locais:** regenerar não deve apagar edições em outros dias.

---

## 13. Regras de negócio

1) **Capítulos obrigatórios até max_days**
- Se durations_supported contém 21 → precisa dias 1..21

2) **Salvar vs Ativar**
- “Salvar como rascunho”: permite mesmo com warnings (exceto JSON inválido/estrutura incompleta)
- “Salvar e ativar”: exige validação total e risk_flags = ["none"]

3) **Upsert**
- Se salvar uma Jornada existente:
  - Atualizar metadata
  - Upsert capítulos; remover capítulos além do novo max_days?  
    - Regra MVP: **não remover automaticamente**; apenas atualiza 1..N e mantém extras se existirem.
    - Regra recomendada: perguntar “Deseja remover dias acima de N?” (pode ser V2)

4) **Tags**
- No banco, manter formato compatível com o atual (`json` de strings)

---

## 14. Edge cases & tratamento de erros

### 14.1 JSON malformado
- Rejeitar resposta
- Oferecer “Tentar novamente”
- Log de erro com payload truncado

### 14.2 Conteúdo incompleto
- Ex.: faltam dias 19..21
- Mostrar erro “A IA não gerou todos os dias. Tente novamente.”
- Permitir “Regenerar faltantes” (V2) — no MVP, “Regenerar todos”

### 14.3 Rate limit excedido
- Mensagem: “Limite diário atingido. Tente novamente amanhã ou solicite aumento ao admin.”

### 14.4 Timeout do provedor
- Retry manual
- (Opcional) re-tentativa automática 1x no servidor

### 14.5 Campos muito longos
- Truncar? **Não recomendado**
- Melhor: validar e pedir regeneração com instrução de tamanho

---

## 15. Critérios de aceite (AC)

### AC-01 Fluxo completo
- Dado um usuário `admin/editor`
- Quando abre “Gerar com IA”, preenche briefing e gera
- Então vê preview completo com N capítulos e consegue editar e salvar rascunho

### AC-02 Validação de ativação
- Dado uma Jornada gerada
- Quando tenta “Salvar e ativar” com capítulo faltando
- Então o sistema bloqueia e mostra mensagem clara

### AC-03 Regeneração por capítulo
- Dado a Jornada no passo de revisão
- Quando clica “Regenerar capítulo Dia 3”
- Então apenas o dia 3 é substituído e os demais permanecem iguais

### AC-04 Segurança
- Dado `risk_flags != ["none"]`
- Quando tenta publicar
- Então “Salvar e ativar” fica desabilitado e existe alerta

### AC-05 Persistência
- Após salvar, a Jornada aparece na listagem e os capítulos estão persistidos corretamente no DB

---

## 16. Plano de implementação (engenharia)

### 16.1 Backend (Next.js Route Handler)
- Implementar `/api/admin/journeys/ai-generate`:
  - autenticação + autorização
  - rate limiting
  - chamada ao Groq (server-only)
  - validação Zod do output
  - retornar JSON validado

- Implementar `/api/admin/journeys/ai-regenerate-day`:
  - semelhante, mas retorna apenas 1 capítulo e/ou Journey metadata (opcional)

### 16.2 Frontend
- Wizard UI + estado de geração
- Editor inline + acordeão
- Integração com “Salvar” (upsert via supabase)
- Validação client-side espelhando server-side

### 16.3 Banco / Supabase
- Reutilizar tabelas existentes
- (Opcional) adicionar coluna `ai_metadata jsonb` em `journey_templates`

---

## 17. Testes

### 17.1 Unit
- Validador Zod do schema
- Função de normalização de tags/durations
- Regras: max_days, dias obrigatórios, oração/versículos condicionais

### 17.2 Integração
- Simular resposta do LLM e persistência no Supabase
- Regeneração de capítulo
- Erros: timeout, rate limit, JSON inválido

### 17.3 E2E (Playwright)
- Wizard completo
- Publicação bloqueada por validação
- Salvar rascunho bem-sucedido

---

## 18. Riscos e mitigação

- **Risco:** Conteúdo inadequado passar despercebido  
  **Mitigação:** publish bloqueado sem revisão; risk_flags + heurísticas; rascunho por padrão.

- **Risco:** Respostas inconsistentes do modelo (JSON quebrado)  
  **Mitigação:** prompt estrito + validação + retry.

- **Risco:** Custo elevado por regenerações  
  **Mitigação:** rate limit, cooldown, logs e controle.

---

## 19. Dependências

- Chave/conta Groq configurada em env
- RBAC existente para admin/editor
- Tabelas `journey_templates` e `journey_chapter_templates` já existentes

---

## 20. Anexos

### Anexo A — Campos do capítulo (referência do seed)
- `title`
- `focus`
- `narrative`
- `practice`
- `reflection_prompt`
- `prayer`
- `verse_reference`
- `verse_text`
- `media_type` (null no MVP)

### Anexo B — Exemplo de briefing (Ansiedade)
- Tema: “Ansiedade”
- Objetivos: “Paz”, “Oração”
- Tom: Acolhedor
- Durações: [7,14,21]
- Incluir versículos e oração: ON
- Restrições: evitar polêmica/denominação ON
