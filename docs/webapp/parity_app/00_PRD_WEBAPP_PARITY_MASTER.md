# Seedfy — PRD Master: Web App Parity com o App (RN) — Sem Alterações de Banco

**Status:** Draft  
**Data:** 2026-02-04  
**Owner:** Produto (Thiago)  
**Escopo:** Completar paridade funcional “por valor” do Web App em relação ao app React Native, **sem alterações no schema do banco** (sem tabelas/colunas/migrations/triggers).  
**Observação:** este PRD foca em **funcionalidades faltantes** (ações/criação/entrada), não em correções pontuais já tratadas.

---

## 1) Contexto

O Web App já possui:
- Auth + Shell `/app`
- Conteúdo/Player (com regra temporária de `is_live` não bloqueante)
- Lista/Detalhe de Challenges/Jornadas (com UI de jornada já existente)
- Dashboard parcial

Ainda faltam fluxos centrais que existem no app RN:
1) **Grupos**: criar, convidar, buscar, solicitar entrada, aprovar/gerenciar
2) **Challenges/Jornadas**: explorar/iniciar jornada, criar challenge, entrar em challenge
3) **Igreja**: “Minha igreja”, feed de posts da igreja, ações rápidas

---

## 2) Objetivo

Entregar no canal Web (área logada) os mesmos “core loops” do app RN:
- Comunidade: grupos e entrada por convite/solicitação
- Jornada/Desafio: iniciar e participar, check-in apenas por ação explícita do usuário
- Igreja: consumir conteúdo institucional (posts) e ações rápidas

Sem depender de mudanças no banco; quando RLS/policies bloquearem alguma escrita, a web deve:
- degradar graciosamente (UI desabilitada + explicação)
- sugerir fluxo alternativo no mobile (CTA “Abrir no app”)

---

## 3) Não objetivos

- Alterações no banco (schema/migrations)
- Telemetria/métricas (fica para PRD separado)
- Backoffice (já é um app interno separado)
- Notificações push e automações

---

## 4) Princípios de implementação

1) **Fonte única de verdade:** usar as mesmas tabelas/contratos do RN.
2) **Sem “writes automáticos”:** nenhuma escrita em `daily_checkins` ou membership deve ocorrer em `useEffect`/onMount; somente por ações explícitas (clique/submit).
3) **RLS-aware:** toda escrita deve ter tratamento de erro e UX de fallback.
4) **Feature flags por capability:** habilitar botões “Criar/Entrar/Convidar” apenas quando a escrita é permitida no ambiente atual (ou manter habilitado e tratar erro com mensagem clara).
5) **Paridade de navegação:** rotas e nomenclatura próximas do RN (Grupos, Jornadas, Desafios, Igreja).

---

## 5) Escopo por etapas (entregas)

### Etapa 1 — Grupos completos (paridade mínima)
- Criar grupo
- Buscar grupos discoverable
- Solicitar entrada (join request)
- Convidar usuário existente (por e-mail)
- Inbox de convites e solicitações (aceitar/rejeitar/aprovar)

📄 PRD derivado: **PRD-WEB-PARITY-01 — Grupos completos**

### Etapa 2 — Jornadas/Challenges completos (paridade mínima)
- Explorar jornadas (catálogo)
- Iniciar jornada (criar challenge vinculado à jornada + participant)
- Criar challenge “comum” (pessoal ou vinculado a grupo)
- Entrar em challenge (join)
- Garantir check-in correto e apenas manual

📄 PRD derivado: **PRD-WEB-PARITY-02 — Challenges & Jornadas (Criar/Entrar/Explorar)**

### Etapa 3 — Igreja (conteúdo institucional)
- Minha igreja (perfil)
- Feed de posts
- Post detail
- Quick actions

📄 PRD derivado: **PRD-WEB-PARITY-03 — Igreja e Posts**

---

## 6) Critérios de aceite (macro)

- Um usuário consegue, pela web, **criar** um grupo, **convidar** alguém e **aprovar** entrada (quando policies permitirem).
- Um usuário consegue, pela web, **iniciar** uma jornada e ver o capítulo do dia (sem check-in automático).
- Um usuário com `church_id` vê sua igreja e um feed de posts publicados.

---

## 7) Dependências e riscos

- **RLS/policies atuais** podem bloquear inserts/updates: a implementação deve ter UI resiliente.
- `users.church_id` é `text` no schema (pode exigir comparação `churches.id::text`).
- Uploads/Storage: fora do escopo (somente leitura de URLs).

---

## 8) Entregáveis

- 1 PRD Master (este)
- 3 PRDs específicos (Grupos / Challenges+Jornadas / Igreja)
