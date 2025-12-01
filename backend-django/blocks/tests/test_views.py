"""
Tests complets pour les vues Block
"""
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from tenants.models import Tenant, User, Domain
from blocks.models import BlockType, BlockTemplate, CallToAction
from conftest import setup_tenant_schema


@pytest.mark.django_db
@pytest.mark.api
class TestBlockTypeViewSet:
    """Tests exhaustifs pour BlockTypeViewSet"""

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
    def block_type(self):
        """Créer un block type pour les tests"""
        return BlockType.objects.create(
            name='test-block',
            label='Test Block',
            icon='📦',
            category='content',
            description='Test block description',
            order=1,
            is_active=True
        )

    def test_list_block_types_requires_auth(self, api_client):
        """Test que la liste nécessite une authentification"""
        url = reverse('block-type-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_block_types_for_super_admin(self, authenticated_super_admin_client):
        """Test liste des block types pour super admin"""
        # Créer quelques block types
        BlockType.objects.create(
            name='block1',
            label='Block 1',
            icon='📦',
            category='content',
            is_active=True
        )
        BlockType.objects.create(
            name='block2',
            label='Block 2',
            icon='📄',
            category='layout',
            is_active=False
        )
        
        url = reverse('block-type-list')
        response = authenticated_super_admin_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)
        assert len(response.data) >= 2

    def test_list_block_types_for_tenant_admin(self, authenticated_tenant_admin_client, block_type):
        """Test liste des block types pour tenant admin (seulement actifs)"""
        # Créer un block inactif
        BlockType.objects.create(
            name='inactive-block',
            label='Inactive Block',
            icon='📦',
            category='content',
            is_active=False
        )
        
        url = reverse('block-type-list')
        response = authenticated_tenant_admin_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)
        # Vérifier que seuls les blocks actifs sont retournés
        for block in response.data:
            assert block['is_active'] is True

    def test_create_block_type(self, authenticated_super_admin_client):
        """Test création d'un block type"""
        url = reverse('block-type-list')
        data = {
            'name': 'new-block',
            'label': 'New Block',
            'icon': '⭐',
            'category': 'content',
            'description': 'A new block',
            'order': 10,
            'is_active': True,
            'schema': {},
            'default_styles': {}
        }
        response = authenticated_super_admin_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'new-block'
        assert response.data['label'] == 'New Block'

    def test_retrieve_block_type(self, authenticated_super_admin_client, block_type):
        """Test récupération d'un block type"""
        url = reverse('block-type-detail', kwargs={'pk': block_type.id})
        response = authenticated_super_admin_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == block_type.id
        assert response.data['name'] == 'test-block'

    def test_update_block_type(self, authenticated_super_admin_client, block_type):
        """Test mise à jour d'un block type"""
        url = reverse('block-type-detail', kwargs={'pk': block_type.id})
        data = {
            'label': 'Updated Block',
            'description': 'Updated description'
        }
        response = authenticated_super_admin_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['label'] == 'Updated Block'

    def test_delete_block_type(self, authenticated_super_admin_client, block_type):
        """Test suppression d'un block type"""
        url = reverse('block-type-detail', kwargs={'pk': block_type.id})
        response = authenticated_super_admin_client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not BlockType.objects.filter(id=block_type.id).exists()

    def test_block_types_auto_created_if_empty(self, authenticated_super_admin_client):
        """Test que les block types par défaut sont créés si la liste est vide"""
        # Supprimer tous les block types
        BlockType.objects.all().delete()
        
        url = reverse('block-type-list')
        response = authenticated_super_admin_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        # Les block types par défaut devraient être créés
        assert len(response.data) > 0


@pytest.mark.django_db
@pytest.mark.api
class TestCallToActionViewSet:
    """Tests pour CallToActionViewSet"""

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

    @pytest.fixture
    def cta(self):
        return CallToAction.objects.create(
            name='test-cta',
            type='button',
            default_text='Click me',
            default_url='/test',
            is_active=True,
            is_global=False
        )

    def test_list_ctas(self, authenticated_client, cta):
        """Test liste des CTAs"""
        url = reverse('call-to-action-list')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)
        assert len(response.data) >= 1

    def test_create_cta(self, authenticated_client):
        """Test création d'un CTA"""
        url = reverse('call-to-action-list')
        data = {
            'name': 'new-cta',
            'type': 'link',
            'default_text': 'Learn more',
            'default_url': '/learn',
            'is_active': True,
            'is_global': False,
            'styles': {},
            'config': {}
        }
        response = authenticated_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'new-cta'

    def test_update_cta(self, authenticated_client, cta):
        """Test mise à jour d'un CTA"""
        url = reverse('call-to-action-detail', kwargs={'pk': cta.id})
        data = {'default_text': 'Updated text'}
        response = authenticated_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['default_text'] == 'Updated text'

    def test_delete_cta(self, authenticated_client, cta):
        """Test suppression d'un CTA"""
        url = reverse('call-to-action-detail', kwargs={'pk': cta.id})
        response = authenticated_client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not CallToAction.objects.filter(id=cta.id).exists()

