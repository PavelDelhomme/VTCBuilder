"""
Management command to export render templates to JSON
This allows render templates to be versioned and reused
"""
import json
import os
from django.core.management.base import BaseCommand
from blocks.render_templates import DEFAULT_RENDER_TEMPLATES


class Command(BaseCommand):
    help = 'Export render templates to JSON file'

    def handle(self, *args, **options):
        # Chemin vers le fichier JSON des templates de rendu
        json_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            'data',
            'render_templates.json'
        )
        
        # Créer le répertoire si nécessaire
        os.makedirs(os.path.dirname(json_path), exist_ok=True)
        
        # Exporter les templates
        try:
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(DEFAULT_RENDER_TEMPLATES, f, indent=2, ensure_ascii=False)
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ {len(DEFAULT_RENDER_TEMPLATES)} templates exportés vers {json_path}'
                )
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Erreur lors de l\'export: {e}')
            )

