"""
Management command to backup the current homepage before generating a new one
"""
from django.core.management.base import BaseCommand
from settings_app.models import SystemSettings
import json
import os
from django.conf import settings
from datetime import datetime


class Command(BaseCommand):
    help = 'Backup the current homepage blocks and settings before generating a new one'

    def handle(self, *args, **options):
        try:
            system_settings = SystemSettings.objects.first()
            if not system_settings:
                self.stdout.write(self.style.ERROR('❌ SystemSettings not found'))
                return
            
            # Create backup directory if it doesn't exist
            backup_dir = os.path.join(settings.BASE_DIR, 'backups', 'homepage')
            os.makedirs(backup_dir, exist_ok=True)
            
            # Generate backup filename with timestamp
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_file = os.path.join(backup_dir, f'homepage_backup_{timestamp}.json')
            
            # Prepare backup data
            backup_data = {
                'timestamp': timestamp,
                'datetime': datetime.now().isoformat(),
                'public_homepage_blocks': system_settings.public_homepage_blocks or [],
                'public_homepage_status': system_settings.public_homepage_status or 'draft',
                'public_homepage_meta_title': system_settings.public_homepage_meta_title or '',
                'public_homepage_meta_description': system_settings.public_homepage_meta_description or '',
            }
            
            # Save backup to file
            with open(backup_file, 'w', encoding='utf-8') as f:
                json.dump(backup_data, f, indent=2, ensure_ascii=False)
            
            # Also save as latest backup
            latest_backup = os.path.join(backup_dir, 'homepage_backup_latest.json')
            with open(latest_backup, 'w', encoding='utf-8') as f:
                json.dump(backup_data, f, indent=2, ensure_ascii=False)
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n✅ Sauvegarde créée :\n'
                    f'   Fichier: {backup_file}\n'
                    f'   Latest: {latest_backup}\n'
                    f'   Blocs sauvegardés: {len(backup_data["public_homepage_blocks"])}\n'
                )
            )
            
            return backup_file
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Erreur lors de la sauvegarde: {e}'))
            import traceback
            traceback.print_exc()
            return None

