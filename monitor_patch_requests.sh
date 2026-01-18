#!/bin/bash

# Script pour surveiller les requêtes PATCH en temps réel dans les logs backend

echo "🔍 Surveillance des requêtes PATCH vers /api/system-settings/..."
echo "   Appuyez sur Ctrl+C pour arrêter"
echo ""

docker-compose logs -f backend 2>&1 | grep --line-buffered -E "PATCH.*system-settings|auth_header|Authorization|🔐|🔍|🛡️|🌐" | while read line; do
    # Coloriser les lignes selon leur contenu
    if echo "$line" | grep -q "auth_header=present"; then
        echo -e "\033[0;32m✅ $line\033[0m"
    elif echo "$line" | grep -q "auth_header=missing"; then
        echo -e "\033[0;31m❌ $line\033[0m"
    elif echo "$line" | grep -q "Permission denied"; then
        echo -e "\033[0;33m⚠️  $line\033[0m"
    elif echo "$line" | grep -q "403\|Forbidden"; then
        echo -e "\033[0;31m🚫 $line\033[0m"
    elif echo "$line" | grep -q "🔐\|🔍\|🛡️\|🌐"; then
        echo -e "\033[0;34m📋 $line\033[0m"
    else
        echo "$line"
    fi
done

