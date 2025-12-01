"""
Unit tests for Page model
"""
import pytest
from django.utils.text import slugify
from django.core.management import call_command
from django_tenants.utils import tenant_context, schema_context
from pages.models import Page
from tenants.models import Tenant, Domain
from conftest import tenant_with_schema


@pytest.mark.django_db
@pytest.mark.model
class TestPage:
    """Tests for Page model"""

    @pytest.fixture
    def tenant(self):
        """Create a test tenant with schema"""
        # Use the tenant_with_schema fixture which handles schema creation
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

    def test_create_page(self, tenant):
        """Test creating a page"""
        with tenant_context(tenant):
            page = Page.objects.create(
                tenant=tenant,
                title='Test Page',
                slug='test-page',
                content='<p>Test content</p>',
                status='draft',
                order=0,
                is_homepage=False
            )
            assert page.title == 'Test Page'
            assert page.slug == 'test-page'
            assert page.tenant == tenant
            assert page.status == 'draft'

    def test_page_auto_slug_generation(self, tenant):
        """Test automatic slug generation from title"""
        with tenant_context(tenant):
            page = Page.objects.create(
                tenant=tenant,
                title='My Test Page',
                content='Content'
            )
            assert page.slug == slugify('My Test Page')

    def test_page_str(self, tenant):
        """Test string representation"""
        with tenant_context(tenant):
            page = Page.objects.create(
                tenant=tenant,
                title='About Us',
                slug='about-us'
            )
            assert str(page) == 'About Us'

    def test_page_ordering(self, tenant):
        """Test page ordering"""
        with tenant_context(tenant):
            page1 = Page.objects.create(
                tenant=tenant,
                title='Page 1',
                order=2
            )
            page2 = Page.objects.create(
                tenant=tenant,
                title='Page 2',
                order=1
            )
            pages = list(Page.objects.all())
            assert pages[0] == page2  # Lower order first

