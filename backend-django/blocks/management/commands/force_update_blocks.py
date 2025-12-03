"""
Management command to force update all block types from JSON file
This ensures all blocks are up to date with the latest definitions
"""
import json
import os
from django.core.management.base import BaseCommand
from blocks.models import BlockType
from blocks.render_templates import get_default_render_template


class Command(BaseCommand):
    help = 'Force update all block types from JSON file (creates missing, updates existing)'

    def handle(self, *args, **options):
        # Chemin vers le fichier JSON des définitions de blocs
        json_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            'data',
            'default_blocks.json'
        )
        
        # Vérifier si le fichier existe
        if not os.path.exists(json_path):
            self.stdout.write(
                self.style.ERROR(f'❌ Fichier JSON non trouvé: {json_path}')
            )
            return
        
        # Charger les définitions de blocs depuis le fichier JSON
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                default_blocks = json.load(f)
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Erreur lors de la lecture du fichier: {e}')
            )
            return
        
        self.stdout.write(
            self.style.SUCCESS(f'📦 Chargement de {len(default_blocks)} blocs depuis {json_path}')
        )
        
        created_count = 0
        updated_count = 0

        for block_data in default_blocks:
            if 'name' not in block_data:
                continue
            
            # Get default render template for this block type
            render_template = get_default_render_template(block_data['name'])
            
            block_type, created = BlockType.objects.get_or_create(
                name=block_data['name'],
                defaults={
                    'label': block_data.get('label', block_data['name']),
                    'icon': block_data.get('icon', '📦'),
                    'category': block_data.get('category', 'custom'),
                    'description': block_data.get('description', ''),
                    'order': block_data.get('order', 0),
                    'is_active': block_data.get('is_active', True),
                    'schema': block_data.get('schema', {}),
                    'default_styles': block_data.get('default_styles', {}),
                    'render_template': render_template,
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Bloc créé: {block_type.label} ({block_type.name})')
                )
            else:
                # Force update all fields
                updated = False
                for key in ['label', 'icon', 'category', 'description', 'order', 'is_active']:
                    if key in block_data:
                        new_value = block_data[key]
                        if getattr(block_type, key) != new_value:
                            setattr(block_type, key, new_value)
                            updated = True
                
                # Update schema and default_styles
                if 'schema' in block_data:
                    block_type.schema = block_data['schema']
                    updated = True
                
                if 'default_styles' in block_data:
                    block_type.default_styles = block_data['default_styles']
                    updated = True
                
                # Update render_template if empty
                if not block_type.render_template or block_type.render_template == {}:
                    block_type.render_template = render_template
                    updated = True
                
                if updated:
                    block_type.save()
                    updated_count += 1
                    self.stdout.write(
                        self.style.WARNING(f'🔄 Bloc mis à jour: {block_type.label} ({block_type.name})')
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Terminé: {created_count} blocs créés, {updated_count} blocs mis à jour'
            )
        )

