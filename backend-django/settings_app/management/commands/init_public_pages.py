"""
Management command to initialize public pages for VTCBuilder
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from settings_app.models import SystemSettings


class Command(BaseCommand):
    help = 'Initialise les pages publiques de documentation VTCBuilder'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('📄 Initialisation des pages publiques...'))
        
        settings = SystemSettings.get_settings()
        public_pages = settings.public_pages or {}
        
        # Définir les pages par défaut avec contenu de base
        default_pages = {
            'docs': {
                'title': 'Documentation',
                'description': 'Documentation complète de VTCBuilder',
                'slug': 'docs',
                'blocks': [
                    {
                        'type': 'heading',
                        'content': 'Documentation VTCBuilder',
                        'level': 1,
                        'style': {'textAlign': 'center', 'marginBottom': '2rem'}
                    },
                    {
                        'type': 'paragraph',
                        'content': 'Bienvenue dans la documentation de VTCBuilder. Découvrez comment créer et gérer votre site VTC professionnel.',
                        'style': {'textAlign': 'center', 'marginBottom': '2rem'}
                    },
                    {
                        'type': 'heading',
                        'content': 'Guide de démarrage',
                        'level': 2,
                        'style': {'marginTop': '2rem', 'marginBottom': '1rem'}
                    },
                    {
                        'type': 'paragraph',
                        'content': 'VTCBuilder est une plateforme complète pour créer et gérer votre site VTC professionnel. Suivez ce guide pour commencer.',
                        'style': {'marginBottom': '1rem'}
                    }
                ],
                'meta_title': 'Documentation - VTCBuilder',
                'meta_description': 'Documentation complète pour utiliser VTCBuilder et créer votre site VTC professionnel',
                'is_active': True,
                'order': 2
            },
            'features': {
                'title': 'Fonctionnalités',
                'description': 'Découvrez toutes les fonctionnalités de VTCBuilder',
                'slug': 'features',
                'blocks': [],
                'meta_title': 'Fonctionnalités - VTCBuilder',
                'meta_description': 'Découvrez toutes les fonctionnalités de VTCBuilder pour créer et gérer votre site VTC professionnel',
                'is_active': True,
                'order': 2
            },
            'contact': {
                'title': 'Contact',
                'description': 'Page de contact avec formulaire',
                'slug': 'contact',
                'blocks': [
                    {
                        'type': 'heading',
                        'content': 'Contactez-nous',
                        'level': 1,
                        'style': {'textAlign': 'center', 'marginBottom': '2rem'}
                    },
                    {
                        'type': 'paragraph',
                        'content': 'Une question ? Besoin d\'aide ? N\'hésitez pas à nous contacter.',
                        'style': {'textAlign': 'center', 'marginBottom': '2rem'}
                    },
                    {
                        'type': 'contact_form',
                        'fields': ['name', 'email', 'subject', 'message'],
                        'style': {'maxWidth': '600px', 'margin': '0 auto'}
                    }
                ],
                'meta_title': 'Contact - VTCBuilder',
                'meta_description': 'Contactez l\'équipe VTCBuilder pour toute question ou demande d\'aide',
                'is_active': True,
                'order': 3
            },
            'faq': {
                'title': 'FAQ',
                'description': 'Questions fréquemment posées',
                'slug': 'faq',
                'blocks': [
                    {
                        'type': 'heading',
                        'content': 'Questions fréquemment posées',
                        'level': 1,
                        'style': {'textAlign': 'center', 'marginBottom': '2rem'}
                    },
                    {
                        'type': 'accordion',
                        'items': [
                            {
                                'title': 'Qu\'est-ce que VTCBuilder ?',
                                'content': 'VTCBuilder est une plateforme complète pour créer et gérer votre site VTC professionnel. C\'est le WordPress des chauffeurs VTC.'
                            },
                            {
                                'title': 'Comment créer mon site ?',
                                'content': 'Créez un compte, choisissez un template, personnalisez votre contenu et publiez votre site en quelques minutes.'
                            },
                            {
                                'title': 'Quels sont les tarifs ?',
                                'content': 'VTCBuilder propose différents plans d\'abonnement adaptés à vos besoins. Consultez notre page de tarification pour plus d\'informations.'
                            }
                        ],
                        'style': {'maxWidth': '800px', 'margin': '0 auto'}
                    }
                ],
                'meta_title': 'FAQ - VTCBuilder',
                'meta_description': 'Réponses aux questions fréquemment posées sur VTCBuilder',
                'is_active': True,
                'order': 4
            },
            'legal/terms': {
                'title': 'Conditions Générales de Vente',
                'description': 'CGV de VTCBuilder',
                'slug': 'legal/terms',
                'blocks': [
                    {
                        'type': 'heading',
                        'content': 'Conditions Générales de Vente',
                        'level': 1,
                        'style': {'textAlign': 'center', 'marginBottom': '2rem'}
                    },
                    {
                        'type': 'paragraph',
                        'content': 'Dernière mise à jour : ' + timezone.now().strftime('%d/%m/%Y'),
                        'style': {'textAlign': 'center', 'marginBottom': '2rem', 'fontStyle': 'italic'}
                    },
                    {
                        'type': 'heading',
                        'content': '1. Objet',
                        'level': 2,
                        'style': {'marginTop': '2rem', 'marginBottom': '1rem'}
                    },
                    {
                        'type': 'paragraph',
                        'content': 'Les présentes Conditions Générales de Vente (CGV) régissent l\'utilisation de la plateforme VTCBuilder et les services proposés.',
                        'style': {'marginBottom': '1rem'}
                    },
                    {
                        'type': 'heading',
                        'content': '2. Acceptation des conditions',
                        'level': 2,
                        'style': {'marginTop': '2rem', 'marginBottom': '1rem'}
                    },
                    {
                        'type': 'paragraph',
                        'content': 'En utilisant VTCBuilder, vous acceptez sans réserve les présentes CGV.',
                        'style': {'marginBottom': '1rem'}
                    }
                ],
                'meta_title': 'Conditions Générales de Vente - VTCBuilder',
                'meta_description': 'Conditions générales de vente de VTCBuilder',
                'is_active': True,
                'order': 5
            },
            'legal/privacy': {
                'title': 'Politique de Confidentialité',
                'description': 'Politique de confidentialité de VTCBuilder',
                'slug': 'legal/privacy',
                'blocks': [
                    {
                        'type': 'heading',
                        'content': 'Politique de Confidentialité',
                        'level': 1,
                        'style': {'textAlign': 'center', 'marginBottom': '2rem'}
                    },
                    {
                        'type': 'paragraph',
                        'content': 'Dernière mise à jour : ' + timezone.now().strftime('%d/%m/%Y'),
                        'style': {'textAlign': 'center', 'marginBottom': '2rem', 'fontStyle': 'italic'}
                    },
                    {
                        'type': 'heading',
                        'content': '1. Collecte des données',
                        'level': 2,
                        'style': {'marginTop': '2rem', 'marginBottom': '1rem'}
                    },
                    {
                        'type': 'paragraph',
                        'content': 'VTCBuilder collecte uniquement les données nécessaires au fonctionnement de la plateforme et à la fourniture des services.',
                        'style': {'marginBottom': '1rem'}
                    },
                    {
                        'type': 'heading',
                        'content': '2. Utilisation des données',
                        'level': 2,
                        'style': {'marginTop': '2rem', 'marginBottom': '1rem'}
                    },
                    {
                        'type': 'paragraph',
                        'content': 'Vos données sont utilisées uniquement dans le cadre de la fourniture des services VTCBuilder et ne sont jamais vendues à des tiers.',
                        'style': {'marginBottom': '1rem'}
                    },
                    {
                        'type': 'heading',
                        'content': '3. Vos droits',
                        'level': 2,
                        'style': {'marginTop': '2rem', 'marginBottom': '1rem'}
                    },
                    {
                        'type': 'paragraph',
                        'content': 'Conformément au RGPD, vous disposez d\'un droit d\'accès, de rectification, de suppression et d\'opposition concernant vos données personnelles.',
                        'style': {'marginBottom': '1rem'}
                    }
                ],
                'meta_title': 'Politique de Confidentialité - VTCBuilder',
                'meta_description': 'Politique de confidentialité et protection des données personnelles de VTCBuilder',
                'is_active': True,
                'order': 6
            }
        }
        
        # Fusionner avec les pages existantes (ne pas écraser si elles existent déjà)
        pages_created = 0
        pages_updated = 0
        
        for slug, page_data in default_pages.items():
            if slug not in public_pages:
                public_pages[slug] = page_data
                pages_created += 1
                self.stdout.write(
                    self.style.SUCCESS(f'  ✅ Page créée: {page_data["title"]} ({slug})')
                )
            else:
                # Mettre à jour seulement les champs manquants
                existing_page = public_pages[slug]
                updated = False
                for key, value in page_data.items():
                    if key not in existing_page:
                        existing_page[key] = value
                        updated = True
                if updated:
                    pages_updated += 1
                    self.stdout.write(
                        self.style.WARNING(f'  🔄 Page mise à jour: {page_data["title"]} ({slug})')
                    )
        
        # Sauvegarder les pages
        settings.public_pages = public_pages
        settings.save(update_fields=['public_pages'])
        
        # Résumé
        self.stdout.write(self.style.SUCCESS(f'\n✅ Initialisation terminée !'))
        self.stdout.write(f'  - Pages créées: {pages_created}')
        self.stdout.write(f'  - Pages mises à jour: {pages_updated}')
        self.stdout.write(f'  - Total pages: {len(public_pages)}')
        
        self.stdout.write(self.style.SUCCESS('\n📋 Pages disponibles :'))
        for slug, page_data in sorted(public_pages.items(), key=lambda x: x[1].get('order', 999)):
            status = '✅' if page_data.get('is_active', True) else '⏸️'
            self.stdout.write(f'  {status} {page_data.get("title", slug)} ({slug})')

