#!/bin/bash

# Script to restore the original public pages from backup

BACKUP_DIR="backups/public-pages"
BACKUP_COMPLETE_DIR="backups/public-pages-complete"
FRONTEND_DIR="frontend/src/app"

echo "🔄 Restauration des pages publiques depuis le backup..."

# Use complete backup if available, otherwise use regular backup
if [ -d "$BACKUP_COMPLETE_DIR" ] && [ "$(ls -A $BACKUP_COMPLETE_DIR 2>/dev/null)" ]; then
    BACKUP_SOURCE="$BACKUP_COMPLETE_DIR"
    echo "📦 Utilisation du backup complet..."
else
    BACKUP_SOURCE="$BACKUP_DIR"
    echo "📦 Utilisation du backup standard..."
fi

# Check if backup directory exists
if [ ! -d "$BACKUP_SOURCE" ]; then
    echo "❌ Le répertoire de backup n'existe pas : $BACKUP_SOURCE"
    exit 1
fi

# Restore homepage
if [ -f "$BACKUP_SOURCE/page.tsx" ] || [ -f "$BACKUP_SOURCE/page.tsx.backup" ]; then
    SOURCE_FILE="$BACKUP_SOURCE/page.tsx"
    [ ! -f "$SOURCE_FILE" ] && SOURCE_FILE="$BACKUP_SOURCE/page.tsx.backup"
    cp "$SOURCE_FILE" "$FRONTEND_DIR/page.tsx"
    echo "✅ Page d'accueil restaurée"
else
    echo "⚠️  Backup de la page d'accueil non trouvé"
fi

# Restore docs page
if [ -f "$BACKUP_SOURCE/docs-page.tsx" ] || [ -f "$BACKUP_SOURCE/docs-page.tsx.backup" ]; then
    SOURCE_FILE="$BACKUP_SOURCE/docs-page.tsx"
    [ ! -f "$SOURCE_FILE" ] && SOURCE_FILE="$BACKUP_SOURCE/docs-page.tsx.backup"
    mkdir -p "$FRONTEND_DIR/docs"
    cp "$SOURCE_FILE" "$FRONTEND_DIR/docs/page.tsx"
    echo "✅ Page documentation restaurée"
else
    echo "⚠️  Backup de la page documentation non trouvé"
fi

# Restore contact page
if [ -f "$BACKUP_SOURCE/contact-page.tsx" ] || [ -f "$BACKUP_SOURCE/contact-page.tsx.backup" ]; then
    SOURCE_FILE="$BACKUP_SOURCE/contact-page.tsx"
    [ ! -f "$SOURCE_FILE" ] && SOURCE_FILE="$BACKUP_SOURCE/contact-page.tsx.backup"
    mkdir -p "$FRONTEND_DIR/contact"
    cp "$SOURCE_FILE" "$FRONTEND_DIR/contact/page.tsx"
    echo "✅ Page contact restaurée"
else
    echo "⚠️  Backup de la page contact non trouvé"
fi

# Restore FAQ page
if [ -f "$BACKUP_SOURCE/faq-page.tsx" ] || [ -f "$BACKUP_SOURCE/faq-page.tsx.backup" ]; then
    SOURCE_FILE="$BACKUP_SOURCE/faq-page.tsx"
    [ ! -f "$SOURCE_FILE" ] && SOURCE_FILE="$BACKUP_SOURCE/faq-page.tsx.backup"
    mkdir -p "$FRONTEND_DIR/faq"
    cp "$SOURCE_FILE" "$FRONTEND_DIR/faq/page.tsx"
    echo "✅ Page FAQ restaurée"
else
    echo "⚠️  Backup de la page FAQ non trouvé"
fi

# Restore register page (if exists in complete backup)
if [ -f "$BACKUP_SOURCE/register-page.tsx" ]; then
    mkdir -p "$FRONTEND_DIR/register"
    cp "$BACKUP_SOURCE/register-page.tsx" "$FRONTEND_DIR/register/page.tsx"
    echo "✅ Page inscription restaurée"
fi

# Restore features page (if exists in complete backup)
if [ -f "$BACKUP_SOURCE/features-page.tsx" ]; then
    mkdir -p "$FRONTEND_DIR/features"
    cp "$BACKUP_SOURCE/features-page.tsx" "$FRONTEND_DIR/features/page.tsx"
    echo "✅ Page fonctionnalités restaurée"
fi

# Restore templates page (if exists in complete backup)
if [ -f "$BACKUP_SOURCE/templates-page.tsx" ]; then
    mkdir -p "$FRONTEND_DIR/templates"
    cp "$BACKUP_SOURCE/templates-page.tsx" "$FRONTEND_DIR/templates/page.tsx"
    echo "✅ Page templates restaurée"
fi

# Restore legal pages (if exists in complete backup)
if [ -f "$BACKUP_SOURCE/legal-privacy-page.tsx" ]; then
    mkdir -p "$FRONTEND_DIR/legal/privacy"
    cp "$BACKUP_SOURCE/legal-privacy-page.tsx" "$FRONTEND_DIR/legal/privacy/page.tsx"
    echo "✅ Page politique de confidentialité restaurée"
fi

if [ -f "$BACKUP_SOURCE/legal-terms-page.tsx" ]; then
    mkdir -p "$FRONTEND_DIR/legal/terms"
    cp "$BACKUP_SOURCE/legal-terms-page.tsx" "$FRONTEND_DIR/legal/terms/page.tsx"
    echo "✅ Page conditions générales restaurée"
fi

# Reset SystemSettings to remove generated blocks
echo "🔄 Réinitialisation des SystemSettings..."
docker exec vtcbuilder-backend python manage.py shell -c "from settings_app.models import SystemSettings; s = SystemSettings.objects.get(id=1); s.public_homepage_blocks = []; s.public_homepage_status = 'draft'; s.public_pages = {}; s.save(); print('✅ SystemSettings réinitialisé')" 2>/dev/null || echo "⚠️  Impossible de réinitialiser SystemSettings (backend non accessible)"

echo ""
echo "✅ Restauration terminée !"
echo "📝 Toutes les pages publiques ont été restaurées depuis le backup."
echo "💡 Pour revenir à la version avec l'éditeur, utilisez : make generate-public-pages"

