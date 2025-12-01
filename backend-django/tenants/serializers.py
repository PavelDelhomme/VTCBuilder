"""
Serializers for tenant models
"""
from rest_framework import serializers
from .models import Tenant, Domain, User, Feature, UserFeature


class DomainSerializer(serializers.ModelSerializer):
    """Serializer for Domain model"""

    class Meta:
        model = Domain
        fields = ['id', 'domain', 'is_primary']
        read_only_fields = ['id']


class TenantSerializer(serializers.ModelSerializer):
    """Serializer for Tenant model"""
    domains = DomainSerializer(many=True, read_only=True)

    class Meta:
        model = Tenant
        fields = [
            'id', 'name', 'slug', 'email', 'plan', 'status',
            'trial_ends_at', 'subscribed_at', 'logo', 'primary_color',
            'secondary_color', 'settings', 'metadata', 'domains',
            'created_at', 'updated_at', 'deleted_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'deleted_at']

    def update(self, instance, validated_data):
        """Update tenant, merging settings JSON instead of replacing"""
        # Handle settings merge for partial updates
        if 'settings' in validated_data:
            current_settings = instance.settings or {}
            new_settings = validated_data['settings']
            # Merge new settings with existing ones
            if isinstance(new_settings, dict) and isinstance(current_settings, dict):
                validated_data['settings'] = {**current_settings, **new_settings}
        
        return super().update(instance, validated_data)

    def create(self, validated_data):
        """Create tenant with auto-generated slug and schema_name, and create admin with invitation"""
        from django.utils.text import slugify
        from django.utils.crypto import get_random_string
        from django.utils import timezone
        from datetime import timedelta
        from .models import User, InvitationToken
        from .permissions import assign_role_permissions
        from django.core.mail import send_mail
        from django.conf import settings
        
        # Generate slug if not provided
        if not validated_data.get('slug'):
            validated_data['slug'] = slugify(validated_data['name'])
        
        # Set trial_ends_at if status is trial and enable_trial is True
        tenant_status = validated_data.get('status', 'trial')  # Default is 'trial' from model
        if tenant_status == 'trial':
            try:
                from settings_app.models import SystemSettings
                settings = SystemSettings.get_settings()
                if settings.enable_trial:
                    if not validated_data.get('trial_ends_at'):
                        validated_data['trial_ends_at'] = timezone.now() + timedelta(days=settings.default_trial_days)
            except Exception:
                # Fallback to 14 days if SystemSettings not available
                if not validated_data.get('trial_ends_at'):
                    validated_data['trial_ends_at'] = timezone.now() + timedelta(days=14)
        
        tenant = super().create(validated_data)
        
        # Use the email provided in tenant.email to create the admin user
        # The email field should always be set when creating a tenant
        admin_email = tenant.email or validated_data.get('email')
        
        # If no email provided, generate a default one
        if not admin_email:
            admin_email = f"admin@{tenant.slug}.vtcbuilder.local"
            tenant.email = admin_email
            tenant.save(update_fields=['email'])
        
        # Generate username from email
        username_base = admin_email.split('@')[0].replace('.', '_').replace('-', '_')
        tenant_slug = tenant.slug.replace('-', '_').replace('.', '_')
        username = f"{username_base}_{tenant_slug}"[:30]  # Max 30 chars for username
        
        # Check if user already exists with this email
        existing_user = User.objects.filter(email=admin_email).first()
        if existing_user:
            # Update existing user to be admin of this tenant
            existing_user.tenant = tenant
            existing_user.role = 'tenant-admin'
            existing_user.status = 'pending'
            existing_user.save()
            admin_user = existing_user
        else:
            # Generate a random password (user will set their own via invitation)
            random_password = get_random_string(length=32)
            
            # Create admin user in public schema (for authentication)
            admin_user = User.objects.create_user(
                username=username,
                email=admin_email,
                password=random_password,  # Temporary password, will be changed via invitation
                first_name='Admin',
                last_name=tenant.name[:30] if tenant.name else 'User',
                tenant=tenant,
                role='tenant-admin',
                status='pending'  # Pending until they complete setup
            )
            
        # Assign permissions if function exists
        try:
            from .permissions import assign_role_permissions
            assign_role_permissions(admin_user, 'tenant-admin')
        except ImportError:
            pass  # Permissions system optional
        
        # Create invitation token (valid for 30 days) - check if one already exists
        existing_token = InvitationToken.objects.filter(
            user=admin_user,
            tenant=tenant,
            used=False
        ).first()
        
        if not existing_token:
            invitation_token = get_random_string(length=64)
            expires_at = timezone.now() + timedelta(days=30)
            
            InvitationToken.objects.create(
                user=admin_user,
                tenant=tenant,
                token=invitation_token,
                expires_at=expires_at
            )
        else:
            invitation_token = existing_token.token
        
        # Activer les fonctionnalités selon le plan du tenant (si abonnement existe)
        try:
            from .utils import enable_features_for_tenant
            from billing.models import Subscription
            subscription = Subscription.objects.filter(
                tenant=tenant,
                status__in=['active', 'trial']
            ).first()
            if subscription:
                enable_features_for_tenant(tenant, subscription.plan)
        except Exception as e:
            # Ne pas bloquer la création du tenant si l'activation des features échoue
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Erreur activation fonctionnalités pour tenant {tenant.slug}: {e}")
        
        # Generate setup URL
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:9494')
        setup_url = f"{frontend_url}/setup?token={invitation_token}&email={admin_email}"
        
        # Send invitation email
        try:
            send_mail(
                subject=f'Invitation à configurer votre site VTC - {tenant.name}',
                message=f'''
Bonjour,

Vous avez été invité à configurer votre compte VTCBuilder pour {tenant.name}.

Cliquez sur le lien suivant pour définir votre mot de passe et accéder à votre espace d'administration (lien valable 30 jours) :
{setup_url}

Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.

Cordialement,
L'équipe VTCBuilder
                ''',
                html_message=f'''
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>Invitation à configurer votre compte VTCBuilder</h2>
                    <p>Bonjour,</p>
                    <p>Vous avez été invité à configurer votre compte VTCBuilder pour <strong>{tenant.name}</strong>.</p>
                    <p>
                        <a href="{setup_url}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Configurer mon compte
                        </a>
                    </p>
                    <p>Ou copiez ce lien dans votre navigateur :</p>
                    <p style="word-break: break-all; color: #666;">{setup_url}</p>
                    <p><small>Ce lien est valable pendant 30 jours.</small></p>
                    <p>Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">Cordialement,<br>L'équipe VTCBuilder</p>
                </body>
                </html>
                ''',
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@vtcbuilder.com'),
                recipient_list=[admin_email],
                fail_silently=False,
            )
        except Exception as e:
            # Email sending failure shouldn't prevent tenant creation
            import logging
            logging.getLogger(__name__).error(f"Failed to send invitation email: {e}")
        
        # Create default project for the tenant
        try:
            from projects.models import Project
            from django.utils.text import slugify
            
            project_slug = f"{tenant.slug}-site"
            project_name = f"{tenant.name} - Site Principal"
            
            # Check if project already exists
            if not Project.objects.filter(slug=project_slug, tenant=tenant).exists():
                Project.objects.create(
                    name=project_name,
                    slug=project_slug,
                    description=f"Projet principal pour {tenant.name}",
                    tenant=tenant,
                    is_system_project=False,
                    status='active'
                )
                import logging
                logging.getLogger(__name__).info(f"Default project created for tenant {tenant.name}")
        except Exception as e:
            # Project creation failure shouldn't prevent tenant creation
            import logging
            logging.getLogger(__name__).warning(f"Failed to create default project for tenant {tenant.name}: {e}")
        
        return tenant


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    tenant_id = serializers.IntegerField(source='tenant.id', read_only=True, allow_null=True)
    roles = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'name',
            'tenant', 'tenant_id', 'tenant_name', 'avatar', 'phone', 'role', 'roles', 'status',
            'permissions', 'email_verified_at', 'created_at', 'updated_at', 'password'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'tenant_name', 'tenant_id']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'tenant': {'required': False, 'allow_null': True},
            'username': {'required': False},  # Allow partial updates without username
            'email': {'required': False},  # Allow partial updates without email
        }

    def get_roles(self, obj):
        """Return roles as array"""
        return [obj.role] if obj.role else []

    def get_permissions(self, obj):
        """Return user permissions"""
        # TODO: Implement actual permissions from guardian
        return []

    def get_name(self, obj):
        """Return full name"""
        return obj.get_full_name() or obj.username

    def to_representation(self, instance):
        """Add tenant_id and tenant_name to representation"""
        try:
            data = super().to_representation(instance)
            try:
                if instance.tenant:
                    data['tenant_id'] = instance.tenant.id
                    data['tenant_name'] = instance.tenant.name
                    # Also include tenant object for compatibility
                    if 'tenant' not in data or not data.get('tenant'):
                        data['tenant'] = {
                            'id': instance.tenant.id,
                            'name': instance.tenant.name,
                        }
                else:
                    data['tenant_id'] = None
                    data['tenant_name'] = None
                    data['tenant'] = None
            except Exception as e:
                # If tenant access fails, set to None
                import logging
                logging.getLogger(__name__).warning(f"Error accessing tenant for user {instance.id}: {e}")
                data['tenant_id'] = None
                data['tenant_name'] = None
                data['tenant'] = None
            return data
        except Exception as e:
            # If serialization fails completely, return minimal data
            import logging
            logging.getLogger(__name__).error(f"Error serializing user {instance.id if instance else 'unknown'}: {e}", exc_info=True)
            return {
                'id': instance.id if instance else None,
                'email': instance.email if instance and hasattr(instance, 'email') else None,
                'error': 'Error serializing user data'
            }

    def create(self, validated_data):
        """Create user with encrypted password and quota check"""
        # Check quota if user is being added to a tenant
        tenant = validated_data.get('tenant')
        if tenant:
            from .quota import check_user_quota
            can_add, current_count, max_users, error_message = check_user_quota(tenant)
            
            if not can_add:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({
                    'tenant': error_message,
                    'quota': {
                        'current': current_count,
                        'max': max_users,
                    }
                })
        
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        """Update user with password handling and email validation"""
        # Check if email is being changed and validate uniqueness
        if 'email' in validated_data and validated_data['email'] != instance.email:
            from django.core.exceptions import ValidationError
            from django.contrib.auth import get_user_model
            User = get_user_model()
            # Check if new email already exists
            if User.objects.filter(email=validated_data['email']).exclude(id=instance.id).exists():
                from rest_framework.exceptions import ValidationError as DRFValidationError
                raise DRFValidationError({'email': 'Un utilisateur avec cet email existe déjà.'})
        
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user


class UserRegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'password', 'password_confirm', 'phone', 'tenant'
        ]

    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        """Create user with encrypted password"""
        validated_data.pop('password_confirm')
        return UserSerializer.create(self, validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile updates"""

    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'avatar', 'phone',
            'email_verified_at'
        ]
        read_only_fields = ['id', 'email_verified_at']


class FeatureSerializer(serializers.ModelSerializer):
    """Serializer for Feature model"""
    available_plans = serializers.SerializerMethodField()
    plan_names = serializers.SerializerMethodField()
    
    class Meta:
        model = Feature
        fields = [
            'id', 'name', 'label', 'description', 'status', 'available_plans', 'plan_names',
            'requires_setup', 'category', 'order', 'is_active', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_available_plans(self, obj):
        """Retourne les IDs des plans qui donnent accès à cette feature"""
        return [plan.id for plan in obj.available_plans.all()]
    
    def get_plan_names(self, obj):
        """Retourne les noms des plans pour affichage"""
        return [plan.name for plan in obj.available_plans.all()]


class UserFeatureSerializer(serializers.ModelSerializer):
    """Serializer for UserFeature model"""
    feature = FeatureSerializer(read_only=True)
    feature_id = serializers.IntegerField(write_only=True, required=False)
    user_email = serializers.CharField(source='user.email', read_only=True)
    enabled_by_email = serializers.CharField(source='enabled_by.email', read_only=True, allow_null=True)
    
    class Meta:
        model = UserFeature
        fields = [
            'id', 'user', 'user_email', 'feature', 'feature_id',
            'is_enabled', 'enabled_at', 'enabled_by', 'enabled_by_email', 'notes'
        ]
        read_only_fields = ['id', 'enabled_at', 'user']
    
    def create(self, validated_data):
        feature_id = validated_data.pop('feature_id', None)
        if feature_id:
            try:
                feature = Feature.objects.get(id=feature_id)
                validated_data['feature'] = feature
            except Feature.DoesNotExist:
                raise serializers.ValidationError({'feature_id': 'Feature not found'})
        
        validated_data['enabled_by'] = self.context['request'].user
        return super().create(validated_data)
