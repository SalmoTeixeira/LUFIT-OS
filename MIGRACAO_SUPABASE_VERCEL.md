# MIGRACAO: Railway + MySQL → Supabase + Vercel

## Status: CODIGO MIGRADO — Falta configurar Supabase e Vercel

---

## O que JA FOI FEITO (codigo)

### 1. Schema PostgreSQL
- Convertido `mysqlTable` → `pgTable` (49 tabelas)
- Convertido `mysqlEnum` → `pgEnum` (57 enums)
- Removido `unsigned` dos `bigint` (81 ocorrencias)
- Arquivo: `db/schema.ts` (backup: `db/schema-mysql-backup.ts`)

### 2. Conexao do Banco
- `api/queries/connection.ts`: `drizzle-orm/mysql2` → `drizzle-orm/postgres-js`
- Removido `mode: "planetscale"`

### 3. Drizzle Config
- `drizzle.config.ts`: `dialect: "mysql"` → `dialect: "postgresql"`

### 4. Dependencias
- `package.json`: `mysql2` → `postgres`
- Instalado e testado

### 5. Entry Point Vercel
- Criado `api/index.ts` (serverless handler)
- Criado `vercel.json` (configuracao)

### 6. Build
- Frontend: 2583 modulos, ZERO erros
- Type check: ZERO erros

---

## O que VOCE precisa fazer

### PASSO 1: Criar projeto no Supabase

1. Acesse https://supabase.com
2. Clique "New Project"
3. Escolha organizacao
4. Nome do projeto: `lufit-os`
5. Database Password: (guarde bem!)
6. Region: `South America (Sa Paulo)`
7. Clique "Create new project"
8. Aguarde (1-2 minutos)

### PASSO 2: Pegar DATABASE_URL

1. No projeto Supabase, va em **Project Settings > Database**
2. Copie a **Connection string** (URI format)
3. Vai ser algo como:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   ```

### PASSO 3: Configurar variaveis de ambiente

Crie/edito o arquivo `.env` local:
```env
DATABASE_URL=postgresql://postgres:SUA_SENHA@db.SEU_REF.supabase.co:5432/postgres
BLING_CLIENT_ID=94d57dfd0baeacba45324be04579f5cd9e4d1714
BLING_CLIENT_SECRET=530b35711020edbcec3cdb635e4cbe6b2ef77c8dfa4513c53a4d7e7c5901
APP_URL=https://SEU_DOMINIO.vercel.app
```

### PASSO 4: Rodar migrations

```bash
cd /caminho/do/projeto
npx drizzle-kit push
```

Isso cria todas as 49 tabelas no Supabase.

### PASSO 5: Importar dados do Railway

Opcao A — Exportar do Railway:
```bash
# No Railway (via MySQL CLI)
mysqldump -u USER -p -h HOST DATABASE > lufit_backup.sql
```

Opcao B — Refazer do zero (mais limpo):
- As categorias, marcas e vendedoras sao criadas automaticamente pelo boot
- Produtos: recadastrar ou importar via CSV

### PASSO 6: Deploy no Vercel

1. Acesse https://vercel.com
2. Clique "Add New... > Project"
3. Importe o repositorio GitHub `SalmoTeixeira/LUFIT-OS`
4. Configure:
   - Framework Preset: `Other`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Em **Environment Variables**, adicione:
   - `DATABASE_URL` = (string do Supabase)
   - `BLING_CLIENT_ID` = (sua chave)
   - `BLING_CLIENT_SECRET` = (sua chave)
   - `JWT_SECRET` = (gere uma string aleatoria)
   - `APP_URL` = (URL do Vercel)
6. Clique "Deploy"

### PASSO 7: Configurar dominio

1. No Vercel, va em **Settings > Domains**
2. Adicione seu dominio: `www.lufit.com.br`
3. Siga as instrucoes de DNS

---

## URLs apos migracao

| Servico | URL |
|---------|-----|
| Site | `https://SEU_PROJETO.vercel.app` |
| Admin | `https://SEU_PROJETO.vercel.app/#/admin` |
| PDV | `https://SEU_PROJETO.vercel.app/#/pdv` |
| API | `https://SEU_PROJETO.vercel.app/api/health` |
| Supabase | `https://app.supabase.com/project/SEU_REF` |

---

## Verificacao pos-migracao

- [ ] Site abre sem erros
- [ ] Admin carrega (senha: `Salmo2024`)
- [ ] PDV funciona (PINs: 1234, 5678, 9012)
- [ ] Produtos listam
- [ ] Cadastro de cliente funciona
- [ ] Pedido de teste completo
- [ ] WhatsApp envia mensagem
- [ ] NF/Bling conecta
- [ ] Frete calcula

---

## Rollback (se precisar)

O Railway ainda esta rodando. Se algo der errado:
- Site Railway: https://lufit-os-production-23e6.up.railway.app
- Banco MySQL: ainda intacto
- Para voltar: basta apontar o DNS de volta

---

*Migracao v4.0.0 | Codigo: PRONTO | Deploy: PENDENTE (voce)*
