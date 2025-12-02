"""
Management command to restore homepage from a backup
"""
from django.core.management.base import BaseCommand
from settings_app.models import SystemSettings
import json
import os
from django.conf import settings


class Command(BaseCommand):
    help = 'Restore homepage from a backup file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            help='Path to backup file (default: latest backup)',
            default=None,
        )
        parser.add_argument(
            '--list',
            action='store_true',
            help='List all available backups',
        )

    def handle(self, *args, **options):
        try:
            backup_dir = os.path.join(settings.BASE_DIR, 'backups', 'homepage')
            
            # List backups
            if options['list']:
                if not os.path.exists(backup_dir):
                    self.stdout.write(self.style.WARNING('⚠️  Aucun backup trouvé'))
                    return
                
                backups = sorted(
                    [f for f in os.listdir(backup_dir) if f.endswith('.json')],
                    reverse=True
                )
                
                if not backups:
                    self.stdout.write(self.style.WARNING('⚠️  Aucun backup trouvé'))
                    return
                
                self.stdout.write(self.style.SUCCESS(f'\n📦 Backups disponibles ({len(backups)}):\n'))
                for backup in backups:
                    backup_path = os.path.join(backup_dir, backup)
                    try:
                        with open(backup_path, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                            timestamp = data.get('timestamp', 'N/A')
                            blocks_count = len(data.get('public_homepage_blocks', []))
                            self.stdout.write(f'   - {backup} (Blocs: {blocks_count}, Date: {timestamp})')
                    except Exception as e:
                        self.stdout.write(f'   - {backup} (Erreur: {e})')
                return
            
            # Restore from backup
            if options['file']:
                backup_file = options['file']
                if not os.path.isabs(backup_file):
                    backup_file = os.path.join(backup_dir, backup_file)
            else:
                # Use latest backup
                latest_backup = os.path.join(backup_dir, 'homepage_backup_latest.json')
                if not os.path.exists(latest_backup):
                    self.stdout.write(self.style.ERROR('❌ Aucun backup trouvé. Utilisez --list pour voir les backups disponibles.'))
                    return
                backup_file = latest_backup
            
            if not os.path.exists(backup_file):
                self.stdout.write(self.style.ERROR(f'❌ Fichier de backup non trouvé: {backup_file}'))
                return
            
            # Load backup
            with open(backup_file, 'r', encoding='utf-8') as f:
                backup_data = json.load(f)
            
            # Restore to SystemSettings
            system_settings = SystemSettings.objects.first()
            if not system_settings:
                self.stdout.write(self.style.ERROR('❌ SystemSettings not found'))
                return
            
            system_settings.public_homepage_blocks = backup_data.get('public_homepage_blocks', [])
            system_settings.public_homepage_status = backup_data.get('public_homepage_status', 'draft')
            system_settings.public_homepage_meta_title = backup_data.get('public_homepage_meta_title', '')
            system_settings.public_homepage_meta_description = backup_data.get('public_homepage_meta_description', '')
            system_settings.save()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n✅ Page d\'accueil restaurée depuis :\n'
                    f'   Fichier: {backup_file}\n'
                    f'   Date: {backup_data.get("datetime", "N/A")}\n'
                    f'   Blocs restaurés: {len(backup_data.get("public_homepage_blocks", []))}\n'
                    f'   Statut: {backup_data.get("public_homepage_status", "draft")}\n'
                )
            )
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Erreur lors de la restauration: {e}'))
            import traceback
            traceback.print_exc()

