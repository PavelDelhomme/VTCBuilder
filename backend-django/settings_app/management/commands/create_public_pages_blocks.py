"""
Management command to create blocks and initialize public pages with exact content from existing pages
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from settings_app.models import SystemSettings
from blocks.models import BlockType
from billing.models import PricingPlan


class Command(BaseCommand):
    help = 'Crée les blocs nécessaires et initialise les pages publiques avec le contenu exact des pages existantes'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Création des blocs et initialisation des pages publiques...'))
        
        # 1. Créer les blocs nécessaires
        self._create_blocks()
        
        # 2. Initialiser les pages publiques avec le contenu exact
        self._init_public_pages()
        
        self.stdout.write(self.style.SUCCESS('\n✅ Terminé ! Les pages sont disponibles dans /admin/pages-public'))

    def _create_blocks(self):
        """Crée les blocs nécessaires pour reproduire les pages publiques"""
        self.stdout.write(self.style.SUCCESS('\n📦 Création des blocs...'))
        
        blocks_to_create = [
            {
                'name': 'hero',
                'label': 'Hero Section',
                'icon': '🎯',
                'category': 'layout',
                'description': 'Section hero avec titre, description et boutons CTA',
                'schema': {
                    'title': {'type': 'string', 'label': 'Titre', 'default': 'Le WordPress des Chauffeurs VTC'},
                    'subtitle': {'type': 'string', 'label': 'Sous-titre', 'default': 'Créez votre site VTC professionnel en quelques minutes'},
                    'primary_button_text': {'type': 'string', 'label': 'Texte bouton principal', 'default': '🚀 Démarrer gratuitement'},
                    'primary_button_link': {'type': 'string', 'label': 'Lien bouton principal', 'default': '/register'},
                    'secondary_button_text': {'type': 'string', 'label': 'Texte bouton secondaire', 'default': 'Voir les tarifs'},
                    'secondary_button_link': {'type': 'string', 'label': 'Lien bouton secondaire', 'default': '#pricing'},
                    'background_gradient': {'type': 'string', 'label': 'Dégradé de fond', 'default': 'from-blue-500 via-purple-600 to-pink-500'},
                },
                'default_styles': {
                    'padding': 'py-20 lg:py-32',
                    'textAlign': 'center',
                    'background': 'gradient',
                },
            },
            {
                'name': 'features_grid',
                'label': 'Grille de Fonctionnalités',
                'icon': '✨',
                'category': 'content',
                'description': 'Grille de fonctionnalités avec icônes, titres et descriptions',
                'schema': {
                    'title': {'type': 'string', 'label': 'Titre de la section', 'default': 'Tout ce dont vous avez besoin'},
                    'features': {
                        'type': 'array',
                        'label': 'Fonctionnalités',
                        'default': [
                            {'icon': '🎨', 'title': 'Site Professionnel', 'description': 'Designs modernes et responsive'},
                            {'icon': '📅', 'title': 'Réservations en Ligne', 'description': 'Système de réservation complet'},
                            {'icon': '💳', 'title': 'Paiements Intégrés', 'description': 'Acceptez les paiements en ligne'},
                        ],
                        'itemSchema': {
                            'icon': {'type': 'string'},
                            'title': {'type': 'string'},
                            'description': {'type': 'string'},
                        }
                    },
                    'columns': {'type': 'number', 'label': 'Nombre de colonnes', 'default': 3},
                },
                'default_styles': {
                    'padding': 'py-20',
                    'background': 'bg-white dark:bg-gray-800',
                },
            },
            {
                'name': 'pricing_cards',
                'label': 'Cartes de Tarification',
                'icon': '💰',
                'category': 'content',
                'description': 'Section de tarification avec cartes de plans',
                'schema': {
                    'title': {'type': 'string', 'label': 'Titre', 'default': 'Tarifs Transparents'},
                    'subtitle': {'type': 'string', 'label': 'Sous-titre', 'default': 'Choisissez le plan adapté à vos besoins'},
                    'show_plans': {'type': 'boolean', 'label': 'Afficher les plans depuis l\'API', 'default': True},
                },
                'default_styles': {
                    'padding': 'py-20',
                    'background': 'bg-gray-50 dark:bg-gray-900',
                },
            },
            {
                'name': 'cta_section',
                'label': 'Section Call-to-Action',
                'icon': '📢',
                'category': 'content',
                'description': 'Section CTA avec titre, description et bouton',
                'schema': {
                    'title': {'type': 'string', 'label': 'Titre', 'default': 'Prêt à démarrer ?'},
                    'description': {'type': 'string', 'label': 'Description', 'default': 'Créez votre site VTC professionnel dès aujourd\'hui'},
                    'button_text': {'type': 'string', 'label': 'Texte du bouton', 'default': '🚀 Créer mon compte gratuitement'},
                    'button_link': {'type': 'string', 'label': 'Lien du bouton', 'default': '/register'},
                    'background_gradient': {'type': 'string', 'label': 'Dégradé de fond', 'default': 'from-blue-600 to-purple-600'},
                },
                'default_styles': {
                    'padding': 'py-20',
                    'textAlign': 'center',
                },
            },
            {
                'name': 'faq_accordion',
                'label': 'FAQ Accordéon',
                'icon': '❓',
                'category': 'content',
                'description': 'FAQ avec accordéon et filtres par catégorie',
                'schema': {
                    'title': {'type': 'string', 'label': 'Titre', 'default': 'Questions fréquentes'},
                    'show_categories': {'type': 'boolean', 'label': 'Afficher les catégories', 'default': True},
                    'items': {
                        'type': 'array',
                        'label': 'Questions',
                        'default': [
                            {'category': 'general', 'question': 'Qu\'est-ce que VTCBuilder ?', 'answer': 'VTCBuilder est une plateforme complète...'},
                        ],
                        'itemSchema': {
                            'category': {'type': 'string'},
                            'question': {'type': 'string'},
                            'answer': {'type': 'string'},
                        }
                    },
                },
                'default_styles': {
                    'padding': 'py-20',
                },
            },
            {
                'name': 'contact_form',
                'label': 'Formulaire de Contact',
                'icon': '📧',
                'category': 'content',
                'description': 'Formulaire de contact avec validation',
                'schema': {
                    'title': {'type': 'string', 'label': 'Titre', 'default': 'Envoyez-nous un message'},
                    'fields': {
                        'type': 'array',
                        'label': 'Champs',
                        'default': ['name', 'email', 'subject', 'message'],
                    },
                    'submit_text': {'type': 'string', 'label': 'Texte du bouton', 'default': 'Envoyer le message'},
                },
                'default_styles': {
                    'maxWidth': '600px',
                    'margin': '0 auto',
                },
            },
            {
                'name': 'contact_info',
                'label': 'Informations de Contact',
                'icon': '📍',
                'category': 'content',
                'description': 'Affichage des coordonnées et horaires',
                'schema': {
                    'title': {'type': 'string', 'label': 'Titre', 'default': 'Nos coordonnées'},
                    'email': {'type': 'string', 'label': 'Email', 'default': 'support@vtcbuilder.com'},
                    'phone': {'type': 'string', 'label': 'Téléphone', 'default': '+33 1 23 45 67 89'},
                    'address': {'type': 'text', 'label': 'Adresse', 'default': '123 Avenue des Exemples\n75000 PARIS\nFrance'},
                    'show_hours': {'type': 'boolean', 'label': 'Afficher les horaires', 'default': True},
                },
                'default_styles': {},
            },
            {
                'name': 'docs_sections',
                'label': 'Sections de Documentation',
                'icon': '📚',
                'category': 'content',
                'description': 'Grille de sections de documentation avec liens',
                'schema': {
                    'title': {'type': 'string', 'label': 'Titre', 'default': 'Documentation'},
                    'quick_start_title': {'type': 'string', 'label': 'Titre démarrage rapide', 'default': '🚀 Démarrage rapide'},
                    'quick_start_text': {'type': 'string', 'label': 'Texte démarrage rapide', 'default': 'Nouveau sur VTCBuilder ? Suivez notre guide...'},
                    'quick_start_button_text': {'type': 'string', 'label': 'Texte bouton', 'default': 'Créer mon compte →'},
                    'quick_start_button_link': {'type': 'string', 'label': 'Lien bouton', 'default': '/register'},
                    'sections': {
                        'type': 'array',
                        'label': 'Sections',
                        'default': [
                            {
                                'icon': '🚀',
                                'title': 'Premiers pas',
                                'items': [
                                    {'title': 'Créer votre compte', 'description': 'Guide complet', 'href': '/docs/getting-started'},
                                ]
                            },
                        ],
                        'itemSchema': {
                            'icon': {'type': 'string'},
                            'title': {'type': 'string'},
                            'items': {'type': 'array'},
                        }
                    },
                },
                'default_styles': {
                    'padding': 'py-20',
                },
            },
            {
                'name': 'legal_content',
                'label': 'Contenu Légal',
                'icon': '⚖️',
                'category': 'content',
                'description': 'Contenu structuré pour pages légales (CGV, Privacy)',
                'schema': {
                    'title': {'type': 'string', 'label': 'Titre principal', 'default': 'Conditions Générales'},
                    'last_updated': {'type': 'string', 'label': 'Dernière mise à jour', 'default': ''},
                    'sections': {
                        'type': 'array',
                        'label': 'Sections',
                        'default': [
                            {'title': '1. Objet', 'level': 2, 'content': 'Les présentes CGV régissent...'},
                        ],
                        'itemSchema': {
                            'title': {'type': 'string'},
                            'level': {'type': 'number'},
                            'content': {'type': 'text'},
                        }
                    },
                },
                'default_styles': {
                    'maxWidth': '4xl',
                    'padding': 'py-20',
                },
            },
            {
                'name': 'features_list',
                'label': 'Liste de Fonctionnalités',
                'icon': '🎁',
                'category': 'content',
                'description': 'Liste détaillée de fonctionnalités avec icônes et descriptions',
                'schema': {
                    'title': {'type': 'string', 'label': 'Titre', 'default': 'Fonctionnalités'},
                    'features': {
                        'type': 'array',
                        'label': 'Fonctionnalités',
                        'default': [
                            {
                                'icon': '🎨',
                                'title': 'Site Professionnel',
                                'description': 'Créez un site web moderne',
                                'features': ['Templates pré-conçus', 'Éditeur visuel'],
                            },
                        ],
                        'itemSchema': {
                            'icon': {'type': 'string'},
                            'title': {'type': 'string'},
                            'description': {'type': 'string'},
                            'features': {'type': 'array'},
                        }
                    },
                },
                'default_styles': {
                    'padding': 'py-20',
                },
            },
        ]
        
        created_count = 0
        for block_data in blocks_to_create:
            block, created = BlockType.objects.get_or_create(
                name=block_data['name'],
                defaults={
                    'label': block_data['label'],
                    'icon': block_data['icon'],
                    'category': block_data['category'],
                    'description': block_data['description'],
                    'schema': block_data['schema'],
                    'default_styles': block_data['default_styles'],
                    'is_active': True,
                    'order': created_count,
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'  ✅ Bloc créé: {block.label} ({block.name})'))
            else:
                self.stdout.write(self.style.WARNING(f'  ⚠️  Bloc existe déjà: {block.label} ({block.name})'))
        
        self.stdout.write(self.style.SUCCESS(f'\n📦 {created_count} nouveau(x) bloc(s) créé(s)'))

    def _format_blocks(self, raw_blocks):
        """Formate les blocs avec la structure complète attendue par le frontend"""
        import uuid
        formatted_blocks = []
        
        for index, block in enumerate(raw_blocks):
            formatted_block = {
                'id': f'block-{uuid.uuid4().hex[:12]}-{index}',
                'type': block['type'],
                'data': block.get('data', {}),
                'styles': block.get('styles', {}),
                'order': index,
            }
            formatted_blocks.append(formatted_block)
        
        # Envelopper tous les blocs dans un conteneur par défaut
        container_block = {
            'id': f'block-container-{uuid.uuid4().hex[:12]}',
            'type': 'container',
            'data': {},
            'styles': {},
            'layout': 12,
            'container': 'container',
            'children': formatted_blocks,
            'order': 0,
        }
        
        return [container_block]

    def _init_public_pages(self):
        """Initialise les pages publiques avec le contenu exact des pages existantes"""
        self.stdout.write(self.style.SUCCESS('\n📄 Initialisation des pages publiques...'))
        
        settings = SystemSettings.get_settings()
        public_pages = settings.public_pages or {}
        
        # Page Homepage (reproduction exacte de page.tsx)
        homepage_blocks_raw = [
            {
                'type': 'hero',
                'data': {
                    'title': 'Le WordPress des Chauffeurs VTC',
                    'subtitle': 'Créez votre site VTC professionnel en quelques minutes. Gestion complète, réservations, paiements, tout inclus.',
                    'primary_button_text': '🚀 Démarrer gratuitement',
                    'primary_button_link': '/register',
                    'secondary_button_text': 'Voir les tarifs',
                    'secondary_button_link': '#pricing',
                    'background_gradient': 'from-blue-500 via-purple-600 to-pink-500',
                }
            },
            {
                'type': 'features_grid',
                'data': {
                    'title': 'Tout ce dont vous avez besoin',
                    'features': [
                        {'icon': '🎨', 'title': 'Site Professionnel', 'description': 'Designs modernes et responsive. Personnalisez votre site sans coder.'},
                        {'icon': '📅', 'title': 'Réservations en Ligne', 'description': 'Système de réservation complet avec calendrier et notifications.'},
                        {'icon': '💳', 'title': 'Paiements Intégrés', 'description': 'Acceptez les paiements en ligne. Cartes bancaires, virement, tout est possible.'},
                        {'icon': '📱', 'title': 'Mobile First', 'description': 'Votre site s\'adapte automatiquement aux smartphones et tablettes.'},
                        {'icon': '📊', 'title': 'Analytics Inclus', 'description': 'Suivez vos performances, réservations, revenus en temps réel.'},
                        {'icon': '🔒', 'title': 'Sécurisé & Rapide', 'description': 'Hébergement sécurisé, sauvegardes automatiques, SSL inclus.'},
                    ],
                    'columns': 3,
                }
            },
            {
                'type': 'pricing_cards',
                'data': {
                    'title': 'Tarifs Transparents',
                    'subtitle': 'Choisissez le plan adapté à vos besoins. Pas d\'engagement, changez de plan à tout moment.',
                    'show_plans': True,
                }
            },
            {
                'type': 'cta_section',
                'data': {
                    'title': 'Prêt à démarrer ?',
                    'description': 'Créez votre site VTC professionnel dès aujourd\'hui. Essai gratuit de 14 jours.',
                    'button_text': '🚀 Créer mon compte gratuitement',
                    'button_link': '/register',
                    'background_gradient': 'from-blue-600 to-purple-600',
                }
            },
        ]
        
        homepage_blocks = self._format_blocks(homepage_blocks_raw)
        
        # Page Docs (reproduction exacte de docs/page.tsx)
        docs_blocks_raw = [
            {
                'type': 'docs_sections',
                'data': {
                    'title': 'Documentation',
                    'quick_start_title': '🚀 Démarrage rapide',
                    'quick_start_text': 'Nouveau sur VTCBuilder ? Suivez notre guide de démarrage pour créer votre site en 10 minutes.',
                    'quick_start_button_text': 'Créer mon compte →',
                    'quick_start_button_link': '/register',
                    'sections': [
                        {
                            'icon': '🚀',
                            'title': 'Premiers pas',
                            'items': [
                                {'title': 'Créer votre compte', 'description': 'Guide complet pour créer votre compte VTCBuilder', 'href': '/docs/getting-started'},
                                {'title': 'Configuration initiale', 'description': 'Configurez votre premier site en quelques minutes', 'href': '/docs/initial-setup'},
                                {'title': 'Première réservation', 'description': 'Comment accepter et gérer votre première réservation', 'href': '/docs/first-booking'},
                            ]
                        },
                        {
                            'icon': '🎨',
                            'title': 'Gestion du site',
                            'items': [
                                {'title': 'Créer des pages', 'description': 'Créez et personnalisez les pages de votre site', 'href': '/docs/pages'},
                                {'title': 'Gérer le contenu', 'description': 'Ajoutez et modifiez le contenu de votre site', 'href': '/docs/content'},
                                {'title': 'Personnaliser le design', 'description': 'Modifiez les couleurs, polices et mise en page', 'href': '/docs/design'},
                                {'title': 'Gérer les médias', 'description': 'Téléchargez et organisez vos images et fichiers', 'href': '/docs/media'},
                            ]
                        },
                        {
                            'icon': '📅',
                            'title': 'Réservations',
                            'items': [
                                {'title': 'Configuration du calendrier', 'description': 'Configurez vos disponibilités et créneaux', 'href': '/docs/calendar'},
                                {'title': 'Gérer les réservations', 'description': 'Acceptez, modifiez ou annulez les réservations', 'href': '/docs/bookings'},
                                {'title': 'Notifications', 'description': 'Configurez les emails et SMS de confirmation', 'href': '/docs/notifications'},
                            ]
                        },
                        {
                            'icon': '🚗',
                            'title': 'Services VTC',
                            'items': [
                                {'title': 'Créer des services', 'description': 'Définissez vos offres et tarifs', 'href': '/docs/services'},
                                {'title': 'Gérer la flotte', 'description': 'Ajoutez et gérez vos véhicules', 'href': '/docs/fleet'},
                                {'title': 'Planification', 'description': 'Organisez les courses et assignez les véhicules', 'href': '/docs/planning'},
                            ]
                        },
                        {
                            'icon': '💳',
                            'title': 'Facturation',
                            'items': [
                                {'title': 'Configuration des paiements', 'description': 'Configurez Stripe, PayPal ou autres moyens de paiement', 'href': '/docs/payments'},
                                {'title': 'Gérer les abonnements', 'description': 'Choisissez et modifiez votre plan', 'href': '/docs/subscriptions'},
                                {'title': 'Factures et reçus', 'description': 'Générez et téléchargez vos factures', 'href': '/docs/invoices'},
                            ]
                        },
                        {
                            'icon': '👥',
                            'title': 'Équipe',
                            'items': [
                                {'title': 'Ajouter des utilisateurs', 'description': 'Invitez des membres de votre équipe', 'href': '/docs/users'},
                                {'title': 'Gérer les rôles', 'description': 'Définissez les permissions pour chaque membre', 'href': '/docs/roles'},
                                {'title': 'Communication', 'description': 'Utilisez les outils de communication intégrés', 'href': '/docs/communication'},
                            ]
                        },
                        {
                            'icon': '⚙️',
                            'title': 'Avancé',
                            'items': [
                                {'title': 'Nom de domaine personnalisé', 'description': 'Connectez votre propre domaine', 'href': '/docs/custom-domain'},
                                {'title': 'API et intégrations', 'description': 'Intégrez VTCBuilder avec vos outils', 'href': '/docs/api'},
                                {'title': 'Personnalisation avancée', 'description': 'Options de personnalisation avancées', 'href': '/docs/advanced'},
                            ]
                        },
                    ],
                }
            },
        ]
        
        docs_blocks = self._format_blocks(docs_blocks_raw)
        
        # Page Templates (galerie de modèles)
        templates_blocks_raw = [
            {
                'type': 'heading',
                'data': {
                    'text': 'Modèles de Sites VTC',
                    'level': 1,
                    'align': 'center',
                }
            },
            {
                'type': 'paragraph',
                'data': {
                    'content': 'Choisissez parmi nos modèles professionnels pré-conçus pour démarrer rapidement votre site VTC.',
                    'align': 'center',
                }
            },
            {
                'type': 'features_grid',
                'data': {
                    'title': 'Nos Modèles',
                    'features': [
                        {
                            'icon': '🚗',
                            'title': 'Modèle Classique',
                            'description': 'Design épuré et professionnel pour les chauffeurs VTC indépendants',
                        },
                        {
                            'icon': '🏢',
                            'title': 'Modèle Entreprise',
                            'description': 'Parfait pour les flottes et entreprises de transport',
                        },
                        {
                            'icon': '✨',
                            'title': 'Modèle Premium',
                            'description': 'Design moderne et élégant avec animations et effets visuels',
                        },
                    ],
                    'columns': 3,
                }
            },
            {
                'type': 'cta_section',
                'data': {
                    'title': 'Prêt à choisir votre modèle ?',
                    'description': 'Créez votre compte gratuitement et accédez à tous nos modèles.',
                    'button_text': '🚀 Démarrer gratuitement',
                    'button_link': '/register',
                    'background_gradient': 'from-blue-600 to-purple-600',
                }
            },
        ]
        templates_blocks = self._format_blocks(templates_blocks_raw)
        
        # Page Contact (reproduction exacte de contact/page.tsx)
        contact_blocks_raw = [
            {
                'type': 'contact_form',
                'data': {
                    'title': 'Envoyez-nous un message',
                    'fields': ['name', 'email', 'subject', 'message'],
                    'submit_text': 'Envoyer le message',
                }
            },
            {
                'type': 'contact_info',
                'data': {
                    'title': 'Nos coordonnées',
                    'email': 'support@vtcbuilder.com',
                    'phone': '+33 1 23 45 67 89',
                    'address': '123 Avenue des Exemples\n75000 PARIS\nFrance',
                    'show_hours': True,
                }
            },
        ]
        
        contact_blocks = self._format_blocks(contact_blocks_raw)
        
        # Page FAQ (reproduction exacte de faq/page.tsx)
        faq_blocks_raw = [
            {
                'type': 'faq_accordion',
                'data': {
                    'title': 'Questions fréquentes',
                    'show_categories': True,
                    'items': [
                        {'category': 'general', 'question': 'Qu\'est-ce que VTCBuilder ?', 'answer': 'VTCBuilder est une plateforme SaaS complète qui permet aux chauffeurs VTC de créer et gérer leur site web professionnel. Vous pouvez gérer vos réservations, paiements, véhicules et équipe depuis une interface unique et intuitive.'},
                        {'category': 'general', 'question': 'Combien coûte VTCBuilder ?', 'answer': 'Nous proposons plusieurs plans tarifaires adaptés à vos besoins, allant de 19€/mois pour le plan Starter jusqu\'à 79€/mois pour le plan Entreprise. Tous les plans incluent un essai gratuit de 14 jours, sans engagement.'},
                        {'category': 'account', 'question': 'Comment créer mon compte ?', 'answer': 'Cliquez sur "Créer un compte" en haut à droite, remplissez le formulaire avec vos informations, et vous recevrez un email de confirmation. Une fois votre compte créé, vous pourrez configurer votre site en quelques minutes.'},
                        {'category': 'account', 'question': 'Puis-je essayer gratuitement ?', 'answer': 'Oui ! Tous nos plans incluent un essai gratuit de 14 jours. Vous pouvez tester toutes les fonctionnalités sans carte bancaire. À la fin de l\'essai, vous choisissez de continuer avec un plan payant ou d\'annuler sans frais.'},
                        {'category': 'account', 'question': 'Puis-je changer de plan plus tard ?', 'answer': 'Absolument ! Vous pouvez passer à un plan supérieur ou inférieur à tout moment depuis votre tableau de bord. Les changements sont appliqués immédiatement, et nous ajustons la facturation au prorata.'},
                        {'category': 'features', 'question': 'Puis-je utiliser mon propre nom de domaine ?', 'answer': 'Oui, c\'est possible avec les plans Business et Entreprise. Vous pouvez acheter un nom de domaine directement depuis l\'interface ou connecter un domaine existant. Nous incluons le certificat SSL gratuitement.'},
                        {'category': 'features', 'question': 'Combien d\'utilisateurs puis-je ajouter ?', 'answer': 'Le nombre d\'utilisateurs dépend de votre plan : Starter (1 utilisateur), Business (5 utilisateurs), Entreprise (illimité). Chaque plan peut être adapté selon vos besoins spécifiques.'},
                        {'category': 'features', 'question': 'Puis-je personnaliser le design de mon site ?', 'answer': 'Oui ! Vous avez accès à plusieurs templates professionnels que vous pouvez personnaliser complètement : couleurs, polices, images, mise en page. Un éditeur visuel vous permet de modifier votre site sans coder.'},
                        {'category': 'billing', 'question': 'Quels moyens de paiement acceptez-vous ?', 'answer': 'Nous acceptons les cartes bancaires (Visa, Mastercard, Amex), PayPal, et les virements bancaires pour les abonnements annuels. Tous les paiements sont sécurisés via Stripe.'},
                        {'category': 'billing', 'question': 'Quand suis-je facturé ?', 'answer': 'Vous êtes facturé mensuellement ou annuellement selon le plan choisi. La première facturation a lieu à la fin de votre période d\'essai gratuit. Vous recevrez une facture par email à chaque échéance.'},
                        {'category': 'billing', 'question': 'Puis-je annuler mon abonnement ?', 'answer': 'Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. Votre accès reste actif jusqu\'à la fin de la période payée. Aucun frais d\'annulation n\'est appliqué.'},
                        {'category': 'technical', 'question': 'Mon site sera-t-il optimisé pour mobile ?', 'answer': 'Oui, tous nos templates sont 100% responsive et optimisés pour mobile. Votre site s\'adaptera automatiquement aux smartphones et tablettes pour offrir la meilleure expérience utilisateur.'},
                        {'category': 'technical', 'question': 'Qu\'en est-il de la sécurité et de la confidentialité ?', 'answer': 'Nous prenons la sécurité très au sérieux. Tous les sites sont protégés par SSL/HTTPS, nos serveurs sont sécurisés et régulièrement mis à jour, et nous respectons strictement le RGPD. Vos données sont sauvegardées quotidiennement.'},
                        {'category': 'technical', 'question': 'Puis-je exporter mes données ?', 'answer': 'Oui, vous pouvez exporter toutes vos données (réservations, clients, factures) à tout moment depuis votre tableau de bord. Les données sont exportées au format CSV pour faciliter leur utilisation.'},
                        {'category': 'support', 'question': 'Quel type de support proposez-vous ?', 'answer': 'Nous offrons un support par email pour tous les utilisateurs, avec réponse sous 24h. Les plans Business et Entreprise bénéficient d\'un support prioritaire et d\'une assistance téléphonique.'},
                        {'category': 'support', 'question': 'Avez-vous une documentation ?', 'answer': 'Oui, nous avons une documentation complète disponible sur /docs avec des guides pas à pas, des tutoriels vidéo, et des réponses aux questions fréquentes. Nous mettons régulièrement à jour cette documentation.'},
                    ],
                }
            },
            {
                'type': 'cta_section',
                'data': {
                    'title': 'Vous ne trouvez pas votre réponse ?',
                    'description': 'Contactez notre équipe support qui se fera un plaisir de vous aider.',
                    'button_text': 'Nous contacter →',
                    'button_link': '/contact',
                    'background_gradient': 'from-blue-600 to-purple-600',
                }
            },
        ]
        
        faq_blocks = self._format_blocks(faq_blocks_raw)
        
        # Page Legal Terms (reproduction exacte de legal/terms/page.tsx)
        terms_blocks_raw = [
            {
                'type': 'legal_content',
                'data': {
                    'title': 'Conditions Générales de Vente',
                    'last_updated': timezone.now().strftime('%d/%m/%Y'),
                    'sections': [
                        {
                            'title': '1. Objet',
                            'level': 2,
                            'content': 'Les présentes Conditions Générales de Vente (CGV) régissent l\'utilisation de la plateforme VTCBuilder, un service SaaS (Software as a Service) permettant aux professionnels du secteur VTC de créer et gérer leur site web professionnel, leurs réservations, leur facturation et leur équipe.\n\nEn souscrivant à un abonnement VTCBuilder, le Client accepte sans réserve les présentes CGV.',
                        },
                        {
                            'title': '2. Services proposés',
                            'level': 2,
                            'content': 'VTCBuilder propose plusieurs formules d\'abonnement :\n\n• Plan Starter : Formule de base avec fonctionnalités essentielles\n• Plan Business : Formule complète avec fonctionnalités avancées\n• Plan Entreprise : Formule premium avec toutes les fonctionnalités et support prioritaire\n\nLes caractéristiques détaillées de chaque plan sont disponibles sur notre site web à l\'adresse vtcbuilder.com/#pricing.',
                        },
                        {
                            'title': '3. Tarifs et modalités de paiement',
                            'level': 2,
                            'content': 'Les tarifs des abonnements sont indiqués en euros TTC. Ils sont modifiables à tout moment, mais les modifications ne s\'appliquent qu\'aux nouveaux abonnements. Les abonnements en cours restent au tarif souscrit.\n\nUn essai gratuit de 14 jours est proposé pour tous les nouveaux clients. Aucune carte bancaire n\'est requise pour démarrer l\'essai. À la fin de la période d\'essai, l\'abonnement devient payant automatiquement, sauf annulation par le Client.\n\nLe paiement s\'effectue par carte bancaire, PayPal ou virement bancaire. Le paiement est prélevé mensuellement ou annuellement selon le plan choisi.',
                        },
                        {
                            'title': '4. Obligations du Client',
                            'level': 2,
                            'content': 'Le Client s\'engage à :\n\n• Fournir des informations exactes et à jour lors de l\'inscription\n• Maintenir la confidentialité de ses identifiants de connexion\n• Utiliser la plateforme conformément à sa destination et aux lois en vigueur\n• Ne pas tenter de contourner les mesures de sécurité mises en place\n• Respecter les droits de propriété intellectuelle de VTCBuilder',
                        },
                        {
                            'title': '5. Obligations de VTCBuilder',
                            'level': 2,
                            'content': 'VTCBuilder s\'engage à :\n\n• Assurer la disponibilité et la sécurité de la plateforme dans les meilleures conditions\n• Effectuer des sauvegardes régulières des données du Client\n• Respecter la confidentialité des données du Client conformément au RGPD\n• Maintenir un support client réactif',
                        },
                        {
                            'title': '6. Résiliation',
                            'level': 2,
                            'content': 'Le Client peut résilier son abonnement à tout moment depuis son tableau de bord. La résiliation prend effet à la fin de la période payée. Aucun remboursement n\'est effectué pour la période en cours.\n\nVTCBuilder se réserve le droit de suspendre ou résilier l\'accès d\'un Client en cas de manquement grave aux présentes CGV, notamment en cas d\'utilisation frauduleuse ou de non-paiement.',
                        },
                        {
                            'title': '7. Propriété intellectuelle',
                            'level': 2,
                            'content': 'La plateforme VTCBuilder, ses composants, son code source, ses logos et marques sont la propriété exclusive de VTCBuilder. Le Client dispose d\'un droit d\'utilisation non exclusif et non transférable dans le cadre de son abonnement.',
                        },
                        {
                            'title': '8. Protection des données',
                            'level': 2,
                            'content': 'Le traitement des données personnelles est décrit dans notre Politique de Confidentialité. VTCBuilder s\'engage à respecter le Règlement Général sur la Protection des Données (RGPD).',
                        },
                        {
                            'title': '9. Responsabilité',
                            'level': 2,
                            'content': 'VTCBuilder ne pourra être tenu responsable des dommages indirects résultant de l\'utilisation ou de l\'impossibilité d\'utiliser la plateforme. La responsabilité de VTCBuilder est limitée au montant des sommes versées par le Client au titre de l\'abonnement en cours.',
                        },
                        {
                            'title': '10. Droit applicable et juridiction',
                            'level': 2,
                            'content': 'Les présentes CGV sont régies par le droit français. En cas de litige, et après tentative de résolution amiable, les tribunaux français seront seuls compétents.',
                        },
                        {
                            'title': '11. Contact',
                            'level': 2,
                            'content': 'Pour toute question concernant les présentes CGV, vous pouvez nous contacter à :\n\nVTCBuilder\nEmail : legal@vtcbuilder.com\nAdresse : 123 Avenue des Exemples, 75000 PARIS, France',
                        },
                    ],
                }
            },
        ]
        
        terms_blocks = self._format_blocks(terms_blocks_raw)
        
        # Page Legal Privacy (reproduction exacte de legal/privacy/page.tsx)
        privacy_blocks_raw = [
            {
                'type': 'legal_content',
                'data': {
                    'title': 'Politique de Confidentialité',
                    'last_updated': timezone.now().strftime('%d/%m/%Y'),
                    'sections': [
                        {
                            'title': '1. Introduction',
                            'level': 2,
                            'content': 'VTCBuilder ("nous", "notre", "nos") s\'engage à protéger la confidentialité de vos données personnelles. Cette Politique de Confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations personnelles conformément au Règlement Général sur la Protection des Données (RGPD).',
                        },
                        {
                            'title': '2. Données collectées',
                            'level': 2,
                            'content': 'Données que vous nous fournissez :\n• Nom, prénom, adresse email, numéro de téléphone\n• Informations de facturation et de paiement\n• Contenu que vous créez sur votre site (pages, services, réservations)\n• Communications avec notre support client\n\nDonnées collectées automatiquement :\n• Adresse IP, type de navigateur, système d\'exploitation\n• Données de navigation et d\'utilisation de la plateforme\n• Cookies et technologies similaires\n• Logs d\'accès et d\'erreurs',
                        },
                        {
                            'title': '3. Utilisation des données',
                            'level': 2,
                            'content': 'Nous utilisons vos données personnelles pour :\n• Fournir, maintenir et améliorer nos services\n• Traiter vos paiements et gérer votre abonnement\n• Vous envoyer des notifications importantes concernant votre compte\n• Répondre à vos demandes de support\n• Envoyer des communications marketing (avec votre consentement)\n• Assurer la sécurité de la plateforme et prévenir la fraude\n• Respecter nos obligations légales',
                        },
                        {
                            'title': '4. Base légale du traitement',
                            'level': 2,
                            'content': 'Nous traitons vos données personnelles sur les bases légales suivantes :\n• Exécution du contrat : Pour fournir nos services conformément à votre abonnement\n• Consentement : Pour les communications marketing et les cookies non essentiels\n• Obligation légale : Pour respecter nos obligations fiscales et comptables\n• Intérêt légitime : Pour assurer la sécurité et améliorer nos services',
                        },
                        {
                            'title': '5. Partage des données',
                            'level': 2,
                            'content': 'Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos données avec :\n• Prestataires de services : Processeurs de paiement (Stripe), services d\'hébergement, services d\'email\n• Autorités légales : Si requis par la loi ou une décision de justice\n• Partenaires de confiance : Avec votre consentement explicite\n\nTous nos prestataires sont tenus de respecter la confidentialité de vos données et sont conformes au RGPD.',
                        },
                        {
                            'title': '6. Conservation des données',
                            'level': 2,
                            'content': 'Nous conservons vos données personnelles pendant toute la durée de votre abonnement et jusqu\'à 3 ans après la résiliation de votre compte, sauf obligation légale de conservation plus longue. Après cette période, vos données sont supprimées de manière sécurisée.',
                        },
                        {
                            'title': '7. Vos droits',
                            'level': 2,
                            'content': 'Conformément au RGPD, vous disposez des droits suivants :\n• Droit d\'accès : Vous pouvez demander une copie de vos données personnelles\n• Droit de rectification : Vous pouvez corriger vos données inexactes\n• Droit à l\'effacement : Vous pouvez demander la suppression de vos données\n• Droit à la limitation : Vous pouvez demander la limitation du traitement\n• Droit à la portabilité : Vous pouvez récupérer vos données dans un format structuré\n• Droit d\'opposition : Vous pouvez vous opposer à certains traitements\n• Droit de retirer votre consentement : À tout moment pour les traitements basés sur le consentement\n\nPour exercer ces droits, contactez-nous à l\'adresse : privacy@vtcbuilder.com',
                        },
                        {
                            'title': '8. Cookies',
                            'level': 2,
                            'content': 'Nous utilisons des cookies pour améliorer votre expérience sur notre site. Les cookies essentiels sont nécessaires au fonctionnement de la plateforme. Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.',
                        },
                        {
                            'title': '9. Sécurité',
                            'level': 2,
                            'content': 'Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, perte, destruction ou altération. Cela inclut le cryptage SSL/TLS, les sauvegardes régulières, et la surveillance de la sécurité.',
                        },
                        {
                            'title': '10. Transferts internationaux',
                            'level': 2,
                            'content': 'Vos données sont principalement hébergées dans l\'Union Européenne. En cas de transfert vers un pays tiers, nous nous assurons que des garanties appropriées sont en place conformément au RGPD.',
                        },
                        {
                            'title': '11. Modifications',
                            'level': 2,
                            'content': 'Nous pouvons modifier cette Politique de Confidentialité à tout moment. Les modifications importantes vous seront communiquées par email. Nous vous encourageons à consulter régulièrement cette page.',
                        },
                        {
                            'title': '12. Contact',
                            'level': 2,
                            'content': 'Pour toute question concernant cette Politique de Confidentialité ou pour exercer vos droits, contactez :\n\nDélégué à la Protection des Données (DPO)\nVTCBuilder\nEmail : privacy@vtcbuilder.com\nAdresse : 123 Avenue des Exemples, 75000 PARIS, France\n\nVous avez également le droit de déposer une plainte auprès de la CNIL (Commission Nationale de l\'Informatique et des Libertés) si vous estimez que vos droits ne sont pas respectés.',
                        },
                    ],
                }
            },
        ]
        
        privacy_blocks = self._format_blocks(privacy_blocks_raw)
        
        # Page Features (reproduction exacte de features/page.tsx)
        features_blocks_raw = [
            {
                'type': 'features_list',
                'data': {
                    'title': 'Fonctionnalités',
                    'features': [
                        {
                            'icon': '🎨',
                            'title': 'Site Professionnel',
                            'description': 'Créez un site web moderne et responsive pour votre activité VTC. Personnalisez les couleurs, les polices et la mise en page sans coder.',
                            'features': ['Templates pré-conçus', 'Éditeur visuel', 'Responsive design', 'SEO intégré'],
                        },
                        {
                            'icon': '📅',
                            'title': 'Réservations en Ligne',
                            'description': 'Système de réservation complet avec calendrier interactif. Gérez vos créneaux, acceptez ou refusez les réservations en temps réel.',
                            'features': ['Calendrier interactif', 'Notifications email', 'Gestion des disponibilités', 'Historique des réservations'],
                        },
                        {
                            'icon': '💳',
                            'title': 'Paiements Intégrés',
                            'description': 'Acceptez les paiements en ligne de manière sécurisée. Cartes bancaires, virement bancaire, tout est possible.',
                            'features': ['Stripe/PayPal intégré', 'Factures automatiques', 'Historique des paiements', 'Paiement récurrent'],
                        },
                        {
                            'icon': '📱',
                            'title': 'Mobile First',
                            'description': 'Votre site s\'adapte automatiquement aux smartphones et tablettes. Vos clients peuvent réserver depuis n\'importe quel appareil.',
                            'features': ['Design responsive', 'Application mobile', 'Notifications push', 'Interface tactile'],
                        },
                        {
                            'icon': '📊',
                            'title': 'Analytics & Statistiques',
                            'description': 'Suivez vos performances en temps réel. Analysez vos réservations, revenus et comportement des clients.',
                            'features': ['Tableau de bord', 'Rapports détaillés', 'Export des données', 'Graphiques interactifs'],
                        },
                        {
                            'icon': '🔒',
                            'title': 'Sécurité & Sauvegarde',
                            'description': 'Hébergement sécurisé avec sauvegardes automatiques quotidiennes. SSL inclus et conformité RGPD.',
                            'features': ['Sauvegardes automatiques', 'SSL/HTTPS', 'Conformité RGPD', 'Sécurité des données'],
                        },
                        {
                            'icon': '👥',
                            'title': 'Gestion d\'Équipe',
                            'description': 'Gérez plusieurs chauffeurs et opérateurs. Définissez les permissions et les rôles de chaque membre.',
                            'features': ['Gestion multi-utilisateurs', 'Rôles et permissions', 'Planification d\'équipe', 'Communication interne'],
                        },
                        {
                            'icon': '🚗',
                            'title': 'Gestion de Flotte',
                            'description': 'Gérez votre flotte de véhicules. Suivez les disponibilités, les entretiens et les statistiques par véhicule.',
                            'features': ['Inventaire des véhicules', 'Planning d\'entretien', 'Statistiques par véhicule', 'Géolocalisation'],
                        },
                        {
                            'icon': '📧',
                            'title': 'Communication',
                            'description': 'Communiquez avec vos clients via email et SMS. Envoyez des confirmations, rappels et notifications automatiques.',
                            'features': ['Emails automatiques', 'SMS de confirmation', 'Templates de messages', 'Historique des communications'],
                        },
                        {
                            'icon': '🌐',
                            'title': 'Nom de Domaine',
                            'description': 'Utilisez votre propre nom de domaine personnalisé. Achetez et configurez votre domaine directement depuis l\'interface.',
                            'features': ['Achat de domaine', 'Configuration DNS', 'Certificat SSL', 'Sous-domaines'],
                        },
                        {
                            'icon': '🎯',
                            'title': 'Marketing',
                            'description': 'Outils marketing intégrés pour promouvoir votre activité. Campagnes email, codes promo et intégrations réseaux sociaux.',
                            'features': ['Campagnes email', 'Codes promo', 'Intégration réseaux sociaux', 'Analytics marketing'],
                        },
                        {
                            'icon': '⚙️',
                            'title': 'Personnalisation Avancée',
                            'description': 'Personnalisez chaque aspect de votre site. Modifiez les templates, ajoutez vos propres images et configurez tous les paramètres.',
                            'features': ['Éditeur avancé', 'Bibliothèque de médias', 'Thèmes personnalisables', 'Widgets et modules'],
                        },
                    ],
                }
            },
            {
                'type': 'cta_section',
                'data': {
                    'title': 'Prêt à utiliser toutes ces fonctionnalités ?',
                    'description': 'Créez votre compte gratuitement et commencez à utiliser VTCBuilder dès aujourd\'hui.',
                    'button_text': '🚀 Démarrer gratuitement',
                    'button_link': '/register',
                    'background_gradient': 'from-blue-600 to-purple-600',
                }
            },
        ]
        features_blocks = self._format_blocks(features_blocks_raw)
        
        # Pages à créer/mettre à jour
        pages_to_create = {
            'home': {
                'title': 'Accueil',
                'description': 'Page d\'accueil VTCBuilder',
                'slug': 'home',
                'blocks': homepage_blocks,
                'meta_title': 'VTCBuilder - Le WordPress des chauffeurs VTC',
                'meta_description': 'Plateforme complète pour créer et gérer votre site VTC professionnel',
                'is_active': True,
                'order': 1,
            },
            'docs': {
                'title': 'Documentation',
                'description': 'Documentation complète de VTCBuilder',
                'slug': 'docs',
                'blocks': docs_blocks,
                'meta_title': 'Documentation - VTCBuilder',
                'meta_description': 'Documentation complète pour utiliser VTCBuilder',
                'is_active': True,
                'order': 2,
            },
            'templates': {
                'title': 'Modèles de Sites',
                'description': 'Galerie de modèles pré-conçus pour votre site VTC',
                'slug': 'templates',
                'blocks': templates_blocks,
                'meta_title': 'Modèles de Sites - VTCBuilder',
                'meta_description': 'Choisissez parmi nos modèles professionnels pour votre site VTC',
                'is_active': True,
                'order': 3,
            },
            'contact': {
                'title': 'Contact',
                'description': 'Page de contact avec formulaire',
                'slug': 'contact',
                'blocks': contact_blocks,
                'meta_title': 'Contact - VTCBuilder',
                'meta_description': 'Contactez l\'équipe VTCBuilder',
                'is_active': True,
                'order': 4,
            },
            'faq': {
                'title': 'FAQ',
                'description': 'Questions fréquemment posées',
                'slug': 'faq',
                'blocks': faq_blocks,
                'meta_title': 'FAQ - VTCBuilder',
                'meta_description': 'Réponses aux questions fréquemment posées',
                'is_active': True,
                'order': 5,
            },
            'legal/terms': {
                'title': 'Conditions Générales de Vente',
                'description': 'CGV de VTCBuilder',
                'slug': 'legal/terms',
                'blocks': terms_blocks,
                'meta_title': 'CGV - VTCBuilder',
                'meta_description': 'Conditions Générales de Vente',
                'is_active': True,
                'order': 6,
            },
            'legal/privacy': {
                'title': 'Politique de Confidentialité',
                'description': 'Politique de confidentialité',
                'slug': 'legal/privacy',
                'blocks': privacy_blocks,
                'meta_title': 'Politique de Confidentialité - VTCBuilder',
                'meta_description': 'Politique de confidentialité et protection des données',
                'is_active': True,
                'order': 7,
            },
            'features': {
                'title': 'Fonctionnalités',
                'description': 'Toutes les fonctionnalités de VTCBuilder',
                'slug': 'features',
                'blocks': features_blocks,
                'meta_title': 'Fonctionnalités - VTCBuilder',
                'meta_description': 'Découvrez toutes les fonctionnalités de VTCBuilder',
                'is_active': True,
                'order': 8,
            },
        }
        
        created_count = 0
        updated_count = 0
        
        for slug, page_data in pages_to_create.items():
            if slug not in public_pages:
                public_pages[slug] = page_data
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'  ✅ Page créée: {page_data["title"]} ({slug})'))
            else:
                # Mettre à jour avec les nouveaux blocs
                existing_page = public_pages[slug]
                existing_page.update(page_data)
                updated_count += 1
                self.stdout.write(self.style.WARNING(f'  🔄 Page mise à jour: {page_data["title"]} ({slug})'))
        
        # Sauvegarder les pages publiques
        settings.public_pages = public_pages
        settings.save(update_fields=['public_pages'])
        
        # Mettre à jour aussi la page d'accueil (homepage) si elle existe
        if 'home' in pages_to_create:
            homepage_formatted = pages_to_create['home']['blocks']
            if settings.public_homepage_blocks != homepage_formatted:
                settings.public_homepage_blocks = homepage_formatted
                settings.public_homepage_meta_title = pages_to_create['home']['meta_title']
                settings.public_homepage_meta_description = pages_to_create['home']['meta_description']
                settings.save(update_fields=['public_homepage_blocks', 'public_homepage_meta_title', 'public_homepage_meta_description'])
                self.stdout.write(self.style.SUCCESS('  ✅ Page d\'accueil mise à jour'))
        
        self.stdout.write(self.style.SUCCESS(f'\n📄 {created_count} page(s) créée(s), {updated_count} page(s) mise(s) à jour'))

