#!/bin/bash
# Script pour exécuter tous les tests (frontend + backend)

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}    Exécution de Tous les Tests${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

ERRORS=0

# Frontend Tests
echo -e "${YELLOW}🧪 Tests Frontend...${NC}"
cd frontend
if npm test -- --passWithNoTests --silent; then
  echo -e "${GREEN}✅ Tests frontend OK${NC}"
else
  echo -e "${RED}❌ Tests frontend échoués${NC}"
  ERRORS=$((ERRORS + 1))
fi
cd ..
echo ""

# Backend Tests
echo -e "${YELLOW}🧪 Tests Backend...${NC}"
if docker-compose ps backend 2>&1 | grep -q "Up"; then
  if docker-compose exec -T backend pytest --verbose --tb=short -q; then
    echo -e "${GREEN}✅ Tests backend OK${NC}"
  else
    echo -e "${RED}❌ Tests backend échoués${NC}"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo -e "${YELLOW}⚠️  Backend non disponible (Docker)${NC}"
  echo -e "${BLUE}💡 Démarrez les services: docker-compose up -d${NC}"
fi
echo ""

# Résumé
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✨ Tous les tests sont passés !${NC}"
  exit 0
else
  echo -e "${RED}❌ $ERRORS erreur(s) détectée(s)${NC}"
  exit 1
fi

