#!/bin/bash

# Script d'exécution COMPLÈTE avec diagnostics approfondis
# Exécute TOUS les tests et génère un rapport détaillé

set -e

echo "=========================================="
echo "🔬 TESTS EXHAUSTIFS - AUTH/PATCH/WAF"
echo "=========================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Fichiers de sortie
TEST_LOG="test-results-$(date +%Y%m%d_%H%M%S).log"
REPORT_FILE="test-report-$(date +%Y%m%d_%H%M%S).md"

# Fonction de logging
log() {
    echo -e "$1" | tee -a "$TEST_LOG"
}

log "${BLUE}=== PHASE 1: PRÉ-VÉRIFICATIONS ===${NC}\n"

# 1. Vérifier Docker
log "${BLUE}1.1. Vérification Docker...${NC}"
if ! command -v docker-compose &> /dev/null; then
    log "${RED}❌ docker-compose non trouvé${NC}"
    exit 1
fi
log "${GREEN}✅ docker-compose disponible${NC}\n"

# 2. Vérifier les services
log "${BLUE}1.2. Vérification des services...${NC}"
BACKEND_UP=$(docker-compose ps | grep -c "backend.*Up" || echo "0")
FRONTEND_UP=$(docker-compose ps | grep -c "frontend.*Up" || echo "0")

if [ "$BACKEND_UP" -eq "0" ]; then
    log "${RED}❌ Backend non démarré${NC}"
    log "${YELLOW}💡 Démarrage du backend...${NC}"
    docker-compose up -d backend || {
        log "${RED}❌ Impossible de démarrer le backend${NC}"
        exit 1
    }
    sleep 5
fi

if [ "$FRONTEND_UP" -eq "0" ]; then
    log "${RED}❌ Frontend non démarré${NC}"
    log "${YELLOW}💡 Démarrage du frontend...${NC}"
    docker-compose up -d frontend || {
        log "${RED}❌ Impossible de démarrer le frontend${NC}"
        exit 1
    }
    sleep 5
fi

log "${GREEN}✅ Services démarrés${NC}\n"

# 3. Vérifier la santé des services
log "${BLUE}1.3. Vérification de la santé des services...${NC}"

# Backend
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9495/api/health/ 2>/dev/null || echo "000")
if [ "$BACKEND_HEALTH" != "200" ] && [ "$BACKEND_HEALTH" != "404" ]; then
    log "${YELLOW}⚠️  Backend non accessible (HTTP $BACKEND_HEALTH)${NC}"
else
    log "${GREEN}✅ Backend accessible${NC}"
fi

# Frontend
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9494/ 2>/dev/null || echo "000")
if [ "$FRONTEND_HEALTH" != "200" ]; then
    log "${YELLOW}⚠️  Frontend non accessible (HTTP $FRONTEND_HEALTH)${NC}"
else
    log "${GREEN}✅ Frontend accessible${NC}"
fi

log ""

# 4. Analyser les logs backend récents
log "${BLUE}=== PHASE 2: ANALYSE DES LOGS BACKEND ===${NC}\n"
log "${BLUE}2.1. Dernières requêtes PATCH...${NC}"
PATCH_LOGS=$(docker-compose logs backend --tail 200 2>&1 | grep -E "PATCH.*system-settings" | tail -10 || echo "Aucune")
log "$PATCH_LOGS\n"

log "${BLUE}2.2. Erreurs d'authentification récentes...${NC}"
AUTH_ERRORS=$(docker-compose logs backend --tail 200 2>&1 | grep -E "auth_header=missing|403|401" | tail -10 || echo "Aucune")
log "$AUTH_ERRORS\n"

# 5. Test API direct
log "${BLUE}=== PHASE 3: TESTS API DIRECTS ===${NC}\n"

API_URL="http://localhost:9495/api"
EMAIL="${TEST_EMAIL:-admin@vtcbuilder.com}"
PASSWORD="${TEST_PASSWORD:-admin123}"

