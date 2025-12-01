"""
Serializers for System Settings
"""
from rest_framework import serializers
from .models import SystemSettings


class SystemSettingsSerializer(serializers.ModelSerializer):
    """Serializer for System Settings"""
    
    class Meta:
        model = SystemSettings
        fields = [
            'id',
            'site_name',
            'site_url',
            'contact_email',
            'support_email',
            'email_host',
            'email_port',
            'email_use_tls',
            'email_use_ssl',
            'email_host_user',
            'email_host_password',
            'email_from',
            'default_trial_days',
            'enable_trial',
            'trial_notification_days',
            'trial_auto_expire',
            'password_min_length',
            'require_email_verification',
            'session_timeout_minutes',
            'max_login_attempts',
            'lockout_duration_minutes',
            'default_currency',
            'tax_rate',
            'invoice_prefix',
            'payment_terms_days',
            'max_file_size_mb',
            'allowed_file_types',
            'enable_email_notifications',
            'notify_on_new_tenant',
            'notify_on_payment_failed',
            'notify_on_subscription_expiring',
            'maintenance_mode',
            'maintenance_mode_type',
            'maintenance_message',
            'public_homepage_blocks',
            'public_homepage_status',
            'public_homepage_meta_title',
            'public_homepage_meta_description',
            'public_pages',
            'stripe_enabled',
            'stripe_public_key',
            'stripe_secret_key',
            'stripe_webhook_secret',
            'stripe_mode',
            'extra_settings',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def to_representation(self, instance):
        """Override to handle missing database fields gracefully"""
        data = super().to_representation(instance)
        
        # Check if fields exist in database, if not set defaults
        try:
            # Try to access the field to see if it exists in DB
            _ = instance.public_homepage_blocks
        except (AttributeError, Exception):
            # Field doesn't exist in database yet, set default
            data['public_homepage_blocks'] = []
        
        try:
            _ = instance.public_homepage_meta_title
        except (AttributeError, Exception):
            data['public_homepage_meta_title'] = 'VTCBuilder - Le WordPress des chauffeurs VTC'
        
        try:
            _ = instance.public_homepage_meta_description
        except (AttributeError, Exception):
            data['public_homepage_meta_description'] = 'Plateforme complète pour créer et gérer votre site VTC professionnel'
        
        try:
            _ = instance.public_homepage_status
        except (AttributeError, Exception):
            data['public_homepage_status'] = 'draft'
        
        try:
            _ = instance.trial_notification_days
        except (AttributeError, Exception):
            data['trial_notification_days'] = [7, 3, 1, 0]
        
        try:
            _ = instance.trial_auto_expire
        except (AttributeError, Exception):
            data['trial_auto_expire'] = True
        
        try:
            _ = instance.public_pages
        except (AttributeError, Exception):
            data['public_pages'] = {}
        
        # Handle Stripe fields gracefully
        try:
            _ = instance.stripe_enabled
        except (AttributeError, Exception):
            data['stripe_enabled'] = False
            data['stripe_public_key'] = ''
            data['stripe_secret_key'] = ''
            data['stripe_webhook_secret'] = ''
            data['stripe_mode'] = 'test'
        
        return data
        
    def validate(self, data):
        """Validate settings data"""
        if data.get('email_port') and not (1 <= data['email_port'] <= 65535):
            raise serializers.ValidationError({'email_port': 'Le port doit être entre 1 et 65535'})
        
        if data.get('default_trial_days') and data['default_trial_days'] < 0:
            raise serializers.ValidationError({'default_trial_days': 'Les jours d\'essai doivent être positifs'})
        
        if data.get('password_min_length') and data['password_min_length'] < 6:
            raise serializers.ValidationError({'password_min_length': 'La longueur minimale du mot de passe doit être d\'au moins 6 caractères'})
        
        if data.get('tax_rate') is not None and (data['tax_rate'] < 0 or data['tax_rate'] > 100):
            raise serializers.ValidationError({'tax_rate': 'Le taux de taxe doit être entre 0 et 100'})
        
        return data

