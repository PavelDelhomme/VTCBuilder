"""
Tenant models for VTCBuilder multi-tenant system
"""
from django.db import models
from django_tenants.models import TenantMixin, DomainMixin
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils import timezone
from datetime import timedelta
from guardian.mixins import GuardianUserMixin


class Tenant(TenantMixin):
    """
    Tenant model representing a VTC driver/company
    """
    PLAN_CHOICES = [
        ('starter', 'Starter'),
        ('business', 'Business'),
        ('enterprise', 'Entreprise'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('trial', 'Trial'),
        ('cancelled', 'Cancelled'),
        ('deleted', 'Deleted'),  # Soft deleted status
    ]
    
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    email = models.EmailField(unique=True)
    
    # Plan & Billing
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default='starter')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='trial')
    trial_ends_at = models.DateTimeField(null=True, blank=True)
    subscribed_at = models.DateTimeField(null=True, blank=True)
    
    # Branding
    logo = models.ImageField(upload_to='logos/', null=True, blank=True)
    primary_color = models.CharField(max_length=7, default='#3B82F6')
    secondary_color = models.CharField(max_length=7, default='#10B981')
    
    # Settings
    settings = models.JSONField(default=dict, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True, help_text="Date de suppression (soft delete)")
    
    # Required for django-tenants
    auto_create_schema = True
    auto_drop_schema = True  # Automatically drop schema when tenant is deleted
    
    def is_deleted(self):
        """Check if tenant is soft deleted"""
        return self.deleted_at is not None
    
    def soft_delete(self):
        """Soft delete the tenant"""
        from django.utils import timezone
        self.deleted_at = timezone.now()
        self.status = 'cancelled'
        self.save(update_fields=['deleted_at', 'status'])
    
    def restore(self):
        """Restore a soft deleted tenant"""
        self.deleted_at = None
        self.status = 'trial'  # Restore as trial by default
        self.save(update_fields=['deleted_at', 'status'])
    
    class Meta:
        db_table = 'tenants'
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        """Override save to generate a valid schema_name from slug"""
        # Generate a valid schema_name from slug (no hyphens, lowercase, max 63 chars)
        if not self.schema_name and self.slug:
            # Remove hyphens and convert to lowercase
            schema_name = self.slug.replace('-', '_').lower()[:63]
            # Ensure it doesn't start with a number
            if schema_name and schema_name[0].isdigit():
                schema_name = 't_' + schema_name
            self.schema_name = schema_name
        elif not self.schema_name:
            # Fallback: use name if slug is not set
            import re
            schema_name = re.sub(r'[^a-z0-9_]', '', self.name.lower())[:63]
            if not schema_name or schema_name[0].isdigit():
                schema_name = 'tenant_' + schema_name
            self.schema_name = schema_name[:63]
        
        # Ensure schema_name is valid (no hyphens, only lowercase alphanumeric and underscore)
        if self.schema_name:
            import re
            self.schema_name = re.sub(r'[^a-z0-9_]', '', self.schema_name.lower())[:63]
            if not self.schema_name or self.schema_name[0].isdigit():
                self.schema_name = 't_' + self.schema_name[:61]
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name

    def is_active(self):
        return self.status == 'active'

    def is_trial(self):
        return self.status == 'trial'
    
    def is_trial_expired(self):
        """Check if trial has expired"""
        if not self.is_trial():
            return False
        if not self.trial_ends_at:
            return False
        return timezone.now() > self.trial_ends_at
    
    def get_trial_days_remaining(self):
        """Get number of days remaining in trial"""
        if not self.is_trial() or not self.trial_ends_at:
            return None
        now = timezone.now()
        if now > self.trial_ends_at:
            return 0
        return (self.trial_ends_at - now).days


