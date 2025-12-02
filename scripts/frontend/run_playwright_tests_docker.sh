#!/bin/bash

# Script pour exécuter les tests Playwright dans un conteneur Playwright officiel

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Exécution des tests Playwright avec conteneur officiel...${NC}"
echo ""

# Vérifier que le frontend est accessible
if ! curl -s http://localhost:9494 > /dev/null; then
    echo -e "${RED}❌ Le frontend n'est pas accessible sur http://localhost:9494${NC}"
    echo -e "${YELLOW}💡 Démarrez le frontend avec: make start${NC}"
    exit 1
fi

# Vérifier que le réseau existe
if ! docker network ls | grep -q vtcbuilder_network; then
    echo -e "${YELLOW}⚠️  Le réseau vtcbuilder_network n'existe pas. Création...${NC}"
    docker network create vtcbuilder_network
fi

# Créer le répertoire pour les rapports
mkdir -p playwright-report

# Obtenir l'IP du conteneur frontend dans le réseau Docker
FRONTEND_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' vtcbuilder-frontend 2>/dev/null || echo "")
if [ -z "$FRONTEND_IP" ]; then
    echo -e "${YELLOW}⚠️  Impossible de trouver l'IP du frontend, utilisation de host.docker.internal${NC}"
    FRONTEND_URL="http://host.docker.internal:9494"
else
    FRONTEND_URL="http://${FRONTEND_IP}:3000"
fi

echo -e "${BLUE}📍 URL du frontend: ${FRONTEND_URL}${NC}"

# Exécuter les tests dans un conteneur Playwright officiel
echo -e "${GREEN}🚀 Lancement des tests Playwright...${NC}"
echo ""

docker run --rm \
  --network vtcbuilder_network \
  -v "$(pwd)/frontend:/app" \
  -v "$(pwd)/playwright-report:/app/playwright-report" \
  -w /app \
  -e PLAYWRIGHT_BASE_URL="${FRONTEND_URL}" \
  mcr.microsoft.com/playwright:latest \
  sh -c "npm install && npx playwright install chromium && npx playwright test --reporter=html,json,list --project=chromium"

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
    echo -e "${BLUE}📊 Rapport HTML disponible dans: playwright-report/index.html${NC}"
    echo -e "${BLUE}💡 Ouvrez le rapport avec: npx playwright show-report playwright-report${NC}"
fi

exit $EXIT_CODE

