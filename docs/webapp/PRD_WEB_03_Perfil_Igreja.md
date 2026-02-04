# PRD-WEB-03 — Perfil e Igreja (Sem DB changes)

**Status:** Draft  
**Data:** 2026-02-04  
**Dependência:** PRD-WEB-01  
**Restrição:** sem alterações no banco

---

## 1) Objetivo

Permitir ao usuário gerenciar informações pessoais básicas e visualizar vínculo com igreja **apenas com campos existentes**.

---

## 2) Escopo

### Perfil (`/app/profile`)
- Visualizar dados do usuário (tabela `public.users`)
- Editar campos existentes (ex.: name, avatar_url, church_id, bio… conforme schema real)
- Validar:
  - Campos obrigatórios (se houver)
  - Limites de tamanho

### Igreja (`/app/church` ou seção no perfil)
- Mostrar igreja vinculada (join `users.church_id` → `churches`)
- Listar igrejas apenas se o schema/policies já permitirem
- Selecionar igreja (update em `users.church_id`) apenas se RLS permitir

---

## 3) Fora de escopo

- Upload de avatar se não existir bucket/policy já pronto
- Funcionalidades extras por igreja (feed/eventos) se não existirem tabelas

---

## 4) Critérios de aceite

- Usuário visualiza e edita perfil (campos existentes)
- Igreja vinculada aparece corretamente (quando existir)
- Sem mudanças no banco
