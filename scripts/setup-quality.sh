#!/bin/bash
# Script d'installation de l'infrastructure de qualité

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}    Installation de l'Infrastructure de Qualité${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Frontend
echo -e "${YELLOW}📦 Installation des dépendances frontend...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
  npm install
else
  echo -e "${GREEN}✅ Dépendances frontend déjà installées${NC}"
fi
cd ..

# Backend
echo -e "${YELLOW}📦 Installation des dépendances backend...${NC}"
if command -v pip &> /dev/null; then
  pip install -r backend-django/requirements.txt || {
    echo -e "${YELLOW}⚠️  Installation backend échouée (peut nécessiter Docker)${NC}"
  }
else
  echo -e "${YELLOW}⚠️  pip non trouvé, installation backend ignorée${NC}"
  echo -e "${BLUE}💡 Les dépendances backend seront installées dans Docker${NC}"
fi

# Pre-commit hooks
echo -e "${YELLOW}🔒 Installation des pre-commit hooks...${NC}"
if command -v pre-commit &> /dev/null; then
  pre-commit install || {
    echo -e "${YELLOW}⚠️  Installation des pre-commit hooks échouée${NC}"
    echo -e "${BLUE}💡 Installez pre-commit: pip install pre-commit${NC}"
  }
else
  echo -e "${YELLOW}⚠️  pre-commit non trouvé${NC}"
  echo -e "${BLUE}💡 Installez pre-commit: pip install pre-commit${NC}"
fi

echo ""
echo -e "${GREEN}✨ Installation terminée !${NC}"
echo ""
echo -e "${BLUE}Commandes principales disponibles:${NC}"
echo -e ""
echo -e "  ${YELLOW}📋 Commandes principales:${NC}"
echo -e "    ${GREEN}make test${NC}              - Tous les tests (frontend + backend)"
echo -e "    ${GREEN}make quality${NC}           - Qualité complète (analyse + tests)"
echo -e "    ${GREEN}make analyze${NC}           - Analyse complète (sans tests)"
echo -e ""
echo -e "  ${YELLOW}🧪 Tests par type:${NC}"
echo -e "    ${GREEN}make test-unit${NC}         - Tests unitaires uniquement"
echo -e "    ${GREEN}make test-integration${NC}   - Tests d'intégration uniquement"
echo -e "    ${GREEN}make test-e2e${NC}          - Tests E2E (Playwright)"
echo -e "    ${GREEN}make test-coverage${NC}     - Tests avec couverture"
echo -e ""
echo -e "  ${YELLOW}🔍 Voir toutes les commandes:${NC}"
echo -e "    ${GREEN}make help${NC}              - Aide complète"
echo -e ""
echo -e "  ${YELLOW}📚 Documentation:${NC}"
echo -e "    ${GREEN}docs/COMMANDES.md${NC}      - Guide complet des commandes"

