"""
Management command to remove 'home' from public_pages if it exists in public_homepage_blocks
"""
from django.core.management.base import BaseCommand
from settings_app.models import SystemSettings


class Command(BaseCommand):
    help = 'Remove "home" from public_pages if it exists in public_homepage_blocks'

    def handle(self, *args, **options):
        try:
            settings = SystemSettings.get_settings()
            public_pages = settings.public_pages or {}
            
            # Check if home exists in both places
            has_homepage_blocks = settings.public_homepage_blocks is not None
            has_home_in_pages = 'home' in public_pages
            
            if has_homepage_blocks and has_home_in_pages:
                self.stdout.write(self.style.WARNING('⚠️  "home" existe à la fois dans public_homepage_blocks et public_pages'))
                del public_pages['home']
                settings.public_pages = public_pages
                settings.save(update_fields=['public_pages'])
                self.stdout.write(self.style.SUCCESS('✅ "home" supprimée de public_pages'))
            elif has_home_in_pages and not has_homepage_blocks:
                self.stdout.write(self.style.INFO('ℹ️  "home" existe dans public_pages mais pas dans public_homepage_blocks (normal)'))
            elif has_homepage_blocks and not has_home_in_pages:
                self.stdout.write(self.style.SUCCESS('✅ Structure correcte : "home" uniquement dans public_homepage_blocks'))
            else:
                self.stdout.write(self.style.INFO('ℹ️  Aucune page "home" trouvée'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Erreur : {e}'))

