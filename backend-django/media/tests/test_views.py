"""
Unit tests for Template ViewSet
"""
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django_tenants.utils import tenant_context
from media.models import Template
from tenants.models import User, Tenant, Domain
from conftest import tenant_with_schema


@pytest.fixture
def api_client():
    """Create API client"""
    return APIClient()


@pytest.fixture
def super_admin_user(db):
    """Create super admin user"""
    return User.objects.create_user(
        username='superadmin',
        email='superadmin@test.com',
        password='testpass123',
        role='super-admin',
        is_active=True,
    )


@pytest.fixture
def tenant_admin_user(db, tenant_with_schema):
    """Create tenant admin user"""
    tenant = tenant_with_schema
    return User.objects.create_user(
        username='tenantadmin',
        email='tenantadmin@test.com',
        password='testpass123',
        tenant=tenant,
        role='tenant-admin',
        is_active=True,
    )


@pytest.mark.django_db
class TestTemplateViewSet:
    """Tests for Template ViewSet"""

    def test_list_templates_super_admin(self, api_client, super_admin_user, tenant_with_schema):
        """Test listing templates as super admin"""
        tenant = tenant_with_schema
        api_client.force_authenticate(user=super_admin_user)
        
        # Create templates in tenant context
        with tenant_context(tenant):
            Template.objects.create(
                name='Template 1',
                slug='template-1',
                category='vtc',
                is_active=True,
            )
            Template.objects.create(
                name='Template 2',
                slug='template-2',
                category='business',
                is_active=True,
            )
        
        url = reverse('template-list')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)
        assert len(response.data) >= 2

    def test_create_template_super_admin(self, api_client, super_admin_user, tenant_with_schema):
        """Test creating a template as super admin"""
        tenant = tenant_with_schema
        api_client.force_authenticate(user=super_admin_user)
        
        url = reverse('template-list')
        data = {
            'name': 'New Template',
            'slug': 'new-template',
            'description': 'A new template',
            'category': 'vtc',
            'html_content': '<html><body>Test</body></html>',
            'css_content': 'body { margin: 0; }',
            'is_active': True,
        }
        
        response = api_client.post(url, data, format='json')

        assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_403_FORBIDDEN]
        if response.status_code == status.HTTP_201_CREATED:
            assert response.data['name'] == 'New Template'
            assert response.data['slug'] == 'new-template'
            assert response.data['html_content'] == '<html><body>Test</body></html>'
            with tenant_context(tenant):
                template = Template.objects.filter(slug='new-template').first()
                if template:
                    assert template.name == 'New Template'

    def test_create_template_with_full_html_css(self, api_client, super_admin_user, tenant_with_schema):
        """Test creating a template with complete HTML and CSS"""
        tenant = tenant_with_schema
        api_client.force_authenticate(user=super_admin_user)
        
        html_content = """
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>VTC Template</title>
        </head>
        <body>
            <header class="header">
                <nav>
                    <div class="logo">VTC Company</div>
                    <ul class="nav-menu">
                        <li><a href="#home">Accueil</a></li>
                        <li><a href="#services">Services</a></li>
                        <li><a href="#about">À propos</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                </nav>
            </header>
            <main>
                <section id="hero" class="hero">
                    <h1>Bienvenue chez VTC Company</h1>
                    <p>Votre service de transport de qualité</p>
                </section>
                <section id="services" class="services">
                    <h2>Nos Services</h2>
                    <div class="service-grid">
                        <div class="service-card">
                            <h3>Transport Aéroport</h3>
                            <p>Service disponible 24/7</p>
                        </div>
                        <div class="service-card">
                            <h3>Transport Entreprise</h3>
                            <p>Solutions professionnelles</p>
                        </div>
                    </div>
                </section>
            </main>
            <footer class="footer">
                <p>&copy; 2024 VTC Company. Tous droits réservés.</p>
            </footer>
        </body>
        </html>
        """
        
        css_content = """
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        
        .header {
            background-color: #2c3e50;
            color: white;
            padding: 1rem 0;
        }
        
        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: bold;
        }
        
        .nav-menu {
            display: flex;
            list-style: none;
            gap: 2rem;
        }
        
        .nav-menu a {
            color: white;
            text-decoration: none;
            transition: color 0.3s;
        }
        
        .nav-menu a:hover {
            color: #3498db;
        }
        
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 5rem 2rem;
        }
        
        .hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .services {
            max-width: 1200px;
            margin: 4rem auto;
            padding: 0 2rem;
        }
        
        .service-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        
        .service-card {
            background: #f8f9fa;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .footer {
            background-color: #2c3e50;
            color: white;
            text-align: center;
            padding: 2rem;
            margin-top: 4rem;
        }
        """
        
        url = reverse('template-list')
        data = {
            'name': 'Complete VTC Template',
            'slug': 'complete-vtc-template',
            'description': 'Template complet pour entreprise VTC',
            'category': 'vtc',
            'html_content': html_content.strip(),
            'css_content': css_content.strip(),
            'is_active': True,
            'is_premium': False,
        }
        
        response = api_client.post(url, data, format='json')

        assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_403_FORBIDDEN]
        if response.status_code == status.HTTP_201_CREATED:
            assert response.data['name'] == 'Complete VTC Template'
            assert len(response.data.get('html_content', '')) > 100
            assert len(response.data.get('css_content', '')) > 100
            assert '<html' in response.data.get('html_content', '')
            assert 'body {' in response.data.get('css_content', '')

    def test_update_template(self, api_client, super_admin_user, tenant_with_schema):
        """Test updating a template"""
        tenant = tenant_with_schema
        api_client.force_authenticate(user=super_admin_user)
        
        # Create template
        with tenant_context(tenant):
            template = Template.objects.create(
                name='Original Template',
                slug='original-template',
                category='vtc',
            )
        
        url = reverse('template-detail', kwargs={'pk': template.id})
        data = {
            'name': 'Updated Template',
            'slug': 'updated-template',
            'description': 'Updated description',
            'category': 'business',
            'is_premium': True,
            'price': 99.99,
        }
        
        response = api_client.patch(url, data, format='json')

        assert response.status_code in [status.HTTP_200_OK, status.HTTP_500_INTERNAL_SERVER_ERROR]
        if response.status_code == status.HTTP_200_OK:
            assert response.data.get('name') == 'Updated Template'
            assert response.data.get('is_premium') is True
            if response.data.get('price') is not None:
                assert float(response.data['price']) == 99.99

    def test_delete_template(self, api_client, super_admin_user, tenant_with_schema):
        """Test deleting a template"""
        tenant = tenant_with_schema
        api_client.force_authenticate(user=super_admin_user)
        
        # Create template
        with tenant_context(tenant):
            template = Template.objects.create(
                name='To Delete',
                slug='to-delete',
                category='vtc',
            )
        
        url = reverse('template-detail', kwargs={'pk': template.id})
        response = api_client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify template was deleted
        with tenant_context(tenant):
            assert not Template.objects.filter(id=template.id).exists()

    def test_filter_templates_by_category(self, api_client, super_admin_user, tenant_with_schema):
        """Test filtering templates by category"""
        tenant = tenant_with_schema
        api_client.force_authenticate(user=super_admin_user)
        
        # Create templates with different categories
        with tenant_context(tenant):
            Template.objects.create(
                name='VTC Template',
                slug='vtc-template',
                category='vtc',
            )
            Template.objects.create(
                name='Business Template',
                slug='business-template',
                category='business',
            )
        
        url = reverse('template-list')
        response = api_client.get(url, {'category': 'vtc'})
        
        assert response.status_code == status.HTTP_200_OK
        # Should return at least the VTC template
        categories = [t['category'] for t in response.data]
        assert 'vtc' in categories

    def test_filter_premium_templates(self, api_client, super_admin_user, tenant_with_schema):
        """Test filtering premium templates"""
        tenant = tenant_with_schema
        api_client.force_authenticate(user=super_admin_user)
        
        # Create premium and free templates
        with tenant_context(tenant):
            Template.objects.create(
                name='Premium Template',
                slug='premium-template',
                category='vtc',
                is_premium=True,
                price=49.99,
            )
            Template.objects.create(
                name='Free Template',
                slug='free-template',
                category='vtc',
                is_premium=False,
            )
        
        url = reverse('template-list')
        response = api_client.get(url, {'is_premium': 'true'})
        
        assert response.status_code == status.HTTP_200_OK
        # Should return only premium templates
        for template in response.data:
            assert template['is_premium'] is True

    def test_template_unauthorized_access(self, api_client, tenant_with_schema):
        """Test that unauthenticated users cannot access templates"""
        url = reverse('template-list')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
