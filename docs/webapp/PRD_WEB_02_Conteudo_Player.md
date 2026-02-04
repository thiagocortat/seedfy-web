# PRD-WEB-02 — Conteúdo e Player Web (Sem DB changes)

**Status:** Draft  
**Data:** 2026-02-04  
**Dependência:** PRD-WEB-01  
**Restrição:** sem alterações no banco

---

## 1) Objetivo

Entregar consumo de conteúdo no Web App:
- Biblioteca de conteúdo (lista + filtros)
- Página de detalhe
- Player web para áudio e vídeo

---

## 2) Escopo

### Biblioteca (`/app/content`)
- Fonte: `public.content_items` (somente o que já existir)
- Regras:
  - Exibir apenas itens `is_live = true` (se o campo existir; caso não exista, exibir todos e limitar por regras já usadas no mobile)
- Filtros:
  - Tipo (video/podcast/music, conforme valores existentes)
  - Busca por título (client-side ou query via supabase)

### Detalhe do conteúdo (`/app/content/[id]`)
- Exibir: título, descrição, capa, duração (se existir), autor (se existir)
- CTA: play/pause

### Player
- Vídeo: player HTML5 com fullscreen
- Áudio: player HTML5 com capa e controles
- Comportamento de navegação:
  - padrão MVP: pausar ao sair da página
  - (backlog) mini-player persistente no layout

---

## 3) Fora de escopo

- Tracking avançado (play count, progresso) se isso depender de update não permitido por RLS atual
- Recomendação personalizada

---

## 4) Requisitos funcionais

- O usuário logado vê a lista de conteúdos.
- Ao clicar em um item, abre detalhe.
- Player executa mídia usando URL já armazenada (CDN/Storage) sem precisar gerar URLs com service role.
- Erros de mídia:
  - URL inválida, CORS ou indisponível → mensagem amigável

---

## 5) Critérios de aceite

- Lista de conteúdo com filtros funciona
- Player funciona para pelo menos 1 item de vídeo e 1 item de áudio em ambiente real
- Sem mudanças no banco

---

## 6) Riscos e mitigação

- CORS/headers do storage/CDN: validar se as URLs atuais já funcionam no browser.
- Se a mídia estiver “protegida” e depender de signed URLs com server role, a entrega deve ser limitada a conteúdos públicos já acessíveis.
