"""
Management command to sync ALL public pages (including features, templates) to the system project
"""
from django.core.management.base import BaseCommand
from projects.models import Project, ProjectPage
from settings_app.models import SystemSettings


class Command(BaseCommand):
    help = 'Sync all public pages (home, docs, contact, faq, features, templates, legal) to the system project'

    def handle(self, *args, **options):
        # Get the public website tenant
        from tenants.models import Tenant
        public_tenant = Tenant.objects.filter(slug='vtcbuilder-public-website').first()
        
        if not public_tenant:
            self.stdout.write(self.style.ERROR('❌ Tenant public (vtcbuilder-public-website) non trouvé!'))
            self.stdout.write(self.style.WARNING('💡 Exécutez: python manage.py setup_public_website_tenant'))
            return
        
        # Get or create the default system project
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
        
        # Update tenant if it was None
        if not created and system_project.tenant != public_tenant:
            system_project.tenant = public_tenant
            system_project.save()
            self.stdout.write(self.style.SUCCESS(f'✅ Projet système mis à jour avec le tenant: {public_tenant.name}'))
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'✅ Projet système créé: {system_project.name}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'ℹ️ Projet système trouvé: {system_project.name}'))
        
        # Get or create SystemSettings
        try:
            settings, settings_created = SystemSettings.objects.get_or_create(
                pk=1,
                defaults={}
            )
            if settings_created:
                self.stdout.write(self.style.SUCCESS('✅ SystemSettings créé'))
            
            # Define all OFFICIAL public pages that should exist (exclude test pages)
            # These pages are ABSOLUTELY NECESSARY and must be preserved
            official_pages = [
                {'slug': 'home', 'title': 'Page d\'accueil', 'order': 1},
                {'slug': 'features', 'title': 'Fonctionnalités', 'order': 2},
                {'slug': 'templates', 'title': 'Modèles de Site', 'order': 3},
                {'slug': 'docs', 'title': 'Documentation', 'order': 4},
                {'slug': 'contact', 'title': 'Contact', 'order': 5},
                {'slug': 'faq', 'title': 'FAQ', 'order': 6},
                {'slug': 'legal/terms', 'title': 'Conditions Générales de Vente', 'order': 7},
                {'slug': 'legal/privacy', 'title': 'Politique de Confidentialité', 'order': 8},
            ]
            
            # List of official page slugs (to filter out test pages)
            # Also include all documentation sub-pages (docs/*)
            official_slugs = {page['slug'] for page in official_pages}
            
            # Add all existing docs/* pages to official_slugs (preserve documentation sub-pages)
            if settings.public_pages:
                for slug in settings.public_pages.keys():
                    if slug.startswith('docs/') and slug != 'docs':
                        official_slugs.add(slug)
            
            # Ensure all pages exist in SystemSettings
            public_pages = settings.public_pages or {}
            pages_created = 0
            
            for page_info in official_pages:
                slug = page_info['slug']
                if slug == 'home':
                    # Homepage is stored separately
                    if not hasattr(settings, 'public_homepage_blocks') or settings.public_homepage_blocks is None:
                        settings.public_homepage_blocks = []
                        settings.public_homepage_meta_title = 'VTCBuilder - Le WordPress des chauffeurs VTC'
                        settings.public_homepage_meta_description = 'Plateforme complète pour créer et gérer votre site VTC professionnel'
                        pages_created += 1
                        self.stdout.write(self.style.SUCCESS(f'  ✅ Page d\'accueil initialisée'))
                else:
                    # Other pages are in public_pages dict
                    if slug not in public_pages:
                        public_pages[slug] = {
                            'title': page_info['title'],
                            'description': f'Page {page_info["title"]} du site public VTCBuilder',
                            'blocks': [],
                            'meta_title': f'{page_info["title"]} - VTCBuilder',
                            'meta_description': f'{page_info["title"]} - VTCBuilder',
                            'is_active': True,
                            'order': page_info['order'],
                        }
                        pages_created += 1
                        self.stdout.write(self.style.SUCCESS(f'  ✅ Page créée dans SystemSettings: {slug}'))
            
            # Save SystemSettings if pages were created
            if pages_created > 0:
                settings.public_pages = public_pages
                settings.save()
                self.stdout.write(self.style.SUCCESS(f'✅ {pages_created} page(s) créée(s) dans SystemSettings'))
            
            # Now sync all pages to the project
            public_pages_list = []
            
            # Add homepage if it exists
            if hasattr(settings, 'public_homepage_blocks') and settings.public_homepage_blocks is not None:
                public_pages_list.append({
                    'slug': 'home',
                    'title': 'Page d\'accueil',
                    'order': 1,
                })
            
            # Add other public pages (only official pages, exclude test pages)
            if settings.public_pages:
                for slug, page_data in settings.public_pages.items():
                    # Only include official pages (exclude test pages like "nouvelle-page-X", "page-test")
                    # Preserve all official pages and documentation sub-pages (docs/*)
                    if slug in official_slugs and isinstance(page_data, dict):
                        public_pages_list.append({
                            'slug': slug,
                            'title': page_data.get('title', slug),
                            'order': page_data.get('order', 999),
                        })
            
            # Sort by order
            public_pages_list.sort(key=lambda x: x.get('order', 999))
            
            # Remove all existing pages from the project first (to avoid duplicates)
            existing_pages = ProjectPage.objects.filter(project=system_project)
            existing_count = existing_pages.count()
            if existing_count > 0:
                self.stdout.write(self.style.WARNING(f'⚠️ Suppression de {existing_count} page(s) existante(s) du projet pour éviter les doublons'))
                existing_pages.delete()
            
            # Sync pages to project
            synced_count = 0
            for page_info in public_pages_list:
                project_page, created = ProjectPage.objects.get_or_create(
                    project=system_project,
                    page_slug=page_info['slug'],
                    page_type='public',
                    defaults={
                        'order': page_info.get('order', synced_count + 1),
                        'is_active': True,
                    }
                )
                if created:
                    synced_count += 1
                    self.stdout.write(self.style.SUCCESS(f'  ✅ Page ajoutée au projet: {page_info["slug"]}'))
                else:
                    # Update order if it changed
                    if project_page.order != page_info.get('order', synced_count + 1):
                        project_page.order = page_info.get('order', synced_count + 1)
                        project_page.save()
                    self.stdout.write(self.style.WARNING(f'  ℹ️ Page déjà dans le projet: {page_info["slug"]}'))
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n✅ Synchronisation terminée: {synced_count} page(s) synchronisée(s) avec le projet système'
                )
            )
            
            # List all pages in the project
            final_pages = ProjectPage.objects.filter(project=system_project).order_by('order')
            self.stdout.write(self.style.SUCCESS(f'\n📋 Pages dans le projet ({final_pages.count()}):'))
            for page in final_pages:
                self.stdout.write(f'  - {page.page_slug} (ordre: {page.order})')
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Erreur lors de la synchronisation: {e}'))
            import traceback
            self.stdout.write(self.style.ERROR(traceback.format_exc()))