log "${BLUE}3.1. Test de login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login/" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}" 2>&1)

if echo "$LOGIN_RESPONSE" | grep -q "access"; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access":"[^"]*' | cut -d'"' -f4)
    log "${GREEN}✅ Login réussi${NC}"
    log "   Token length: ${#TOKEN}\n"
    
    log "${BLUE}3.2. Test PATCH avec token...${NC}"
    PATCH_RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "${API_URL}/system-settings/" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      -d '{"public_pages":{},"public_homepage_blocks":[]}' 2>&1)
    
    HTTP_CODE=$(echo "$PATCH_RESPONSE" | tail -1)
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        log "${GREEN}✅ PATCH réussi (HTTP $HTTP_CODE)${NC}\n"
    else
        log "${RED}❌ PATCH échoué (HTTP $HTTP_CODE)${NC}"
        log "   Réponse: $(echo "$PATCH_RESPONSE" | head -1)\n"
    fi
    
    log "${BLUE}3.3. Test refresh de token...${NC}"
    REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"refresh":"[^"]*' | cut -d'"' -f4)
    REFRESH_RESPONSE=$(curl -s -X POST "${API_URL}/auth/refresh/" \
      -H "Content-Type: application/json" \
      -d "{\"refresh\":\"${REFRESH_TOKEN}\"}" 2>&1)
    
    if echo "$REFRESH_RESPONSE" | grep -q "access"; then
        NEW_TOKEN=$(echo "$REFRESH_RESPONSE" | grep -o '"access":"[^"]*' | cut -d'"' -f4)
        log "${GREEN}✅ Refresh réussi${NC}"
        log "   Nouveau token length: ${#NEW_TOKEN}\n"
        
        log "${BLUE}3.4. Test PATCH avec nouveau token...${NC}"
        PATCH2_RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "${API_URL}/system-settings/" \
          -H "Authorization: Bearer ${NEW_TOKEN}" \
          -H "Content-Type: application/json" \
          -d '{"public_pages":{},"public_homepage_blocks":[]}' 2>&1)
        
        HTTP_CODE2=$(echo "$PATCH2_RESPONSE" | tail -1)
        if [ "$HTTP_CODE2" = "200" ] || [ "$HTTP_CODE2" = "201" ]; then
            log "${GREEN}✅ PATCH avec nouveau token réussi (HTTP $HTTP_CODE2)${NC}\n"
        else
            log "${RED}❌ PATCH avec nouveau token échoué (HTTP $HTTP_CODE2)${NC}\n"
        fi
    else
        log "${RED}❌ Refresh échoué${NC}\n"
    fi
else
    log "${RED}❌ Login échoué${NC}"
    log "   Réponse: $LOGIN_RESPONSE\n"
fi

# 6. Tests Playwright
log "${BLUE}=== PHASE 4: TESTS PLAYWRIGHT ===${NC}\n"

cd frontend

if [ ! -d "node_modules" ]; then
    log "${BLUE}4.1. Installation des dépendances...${NC}"
    npm install --silent
    log "${GREEN}✅ Dépendances installées${NC}\n"
fi

export TEST_EMAIL="${TEST_EMAIL:-admin@vtcbuilder.com}"
export TEST_PASSWORD="${TEST_PASSWORD:-admin123}"
export NEXT_PUBLIC_API_URL="http://localhost:9495/api"
export FRONTEND_URL="http://localhost:9494"

log "${BLUE}4.2. Exécution des tests standards...${NC}"
npx playwright test e2e/auth-patch-waf.spec.ts \
    --reporter=list,json \
    --project=chromium \
    --timeout=120000 \
    > /tmp/playwright-std.log 2>&1 || STD_EXIT=$?

if [ -z "$STD_EXIT" ]; then
    log "${GREEN}✅ Tests standards réussis${NC}\n"
