#!/bin/bash
# Script d'analyse complète pour le backend

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}    Backend - Analyse de Code Complète${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Vérification avec flake8
echo -e "${YELLOW}🔍 Analyse Flake8...${NC}"
docker-compose exec -T backend flake8 . --count --statistics || {
  echo -e "${YELLOW}⚠️  Avertissements Flake8 détectés${NC}"
}
echo ""

# Vérification avec pylint (optionnel)
if command -v pylint &> /dev/null || docker-compose exec -T backend which pylint &> /dev/null; then
  echo -e "${YELLOW}🔍 Analyse Pylint...${NC}"
  docker-compose exec -T backend pylint --rcfile=.pylintrc api/ security/ billing/ || {
    echo -e "${YELLOW}⚠️  Avertissements Pylint détectés${NC}"
  }
  echo ""
fi

# Vérification avec mypy (optionnel)
if command -v mypy &> /dev/null || docker-compose exec -T backend which mypy &> /dev/null; then
  echo -e "${YELLOW}📘 Vérification Type Hints (mypy)...${NC}"
  docker-compose exec -T backend mypy api/ security/ billing/ --ignore-missing-imports || {
    echo -e "${YELLOW}⚠️  Avertissements mypy détectés${NC}"
  }
  echo ""
fi

# Formatage Black (vérification)
echo -e "${YELLOW}🎨 Vérification du formatage Black...${NC}"
docker-compose exec -T backend black --check . || {
  echo -e "${YELLOW}⚠️  Fichiers non formatés détectés${NC}"
  echo -e "${BLUE}💡 Exécutez: make format${NC}"
}
echo ""

# Vérification isort
echo -e "${YELLOW}📦 Vérification de l'ordre des imports (isort)...${NC}"
docker-compose exec -T backend isort --check-only . || {
  echo -e "${YELLOW}⚠️  Imports non triés détectés${NC}"
  echo -e "${BLUE}💡 Exécutez: isort .${NC}"
}
echo ""

# Tests unitaires
echo -e "${YELLOW}🧪 Exécution des tests unitaires...${NC}"
docker-compose exec -T backend pytest --verbose --tb=short || {
  echo -e "${RED}❌ Tests unitaires échoués${NC}"
  exit 1
}
echo -e "${GREEN}✅ Tests unitaires OK${NC}"
echo ""

echo -e "${GREEN}✨ Analyse complète terminée avec succès !${NC}"

