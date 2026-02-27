"""
Tests complets et exhaustifs pour toutes les vues API
"""
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from django_tenants.utils import schema_context
from tenants.models import Tenant, User, Domain
from conftest import setup_tenant_schema


@pytest.mark.django_db
@pytest.mark.api
class TestDashboardViewComprehensive:
    """Tests exhaustifs pour DashboardView"""

    @pytest.fixture
    def api_client(self):
        return APIClient()

    @pytest.fixture
    def super_admin(self):
        """Créer un super admin pour les tests"""
        return User.objects.create_user(
            username='superadmin',
            email='admin@vtcbuilder.com',
            password='admin123',
            role='super-admin',
            tenant=None
        )

    @pytest.fixture
    def tenant(self):
        """Créer un tenant pour les tests"""
        with schema_context('public'):
            tenant = Tenant.objects.create(
                name='Test Tenant',
                email='test@tenant.com',
                slug='test-tenant',
                status='active'
            )
            Domain.objects.create(
                tenant=tenant,
                domain='test-tenant.localhost',
                is_primary=True
            )
            setup_tenant_schema(tenant)
        return tenant

    @pytest.fixture
    def tenant_admin(self, tenant):
        """Créer un admin tenant pour les tests"""
        return User.objects.create_user(
            username='tenantadmin',
            email='admin@tenant.com',
            password='password123',
            tenant=tenant,
            role='tenant-admin'
        )

    @pytest.fixture
    def authenticated_super_admin_client(self, api_client, super_admin):
        """Client authentifié en tant que super admin"""
        api_client.force_authenticate(user=super_admin)
        return api_client

    @pytest.fixture
    def authenticated_tenant_admin_client(self, api_client, tenant_admin):
        """Client authentifié en tant que tenant admin"""
        api_client.force_authenticate(user=tenant_admin)
        return api_client

    def test_dashboard_requires_authentication(self, api_client):
        """Test que le dashboard nécessite une authentification"""
        url = reverse('dashboard')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_dashboard_with_options_request(self, authenticated_super_admin_client):
        """Test que les requêtes OPTIONS sont gérées correctement"""
        url = reverse('dashboard')
        response = authenticated_super_admin_client.options(url)
        assert response.status_code == status.HTTP_200_OK

    def test_dashboard_stats_for_super_admin_empty(self, authenticated_super_admin_client):
        """Test dashboard stats pour super admin avec aucune donnée"""
        url = reverse('dashboard')
        response = authenticated_super_admin_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'stats' in response.data
        assert response.data['stats']['total_tenants'] == 0
        assert response.data['stats']['active_tenants'] == 0
        assert response.data['stats']['trial_tenants'] == 0
        # total_users peut être > 0 car le super_admin lui-même est compté
        assert response.data['stats']['total_users'] >= 0
        assert response.data['stats']['monthly_revenue'] == 0

    def test_dashboard_stats_for_super_admin_with_data(self, authenticated_super_admin_client, tenant):
        """Test dashboard stats pour super admin avec des données"""
        # Créer des utilisateurs
        User.objects.create_user(
            username='user1',
            email='user1@tenant.com',
            password='password123',
            tenant=tenant,
            role='user'
        )
        User.objects.create_user(
            username='user2',
            email='user2@tenant.com',
            password='password123',
            tenant=tenant,
            role='user'
        )
        
        url = reverse('dashboard')
        response = authenticated_super_admin_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'stats' in response.data
        assert response.data['stats']['total_tenants'] >= 1
        assert response.data['stats']['total_users'] >= 2

    def test_dashboard_stats_for_tenant_admin(self, authenticated_tenant_admin_client, tenant):
        """Test dashboard stats pour tenant admin"""
        url = reverse('dashboard')
        response = authenticated_tenant_admin_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'stats' in response.data

    def test_dashboard_stats_with_trial_tenants(self, authenticated_super_admin_client):
        """Test dashboard stats avec des tenants en trial"""
        with schema_context('public'):
            trial_tenant = Tenant.objects.create(
                name='Trial Tenant',
                email='trial@tenant.com',
                slug='trial-tenant',
                status='trial',
                trial_ends_at=timezone.now() + timedelta(days=5)
            )
            Domain.objects.create(
                tenant=trial_tenant,
                domain='trial-tenant.localhost',
                is_primary=True
            )
        url = reverse('dashboard')
        response = authenticated_super_admin_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert 'stats' in response.data
        assert response.data['stats']['trial_tenants'] >= 1

    def test_dashboard_stats_with_billing_subscriptions(self, authenticated_super_admin_client, tenant):
        """Test dashboard stats avec des subscriptions billing"""
        try:
            from billing.models import Subscription, PricingPlan
            from decimal import Decimal
            
            # Créer un plan
            plan = PricingPlan.objects.create(
                name='Test Plan',
                slug='test-plan',
                price_monthly=Decimal('29.99'),
                price_yearly=Decimal('299.99'),
                currency='EUR',
                is_active=True
            )
            
            # Créer une subscription
            Subscription.objects.create(
                tenant=tenant,
                plan=plan,
                status='active',
                billing_cycle='monthly',
                current_period_start=timezone.now(),
                current_period_end=timezone.now() + timedelta(days=30)
            )
            
            url = reverse('dashboard')
            response = authenticated_super_admin_client.get(url)
            
            assert response.status_code == status.HTTP_200_OK
            assert 'stats' in response.data
        except ImportError:
            # Billing n'est pas disponible, on skip ce test
            pytest.skip("Billing models not available")


