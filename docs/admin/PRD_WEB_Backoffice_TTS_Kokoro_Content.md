# PRD — Backoffice: Gerar Áudio (MP3/Podcast) via Kokoro-TTS (FastAPI) antes de submeter Content

**Produto:** Seedfy Web Backoffice (Next.js)  
**Módulo:** Content Library (`content_items`)  
**Feature:** “Criar áudio por texto (TTS)” com **Kokoro-TTS FastAPI** (VPS)  
**Status:** Proposto  
**Data:** 2026-02-07  
**Versão:** 1.0

---

## 1) Visão geral

Hoje o backoffice permite criar itens de conteúdo (`content_items`) do tipo **podcast / video / music**, com upload de capa e mídia (Supabase Storage) e gravação da URL em `media_url`.

Esta feature adiciona, na tela de **Criar/Editar Content**, uma opção para **gerar um MP3 a partir de texto** usando sua instância **Kokoro-TTS FastAPI** (OpenAI-compatible Speech API) e **só depois** (após preview e aceite do usuário) **submeter o MP3 final** dentro da estrutura já existente (`media_url` + storage).

> Objetivo prático: o editor não precisa gerar áudio fora do Seedfy — ele escreve o roteiro/texto no backoffice, gera, escuta, ajusta e publica.

---

## 2) Contexto técnico (referência do provedor)

- **Kokoro-TTS FastAPI** expõe endpoint OpenAI-compatible:
  - `POST /v1/audio/speech` (gera áudio a partir de texto; suporta `mp3`, `wav`, etc.)
  - `GET /v1/audio/voices` (lista vozes disponíveis)
  - Parâmetros relevantes: `model`, `input`, `voice`, `response_format`, `speed`, `stream` (etc.)
- Documentação fornecida:
  - Swagger: `https://kokoro.producta.cloud/docs`
  - Resumo (Context7) incluído na conversa (OpenAI-compatible)

---

## 3) Problema / oportunidade

### 3.1 Problema
Para submeter **podcast/música** hoje, o editor precisa:
- criar o áudio em outra ferramenta,
- fazer upload do mp3,
- iterar fora do backoffice.

### 3.2 Oportunidade
Criar um fluxo nativo:
- Geração de áudio a partir do texto dentro do backoffice
- Preview e ajustes rápidos
- Publicação somente após aceite
- Consistência de storage e campos (`media_url`) sem rework no app player

---

## 4) Objetivos e não-objetivos

### 4.1 Objetivos
1) Permitir gerar **MP3** (e opcionalmente WAV/OPUS) a partir de texto dentro do fluxo de Content.  
2) Fazer **preview** do áudio gerado no próprio backoffice antes de publicar.  
3) Somente após “Aceitar”, salvar o MP3 no **local definitivo** e preencher `media_url`.  
4) Suportar seleção de **voice** e **speed** (MVP).  
5) Garantir segurança: key do Kokoro só no servidor, rate limit e limites de texto.

### 4.2 Não-objetivos (fora do MVP)
- Edição de áudio (corte, normalização avançada, trilha de fundo)
- Geração multi-locutor / mix de vozes (pode ser V2)
- Timestamps/captions (V2)
- Geração de vídeo (TTS + render) (V2)
- Pipeline automático de “roteiro via LLM” (pode ser feature futura)

---

## 5) Stakeholders

- **Editor/Admin**: cria conteúdo e publica
- **Engenharia**: Next.js + Supabase + integração com VPS
- **Infra**: VPS Kokoro e estabilidade/limites

---

## 6) Personas & permissões

- Apenas `admin/editor` podem usar “Gerar áudio (TTS)”.
- Publicação (`is_live=true`) segue regra atual do backoffice (se houver restrição por role).

---

## 7) Escopo do MVP

### 7.1 Tipos de conteúdo
- MVP habilitado para `type in ('podcast','music')`
- Para `video`: deixar desabilitado ou permitir apenas upload manual (decisão recomendada: desabilitar TTS no vídeo no MVP).

### 7.2 Formatos de saída
- Default: `mp3`
- Opcional: `wav`, `opus` (config/feature flag)
- No MVP, **persistir mp3** como padrão (melhor compatibilidade).

