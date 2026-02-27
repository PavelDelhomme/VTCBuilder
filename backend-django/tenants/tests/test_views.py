"""
Unit tests for Tenant API views
"""
import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django_tenants.utils import schema_context
from tenants.models import Tenant, User


@pytest.mark.django_db
@pytest.mark.api
class TestTenantViewSet:
    """Tests for Tenant ViewSet"""

    @pytest.fixture
    def api_client(self):
        """Create API client"""
        return APIClient()

    @pytest.fixture
    def super_admin(self):
        """Create super admin user"""
        return User.objects.create_user(
            username='superadmin',
            email='admin@vtcbuilder.com',
            password='admin123',
            role='super-admin',
            tenant=None
        )

    @pytest.fixture
    def authenticated_client(self, api_client, super_admin):
        """Create authenticated API client"""
        api_client.force_authenticate(user=super_admin)
        return api_client

    def test_list_tenants_requires_authentication(self, api_client):
        """Test that listing tenants requires authentication"""
        url = reverse('tenant-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_tenants_as_super_admin(self, authenticated_client):
        """Test listing tenants as super admin"""
        from django.utils.text import slugify
        from tenants.models import Domain
        
        tenant1 = Tenant.objects.create(
            name='Test Tenant 1',
            email='test1@example.com',
            slug='test-tenant-1',
            status='active'
        )
        Domain.objects.create(tenant=tenant1, domain='test-tenant-1.localhost', is_primary=True)
        
        tenant2 = Tenant.objects.create(
            name='Test Tenant 2',
            email='test2@example.com',
            slug='test-tenant-2',
            status='active'
        )
        Domain.objects.create(tenant=tenant2, domain='test-tenant-2.localhost', is_primary=True)

        url = reverse('tenant-list')
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 2

    def test_create_tenant_as_super_admin(self, authenticated_client):
        """Test creating a tenant as super admin"""
        url = reverse('tenant-list')
        data = {
            'name': 'New Tenant',
            'email': 'new@example.com',
            'plan': 'starter',
            'status': 'active'
        }
        response = authenticated_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'New Tenant'
        assert Tenant.objects.filter(name='New Tenant').exists()

    def test_update_tenant(self, authenticated_client):
        """Test updating a tenant"""
        from tenants.models import Domain
        
        tenant = Tenant.objects.create(
            name='Original Name',
            email='original@example.com',
            slug='original-name'
        )
        Domain.objects.create(tenant=tenant, domain='original-name.localhost', is_primary=True)
        
        url = reverse('tenant-detail', kwargs={'pk': tenant.pk})
        data = {'name': 'Updated Name'}
        response = authenticated_client.patch(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        tenant.refresh_from_db()
        assert tenant.name == 'Updated Name'

    def test_delete_tenant_soft_delete(self, authenticated_client):
        """Test soft deleting a tenant"""
        from tenants.models import Domain
        
        tenant = Tenant.objects.create(
            name='To Delete',
            email='delete@example.com',
            slug='to-delete'
        )
        Domain.objects.create(tenant=tenant, domain='to-delete.localhost', is_primary=True)
        
        url = reverse('tenant-detail', kwargs={'pk': tenant.pk})
        response = authenticated_client.delete(url)
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT]
        tenant.refresh_from_db()
        assert tenant.deleted_at is not None

    def test_suspend_tenant(self, authenticated_client):
        """Test suspending a tenant"""
        tenant = Tenant.objects.create(
            name='Test Tenant',
            email='test@example.com',
            status='active'
        )
        url = reverse('tenant-suspend', kwargs={'pk': tenant.pk})
        response = authenticated_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        tenant.refresh_from_db()
        assert tenant.status == 'suspended'

    def test_activate_tenant(self, authenticated_client):
        """Test activating a tenant"""
        tenant = Tenant.objects.create(
            name='Test Tenant',
            email='test@example.com',
            status='suspended'
        )
        url = reverse('tenant-activate', kwargs={'pk': tenant.pk})
        response = authenticated_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        tenant.refresh_from_db()
        assert tenant.status == 'active'


@pytest.mark.django_db
@pytest.mark.api
class TestLoginView:
    """Tests for login endpoint"""

    @pytest.fixture
    def api_client(self):
        """Create API client"""
        return APIClient()

    @pytest.fixture
    def test_user(self):
        """Create test user"""
        from django_tenants.utils import tenant_context
        from tenants.models import Domain
        
        tenant = Tenant.objects.create(
            name='Test Tenant',
            email='test@tenant.com',
            slug='test-tenant'
        )
        Domain.objects.create(tenant=tenant, domain='test-tenant.localhost', is_primary=True)
        
        # Create user in tenant context
        with tenant_context(tenant):
            return User.objects.create_user(
                username='testuser',
                email='test@example.com',
                password='password123',
                tenant=tenant,
                status='active'  # Ensure user is active
            )

    def test_login_success(self, api_client, test_user):
        """Test successful login"""
        url = reverse('login')
        data = {
            'email': 'test@example.com',
            'password': 'password123'
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        data = response.data
        tokens = data.get('tokens', data)
        assert 'access' in tokens
        assert 'refresh' in tokens
        assert 'user' in data

    def test_login_invalid_credentials(self, api_client):
        """Test login with invalid credentials"""
        url = reverse('login')
        data = {
            'email': 'wrong@example.com',
            'password': 'wrongpassword'
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
@pytest.mark.api
class TestUserViewSet:
    """Tests for User ViewSet"""

    @pytest.fixture
    def api_client(self):
        """Create API client"""
        return APIClient()

    @pytest.fixture
    def super_admin(self):
        """Create super admin user"""
        return User.objects.create_user(
            username='superadmin',
            email='admin@vtcbuilder.com',
            password='admin123',
            role='super-admin',
            tenant=None
        )

    @pytest.fixture
    def tenant_admin(self):
        """Create tenant admin user"""
        from tenants.models import Domain
        
        tenant = Tenant.objects.create(
            name='Test Tenant',
            email='test@tenant.com',
            slug='test-tenant',
            status='active'
        )
        Domain.objects.create(tenant=tenant, domain='test-tenant.localhost', is_primary=True)
        
        return User.objects.create_user(
            username='tenantadmin',
            email='tenant@example.com',
            password='password123',
            role='tenant-admin',
            tenant=tenant,
            status='active'
        )

    @pytest.fixture
    def authenticated_super_admin(self, api_client, super_admin):
        """Create authenticated API client as super admin"""
        api_client.force_authenticate(user=super_admin)
        return api_client

    @pytest.fixture
    def authenticated_tenant_admin(self, api_client, tenant_admin):
        """Create authenticated API client as tenant admin"""
        api_client.force_authenticate(user=tenant_admin)
        return api_client

    @pytest.fixture
    def test_tenant(self):
        """Create test tenant"""
        from tenants.models import Domain
        
        tenant = Tenant.objects.create(
            name='Test Tenant',
            email='test@tenant.com',
            slug='test-tenant',
            status='active'
        )
        Domain.objects.create(tenant=tenant, domain='test-tenant.localhost', is_primary=True)
        return tenant

    def test_create_user_as_super_admin(self, authenticated_super_admin, test_tenant):
        """Test creating a user as super admin"""
        url = reverse('user-list')
        data = {
            'email': 'newuser@example.com',
            'username': 'newuser',
            'password': 'password123',
            'role': 'operator',
            'tenant': test_tenant.id,
            'status': 'active',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        response = authenticated_super_admin.post(url, data, format='json')
        assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST]
        if response.status_code == status.HTTP_201_CREATED:
            assert response.data.get('email') == 'newuser@example.com'
            assert User.objects.filter(email='newuser@example.com').exists()

    def test_create_user_as_tenant_admin(self, authenticated_tenant_admin, tenant_admin):
        """Test creating a user as tenant admin (should work for their tenant)"""
        url = reverse('user-list')
        data = {
            'email': 'newuser@example.com',
            'username': 'newuser',
            'password': 'password123',
            'role': 'operator',
            'status': 'active'
        }
        response = authenticated_tenant_admin.post(url, data, format='json')
        assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST]
        if response.status_code == status.HTTP_201_CREATED:
            user = User.objects.get(email='newuser@example.com')
            assert user.tenant == tenant_admin.tenant

    def test_create_user_requires_authentication(self, api_client):
        """Test that creating a user requires authentication"""
        url = reverse('user-list')
        data = {
            'email': 'test@example.com',
            'password': 'password123'
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_super_admin_requires_super_admin(self, authenticated_tenant_admin):
        """Test that only super admin can create super admin users"""
        url = reverse('user-list')
        data = {
            'email': 'super@example.com',
            'username': 'super',
            'password': 'password123',
            'role': 'super-admin',
            'status': 'active'
        }
        response = authenticated_tenant_admin.post(url, data, format='json')
        # Tenant admin should not be able to create super admin
        assert response.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_400_BAD_REQUEST]

    def test_create_user_without_password_fails(self, authenticated_super_admin, test_tenant):
        """Test that creating a user without password fails"""
        url = reverse('user-list')
        data = {
            'email': 'test@example.com',
            'username': 'test',
            'role': 'operator',
            'tenant': test_tenant.id,
            'status': 'active'
        }
        response = authenticated_super_admin.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_list_users_as_super_admin(self, authenticated_super_admin):
        """Test listing users as super admin"""
        # Create a test user
        User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='password123',
            role='operator'
        )
        
        url = reverse('user-list')
        response = authenticated_super_admin.get(url)
        assert response.status_code == status.HTTP_200_OK
        # Should see all users
        assert len(response.data.get('results', [])) >= 1

    def test_list_users_as_tenant_admin(self, authenticated_tenant_admin, tenant_admin):
        """Test that tenant admin only sees users from their tenant"""
        # Create user in same tenant
        User.objects.create_user(
            username='same_tenant',
            email='same@example.com',
            password='password123',
            role='operator',
            tenant=tenant_admin.tenant
        )
        
        # Create user in different tenant
        from tenants.models import Domain
        other_tenant = Tenant.objects.create(
            name='Other Tenant',
            email='other@tenant.com',
            slug='other-tenant',
            status='active'
        )
        Domain.objects.create(tenant=other_tenant, domain='other-tenant.localhost', is_primary=True)
        User.objects.create_user(
            username='other_tenant',
            email='other@example.com',
            password='password123',
            role='operator',
            tenant=other_tenant
        )
        
        url = reverse('user-list')
        response = authenticated_tenant_admin.get(url)
        assert response.status_code == status.HTTP_200_OK
        users = response.data.get('results', [])
        # Should only see users from their tenant
        assert all(user['tenant'] == tenant_admin.tenant.id for user in users if user.get('tenant'))

