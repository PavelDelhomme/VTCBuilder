"""
Management command to sync public pages to the default system project
"""
from django.core.management.base import BaseCommand
from projects.models import Project, ProjectPage
from settings_app.models import SystemSettings


class Command(BaseCommand):
    help = 'Sync all public pages to the default system project'

    def handle(self, *args, **options):
        # Get or create the default system project
        system_project, created = Project.objects.get_or_create(
            slug='vtcbuilder-public-site',
            defaults={
                'name': 'VTCBuilder - Site Public',
                'description': 'Projet par défaut pour les pages publiques du site VTCBuilder.',
                'is_system_project': True,
                'tenant': None,
                'status': 'active',
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'✅ Projet système créé: {system_project.name}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'ℹ️ Projet système trouvé: {system_project.name}'))
        
        # Get all public pages from system settings
        try:
            settings = SystemSettings.objects.first()
            if not settings:
                self.stdout.write(self.style.WARNING('⚠️ Aucun SystemSettings trouvé'))
                return
            
            public_pages = []
            
            # Add homepage if it exists
            if hasattr(settings, 'public_homepage_blocks') and settings.public_homepage_blocks is not None:
                public_pages.append({
                    'slug': 'home',
                    'title': 'Page d\'accueil',
                })
            
            # Add other public pages
            if hasattr(settings, 'public_pages') and settings.public_pages:
                for slug, page_data in settings.public_pages.items():
                    if isinstance(page_data, dict):
                        public_pages.append({
                            'slug': slug,
                            'title': page_data.get('title', slug),
                        })
            
            # Sync pages to project
            synced_count = 0
            for page_info in public_pages:
                project_page, created = ProjectPage.objects.get_or_create(
                    project=system_project,
                    page_slug=page_info['slug'],
                    page_type='public',
                    defaults={
                        'order': synced_count + 1,
                    }
                )
                if created:
                    synced_count += 1
                    self.stdout.write(self.style.SUCCESS(f'  ✅ Page ajoutée: {page_info["slug"]}'))
                else:
                    self.stdout.write(self.style.WARNING(f'  ℹ️ Page déjà dans le projet: {page_info["slug"]}'))
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n✅ Synchronisation terminée: {synced_count} nouvelles pages ajoutées au projet'
                )
            )
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Erreur lors de la synchronisation: {e}'))

