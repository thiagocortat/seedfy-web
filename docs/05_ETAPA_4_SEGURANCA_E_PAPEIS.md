# Etapa 4 — Segurança e Papéis (por último; com mudanças no banco)

## Objetivo
Endurecer acesso e reduzir risco: somente admins/editores autorizados podem publicar/alterar conteúdo.

## Proposta de evolução (com DB changes)
- Adicionar coluna `users.role` (admin | editor | viewer) OU tabela `user_roles`
- Habilitar RLS rígido:
  - `content_items`: leitura pública (ou autenticada), escrita apenas admin/editor
  - `churches`: escrita apenas admin
- Storage policies:
  - Buckets privados para escrita
  - URLs assinadas quando aplicável
- Auditoria:
  - Tabela `audit_logs` (actor, action, entity, before/after, ts)

## Tarefas
- [ ] Definir modelo de roles
- [ ] Migrações SQL
- [ ] Políticas RLS e storage
- [ ] Ajustes no admin para respeitar permissões