class User(GuardianUserMixin, AbstractUser):
    """
    Custom User model for VTCBuilder with tenant support and roles
    """
    ROLE_CHOICES = [
        ('super-admin', 'Super Admin'),
        ('tenant-admin', 'Tenant Admin'),
        ('driver', 'Driver'),
        ('operator', 'Operator'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
        ('pending', 'Pending'),
    ]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, null=True, blank=True)

    # Profile
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True, null=True)

    # Role & Status
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='operator')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    # Verification
    email_verified_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']  # Fix pagination warning

    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"

    def is_super_admin(self):
        return self.role == 'super-admin'

    def is_tenant_admin(self):
        return self.role == 'tenant-admin'

    def is_driver(self):
        return self.role == 'driver'

    def is_operator(self):
        return self.role == 'operator'

    def is_active_user(self):
        return self.status == 'active'
    
    def can_use_feature(self, feature):
        """
        Vérifie si l'utilisateur peut utiliser une feature.
        Le super admin et les tenants système ont accès à toutes les features sans exception.
        """
        # Super admin a accès à tout
        if self.is_super_admin():
            return True
        
        # Si l'utilisateur n'a pas de tenant, pas d'accès
        if not self.tenant:
            return False
        
        # Les tenants système ont accès à toutes les fonctionnalités
        from tenants.utils import is_system_tenant
        if is_system_tenant(self.tenant):
            return True
        
        # Vérifier si le tenant a un abonnement actif
        try:
            from billing.models import Subscription
            subscription = Subscription.objects.filter(
                tenant=self.tenant,
                status='active'
            ).first()
            
            if not subscription:
                return False
            
            plan = subscription.plan
            
            # Vérifier que le plan existe
            if not plan:
                return False
            
            # Vérifier si la feature est disponible pour ce plan
            return feature.is_available_for_plan(plan)
        except ImportError:
            # Si billing n'est pas disponible, autoriser par défaut
            return True
        except Exception:
            return False


class Feature(models.Model):
    """
    Feature model for managing available features
    """
    FEATURE_STATUS = [
        ('development', 'En développement'),
        ('beta', 'Bêta'),
        ('stable', 'Stable'),
        ('deprecated', 'Déprécié'),
    ]
    
    name = models.CharField(max_length=100, unique=True, help_text="Identifiant unique de la fonctionnalité")
    label = models.CharField(max_length=255, help_text="Nom affiché de la fonctionnalité")
    description = models.TextField(blank=True, help_text="Description de la fonctionnalité")
    status = models.CharField(max_length=20, choices=FEATURE_STATUS, default='development')
    # Relation ManyToMany avec les plans tarifaires qui donnent accès à cette feature
    # Si vide, la feature est accessible à tous les plans
    available_plans = models.ManyToManyField(
        'billing.PricingPlan',
        related_name='available_features',
        blank=True,
        help_text="Plans tarifaires qui donnent accès à cette feature. Si vide, accessible à tous."
    )
    requires_setup = models.BooleanField(default=False, help_text="Nécessite une configuration")
    category = models.CharField(max_length=50, blank=True, help_text="Catégorie de la fonctionnalité")
    order = models.IntegerField(default=0, help_text="Ordre d'affichage")
    is_active = models.BooleanField(default=True, help_text="Fonctionnalité disponible")
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'features'
        ordering = ['category', 'order', 'label']
    
    def __str__(self):
        return f"{self.label} ({self.name})"
    
    def is_available_for_plan(self, plan):
        """
        Vérifie si la feature est disponible pour un plan donné.
        Si aucun plan n'est associé, la feature est accessible à tous.
        """
        if not self.available_plans.exists():
            return True  # Accessible à tous si aucun plan spécifique
        return self.available_plans.filter(id=plan.id).exists()


class UserFeature(models.Model):
    """
    Link between users and enabled features
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enabled_features')
    feature = models.ForeignKey(Feature, on_delete=models.CASCADE, related_name='user_features')
    is_enabled = models.BooleanField(default=True)
    enabled_at = models.DateTimeField(auto_now_add=True)
    enabled_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='features_enabled')
    notes = models.TextField(blank=True, help_text="Notes sur l'activation de cette fonctionnalité")
    
    class Meta:
        db_table = 'user_features'
        unique_together = ['user', 'feature']
        ordering = ['-enabled_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.feature.label}"


class PasswordResetToken(models.Model):
    """
    Password reset token model with expiration
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=255, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'password_reset_tokens'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Password reset for {self.user.email}"
    
    def is_valid(self):
        """Check if token is still valid"""
        return not self.used and timezone.now() < self.expires_at
    
    def mark_as_used(self):
        """Mark token as used"""
        self.used = True
        self.save(update_fields=['used'])


class InvitationToken(models.Model):
    """
    Invitation token for new tenant admins to set up their account
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invitation_tokens')
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='invitations')
    token = models.CharField(max_length=255, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'invitation_tokens'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Invitation for {self.user.email} - {self.tenant.name}"
    
    def is_valid(self):
        """Check if token is still valid"""
        return not self.used and timezone.now() < self.expires_at
    
    def mark_as_used(self):
        """Mark token as used"""
        self.used = True
        self.save(update_fields=['used'])


class Domain(DomainMixin):
    """
    Domain model for tenant routing
    """
    class Meta:
        db_table = 'domains'
    
    def __str__(self):
        return self.domain
