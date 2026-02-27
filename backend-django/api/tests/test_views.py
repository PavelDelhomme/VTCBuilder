"""
Unit tests for API views
"""
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from django_tenants.utils import schema_context
from tenants.models import Tenant, User, Domain
from conftest import setup_tenant_schema


@pytest.mark.django_db
@pytest.mark.api
class TestDashboardView:
    """Tests for DashboardView"""

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
    def authenticated_client(self, api_client, super_admin):
        api_client.force_authenticate(user=super_admin)
        return api_client

    def test_dashboard_requires_authentication(self, api_client):
        """Test that dashboard requires authentication"""
        url = reverse('dashboard')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_dashboard_stats_for_super_admin(self, authenticated_client):
        """Test dashboard stats for super admin"""
        with schema_context('public'):
            Tenant.objects.create(
                name='Test Tenant',
                email='test@tenant.com',
                slug='test-tenant',
                status='active'
            )
        url = reverse('dashboard')
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert 'stats' in response.data
        assert response.data['stats']['total_tenants'] >= 1

    def test_dashboard_stats_for_tenant_admin(self, api_client):
        """Test dashboard stats for tenant admin"""
        with schema_context('public'):
            tenant = Tenant.objects.create(
                name='Test Tenant',
                email='test@tenant.com',
                slug='test-tenant'
            )
            Domain.objects.create(
                tenant=tenant,
                domain='test-tenant.localhost',
                is_primary=True
            )
            setup_tenant_schema(tenant)
        tenant_admin = User.objects.create_user(
            username='tenantadmin',
            email='admin@tenant.com',
            password='password123',
            tenant=tenant,
            role='tenant-admin'
        )
        api_client.force_authenticate(user=tenant_admin)
        url = reverse('dashboard')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert 'stats' in response.data


@pytest.mark.django_db
@pytest.mark.api
class TestDetailedStatsView:
    """Tests for DetailedStatsView"""

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
    def authenticated_client(self, api_client, super_admin):
        api_client.force_authenticate(user=super_admin)
        return api_client

    def test_detailed_stats_requires_super_admin(self, authenticated_client):
        """Test that detailed stats require super admin"""
        url = reverse('detailed-stats')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'overview' in response.data or 'error' in response.data

