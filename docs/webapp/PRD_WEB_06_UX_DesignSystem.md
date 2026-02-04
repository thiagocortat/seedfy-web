# PRD-WEB-06 — UX Responsiva, Navegação e Design System (Sem DB changes)

**Status:** Draft  
**Data:** 2026-02-04  
**Dependência:** PRD-WEB-01 (em paralelo com demais)  
**Restrição:** sem alterações no banco

---

## 1) Objetivo

Padronizar a experiência web:
- Componentes reutilizáveis (UI kit)
- Navegação consistente (público vs logado)
- Responsividade e acessibilidade como padrão

---

## 2) Escopo

### Design System compartilhado
- Criar/expandir `packages/ui` com:
  - Buttons, Inputs, Cards, Modals/Dialogs
  - Nav (Sidebar/Topbar/BottomNav)
  - Empty states, Loading states, Error states
- Tokens:
  - espaçamentos, tipografia, radius, sombras, cores (compatível com a identidade Seedfy)

### Padrões de layout
- Landing:
  - seções consistentes, grid responsivo, componentes de “Feature”
- Área logada:
  - Desktop: sidebar fixa + conteúdo
  - Mobile: navegação alternativa (drawer ou bottom)
  - Header com usuário e logout

### Acessibilidade
- Focus states visíveis
- Labels e aria onde necessário

---

## 3) Critérios de aceite

- Componentes base cobrindo 80% das telas do Web App
- Layout responsivo validado em breakpoints principais
- Sem mudanças no banco
