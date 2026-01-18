#!/bin/bash

# Script de diagnostic pour le problème PATCH /api/system-settings/ 403
# Ce script teste tous les aspects de la requête et génère un rapport complet

set -e

echo "=========================================="
echo "🔍 DIAGNOSTIC COMPLET - PATCH 403 ERROR"
echo "=========================================="
echo ""

# Couleurs pour la sortie
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:9495"
API_URL="${BACKEND_URL}/api"
LOG_FILE="diagnostic_$(date +%Y%m%d_%H%M%S).log"

# Fonction pour logger
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

log "${BLUE}📝 Fichier de log: $LOG_FILE${NC}"
log ""

# 1. Vérifier que le backend est accessible
log "${BLUE}1. Vérification de l'accessibilité du backend...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/" | grep -q "200\|301\|302\|404"; then
    log "${GREEN}✅ Backend accessible${NC}"
else
    log "${RED}❌ Backend non accessible${NC}"
    exit 1
fi
log ""

# 2. Vérifier les logs backend pour les requêtes PATCH
log "${BLUE}2. Vérification des logs backend pour les requêtes PATCH...${NC}"
log "   Recherche des logs avec les emojis de diagnostic..."
log "   (Vérifiez manuellement dans les logs Docker: docker-compose logs backend | grep -E '🌐|🛡️|🔍|🔐|PATCH.*system-settings')"
log ""

# 3. Test de connexion basique
log "${BLUE}3. Test de connexion API basique...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "${API_URL}/system-settings/" -X GET 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    log "${GREEN}✅ GET /api/system-settings/ fonctionne (HTTP $HTTP_CODE)${NC}"
else
    log "${RED}❌ GET /api/system-settings/ échoue (HTTP $HTTP_CODE)${NC}"
    log "   Réponse: $BODY"
fi
log ""

# 4. Test avec token (simulation)
log "${BLUE}4. Test PATCH sans token (devrait retourner 401/403)...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "${API_URL}/system-settings/" \
    -X PATCH \
    -H "Content-Type: application/json" \
    -d '{"test": "value"}' 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

log "   Code HTTP: $HTTP_CODE"
if [ "$HTTP_CODE" = "403" ]; then
    log "${YELLOW}⚠️  PATCH retourne 403 (attendu sans token)${NC}"
    log "   Réponse: $BODY"
elif [ "$HTTP_CODE" = "401" ]; then
    log "${YELLOW}⚠️  PATCH retourne 401 (attendu sans token)${NC}"
    log "   Réponse: $BODY"
else
    log "${RED}❌ Code HTTP inattendu: $HTTP_CODE${NC}"
    log "   Réponse: $BODY"
fi
log ""

# 5. Vérifier les middlewares Django
log "${BLUE}5. Vérification de la configuration des middlewares...${NC}"
if [ -f "backend-django/vtcbuilder/settings.py" ]; then
    log "   Middlewares configurés:"
    grep -n "MIDDLEWARE" backend-django/vtcbuilder/settings.py -A 15 | grep -E "^\s+'" | sed 's/^/      /' | tee -a "$LOG_FILE"
    
    # Vérifier l'ordre des middlewares critiques
    if grep -q "CsrfViewMiddleware" backend-django/vtcbuilder/settings.py; then
        CSRF_POS=$(grep -n "CsrfViewMiddleware" backend-django/vtcbuilder/settings.py | head -1 | cut -d: -f1)
        WAF_POS=$(grep -n "WAFMiddleware" backend-django/vtcbuilder/settings.py | head -1 | cut -d: -f1)
        if [ -n "$WAF_POS" ] && [ "$CSRF_POS" -gt "$WAF_POS" ]; then
            log "${GREEN}✅ WAFMiddleware est avant CsrfViewMiddleware${NC}"
        else
            log "${YELLOW}⚠️  Vérifiez l'ordre des middlewares${NC}"
        fi
    fi
else
    log "${RED}❌ Fichier settings.py non trouvé${NC}"
fi
log ""