else
    log "${RED}❌ Tests standards échoués (exit code: $STD_EXIT)${NC}\n"
    log "${YELLOW}Dernières lignes du log:${NC}"
    tail -20 /tmp/playwright-std.log | tee -a "$TEST_LOG"
    log ""
fi

log "${BLUE}4.3. Exécution des tests exhaustifs...${NC}"
npx playwright test e2e/auth-patch-waf-comprehensive.spec.ts \
    --reporter=list,json \
    --project=chromium \
    --timeout=180000 \
    > /tmp/playwright-comp.log 2>&1 || COMP_EXIT=$?

if [ -z "$COMP_EXIT" ]; then
    log "${GREEN}✅ Tests exhaustifs réussis${NC}\n"
else
    log "${RED}❌ Tests exhaustifs échoués (exit code: $COMP_EXIT)${NC}\n"
    log "${YELLOW}Dernières lignes du log:${NC}"
    tail -30 /tmp/playwright-comp.log | tee -a "$TEST_LOG"
    log ""
fi

# 7. Génération du rapport
log "${BLUE}=== PHASE 5: GÉNÉRATION DU RAPPORT ===${NC}\n"

cat > "$REPORT_FILE" << EOF
# Rapport de Tests - Authentification / PATCH / WAF

**Date:** $(date)
**Environnement:** $(hostname)

## Résumé

- Tests standards: $([ -z "$STD_EXIT" ] && echo "✅ Réussis" || echo "❌ Échoués")
- Tests exhaustifs: $([ -z "$COMP_EXIT" ] && echo "✅ Réussis" || echo "❌ Échoués")

## Logs Backend

### Dernières requêtes PATCH
\`\`\`
$PATCH_LOGS
\`\`\`

### Erreurs d'authentification
\`\`\`
$AUTH_ERRORS
\`\`\`

## Tests API Directs

- Login: $([ -n "$TOKEN" ] && echo "✅ Réussi" || echo "❌ Échoué")
- PATCH initial: $(echo "$HTTP_CODE" | grep -q "200\|201" && echo "✅ Réussi (HTTP $HTTP_CODE)" || echo "❌ Échoué (HTTP $HTTP_CODE)")
- Refresh: $([ -n "$NEW_TOKEN" ] && echo "✅ Réussi" || echo "❌ Échoué")
- PATCH après refresh: $(echo "$HTTP_CODE2" | grep -q "200\|201" && echo "✅ Réussi (HTTP $HTTP_CODE2)" || echo "❌ Échoué (HTTP $HTTP_CODE2)")

## Logs Complets

Voir le fichier: \`$TEST_LOG\`

## Prochaines Étapes

1. Vérifier les logs backend: \`docker-compose logs backend --tail 100\`
2. Vérifier les logs frontend: \`docker-compose logs frontend --tail 100\`
3. Voir le rapport Playwright: \`cd frontend && npm run test:e2e:report\`
EOF

log "${GREEN}✅ Rapport généré: $REPORT_FILE${NC}\n"

# 8. Résumé final
log "${BLUE}=== RÉSUMÉ FINAL ===${NC}\n"

FAILURES=0
[ -n "$STD_EXIT" ] && FAILURES=$((FAILURES + 1))
[ -n "$COMP_EXIT" ] && FAILURES=$((FAILURES + 1))
[ -z "$TOKEN" ] && FAILURES=$((FAILURES + 1))

if [ "$FAILURES" -eq "0" ]; then
    log "${GREEN}🎉 TOUS LES TESTS SONT PASSÉS!${NC}\n"
    exit 0
else
    log "${RED}⚠️  $FAILURES problème(s) détecté(s)${NC}\n"
    log "${YELLOW}📋 Consultez le rapport: $REPORT_FILE${NC}"
    log "${YELLOW}📋 Consultez les logs: $TEST_LOG${NC}\n"
    exit 1
fi

