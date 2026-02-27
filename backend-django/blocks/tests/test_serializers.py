"""
Tests complets pour les serializers Block
"""
import pytest
from django_tenants.utils import schema_context
from blocks.models import BlockType, BlockTemplate, CallToAction
from blocks.serializers import (
    BlockTypeSerializer, BlockTemplateSerializer, CallToActionSerializer
)
from tenants.models import Tenant, Domain
from conftest import setup_tenant_schema


@pytest.mark.django_db
@pytest.mark.unit
class TestCallToActionSerializer:
    """Tests pour CallToActionSerializer"""

    def test_serialize_cta(self):
        """Test sérialisation d'un CTA"""
        cta = CallToAction.objects.create(
            name='test-cta',
            label='Test CTA',
            type='button',
            default_text='Click me',
            default_url='/test',
            is_active=True,
            is_global=False
        )
        
        serializer = CallToActionSerializer(cta)
        data = serializer.data
        
        assert data['id'] == cta.id
        assert data['name'] == 'test-cta'
        assert data['type'] == 'button'
        assert data['default_text'] == 'Click me'
        assert data['default_url'] == '/test'
        assert data['is_active'] is True
        assert data['is_global'] is False

    def test_create_cta(self):
        """Test création d'un CTA via serializer"""
        data = {
            'name': 'new-cta',
            'label': 'Learn more',
            'type': 'link',
            'default_text': 'Learn more',
            'default_url': '/learn',
            'is_active': True,
            'is_global': False,
            'styles': {},
            'config': {}
        }
        
        serializer = CallToActionSerializer(data=data)
        assert serializer.is_valid()
        cta = serializer.save()
        
        assert cta.name == 'new-cta'
        assert cta.type == 'link'
        assert CallToAction.objects.filter(id=cta.id).exists()

    def test_update_cta(self):
        """Test mise à jour d'un CTA via serializer"""
        cta = CallToAction.objects.create(
            name='test-cta-update',
            label='Test CTA',
            type='button',
            default_text='Click me',
            default_url='/test',
            is_active=True
        )
        
        data = {'default_text': 'Updated text'}
        serializer = CallToActionSerializer(cta, data=data, partial=True)
        assert serializer.is_valid()
        updated_cta = serializer.save()
        
        assert updated_cta.default_text == 'Updated text'
        assert updated_cta.name == 'test-cta-update'  # Non modifié (partial update n'inclut pas name)


