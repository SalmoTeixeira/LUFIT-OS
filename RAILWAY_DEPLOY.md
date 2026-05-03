# GUIA DE DEPLOY — LUFIT OS na Railway

## ARQUITETURA DO PROJETO

O LUFIT OS e um monorepo Full-Stack:

- **Frontend:** React 19 + Vite + Tailwind CSS (build → `dist/public/`)
- **Backend:** Node.js + Hono + tRPC + Drizzle ORM (bundle → `dist/boot.js`)
- **Banco de Dados:** MySQL 8 (via plugin nativo da Railway)
- **Servidor Unico:** O backend Hono serve tanto a API quanto os arquivos estaticos

```
Cliente (Browser)
    |
    v
Railway App (Node.js)
    ├── /          → Frontend React (dist/public/index.html)
    ├── /api/trpc  → Rotas tRPC (produtos, pagamentos, auth...)
    ├── /api/health→ Healthcheck para Railway
    └── /api/oauth → Callback de autenticacao
    |
    v
Railway MySQL (banco de dados)
```

---

## PASSO A PASSO DE IMPLANTACAO

### ETAPA 1: Criar conta na Railway

1. Acesse https://railway.app/
2. Clique em "Login" → escolha "Sign in with GitHub"
3. Autorize o acesso ao seu GitHub (SalmoTeixeira)

### ETAPA 2: Criar Projeto e Banco de Dados MySQL

1. No Dashboard, clique em **"New Project"**
2. Escolha **"Provision MySQL"** (isso cria o banco automaticamente)
3. O Railway gera o banco e mostra a variavel `DATABASE_URL`

### ETAPA 3: Conectar o Repositorio GitHub

1. No mesmo projeto, clique em **"New" → "GitHub Repo"**
2. Selecione o repositorio: `SalmoTeixeira/LUFIT-OS`
3. A Railway detecta automaticamente o `railway.json`

### ETAPA 4: Configurar Build e Start Commands (automatico)

O arquivo `railway.json` ja configura tudo, mas verifique:

| Campo | Valor |
|-------|-------|
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `npm run start` |
| **Healthcheck Path** | `/api/health` |

Se precisar configurar manualmente:
- Va em Settings → Build → Build Command: `npm ci && npm run build`
- Va em Settings → Deploy → Start Command: `npm run start`
- Va em Settings → Healthcheck → Path: `/api/health`

### ETAPA 5: Injetar Variaveis de Ambiente

Va em **Variables → Raw Editor** e cole todas as variaveis abaixo (preencha os valores):

```env
# ============================================
# OBRIGATORIO — Banco de Dados MySQL
# ============================================
# Copie o valor do servico MySQL da Railway (gerado automaticamente)
DATABASE_URL=mysql://user:password@host:port/database

# ============================================
# OBRIGATORIO — Autenticacao Kimi (OAuth 2.0)
# ============================================
APP_ID=19de68c0-ae62-85f9-8000-0000afb3fadb
APP_SECRET=CTSK0yMrNXB7x4UNy1xyNCfzrSb0vKF9
VITE_APP_ID=19de68c0-ae62-85f9-8000-0000afb3fadb
VITE_KIMI_AUTH_URL=https://auth.kimi.com
KIMI_AUTH_URL=https://auth.kimi.com
KIMI_OPEN_URL=https://open.kimi.com
OWNER_UNION_ID=d6nmi3am52tckvas16vg

# ============================================
# OBRIGATORIO — Mercado Pago (Pagamentos PIX + Cartao)
# ============================================
MERCADOPAGO_ACCESS_TOKEN=TEST-0000000000000000-000000-00000000000000000000000000000000-000000000
MERCADOPAGO_PUBLIC_KEY=TEST-00000000-0000-0000-0000-000000000000

# ============================================
# OBRIGATORIO — Kangu (Frete / Logistica)
# ============================================
KANGU_API_TOKEN=seu_token_aqui
KANGU_API_URL=https://api.kangu.com.br

# ============================================
# OPCIONAL — Bling (Nota Fiscal Eletronica)
# ============================================
BLING_CLIENT_ID=
BLING_CLIENT_SECRET=
BLING_API_KEY=

# ============================================
# OPCIONAL — AWS S3 (Upload de imagens)
# ============================================
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=lufit-os-images

# ============================================
# SISTEMA — NAO ALTERAR
# ============================================
NODE_ENV=production
PORT=3000
```

### ETAPA 6: Deploy

1. Clique em **"Deploy"**
2. A Railway faz:
   - `npm ci` — instala dependencias
   - `npm run build` — builda frontend (Vite) + backend (esbuild)
   - `npm run start` — inicia o servidor Node.js
3. Aguarde o healthcheck `/api/health` retornar `200 OK`
4. A Railway gera a URL: `https://lufit-os-production.up.railway.app`

### ETAPA 7: Configurar o Banco de Dados

1. Va no servico MySQL da Railway → clique em "Connect"
2. No terminal do servico da aplicacao (ou localmente):
```bash
# Rodar as migrations
npx drizzle-kit push
```
Ou configure um comando de deploy:
- Settings → Deploy → Deploy Command: `npm run db:push`

### ETAPA 8: Seed Inicial (opcional)

```bash
# Popular categorias e produtos iniciais
npx tsx db/seed.ts
```

---

## ESTRUTURA DE COMANDOS

| Comando | O que faz |
|---------|-----------|
| `npm run build` | Builda frontend (Vite) + backend (esbuild) |
| `npm run start` | Inicia servidor em producao |
| `npm run db:push` | Sincroniza schema com o banco |
| `npm run db:generate` | Gera arquivo SQL de migration |
| `npm run db:migrate` | Aplica migrations pendentes |
| `npm run check` | Verificacao de TypeScript |

---

## TROUBLESHOOTING

### Erro: "Cannot connect to database"
- Verifique se `DATABASE_URL` esta correta
- Verifique se o servico MySQL esta "Running" na Railway
- O Railway bloqueia conexoes externas por padrao — use a variavel de rede interna

### Erro: "Build failed"
- Verifique se o Node.js version >= 20 na Railway
- Settings → Environments → Node version: `20`

### Erro: "Port already in use"
- A Railway injeta a variavel `PORT` automaticamente
- Nosso codigo ja usa `process.env.PORT || "3000"`

---

## URLs APOS DEPLOY

| URL | Descricao |
|-----|-----------|
| `https://SEU-DOMINIO.railway.app` | Site LUFIT OS (frontend) |
| `https://SEU-DOMINIO.railway.app/admin` | Painel administrativo |
| `https://SEU-DOMINIO.railway.app/api/health` | Healthcheck |
| `https://SEU-DOMINIO.railway.app/api/trpc` | API tRPC |

---

## CHECKLIST PRE-DEPLOY

- [ ] Conta Railway criada (login com GitHub)
- [ ] Projeto criado com MySQL provisionado
- [ ] Repositório GitHub conectado
- [ ] Variavel `DATABASE_URL` configurada
- [ ] Variaveis Kimi OAuth configuradas
- [ ] Variaveis Mercado Pago configuradas
- [ ] Variavel `KANGU_API_TOKEN` configurada
- [ ] `railway.json` presente na raiz
- [ ] Deploy executado com sucesso
- [ ] Healthcheck retornando `ok`
- [ ] Banco sincronizado (`db:push`)
- [ ] Teste de compra realizado

---

**Engenheiro responsavel:** Kimi | **Data:** 2026-05-04
**Versao:** 1.0 | **Status:** Pronto para deploy
