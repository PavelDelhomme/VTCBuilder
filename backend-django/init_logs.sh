#!/bin/bash
# Script d'initialisation pour créer le répertoire de logs avec les bonnes permissions
# Utilise /tmp/vtcbuilder-logs pour éviter les problèmes de permissions avec les volumes montés

# Créer le répertoire logs s'il n'existe pas
mkdir -p /tmp/vtcbuilder-logs

# Définir les permissions (rwxrwxr-x = 775)
chmod 775 /tmp/vtcbuilder-logs 2>/dev/null || true

# Tester l'écriture
if touch /tmp/vtcbuilder-logs/.test_write 2>/dev/null; then
    rm -f /tmp/vtcbuilder-logs/.test_write
    echo "Répertoire de logs initialisé avec succès: /tmp/vtcbuilder-logs"
else
    echo "ATTENTION: Impossible d'écrire dans /tmp/vtcbuilder-logs (le logging fichier sera désactivé)"
fi

