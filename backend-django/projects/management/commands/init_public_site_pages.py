"""
Management command to initialize all public site pages and add them to the system project
"""
from django.core.management.base import BaseCommand
from projects.models import Project, ProjectPage
from settings_app.models import SystemSettings


class Command(BaseCommand):
    help = 'Initialize all public site pages (home, docs, pricing, contact, faq, etc.) and add them to the system project'

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
        
        # Get or create system settings
        settings, _ = SystemSettings.objects.get_or_create(pk=1)
        
        # Define all required pages
        required_pages = [
            {
                'slug': 'home',
                'title': 'Page d\'accueil',
                'description': 'Page principale du site public VTCBuilder',
                'is_homepage': True,
                'order': 1,
            },
            {
                'slug': 'pricing',
                'title': 'Tarification',
                'description': 'Page de présentation des tarifs et plans',
                'is_homepage': False,
                'order': 2,
            },
            {
                'slug': 'docs',
                'title': 'Documentation',
                'description': 'Page de documentation et guides',
                'is_homepage': False,
                'order': 3,
            },
            {
                'slug': 'contact',
                'title': 'Contact',
                'description': 'Page de contact avec formulaire',
                'is_homepage': False,
                'order': 4,
            },
            {
                'slug': 'faq',
                'title': 'FAQ',
                'description': 'Questions fréquemment posées',
                'is_homepage': False,
                'order': 5,
            },
            {
                'slug': 'features',
                'title': 'Fonctionnalités',
                'description': 'Présentation des fonctionnalités de VTCBuilder',
                'is_homepage': False,
                'order': 6,
            },
            {
                'slug': 'legal/terms',
                'title': 'Conditions Générales de Vente',
                'description': 'CGV de VTCBuilder',
                'is_homepage': False,
                'order': 7,
            },
            {
                'slug': 'legal/privacy',
                'title': 'Politique de Confidentialité',
                'description': 'Politique de confidentialité de VTCBuilder',
                'is_homepage': False,
                'order': 8,
            },
        ]
        
        # Initialize homepage if not exists
        if not settings.public_homepage_blocks:
            settings.public_homepage_blocks = []
            settings.public_homepage_status = 'draft'
            settings.public_homepage_meta_title = 'VTCBuilder - Le WordPress des chauffeurs VTC'
            settings.public_homepage_meta_description = 'Plateforme complète pour créer et gérer votre site VTC professionnel'
            self.stdout.write(self.style.SUCCESS('  ✅ Page d\'accueil initialisée'))
        
        # Initialize public_pages if not exists
        if not settings.public_pages:
            settings.public_pages = {}
        
        # Create or update all required pages
        created_count = 0
        updated_count = 0
        
        for page_info in required_pages:
            slug = page_info['slug']
            
            # Skip homepage (handled separately)
            if page_info['is_homepage']:
                # Ensure homepage is in project
                project_page, created = ProjectPage.objects.get_or_create(
                    project=system_project,
                    page_slug='home',
                    page_type='public',
                    defaults={
                        'order': 1,
                        'is_active': True,
                    }
                )
                if created:
                    created_count += 1
                    self.stdout.write(self.style.SUCCESS(f'  ✅ Page ajoutée au projet: {slug}'))
                continue
            
            # Create or update page in public_pages
            if slug not in settings.public_pages:
                settings.public_pages[slug] = {
                    'title': page_info['title'],
                    'description': page_info['description'],
                    'blocks': [],
                    'meta_title': '',
                    'meta_description': '',
                    'is_active': True,
                    'order': page_info['order'],
                }
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'  ✅ Page créée: {slug}'))
            else:
                # Update existing page if needed
                existing = settings.public_pages[slug]
                if 'order' not in existing or existing.get('order') != page_info['order']:
                    existing['order'] = page_info['order']
                    updated_count += 1
                    self.stdout.write(self.style.WARNING(f'  ℹ️ Page mise à jour: {slug}'))
            
            # Ensure page is in project
            project_page, created = ProjectPage.objects.get_or_create(
                project=system_project,
                page_slug=slug,
                page_type='public',
                defaults={
                    'order': page_info['order'],
                    'is_active': True,
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✅ Page ajoutée au projet: {slug}'))
            else:
                # Update order if changed
                if project_page.order != page_info['order']:
                    project_page.order = page_info['order']
                    project_page.save()
        
        # Save settings
        settings.save()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Initialisation terminée:\n'
                f'  - {created_count} nouvelles pages créées\n'
                f'  - {updated_count} pages mises à jour\n'
                f'  - Toutes les pages sont dans le projet "{system_project.name}" (ID: {system_project.id})'
            )
        )
        self.stdout.write(
            self.style.WARNING(
                f'\n💡 Pour gérer ces pages, allez dans:\n'
                f'  /admin/projects/{system_project.id}'
            )
        )

