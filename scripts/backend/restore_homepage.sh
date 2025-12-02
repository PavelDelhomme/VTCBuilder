#!/bin/bash
# Script pour restaurer la page d'accueil depuis un backup

set -e

echo "🔄 Restauration de la page d'accueil depuis un backup..."
echo ""

# Afficher les backups disponibles
echo "📦 Backups disponibles:"
docker compose exec -T django python manage.py restore_homepage_backup --list

echo ""
echo "💡 Pour restaurer un backup spécifique:"
echo "   docker compose exec django python manage.py restore_homepage_backup --file <nom_du_fichier>"
echo ""
echo "🔄 Restauration du dernier backup..."
docker compose exec -T django python manage.py restore_homepage_backup

echo ""
echo "✅ Restauration terminée !"
echo ""
echo "💡 Pour éditer la page, allez dans:"
echo "   http://localhost:9494/admin/pages-public/home/edit"
echo ""

