"""
Tests for WAF Rules
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from security.models import WAFRule, WAFLog, SecurityAlert
from django.utils import timezone

User = get_user_model()


@pytest.fixture
def api_client():
    """Create an authenticated API client"""
    client = APIClient()
    user = User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123',
        is_staff=True,
        is_superuser=True
    )
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def default_waf_rule():
    """Create a default WAF rule"""
    return WAFRule.objects.create(
        name='[Défaut] Protection SQL Injection',
        description='Test rule',
        rule_type='sql_injection',
        status='active',
        priority=10,
        action='block',
        config={
            'patterns': [r'(?i)(union\s+select)'],
            'check_query_params': True,
            'check_body': True,
        }
    )


@pytest.mark.django_db
class TestWAFRuleModel:
    """Test WAFRule model"""
    
    def test_create_waf_rule(self):
        """Test creating a WAF rule"""
        rule = WAFRule.objects.create(
            name='Test Rule',
            description='Test description',
            rule_type='sql_injection',
            status='active',
            priority=10,
            action='block',
            config={'patterns': ['test']}
        )
        assert rule.id is not None
        assert rule.name == 'Test Rule'
        assert rule.status == 'active'
    
    def test_waf_rule_str(self, default_waf_rule):
        """Test WAF rule string representation"""
        assert '[Défaut] Protection SQL Injection' in str(default_waf_rule)
    
    def test_waf_rule_priority_ordering(self):
        """Test WAF rules are ordered by priority"""
        rule1 = WAFRule.objects.create(
            name='Rule 1', rule_type='sql_injection', priority=20, action='block'
        )
        rule2 = WAFRule.objects.create(
            name='Rule 2', rule_type='xss', priority=10, action='block'
        )
        rules = list(WAFRule.objects.filter(name__in=['Rule 1', 'Rule 2']).order_by('priority'))
        assert len(rules) == 2
        assert rules[0].priority == 10
        assert rules[1].priority == 20


@pytest.mark.django_db
class TestWAFRuleAPI:
    """Test WAF Rule API endpoints"""
    
    def test_list_waf_rules(self, api_client, default_waf_rule):
        """Test listing WAF rules"""
        response = api_client.get('/api/security/waf/rules/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1
    
    def test_create_waf_rule(self, api_client):
        """Test creating a WAF rule via API"""
        data = {
            'name': 'Test Rule',
            'description': 'Test description',
            'rule_type': 'xss',
            'status': 'active',
            'priority': 15,
            'action': 'block',
            'config': {
                'patterns': [r'<script>'],
                'check_query_params': True,
            }
        }
        response = api_client.post('/api/security/waf/rules/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'Test Rule'
    
    def test_update_waf_rule(self, api_client, default_waf_rule):
        """Test updating a WAF rule"""
        data = {'name': 'Updated Rule Name'}
        response = api_client.patch(
            f'/api/security/waf/rules/{default_waf_rule.id}/',
            data,
            format='json'
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Updated Rule Name'
    
    def test_delete_waf_rule(self, api_client, default_waf_rule):
        """Test deleting a WAF rule"""
        rule_id = default_waf_rule.id
        response = api_client.delete(f'/api/security/waf/rules/{rule_id}/')
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not WAFRule.objects.filter(id=rule_id).exists()
    
    def test_toggle_waf_rule_status(self, api_client, default_waf_rule):
        """Test toggling WAF rule status"""
        initial_status = default_waf_rule.status
        response = api_client.post(
            f'/api/security/waf/rules/{default_waf_rule.id}/toggle_status/'
        )
        assert response.status_code == status.HTTP_200_OK
        default_waf_rule.refresh_from_db()
        assert default_waf_rule.status != initial_status
    
    def test_init_default_waf_rules(self, api_client):
        """Test initializing default WAF rules"""
        # Delete existing default rules
        WAFRule.objects.filter(name__startswith='[Défaut]').delete()
        
        response = api_client.post('/api/security/waf/rules/init_default_rules/')
        assert response.status_code == status.HTTP_201_CREATED
        assert 'message' in response.data
        assert response.data['count'] > 0
        
        # Verify rules were created
        default_rules = WAFRule.objects.filter(name__startswith='[Défaut]')
        assert default_rules.count() > 0


@pytest.mark.django_db
class TestWAFRuleValidation:
    """Test WAF rule validation"""
    
    def test_sql_injection_patterns(self, default_waf_rule):
        """Test SQL injection patterns are configured"""
        assert 'patterns' in default_waf_rule.config
        assert len(default_waf_rule.config['patterns']) > 0
    
    def test_rate_limit_config(self):
        """Test rate limit rule configuration"""
        rule = WAFRule.objects.create(
            name='Rate Limit Rule',
            rule_type='rate_limit',
            priority=50,
            action='block',
            config={
                'requests_per_minute': 60,
                'requests_per_hour': 1000,
            }
        )
        assert 'requests_per_minute' in rule.config
        assert rule.config['requests_per_minute'] == 60

