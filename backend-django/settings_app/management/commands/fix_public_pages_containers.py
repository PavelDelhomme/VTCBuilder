"""
Management command to fix public pages blocks to use containers
"""
from django.core.management.base import BaseCommand
import uuid
from settings_app.models import SystemSettings


class Command(BaseCommand):
    help = 'Corrige les pages publiques pour utiliser des conteneurs'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔧 Correction des pages publiques...'))
        
        settings = SystemSettings.get_settings()
        public_pages = settings.public_pages or {}
        
        pages_fixed = 0
        
        for slug, page_data in public_pages.items():
            blocks = page_data.get('blocks', [])
            if not blocks:
                continue
            
            # Vérifier si les blocs sont déjà dans un conteneur
            has_container = False
            if isinstance(blocks, list) and len(blocks) > 0:
                first_block = blocks[0]
                if isinstance(first_block, dict):
                    # Vérifier si le premier bloc est un conteneur ou si tous les blocs sont des enfants d'un conteneur
                    if first_block.get('type') in ['container', 'flex-container', 'grid-container']:
                        has_container = True
                    elif first_block.get('children'):
                        has_container = True
            
            # Si pas de conteneur, en créer un
            if not has_container:
                # Convertir les anciens blocs au nouveau format si nécessaire
                formatted_blocks = []
                for index, block in enumerate(blocks):
                    if isinstance(block, dict):
                        # Si le bloc a déjà un id, l'utiliser
                        block_id = block.get('id') or f'block-{uuid.uuid4().hex[:12]}-{index}'
                        
                        # Convertir l'ancien format vers le nouveau format
                        formatted_block = {
                            'id': block_id,
                            'type': block.get('type', 'text'),
                            'data': block.get('data', {}),
                            'styles': block.get('styles', {}),
                            'layout': block.get('layout', 12),
                        }
                        
                        # Gérer les anciens formats
                        if 'content' in block and 'data' not in formatted_block['data']:
                            if block['type'] == 'heading':
                                formatted_block['data']['text'] = block['content']
                                formatted_block['data']['level'] = block.get('level', 1)
                            elif block['type'] == 'paragraph':
                                formatted_block['data']['text'] = block['content']
                            else:
                                formatted_block['data']['content'] = block['content']
                        
                        if 'style' in block and not formatted_block['styles']:
                            formatted_block['styles'] = block['style']
                        
                        formatted_blocks.append(formatted_block)
                
                # Envelopper dans un conteneur
                container_block = {
                    'id': f'block-container-{uuid.uuid4().hex[:12]}',
                    'type': 'container',
                    'data': {},
                    'styles': {
                        'padding': 'py-12',
                    },
                    'layout': 12,
                    'children': formatted_blocks,
                }
                
                page_data['blocks'] = [container_block]
                pages_fixed += 1
                self.stdout.write(
                    self.style.SUCCESS(f'  ✅ Page corrigée: {page_data.get("title", slug)} ({slug})')
                )
        
        # Sauvegarder les pages
        settings.public_pages = public_pages
        settings.save(update_fields=['public_pages'])
        
        # Résumé
        self.stdout.write(self.style.SUCCESS(f'\n✅ Correction terminée !'))
        self.stdout.write(f'  - Pages corrigées: {pages_fixed}')
        self.stdout.write(f'  - Total pages: {len(public_pages)}')

