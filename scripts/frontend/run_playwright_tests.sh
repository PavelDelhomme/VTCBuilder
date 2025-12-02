#!/bin/bash

# Script pour exécuter les tests Playwright dans le conteneur Docker

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Exécution des tests Playwright...${NC}"
echo ""

# Vérifier que le frontend est en cours d'exécution
if ! docker ps | grep -q vtcbuilder-frontend; then
    echo -e "${RED}❌ Le conteneur frontend n'est pas en cours d'exécution${NC}"
    echo -e "${YELLOW}💡 Démarrez le frontend avec: make start${NC}"
    exit 1
fi

# Vérifier que le frontend est accessible
if ! curl -s http://localhost:9494 > /dev/null; then
    echo -e "${RED}❌ Le frontend n'est pas accessible sur http://localhost:9494${NC}"
    exit 1
fi

# Installer Playwright si nécessaire
echo -e "${YELLOW}📦 Vérification de l'installation de Playwright...${NC}"
docker exec vtcbuilder-frontend sh -c "cd /app && if [ ! -d 'node_modules/@playwright' ]; then npm install -D @playwright/test playwright && npx playwright install chromium; fi" 2>&1 | tail -5

# Créer le répertoire pour les rapports
mkdir -p playwright-report

# Exécuter les tests
echo -e "${GREEN}🚀 Lancement des tests Playwright...${NC}"
echo ""

# Utiliser l'IP du conteneur frontend dans le réseau Docker
FRONTEND_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' vtcbuilder-frontend 2>/dev/null || echo "localhost")
docker exec -e PLAYWRIGHT_BASE_URL=http://${FRONTEND_IP}:3000 vtcbuilder-frontend sh -c "cd /app && npx playwright test --reporter=html,json,list --project=chromium" 2>&1

# Récupérer le code de sortie
EXIT_CODE=$?

# Copier les rapports depuis le conteneur
if docker exec vtcbuilder-frontend test -d /app/playwright-report; then
    echo -e "${YELLOW}📋 Copie des rapports...${NC}"
    docker cp vtcbuilder-frontend:/app/playwright-report ./playwright-report 2>/dev/null || true
fi

# Afficher les résultats
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les tests ont réussi !${NC}"
else
    echo -e "${RED}❌ Certains tests ont échoué${NC}"
fi

# Afficher le rapport
if [ -d "playwright-report" ] && [ -f "playwright-report/index.html" ]; then
    echo -e "${BLUE}📊 Rapport HTML disponible dans: playwright-report/index.html${NC}"
    echo -e "${BLUE}💡 Ouvrez le rapport avec: npx playwright show-report playwright-report${NC}"
fi

exit $EXIT_CODE
