# Etapa 3 — Polimento Operacional (Admin) + Qualidade

## Objetivo
Tornar o backoffice “operável” no dia a dia sem fricção, antes de endurecer segurança e papéis.

## Melhorias (sem DB changes)
- Bulk actions (mínimo):
  - Desativar/ativar `is_live` em massa (opcional)
- Preview aprimorado:
  - Player de áudio com controles básicos
  - Player de vídeo com fallback
- Auditoria leve (sem persistência):
  - Logs server-side (requestId + user email)
- UX:
  - Empty states e onboarding interno (“como publicar conteúdo”)
  - Validação de tamanho de arquivo e tipo (mp3/mp4/jpg/png)

## Tarefas
- [ ] Bulk toggle (opcional)
- [ ] Melhorar preview e tratamento de erro
- [ ] Melhorar upload (limites, tipos, mensagens)
- [ ] Padronizar componentes de tabela, modal, form
