#!/bin/bash

# Script pour exécuter les tests complets d'authentification, PATCH et WAF

set -e

echo "=========================================="
echo "🧪 TESTS COMPLETS AUTH/PATCH/WAF"
echo "=========================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Vérifier que les services sont démarrés
echo -e "${BLUE}1. Vérification des services...${NC}"
if ! docker-compose ps | grep -q "backend.*Up"; then
    echo -e "${RED}❌ Le backend n'est pas démarré${NC}"
    exit 1
fi

if ! docker-compose ps | grep -q "frontend.*Up"; then
    echo -e "${RED}❌ Le frontend n'est pas démarré${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Services démarrés${NC}"
echo ""

# Vérifier que les variables d'environnement sont définies
echo -e "${BLUE}2. Configuration des variables d'environnement...${NC}"
export TEST_EMAIL=${TEST_EMAIL:-"admin@vtcbuilder.com"}
export TEST_PASSWORD=${TEST_PASSWORD:-"admin123"}
export NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-"http://localhost:9495/api"}
export FRONTEND_URL=${FRONTEND_URL:-"http://localhost:9494"}

echo -e "${GREEN}✅ Variables configurées:${NC}"
echo "   TEST_EMAIL: $TEST_EMAIL"
echo "   NEXT_PUBLIC_API_URL: $NEXT_PUBLIC_API_URL"
echo "   FRONTEND_URL: $FRONTEND_URL"
echo ""

# Aller dans le dossier frontend
cd frontend

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}3. Installation des dépendances...${NC}"
    npm install
    echo -e "${GREEN}✅ Dépendances installées${NC}"
    echo ""
fi

# Exécuter les tests
echo -e "${BLUE}4. Exécution des tests Playwright...${NC}"
echo ""

# Exécuter uniquement les tests d'authentification/PATCH/WAF
npx playwright test e2e/auth-patch-waf.spec.ts \
    --reporter=list,html \
    --output-dir=test-results \
    --project=chromium \
    || {
    echo -e "${RED}❌ Les tests ont échoué${NC}"
    echo ""
    echo -e "${YELLOW}📊 Affichage du rapport...${NC}"
    npx playwright show-report || true
    exit 1
}

echo ""
echo -e "${GREEN}✅ Tous les tests sont passés!${NC}"
echo ""

# Afficher le rapport
echo -e "${BLUE}5. Génération du rapport...${NC}"
npx playwright show-report || true

echo ""
echo -e "${GREEN}=========================================="
echo "✅ TESTS TERMINÉS AVEC SUCCÈS"
echo "==========================================${NC}"

