#!/usr/bin/env python
"""
Script pour créer les domaines et migrer les schémas pour tous les tenants de test
"""
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vtcbuilder.settings')
django.setup()

from tenants.models import Tenant, Domain, User
from django.core.management import call_command
from django.contrib.auth.hashers import make_password

def setup_test_tenants():
    """Créer les domaines et migrer les schémas pour tous les tenants"""
    
    print("🏢 Configuration des tenants de test...\n")
    
    tenants = Tenant.objects.all()
    
    for tenant in tenants:
        print(f"📦 Tenant: {tenant.name} ({tenant.slug})")
        
        # Créer le domaine
        domain_name = f'{tenant.slug}.localhost'
        domain, created = Domain.objects.get_or_create(
            tenant=tenant,
            domain=domain_name,
            defaults={'is_primary': True}
        )
        if created:
            print(f"   ✅ Domaine créé: {domain_name}")
        else:
            print(f"   ℹ️  Domaine existe déjà: {domain_name}")
        
        # Migrer le schéma du tenant
        try:
            call_command('migrate_schemas', schema_name=tenant.schema_name, verbosity=0, interactive=False)
            print(f"   ✅ Schéma migré: {tenant.schema_name}")
        except Exception as e:
            print(f"   ⚠️  Erreur migration schéma: {e}")
        
        # Vérifier/créer l'utilisateur admin si nécessaire
        if tenant.slug.startswith('test-'):
            email = f'test-{tenant.slug.replace("test-", "")}@vtcbuilder.test'
            user, user_created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': tenant.slug,
                    'first_name': 'Test',
                    'last_name': tenant.name.replace('Test ', ''),
                    'role': 'tenant-admin',
                    'status': 'active',
                    'tenant': tenant,
                    'password': make_password('test123'),
                }
            )
            if user_created:
                print(f"   ✅ Utilisateur créé: {email} / test123")
            else:
                # Mettre à jour l'utilisateur existant
                user.tenant = tenant
                user.role = 'tenant-admin'
                user.status = 'active'
                user.password = make_password('test123')
                user.save()
                print(f"   ✅ Utilisateur mis à jour: {email} / test123")
        
        print()
    
    print("✅ Configuration terminée !\n")
    
    # Afficher le résumé
    print("=" * 60)
    print("📋 RÉSUMÉ DES TENANTS DE TEST")
    print("=" * 60)
    for tenant in Tenant.objects.all():
        domain = Domain.objects.filter(tenant=tenant, is_primary=True).first()
        users = User.objects.filter(tenant=tenant)
        print(f"\n🏢 {tenant.name} ({tenant.slug})")
        if domain:
            print(f"   🌐 Domaine: {domain.domain}")
        else:
            print(f"   ❌ PAS DE DOMAINE")
        if users.exists():
            for user in users:
                print(f"   👤 {user.email} / test123 ({user.role})")
        else:
            print(f"   ⚠️  Aucun utilisateur")
    print("\n" + "=" * 60)

if __name__ == '__main__':
    setup_test_tenants()

