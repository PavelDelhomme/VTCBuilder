#!/bin/bash
# Script d'analyse complète pour le frontend

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}    Frontend - Analyse de Code Complète${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Vérification TypeScript
echo -e "${YELLOW}📘 Vérification TypeScript...${NC}"
npm run type-check || {
  echo -e "${RED}❌ Erreurs TypeScript détectées${NC}"
  exit 1
}
echo -e "${GREEN}✅ TypeScript OK${NC}"
echo ""

# Linting ESLint
echo -e "${YELLOW}🔍 Analyse ESLint...${NC}"
npm run lint || {
  echo -e "${RED}❌ Erreurs ESLint détectées${NC}"
  exit 1
}
echo -e "${GREEN}✅ ESLint OK${NC}"
echo ""

# Formatage Prettier (vérification)
echo -e "${YELLOW}🎨 Vérification du formatage Prettier...${NC}"
npx prettier --check "src/**/*.{ts,tsx,js,jsx,json,css}" || {
  echo -e "${YELLOW}⚠️  Fichiers non formatés détectés${NC}"
  echo -e "${BLUE}💡 Exécutez: npm run format${NC}"
}
echo ""

# Tests unitaires
echo -e "${YELLOW}🧪 Exécution des tests unitaires...${NC}"
npm run test -- --passWithNoTests || {
  echo -e "${RED}❌ Tests unitaires échoués${NC}"
  exit 1
}
echo -e "${GREEN}✅ Tests unitaires OK${NC}"
echo ""

echo -e "${GREEN}✨ Analyse complète terminée avec succès !${NC}"

