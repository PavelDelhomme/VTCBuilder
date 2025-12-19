"""
Management command pour initialiser les schémas JSON, styles par défaut et CTAs
pour tous les blocs existants qui n'ont pas encore ces informations.
"""
from django.core.management.base import BaseCommand
from blocks.models import BlockType
import json


class Command(BaseCommand):
    help = 'Initialize JSON schemas, default styles, and CTAs for all existing blocks'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('\n🚀 Initialisation des schémas JSON pour tous les blocs...\n'))
        
        # Définitions des schémas pour chaque type de bloc
        block_schemas = {
            'hero': {
                'schema': {
                    'title': {
                        'type': 'string',
                        'label': 'Titre principal',
                        'default': 'Le WordPress des Chauffeurs VTC',
                        'required': True
                    },
                    'subtitle': {
                        'type': 'string',
                        'label': 'Sous-titre',
                        'default': 'Créez votre site VTC professionnel en quelques minutes. Gestion complète, réservations, paiements, tout inclus.',
                        'required': False
                    },
                    'primary_button_text': {
                        'type': 'string',
                        'label': 'Texte du bouton principal',
                        'default': '🚀 Démarrer gratuitement',
                        'required': False
                    },
                    'primary_button_link': {
                        'type': 'string',
                        'label': 'Lien du bouton principal',
                        'default': '/register',
                        'required': False
                    },
                    'secondary_button_text': {
                        'type': 'string',
                        'label': 'Texte du bouton secondaire',
                        'default': 'Voir les tarifs',
                        'required': False
                    },
                    'secondary_button_link': {
                        'type': 'string',
                        'label': 'Lien du bouton secondaire',
                        'default': '#pricing',
                        'required': False
                    },
                    'background_type': {
                        'type': 'string',
                        'label': 'Type de fond',
                        'default': 'gradient',
                        'options': ['gradient', 'image', 'color'],
                        'required': False
                    },
                    'background_gradient': {
                        'type': 'string',
                        'label': 'Dégradé de fond (format Tailwind)',
                        'default': 'from-blue-500 via-purple-600 to-pink-500',
                        'required': False
                    },
                    'background_image': {
                        'type': 'string',
                        'label': 'URL de l\'image de fond',
                        'default': '',
                        'required': False
                    },
                    'background_color': {
                        'type': 'string',
                        'label': 'Couleur de fond (hex)',
                        'default': '#667eea',
                        'required': False
                    },
                    'overlay': {
                        'type': 'boolean',
                        'label': 'Overlay sombre sur l\'image',
                        'default': False,
                        'required': False
                    },
                    'buttons': {
                        'type': 'array',
                        'label': 'Boutons (format alternatif)',
                        'default': [],
                        'item_type': {
                            'text': {'type': 'string'},
                            'url': {'type': 'string'},
                            'style': {'type': 'string', 'options': ['primary', 'secondary']}
                        },
                        'required': False
                    }
                },
                'default_styles': {
                    'text_align': 'center',
                    'padding_top': '5rem',
                    'padding_bottom': '8rem',
                    'padding_left': '1rem',
                    'padding_right': '1rem'
                }
            },
            'header': {
                'schema': {
                    'logo_text': {
                        'type': 'string',
                        'label': 'Texte du logo',
                        'default': 'VTCBuilder',
                        'required': True
                    },
                    'logo_url': {
                        'type': 'string',
                        'label': 'URL du logo',
                        'default': '/',
                        'required': False
                    },
                    'badge': {
                        'type': 'string',
                        'label': 'Badge (ex: Beta)',
                        'default': '',
                        'required': False
                    },
                    'show_theme_toggle': {
                        'type': 'boolean',
                        'label': 'Afficher le toggle de thème',
                        'default': True,
                        'required': False
                    },
                    'sticky': {
                        'type': 'boolean',
                        'label': 'Header fixe (sticky)',
                        'default': True,
                        'required': False
                    },
                    'links': {
                        'type': 'array',
                        'label': 'Liens de navigation',
                        'default': [],
                        'item_type': {
                            'label': {'type': 'string'},
                            'url': {'type': 'string'}
                        },
                        'required': False
                    },
                    'cta_button': {
                        'type': 'object',
                        'label': 'Bouton CTA',
                        'default': {},
                        'properties': {
                            'text': {'type': 'string'},
                            'url': {'type': 'string'},
                            'style': {'type': 'string', 'options': ['primary', 'secondary']}
                        },
                        'required': False
                    }
                },
                'default_styles': {
                    'position': 'sticky',
                    'top': '0',
                    'z_index': '50',
                    'backgroundColor': 'bg-white/95 dark:bg-gray-900/90',
                    'backdrop_blur': True
                }
            },
            'features-grid': {
                'schema': {
                    'title': {
                        'type': 'string',
                        'label': 'Titre de la section',
                        'default': 'Tout ce dont vous avez besoin',
                        'required': False
                    },
                    'columns': {
                        'type': 'number',
                        'label': 'Nombre de colonnes',
                        'default': 3,
                        'min': 1,
                        'max': 4,
                        'required': False
                    },
                    'features': {
                        'type': 'array',
                        'label': 'Fonctionnalités',
                        'default': [],
                        'item_type': {
                            'icon': {'type': 'string'},
                            'title': {'type': 'string'},
                            'description': {'type': 'string'}
                        },
                        'required': False
                    }
                },
                'default_styles': {
                    'background_color': 'transparent',
                    'padding_top': '4rem',
                    'padding_bottom': '4rem'
                }
            },
            'pricing': {
                'schema': {
                    'title': {
                        'type': 'string',
                        'label': 'Titre de la section',
                        'default': 'Tarifs Transparents',
                        'required': False
                    },
                    'subtitle': {
                        'type': 'string',
                        'label': 'Sous-titre',
                        'default': 'Choisissez le plan qui vous convient',
                        'required': False
                    },
                    'source': {
                        'type': 'string',
                        'label': 'Source des plans',
                        'default': 'api',
                        'options': ['api', 'manual'],
                        'required': False
                    }
                },
                'default_styles': {
                    'padding_top': '4rem',
                    'padding_bottom': '4rem',
                    'background_color': 'transparent'
                }
            },
            'cta-section': {
                'schema': {
                    'title': {
                        'type': 'string',
                        'label': 'Titre',
                        'default': 'Prêt à démarrer ?',
                        'required': False
                    },
                    'description': {
                        'type': 'string',
                        'label': 'Description',
                        'default': 'Créez votre site VTC professionnel dès aujourd\'hui...',
                        'required': False
                    },
                    'button_text': {
                        'type': 'string',
                        'label': 'Texte du bouton',
                        'default': '🚀 Créer mon compte gratuitement',
                        'required': False
                    },
                    'button_url': {
                        'type': 'string',
                        'label': 'URL du bouton',
                        'default': '/register',
                        'required': False
                    },
                    'button_style': {
                        'type': 'string',
                        'label': 'Style du bouton',
                        'default': 'light',
                        'options': ['light', 'dark'],
                        'required': False
                    },
                    'background_type': {
                        'type': 'string',
                        'label': 'Type de fond',
                        'default': 'gradient',
                        'options': ['gradient', 'image', 'solid'],
                        'required': False
                    },
                    'background_gradient': {
                        'type': 'string',
                        'label': 'Dégradé de fond',
                        'default': 'linear-gradient(to right, #2563eb, #9333ea)',
                        'required': False
                    },
                    'background_image': {
                        'type': 'string',
                        'label': 'URL de l\'image de fond',
                        'default': '',
                        'required': False
                    },
                    'background_color': {
                        'type': 'string',
                        'label': 'Couleur de fond (hex)',
                        'default': '#2563eb',
                        'required': False
                    }
                },
                'default_styles': {
                    'padding_top': '8rem',
                    'padding_bottom': '8rem',
                    'padding_left': '2rem',
                    'padding_right': '2rem'
                }
            },
            'footer': {
                'schema': {
                    'title': {
                        'type': 'string',
                        'label': 'Titre du footer',
                        'default': 'VTCBuilder',
                        'required': False
                    },
                    'description': {
                        'type': 'string',
                        'label': 'Description',
                        'default': 'La solution complète pour créer votre site VTC professionnel.',
                        'required': False
                    },
                    'columns': {
                        'type': 'array',
                        'label': 'Colonnes du footer',
                        'default': [],
                        'item_type': {
                            'title': {'type': 'string'},
                            'description': {'type': 'string'},
                            'links': {
                                'type': 'array',
                                'item_type': {
                                    'label': {'type': 'string'},
                                    'url': {'type': 'string'}
                                }
                            }
                        },
                        'required': False
                    },
                    'copyright': {
                        'type': 'string',
                        'label': 'Texte de copyright',
                        'default': '© 2024 VTCBuilder. Tous droits réservés.',
                        'required': False
                    }
                },
                'default_styles': {
                    'background_color': '#111827',
                    'color': '#ffffff',
                    'padding_top': '4rem',
                    'padding_bottom': '2rem'
                }
            },
            'container': {
                'schema': {
                    'max_width': {
                        'type': 'string',
                        'label': 'Largeur maximale (Tailwind)',
                        'default': 'max-w-7xl',
                        'required': False
                    },
                    'padding': {
                        'type': 'string',
                        'label': 'Padding (Tailwind)',
                        'default': 'px-4 sm:px-6 lg:px-8',
                        'required': False
                    },
                    'margin': {
                        'type': 'string',
                        'label': 'Margin (Tailwind)',
                        'default': 'mx-auto',
                        'required': False
                    }
                },
                'default_styles': {
                    'maxWidth': '80rem',
                    'margin': '0 auto',
                    'padding': '0 1rem'
                }
            }
        }
        
        updated_count = 0
        created_count = 0
        
        # Parcourir tous les blocs existants
        for block_type in BlockType.objects.all():
            block_name = block_type.name
            
            # Si le bloc a déjà un schéma non vide, on le skip
            if block_type.schema and len(block_type.schema) > 0:
                self.stdout.write(self.style.WARNING(f'  ⏭️  {block_name}: Schéma déjà défini'))
                continue
            
            # Chercher le schéma correspondant
            if block_name in block_schemas:
                schema_data = block_schemas[block_name]
                
                # Mettre à jour le schéma
                block_type.schema = schema_data.get('schema', {})
                
                # Mettre à jour les styles par défaut si vides
                if not block_type.default_styles or len(block_type.default_styles) == 0:
                    block_type.default_styles = schema_data.get('default_styles', {})
                
                block_type.save()
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(f'  ✅ {block_name}: Schéma et styles initialisés'))
            else:
                # Pour les blocs sans schéma défini, créer un schéma minimal
                block_type.schema = {
                    'content': {
                        'type': 'string',
                        'label': 'Contenu',
                        'default': '',
                        'required': False
                    }
                }
                if not block_type.default_styles or len(block_type.default_styles) == 0:
                    block_type.default_styles = {}
                block_type.save()
                created_count += 1
                self.stdout.write(self.style.WARNING(f'  ⚠️  {block_name}: Schéma minimal créé'))
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Terminé !'))
        self.stdout.write(self.style.SUCCESS(f'   - {updated_count} blocs mis à jour avec des schémas complets'))
        self.stdout.write(self.style.SUCCESS(f'   - {created_count} blocs avec schémas minimaux'))
        self.stdout.write(self.style.SUCCESS(f'\n💡 Vous pouvez maintenant éditer les blocs dans /admin/blocks pour voir leurs schémas JSON complets.\n'))

