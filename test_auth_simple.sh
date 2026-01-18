#!/bin/bash

# Test simple et rapide pour vérifier l'authentification et PATCH

echo "🧪 TEST SIMPLE - AUTH/PATCH"
echo "============================"
echo ""

API_URL="http://localhost:9495/api"
EMAIL="admin@vtcbuilder.com"
PASSWORD="admin123"

# 1. Clear WAF
echo "1. Nettoyage du cache WAF..."
docker-compose exec -T backend python manage.py clear_waf_rate_limit --all 2>/dev/null || echo "   (WAF déjà nettoyé)"
echo ""

# 2. Login
echo "2. Test de login..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login/" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

if echo "$LOGIN_RESPONSE" | grep -q "access"; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access":"[^"]*' | cut -d'"' -f4)
    REFRESH=$(echo "$LOGIN_RESPONSE" | grep -o '"refresh":"[^"]*' | cut -d'"' -f4)
    echo "   ✅ Login réussi"
    echo "   Token: ${TOKEN:0:50}..."
    echo ""
    
    # 3. PATCH
    echo "3. Test PATCH avec token..."
    PATCH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X PATCH "${API_URL}/system-settings/" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      -d '{"public_pages":{},"public_homepage_blocks":[]}')
    
    HTTP_CODE=$(echo "$PATCH_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        echo "   ✅ PATCH réussi (HTTP $HTTP_CODE)"
    else
        echo "   ❌ PATCH échoué (HTTP $HTTP_CODE)"
        echo "   Réponse: $(echo "$PATCH_RESPONSE" | head -1)"
    fi
    echo ""
    
    # 4. Refresh
    echo "4. Test refresh de token..."
    REFRESH_RESPONSE=$(curl -s -X POST "${API_URL}/auth/refresh/" \
      -H "Content-Type: application/json" \
      -d "{\"refresh\":\"${REFRESH}\"}")
    
    if echo "$REFRESH_RESPONSE" | grep -q "access"; then
        NEW_TOKEN=$(echo "$REFRESH_RESPONSE" | grep -o '"access":"[^"]*' | cut -d'"' -f4)
        echo "   ✅ Refresh réussi"
        echo "   Nouveau token: ${NEW_TOKEN:0:50}..."
        echo ""
        
        # 5. PATCH avec nouveau token
        echo "5. Test PATCH avec nouveau token..."
        PATCH2_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X PATCH "${API_URL}/system-settings/" \
          -H "Authorization: Bearer ${NEW_TOKEN}" \
          -H "Content-Type: application/json" \
          -d '{"public_pages":{},"public_homepage_blocks":[]}')
        
        HTTP_CODE2=$(echo "$PATCH2_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
        if [ "$HTTP_CODE2" = "200" ] || [ "$HTTP_CODE2" = "201" ]; then
            echo "   ✅ PATCH avec nouveau token réussi (HTTP $HTTP_CODE2)"
            echo ""
            echo "🎉 TOUS LES TESTS SONT PASSÉS!"
            exit 0
        else
            echo "   ❌ PATCH avec nouveau token échoué (HTTP $HTTP_CODE2)"
            exit 1
        fi
    else
        echo "   ❌ Refresh échoué"
        exit 1
    fi
else
    echo "   ❌ Login échoué"
    echo "   Réponse: $LOGIN_RESPONSE"
    exit 1
fi

