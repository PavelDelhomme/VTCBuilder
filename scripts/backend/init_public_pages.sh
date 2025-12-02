#!/bin/bash
# Script pour initialiser toutes les pages publiques du site VTCBuilder

set -e

echo "🚀 Initialisation des pages publiques du site VTCBuilder..."
echo ""

# Exécuter la commande dans le conteneur Django
docker compose exec -T django python manage.py init_public_site_pages

echo ""
echo "✅ Initialisation terminée !"
echo ""
echo "💡 Pour gérer ces pages, allez dans:"
echo "   http://localhost:9494/admin/projects/1"
echo ""