@pytest.mark.django_db
@pytest.mark.unit
class TestBlockTypeSerializer:
    """Tests pour BlockTypeSerializer"""

    @pytest.fixture
    def block_type(self):
        return BlockType.objects.create(
            name='test-block',
            label='Test Block',
            icon='📦',
            category='content',
            description='Test description',
            order=1,
            is_active=True,
            schema={},
            default_styles={}
        )

    def test_serialize_block_type(self, block_type):
        """Test sérialisation d'un block type"""
        serializer = BlockTypeSerializer(block_type)
        data = serializer.data
        
        assert data['id'] == block_type.id
        assert data['name'] == 'test-block'
        assert data['label'] == 'Test Block'
        assert data['icon'] == '📦'
        assert data['category'] == 'content'
        assert 'available_plans' in data
        assert 'plan_names' in data
        assert isinstance(data['available_plans'], list)
        assert isinstance(data['plan_names'], list)

    def test_create_block_type(self):
        """Test création d'un block type via serializer"""
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
        
        serializer = BlockTypeSerializer(data=data)
        assert serializer.is_valid()
        block_type = serializer.save()
        
        assert block_type.name == 'new-block'
        assert block_type.label == 'New Block'
        assert BlockType.objects.filter(id=block_type.id).exists()

    def test_create_block_type_with_plan_ids(self):
        """Test création d'un block type avec des plan IDs"""
        try:
            from billing.models import PricingPlan
            from decimal import Decimal
            
            plan = PricingPlan.objects.create(
                name='Test Plan',
                slug='test-plan',
                price_monthly=Decimal('29.99'),
                price_yearly=Decimal('299.99'),
                currency='EUR',
                is_active=True
            )
            
            data = {
                'name': 'premium-block',
                'label': 'Premium Block',
                'icon': '⭐',
                'category': 'content',
                'is_active': True,
                'available_plan_ids': [plan.id],
                'schema': {},
                'default_styles': {}
            }
            
            serializer = BlockTypeSerializer(data=data)
            assert serializer.is_valid()
            block_type = serializer.save()
            
            assert block_type.available_plans.count() == 1
            assert block_type.available_plans.first().id == plan.id
        except ImportError:
            pytest.skip("Billing models not available")

    def test_create_block_type_with_cta_ids(self):
        """Test création d'un block type avec des CTA IDs"""
        cta = CallToAction.objects.create(
            name='test-cta',
            type='button',
            default_text='Click me',
            default_url='/test',
            is_active=True
        )
        
        data = {
            'name': 'block-with-cta',
            'label': 'Block with CTA',
            'icon': '📦',
            'category': 'content',
            'is_active': True,
            'call_to_action_ids': [cta.id],
            'schema': {},
            'default_styles': {}
        }
        
        serializer = BlockTypeSerializer(data=data)
        assert serializer.is_valid()
        block_type = serializer.save()
        
        assert block_type.call_to_actions.count() == 1
        assert block_type.call_to_actions.first().id == cta.id

    def test_update_block_type(self, block_type):
        """Test mise à jour d'un block type"""
        data = {'label': 'Updated Block', 'description': 'Updated description'}
        serializer = BlockTypeSerializer(block_type, data=data, partial=True)
        assert serializer.is_valid()
        updated_block = serializer.save()
        
        assert updated_block.label == 'Updated Block'
        assert updated_block.description == 'Updated description'
        assert updated_block.name == 'test-block'  # Non modifié

    def test_get_available_plans(self, block_type):
        """Test méthode get_available_plans"""
        try:
            from billing.models import PricingPlan
            from decimal import Decimal
            
            plan1 = PricingPlan.objects.create(
                name='Plan 1',
                slug='plan-1',
                price_monthly=Decimal('19.99'),
                currency='EUR',
                is_active=True
            )
            plan2 = PricingPlan.objects.create(
                name='Plan 2',
                slug='plan-2',
                price_monthly=Decimal('39.99'),
                currency='EUR',
                is_active=True
            )
            
            block_type.available_plans.add(plan1, plan2)
            
            serializer = BlockTypeSerializer(block_type)
            available_plans = serializer.get_available_plans(block_type)
            
            assert isinstance(available_plans, list)
            assert len(available_plans) == 2
            assert plan1.id in available_plans
            assert plan2.id in available_plans
        except ImportError:
            pytest.skip("Billing models not available")

    def test_get_plan_names(self, block_type):
        """Test méthode get_plan_names"""
        try:
            from billing.models import PricingPlan
            from decimal import Decimal
            
            plan = PricingPlan.objects.create(
                name='Test Plan',
                slug='test-plan',
                price_monthly=Decimal('29.99'),
                currency='EUR',
                is_active=True
            )
            
            block_type.available_plans.add(plan)
            
            serializer = BlockTypeSerializer(block_type)
            plan_names = serializer.get_plan_names(block_type)
            
            assert isinstance(plan_names, list)
            assert len(plan_names) == 1
            assert 'Test Plan' in plan_names
        except ImportError:
            pytest.skip("Billing models not available")


@pytest.mark.django_db
@pytest.mark.unit
class TestBlockTemplateSerializer:
    """Tests pour BlockTemplateSerializer"""

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
    def block_type(self):
        return BlockType.objects.create(
            name='test-block',
            label='Test Block',
            icon='📦',
            category='content',
            is_active=True
        )

    def test_serialize_block_template(self, tenant, block_type):
        """Test sérialisation d'un block template"""
        template = BlockTemplate.objects.create(
            tenant=tenant,
            name='Test Template',
            description='Test description',
            block_type=block_type,
            block_data={'text': 'Hello'},
            block_styles={'color': 'blue'},
            is_global=False,
            is_active=True
        )
        
        serializer = BlockTemplateSerializer(template)
        data = serializer.data
        
        assert data['id'] == template.id
        assert data['name'] == 'Test Template'
        assert data['description'] == 'Test description'
        assert data['block_type'] == block_type.id
        assert data['block_data'] == {'text': 'Hello'}
        assert data['block_styles'] == {'color': 'blue'}

    def test_create_block_template(self, tenant, block_type):
        """Test création d'un block template"""
        data = {
            'tenant': tenant.id,
            'name': 'New Template',
            'description': 'New description',
            'block_type': block_type.id,
            'block_data': {'text': 'New text'},
            'block_styles': {'color': 'red'},
            'is_global': False,
            'is_active': True
        }
        
        serializer = BlockTemplateSerializer(data=data)
        assert serializer.is_valid()
        template = serializer.save()
        
        assert template.name == 'New Template'
        assert template.block_type == block_type
        assert BlockTemplate.objects.filter(id=template.id).exists()

