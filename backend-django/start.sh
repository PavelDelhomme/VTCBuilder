#!/bin/bash

# Script de démarrage pour VTCBuilder Django
# Ce script évite les problèmes de timing avec PostgreSQL

set -e

echo "🚀 Démarrage de VTCBuilder Django..."

# Créer le réseau Docker s'il n'existe pas
echo "🔧 Vérification du réseau Docker..."
if ! docker network ls | grep -q "vtcbuilder_network"; then
    echo "   📦 Création du réseau vtcbuilder_network..."
    docker network create vtcbuilder_network || {
        echo "⚠️  Le réseau existe peut-être déjà, on continue..."
    }
else
    echo "   ✅ Le réseau vtcbuilder_network existe déjà"
fi

# Fonction pour attendre qu'un service soit prêt
wait_for_service() {
    local service=$1
    local max_attempts=30
    local attempt=1

    echo "⏳ Attente du démarrage de $service..."

    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f ../docker-compose.simple.yml ps $service | grep -q "Up"; then
            echo "✅ $service est démarré !"
            return 0
        fi

        echo "  Tentative $attempt/$max_attempts..."
        sleep 2
        ((attempt++))
    done

    echo "❌ $service n'a pas démarré après $max_attempts tentatives"
    exit 1
}

# Démarrer les services de base
echo "🔧 Démarrage de PostgreSQL et Redis..."
docker-compose -f ../docker-compose.simple.yml up -d postgres redis

# Attendre PostgreSQL
wait_for_service postgres

# Attendre Redis
wait_for_service redis

# Démarrer le backend Django
echo "🔧 Démarrage du backend Django..."
docker-compose -f ../docker-compose.simple.yml up -d backend

# Attendre que Django soit prêt
sleep 10

# Exécuter les migrations automatiquement
echo "🗄️  Exécution des migrations Django..."
# Migrer le schéma public d'abord (pour les modèles partagés)
echo "   📦 Migration du schéma public (shared)..."
docker-compose -f ../docker-compose.simple.yml exec -T backend python manage.py migrate_schemas --shared --noinput || {
    echo "⚠️  Erreur lors des migrations shared, mais on continue..."
}

# Migrer tous les schémas des tenants existants
echo "   📦 Migration des schémas des tenants..."
docker-compose -f ../docker-compose.simple.yml exec -T backend python manage.py migrate_all_tenant_schemas || {
    echo "⚠️  Erreur lors des migrations tenants, mais on continue..."
}

# Créer le super admin s'il n'existe pas
echo "👤 Vérification du super admin..."
docker-compose -f ../docker-compose.simple.yml exec -T backend python manage.py shell -c "
from tenants.models import User
from django.contrib.auth import get_user_model
User = get_user_model()

user, created = User.objects.get_or_create(
    email='admin@vtcbuilder.com',
    defaults={
        'is_superuser': True,
        'is_staff': True,
    }
)
user.set_password('admin123')
user.is_superuser = True
user.is_staff = True
user.role = 'super-admin'
user.status = 'active'
user.save()
if created:
    print('✅ Super admin créé')
else:
    print('✅ Super admin mis à jour')
" || echo "⚠️  Erreur lors de la création du super admin"

# Démarrer le frontend
echo "🔧 Démarrage du frontend..."
docker-compose -f ../docker-compose.simple.yml up -d frontend

# Démarrer PgAdmin
echo "🔧 Démarrage de PgAdmin..."
docker-compose -f ../docker-compose.simple.yml up -d pgadmin

echo ""
echo "🎉 VTCBuilder Django est démarré !"
echo ""
echo "📍 URLs d'accès :"
echo "   Frontend:     http://localhost:9494"
echo "   API Django:   http://localhost:9495/api/"
echo "   Admin:        http://localhost:9495/admin/"
echo "   PgAdmin:      http://localhost:9498"
echo "   PostgreSQL:   localhost:9496"
echo "   Redis:        localhost:9497"
echo ""
echo "🔐 Comptes de test :"
echo "   Super Admin: admin@vtcbuilder.com / admin123"
echo "   Demo Tenant: admin@demo-vtc-company.com / admin123"
echo ""
echo "💡 Utilisez 'make logs' pour voir les logs"
echo "💡 Utilisez 'make stop' pour arrêter tous les services"
