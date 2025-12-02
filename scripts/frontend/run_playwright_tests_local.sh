#!/bin/bash

# Script pour exécuter les tests Playwright localement (depuis l'hôte)

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Exécution des tests Playwright...${NC}"
echo ""

# Vérifier que le frontend est accessible
if ! curl -s http://localhost:9494 > /dev/null; then
    echo -e "${RED}❌ Le frontend n'est pas accessible sur http://localhost:9494${NC}"
    echo -e "${YELLOW}💡 Démarrez le frontend avec: make start${NC}"
    exit 1
fi

# Aller dans le répertoire frontend
cd "$(dirname "$0")/../../frontend" || exit 1

# Vérifier que Playwright est installé
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx n'est pas installé${NC}"
    exit 1
fi

# Installer Playwright si nécessaire
if [ ! -d "node_modules/@playwright" ]; then
    echo -e "${YELLOW}📦 Installation de Playwright...${NC}"
    npm install -D @playwright/test playwright
    npx playwright install chromium
fi

# Exécuter les tests
echo -e "${GREEN}🚀 Lancement des tests Playwright...${NC}"
echo ""

# Exécuter les tests avec rapport HTML
npx playwright test --reporter=html,json,list --project=chromium

# Récupérer le code de sortie
EXIT_CODE=$?

# Afficher les résultats
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les tests ont réussi !${NC}"
else
    echo -e "${RED}❌ Certains tests ont échoué${NC}"
fi

# Afficher le rapport
if [ -d "playwright-report" ] && [ -f "playwright-report/index.html" ]; then
    echo -e "${BLUE}📊 Rapport HTML disponible dans: frontend/playwright-report/index.html${NC}"
    echo -e "${BLUE}💡 Ouvrez le rapport avec: cd frontend && npx playwright show-report${NC}"
fi

exit $EXIT_CODE

