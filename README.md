# Seedfy Web Monorepo

Este é um monorepo gerenciado com **npm workspaces**, contendo múltiplas aplicações e pacotes compartilhados.

## Estrutura do Projeto

- **apps/admin**: Painel administrativo (Next.js) - Porta 3001
- **apps/landing**: Landing page (Next.js) - Porta 3000
- **packages/shared**: Código compartilhado (types, schemas, utils)
- **packages/ui**: Componentes de UI compartilhados
- **packages/config**: Configurações compartilhadas (ESLint, TSConfig)

## Como Executar Localmente

### 1. Instalar Dependências
Na raiz do projeto, execute:
```bash
npm install
```

### 2. Executar Todas as Aplicações
Para rodar todos os projetos simultaneamente:
```bash
npm run dev
```
Isso iniciará:
- Admin: [http://localhost:3001](http://localhost:3001)
- Landing: [http://localhost:3000](http://localhost:3000)

### 3. Executar Apenas Uma Aplicação
Para rodar apenas uma das aplicações, use a flag `-w` (workspace):

**Apenas o Admin:**
```bash
npm run dev -w admin
```

**Apenas a Landing Page:**
```bash
npm run dev -w landing
```

---

## Como Fazer o Deploy no Vercel

Como este é um monorepo, você deve criar **um projeto separado no Vercel para cada aplicação** (Admin e Landing), conectando o mesmo repositório Git.

### Passos Gerais para Qualquer Aplicação:
1. Acesse o [Vercel Dashboard](https://vercel.com/dashboard) e clique em **"Add New..."** > **"Project"**.
2. Importe o repositório `seedfy_web`.

### Configuração para o Admin (Backoffice)
Ao configurar o projeto do Admin:
1. **Root Directory**: Clique em "Edit" e selecione `apps/admin`.
2. **Framework Preset**: Deixe como `Next.js`.
3. **Environment Variables**: Adicione as variáveis necessárias (ex: Supabase keys).
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (se necessário para server actions)
4. Clique em **Deploy**.

### Configuração para a Landing Page
Ao configurar o projeto da Landing Page:
1. **Root Directory**: Clique em "Edit" e selecione `apps/landing`.
2. **Framework Preset**: Deixe como `Next.js`.
3. **Environment Variables**: Adicione as variáveis necessárias.
4. Clique em **Deploy**.

### Notas Importantes sobre o Monorepo no Vercel
- O Vercel detectará automaticamente que é um monorepo e lidará com a instalação das dependências da raiz.
- Se você alterar um pacote compartilhado (ex: `packages/shared`), o Vercel recompilará as aplicações que dependem dele, garantindo que tudo esteja sincronizado.
