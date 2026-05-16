#!/bin/bash
# ============================================================
# LUFIT OS — Script de Deploy Manual para Railway
# ============================================================
# Uso: ./scripts/deploy.sh
#
# Você precisa:
# 1. Gerar um novo token no Railway:
#    https://railway.app/account/tokens
# 2. Configurar o token:
#    export RAILWAY_TOKEN="seu-token-aqui"
# 3. Rodar este script
# ============================================================

set -e

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ID="350d9bef-e92b-4fbd-a3e9-7e26bc24a462"
SERVICE_ID="3878e309-8d6e-4b17-af6a-b78c730412ec"
ENV_ID="d06fd2b5-7caa-41fe-bcaf-b7ba68d515ac"

echo -e "${BLUE}"
echo "============================================================"
echo "  LUFIT OS — Deploy para Railway"
echo "============================================================"
echo -e "${NC}"

# Verificar token
if [ -z "$RAILWAY_TOKEN" ]; then
    echo -e "${RED}❌ ERRO: RAILWAY_TOKEN não configurado${NC}"
    echo ""
    echo "Para configurar, execute:"
    echo "  export RAILWAY_TOKEN=\"seu-token-aqui\""
    echo ""
    echo "Ou crie um arquivo .env na raiz com:"
    echo "  RAILWAY_TOKEN=seu-token-aqui"
    echo ""
    echo "Obtenha seu token em: https://railway.app/account/tokens"
    exit 1
fi

echo -e "${BLUE}🚀 Iniciando deploy do LUFIT OS...${NC}"
echo ""

# Build
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
npm ci

echo -e "${YELLOW}🔨 Compilando projeto...${NC}"
npm run build

# Deploy usando Railway CLI
echo -e "${YELLOW}☁️  Fazendo deploy no Railway...${NC}"
npx @railway/cli up \
    --project "$PROJECT_ID" \
    --service "$SERVICE_ID" \
    --environment "$ENV_ID"

echo ""
echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo ""
echo -e "${BLUE}🔗 URLs:${NC}"
echo "  Site:     https://lufit-os-production-23e6.up.railway.app"
echo "  Admin:    https://lufit-os-production-23e6.up.railway.app/#/admin"
echo "  PDV:      https://lufit-os-production-23e6.up.railway.app/#/pdv"
echo "  Health:   https://lufit-os-production-23e6.up.railway.app/api/health"
echo ""