---

## 8) UX / UI — Especificação detalhada

### 8.1 Local: Create/Edit de Content Item
Tela atual (existente):
- Campos: `type`, `title`, `description`, `cover_url`/upload, `media_url`/upload, `is_live`

**Novo bloco:** `Mídia (Áudio)`
- Tabs:
  1) **Upload MP3 (existente)**  
  2) **Criar por texto (TTS)** (novo)

### 8.2 Tab “Criar por texto (TTS)”
Componentes:

**(A) Configuração**
- Dropdown **Voz (voice)**  
  - Carrega via `GET /v1/audio/voices`
  - Exibe lista (ex.: `af_bella`, `af_sky`, etc.)
  - Fallback: campo manual se endpoint falhar
- Slider **Velocidade (speed)**  
  - Range recomendado: `0.8` → `1.2` (default 1.0)
  - (Opcional avançado) permitir 0.5–1.5 com aviso
- Select **Formato** (default `mp3`)  
  - `mp3` (default)
  - `wav` (opcional)
  - `opus` (opcional)

**(B) Texto**
- Textarea **Texto / Roteiro** (obrigatório)
  - Contador de caracteres
  - Limite MVP: **até 6.000 caracteres** (ajustável via env)
  - Aviso quando muito grande: sugerir dividir em partes (V2 pode chunkear automaticamente)

**(C) Ações**
- Botão primary: **Gerar áudio**
- Estado: loading + “Gerando…”
- Mensagens de erro amigáveis (timeout, rate limit, input inválido)

**(D) Preview**
Após gerar:
- Player de áudio (HTML5) com:
  - play/pause, tempo, duração
- Mostra:
  - voz usada
  - speed
  - formato
  - tamanho do arquivo
- Botões:
  - **Aceitar e usar este áudio** (primary)
  - **Gerar novamente** (secondary)
  - **Descartar** (desfaz e remove temp, se possível)

### 8.3 Comportamento “Aceitar”
Ao clicar **Aceitar**:
- O backoffice move/copia o arquivo de **temp storage** para o **path definitivo**
- Preenche `media_url` no form (como se fosse upload normal)
- Se o usuário salvar o content item:
  - `media_url` é persistido em `content_items`

> Importante: “Aceitar” NÃO publica automaticamente (não muda `is_live`). Apenas define o arquivo final.

### 8.4 Estado do form
- Se o usuário navegar para fora sem salvar:
  - Aviso “Você tem um áudio gerado não salvo. Deseja descartar?”
- Se tiver áudio aceito:
  - O tab de upload deve mostrar que há um `media_url` definido (fonte: TTS)

---

## 9) Fluxos (end-to-end)

### 9.1 Fluxo principal (MVP)
1) Editor abre **Criar Content**
2) Seleciona `type = podcast` (ou music)
3) Vai em **Criar por texto (TTS)**
4) Escolhe voice, speed, cola texto, clica **Gerar**
5) Sistema chama **server route** → Kokoro → recebe bytes MP3
6) Sistema salva bytes em **Storage TEMP** e retorna URL de preview
7) Editor escuta preview
8) Editor clica **Aceitar**
9) Sistema promove o arquivo para **Storage FINAL** e define `media_url`
10) Editor salva o content item

### 9.2 Fluxo de iteração
- Editor gera → preview → altera texto/voice/speed → gerar novamente → preview → aceitar

### 9.3 Fluxo de falha
- Erro no Kokoro (timeout, 500):
  - Exibir erro + botão “Tentar novamente”
- Falha na lista de voices:
  - Mostrar input manual com placeholder e hint “ex.: af_bella”

---

## 10) Requisitos funcionais (FR)

### FR-01 — Carregar vozes
- Ao abrir tab TTS, chamar `GET {KOKORO_BASE_URL}/v1/audio/voices`
- Exibir lista ordenada
- Cache: 10 min (server) para reduzir chamadas

