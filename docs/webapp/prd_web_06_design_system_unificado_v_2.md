# PRD-WEB-06 — Design System Unificado Seedfy (v2)

**Status:** Draft  
**Owner:** Thiago  
**Plataformas Impactadas:** App Mobile (React Native), Web App (Next.js), Backoffice/Admin (Next.js), Landing Page

---

## 1. Visão Geral

Este PRD define o **Design System Unificado do Seedfy**, garantindo que **Web App, Backoffice e Landing Page sejam visualmente idênticos ao App Mobile**, utilizando **exatamente os mesmos Design Tokens**.

O App Mobile é a **fonte de verdade**. A Web replica, não reinterpreta.

---

## 2. Problema Atual

- Tokens de cores e estilos divergentes entre apps.
- Background Light incorreto na Web (branco puro em vez de creme).
- Componentes reutilizáveis com estilos inconsistentes.

**Impacto:** perda de identidade visual, UX inconsistente e alto custo de manutenção.

---

## 3. Objetivo

1. Centralizar Design Tokens em uma única fonte.
2. Garantir paridade visual total com o Mobile.
3. Suportar Light e Dark Mode nativamente.
4. Eliminar hardcode de estilos.

---

## 4. Princípios de Design

- Mobile First (fonte de verdade)
- Tokens > Estilos diretos
- Background ≠ Surface
- Consistência acima de customização

---

## 5. Escopo

### Incluído
- Paleta de cores Light/Dark
- Tipografia
- Espaçamentos
- Border Radius
- Sombras
- Fonte única de tokens no monorepo
- Aplicação em Web, Backoffice e Landing

### Fora de Escopo
- Redesign de telas
- Novos tokens
- Métricas e telemetria

---

## 6. Design Tokens Oficiais

### 6.1 Cores — Light Mode

- Background: #F9F8F6
- Surface: #FFFFFF
- Primary: #2D3436
- Secondary: #8E8E93
- Accent: #D4AF37
- Text Primary: #1A1A1A
- Text Secondary: #666666
- Border: #E5E5EA
- Error: #FF3B30
- Success: #34C759

### 6.2 Cores — Dark Mode

- Background: #1C1C1E
- Surface: #2C2C2E
- Primary: #FFFFFF
- Secondary: #8E8E93
- Accent: #FFD60A
- Text Primary: #FFFFFF
- Text Secondary: #EBEBF5
- Border: #38383A
- Error: #FF453A
- Success: #32D74B

---

## 7. Tipografia

- Serif: Georgia, serif
- Sans: system-ui, Roboto, Helvetica Neue, sans-serif

Pesos: 400, 500, 700

Tamanhos: 12, 14, 16, 20, 24, 32

Line Heights: 1.2, 1.5, 1.75

---

## 8. Espaçamento

4, 8, 16, 24, 32, 48 px

---

## 9. Border Radius

4, 8, 16, 24, 9999 px

---

## 10. Sombras

- Small: 0 1px 2px rgba(0,0,0,0.05)
- Medium: 0 2px 4px rgba(0,0,0,0.1)

---

## 11. Arquitetura Técnica

- Tokens centralizados em `packages/ui/src/styles/tokens.css`
- Consumo via Tailwind + CSS Variables
- Dark Mode via classe `.dark`

---

## 12. Critérios de Aceite

1. Background Light = #F9F8F6 em todas as páginas.
2. Surface branco para cards/modals.
3. Dark Mode funcional.
4. Zero hardcode de cores em componentes base.
5. Paridade visual entre Mobile, Web, Admin e Landing.

---

## 13. Próximos Passos

1. Versionar PRD-WEB-06 v2.
2. Criar tasks técnicas de implementação.
3. Refatorar componentes base.
4. Auditoria visual final.

