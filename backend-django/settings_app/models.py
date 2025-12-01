"""
System Settings models for VTCBuilder
"""
from django.db import models
from django.core.validators import EmailValidator, URLValidator
import json


class SystemSettings(models.Model):
    """
    System-wide settings that can be configured by super admin
    Singleton pattern - only one instance should exist
    """
    
    # General Settings
    site_name = models.CharField(max_length=255, default='VTCBuilder')
    site_url = models.URLField(default='http://localhost:9494')
    contact_email = models.EmailField(default='contact@vtcbuilder.com')
    support_email = models.EmailField(default='support@vtcbuilder.com')
    
    # Email Configuration
    email_host = models.CharField(max_length=255, default='smtp.maily.ovh')
    email_port = models.IntegerField(default=587)
    email_use_tls = models.BooleanField(default=True)
    email_use_ssl = models.BooleanField(default=False)
    email_host_user = models.CharField(max_length=255, blank=True)
    email_host_password = models.CharField(max_length=255, blank=True)
    email_from = models.EmailField(default='noreply@vtcbuilder.com')
    
    # Trial Settings
    default_trial_days = models.IntegerField(default=14)
    enable_trial = models.BooleanField(default=True)
    trial_notification_days = models.JSONField(
        default=list,
        blank=True,
        help_text="Jours avant expiration pour envoyer des notifications (ex: [7, 3, 1, 0])"
    )
    trial_auto_expire = models.BooleanField(
        default=True,
        help_text="Passer automatiquement les trials expirés au statut 'expired'"
    )
    
    # Security Settings
    password_min_length = models.IntegerField(default=8)
    require_email_verification = models.BooleanField(default=True)
    session_timeout_minutes = models.IntegerField(default=1440)  # 24 hours
    max_login_attempts = models.IntegerField(default=5)
    lockout_duration_minutes = models.IntegerField(default=30)
    
    # Billing Settings
    default_currency = models.CharField(max_length=3, default='EUR')
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=20.00)  # 20% VAT
    invoice_prefix = models.CharField(max_length=10, default='INV-')
    payment_terms_days = models.IntegerField(default=30)
    
    # Stripe Configuration
    stripe_enabled = models.BooleanField(default=False, help_text="Activer les paiements Stripe")
    stripe_public_key = models.CharField(max_length=255, blank=True, help_text="Clé publique Stripe (pk_test_... ou pk_live_...)")
    stripe_secret_key = models.CharField(max_length=255, blank=True, help_text="Clé secrète Stripe (sk_test_... ou sk_live_...)")
    stripe_webhook_secret = models.CharField(max_length=255, blank=True, help_text="Secret du webhook Stripe (whsec_...)")
    stripe_mode = models.CharField(max_length=10, default='test', choices=[('test', 'Test'), ('live', 'Production')], help_text="Mode Stripe")
    
    # Storage Settings
    max_file_size_mb = models.IntegerField(default=10)
    allowed_file_types = models.JSONField(default=list, blank=True)
    
    # Notification Settings
    enable_email_notifications = models.BooleanField(default=True)
    notify_on_new_tenant = models.BooleanField(default=True)
    notify_on_payment_failed = models.BooleanField(default=True)
    notify_on_subscription_expiring = models.BooleanField(default=True)
    
    # Maintenance Mode
    maintenance_mode = models.BooleanField(default=False)
    maintenance_mode_type = models.CharField(
        max_length=25,
        choices=[
            ('public_only', 'Site public seulement (VTCBuilder)'),
            ('platform_except_admin', 'Plateforme entière sauf admin'),
        ],
        default='public_only',
        help_text="Type de mode maintenance"
    )
    maintenance_message = models.TextField(blank=True, default='Le site est en maintenance.')
    
    # Public Homepage Content (stored as blocks like WordPress)
    public_homepage_blocks = models.JSONField(default=list, blank=True, help_text="Blocs de contenu pour la page d'accueil publique")
    public_homepage_status = models.CharField(
        max_length=20, 
        choices=[('draft', 'Brouillon'), ('published', 'Publié')], 
        default='draft',
        help_text="Statut de publication de la page d'accueil publique"
    )
    public_homepage_meta_title = models.CharField(max_length=255, blank=True, default='VTCBuilder - Le WordPress des chauffeurs VTC')
    public_homepage_meta_description = models.TextField(blank=True, default='Plateforme complète pour créer et gérer votre site VTC professionnel')
    
    # Public Pages (stored as JSON like WordPress)
    public_pages = models.JSONField(
        default=dict,
        blank=True,
        help_text="Pages publiques du site (docs, contact, faq, legal/terms, legal/privacy)"
    )
    
    # Additional Settings (JSON for flexibility)
    extra_settings = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'system_settings'
        verbose_name = 'Paramètres Système'
        verbose_name_plural = 'Paramètres Système'
    
    def __str__(self):
        return 'Paramètres Système'
    
    def save(self, *args, **kwargs):
        # Ensure only one instance exists
        if not self.pk and SystemSettings.objects.exists():
            # Update existing instance instead of creating new one
            existing = SystemSettings.objects.first()
            for field in self._meta.fields:
                if field.name not in ['id', 'created_at', 'updated_at']:
                    setattr(existing, field.name, getattr(self, field.name))
            existing.save()
            return existing
        return super().save(*args, **kwargs)
    
    @classmethod
    def get_settings(cls):
        """Get or create the singleton settings instance"""
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

