# PRD-WEB-PARITY-05 — Onboarding no Web App (pós-cadastro) — Sem DB changes

**Status:** Draft  
**Data:** 2026-02-04  
**Owner:** Produto (Thiago)  
**Plataforma:** `apps/web` (Next.js) + Supabase Auth + DB  
**Restrição:** **sem alterações no banco** (schema/migrations proibidos).  
**Sem telemetria.**

---

## 1) Contexto

No RN existe onboarding após cadastro. No Web App, o usuário entra direto no shell e fica sem:
- nome/identidade definida
- igreja selecionada
- interesses definidos

O schema já suporta isso:
- `public.users.onboarding_completed` (boolean)
- `public.users.name`, `photo_url`
- `public.users.church_id` (text)
- `public.users.interests` (array)
- `public.users.email_verified` (boolean)

> Nota: para replicar 1:1 o fluxo do RN, ideal ter as telas RN de onboarding como referência. Este PRD entrega um fluxo web compatível com o schema atual.

---

## 2) Objetivo

- Implementar onboarding web obrigatório para usuários com `onboarding_completed=false`:
  1) Perfil mínimo (nome/foto opcional)
  2) Seleção de igreja
  3) Interesses
  4) Finalizar e marcar `onboarding_completed=true`

---

## 3) Escopo

### Inclui
- Gate global: usuário logado com `onboarding_completed=false` é redirecionado para `/app/onboarding`.
- Wizard 3 etapas com persistência incremental.
- Reuso do `ChurchPicker` (PRD-WEB-PARITY-04).
- Tratamento de erros (RLS) com fallback.

### Não inclui
- Upload de foto (somente URL/placeholder)
- Verificação de e-mail (apenas mostrar status)
- Telemetria

---

## 4) Requisitos funcionais

### 4.1 Gate de onboarding (obrigatório)
Ao acessar qualquer rota `/app/*` (exceto `/app/onboarding` e rotas públicas):
- carregar `public.users` por `id = auth.uid()`
- se `onboarding_completed === false` → redirect `/app/onboarding`
- se `true` → fluxo normal

Estados:
- loading: skeleton/splash
- erro ao carregar: mensagem + “Tentar novamente” + “Sair”

---

### 4.2 Wizard `/app/onboarding`

#### Etapa 1 — Perfil
Campos:
- Nome (obrigatório)
- Foto (opcional, URL) + “Pular”

Write:
- `update public.users set name, photo_url where id=auth.uid()`

Validação:
- nome >= 2 chars

CTA:
- “Continuar”

#### Etapa 2 — Igreja
- Selecionar igreja via `ChurchPicker`
- Persistir:
  - `update public.users set church_id = <uuid as string> where id=auth.uid()`
- Permitir:
  - “Pular por enquanto” (church_id vazio)

CTA:
- “Continuar”

#### Etapa 3 — Interesses
- Multi-select de interesses (lista definida no front)
- Persistir:
  - `update public.users set interests = <array> where id=auth.uid()`
- Permitir:
  - “Pular por enquanto”

CTA:
- “Finalizar”

#### Conclusão
- `update public.users set onboarding_completed=true where id=auth.uid()`
- navegar para `/app`

---

### 4.3 UX e consistência visual
- Indicador de progresso (1/3, 2/3, 3/3).
- Desktop: card centralizado.
- Mobile: fluxo full-height com CTA fixo no rodapé.
- Mesmos tokens do design system do web (aproximar do RN).

---

### 4.4 Resiliência (RLS / writes)
- Se qualquer update falhar:
  - mostrar erro claro e não “silenciar”.
- Gate:
  - se não conseguir marcar `onboarding_completed=true`, o usuário ficará preso no onboarding:
    - oferecer “Sair”
    - instruir “Concluir pelo app” (CTA)

---

## 5) Critérios de aceite

1) Usuário recém-cadastrado com `onboarding_completed=false` cai em `/app/onboarding`.
2) Nome é salvo com sucesso.
3) Igreja pode ser selecionada e salva (ou usuário pode pular).
4) Interesses são salvos (ou pode pular).
5) Finalização marca `onboarding_completed=true` e libera acesso ao resto do `/app`.

---

## 6) Plano de implementação

1) Implementar gate global (layout/middleware).
2) Implementar wizard e estado local (persistência por step).
3) Integrar `ChurchPicker`.
4) Ajustar UI/empty/error states.

---

## 7) Dependências e riscos

- Dependência direta: `ChurchPicker` (PRD-WEB-PARITY-04).
- RLS pode bloquear updates em `public.users` → validar policies.
- Edge: usuário logado sem row em `public.users` → tratar como erro e orientar.
