"""
Management command to setup the public website tenant
"""
from django.core.management.base import BaseCommand
from tenants.models import Tenant, Domain
from projects.models import Project
from django_tenants.utils import tenant_context
from django.core.management import call_command
from django.db import connection


class Command(BaseCommand):
    help = 'Setup the public website tenant (vtcbuilder-public-website)'

    def handle(self, *args, **options):
        self.stdout.write('🌐 Configuration du tenant pour le site public VTCBuilder...\n')
        
        # Vérifier si le tenant existe déjà
        public_tenant = Tenant.objects.filter(slug='vtcbuilder-public-website').first()
        
        if public_tenant:
            self.stdout.write(self.style.SUCCESS(f'✅ Tenant existe déjà: {public_tenant.name} (schema: {public_tenant.schema_name})'))
        else:
            # Créer le tenant pour le site public
            self.stdout.write('📦 Création du tenant pour le site public...')
            public_tenant = Tenant.objects.create(
                name='VTCBuilder - Site Public',
                slug='vtcbuilder-public-website',
                email='public@vtcbuilder.com',
                plan='enterprise',
                status='active',
                schema_name='vtcbuilder_public_website'
            )
            self.stdout.write(self.style.SUCCESS(f'✅ Tenant créé: {public_tenant.name} (schema: {public_tenant.schema_name})'))
            
            # Créer le schéma si nécessaire
            try:
                with connection.cursor() as cursor:
                    cursor.execute(f"CREATE SCHEMA IF NOT EXISTS {public_tenant.schema_name}")
                self.stdout.write(self.style.SUCCESS(f'✅ Schéma {public_tenant.schema_name} créé'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'⚠️  Schéma existe peut-être déjà: {e}'))
        
        # Migrer le schéma du tenant
        self.stdout.write(f'🔄 Migration du schéma {public_tenant.schema_name}...')
        try:
            with tenant_context(public_tenant):
                call_command('migrate_schemas', schema_name=public_tenant.schema_name, verbosity=0, interactive=False)
            self.stdout.write(self.style.SUCCESS(f'✅ Schéma migré'))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'⚠️  Erreur migration: {e}'))
        
        # Mettre à jour ou créer le projet système
        system_project = Project.objects.filter(is_system_project=True).first()
        
        if system_project:
            old_tenant = system_project.tenant
            system_project.tenant = public_tenant
            system_project.name = 'VTCBuilder - Site Public'
            system_project.slug = 'vtcbuilder-public-site'
            system_project.save()
            self.stdout.write(self.style.SUCCESS(
                f'✅ Projet système mis à jour: {system_project.name} (ID: {system_project.id})'
            ))
            if old_tenant:
                self.stdout.write(f'   Ancien tenant: {old_tenant.name} → Nouveau tenant: {public_tenant.name}')
        else:
            # Créer le projet système
            system_project = Project.objects.create(
                name='VTCBuilder - Site Public',
                slug='vtcbuilder-public-site',
                description='Projet système pour les pages publiques de VTCBuilder',
                is_system_project=True,
                tenant=public_tenant,
                status='active'
            )
            self.stdout.write(self.style.SUCCESS(
                f'✅ Projet système créé: {system_project.name} (ID: {system_project.id})'
            ))
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('✅ Configuration terminée!'))
        self.stdout.write(f'   Tenant public: {public_tenant.name} (schema: {public_tenant.schema_name})')
        self.stdout.write(f'   Projet système: {system_project.name} (ID: {system_project.id})')
        self.stdout.write('')
        self.stdout.write('💡 Le site public est maintenant géré via le tenant "vtcbuilder-public-website"')

