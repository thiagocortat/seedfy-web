# Seedfy — PRD Master: Web App (Landing + Área Logada) — Sem Alterações de Banco

**Status:** Draft  
**Data:** 2026-02-04  
**Owner:** Produto (Thiago)  
**Plataformas:** Monorepo (Next.js) + Supabase (Auth + DB + Storage)  
**Restrição crítica:** **não recomendar nem depender de alterações no banco de dados** (sem novas tabelas, sem novos campos, sem migrations).  
**Observação:** Sem Telemetria/Métricas neste PRD (ficará para um PRD separado).

---

## 1) Visão geral

Evoluir a presença web do Seedfy para:
1) **Marketing site (público)**: landing completa, SEO básico e comunicação clara de funcionalidades; e  
2) **Web App (logado)**: acesso gradual às funcionalidades do produto (paridade por valor) com UX responsiva;  
mantendo o **Backoffice** como aplicativo interno separado.

---

## 2) Objetivo final (Outcome)

- Usuário consegue **logar pela web** e executar os principais fluxos do Seedfy (em ondas):
  - **Conteúdo + Player**
  - **Grupos**
  - **Desafios / Check-in**
  - **Perfil / Igreja** (somente o que já existir no schema atual)
- Landing pública demonstra funcionalidades do produto e direciona para **Baixar App** ou **Acessar Web**.
- O canal web opera **sem mudanças no schema** e respeita **RLS** (sem service role no browser).

---

## 3) Escopo por ondas

### Onda A — Fundamentos + Conteúdo (MVP Web útil)
- Landing pública responsiva (páginas institucionais + features)
- Auth (login, signup, reset)
- Shell da área logada `/app`
- Biblioteca de conteúdo e Player web
- Perfil básico (campos existentes)

### Onda B — Grupos
- Listar “Meus grupos”, detalhe do grupo e membros
- Criar grupo (somente se policies/tabelas já suportarem)
- Convites/solicitações **apenas se já suportado pelo schema atual e RLS**; caso contrário, manter apenas convite por link (se já existir) e deixar inbox de convites/requests como backlog.

### Onda C — Desafios / Check-in
- Listar desafios do usuário
- Detalhe do desafio + progresso
- Check-in diário

---

## 4) Não objetivos

- Qualquer alteração de banco (tabelas, colunas, migrations, triggers)
- Telemetria/métricas e dashboards
- RBAC novo persistido (papéis além do que já existir)
- Funcionalidades que dependam de entidades inexistentes no schema

---

## 5) Requisitos de segurança

- `/app/**` protegido por sessão do Supabase Auth
- Todas leituras/escritas do usuário final via Supabase client com RLS
- Rotas server-side só para necessidades técnicas já existentes (ex.: SSR seguro), **não** para contornar RLS

---

## 6) PRDs derivados (plano de entrega)

Este PRD master se desdobra nos seguintes PRDs mais específicos:

1. **PRD-WEB-01 — Fundamentos do Web App + Landing**  
2. **PRD-WEB-02 — Conteúdo e Player Web**  
3. **PRD-WEB-03 — Perfil e Igreja (compatível com schema atual)**  
4. **PRD-WEB-04 — Grupos (Meus grupos, Detalhe, Membros, Criação)**  
5. **PRD-WEB-05 — Desafios e Check-in**  
6. **PRD-WEB-06 — UX Responsiva, Navegação e Design System compartilhado** (opcional, mas recomendado)

---

## 7) Critérios de aceite (macro)

- Onda A entregue em produção com login + consumo de conteúdo e landing completa.
- Onda B habilita uso real de grupos no desktop/tablet.
- Onda C habilita o core loop de desafios/check-in pela web.
- Em nenhuma etapa ocorre dependência de mudança no schema do banco.

---

## 8) Riscos principais

- Policies RLS atuais podem não cobrir totalmente os fluxos do canal web (precisa validação por feature).
- Upload de imagem/foto depende de buckets/policies já existentes; se não houver, a feature deve degradar (somente leitura).

---

## 9) Referências

- PRDs e etapas do Seedfy existentes no monorepo (landing/backoffice/foundation/segurança).  