# 6. Vérifier que csrf_exempt est bien appliqué
log "${BLUE}6. Vérification de csrf_exempt sur system_settings_view...${NC}"
if [ -f "backend-django/settings_app/views.py" ]; then
    # Chercher @csrf_exempt avant system_settings_view (dans les 5 lignes précédentes)
    CSRF_LINE=$(grep -n "@csrf_exempt" backend-django/settings_app/views.py | head -1 | cut -d: -f1)
    VIEW_LINE=$(grep -n "def system_settings_view" backend-django/settings_app/views.py | head -1 | cut -d: -f1)
    
    if [ -n "$CSRF_LINE" ] && [ -n "$VIEW_LINE" ]; then
        DIFF=$((VIEW_LINE - CSRF_LINE))
        if [ "$DIFF" -gt 0 ] && [ "$DIFF" -le 5 ]; then
            log "${GREEN}✅ @csrf_exempt trouvé sur system_settings_view (ligne $CSRF_LINE, vue ligne $VIEW_LINE)${NC}"
        else
            log "${YELLOW}⚠️  @csrf_exempt trouvé mais peut-être pas sur la bonne fonction (diff: $DIFF lignes)${NC}"
        fi
    else
        log "${RED}❌ @csrf_exempt ou system_settings_view non trouvé${NC}"
    fi
    
    # Vérifier l'import
    if grep -q "from django.views.decorators.csrf import csrf_exempt" backend-django/settings_app/views.py; then
        log "${GREEN}✅ Import csrf_exempt trouvé${NC}"
    else
        log "${RED}❌ Import csrf_exempt manquant${NC}"
    fi
    
    # Afficher les lignes autour de system_settings_view
    log "   Contexte autour de system_settings_view:"
    if [ -n "$VIEW_LINE" ]; then
        sed -n "$((VIEW_LINE - 3)),$((VIEW_LINE + 2))p" backend-django/settings_app/views.py | sed 's/^/      /' | tee -a "$LOG_FILE"
    fi
else
    log "${RED}❌ Fichier views.py non trouvé${NC}"
fi
log ""

# 7. Vérifier les logs de diagnostic dans le code
log "${BLUE}7. Vérification des logs de diagnostic dans le code...${NC}"
LOG_CHECKS=0

# Vérifier CORSAlwaysMiddleware
if grep -q "CORSAlwaysMiddleware.process_request ENTRY" backend-django/vtcbuilder/cors_middleware.py 2>/dev/null; then
    if grep -q "PATCH.*system-settings" backend-django/vtcbuilder/cors_middleware.py 2>/dev/null; then
        log "${GREEN}✅ Log CORSAlwaysMiddleware pour PATCH trouvé${NC}"
        LOG_CHECKS=$((LOG_CHECKS + 1))
    else
        log "${YELLOW}⚠️  Log CORSAlwaysMiddleware trouvé mais pas pour PATCH${NC}"
    fi
else
    log "${YELLOW}⚠️  Log CORSAlwaysMiddleware non trouvé${NC}"
fi

# Vérifier WAFMiddleware
if grep -q "WAFMiddleware.process_request ENTRY" backend-django/security/middleware.py 2>/dev/null; then
    if grep -q "PATCH.*system-settings" backend-django/security/middleware.py 2>/dev/null; then
        log "${GREEN}✅ Log WAFMiddleware pour PATCH trouvé${NC}"
        LOG_CHECKS=$((LOG_CHECKS + 1))
    else
        log "${YELLOW}⚠️  Log WAFMiddleware trouvé mais pas pour PATCH${NC}"
    fi
else
    log "${YELLOW}⚠️  Log WAFMiddleware non trouvé${NC}"
fi

# Vérifier UserStatusMiddleware
if grep -q "Intercepté.*PATCH" backend-django/tenants/middleware.py 2>/dev/null; then
    log "${GREEN}✅ Log UserStatusMiddleware pour PATCH trouvé${NC}"
    LOG_CHECKS=$((LOG_CHECKS + 1))
else
    log "${YELLOW}⚠️  Log UserStatusMiddleware pour PATCH non trouvé${NC}"
fi

