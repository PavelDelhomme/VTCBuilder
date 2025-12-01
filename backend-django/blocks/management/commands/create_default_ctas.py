"""
Management command to create default Call-to-Actions (CTAs)
"""
from django.core.management.base import BaseCommand
from blocks.models import CallToAction


class Command(BaseCommand):
    help = 'Create default Call-to-Actions (CTAs) if they do not exist'

    def handle(self, *args, **options):
        default_ctas = [
            {
                'name': 'bouton-principal',
                'label': 'Bouton Principal',
                'description': 'Bouton d\'action principal avec style bleu',
                'type': 'button',
                'default_text': 'Commencer',
                'default_url': '/register',
                'styles': {
                    'background': '#3B82F6',
                    'color': '#FFFFFF',
                    'borderRadius': '8px',
                    'padding': '12px 24px',
                    'fontWeight': '600',
                    'fontSize': '16px',
                    'border': 'none',
                    'cursor': 'pointer',
                    'transition': 'all 0.3s ease',
                    'boxShadow': '0 4px 6px rgba(59, 130, 246, 0.3)'
                },
                'config': {
                    'target': '_self',
                    'rel': ''
                },
                'is_active': True,
                'is_global': True
            },
            {
                'name': 'bouton-secondaire',
                'label': 'Bouton Secondaire',
                'description': 'Bouton d\'action secondaire avec style gris',
                'type': 'button',
                'default_text': 'En savoir plus',
                'default_url': '/about',
                'styles': {
                    'background': '#6B7280',
                    'color': '#FFFFFF',
                    'borderRadius': '8px',
                    'padding': '12px 24px',
                    'fontWeight': '600',
                    'fontSize': '16px',
                    'border': 'none',
                    'cursor': 'pointer',
                    'transition': 'all 0.3s ease'
                },
                'config': {
                    'target': '_self',
                    'rel': ''
                },
                'is_active': True,
                'is_global': True
            },
            {
                'name': 'bouton-outline',
                'label': 'Bouton Outline',
                'description': 'Bouton avec bordure, style outline',
                'type': 'button',
                'default_text': 'Découvrir',
                'default_url': '/features',
                'styles': {
                    'background': 'transparent',
                    'color': '#3B82F6',
                    'border': '2px solid #3B82F6',
                    'borderRadius': '8px',
                    'padding': '10px 22px',
                    'fontWeight': '600',
                    'fontSize': '16px',
                    'cursor': 'pointer',
                    'transition': 'all 0.3s ease'
                },
                'config': {
                    'target': '_self',
                    'rel': ''
                },
                'is_active': True,
                'is_global': True
            },
            {
                'name': 'bouton-success',
                'label': 'Bouton Succès',
                'description': 'Bouton pour actions positives (vert)',
                'type': 'button',
                'default_text': 'Valider',
                'default_url': '#',
                'styles': {
                    'background': '#10B981',
                    'color': '#FFFFFF',
                    'borderRadius': '8px',
                    'padding': '12px 24px',
                    'fontWeight': '600',
                    'fontSize': '16px',
                    'border': 'none',
                    'cursor': 'pointer',
                    'transition': 'all 0.3s ease'
                },
                'config': {
                    'target': '_self',
                    'rel': ''
                },
                'is_active': True,
                'is_global': True
            },
            {
                'name': 'bouton-danger',
                'label': 'Bouton Danger',
                'description': 'Bouton pour actions destructives (rouge)',
                'type': 'button',
                'default_text': 'Supprimer',
                'default_url': '#',
                'styles': {
                    'background': '#EF4444',
                    'color': '#FFFFFF',
                    'borderRadius': '8px',
                    'padding': '12px 24px',
                    'fontWeight': '600',
                    'fontSize': '16px',
                    'border': 'none',
                    'cursor': 'pointer',
                    'transition': 'all 0.3s ease'
                },
                'config': {
                    'target': '_self',
                    'rel': ''
                },
                'is_active': True,
                'is_global': True
            },
            {
                'name': 'lien-contact',
                'label': 'Lien Contact',
                'description': 'Lien vers la page de contact',
                'type': 'link',
                'default_text': 'Nous contacter',
                'default_url': '/contact',
                'styles': {
                    'color': '#3B82F6',
                    'textDecoration': 'underline',
                    'fontWeight': '500',
                    'fontSize': '16px',
                    'transition': 'color 0.3s ease'
                },
                'config': {
                    'target': '_self',
                    'rel': ''
                },
                'is_active': True,
                'is_global': True
            },
            {
                'name': 'lien-savoir-plus',
                'label': 'Lien En Savoir Plus',
                'description': 'Lien pour en savoir plus',
                'type': 'link',
                'default_text': 'En savoir plus →',
                'default_url': '/about',
                'styles': {
                    'color': '#3B82F6',
                    'textDecoration': 'none',
                    'fontWeight': '600',
                    'fontSize': '16px',
                    'transition': 'color 0.3s ease',
                    'display': 'inline-flex',
                    'alignItems': 'center',
                    'gap': '4px'
                },
                'config': {
                    'target': '_self',
                    'rel': ''
                },
                'is_active': True,
                'is_global': True
            },
            {
                'name': 'bouton-inscription',
                'label': 'Bouton Inscription',
                'description': 'Bouton pour s\'inscrire',
                'type': 'button',
                'default_text': 'S\'inscrire',
                'default_url': '/register',
                'styles': {
                    'background': '#10B981',
                    'color': '#FFFFFF',
                    'borderRadius': '8px',
                    'padding': '12px 32px',
                    'fontWeight': '700',
                    'fontSize': '16px',
                    'border': 'none',
                    'cursor': 'pointer',
                    'transition': 'all 0.3s ease',
                    'boxShadow': '0 4px 6px rgba(16, 185, 129, 0.3)',
                    'textTransform': 'uppercase',
                    'letterSpacing': '0.5px'
                },
                'config': {
                    'target': '_self',
                    'rel': ''
                },
                'is_active': True,
                'is_global': True
            },
            {
                'name': 'bouton-connexion',
                'label': 'Bouton Connexion',
                'description': 'Bouton pour se connecter',
                'type': 'button',
                'default_text': 'Se connecter',
                'default_url': '/login',
                'styles': {
                    'background': 'transparent',
                    'color': '#3B82F6',
                    'border': '2px solid #3B82F6',
                    'borderRadius': '8px',
                    'padding': '10px 24px',
                    'fontWeight': '600',
                    'fontSize': '16px',
                    'cursor': 'pointer',
                    'transition': 'all 0.3s ease'
                },
                'config': {
                    'target': '_self',
                    'rel': ''
                },
                'is_active': True,
                'is_global': True
            },
            {
                'name': 'bouton-essai-gratuit',
                'label': 'Bouton Essai Gratuit',
                'description': 'Bouton pour démarrer un essai gratuit',
                'type': 'button',
                'default_text': 'Essai gratuit',
                'default_url': '/register?plan=trial',
                'styles': {
                    'background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    'color': '#FFFFFF',
                    'borderRadius': '12px',
                    'padding': '14px 32px',
                    'fontWeight': '700',
                    'fontSize': '18px',
                    'border': 'none',
                    'cursor': 'pointer',
                    'transition': 'all 0.3s ease',
                    'boxShadow': '0 8px 16px rgba(102, 126, 234, 0.4)',
                    'textTransform': 'uppercase',
                    'letterSpacing': '1px'
                },
                'config': {
                    'target': '_self',
                    'rel': ''
                },
                'is_active': True,
                'is_global': True
            },
            {
                'name': 'bouton-acheter',
                'label': 'Bouton Acheter',
                'description': 'Bouton pour acheter un produit/service',
                'type': 'button',
                'default_text': 'Acheter maintenant',
                'default_url': '/pricing',
                'styles': {
                    'background': '#F59E0B',
                    'color': '#FFFFFF',
                    'borderRadius': '8px',
                    'padding': '12px 28px',
                    'fontWeight': '700',
                    'fontSize': '16px',
                    'border': 'none',
                    'cursor': 'pointer',
                    'transition': 'all 0.3s ease',
                    'boxShadow': '0 4px 6px rgba(245, 158, 11, 0.3)'
                },
                'config': {
                    'target': '_self',
                    'rel': ''
                },
                'is_active': True,
                'is_global': True
            },
            {
                'name': 'banner-cta',
                'label': 'Bannière CTA',
                'description': 'Bannière call-to-action pour promotions',
                'type': 'banner',
                'default_text': 'Offre spéciale - Économisez 20%',
                'default_url': '/promo',
                'styles': {
                    'background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    'color': '#FFFFFF',
                    'padding': '20px',
                    'borderRadius': '12px',
                    'textAlign': 'center',
                    'fontWeight': '600',
                    'fontSize': '18px',
                    'boxShadow': '0 4px 6px rgba(0, 0, 0, 0.1)'
                },
                'config': {
                    'target': '_self',
                    'rel': ''
                },
                'is_active': True,
                'is_global': True
            },
            {
                'name': 'bouton-telecharger',
                'label': 'Bouton Télécharger',
                'description': 'Bouton pour télécharger un fichier',
                'type': 'button',
                'default_text': 'Télécharger',
                'default_url': '/download',
                'styles': {
                    'background': '#6366F1',
                    'color': '#FFFFFF',
                    'borderRadius': '8px',
                    'padding': '12px 24px',
                    'fontWeight': '600',
                    'fontSize': '16px',
                    'border': 'none',
                    'cursor': 'pointer',
                    'transition': 'all 0.3s ease',
                    'display': 'inline-flex',
                    'alignItems': 'center',
                    'gap': '8px'
                },
                'config': {
                    'target': '_self',
                    'rel': 'download'
                },
                'is_active': True,
                'is_global': True
            },
            {
                'name': 'bouton-reserver',
                'label': 'Bouton Réserver',
                'description': 'Bouton pour réserver un service VTC',
                'type': 'button',
                'default_text': 'Réserver maintenant',
                'default_url': '/booking',
                'styles': {
                    'background': '#3B82F6',
                    'color': '#FFFFFF',
                    'borderRadius': '10px',
                    'padding': '14px 32px',
                    'fontWeight': '700',
                    'fontSize': '18px',
                    'border': 'none',
                    'cursor': 'pointer',
                    'transition': 'all 0.3s ease',
                    'boxShadow': '0 6px 12px rgba(59, 130, 246, 0.4)',
                    'textTransform': 'uppercase',
                    'letterSpacing': '0.5px'
                },
                'config': {
                    'target': '_self',
                    'rel': ''
                },
                'is_active': True,
                'is_global': True
            },
            {
                'name': 'lien-externe',
                'label': 'Lien Externe',
                'description': 'Lien vers un site externe',
                'type': 'link',
                'default_text': 'Visiter le site',
                'default_url': 'https://example.com',
                'styles': {
                    'color': '#3B82F6',
                    'textDecoration': 'none',
                    'fontWeight': '500',
                    'fontSize': '16px',
                    'transition': 'color 0.3s ease',
                    'display': 'inline-flex',
                    'alignItems': 'center',
                    'gap': '4px'
                },
                'config': {
                    'target': '_blank',
                    'rel': 'noopener noreferrer'
                },
                'is_active': True,
                'is_global': True
            },
            {
                'name': 'bouton-flottant',
                'label': 'Bouton Flottant',
                'description': 'Bouton flottant pour actions rapides',
                'type': 'floating',
                'default_text': '↑',
                'default_url': '#top',
                'styles': {
                    'background': '#3B82F6',
                    'color': '#FFFFFF',
                    'borderRadius': '50%',
                    'width': '56px',
                    'height': '56px',
                    'border': 'none',
                    'cursor': 'pointer',
                    'transition': 'all 0.3s ease',
                    'boxShadow': '0 4px 12px rgba(59, 130, 246, 0.4)',
                    'position': 'fixed',
                    'bottom': '24px',
                    'right': '24px',
                    'zIndex': '1000',
                    'fontSize': '24px',
                    'display': 'flex',
                    'alignItems': 'center',
                    'justifyContent': 'center'
                },
                'config': {
                    'target': '_self',
                    'rel': ''
                },
                'is_active': True,
                'is_global': True
            }
        ]

        created_count = 0
        updated_count = 0

        for cta_data in default_ctas:
            cta, created = CallToAction.objects.get_or_create(
                name=cta_data['name'],
                defaults=cta_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Créé: {cta.label}')
                )
            else:
                # Mettre à jour les champs si le CTA existe déjà
                updated = False
                for key, value in cta_data.items():
                    if key != 'name' and getattr(cta, key) != value:
                        setattr(cta, key, value)
                        updated = True
                
                if updated:
                    cta.save()
                    updated_count += 1
                    self.stdout.write(
                        self.style.WARNING(f'🔄 Mis à jour: {cta.label}')
                    )

        self.stdout.write('')
        self.stdout.write(
            self.style.SUCCESS(
                f'✨ Terminé! {created_count} CTAs créés, {updated_count} mis à jour sur {len(default_ctas)} au total.'
            )
        )

