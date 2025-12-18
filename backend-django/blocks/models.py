"""
Block models for modular page builder
"""
from django.db import models


class CallToAction(models.Model):
    """
    Call-to-Action templates that can be reused across blocks
    """
    TYPE_CHOICES = [
        ('button', 'Bouton'),
        ('link', 'Lien'),
        ('banner', 'Bannière'),
        ('popup', 'Popup'),
        ('inline', 'Inline'),
        ('sticky', 'Fixe'),
        ('floating', 'Flottant'),
    ]
    
    name = models.CharField(max_length=255, unique=True, help_text="Nom du CTA (ex: Bouton Principal, Lien Contact)")
    label = models.CharField(max_length=255, help_text="Libellé affiché")
    description = models.TextField(blank=True, null=True, help_text="Description du CTA")
    
    # Type de CTA
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='button', help_text="Type de CTA")
    
    # Configuration par défaut
    default_text = models.CharField(max_length=255, default='Cliquez ici', help_text="Texte par défaut")
    default_url = models.CharField(max_length=500, default='#', help_text="URL par défaut")
    
    # Styles et configuration
    styles = models.JSONField(
        default=dict,
        blank=True,
        help_text="Styles CSS (ex: {background: '#3B82F6', color: '#FFFFFF', borderRadius: '8px'})"
    )
    
    # Configuration avancée
    config = models.JSONField(
        default=dict,
        blank=True,
        help_text="Configuration avancée (target, rel, onclick, etc.)"
    )
    
    # Visibilité
    is_active = models.BooleanField(default=True, help_text="Activer/désactiver ce CTA")
    is_global = models.BooleanField(default=True, help_text="CTA disponible pour tous les blocs")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        app_label = 'blocks'
        db_table = 'call_to_actions'
        ordering = ['name']
        verbose_name = 'Call-to-Action'
        verbose_name_plural = 'Call-to-Actions'
    
    def __str__(self):
        return self.label


class BlockType(models.Model):
    """
    Types of blocks available in the system
    """
    CATEGORY_CHOICES = [
        ('content', 'Contenu'),
        ('layout', 'Mise en page'),
        ('media', 'Médias'),
        ('custom', 'Personnalisé'),
    ]
    
    name = models.CharField(max_length=50, unique=True, help_text="Identifiant unique du bloc (ex: text, image, video)")
    label = models.CharField(max_length=100, help_text="Nom affiché (ex: Bloc Texte, Bloc Image)")
    icon = models.CharField(max_length=50, help_text="Nom de l'icône (ex: text, image, video)")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='content')
    description = models.TextField(blank=True, null=True, help_text="Description du bloc")
    
    # Schema JSON pour validation des données du bloc
    schema = models.JSONField(default=dict, blank=True, help_text="Schéma JSON pour validation")
    
    # Styles par défaut
    default_styles = models.JSONField(default=dict, blank=True, help_text="Styles par défaut du bloc")
    
    # Template de rendu (configuration JSON pour le rendu React)
    # Structure: { component: 'div', props: {...}, children: [...] }
    render_template = models.JSONField(
        default=dict,
        blank=True,
        help_text="Template de rendu React en JSON (structure, props, children)"
    )
    
    # Call-to-action configuration (pour les boutons, liens, etc.)
    # Ancien champ JSON (déprécié mais conservé pour compatibilité)
    call_to_action = models.JSONField(
        default=dict, 
        blank=True, 
        help_text="Configuration des call-to-action (déprécié - utiliser call_to_actions)"
    )
    
    # Call-to-actions réutilisables (nouveau système)
    call_to_actions = models.ManyToManyField(
        CallToAction,
        related_name='blocks',
        blank=True,
        help_text="Call-to-actions disponibles pour ce bloc"
    )
    
    # Plans tarifaires qui donnent accès à ce bloc
    # Si vide, accessible à tous (gratuit)
    available_plans = models.ManyToManyField(
        'billing.PricingPlan',
        related_name='available_blocks',
        blank=True,
        help_text="Plans tarifaires qui donnent accès à ce bloc. Si vide, accessible à tous."
    )
    
    # Configuration
    is_active = models.BooleanField(default=True, help_text="Activer/désactiver ce type de bloc")
    is_admin_only = models.BooleanField(default=False, help_text="Réservé aux administrateurs uniquement (non visible pour les utilisateurs normaux)")
    order = models.IntegerField(default=0, help_text="Ordre d'affichage dans la palette")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def is_available_for_plan(self, plan):
        """
        Vérifie si ce bloc est disponible pour un plan donné.
        Si aucun plan n'est associé, le bloc est gratuit (accessible à tous).
        """
        if not self.available_plans.exists():
            return True
        return self.available_plans.filter(id=plan.id).exists()
    
    class Meta:
        app_label = 'blocks'
        db_table = 'block_types'
        ordering = ['category', 'order', 'label']
        verbose_name = 'Type de Bloc'
        verbose_name_plural = 'Types de Blocs'
    
    def __str__(self):
        return self.label


class BlockTemplate(models.Model):
    """
    Templates de blocs réutilisables pour les tenants
    """
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, null=True, blank=True, 
                               help_text="Si null, template global")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    
    # Structure du bloc
    block_type = models.ForeignKey(BlockType, on_delete=models.CASCADE)
    block_data = models.JSONField(default=dict, help_text="Données du bloc")
    block_styles = models.JSONField(default=dict, blank=True, help_text="Styles du bloc")
    block_settings = models.JSONField(default=dict, blank=True, help_text="Paramètres du bloc")
    
    # Visibilité
    is_global = models.BooleanField(default=False, help_text="Template disponible pour tous les tenants")
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        app_label = 'blocks'
        db_table = 'block_templates'
        ordering = ['-created_at']
        verbose_name = 'Template de Bloc'
        verbose_name_plural = 'Templates de Blocs'
    
    def __str__(self):
        return f"{self.name} ({self.block_type.label})"