# Vérifier IsSuperAdminOrReadOnly
if grep -q "IsSuperAdminOrReadOnly.has_permission ENTRY" backend-django/settings_app/views.py 2>/dev/null; then
    log "${GREEN}✅ Log IsSuperAdminOrReadOnly trouvé${NC}"
    LOG_CHECKS=$((LOG_CHECKS + 1))
else
    log "${YELLOW}⚠️  Log IsSuperAdminOrReadOnly non trouvé${NC}"
fi

log "   Total des logs de diagnostic trouvés: $LOG_CHECKS/4"
log ""

# 8. Vérifier les URLs
log "${BLUE}8. Vérification de la configuration des URLs...${NC}"
if [ -f "backend-django/api/urls.py" ]; then
    if grep -q "system-settings" backend-django/api/urls.py; then
        log "${GREEN}✅ Route system-settings trouvée dans urls.py${NC}"
        grep "system-settings" backend-django/api/urls.py | head -3 | sed 's/^/      /' | tee -a "$LOG_FILE"
    else
        log "${RED}❌ Route system-settings non trouvée${NC}"
    fi
else
    log "${RED}❌ Fichier urls.py non trouvé${NC}"
fi
log ""

# 9. Test avec curl détaillé (simulation d'une requête complète)
log "${BLUE}9. Test PATCH détaillé avec verbose...${NC}"
log "   Exécution: curl -v -X PATCH ${API_URL}/system-settings/ ..."
log ""

VERBOSE_OUTPUT=$(curl -v -X PATCH "${API_URL}/system-settings/" \
    -H "Content-Type: application/json" \
    -H "Origin: http://localhost:9494" \
    -d '{"public_homepage_blocks": []}' \
    2>&1)

HTTP_CODE_VERBOSE=$(echo "$VERBOSE_OUTPUT" | grep -oP '< HTTP/\d\.\d \K\d+' | tail -1 || echo "N/A")

log "   Code HTTP: $HTTP_CODE_VERBOSE"
log "   Headers de réponse:"
echo "$VERBOSE_OUTPUT" | grep -E "^< " | sed 's/^/      /' | tee -a "$LOG_FILE"
log ""

# 10. Vérifier les logs Docker (si disponible)
log "${BLUE}10. Instructions pour vérifier les logs Docker...${NC}"
log "   Pour voir les logs backend en temps réel:"
log "   ${YELLOW}docker-compose logs -f backend | grep -E 'PATCH|system-settings|🌐|🛡️|🔍|🔐'${NC}"
log "   "
log "   Pour voir tous les logs backend:"
log "   ${YELLOW}docker-compose logs backend | tail -100${NC}"
log ""

# 11. Résumé et recommandations
log "${BLUE}=========================================="
log "📊 RÉSUMÉ ET RECOMMANDATIONS"
log "==========================================${NC}"
log ""

if [ "$HTTP_CODE" = "403" ]; then
    log "${YELLOW}⚠️  PROBLÈME IDENTIFIÉ:${NC}"
    log "   Les requêtes PATCH retournent 403 Forbidden"
    log ""
    log "${BLUE}🔧 ACTIONS RECOMMANDÉES:${NC}"
    log "   1. Vérifiez les logs Docker backend pour voir si les requêtes atteignent le serveur"
    log "   2. Si aucun log avec 🌐, 🛡️, 🔍, 🔐 n'apparaît, la requête est bloquée avant Django"
    log "   3. Vérifiez que @csrf_exempt est bien appliqué (voir section 6)"
    log "   4. Vérifiez l'ordre des middlewares (CSRF doit être après WAF)"
    log "   5. Testez avec un token valide:"
    log "      ${YELLOW}curl -X PATCH ${API_URL}/system-settings/ \\"
    log "        -H 'Authorization: Bearer YOUR_TOKEN' \\"
    log "        -H 'Content-Type: application/json' \\"
    log "        -d '{\"public_homepage_blocks\": []}'${NC}"
fi

log ""
log "${GREEN}✅ Diagnostic terminé. Logs sauvegardés dans: $LOG_FILE${NC}"
log ""

