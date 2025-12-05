#!/bin/bash

# Script pour nettoyer les pages du projet 1 (site public)
# Garde uniquement les pages "home" et "test"

API_URL="http://localhost:8000/api"
PROJECT_ID=1

# Vous devez définir votre token d'authentification
# Récupérez-le depuis votre navigateur (DevTools > Application > Local Storage > auth_token)
AUTH_TOKEN="${AUTH_TOKEN:-}"

if [ -z "$AUTH_TOKEN" ]; then
    echo "❌ AUTH_TOKEN non défini"
    echo "   Définissez-le avec: export AUTH_TOKEN='votre_token'"
    echo "   Ou modifiez la variable dans ce script"
    exit 1
fi

echo "📁 Récupération du projet ID: $PROJECT_ID..."

# Récupérer le projet
PROJECT_RESPONSE=$(curl -s -X GET "$API_URL/projects/$PROJECT_ID/" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json")

PROJECT_NAME=$(echo $PROJECT_RESPONSE | grep -o '"name":"[^"]*' | cut -d'"' -f4)
echo "📁 Projet: $PROJECT_NAME"

# Extraire les pages (format JSON simple)
PAGES=$(echo $PROJECT_RESPONSE | grep -o '"pages":\[[^\]]*\]' | sed 's/"pages"://')

if [ -z "$PAGES" ] || [ "$PAGES" = "[]" ]; then
    echo "✅ Aucune page dans le projet"
    exit 0
fi

echo "📄 Pages trouvées dans le projet"
echo "$PAGES" | grep -o '"page_slug":"[^"]*' | cut -d'"' -f4 | while read slug; do
    echo "   - $slug"
done

echo ""
echo "🗑️  Retrait des pages (sauf 'home' et 'test')..."

# Extraire les IDs des pages à retirer
echo "$PROJECT_RESPONSE" | grep -o '"id":[0-9]*,"project":[0-9]*,"page_slug":"[^"]*' | while read line; do
    PAGE_ID=$(echo $line | grep -o '"id":[0-9]*' | cut -d':' -f2)
    PAGE_SLUG=$(echo $line | grep -o '"page_slug":"[^"]*' | cut -d'"' -f4)
    
    if [ "$PAGE_SLUG" != "home" ] && [ "$PAGE_SLUG" != "test" ]; then
        echo "   🗑️  Retrait de: $PAGE_SLUG (ID: $PAGE_ID)..."
        
        RESPONSE=$(curl -s -X DELETE "$API_URL/projects/$PROJECT_ID/remove_page/" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"page_id\": $PAGE_ID}")
        
        if [ $? -eq 0 ]; then
            echo "      ✅ Page '$PAGE_SLUG' retirée"
        else
            echo "      ❌ Erreur lors du retrait de '$PAGE_SLUG'"
        fi
    else
        echo "   ✅ Conservation de: $PAGE_SLUG"
    fi
done

echo ""
echo "✅ Nettoyage terminé !"

