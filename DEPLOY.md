# LUFIT OS — Instrucoes de Deploy

## Status Atual (v3.0.9)

O build local esta funcionando perfeitamente. O problema e que o Railway nao fez o deploy automatico da ultima versao.

---

## Opcao 1: Deploy Manual pelo Dashboard do Railway (RECOMENDADO)

1. Acesse: https://railway.app/dashboard
2. Encontre o projeto **LUFIT-OS**
3. Clique no servico (unico servico listado)
4. Va na aba **"Deployments"**
5. Clique no botao **"Redeploy"** (canto superior direito)
6. Aguarde o build e deploy (2-3 minutos)

---

## Opcao 2: Deploy via Railway CLI

### Passo 1: Gerar novo token
1. Acesse: https://railway.app/account/tokens
2. Clique em **"New Token"**
3. De um nome (ex: "Deploy LUFIT")
4. Copie o token gerado

### Passo 2: Configurar token
```bash
export RAILWAY_TOKEN="seu-novo-token-aqui"
```

### Passo 3: Rodar o script de deploy
```bash
cd /caminho/do/projeto
./scripts/deploy.sh
```

Ou manualmente:
```bash
npm ci
npm run build
npx @railway/cli up \
    --project 350d9bef-e92b-4fbd-a3e9-7e26bc24a462 \
    --service 3878e309-8d6e-4b17-af6a-b78c730412ec \
    --environment d06fd2b5-7caa-41fe-bcaf-b7ba68d515ac
```

---

## Opcao 3: GitHub Actions (Auto-deploy)

### Passo 1: Configurar secrets no GitHub
1. No GitHub, va em **Settings > Secrets and variables > Actions**
2. Adicione estes secrets:
   - `RAILWAY_TOKEN` = seu token do Railway
   - `RAILWAY_PROJECT_ID` = `350d9bef-e92b-4fbd-a3e9-7e26bc24a462`
   - `RAILWAY_SERVICE_ID` = `3878e309-8d6e-4b17-af6a-b78c730412ec`
   - `RAILWAY_ENV_ID` = `d06fd2b5-7caa-41fe-bcaf-b7ba68d515ac`

### Passo 2: O workflow ja esta criado
O arquivo `.github/workflows/deploy.yml` ja esta pronto no projeto.

### Passo 3: Push para a branch main
Cada push para a branch `main` vai acionar o deploy automatico:
```bash
git push origin main
```

---

## URLs do Sistema

| Ambiente | URL |
|----------|-----|
| Site | https://lufit-os-production-23e6.up.railway.app |
| Admin | https://lufit-os-production-23e6.up.railway.app/#/admin |
| PDV | https://lufit-os-production-23e6.up.railway.app/#/pdv |
| Health | https://lufit-os-production-23e6.up.railway.app/api/health |

---

## Senhas de Acesso

| Sistema | Senha/PIN |
|---------|-----------|
| Admin | `Salmo2024` |
| PDV Vendedora 1 | `1234` ou `V001` |
| PDV Vendedora 2 | `5678` ou `V002` |
| PDV Vendedora 3 | `9012` ou `V003` |

---

## Versoes

| Versao | Data | Mudancas |
|--------|------|----------|
| v3.0.9 | Atual | Fix cache Vite + admin page |
| v3.0.8 | Anterior | Banners Lupo/Selene |
| v3.0.7 | Anterior | PDV Balcao completo |
| v3.0.6 | Anterior | WhatsApp Automacao |
| v3.0.5 | Railway | Ultima versao no ar |

---

## Problemas Conhecidos

1. **Railway nao auto-deploya**: O webhook do GitHub nao esta funcionando. Use o redeploy manual.
2. **Token expirado**: O token antigo (`ea2726dd-6e10-4a9d-bee6-2a54e830a4df`) expirou. Gere um novo em https://railway.app/account/tokens
3. **Cache do Vite**: Se o build falhar com erro de `react-router-dom`, limpe o cache: `rm -rf node_modules/.vite dist && npm run build`
