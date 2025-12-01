"""
Tests complets pour les vues Project
"""
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from tenants.models import Tenant, User, Domain
from projects.models import Project, ProjectPage
from pages.models import Page
from conftest import setup_tenant_schema


@pytest.mark.django_db
@pytest.mark.api
class TestProjectViewSet:
    """Tests exhaustifs pour ProjectViewSet"""

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
    def tenant(self):
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

    @pytest.fixture
    def project(self, tenant):
        return Project.objects.create(
            name='Test Project',
            description='Test description',
            tenant=tenant,
            status='active'
        )

    def test_list_projects_requires_auth(self, api_client):
        """Test que la liste nécessite une authentification"""
        url = reverse('project-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_projects_for_super_admin(self, authenticated_super_admin_client, project):
        """Test liste des projets pour super admin"""
        # Créer un autre projet
        tenant2 = Tenant.objects.create(
            name='Tenant 2',
            email='tenant2@test.com',
            slug='tenant-2',
            status='active'
        )
        Project.objects.create(
            name='Project 2',
            tenant=tenant2,
            status='active'
        )
        
        url = reverse('project-list')
        response = authenticated_super_admin_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 2

    def test_list_projects_for_tenant_admin(self, authenticated_tenant_admin_client, tenant, project):
        """Test liste des projets pour tenant admin (seulement ses projets)"""
        # Créer un projet pour un autre tenant
        tenant2 = Tenant.objects.create(
            name='Tenant 2',
            email='tenant2@test.com',
            slug='tenant-2',
            status='active'
        )
        Project.objects.create(
            name='Other Project',
            tenant=tenant2,
            status='active'
        )
        
        url = reverse('project-list')
        response = authenticated_tenant_admin_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        # Ne devrait voir que les projets de son tenant
        for project_data in response.data:
            assert project_data['tenant'] == tenant.id

    def test_create_project(self, authenticated_tenant_admin_client, tenant):
        """Test création d'un projet"""
        url = reverse('project-list')
        data = {
            'name': 'New Project',
            'description': 'New project description',
            'tenant': tenant.id,
            'status': 'active'
        }
        response = authenticated_tenant_admin_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'New Project'
        assert Project.objects.filter(name='New Project').exists()

    def test_retrieve_project(self, authenticated_super_admin_client, project):
        """Test récupération d'un projet"""
        url = reverse('project-detail', kwargs={'pk': project.id})
        response = authenticated_super_admin_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == project.id
        assert response.data['name'] == 'Test Project'
        # Devrait utiliser ProjectDetailSerializer qui inclut les pages
        assert 'pages' in response.data

    def test_update_project(self, authenticated_super_admin_client, project):
        """Test mise à jour d'un projet"""
        url = reverse('project-detail', kwargs={'pk': project.id})
        data = {'name': 'Updated Project', 'description': 'Updated description'}
        response = authenticated_super_admin_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Updated Project'
        project.refresh_from_db()
        assert project.name == 'Updated Project'

    def test_delete_project(self, authenticated_super_admin_client, project):
        """Test suppression d'un projet"""
        url = reverse('project-detail', kwargs={'pk': project.id})
        response = authenticated_super_admin_client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Project.objects.filter(id=project.id).exists()

    def test_add_page_to_project(self, authenticated_super_admin_client, project, tenant):
        """Test ajout d'une page à un projet"""
        # Créer une page dans le contexte du tenant
        from django_tenants.utils import tenant_context
        with tenant_context(tenant):
            page = Page.objects.create(
                title='Test Page',
                slug='test-page',
                status='draft',
                blocks=[]
            )
        
        url = reverse('project-add-page', kwargs={'pk': project.id})
        data = {'page_id': page.id, 'page_type': 'public'}
        response = authenticated_super_admin_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert ProjectPage.objects.filter(project=project, page_id=page.id).exists()

    def test_remove_page_from_project(self, authenticated_super_admin_client, project, tenant):
        """Test retrait d'une page d'un projet"""
        from django_tenants.utils import tenant_context
        with tenant_context(tenant):
            page = Page.objects.create(
                title='Test Page',
                slug='test-page',
                status='draft',
                blocks=[]
            )
        
        # Ajouter la page au projet
        project_page = ProjectPage.objects.create(
            project=project,
            page_id=page.id,
            page_type='public'
        )
        
        url = reverse('project-remove-page', kwargs={'pk': project.id})
        data = {'page_id': page.id}
        response = authenticated_super_admin_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert not ProjectPage.objects.filter(id=project_page.id).exists()

