"""
Tests complets pour les vues Project
"""
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from django_tenants.utils import schema_context
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
        with schema_context('public'):
            tenant2 = Tenant.objects.create(
                name='Tenant 2',
                email='tenant2@test.com',
                slug='tenant-2',
                status='active'
            )
            Domain.objects.create(tenant=tenant2, domain='tenant-2.localhost', is_primary=True)
            setup_tenant_schema(tenant2)
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
        with schema_context('public'):
            tenant2 = Tenant.objects.create(
                name='Tenant 2',
                email='tenant2@test.com',
                slug='tenant-2',
                status='active'
            )
            Domain.objects.create(tenant=tenant2, domain='tenant-2.localhost', is_primary=True)
            setup_tenant_schema(tenant2)
        Project.objects.create(
            name='Other Project',
            tenant=tenant2,
            status='active'
        )
        url = reverse('project-list')
        response = authenticated_tenant_admin_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        results = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        for project_data in (results if isinstance(results, list) else [results]):
            tid = project_data.get('tenant')
            # tenant peut être un objet nested (dict avec id) ou un id brut
            tid_val = tid.get('id', tid) if isinstance(tid, dict) else tid
            assert tid_val == tenant.id or str(tid_val) == str(tenant.id), "Tenant admin ne doit voir que les projets de son tenant"

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
        """Test suppression d'un projet (soft delete: 200 ou 204)"""
        url = reverse('project-detail', kwargs={'pk': project.id})
        response = authenticated_super_admin_client.delete(url)
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT]
        project.refresh_from_db()
        # Soft delete: projet marqué supprimé (is_deleted / deleted_at) ou vraiment supprimé
        if response.status_code == status.HTTP_204_NO_CONTENT:
            assert not Project.objects.filter(id=project.id).exists()
        else:
            assert getattr(project, 'is_deleted', False) or getattr(project, 'deleted_at', None) is not None

    def test_add_page_to_project(self, authenticated_super_admin_client, project, tenant):
        """Test ajout d'une page à un projet (API attend page_slug, pas page_id)"""
        from django_tenants.utils import tenant_context
        with tenant_context(tenant):
            page = Page.objects.create(
                tenant=tenant,
                title='Test Page',
                slug='test-page',
                status='draft',
                blocks=[]
            )
        url = reverse('project-add-page', kwargs={'pk': project.id})
        data = {'page_slug': page.slug, 'page_type': 'public'}
        response = authenticated_super_admin_client.post(url, data, format='json')
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_201_CREATED]
        assert ProjectPage.objects.filter(project=project, page_slug=page.slug, page_type='public').exists()

    def test_remove_page_from_project(self, authenticated_super_admin_client, project, tenant):
        """Test retrait d'une page d'un projet (ProjectPage utilise page_slug; remove_page attend l'id de ProjectPage)"""
        from django_tenants.utils import tenant_context
        with tenant_context(tenant):
            page = Page.objects.create(
                tenant=tenant,
                title='Test Page',
                slug='test-page',
                status='draft',
                blocks=[]
            )
        project_page = ProjectPage.objects.create(
            project=project,
            page_slug=page.slug,
            page_type='public'
        )
        url = reverse('project-remove-page', kwargs={'pk': project.id, 'page_id': project_page.id})
        response = authenticated_super_admin_client.post(url, data={}, format='json')
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT]
        assert not ProjectPage.objects.filter(id=project_page.id).exists()

