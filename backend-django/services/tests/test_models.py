"""
Unit tests for Service model
"""
import pytest
from django.utils.text import slugify
from django.core.management import call_command
from django_tenants.utils import tenant_context, schema_context
from services.models import Service
from tenants.models import Tenant, Domain


@pytest.mark.django_db
@pytest.mark.model
class TestService:
    """Tests for Service model"""

    @pytest.fixture
    def tenant(self):
        """Create a test tenant with schema"""
        tenant = Tenant.objects.create(
            name='Test Tenant',
            email='test@tenant.com',
            slug='test-tenant'
        )
        # Create domain for tenant
        Domain.objects.create(tenant=tenant, domain='test-tenant.localhost', is_primary=True)
        
        # Ensure schema is created and migrated
        from django.core.management import call_command
        try:
            tenant.save()
            call_command('migrate_schemas', schema_name=tenant.schema_name, verbosity=0, interactive=False)
        except Exception:
            pass
        
        return tenant

    def test_create_service(self, tenant):
        """Test creating a service"""
        with tenant_context(tenant):
            service = Service.objects.create(
                tenant=tenant,
                name='Berline',
                slug='berline',
                description='Luxury sedan service',
                base_price=10.00,
                price_per_km=1.50,
                price_per_minute=0.30,
                min_price=15.00,
                max_passengers=4,
                max_luggage=2,
                is_active=True,
                order=1
            )
            assert service.name == 'Berline'
            assert service.tenant == tenant
            assert service.max_passengers == 4
            assert service.is_active is True

    def test_service_auto_slug_generation(self, tenant):
        """Test automatic slug generation from name"""
        with tenant_context(tenant):
            service = Service.objects.create(
                tenant=tenant,
                name='Luxury Van Service'
            )
            assert service.slug == slugify('Luxury Van Service')

    def test_service_str(self, tenant):
        """Test string representation"""
        with tenant_context(tenant):
            service = Service.objects.create(
                tenant=tenant,
                name='Economy Car'
            )
            assert str(service) == 'Economy Car'

    def test_service_ordering(self, tenant):
        """Test service ordering"""
        with tenant_context(tenant):
            service1 = Service.objects.create(
                tenant=tenant,
                name='Service 1',
                order=2
            )
            service2 = Service.objects.create(
                tenant=tenant,
                name='Service 2',
                order=1
            )
            services = list(Service.objects.all())
            assert services[0] == service2  # Lower order first

