#!/bin/bash
# Script pour générer la page d'accueil avec des blocs correspondant au design actuel

set -e

echo "🚀 Génération de la page d'accueil avec blocs..."
echo ""

# Exécuter la commande dans le conteneur Django
docker compose exec -T django python manage.py generate_homepage_from_backup

echo ""
echo "✅ Page d'accueil générée !"
echo ""
echo "💡 Pour éditer et publier, allez dans:"
echo "   http://localhost:9494/admin/pages-public/home/edit"
echo ""

