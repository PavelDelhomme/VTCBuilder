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

# Vérifier que le backend est accessible
if ! curl -s http://localhost:9495/api/ > /dev/null; then
    echo -e "${YELLOW}⚠️  Le backend n'est pas accessible sur http://localhost:9495${NC}"
    echo -e "${YELLOW}💡 Attente de 5 secondes pour que le backend démarre...${NC}"
    sleep 5
    if ! curl -s http://localhost:9495/api/ > /dev/null; then
        echo -e "${RED}❌ Le backend n'est toujours pas accessible${NC}"
        exit 1
    fi
fi

# Arrêter le conteneur Playwright s'il existe déjà
if docker ps -a | grep -q vtcbuilder-playwright; then
    echo -e "${YELLOW}🛑 Arrêt du conteneur Playwright existant...${NC}"
    docker stop vtcbuilder-playwright 2>/dev/null || true
    docker rm vtcbuilder-playwright 2>/dev/null || true
fi

# Créer le répertoire pour les rapports
mkdir -p playwright-report

# Exécuter les tests dans un conteneur Playwright dédié
echo -e "${GREEN}🚀 Lancement des tests Playwright dans un conteneur dédié...${NC}"
echo ""

docker-compose -f docker-compose.playwright.yml up --build --abort-on-container-exit

# Récupérer le code de sortie
EXIT_CODE=$?

# Copier les rapports depuis le conteneur
if docker exec vtcbuilder-playwright test -d /app/playwright-report 2>/dev/null; then
    echo -e "${YELLOW}📋 Copie des rapports...${NC}"
    docker cp vtcbuilder-playwright:/app/playwright-report ./playwright-report 2>/dev/null || true
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