### FR-02 — Gerar áudio via servidor
- Ao clicar “Gerar”, enviar para `POST /api/admin/content/tts/generate`
- O servidor chama `POST {KOKORO_BASE_URL}/v1/audio/speech` com:
  - `model`: `"kokoro"` (ou `"tts-1"` compatível; fixo no MVP)
  - `input`: texto
  - `voice`: selecionada
  - `response_format`: `"mp3"`
  - `speed`: float
  - `stream`: false (MVP)
- Retorna para o client:
  - `temp_audio_url` (signed URL do storage)
  - `temp_storage_path`
  - `meta` (voice, speed, format, bytes)

### FR-03 — Preview
- Player deve tocar via URL do temp storage
- Não deve depender de baixar localmente

### FR-04 — Aceitar e promover para final
- Ao clicar “Aceitar”:
  - chamar `POST /api/admin/content/tts/accept`
  - servidor copia/move do temp path → final path e retorna `final_media_url`
  - client seta `media_url=final_media_url`

### FR-05 — Descartar
- “Descartar” remove referência local
- (Opcional) chama endpoint `DELETE /api/admin/content/tts/temp` para remover do storage

### FR-06 — Limites e rate limit
- Limite de tamanho do texto (MVP): 6.000 chars
- Rate limit por usuário:
  - ex.: 30 gerações/dia
  - cooldown 5–10s por request
- Erros de limite devem ser claros no UI

### FR-07 — Compatibilidade com fluxo existente
- O Content Item continua sendo salvo do mesmo jeito:
  - `media_url` aponta para storage final
  - player de preview existente funciona com `media_url`

---

## 11) Requisitos não-funcionais (NFR)

- **NFR-01 Segurança:** API key/secret do Kokoro fica no servidor (env), nunca no client.
- **NFR-02 Observabilidade:** logar latência, status, tamanho do áudio, voice, user_id.
- **NFR-03 Resiliência:** retries controlados (no máximo 1 retry server-side em erros transitórios).
- **NFR-04 Performance:** UI deve indicar progresso; geração pode demorar.
- **NFR-05 Custos:** limitar abuso e evitar gerar arquivos gigantes.
- **NFR-06 Privacidade:** texto enviado ao Kokoro deve ser tratado como conteúdo interno/editorial.

---

## 12) Arquitetura técnica (proposta)

### 12.1 Server routes (Next.js)
1) `GET /api/admin/content/tts/voices`
   - Proxy/cache do endpoint Kokoro voices

2) `POST /api/admin/content/tts/generate`
   - valida auth/role + rate limit
   - valida input (tamanho, chars)
   - chama Kokoro `/v1/audio/speech`
   - recebe bytes
   - salva no Supabase Storage TEMP
   - retorna signed URL + metadata

3) `POST /api/admin/content/tts/accept`
   - copia/move TEMP → FINAL
   - retorna final URL (ou signed/public, conforme padrão atual)

4) (Opcional) `DELETE /api/admin/content/tts/temp`
   - remove arquivo temp (melhor housekeeping)

### 12.2 Storage
- Bucket existente (ex.: `media`) — seguir padrão atual.
- Paths sugeridos:

**Temp:**
- `content/temp/tts/{user_id}/{uuid}.mp3`

**Final:**
- `content/{type}/{content_id or uuid}/media.mp3`

> Se `content_id` ainda não existe (criação antes de salvar), usar `uuid` e, ao salvar o content item, manter o path. Evitar renomear depois.

### 12.3 Banco (MVP sem mudanças)
- Persistir somente em `content_items.media_url`
- **Sem** adicionar colunas novas no MVP

**Opcional V2 (recomendado):** `tts_metadata jsonb` em `content_items`
- `{ provider:"kokoro", voice:"af_bella", speed:1.0, format:"mp3", generated_at:"..." }`

---

## 13) Integração com Kokoro (contratos)

### 13.1 Base URL
- Config via env:
  - `KOKORO_BASE_URL=https://kokoro.producta.cloud/v1`
  - (ou `https://kokoro.producta.cloud` e compor `/v1/...`)

### 13.2 Request Kokoro /v1/audio/speech (MVP)
**JSON body:**
```json
{
  "model": "kokoro",
  "input": "texto...",
  "voice": "af_bella",
  "response_format": "mp3",
  "speed": 1.0,
  "stream": false
}
```

**Response:**
- `200` com bytes do áudio no body (binário)

