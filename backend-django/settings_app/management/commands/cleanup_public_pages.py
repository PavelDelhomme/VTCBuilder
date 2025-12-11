"""
Management command to cleanup useless public pages
"""
from django.core.management.base import BaseCommand
from settings_app.models import SystemSettings


class Command(BaseCommand):
    help = 'Supprime les pages publiques inutiles (nouvelle-page-1, nouvelle-page-2, etc.)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Affiche les pages qui seraient supprimées sans les supprimer réellement',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        try:
            settings = SystemSettings.get_settings()
            public_pages = settings.public_pages or {}
            
            # Pages à supprimer (pages de test inutiles)
            pages_to_delete = [
                'nouvelle-page-1',
                'nouvelle-page-2',
                'nouvelle-page-3',
                'nouvelle-page-4',
            ]
            
            # Pages à conserver (pages importantes)
            pages_to_keep = [
                'home',  # Gérée par public_homepage_blocks
                'page-test',
                'docs',
                'contact',
                'faq',
                'legal/terms',
                'legal/privacy',
            ]
            
            deleted_count = 0
            pages_found = []
            
            for slug in pages_to_delete:
                if slug in public_pages:
                    pages_found.append(slug)
                    if not dry_run:
                        del public_pages[slug]
                        deleted_count += 1
                        self.stdout.write(
                            self.style.SUCCESS(f'✅ Page "{slug}" supprimée')
                        )
                    else:
                        self.stdout.write(
                            self.style.WARNING(f'⚠️  Page "{slug}" serait supprimée (dry-run)')
                        )
            
            if not pages_found:
                self.stdout.write(
                    self.style.SUCCESS('✅ Aucune page inutile trouvée')
                )
                return
            
            if dry_run:
                self.stdout.write(
                    self.style.WARNING(
                        f'\n⚠️  DRY RUN: {len(pages_found)} page(s) seraient supprimée(s)'
                    )
                )
                self.stdout.write(
                    self.style.WARNING('Exécutez sans --dry-run pour supprimer réellement')
                )
                return
            
            # Sauvegarder les modifications
            settings.public_pages = public_pages
            settings.save()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n✅ {deleted_count} page(s) supprimée(s) avec succès'
                )
            )
            
            # Afficher les pages restantes
            remaining_pages = list(public_pages.keys())
            if remaining_pages:
                self.stdout.write(
                    self.style.SUCCESS(f'\n📄 Pages restantes ({len(remaining_pages)}):')
                )
                for slug in sorted(remaining_pages):
                    page_data = public_pages[slug]
                    title = page_data.get('title', slug) if isinstance(page_data, dict) else slug
                    self.stdout.write(f'  - {slug} ({title})')
            else:
                self.stdout.write(
                    self.style.WARNING('\n⚠️  Aucune page restante dans public_pages')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Erreur lors du nettoyage: {e}')
            )
            import traceback
            self.stdout.write(self.style.ERROR(traceback.format_exc()))

