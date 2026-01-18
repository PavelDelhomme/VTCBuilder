#!/bin/bash

# Script pour tester PATCH /api/system-settings/ avec un token valide
# Usage: ./test_patch_with_token.sh [TOKEN]

set -e

API_URL="http://localhost:9495/api"

if [ -z "$1" ]; then
    echo "❌ Usage: $0 <TOKEN>"
    echo "   Pour obtenir un token, connectez-vous via l'interface web et récupérez-le depuis localStorage"
    echo "   ou utilisez: curl -X POST http://localhost:9495/api/auth/login/ -d '{\"email\":\"...\",\"password\":\"...\"}'"
    exit 1
fi

TOKEN="$1"

echo "🔍 Test PATCH /api/system-settings/ avec token..."
echo ""

# Test avec token
RESPONSE=$(curl -s -w "\n%{http_code}" "${API_URL}/system-settings/" \
    -X PATCH \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -H "Origin: http://localhost:9494" \
    -d '{"public_homepage_blocks": []}' 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "Code HTTP: $HTTP_CODE"
echo "Réponse:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "✅ SUCCÈS - La requête PATCH fonctionne avec le token !"
    exit 0
elif [ "$HTTP_CODE" = "403" ]; then
    echo "❌ ERREUR 403 - Permission refusée"
    echo "   Vérifiez que l'utilisateur est super admin"
    exit 1
elif [ "$HTTP_CODE" = "401" ]; then
    echo "❌ ERREUR 401 - Token invalide ou expiré"
    exit 1
else
    echo "❌ ERREUR - Code HTTP inattendu: $HTTP_CODE"
    exit 1
fi