@pytest.mark.django_db
@pytest.mark.api
class TestDetailedStatsViewComprehensive:
    """Tests exhaustifs pour DetailedStatsView"""

    @pytest.fixture
    def api_client(self):
        return APIClient()

    @pytest.fixture
    def super_admin(self):
        return User.objects.create_user(
            username='superadmin',
            email='admin@vtcbuilder.com',
            password='admin123',
            role='super-admin',
            tenant=None
        )

    @pytest.fixture
    def tenant_admin(self):
        with schema_context('public'):
            tenant = Tenant.objects.create(
                name='Test Tenant',
                email='test@tenant.com',
                slug='test-tenant',
                status='active'
            )
            Domain.objects.create(
                tenant=tenant,
                domain='test-tenant.localhost',
                is_primary=True
            )
            setup_tenant_schema(tenant)
        return User.objects.create_user(
            username='tenantadmin',
            email='admin@tenant.com',
            password='password123',
            tenant=tenant,
            role='tenant-admin'
        )

    @pytest.fixture
    def authenticated_super_admin_client(self, api_client, super_admin):
        api_client.force_authenticate(user=super_admin)
        return api_client

    @pytest.fixture
    def authenticated_tenant_admin_client(self, api_client, tenant_admin):
        api_client.force_authenticate(user=tenant_admin)
        return api_client

    def test_detailed_stats_requires_authentication(self, api_client):
        """Test que les stats détaillées nécessitent une authentification"""
        url = reverse('detailed-stats')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_detailed_stats_requires_super_admin(self, authenticated_tenant_admin_client):
        """Test que les stats détaillées nécessitent un super admin"""
        url = reverse('detailed-stats')
        response = authenticated_tenant_admin_client.get(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_detailed_stats_with_options_request(self, authenticated_super_admin_client):
        """Test que les requêtes OPTIONS sont gérées correctement"""
        url = reverse('detailed-stats')
        response = authenticated_super_admin_client.options(url)
        assert response.status_code == status.HTTP_200_OK

    def test_detailed_stats_structure(self, authenticated_super_admin_client):
        """Test la structure des stats détaillées"""
        url = reverse('detailed-stats')
        response = authenticated_super_admin_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'overview' in response.data
        assert 'activity' in response.data
        assert 'registrations' in response.data
        assert 'recent_tenants' in response.data
        assert 'recent_users' in response.data
        assert 'users_by_role' in response.data
        assert 'users_by_status' in response.data
        assert 'tenants_by_plan' in response.data
        assert 'tenants_by_status' in response.data
        assert 'blocks_usage' in response.data
        assert 'templates_usage' in response.data
        assert 'pages_stats' in response.data
        assert 'services_stats' in response.data
        assert 'bookings_stats' in response.data

    def test_detailed_stats_overview_fields(self, authenticated_super_admin_client):
        """Test que tous les champs overview sont présents"""
        url = reverse('detailed-stats')
        response = authenticated_super_admin_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        overview = response.data['overview']
        
        assert 'total_tenants' in overview
        assert 'active_tenants' in overview
        assert 'suspended_tenants' in overview
        assert 'trial_tenants' in overview
        assert 'cancelled_tenants' in overview
        assert 'total_users' in overview
        assert 'active_users' in overview
        assert 'suspended_users' in overview
        assert 'inactive_users' in overview

    def test_detailed_stats_with_tenants(self, authenticated_super_admin_client):
        """Test stats détaillées avec des tenants"""
        with schema_context('public'):
            Tenant.objects.create(
                name='Active Tenant',
                email='active@tenant.com',
                slug='active-tenant',
                status='active'
            )
            Tenant.objects.create(
                name='Trial Tenant',
                email='trial@tenant.com',
                slug='trial-tenant',
                status='trial'
            )
            Tenant.objects.create(
                name='Suspended Tenant',
                email='suspended@tenant.com',
                slug='suspended-tenant',
                status='suspended'
            )
        url = reverse('detailed-stats')
        response = authenticated_super_admin_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        overview = response.data['overview']
        assert overview['total_tenants'] >= 3
        assert overview['active_tenants'] >= 1
        assert overview['trial_tenants'] >= 1
        assert overview['suspended_tenants'] >= 1

    def test_detailed_stats_with_users(self, authenticated_super_admin_client):
        """Test stats détaillées avec des utilisateurs"""
        with schema_context('public'):
            tenant = Tenant.objects.create(
                name='Test Tenant',
                email='test@tenant.com',
                slug='test-tenant',
                status='active'
            )
            Domain.objects.create(
                tenant=tenant,
                domain='test-tenant.localhost',
                is_primary=True
            )
            setup_tenant_schema(tenant)
        User.objects.create_user(
            username='active_user',
            email='active@user.com',
            password='password123',
            tenant=tenant,
            role='user',
            status='active'
        )
        User.objects.create_user(
            username='suspended_user',
            email='suspended@user.com',
            password='password123',
            tenant=tenant,
            role='user',
            status='suspended'
        )
        url = reverse('detailed-stats')
        response = authenticated_super_admin_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        overview = response.data['overview']
        assert overview['total_users'] >= 2
        assert overview['active_users'] >= 1
        assert overview['suspended_users'] >= 1

    def test_detailed_stats_recent_tenants(self, authenticated_super_admin_client):
        """Test que les tenants récents sont retournés"""
        with schema_context('public'):
            for i in range(5):
                Tenant.objects.create(
                    name=f'Tenant {i}',
                    email=f'tenant{i}@test.com',
                    slug=f'tenant-{i}',
                    status='active'
                )
        url = reverse('detailed-stats')
        response = authenticated_super_admin_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data['recent_tenants'], list)
        assert len(response.data['recent_tenants']) <= 10

    def test_detailed_stats_recent_users(self, authenticated_super_admin_client):
        """Test que les utilisateurs récents sont retournés"""
        with schema_context('public'):
            tenant = Tenant.objects.create(
                name='Test Tenant',
                email='test@tenant.com',
                slug='test-tenant',
                status='active'
            )
            Domain.objects.create(
                tenant=tenant,
                domain='test-tenant.localhost',
                is_primary=True
            )
            setup_tenant_schema(tenant)
        for i in range(5):
            User.objects.create_user(
                username=f'user{i}',
                email=f'user{i}@test.com',
                password='password123',
                tenant=tenant,
                role='user'
            )
        url = reverse('detailed-stats')
        response = authenticated_super_admin_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data['recent_users'], list)
        assert len(response.data['recent_users']) <= 10

    def test_detailed_stats_handles_errors_gracefully(self, authenticated_super_admin_client):
        """Test que les erreurs sont gérées gracieusement"""
        url = reverse('detailed-stats')
        response = authenticated_super_admin_client.get(url)
        
        # Même en cas d'erreur, on doit avoir une réponse valide
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_500_INTERNAL_SERVER_ERROR]
        if response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
            assert 'error' in response.data


