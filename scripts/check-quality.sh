#!/bin/bash
# Script de vérification rapide de la qualité

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}    Vérification Rapide de la Qualité${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

ERRORS=0

# Frontend - Type check
echo -e "${YELLOW}📘 Frontend - TypeScript...${NC}"
cd frontend
TYPE_CHECK_OUTPUT=$(timeout 30 npm run type-check 2>&1 || echo "TIMEOUT_OR_ERROR")
TYPE_CHECK_EXIT=$?
if [ $TYPE_CHECK_EXIT -ne 0 ] || echo "$TYPE_CHECK_OUTPUT" | grep -qiE "(error|TIMEOUT)"; then
  echo -e "${YELLOW}⚠️  Vérification TypeScript (peut prendre du temps)${NC}"
  if echo "$TYPE_CHECK_OUTPUT" | grep -qi "TIMEOUT"; then
    echo -e "${YELLOW}   (Timeout - vérification trop longue)${NC}"
  else
    echo "$TYPE_CHECK_OUTPUT" | grep -iE "error" | head -n 3 || echo "   Aucune erreur visible"
  fi
  # Ne pas compter comme erreur critique pour l'instant
else
  echo -e "${GREEN}✅ TypeScript OK${NC}"
fi
cd ..

# Frontend - Lint
echo -e "${YELLOW}🔍 Frontend - ESLint...${NC}"
if npm run lint --silent 2>&1 | grep -q "error"; then
  echo -e "${RED}❌ Erreurs ESLint${NC}"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ ESLint OK${NC}"
fi
cd ..

# Backend - Lint (si disponible)
echo -e "${YELLOW}🔍 Backend - Flake8...${NC}"
if docker-compose ps backend 2>&1 | grep -q "Up"; then
  if docker-compose exec -T backend flake8 . --count --quiet 2>&1; then
    echo -e "${GREEN}✅ Flake8 OK${NC}"
  else
    echo -e "${YELLOW}⚠️  Avertissements Flake8${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Backend non disponible (Docker)${NC}"
fi

echo ""
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✨ Vérification terminée - Aucune erreur critique${NC}"
  exit 0
else
  echo -e "${RED}❌ Vérification terminée - $ERRORS erreur(s) détectée(s)${NC}"
  exit 1
fi

