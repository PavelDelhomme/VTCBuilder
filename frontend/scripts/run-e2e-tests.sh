#!/bin/bash

# Script pour exécuter les tests E2E Playwright
# Usage: ./scripts/run-e2e-tests.sh [options]

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Exécution des tests E2E Playwright${NC}"

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis le répertoire frontend${NC}"
    exit 1
fi

# Vérifier que Playwright est installé
if [ ! -d "node_modules/@playwright" ]; then
    echo -e "${YELLOW}⚠️  Playwright n'est pas installé. Installation...${NC}"
    npm install
fi

# Vérifier que les navigateurs Playwright sont installés
if [ ! -d "node_modules/.cache/playwright" ]; then
    echo -e "${YELLOW}⚠️  Navigateurs Playwright non installés. Installation...${NC}"
    npx playwright install --with-deps
fi

# Options par défaut
MODE="${1:-all}"
BASE_URL="${PLAYWRIGHT_BASE_URL:-http://localhost:9494}"

echo -e "${GREEN}📍 URL de base: ${BASE_URL}${NC}"
echo -e "${GREEN}📋 Mode: ${MODE}${NC}"

case "$MODE" in
    "all")
        echo -e "${GREEN}🚀 Exécution de tous les tests...${NC}"
        PLAYWRIGHT_BASE_URL="$BASE_URL" npm run test:e2e
        ;;
    "waf")
        echo -e "${GREEN}🛡️  Exécution des tests WAF uniquement...${NC}"
        PLAYWRIGHT_BASE_URL="$BASE_URL" npx playwright test e2e/auth/waf-errors.spec.ts
        ;;
    "auth")
        echo -e "${GREEN}🔐 Exécution des tests d'authentification...${NC}"
        PLAYWRIGHT_BASE_URL="$BASE_URL" npx playwright test e2e/auth
        ;;
    "editor")
        echo -e "${GREEN}✏️  Exécution des tests de l'éditeur...${NC}"
        PLAYWRIGHT_BASE_URL="$BASE_URL" npx playwright test e2e/admin/editor-contact.spec.ts
        ;;
    "ui")
        echo -e "${GREEN}🎨 Exécution des tests en mode UI...${NC}"
        PLAYWRIGHT_BASE_URL="$BASE_URL" npm run test:e2e:ui
        ;;
    "headed")
        echo -e "${GREEN}👁️  Exécution des tests en mode headed...${NC}"
        PLAYWRIGHT_BASE_URL="$BASE_URL" npm run test:e2e:headed
        ;;
    "debug")
        echo -e "${GREEN}🐛 Exécution des tests en mode debug...${NC}"
        PLAYWRIGHT_BASE_URL="$BASE_URL" npm run test:e2e:debug
        ;;
    "report")
        echo -e "${GREEN}📊 Affichage du rapport...${NC}"
        npm run test:e2e:report
        ;;
    *)
        echo -e "${RED}❌ Mode inconnu: ${MODE}${NC}"
        echo -e "${YELLOW}Usage: $0 [all|waf|auth|editor|ui|headed|debug|report]${NC}"
        echo ""
        echo "Modes disponibles:"
        echo "  all     - Exécuter tous les tests (défaut)"
        echo "  waf     - Tests WAF uniquement"
        echo "  auth    - Tests d'authentification"
        echo "  editor  - Tests de l'éditeur contact"
        echo "  ui      - Mode UI interactif"
        echo "  headed  - Mode avec navigateur visible"
        echo "  debug   - Mode debug"
        echo "  report  - Afficher le rapport"
        exit 1
        ;;
esac

echo -e "${GREEN}✅ Tests terminés${NC}"

