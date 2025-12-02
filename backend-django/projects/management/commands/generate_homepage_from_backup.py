"""
Management command to generate the homepage with blocks matching the current design
"""
from django.core.management.base import BaseCommand
from settings_app.models import SystemSettings
from .backup_homepage import Command as BackupCommand
import json


class Command(BaseCommand):
    help = 'Generate homepage blocks matching the current VTCBuilder landing page design'

    def add_arguments(self, parser):
        parser.add_argument(
            '--no-backup',
            action='store_true',
            help='Skip backup before generating (not recommended)',
        )

    def handle(self, *args, **options):
        try:
            settings = SystemSettings.objects.first()
            if not settings:
                self.stdout.write(self.style.ERROR('❌ SystemSettings not found'))
                return
            
            # Backup current homepage before generating new one
            if not options['no_backup']:
                self.stdout.write(self.style.WARNING('💾 Création d\'une sauvegarde avant génération...'))
                backup_cmd = BackupCommand()
                backup_file = backup_cmd.handle()
                if backup_file:
                    self.stdout.write(self.style.SUCCESS('✅ Sauvegarde créée avec succès\n'))
                else:
                    self.stdout.write(self.style.WARNING('⚠️  Échec de la sauvegarde, mais continuation...\n'))
            
            # Generate blocks matching the current design
            blocks = [
                # Hero Section
                {
                    'id': 'hero-1',
                    'type': 'hero',
                    'data': {
                        'title': 'Le WordPress des Chauffeurs VTC',
                        'subtitle': 'Créez votre site VTC professionnel en quelques minutes. Gestion complète, réservations, paiements, tout inclus.',
                        'buttons': [
                            {
                                'text': '🚀 Démarrer gratuitement',
                                'url': '/register',
                                'style': 'primary',
                            },
                            {
                                'text': 'Voir les tarifs',
                                'url': '#pricing',
                                'style': 'secondary',
                            },
                        ],
                        'background_image': '',
                        'overlay': False,
                    },
                    'styles': {
                        'background': 'gradient-to-br from-blue-500 via-purple-600 to-pink-500',
                        'text_align': 'center',
                        'padding_top': '80px',
                        'padding_bottom': '128px',
                        'color': '#FFFFFF',
                    },
                },
                # Features Section Container
                {
                    'id': 'section-features-1',
                    'type': 'section',
                    'data': {
                        'title': '',
                        'background': 'white',
                    },
                    'styles': {
                        'background_color': '#FFFFFF',
                        'padding_top': '80px',
                        'padding_bottom': '80px',
                    },
                    'children': [
                        # Features Title
                        {
                            'id': 'heading-features-1',
                            'type': 'heading',
                            'data': {
                                'text': 'Tout ce dont vous avez besoin',
                                'level': 2,
                            },
                            'styles': {
                                'font_size': '3xl',
                                'font_weight': 'bold',
                                'text_align': 'center',
                                'margin_bottom': '48px',
                            },
                        },
                        # Features Grid Container
                        {
                            'id': 'grid-features-1',
                            'type': 'grid-container',
                            'data': {
                                'columns': 3,
                                'gap': '32px',
                            },
                            'styles': {
                                'max_width': '1280px',
                                'margin': '0 auto',
                                'padding': '0 16px',
                            },
                            'children': [
                                # Feature 1
                                {
                                    'id': 'feature-1',
                                    'type': 'feature-card',
                                    'data': {
                                        'icon': '🎨',
                                        'title': 'Site Professionnel',
                                        'description': 'Designs modernes et responsive. Personnalisez votre site sans coder.',
                                        'link_text': '',
                                        'link_url': '',
                                    },
                                    'styles': {
                                        'text_align': 'center',
                                        'padding': '24px',
                                        'border_radius': '8px',
                                    },
                                },
                                # Feature 2
                                {
                                    'id': 'feature-2',
                                    'type': 'feature-card',
                                    'data': {
                                        'icon': '📅',
                                        'title': 'Réservations en Ligne',
                                        'description': 'Système de réservation complet avec calendrier et notifications.',
                                        'link_text': '',
                                        'link_url': '',
                                    },
                                    'styles': {
                                        'text_align': 'center',
                                        'padding': '24px',
                                        'border_radius': '8px',
                                    },
                                },
                                # Feature 3
                                {
                                    'id': 'feature-3',
                                    'type': 'feature-card',
                                    'data': {
                                        'icon': '💳',
                                        'title': 'Paiements Intégrés',
                                        'description': 'Acceptez les paiements en ligne. Cartes bancaires, virement, tout est possible.',
                                        'link_text': '',
                                        'link_url': '',
                                    },
                                    'styles': {
                                        'text_align': 'center',
                                        'padding': '24px',
                                        'border_radius': '8px',
                                    },
                                },
                                # Feature 4
                                {
                                    'id': 'feature-4',
                                    'type': 'feature-card',
                                    'data': {
                                        'icon': '📱',
                                        'title': 'Mobile First',
                                        'description': 'Votre site s\'adapte automatiquement aux smartphones et tablettes.',
                                        'link_text': '',
                                        'link_url': '',
                                    },
                                    'styles': {
                                        'text_align': 'center',
                                        'padding': '24px',
                                        'border_radius': '8px',
                                    },
                                },
                                # Feature 5
                                {
                                    'id': 'feature-5',
                                    'type': 'feature-card',
                                    'data': {
                                        'icon': '📊',
                                        'title': 'Analytics Inclus',
                                        'description': 'Suivez vos performances, réservations, revenus en temps réel.',
                                        'link_text': '',
                                        'link_url': '',
                                    },
                                    'styles': {
                                        'text_align': 'center',
                                        'padding': '24px',
                                        'border_radius': '8px',
                                    },
                                },
                                # Feature 6
                                {
                                    'id': 'feature-6',
                                    'type': 'feature-card',
                                    'data': {
                                        'icon': '🔒',
                                        'title': 'Sécurisé & Rapide',
                                        'description': 'Hébergement sécurisé, sauvegardes automatiques, SSL inclus.',
                                        'link_text': '',
                                        'link_url': '',
                                    },
                                    'styles': {
                                        'text_align': 'center',
                                        'padding': '24px',
                                        'border_radius': '8px',
                                    },
                                },
                            ],
                        },
                    ],
                },
                # Pricing Section
                {
                    'id': 'section-pricing-1',
                    'type': 'section',
                    'data': {
                        'title': '',
                        'background': 'gray-50',
                    },
                    'styles': {
                        'background_color': '#F9FAFB',
                        'padding_top': '80px',
                        'padding_bottom': '80px',
                    },
                    'children': [
                        # Pricing Title
                        {
                            'id': 'heading-pricing-1',
                            'type': 'heading',
                            'data': {
                                'text': 'Tarifs Transparents',
                                'level': 2,
                            },
                            'styles': {
                                'font_size': '4xl',
                                'font_weight': 'bold',
                                'text_align': 'center',
                                'margin_bottom': '16px',
                            },
                        },
                        # Pricing Description
                        {
                            'id': 'text-pricing-1',
                            'type': 'text',
                            'data': {
                                'text': 'Choisissez le plan adapté à vos besoins. Pas d\'engagement, changez de plan à tout moment.',
                            },
                            'styles': {
                                'text_align': 'center',
                                'margin_bottom': '48px',
                                'max_width': '672px',
                                'margin_left': 'auto',
                                'margin_right': 'auto',
                            },
                        },
                        # Pricing Block (will load plans from API dynamically)
                        {
                            'id': 'pricing-1',
                            'type': 'pricing',
                            'data': {
                                'title': '',
                                'show_title': False,  # Title is already in heading above
                                'source': 'api',
                                'api_endpoint': '/api/billing/pricing-plans/',
                                'plans': [],  # Will be loaded from API in frontend
                            },
                            'styles': {
                                'max_width': '1280px',
                                'margin': '0 auto',
                                'padding': '0 16px',
                            },
                        },
                    ],
                },
                # CTA Section
                {
                    'id': 'section-cta-1',
                    'type': 'section',
                    'data': {
                        'title': '',
                        'background': 'gradient-blue-purple',
                    },
                    'styles': {
                        'background': 'gradient-to-r from-blue-600 to-purple-600',
                        'padding_top': '80px',
                        'padding_bottom': '80px',
                        'text_align': 'center',
                    },
                    'children': [
                        # CTA Title
                        {
                            'id': 'heading-cta-1',
                            'type': 'heading',
                            'data': {
                                'text': 'Prêt à démarrer ?',
                                'level': 2,
                            },
                            'styles': {
                                'font_size': '4xl',
                                'font_weight': 'bold',
                                'color': '#FFFFFF',
                                'margin_bottom': '16px',
                            },
                        },
                        # CTA Description
                        {
                            'id': 'text-cta-1',
                            'type': 'text',
                            'data': {
                                'text': 'Créez votre site VTC professionnel dès aujourd\'hui. Essai gratuit de 14 jours.',
                            },
                            'styles': {
                                'font_size': 'xl',
                                'color': 'rgba(255, 255, 255, 0.9)',
                                'margin_bottom': '32px',
                            },
                        },
                        # CTA Button
                        {
                            'id': 'button-cta-1',
                            'type': 'button',
                            'data': {
                                'text': '🚀 Créer mon compte gratuitement',
                                'url': '/register',
                                'style': 'primary',
                            },
                            'styles': {
                                'background_color': '#FFFFFF',
                                'color': '#2563EB',
                                'padding': '16px 32px',
                                'font_size': 'lg',
                                'font_weight': 'bold',
                                'border_radius': '8px',
                                'display': 'inline-block',
                            },
                        },
                    ],
                },
            ]
            
            # Save to settings
            settings.public_homepage_blocks = blocks
            settings.public_homepage_status = 'draft'  # Set to draft so user can review before publishing
            settings.public_homepage_meta_title = 'VTCBuilder - Le WordPress des chauffeurs VTC'
            settings.public_homepage_meta_description = 'Plateforme complète pour créer et gérer votre site VTC professionnel'
            settings.save()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n✅ Page d\'accueil générée avec {len(blocks)} blocs principaux !\n'
                    f'   Statut: Brouillon (draft)\n'
                    f'   Pour publier, allez dans /admin/pages-public/home/edit et changez le statut à "Publié"\n'
                    f'\n💡 Pour restaurer la version précédente:\n'
                    f'   make restore-homepage\n'
                    f'   ou\n'
                    f'   docker exec vtcbuilder-backend python manage.py restore_homepage_backup\n'
                )
            )
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Erreur: {e}'))
            import traceback
            traceback.print_exc()

