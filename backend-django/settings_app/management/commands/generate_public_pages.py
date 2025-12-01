"""
Management command to generate public pages in the editor for tenants
"""
from django.core.management.base import BaseCommand
from django.db import connection
from django.utils import timezone
from settings_app.models import SystemSettings
import json


class Command(BaseCommand):
    help = 'Generate public pages (home, docs, contact, faq, legal) in the editor for the system project'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Génération des pages publiques dans l\'éditeur...'))
        
        try:
            # Get or create system settings
            settings, created = SystemSettings.objects.get_or_create(
                id=1,
                defaults={
                    'site_name': 'VTCBuilder',
                    'site_description': 'Le WordPress des Chauffeurs VTC',
                }
            )
            
            # Define pages with their blocks
            pages_data = {
                'home': {
                    'title': 'Page d\'accueil',
                    'description': 'Page principale du site public VTCBuilder',
                    'blocks': self._get_homepage_blocks(),
                    'meta_title': 'VTCBuilder - Le WordPress des Chauffeurs VTC',
                    'meta_description': 'Créez votre site VTC professionnel en quelques minutes. Gestion complète, réservations, paiements, tout inclus.',
                },
                'docs': {
                    'title': 'Documentation',
                    'description': 'Page de documentation et guides',
                    'blocks': self._get_docs_blocks(),
                    'meta_title': 'Documentation - VTCBuilder',
                    'meta_description': 'Tout ce dont vous avez besoin pour utiliser VTCBuilder efficacement',
                },
                'contact': {
                    'title': 'Contact',
                    'description': 'Page de contact avec formulaire',
                    'blocks': self._get_contact_blocks(),
                    'meta_title': 'Contact - VTCBuilder',
                    'meta_description': 'Nous sommes là pour vous aider. Contactez notre équipe support',
                },
                'faq': {
                    'title': 'FAQ',
                    'description': 'Questions fréquemment posées',
                    'blocks': self._get_faq_blocks(),
                    'meta_title': 'FAQ - VTCBuilder',
                    'meta_description': 'Trouvez rapidement des réponses à vos questions sur VTCBuilder',
                },
                'legal/privacy': {
                    'title': 'Politique de Confidentialité',
                    'description': 'Politique de confidentialité de VTCBuilder',
                    'blocks': self._get_privacy_blocks(),
                    'meta_title': 'Politique de Confidentialité - VTCBuilder',
                    'meta_description': 'Comment nous collectons, utilisons et protégeons vos données personnelles',
                },
                'legal/terms': {
                    'title': 'Conditions Générales de Vente',
                    'description': 'CGV de VTCBuilder',
                    'blocks': self._get_terms_blocks(),
                    'meta_title': 'Conditions Générales de Vente - VTCBuilder',
                    'meta_description': 'Consultez nos conditions générales de vente',
                },
            }
            
            # Update system settings with public pages
            public_pages = {}
            for slug, page_data in pages_data.items():
                public_pages[slug] = {
                    'title': page_data['title'],
                    'description': page_data['description'],
                    'blocks': page_data['blocks'],
                    'meta_title': page_data.get('meta_title', ''),
                    'meta_description': page_data.get('meta_description', ''),
                    'is_active': True,
                    'order': list(pages_data.keys()).index(slug) + 1,
                }
            
            # Update homepage blocks separately
            settings.public_homepage_blocks = pages_data['home']['blocks']
            settings.public_homepage_meta_title = pages_data['home']['meta_title']
            settings.public_homepage_meta_description = pages_data['home']['meta_description']
            settings.public_homepage_status = 'published'
            
            # Update other public pages
            settings.public_pages = public_pages
            settings.save()
            
            self.stdout.write(self.style.SUCCESS(f'✅ {len(pages_data)} pages publiques générées avec succès !'))
            self.stdout.write(self.style.SUCCESS('📄 Pages créées :'))
            for slug in pages_data.keys():
                self.stdout.write(f'   - {slug}')
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Erreur lors de la génération : {e}'))
            import traceback
            traceback.print_exc()
    
    def _get_homepage_blocks(self):
        """Generate blocks for homepage"""
        return [
            {
                'id': 'hero-1',
                'type': 'hero',
                'data': {
                    'title': 'Le WordPress des Chauffeurs VTC',
                    'subtitle': 'Créez votre site VTC professionnel en quelques minutes. Gestion complète, réservations, paiements, tout inclus.',
                    'cta_text': '🚀 Démarrer gratuitement',
                    'cta_url': '/register',
                    'secondary_cta_text': 'Voir les tarifs',
                    'secondary_cta_url': '#pricing',
                },
                'styles': {
                    'background_color': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    'text_color': '#ffffff',
                    'padding_top': '80px',
                    'padding_bottom': '80px',
                },
            },
            {
                'id': 'features-1',
                'type': 'container',
                'data': {},
                'styles': {
                    'background_color': '#ffffff',
                    'padding_top': '80px',
                    'padding_bottom': '80px',
                },
                'children': [
                    {
                        'id': 'features-heading',
                        'type': 'heading',
                        'data': {
                            'text': 'Tout ce dont vous avez besoin',
                            'level': 2,
                        },
                        'styles': {
                            'text_align': 'center',
                            'font_size': '36px',
                            'margin_bottom': '48px',
                        },
                    },
                    {
                        'id': 'features-grid',
                        'type': 'grid-container',
                        'data': {
                            'columns': 'repeat(3, 1fr)',
                            'gap': '32px',
                        },
                        'styles': {},
                        'children': [
                            {
                                'id': 'feature-1',
                                'type': 'container',
                                'data': {},
                                'styles': {
                                    'text_align': 'center',
                                    'padding': '24px',
                                },
                                'children': [
                                    {
                                        'id': 'feature-1-icon',
                                        'type': 'text',
                                        'data': {
                                            'text': '🎨',
                                        },
                                        'styles': {
                                            'font_size': '48px',
                                            'margin_bottom': '16px',
                                        },
                                    },
                                    {
                                        'id': 'feature-1-title',
                                        'type': 'heading',
                                        'data': {
                                            'text': 'Site Professionnel',
                                            'level': 3,
                                        },
                                        'styles': {
                                            'font_size': '20px',
                                            'margin_bottom': '8px',
                                        },
                                    },
                                    {
                                        'id': 'feature-1-desc',
                                        'type': 'text',
                                        'data': {
                                            'text': 'Designs modernes et responsive. Personnalisez votre site sans coder.',
                                        },
                                        'styles': {
                                            'color': '#666666',
                                        },
                                    },
                                ],
                            },
                            {
                                'id': 'feature-2',
                                'type': 'container',
                                'data': {},
                                'styles': {
                                    'text_align': 'center',
                                    'padding': '24px',
                                },
                                'children': [
                                    {
                                        'id': 'feature-2-icon',
                                        'type': 'text',
                                        'data': {
                                            'text': '📅',
                                        },
                                        'styles': {
                                            'font_size': '48px',
                                            'margin_bottom': '16px',
                                        },
                                    },
                                    {
                                        'id': 'feature-2-title',
                                        'type': 'heading',
                                        'data': {
                                            'text': 'Réservations en Ligne',
                                            'level': 3,
                                        },
                                        'styles': {
                                            'font_size': '20px',
                                            'margin_bottom': '8px',
                                        },
                                    },
                                    {
                                        'id': 'feature-2-desc',
                                        'type': 'text',
                                        'data': {
                                            'text': 'Système de réservation complet avec calendrier et notifications.',
                                        },
                                        'styles': {
                                            'color': '#666666',
                                        },
                                    },
                                ],
                            },
                            {
                                'id': 'feature-3',
                                'type': 'container',
                                'data': {},
                                'styles': {
                                    'text_align': 'center',
                                    'padding': '24px',
                                },
                                'children': [
                                    {
                                        'id': 'feature-3-icon',
                                        'type': 'text',
                                        'data': {
                                            'text': '💳',
                                        },
                                        'styles': {
                                            'font_size': '48px',
                                            'margin_bottom': '16px',
                                        },
                                    },
                                    {
                                        'id': 'feature-3-title',
                                        'type': 'heading',
                                        'data': {
                                            'text': 'Paiements Intégrés',
                                            'level': 3,
                                        },
                                        'styles': {
                                            'font_size': '20px',
                                            'margin_bottom': '8px',
                                        },
                                    },
                                    {
                                        'id': 'feature-3-desc',
                                        'type': 'text',
                                        'data': {
                                            'text': 'Acceptez les paiements en ligne. Cartes bancaires, virement, tout est possible.',
                                        },
                                        'styles': {
                                            'color': '#666666',
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                'id': 'pricing-1',
                'type': 'container',
                'data': {},
                'styles': {
                    'background_color': '#f9fafb',
                    'padding_top': '80px',
                    'padding_bottom': '80px',
                },
                'children': [
                    {
                        'id': 'pricing-heading',
                        'type': 'heading',
                        'data': {
                            'text': 'Tarifs Transparents',
                            'level': 2,
                        },
                        'styles': {
                            'text_align': 'center',
                            'font_size': '36px',
                            'margin_bottom': '16px',
                        },
                    },
                    {
                        'id': 'pricing-subtitle',
                        'type': 'text',
                        'data': {
                            'text': 'Choisissez le plan adapté à vos besoins. Pas d\'engagement, changez de plan à tout moment.',
                        },
                        'styles': {
                            'text_align': 'center',
                            'color': '#666666',
                            'margin_bottom': '48px',
                        },
                    },
                    {
                        'id': 'pricing-cards',
                        'type': 'pricing-cards-grid',
                        'data': {},
                        'styles': {},
                    },
                ],
            },
            {
                'id': 'cta-1',
                'type': 'container',
                'data': {},
                'styles': {
                    'background_color': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    'padding_top': '80px',
                    'padding_bottom': '80px',
                    'text_align': 'center',
                },
                'children': [
                    {
                        'id': 'cta-heading',
                        'type': 'heading',
                        'data': {
                            'text': 'Prêt à démarrer ?',
                            'level': 2,
                        },
                        'styles': {
                            'color': '#ffffff',
                            'font_size': '36px',
                            'margin_bottom': '16px',
                        },
                    },
                    {
                        'id': 'cta-text',
                        'type': 'text',
                        'data': {
                            'text': 'Créez votre site VTC professionnel dès aujourd\'hui. Essai gratuit de 14 jours.',
                        },
                        'styles': {
                            'color': '#ffffff',
                            'font_size': '20px',
                            'margin_bottom': '32px',
                        },
                    },
                    {
                        'id': 'cta-button',
                        'type': 'button',
                        'data': {
                            'text': '🚀 Créer mon compte gratuitement',
                            'url': '/register',
                        },
                        'styles': {
                            'background_color': '#ffffff',
                            'color': '#667eea',
                            'padding': '16px 32px',
                            'border_radius': '8px',
                            'font_size': '18px',
                            'font_weight': 'bold',
                        },
                    },
                ],
            },
        ]
    
    def _get_docs_blocks(self):
        """Generate blocks for docs page"""
        return [
            {
                'id': 'docs-hero',
                'type': 'container',
                'data': {},
                'styles': {
                    'background_color': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    'padding_top': '60px',
                    'padding_bottom': '60px',
                    'text_align': 'center',
                },
                'children': [
                    {
                        'id': 'docs-hero-title',
                        'type': 'heading',
                        'data': {
                            'text': '🚀 Démarrage rapide',
                            'level': 2,
                        },
                        'styles': {
                            'color': '#ffffff',
                            'font_size': '32px',
                            'margin_bottom': '16px',
                        },
                    },
                    {
                        'id': 'docs-hero-text',
                        'type': 'text',
                        'data': {
                            'text': 'Nouveau sur VTCBuilder ? Suivez notre guide de démarrage pour créer votre site en 10 minutes.',
                        },
                        'styles': {
                            'color': '#ffffff',
                            'font_size': '18px',
                            'margin_bottom': '24px',
                        },
                    },
                    {
                        'id': 'docs-hero-button',
                        'type': 'button',
                        'data': {
                            'text': 'Créer mon compte →',
                            'url': '/register',
                        },
                        'styles': {
                            'background_color': '#ffffff',
                            'color': '#667eea',
                            'padding': '12px 24px',
                            'border_radius': '8px',
                        },
                    },
                ],
            },
            {
                'id': 'docs-sections',
                'type': 'container',
                'data': {},
                'styles': {
                    'padding_top': '60px',
                    'padding_bottom': '60px',
                },
                'children': [
                    {
                        'id': 'docs-grid',
                        'type': 'docs-grid',
                        'data': {},
                        'styles': {},
                    },
                ],
            },
        ]
    
    def _get_contact_blocks(self):
        """Generate blocks for contact page"""
        return [
            {
                'id': 'contact-hero',
                'type': 'container',
                'data': {},
                'styles': {
                    'padding_top': '40px',
                    'padding_bottom': '40px',
                },
                'children': [
                    {
                        'id': 'contact-title',
                        'type': 'heading',
                        'data': {
                            'text': 'Contactez-nous',
                            'level': 1,
                        },
                        'styles': {
                            'text_align': 'center',
                            'font_size': '40px',
                            'margin_bottom': '16px',
                        },
                    },
                    {
                        'id': 'contact-subtitle',
                        'type': 'text',
                        'data': {
                            'text': 'Nous sommes là pour vous aider. Contactez notre équipe support',
                        },
                        'styles': {
                            'text_align': 'center',
                            'color': '#666666',
                            'font_size': '18px',
                        },
                    },
                ],
            },
            {
                'id': 'contact-content',
                'type': 'container',
                'data': {},
                'styles': {
                    'padding_top': '40px',
                    'padding_bottom': '40px',
                },
                'children': [
                    {
                        'id': 'contact-grid',
                        'type': 'grid-container',
                        'data': {
                            'columns': 'repeat(2, 1fr)',
                            'gap': '48px',
                        },
                        'styles': {},
                        'children': [
                            {
                                'id': 'contact-form',
                                'type': 'form',
                                'data': {
                                    'form_type': 'contact',
                                },
                                'styles': {},
                            },
                            {
                                'id': 'contact-info',
                                'type': 'container',
                                'data': {},
                                'styles': {},
                                'children': [
                                    {
                                        'id': 'contact-info-title',
                                        'type': 'heading',
                                        'data': {
                                            'text': 'Nos coordonnées',
                                            'level': 2,
                                        },
                                        'styles': {
                                            'font_size': '24px',
                                            'margin_bottom': '24px',
                                        },
                                    },
                                    {
                                        'id': 'contact-info-content',
                                        'type': 'text',
                                        'data': {
                                            'text': '📧 Email: support@vtcbuilder.com\n📞 Téléphone: +33 1 23 45 67 89\n📍 Adresse: 123 Avenue des Exemples, 75000 PARIS, France',
                                        },
                                        'styles': {
                                            'white_space': 'pre-line',
                                            'line_height': '1.8',
                                        },
                                    },
                                    {
                                        'id': 'support-hours',
                                        'type': 'support-hours',
                                        'data': {},
                                        'styles': {},
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ]
    
    def _get_faq_blocks(self):
        """Generate blocks for FAQ page"""
        return [
            {
                'id': 'faq-hero',
                'type': 'container',
                'data': {},
                'styles': {
                    'padding_top': '40px',
                    'padding_bottom': '40px',
                },
                'children': [
                    {
                        'id': 'faq-title',
                        'type': 'heading',
                        'data': {
                            'text': 'Questions fréquentes',
                            'level': 1,
                        },
                        'styles': {
                            'text_align': 'center',
                            'font_size': '40px',
                            'margin_bottom': '16px',
                        },
                    },
                    {
                        'id': 'faq-subtitle',
                        'type': 'text',
                        'data': {
                            'text': 'Trouvez rapidement des réponses à vos questions sur VTCBuilder',
                        },
                        'styles': {
                            'text_align': 'center',
                            'color': '#666666',
                            'font_size': '18px',
                        },
                    },
                ],
            },
            {
                'id': 'faq-content',
                'type': 'container',
                'data': {},
                'styles': {
                    'padding_top': '40px',
                    'padding_bottom': '40px',
                },
                'children': [
                    {
                        'id': 'faq-filters',
                        'type': 'faq-filters',
                        'data': {},
                        'styles': {},
                    },
                    {
                        'id': 'faq-accordion',
                        'type': 'accordion',
                        'data': {
                            'items': [
                                {
                                    'title': 'Qu\'est-ce que VTCBuilder ?',
                                    'content': 'VTCBuilder est une plateforme SaaS complète qui permet aux chauffeurs VTC de créer et gérer leur site web professionnel.',
                                },
                                {
                                    'title': 'Combien coûte VTCBuilder ?',
                                    'content': 'Nous proposons plusieurs plans tarifaires adaptés à vos besoins, allant de 19€/mois pour le plan Starter jusqu\'à 79€/mois pour le plan Entreprise.',
                                },
                                {
                                    'title': 'Comment créer mon compte ?',
                                    'content': 'Cliquez sur "Créer un compte" en haut à droite, remplissez le formulaire avec vos informations, et vous recevrez un email de confirmation.',
                                },
                            ],
                        },
                        'styles': {},
                    },
                ],
            },
        ]
    
    def _get_privacy_blocks(self):
        """Generate blocks for privacy page"""
        return [
            {
                'id': 'privacy-hero',
                'type': 'container',
                'data': {},
                'styles': {
                    'padding_top': '40px',
                    'padding_bottom': '40px',
                },
                'children': [
                    {
                        'id': 'privacy-title',
                        'type': 'heading',
                        'data': {
                            'text': 'Politique de Confidentialité',
                            'level': 1,
                        },
                        'styles': {
                            'text_align': 'center',
                            'font_size': '40px',
                            'margin_bottom': '16px',
                        },
                    },
                ],
            },
            {
                'id': 'privacy-content',
                'type': 'container',
                'data': {},
                'styles': {
                    'padding_top': '40px',
                    'padding_bottom': '40px',
                },
                'children': [
                    {
                        'id': 'privacy-text',
                        'type': 'text',
                        'data': {
                            'text': 'VTCBuilder ("nous", "notre", "nos") s\'engage à protéger la confidentialité de vos données personnelles. Cette Politique de Confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations personnelles conformément au Règlement Général sur la Protection des Données (RGPD).',
                        },
                        'styles': {
                            'line_height': '1.8',
                            'margin_bottom': '24px',
                        },
                    },
                ],
            },
        ]
    
    def _get_terms_blocks(self):
        """Generate blocks for terms page"""
        return [
            {
                'id': 'terms-hero',
                'type': 'container',
                'data': {},
                'styles': {
                    'padding_top': '40px',
                    'padding_bottom': '40px',
                },
                'children': [
                    {
                        'id': 'terms-title',
                        'type': 'heading',
                        'data': {
                            'text': 'Conditions Générales de Vente',
                            'level': 1,
                        },
                        'styles': {
                            'text_align': 'center',
                            'font_size': '40px',
                            'margin_bottom': '16px',
                        },
                    },
                ],
            },
            {
                'id': 'terms-content',
                'type': 'container',
                'data': {},
                'styles': {
                    'padding_top': '40px',
                    'padding_bottom': '40px',
                },
                'children': [
                    {
                        'id': 'terms-text',
                        'type': 'text',
                        'data': {
                            'text': 'Les présentes Conditions Générales de Vente (CGV) régissent l\'utilisation de la plateforme VTCBuilder, un service SaaS (Software as a Service) permettant aux professionnels du secteur VTC de créer et gérer leur site web professionnel, leurs réservations, leur facturation et leur équipe.',
                        },
                        'styles': {
                            'line_height': '1.8',
                            'margin_bottom': '24px',
                        },
                    },
                ],
            },
        ]

