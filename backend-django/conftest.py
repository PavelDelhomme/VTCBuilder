"""
Pytest configuration and fixtures for django-tenants
"""
import pytest
from django.core.management import call_command
from django.db import connection
from django_tenants.utils import schema_context, tenant_context
from tenants.models import Tenant, Domain


def setup_tenant_schema(tenant):
    """Helper function to create and migrate tenant schema"""
    try:
        tenant.save()  # Trigger schema creation if auto_create_schema is True
        call_command('migrate_schemas', schema_name=tenant.schema_name, verbosity=0, interactive=False)
    except Exception:
        pass


@pytest.fixture(scope='function')
def tenant_with_schema():
    """
    Create a tenant with migrated schema for testing tenant-specific models.
    Tenant creation must happen in public schema.
    """
    from django.utils.text import slugify
    from django_tenants.utils import schema_context

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
    
    yield tenant
    
    # Cleanup: tenant schema will be dropped when tenant is deleted
    # (auto_drop_schema = True)

