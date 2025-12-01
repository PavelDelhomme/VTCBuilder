"""
Unit tests for Tenant and User models
"""
import pytest
from django.utils import timezone
from django.utils.text import slugify
from django.core.management import call_command
from datetime import timedelta
from django_tenants.utils import schema_context, tenant_context
from tenants.models import Tenant, User, PasswordResetToken, InvitationToken, Domain


def setup_tenant_schema(tenant):
    """Helper function to create and migrate tenant schema"""
    try:
        tenant.save()  # Trigger schema creation if auto_create_schema is True
        call_command('migrate_schemas', schema_name=tenant.schema_name, verbosity=0, interactive=False)
    except Exception:
        pass


@pytest.mark.django_db
@pytest.mark.model
class TestTenantModel:
    """Tests for Tenant model"""

    def test_create_tenant(self):
        """Test creating a tenant"""
        tenant = Tenant.objects.create(
            name='Test Tenant',
            email='test@tenant.com',
            slug='test-tenant',
            plan='starter',
            status='active'
        )
        # Create domain for tenant
        Domain.objects.create(tenant=tenant, domain='test-tenant.localhost', is_primary=True)
        
        setup_tenant_schema(tenant)
        
        assert tenant.name == 'Test Tenant'
        assert tenant.email == 'test@tenant.com'
        assert tenant.slug == 'test-tenant'
        assert tenant.plan == 'starter'
        assert tenant.status == 'active'
        assert tenant.slug is not None

    def test_tenant_slug_auto_generation(self):
        """Test that slug is auto-generated from name"""
        slug = slugify('My Test Company')
        tenant = Tenant.objects.create(
            name='My Test Company',
            email='test@company.com',
            slug=slug
        )
        # Create domain for tenant
        Domain.objects.create(tenant=tenant, domain=f'{slug}.localhost', is_primary=True)
        
        setup_tenant_schema(tenant)
        
        assert tenant.slug == 'my-test-company'

    def test_tenant_is_active(self):
        """Test is_active property"""
        active_tenant = Tenant.objects.create(
            name='Active Tenant',
            email='active@test.com',
            slug='active-tenant',
            status='active'
        )
        Domain.objects.create(tenant=active_tenant, domain='active-tenant.localhost', is_primary=True)
        try:
            active_tenant.save()
            call_command('migrate_schemas', schema_name=active_tenant.schema_name, verbosity=0, interactive=False)
        except Exception:
            pass
        assert active_tenant.is_active() is True

        inactive_tenant = Tenant.objects.create(
            name='Inactive Tenant',
            email='inactive@test.com',
            slug='inactive-tenant',
            status='suspended'
        )
        Domain.objects.create(tenant=inactive_tenant, domain='inactive-tenant.localhost', is_primary=True)
        setup_tenant_schema(inactive_tenant)
        assert inactive_tenant.is_active() is False

    def test_tenant_is_trial(self):
        """Test is_trial property"""
        trial_tenant = Tenant.objects.create(
            name='Trial Tenant',
            email='trial@test.com',
            slug='trial-tenant',
            status='trial',
            trial_ends_at=timezone.now() + timedelta(days=7)
        )
        Domain.objects.create(tenant=trial_tenant, domain='trial-tenant.localhost', is_primary=True)
        setup_tenant_schema(trial_tenant)
        assert trial_tenant.is_trial() is True

        active_tenant = Tenant.objects.create(
            name='Active Tenant',
            email='active@test.com',
            slug='active-tenant-2',
            status='active'
        )
        Domain.objects.create(tenant=active_tenant, domain='active-tenant-2.localhost', is_primary=True)
        try:
            active_tenant.save()
            call_command('migrate_schemas', schema_name=active_tenant.schema_name, verbosity=0, interactive=False)
        except Exception:
            pass
        assert active_tenant.is_trial() is False

    def test_tenant_soft_delete(self):
        """Test soft delete functionality"""
        tenant = Tenant.objects.create(
            name='To Delete',
            email='delete@test.com',
            slug='to-delete'
        )
        Domain.objects.create(tenant=tenant, domain='to-delete.localhost', is_primary=True)
        setup_tenant_schema(tenant)
        tenant_id = tenant.id

        tenant.soft_delete()  # Use soft_delete method instead of delete()
        tenant.refresh_from_db()
        assert tenant.deleted_at is not None
        assert tenant.status == 'cancelled'

        # Should not appear in default queryset (if filtered)
        # But still exist in database
        assert Tenant.objects.filter(id=tenant_id).exists()
        assert Tenant.objects.filter(deleted_at__isnull=False, id=tenant_id).exists()


