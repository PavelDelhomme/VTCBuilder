"""
Unit tests for Services API views
"""
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from django_tenants.utils import schema_context
from services.models import Service
from tenants.models import Tenant, User, Domain
from conftest import setup_tenant_schema


@pytest.mark.django_db
@pytest.mark.api
class TestServiceViewSet:
    """Tests for Service ViewSet"""

    @pytest.fixture
    def api_client(self):
        return APIClient()

    @pytest.fixture
    def tenant(self):
        with schema_context('public'):
            tenant = Tenant.objects.create(
                name='Test Tenant',
                email='test@tenant.com',
                slug='test-tenant'
            )
            Domain.objects.create(tenant=tenant, domain='test-tenant.localhost', is_primary=True)
            setup_tenant_schema(tenant)
        return tenant

    @pytest.fixture
    def tenant_admin(self, tenant):
        return User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='password123',
            tenant=tenant,
            role='tenant-admin'
        )

    @pytest.fixture
    def authenticated_client(self, api_client, tenant_admin):
        api_client.force_authenticate(user=tenant_admin)
        return api_client

    def test_list_services_requires_authentication(self, api_client):
        """Test that listing services requires authentication"""
        url = reverse('service-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_services(self, authenticated_client, tenant):
        """Test listing services"""
        from django_tenants.utils import tenant_context
        
        with tenant_context(tenant):
            Service.objects.create(
                tenant=tenant,
                name='Berline',
                slug='berline',
                max_passengers=4
            )

        url = reverse('service-list')
        response = authenticated_client.get(url)
        
        # Should return 200 even if empty (error handling returns empty list)
        assert response.status_code == status.HTTP_200_OK

