"""
Management command to create default block types
Loads block definitions from JSON file for maintainability
"""
import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from blocks.models import BlockType
from blocks.render_templates import get_default_render_template


class Command(BaseCommand):
    help = 'Create default block types if they do not exist (loads from JSON file)'

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
            self.stdout.write(
                self.style.WARNING('💡 Créez le fichier default_blocks.json dans backend-django/blocks/data/')
            )
            return
        
        # Charger les définitions de blocs depuis le fichier JSON
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                default_blocks = json.load(f)
        except json.JSONDecodeError as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Erreur lors du parsing du JSON: {e}')
            )
            return
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
            # Vérifier que les champs requis sont présents
            if 'name' not in block_data:
                self.stdout.write(
                    self.style.WARNING(f'⚠️  Bloc ignoré: pas de champ "name"')
                )
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
                # Mettre à jour les champs si nécessaire
                updated = False
                for key in ['label', 'icon', 'category', 'description', 'order', 'is_active']:
                    if key in block_data and getattr(block_type, key) != block_data[key]:
                        setattr(block_type, key, block_data[key])
                        updated = True
                
                # Mettre à jour schema et default_styles si fournis
                if 'schema' in block_data and block_data['schema']:
                    if block_type.schema != block_data['schema']:
                        block_type.schema = block_data['schema']
                        updated = True
                
                if 'default_styles' in block_data and block_data['default_styles']:
                    if block_type.default_styles != block_data['default_styles']:
                        block_type.default_styles = block_data['default_styles']
                        updated = True
                
                # Mettre à jour le render_template si nécessaire
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
