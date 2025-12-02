"""
Management command to generate the homepage with blocks matching the current design
Creates a flat list of blocks that can be edited in the BlockEditor
"""
from django.core.management.base import BaseCommand
from settings_app.models import SystemSettings
from .backup_homepage import Command as BackupCommand
import json
import uuid


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
            
            # Generate blocks as a FLAT list (no nested children) - BlockEditor works with flat lists
            blocks = [
                # Hero Section
                {
                    'id': f'hero-{uuid.uuid4().hex[:8]}',
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
                # Features Section - Container
                {
                    'id': f'section-features-{uuid.uuid4().hex[:8]}',
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
                },
                # Features Title
                {
                    'id': f'heading-features-{uuid.uuid4().hex[:8]}',
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
                    'id': f'grid-features-{uuid.uuid4().hex[:8]}',
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
                },
                # Feature 1
                {
                    'id': f'feature-1-{uuid.uuid4().hex[:8]}',
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
                    'id': f'feature-2-{uuid.uuid4().hex[:8]}',
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
                    'id': f'feature-3-{uuid.uuid4().hex[:8]}',
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
                    'id': f'feature-4-{uuid.uuid4().hex[:8]}',
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
                    'id': f'feature-5-{uuid.uuid4().hex[:8]}',
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
                    'id': f'feature-6-{uuid.uuid4().hex[:8]}',
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
                # Pricing Section - Container
                {
                    'id': f'section-pricing-{uuid.uuid4().hex[:8]}',
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
                },
                # Pricing Title
                {
                    'id': f'heading-pricing-{uuid.uuid4().hex[:8]}',
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
                    'id': f'text-pricing-{uuid.uuid4().hex[:8]}',
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
                    'id': f'pricing-{uuid.uuid4().hex[:8]}',
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
                # CTA Section - Container
                {
                    'id': f'section-cta-{uuid.uuid4().hex[:8]}',
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
                },
                # CTA Title
                {
                    'id': f'heading-cta-{uuid.uuid4().hex[:8]}',
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
                    'id': f'text-cta-{uuid.uuid4().hex[:8]}',
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
                    'id': f'button-cta-{uuid.uuid4().hex[:8]}',
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
            ]
            
            # Save to settings
            settings.public_homepage_blocks = blocks
            settings.public_homepage_status = 'draft'  # Set to draft so user can review before publishing
            settings.public_homepage_meta_title = 'VTCBuilder - Le WordPress des chauffeurs VTC'
            settings.public_homepage_meta_description = 'Plateforme complète pour créer et gérer votre site VTC professionnel'
            settings.save()
            
            # Ensure homepage is in the system project
            from projects.models import Project, ProjectPage
            system_project, _ = Project.objects.get_or_create(
                slug='vtcbuilder-public-site',
                defaults={
                    'name': 'VTCBuilder - Site Public',
                    'description': 'Projet par défaut pour les pages publiques du site VTCBuilder.',
                    'is_system_project': True,
                    'tenant': None,
                    'status': 'active',
                }
            )
            
            # Ensure homepage page is in project
            project_page, created = ProjectPage.objects.get_or_create(
                project=system_project,
                page_slug='home',
                page_type='public',
                defaults={
                    'order': 1,
                    'is_active': True,
                }
            )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n✅ Page d\'accueil générée avec {len(blocks)} blocs (structure plate) !\n'
                    f'   Statut: Brouillon (draft)\n'
                    f'   Projet: {system_project.name} (ID: {system_project.id})\n'
                    f'   Page dans projet: {"Créée" if created else "Déjà présente"}\n'
                    f'\n💡 Pour gérer la page:\n'
                    f'   - Éditer: /admin/pages-public/home/edit\n'
                    f'   - Via projet: /admin/projects/{system_project.id}\n'
                    f'   - Publier: Changez le statut à "Publié" dans l\'éditeur\n'
                    f'\n📝 Structure des blocs:\n'
                    f'   - Hero (avec 2 boutons)\n'
                    f'   - Section Features (fond blanc)\n'
                    f'   - Titre Features\n'
                    f'   - Grille Features (3 colonnes)\n'
                    f'   - 6 Feature Cards\n'
                    f'   - Section Pricing (fond gris)\n'
                    f'   - Titre + Description Pricing\n'
                    f'   - Bloc Pricing (chargement API)\n'
                    f'   - Section CTA (fond gradient)\n'
                    f'   - Titre + Description + Bouton CTA\n'
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
