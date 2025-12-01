#!/bin/bash

# Script to restore the original public pages from backup

BACKUP_DIR="backups/public-pages"
FRONTEND_DIR="frontend/src/app"

echo "🔄 Restauration des pages publiques depuis le backup..."

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Le répertoire de backup n'existe pas : $BACKUP_DIR"
    exit 1
fi

# Restore homepage
if [ -f "$BACKUP_DIR/page.tsx.backup" ]; then
    cp "$BACKUP_DIR/page.tsx.backup" "$FRONTEND_DIR/page.tsx"
    echo "✅ Page d'accueil restaurée"
else
    echo "⚠️  Backup de la page d'accueil non trouvé"
fi

# Restore docs page
if [ -f "$BACKUP_DIR/docs-page.tsx.backup" ]; then
    mkdir -p "$FRONTEND_DIR/docs"
    cp "$BACKUP_DIR/docs-page.tsx.backup" "$FRONTEND_DIR/docs/page.tsx"
    echo "✅ Page documentation restaurée"
else
    echo "⚠️  Backup de la page documentation non trouvé"
fi

# Restore contact page
if [ -f "$BACKUP_DIR/contact-page.tsx.backup" ]; then
    mkdir -p "$FRONTEND_DIR/contact"
    cp "$BACKUP_DIR/contact-page.tsx.backup" "$FRONTEND_DIR/contact/page.tsx"
    echo "✅ Page contact restaurée"
else
    echo "⚠️  Backup de la page contact non trouvé"
fi

# Restore FAQ page
if [ -f "$BACKUP_DIR/faq-page.tsx.backup" ]; then
    mkdir -p "$FRONTEND_DIR/faq"
    cp "$BACKUP_DIR/faq-page.tsx.backup" "$FRONTEND_DIR/faq/page.tsx"
    echo "✅ Page FAQ restaurée"
else
    echo "⚠️  Backup de la page FAQ non trouvé"
fi

echo "✅ Restauration terminée !"
echo "📝 Les pages publiques ont été restaurées depuis le backup."
echo "💡 Pour revenir à la version avec l'éditeur, utilisez : make generate-public-pages"

