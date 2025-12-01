"""
Management command to create default block types
"""
from django.core.management.base import BaseCommand
from blocks.models import BlockType
from blocks.render_templates import get_default_render_template


class Command(BaseCommand):
    help = 'Create default block types if they do not exist'

    def handle(self, *args, **options):
        default_blocks = [
            # Blocs de Structure (EN PREMIER - pour définir la structure avant le contenu)
            {
                'name': 'container',
                'label': 'Conteneur',
                'icon': '📦',
                'category': 'layout',
                'description': 'Conteneur avec largeur maximale',
                'order': -10,
            },
            {
                'name': 'flex-container',
                'label': 'Flex Container',
                'icon': '📐',
                'category': 'layout',
                'description': 'Conteneur flexbox pour aligner les éléments',
                'order': -9,
            },
            {
                'name': 'grid-container',
                'label': 'Grille',
                'icon': '⚏',
                'category': 'layout',
                'description': 'Grille CSS pour créer des layouts complexes',
                'order': -8,
            },
            {
                'name': 'columns',
                'label': 'Colonnes',
                'icon': '📊',
                'category': 'layout',
                'description': 'Système de colonnes (12 colonnes)',
                'order': -7,
            },
            
            # Blocs de Contenu
            {
                'name': 'heading',
                'label': 'Titre',
                'icon': '📝',
                'category': 'content',
                'description': 'Titre avec différents niveaux',
                'order': 1,
            },
            {
                'name': 'text',
                'label': 'Texte',
                'icon': '📄',
                'category': 'content',
                'description': 'Bloc de texte simple',
                'order': 2,
            },
            {
                'name': 'paragraph',
                'label': 'Paragraphe',
                'icon': '📝',
                'category': 'content',
                'description': 'Paragraphe formaté',
                'order': 3,
            },
            {
                'name': 'line',
                'label': 'Ligne',
                'icon': '➖',
                'category': 'content',
                'description': 'Ligne de séparation horizontale',
                'order': 4,
            },
            {
                'name': 'button',
                'label': 'Bouton',
                'icon': '🔘',
                'category': 'content',
                'description': 'Bouton avec lien',
                'order': 5,
            },
            {
                'name': 'link',
                'label': 'Lien',
                'icon': '🔗',
                'category': 'content',
                'description': 'Lien hypertexte',
                'order': 6,
            },
            {
                'name': 'list',
                'label': 'Liste',
                'icon': '📋',
                'category': 'content',
                'description': 'Liste à puces ou numérotée',
                'order': 7,
            },
            {
                'name': 'quote',
                'label': 'Citation',
                'icon': '💬',
                'category': 'content',
                'description': 'Bloc de citation',
                'order': 8,
            },
            {
                'name': 'accordion',
                'label': 'Accordéon',
                'icon': '📑',
                'category': 'content',
                'description': 'Accordéon pour FAQ',
                'order': 9,
            },
            {
                'name': 'table',
                'label': 'Tableau',
                'icon': '📊',
                'category': 'content',
                'description': 'Tableau de données',
                'order': 10,
            },
            {
                'name': 'alert',
                'label': 'Alerte',
                'icon': '⚠️',
                'category': 'content',
                'description': 'Message d\'alerte',
                'order': 11,
            },
            {
                'name': 'code',
                'label': 'Code',
                'icon': '💻',
                'category': 'content',
                'description': 'Bloc de code',
                'order': 12,
            },
            {
                'name': 'divider',
                'label': 'Séparateur',
                'icon': '➖',
                'category': 'content',
                'description': 'Ligne de séparation',
                'order': 13,
            },
            {
                'name': 'spacer',
                'label': 'Espaceur',
                'icon': '⬜',
                'category': 'content',
                'description': 'Espace vertical ou horizontal',
                'order': 14,
            },
            {
                'name': 'breadcrumb',
                'label': 'Fil d\'Ariane',
                'icon': '🍞',
                'category': 'content',
                'description': 'Navigation breadcrumb',
                'order': 15,
            },
            {
                'name': 'pagination',
                'label': 'Pagination',
                'icon': '📄',
                'category': 'content',
                'description': 'Navigation pagination',
                'order': 16,
            },
            {
                'name': 'tags',
                'label': 'Tags',
                'icon': '🏷️',
                'category': 'content',
                'description': 'Tags/étiquettes',
                'order': 17,
            },
            {
                'name': 'badge',
                'label': 'Badge',
                'icon': '🏷️',
                'category': 'content',
                'description': 'Badge/étiquette simple',
                'order': 18,
            },
            
            # Blocs Médias
            {
                'name': 'image',
                'label': 'Image',
                'icon': '🖼️',
                'category': 'media',
                'description': 'Image avec légende',
                'order': 1,
            },
            {
                'name': 'gallery',
                'label': 'Galerie',
                'icon': '🖼️',
                'category': 'media',
                'description': 'Galerie d\'images',
                'order': 2,
            },
            {
                'name': 'video',
                'label': 'Vidéo',
                'icon': '🎥',
                'category': 'media',
                'description': 'Vidéo intégrée',
                'order': 3,
            },
            {
                'name': 'video-embed',
                'label': 'Vidéo Embed',
                'icon': '📺',
                'category': 'media',
                'description': 'YouTube, Vimeo, etc.',
                'order': 4,
            },
            {
                'name': 'embed',
                'label': 'Intégration',
                'icon': '🔗',
                'category': 'media',
                'description': 'Contenu intégré (iframe)',
                'order': 5,
            },
            {
                'name': 'audio-player',
                'label': 'Lecteur Audio',
                'icon': '🎵',
                'category': 'media',
                'description': 'Lecteur audio',
                'order': 6,
            },
            {
                'name': 'map',
                'label': 'Carte',
                'icon': '🗺️',
                'category': 'media',
                'description': 'Carte interactive',
                'order': 7,
            },
            {
                'name': 'carousel',
                'label': 'Carrousel',
                'icon': '🎠',
                'category': 'media',
                'description': 'Carrousel d\'images',
                'order': 8,
            },
            
            # Blocs de Mise en Page
            {
                'name': 'rows',
                'label': 'Lignes',
                'icon': '📐',
                'category': 'layout',
                'description': 'Lignes pour colonnes',
                'order': -5,
            },
            {
                'name': 'section',
                'label': 'Section',
                'icon': '📦',
                'category': 'layout',
                'description': 'Section avec fond personnalisé',
                'order': -4,
            },
            
            # Blocs de Données
            {
                'name': 'table',
                'label': 'Tableau',
                'icon': '📊',
                'category': 'custom',
                'description': 'Tableau interactif',
                'order': 20,
            },
            {
                'name': 'chart',
                'label': 'Graphique',
                'icon': '📈',
                'category': 'custom',
                'description': 'Graphiques Chart.js',
                'order': 21,
            },
            {
                'name': 'stats',
                'label': 'Statistiques',
                'icon': '📊',
                'category': 'custom',
                'description': 'Affichage de statistiques',
                'order': 22,
            },
            {
                'name': 'progress-bar',
                'label': 'Barre de Progression',
                'icon': '📊',
                'category': 'custom',
                'description': 'Barre de progression horizontale',
                'order': 23,
            },
            {
                'name': 'progress-circle',
                'label': 'Cercle de Progression',
                'icon': '⭕',
                'category': 'custom',
                'description': 'Cercle de progression',
                'order': 24,
            },
            {
                'name': 'timeline',
                'label': 'Chronologie',
                'icon': '⏱️',
                'category': 'custom',
                'description': 'Timeline d\'événements',
                'order': 25,
            },
            {
                'name': 'calendar',
                'label': 'Calendrier',
                'icon': '📅',
                'category': 'custom',
                'description': 'Calendrier avec événements',
                'order': 26,
            },
            {
                'name': 'countdown',
                'label': 'Compte à Rebours',
                'icon': '⏰',
                'category': 'custom',
                'description': 'Compte à rebours',
                'order': 27,
            },
            
            # Blocs de Formulaire
            {
                'name': 'form',
                'label': 'Formulaire',
                'icon': '📝',
                'category': 'custom',
                'description': 'Formulaire de contact',
                'order': 30,
            },
            {
                'name': 'form-newsletter',
                'label': 'Newsletter',
                'icon': '📧',
                'category': 'custom',
                'description': 'Formulaire newsletter',
                'order': 31,
            },
            {
                'name': 'form-search',
                'label': 'Recherche',
                'icon': '🔍',
                'category': 'custom',
                'description': 'Formulaire de recherche',
                'order': 32,
            },
            {
                'name': 'form-inscription',
                'label': 'Inscription',
                'icon': '✍️',
                'category': 'custom',
                'description': 'Formulaire d\'inscription',
                'order': 33,
            },
            {
                'name': 'booking-form',
                'label': 'Réservation',
                'icon': '📅',
                'category': 'custom',
                'description': 'Formulaire de réservation VTC',
                'order': 34,
            },
            {
                'name': 'contact-form',
                'label': 'Formulaire Contact',
                'icon': '📧',
                'category': 'custom',
                'description': 'Formulaire de contact',
                'order': 35,
            },
            
            # Blocs Interactifs
            {
                'name': 'tabs',
                'label': 'Onglets',
                'icon': '📑',
                'category': 'custom',
                'description': 'Onglets interactifs',
                'order': 40,
            },
            {
                'name': 'modal',
                'label': 'Modal',
                'icon': '🪟',
                'category': 'custom',
                'description': 'Popup modal',
                'order': 41,
            },
            
            # Blocs de Design
            {
                'name': 'hero',
                'label': 'Hero',
                'icon': '🎯',
                'category': 'content',
                'description': 'Section hero avec fond',
                'order': 0,
            },
            {
                'name': 'banner',
                'label': 'Bannière',
                'icon': '🎨',
                'category': 'custom',
                'description': 'Bannière avec image de fond',
                'order': 50,
            },
            {
                'name': 'cta-section',
                'label': 'CTA Section',
                'icon': '📢',
                'category': 'custom',
                'description': 'Section call-to-action',
                'order': 51,
            },
            {
                'name': 'feature-card',
                'label': 'Carte Fonctionnalité',
                'icon': '✨',
                'category': 'custom',
                'description': 'Carte de fonctionnalité',
                'order': 52,
            },
            {
                'name': 'icon-box',
                'label': 'Boîte Icône',
                'icon': '📦',
                'category': 'custom',
                'description': 'Boîte avec icône',
                'order': 53,
            },
            {
                'name': 'card',
                'label': 'Carte',
                'icon': '🃏',
                'category': 'custom',
                'description': 'Carte générique',
                'order': 54,
            },
            {
                'name': 'testimonials',
                'label': 'Témoignages',
                'icon': '💬',
                'category': 'custom',
                'description': 'Témoignages clients',
                'order': 55,
            },
            {
                'name': 'logo-grid',
                'label': 'Grille de Logos',
                'icon': '🏢',
                'category': 'custom',
                'description': 'Grille de logos partenaires',
                'order': 56,
            },
            {
                'name': 'team-member',
                'label': 'Membre d\'Équipe',
                'icon': '👤',
                'category': 'custom',
                'description': 'Carte membre d\'équipe',
                'order': 57,
            },
            {
                'name': 'features-grid',
                'label': 'Grille Fonctionnalités',
                'icon': '⭐',
                'category': 'custom',
                'description': 'Grille de fonctionnalités',
                'order': 58,
            },
            
            # Blocs VTC
            {
                'name': 'pricing-table-vtc',
                'label': 'Tarifs VTC',
                'icon': '💰',
                'category': 'custom',
                'description': 'Tableau de prix VTC',
                'order': 60,
            },
            {
                'name': 'service-zones',
                'label': 'Zones de Service',
                'icon': '📍',
                'category': 'custom',
                'description': 'Zones de service VTC',
                'order': 61,
            },
            {
                'name': 'vehicle-gallery',
                'label': 'Galerie Véhicules',
                'icon': '🚗',
                'category': 'custom',
                'description': 'Galerie de véhicules',
                'order': 62,
            },
            {
                'name': 'contact-buttons',
                'label': 'Boutons Contact',
                'icon': '📞',
                'category': 'custom',
                'description': 'Boutons de contact VTC',
                'order': 63,
            },
            {
                'name': 'badges',
                'label': 'Badges',
                'icon': '🏅',
                'category': 'custom',
                'description': 'Badges et certifications',
                'order': 64,
            },
            {
                'name': 'pricing',
                'label': 'Tarifs',
                'icon': '💳',
                'category': 'custom',
                'description': 'Tableau de tarifs',
                'order': 65,
            },
            
            # Blocs Utilitaires
            {
                'name': 'search-bar',
                'label': 'Barre de Recherche',
                'icon': '🔍',
                'category': 'custom',
                'description': 'Barre de recherche',
                'order': 70,
            },
            {
                'name': 'rating',
                'label': 'Évaluation',
                'icon': '⭐',
                'category': 'custom',
                'description': 'Système d\'évaluation',
                'order': 71,
            },
            {
                'name': 'social-links',
                'label': 'Liens Sociaux',
                'icon': '🔗',
                'category': 'custom',
                'description': 'Liens réseaux sociaux',
                'order': 72,
            },
            
            # Blocs Footer/Header
            {
                'name': 'header',
                'label': 'En-tête',
                'icon': '📋',
                'category': 'layout',
                'description': 'Header avec navigation et logo',
                'order': -11,
            },
            {
                'name': 'footer',
                'label': 'Pied de Page',
                'icon': '⬇️',
                'category': 'layout',
                'description': 'Footer personnalisé',
                'order': -6,
            },
            {
                'name': 'faq-section',
                'label': 'Section FAQ',
                'icon': '❓',
                'category': 'custom',
                'description': 'Section FAQ',
                'order': 80,
            },
        ]
        
        created_count = 0
        updated_count = 0
        
        for block_data in default_blocks:
            # Get default render template for this block type
            render_template = get_default_render_template(block_data['name'])
            
            block_type, created = BlockType.objects.get_or_create(
                name=block_data['name'],
                defaults={
                    'label': block_data['label'],
                    'icon': block_data['icon'],
                    'category': block_data['category'],
                    'description': block_data['description'],
                    'order': block_data['order'],
                    'is_active': True,
                    'schema': {},
                    'default_styles': {},
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
                for key, value in block_data.items():
                    if key != 'name' and getattr(block_type, key) != value:
                        setattr(block_type, key, value)
                        updated = True
                
                # Mettre à jour le render_template si nécessaire
                if not block_type.render_template:
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