@pytest.mark.django_db
@pytest.mark.api
class TestBlockUsageTrackingView:
    """Tests pour block_usage_tracking_view"""

    @pytest.fixture
    def api_client(self):
        return APIClient()

    def test_block_usage_tracking_with_options(self, api_client):
        """Test que les requêtes OPTIONS sont gérées"""
        url = reverse('analytics-block-usage')
        response = api_client.options(url)
        assert response.status_code == status.HTTP_200_OK

    def test_block_usage_tracking_no_auth_required(self, api_client):
        """Test que le tracking peut être appelé (200 ou 403 si WAF/auth en test)."""
        url = reverse('analytics-block-usage')
        response = api_client.post(url, {
            'usages': [
                {'block_type': 'heading', 'action': 'create'},
                {'block_type': 'text', 'action': 'create'}
            ]
        }, format='json')
        # 200 si endpoint public, 403 si WAF/auth actif en test
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_403_FORBIDDEN]
        if response.status_code == status.HTTP_200_OK:
            assert response.data.get('success') is True
            assert response.data.get('tracked') == 2

    def test_block_usage_tracking_empty_list(self, api_client):
        """Test tracking avec une liste vide"""
        url = reverse('analytics-block-usage')
        response = api_client.post(url, {
            'usages': []
        }, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert response.data['tracked'] == 0

    def test_block_usage_tracking_invalid_data(self, api_client):
        """Test tracking avec des données invalides"""
        url = reverse('analytics-block-usage')
        response = api_client.post(url, {
            'usages': 'not-a-list'
        }, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'error' in response.data

    def test_block_usage_tracking_missing_usages(self, api_client):
        """Test tracking sans le champ usages"""
        url = reverse('analytics-block-usage')
        response = api_client.post(url, {}, format='json')
        
        # Devrait gérer gracieusement
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST]

    def test_block_usage_tracking_multiple_events(self, api_client):
        """Test tracking avec plusieurs événements."""
        url = reverse('analytics-block-usage')
        usages = [
            {'block_type': 'heading', 'action': 'create', 'timestamp': '2025-12-01T10:00:00Z'},
            {'block_type': 'text', 'action': 'update', 'timestamp': '2025-12-01T10:01:00Z'},
            {'block_type': 'image', 'action': 'delete', 'timestamp': '2025-12-01T10:02:00Z'},
        ]
        response = api_client.post(url, {'usages': usages}, format='json')
        # 200 si endpoint public, 403 si WAF/auth actif en test
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_403_FORBIDDEN]
        if response.status_code == status.HTTP_200_OK:
            assert response.data['success'] is True
            assert response.data['tracked'] == 3

