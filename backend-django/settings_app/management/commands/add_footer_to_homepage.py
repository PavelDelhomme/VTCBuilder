"""
Management command to add footer block to homepage if it doesn't exist
"""
from django.core.management.base import BaseCommand
from settings_app.models import SystemSettings
import json
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Add footer block to homepage if it doesn\'t exist'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('Ajout du bloc footer à la page d\'accueil...'))

        try:
            settings = SystemSettings.get_settings()
            blocks = settings.public_homepage_blocks or []
            
            if not blocks:
                self.stdout.write(self.style.ERROR('❌ Aucun bloc trouvé dans public_homepage_blocks'))
                return
            
            container = blocks[0] if blocks else {}
            children = container.get('children', [])
            
            # Vérifier si un footer existe déjà
            has_footer = any(c.get('type') == 'footer' for c in children)
            
            if has_footer:
                self.stdout.write(self.style.SUCCESS('✅ Le bloc footer existe déjà'))
                return
            
            # Créer le bloc footer
            from datetime import datetime
            now = int(datetime.now().timestamp() * 1000)
            
            footer_block = {
                'id': f'block-footer-{now}',
                'type': 'footer',
                'data': {
                    'columns': [
                        {
                            'title': 'VTCBuilder',
                            'description': 'La plateforme SaaS complète pour créer et gérer votre site VTC professionnel.',
                            'links': [],
                        },
                        {
                            'title': 'Produit',
                            'links': [
                                {'label': 'Tarifs', 'url': '/#pricing'},
                                {'label': 'Fonctionnalités', 'url': '/features'},
                                {'label': 'Templates', 'url': '/templates'},
                            ],
                        },
                        {
                            'title': 'Support',
                            'links': [
                                {'label': 'Documentation', 'url': '/docs'},
                                {'label': 'Contact', 'url': '/contact'},
                                {'label': 'FAQ', 'url': '/faq'},
                            ],
                        },
                        {
                            'title': 'Légal',
                            'links': [
                                {'label': 'CGV', 'url': '/legal/terms'},
                                {'label': 'Confidentialité', 'url': '/legal/privacy'},
                            ],
                        },
                    ],
                    'copyright': f'© {datetime.now().year} VTCBuilder. Tous droits réservés.',
                    'additional_text': 'vtcbuilder.com - Développé avec ❤️ en France',
                },
                'styles': {
                    'background_color': '#f3f4f6',
                    'padding_top': '3rem',
                    'padding_bottom': '2rem',
                },
                'layout': 12,
                'container': 'container',
                'order': len(children),
            }
            
            # Ajouter le footer aux enfants
            children.append(footer_block)
            container['children'] = children
            blocks[0] = container
            
            settings.public_homepage_blocks = blocks
            settings.save(update_fields=['public_homepage_blocks'])
            
            self.stdout.write(self.style.SUCCESS('✅ Bloc footer ajouté à la page d\'accueil'))

        except SystemSettings.DoesNotExist:
            self.stdout.write(self.style.ERROR('❌ SystemSettings non trouvé.'))
        except Exception as e:
            logger.error(f&quot;Error lors de l'ajout du footer: {e}", exc_info=True)
            self.stdout.write(self.style.ERROR(f'❌ Erreur inattendue: {e}'))