### 13.3 Voices
- `GET /v1/audio/voices`
- Response esperado:
```json
{ "voices": ["af_bella", "af_sky", "..."] }
```

### 13.4 Autenticação (opcional)
Se sua VPS estiver protegida:
- `KOKORO_API_KEY` em env
- Enviar header (exemplo):
  - `Authorization: Bearer <key>`  
  *(Ajustar conforme sua configuração real.)*

---

## 14) Validações detalhadas

### 14.1 Texto
- Trim
- Não aceitar vazio
- Limite char:
  - default 6.000
- (Opcional) bloquear caracteres proibidos/controle

### 14.2 Parâmetros
- `voice`: obrigatório
- `speed`: float entre 0.8 e 1.2 (MVP)
- `response_format`: apenas `mp3` (MVP)

### 14.3 Tamanho do arquivo
- Limite de bytes:
  - ex.: 25MB (MVP)
- Se exceder: erro + sugestão de encurtar texto

---

## 15) Edge cases

1) **Editor gera áudio e fecha sem aceitar**
   - arquivo temp fica órfão
   - mitigação: job de limpeza (cron) para apagar temp > 24h

2) **Editor aceita áudio, mas não salva o content item**
   - arquivo final pode ficar órfão
   - mitigação: manter final como “pendente” e limpar em 7 dias se não referenciado (V2), ou aceitar isso no MVP.

3) **Voices endpoint falha**
   - fallback manual

4) **Timeout**
   - mostrar retry

5) **CORS**
   - evitar chamadas client → VPS; sempre via server route

---

## 16) Critérios de aceite (AC)

### AC-01 Geração + preview
- Dado editor com permissão
- Quando preenche texto e clica “Gerar”
- Então recebe um MP3 em temp storage e consegue tocar no player

### AC-02 Aceite + submissão no fluxo atual
- Quando clica “Aceitar”
- Então o sistema promove o arquivo para o path final e define `media_url`
- E ao salvar o content item, `media_url` fica persistido no DB

### AC-03 Restrições
- Quando texto > limite
- Então o sistema bloqueia a geração e mostra erro claro

### AC-04 Rate limit
- Quando excede limite diário
- Então o sistema retorna erro amigável e não chama o Kokoro

### AC-05 Segurança
- A key do Kokoro não aparece no client nem em requests do browser (apenas server-side)

---

## 17) Plano de implementação (checklist)

**Backend**
- [ ] Implementar envs: `KOKORO_BASE_URL`, `KOKORO_API_KEY?`, limites/rate limit
- [ ] `GET /api/admin/content/tts/voices` (cache)
- [ ] `POST /api/admin/content/tts/generate` (validação + chamada Kokoro + salvar temp)
- [ ] `POST /api/admin/content/tts/accept` (promover temp → final)
- [ ] (Opcional) endpoint para deletar temp
- [ ] Logs e tratamento de erros

**Frontend**
- [ ] Tab “Criar por texto (TTS)” no form de Content
- [ ] Dropdown de voice + slider speed + select format
- [ ] Textarea com contador + validação
- [ ] Player preview + ações (Aceitar / Regenerar / Descartar)
- [ ] Integração com `media_url` existente e Preview modal

**Ops**
- [ ] (Opcional) cron cleanup de `content/temp/tts/*` > 24h

---

## 18) Riscos e mitigação

- **Risco:** geração lenta/instável na VPS  
  **Mitigação:** timeout, retry manual, status pages, monitorar `/health` (se disponível).

- **Risco:** custos/abuso de geração  
  **Mitigação:** rate limit, cooldown, limite de texto e de bytes.

- **Risco:** arquivos órfãos (temp/final)  
  **Mitigação:** cleanup cron e/ou job de reconciliação (V2).

---

## 19) Anexos

### A) Referência do schema atual
Tabela `public.content_items`:
- `type` (podcast | video | music)
- `title` (obrigatório)
- `description` (opcional)
- `cover_url` (opcional)
- `media_url` (opcional)
- `is_live` (boolean)
- `play_count` (somente leitura)

### B) URL de documentação
- Swagger UI: `https://kokoro.producta.cloud/docs`
