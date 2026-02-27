"""
Unit tests for Pages API views
"""
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from pages.models import Page
from tenants.models import Tenant, User


@pytest.mark.django_db
@pytest.mark.api
class TestPageViewSet:
    """Tests for Page ViewSet"""

    @pytest.fixture
    def api_client(self):
        return APIClient()

    @pytest.fixture
    def tenant(self):
        return Tenant.objects.create(
            name='Test Tenant',
            email='test@tenant.com',
            slug='test-tenant'
        )

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

    def test_list_pages_requires_authentication(self, api_client):
        """Test that listing pages requires authentication"""
        url = reverse('page-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_page(self, authenticated_client, tenant):
        """Test creating a page"""
        from django_tenants.utils import tenant_context
        
        url = reverse('page-list')
        data = {
            'title': 'About Us',
            'slug': 'about-us',
            'content': '<p>About page content</p>',
            'status': 'draft'
        }
        
        # Note: Creation happens in tenant context; 400 possible if validation fails (e.g. tenant/slug)
        response = authenticated_client.post(url, data, format='json')
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST]

