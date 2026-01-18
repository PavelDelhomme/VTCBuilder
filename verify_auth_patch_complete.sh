#!/bin/bash

# Script de vérification complète de l'authentification, PATCH et WAF
# Vérifie les logs backend, les requêtes, et exécute les tests Playwright

set -e

echo "=========================================="
echo "🔍 VÉRIFICATION COMPLÈTE AUTH/PATCH/WAF"
echo "=========================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Vérifier les services
echo -e "${BLUE}1. Vérification des services Docker...${NC}"
if ! docker-compose ps | grep -q "backend.*Up"; then
    echo -e "${RED}❌ Backend non démarré${NC}"
    exit 1
fi
if ! docker-compose ps | grep -q "frontend.*Up"; then
    echo -e "${RED}❌ Frontend non démarré${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Services démarrés${NC}"
echo ""

# 2. Vérifier les logs backend récents pour les erreurs PATCH
echo -e "${BLUE}2. Analyse des logs backend (dernières 100 lignes)...${NC}"
docker-compose logs backend --tail 100 | grep -E "PATCH.*system-settings|auth_header|403|401" | tail -20 || echo "Aucun log PATCH récent"
echo ""

# 3. Test API direct avec curl
echo -e "${BLUE}3. Test API direct (login + PATCH)...${NC}"
API_URL="http://localhost:9495/api"
EMAIL="${TEST_EMAIL:-admin@vtcbuilder.com}"
PASSWORD="${TEST_PASSWORD:-admin123}"

# Login
echo "   Connexion..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login/" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}" || echo "ERROR")

if echo "$LOGIN_RESPONSE" | grep -q "access"; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}   ✅ Login réussi${NC}"
    
    # Test PATCH
    echo "   Test PATCH..."
    PATCH_RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "${API_URL}/system-settings/" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      -d '{"public_pages":{},"public_homepage_blocks":[]}' || echo "ERROR")
    
    HTTP_CODE=$(echo "$PATCH_RESPONSE" | tail -1)
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        echo -e "${GREEN}   ✅ PATCH réussi (HTTP ${HTTP_CODE})${NC}"
    elif [ "$HTTP_CODE" = "403" ]; then
        echo -e "${RED}   ❌ PATCH échoué avec 403 (Forbidden)${NC}"
    elif [ "$HTTP_CODE" = "401" ]; then
        echo -e "${RED}   ❌ PATCH échoué avec 401 (Unauthorized)${NC}"
    else
        echo -e "${YELLOW}   ⚠️  PATCH retourné HTTP ${HTTP_CODE}${NC}"
    fi
else
    echo -e "${RED}   ❌ Login échoué${NC}"
fi
echo ""

# 4. Exécuter les tests Playwright
echo -e "${BLUE}4. Exécution des tests Playwright...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    echo "   Installation des dépendances..."
    npm install --silent
fi

export TEST_EMAIL="${TEST_EMAIL:-admin@vtcbuilder.com}"
export TEST_PASSWORD="${TEST_PASSWORD:-admin123}"
export NEXT_PUBLIC_API_URL="http://localhost:9495/api"
export FRONTEND_URL="http://localhost:9494"

npx playwright test e2e/auth-patch-waf.spec.ts \
    --reporter=list \
    --project=chromium \
    --timeout=120000 \
    || {
    echo -e "${RED}❌ Tests Playwright échoués${NC}"
    exit 1
}

echo -e "${GREEN}✅ Tests Playwright réussis${NC}"
echo ""

# 5. Vérification finale des logs
echo -e "${BLUE}5. Vérification finale des logs backend...${NC}"
echo "   Recherche des requêtes PATCH récentes avec auth_header..."
docker-compose logs backend --tail 200 | grep -E "PATCH.*system-settings" | tail -10 || echo "   Aucune requête PATCH récente"

echo ""
echo -e "${GREEN}=========================================="
echo "✅ VÉRIFICATION COMPLÈTE TERMINÉE"
echo "==========================================${NC}"

