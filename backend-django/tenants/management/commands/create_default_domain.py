"""
Django management command to create a default domain for localhost
"""
from django.core.management.base import BaseCommand
from tenants.models import Tenant, Domain


class Command(BaseCommand):
    help = 'Create a default domain for localhost to allow API access without tenant'

    def handle(self, *args, **options):
        self.stdout.write('🌐 Création du domaine par défaut pour localhost...\n')
        
        # Créer ou récupérer un tenant "public" pour le schéma public
        # Avec django-tenants, on a besoin d'un tenant avec schema_name='public'
        public_tenant, created = Tenant.objects.get_or_create(
            schema_name='public',
            defaults={
                'name': 'Public Schema',
                'slug': 'public',
                'email': 'public@vtcbuilder.local',
                'plan': 'enterprise',
                'status': 'active',
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('   ✅ Tenant public créé'))
        else:
            self.stdout.write('   ℹ️  Tenant public existe déjà')
        
        # Créer les domaines pour localhost
        domains_to_create = [
            ('localhost:9495', True),  # Domaine principal pour l'API
            ('127.0.0.1:9495', False),
            ('localhost', False),
            ('127.0.0.1', False),
        ]
        
        created_count = 0
        for domain_name, is_primary in domains_to_create:
            domain, created = Domain.objects.get_or_create(
                domain=domain_name,
                defaults={
                    'tenant': public_tenant,
                    'is_primary': is_primary,
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'   ✅ Domaine créé: {domain_name}'))
            else:
                # Mettre à jour si nécessaire
                if domain.tenant != public_tenant:
                    domain.tenant = public_tenant
                    domain.save()
                    self.stdout.write(self.style.SUCCESS(f'   ✅ Domaine mis à jour: {domain_name}'))
                elif is_primary and not domain.is_primary:
                    domain.is_primary = True
                    domain.save()
                    self.stdout.write(self.style.SUCCESS(f'   ✅ Domaine mis à jour (is_primary): {domain_name}'))
                else:
                    self.stdout.write(f'   ℹ️  Domaine existe déjà: {domain_name}')
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(f'✅ {created_count} domaine(s) créé(s)'))
        self.stdout.write('')
        self.stdout.write('💡 Les routes API devraient maintenant être accessibles sur localhost:9495')
