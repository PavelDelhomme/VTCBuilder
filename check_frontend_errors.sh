#!/bin/bash

# Script pour vérifier les erreurs frontend et l'état des requêtes PATCH

echo "=========================================="
echo "🔍 VÉRIFICATION DES ERREURS FRONTEND"
echo "=========================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}1. Vérification des erreurs de compilation TypeScript...${NC}"
if [ -d "frontend" ]; then
    cd frontend
    if npm run type-check 2>&1 | grep -q "error"; then
        echo -e "${RED}❌ Erreurs TypeScript détectées${NC}"
        npm run type-check 2>&1 | grep -E "error|Error" | head -10
    else
        echo -e "${GREEN}✅ Aucune erreur TypeScript${NC}"
    fi
    cd ..
else
    echo -e "${YELLOW}⚠️  Dossier frontend non trouvé${NC}"
fi
echo ""

echo -e "${BLUE}2. Vérification des logs backend pour les requêtes PATCH récentes...${NC}"
echo "   (Dernières 50 lignes contenant PATCH ou system-settings)"
echo ""
docker-compose logs backend --tail 200 2>&1 | grep -E "PATCH.*system-settings|auth_header" | tail -20 | while read line; do
    if echo "$line" | grep -q "auth_header=present"; then
        echo -e "${GREEN}✅ $line${NC}"
    elif echo "$line" | grep -q "auth_header=missing"; then
        echo -e "${RED}❌ $line${NC}"
    else
        echo "$line"
    fi
done
echo ""

echo -e "${BLUE}3. Instructions pour surveiller en temps réel:${NC}"
echo -e "   ${YELLOW}./monitor_patch_requests.sh${NC}"
echo "   ou"
echo -e "   ${YELLOW}docker-compose logs -f backend | grep -E 'PATCH|system-settings|auth_header'${NC}"
echo ""

echo -e "${BLUE}4. Test manuel avec curl (si vous avez un token):${NC}"
echo -e "   ${YELLOW}./test_patch_with_token.sh VOTRE_TOKEN${NC}"
echo ""