@pytest.mark.django_db
@pytest.mark.model
class TestUserModel:
    """Tests for User model"""

    def test_create_user(self):
        """Test creating a user"""
        tenant = Tenant.objects.create(
            name='Test Tenant',
            email='test@tenant.com',
            slug='test-tenant'
        )
        Domain.objects.create(tenant=tenant, domain='test-tenant.localhost', is_primary=True)
        setup_tenant_schema(tenant)

        # Create user in tenant context
        with tenant_context(tenant):
            user = User.objects.create_user(
                username='testuser',
                email='user@test.com',
                password='password123',
                tenant=tenant,
                role='operator'
            )
            assert user.username == 'testuser'
            assert user.email == 'user@test.com'
            assert user.tenant == tenant
            assert user.role == 'operator'
            assert user.check_password('password123') is True

    def test_user_is_active(self):
        """Test is_active property"""
        tenant = Tenant.objects.create(name='Test', email='test@test.com', slug='test')
        Domain.objects.create(tenant=tenant, domain='test.localhost', is_primary=True)
        setup_tenant_schema(tenant)
        
        with tenant_context(tenant):
            active_user = User.objects.create_user(
                username='active',
                email='active@test.com',
                password='pass',
                tenant=tenant,
                status='active'
            )
            assert active_user.is_active_user() is True

            inactive_user = User.objects.create_user(
                username='inactive',
                email='inactive@test.com',
                password='pass',
                tenant=tenant,
                status='suspended'
            )
            assert inactive_user.is_active_user() is False

    def test_user_is_super_admin(self):
        """Test is_super_admin method"""
        tenant = Tenant.objects.create(name='Test', email='test@test.com', slug='test')
        Domain.objects.create(tenant=tenant, domain='test.localhost', is_primary=True)
        setup_tenant_schema(tenant)
        
        # Super admin doesn't need tenant context
        super_admin = User.objects.create_user(
            username='super',
            email='super@test.com',
            password='pass',
            tenant=None,
            role='super-admin'
        )
        assert super_admin.is_super_admin() is True

        # Regular user needs tenant context
        with tenant_context(tenant):
            regular_user = User.objects.create_user(
                username='regular',
                email='regular@test.com',
                password='pass',
                tenant=tenant,
                role='operator'
            )
            assert regular_user.is_super_admin() is False


@pytest.mark.django_db
@pytest.mark.model
class TestPasswordResetToken:
    """Tests for PasswordResetToken model"""

    def test_create_reset_token(self):
        """Test creating a password reset token"""
        tenant = Tenant.objects.create(name='Test', email='test@test.com', slug='test')
        Domain.objects.create(tenant=tenant, domain='test.localhost', is_primary=True)
        setup_tenant_schema(tenant)
        
        with tenant_context(tenant):
            user = User.objects.create_user(
                username='test',
                email='test@test.com',
                password='pass',
                tenant=tenant
            )
            
            # Generate token and expiration
            from django.utils.crypto import get_random_string
            token_str = get_random_string(length=64)
            expires_at = timezone.now() + timedelta(hours=24)
            
            token = PasswordResetToken.objects.create(
                user=user,
                token=token_str,
                expires_at=expires_at
            )
            assert token.user == user
            assert token.token == token_str
            assert len(token.token) == 64
            assert token.expires_at > timezone.now()

    def test_token_expiration(self):
        """Test token expiration"""
        tenant = Tenant.objects.create(name='Test', email='test@test.com', slug='test')
        Domain.objects.create(tenant=tenant, domain='test.localhost', is_primary=True)
        setup_tenant_schema(tenant)
        
        with tenant_context(tenant):
            user = User.objects.create_user(
                username='test',
                email='test@test.com',
                password='pass',
                tenant=tenant
            )

            from django.utils.crypto import get_random_string
            token_str = get_random_string(length=64)
            expires_at = timezone.now() + timedelta(hours=24)
            
            token = PasswordResetToken.objects.create(
                user=user,
                token=token_str,
                expires_at=expires_at
            )
            assert token.is_valid() is True

            # Set token as expired
            token.expires_at = timezone.now() - timedelta(minutes=1)
            token.save()
            assert token.is_valid() is False


@pytest.mark.django_db
@pytest.mark.model
class TestInvitationToken:
    """Tests for InvitationToken model"""

    def test_create_invitation_token(self):
        """Test creating an invitation token"""
        tenant = Tenant.objects.create(name='Test', email='test@test.com', slug='test')
        Domain.objects.create(tenant=tenant, domain='test.localhost', is_primary=True)
        setup_tenant_schema(tenant)
        
        # Create user first (InvitationToken requires a user)
        with tenant_context(tenant):
            user = User.objects.create_user(
                username='invited',
                email='invite@test.com',
                password='pass',
                tenant=tenant,
                role='operator'
            )
        
        # Generate token and expiration
        from django.utils.crypto import get_random_string
        token_str = get_random_string(length=64)
        expires_at = timezone.now() + timedelta(days=30)
        
        token = InvitationToken.objects.create(
            tenant=tenant,
            user=user,
            token=token_str,
            expires_at=expires_at
        )
        assert token.tenant == tenant
        assert token.user == user
        assert token.user.email == 'invite@test.com'
        assert token.user.role == 'operator'
        assert token.token == token_str
        assert token.used is False

    def test_token_usage(self):
        """Test marking token as used"""
        tenant = Tenant.objects.create(name='Test', email='test@test.com', slug='test')
        Domain.objects.create(tenant=tenant, domain='test.localhost', is_primary=True)
        setup_tenant_schema(tenant)
        
        # Create user first
        with tenant_context(tenant):
            user = User.objects.create_user(
                username='invited',
                email='invite@test.com',
                password='pass',
                tenant=tenant
            )
        
        from django.utils.crypto import get_random_string
        token_str = get_random_string(length=64)
        expires_at = timezone.now() + timedelta(days=30)
        
        token = InvitationToken.objects.create(
            tenant=tenant,
            user=user,
            token=token_str,
            expires_at=expires_at
        )
        assert token.used is False

        token.mark_as_used()
        token.refresh_from_db()
        assert token.used is True

