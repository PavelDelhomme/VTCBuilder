"""
Management command to fully initialize the public website tenant with project and pages
"""
from django.core.management.base import BaseCommand
from django_tenants.utils import tenant_context
from tenants.models import Tenant
from projects.models import Project, ProjectPage
from settings_app.models import SystemSettings


class Command(BaseCommand):
    help = 'Initialize the public website tenant with project, pages, and default content'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Initialisation complète du tenant public VTCBuilder...\n'))
        
        # 1. Vérifier que le tenant existe
        public_tenant = Tenant.objects.filter(slug='vtcbuilder-public-website').first()
        
        if not public_tenant:
            self.stdout.write(self.style.ERROR('❌ Tenant public (vtcbuilder-public-website) non trouvé!'))
            self.stdout.write(self.style.WARNING('💡 Exécutez d\'abord: python manage.py setup_public_website_tenant'))
            return
        
        self.stdout.write(self.style.SUCCESS(f'✅ Tenant trouvé: {public_tenant.name}'))
        
        # 2. Créer ou récupérer le projet système (dans le schéma public, pas dans le tenant)
        # Les projets sont stockés dans le schéma public avec un ForeignKey vers le tenant
        system_project, created = Project.objects.get_or_create(
            slug='vtcbuilder-public-site',
            defaults={
                'name': 'VTCBuilder - Site Public',
                'description': 'Projet par défaut pour les pages publiques du site VTCBuilder.',
                'is_system_project': True,
                'tenant': public_tenant,
                'status': 'active',
            }
        )
        
        # Mettre à jour le tenant si nécessaire
        if not created and system_project.tenant != public_tenant:
            system_project.tenant = public_tenant
            system_project.save()
            self.stdout.write(self.style.SUCCESS(f'✅ Projet système mis à jour avec le tenant: {public_tenant.name}'))
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'✅ Projet système créé: {system_project.name} (ID: {system_project.id})'))
        else:
            self.stdout.write(self.style.SUCCESS(f'ℹ️  Projet système existe déjà: {system_project.name} (ID: {system_project.id})'))
            
        # 3. Créer les pages publiques par défaut dans le projet (schéma public)
        default_pages = [
            {'slug': 'home', 'title': 'Page d\'accueil', 'order': 1},
            {'slug': 'docs', 'title': 'Documentation', 'order': 2},
            {'slug': 'contact', 'title': 'Contact', 'order': 3},
            {'slug': 'faq', 'title': 'FAQ', 'order': 4},
            {'slug': 'legal/terms', 'title': 'Conditions Générales de Vente', 'order': 5},
            {'slug': 'legal/privacy', 'title': 'Politique de Confidentialité', 'order': 6},
        ]
        
        synced_count = 0
        for page_info in default_pages:
            project_page, created = ProjectPage.objects.get_or_create(
                project=system_project,
                page_slug=page_info['slug'],
                page_type='public',
                defaults={
                    'order': page_info['order'],
                }
            )
            if created:
                synced_count += 1
                self.stdout.write(self.style.SUCCESS(f'  ✅ Page ajoutée au projet: {page_info["slug"]}'))
            else:
                self.stdout.write(self.style.WARNING(f'  ℹ️  Page déjà dans le projet: {page_info["slug"]}'))
        
        # 4. Créer les pages dans le modèle Page (tenant-specific) - dans le contexte du tenant
        with tenant_context(public_tenant):
            try:
                from pages.models import Page
                
                pages_created = 0
                for page_info in default_pages:
                    page, created = Page.objects.get_or_create(
                        slug=page_info['slug'],
                        tenant=public_tenant,
                        defaults={
                            'title': page_info['title'],
                            'status': 'published',
                            'order': page_info['order'],
                            'blocks': [],
                        }
                    )
                    if created:
                        pages_created += 1
                        self.stdout.write(self.style.SUCCESS(f'  ✅ Page créée dans le tenant: {page_info["slug"]}'))
                    else:
                        self.stdout.write(self.style.WARNING(f'  ℹ️  Page existe déjà dans le tenant: {page_info["slug"]}'))
                
                if pages_created > 0:
                    self.stdout.write(self.style.SUCCESS(f'\n✅ {pages_created} page(s) créée(s) dans le tenant'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'⚠️  Impossible de créer les pages dans le tenant (tables peut-être non migrées): {e}'))
                self.stdout.write(self.style.WARNING(f'💡 Exécutez: python manage.py migrate_schemas --schema={public_tenant.schema_name}'))
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n✅ Initialisation terminée: {synced_count} nouvelle(s) page(s) ajoutée(s) au projet'
                )
            )
            self.stdout.write(self.style.SUCCESS(f'📦 Projet: {system_project.name} (ID: {system_project.id})'))
            self.stdout.write(self.style.SUCCESS(f'🏢 Tenant: {public_tenant.name} (slug: {public_tenant.slug})'))

