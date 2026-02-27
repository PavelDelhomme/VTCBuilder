"""
Tests for Firewall Rules
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from security.models import FirewallRule

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
def default_firewall_rule():
    """Create a default firewall rule"""
    return FirewallRule.objects.create(
        name='[Défaut] Blocage IPs Malveillantes',
        description='Test rule',
        rule_type='ip_blacklist',
        status='active',
        priority=5,
        config={
            'ips': ['1.2.3.4', '5.6.7.8'],
        }
    )


@pytest.mark.django_db
class TestFirewallRuleModel:
    """Test FirewallRule model"""
    
    def test_create_firewall_rule(self):
        """Test creating a firewall rule"""
        rule = FirewallRule.objects.create(
            name='Test Rule',
            description='Test description',
            rule_type='ip_whitelist',
            status='active',
            priority=10,
            config={'ips': ['127.0.0.1']}
        )
        assert rule.id is not None
        assert rule.name == 'Test Rule'
        assert rule.status == 'active'
    
    def test_firewall_rule_str(self, default_firewall_rule):
        """Test firewall rule string representation"""
        assert '[Défaut] Blocage IPs Malveillantes' in str(default_firewall_rule)
    
    def test_firewall_rule_priority_ordering(self):
        """Test firewall rules are ordered by priority"""
        rule1 = FirewallRule.objects.create(
            name='Rule 1', rule_type='ip_blacklist', priority=20
        )
        rule2 = FirewallRule.objects.create(
            name='Rule 2', rule_type='ip_whitelist', priority=10
        )
        rules = list(FirewallRule.objects.filter(name__in=['Rule 1', 'Rule 2']).order_by('priority'))
        assert len(rules) == 2
        assert rules[0].priority == 10
        assert rules[1].priority == 20


@pytest.mark.django_db
class TestFirewallRuleAPI:
    """Test Firewall Rule API endpoints"""
    
    def test_list_firewall_rules(self, api_client, default_firewall_rule):
        """Test listing firewall rules"""
        response = api_client.get('/api/security/firewall/rules/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1
    
    def test_create_firewall_rule(self, api_client):
        """Test creating a firewall rule via API"""
        data = {
            'name': 'Test Firewall Rule',
            'description': 'Test description',
            'rule_type': 'ip_blacklist',
            'status': 'active',
            'priority': 15,
            'config': {
                'ips': ['192.168.1.100'],
            }
        }
        response = api_client.post('/api/security/firewall/rules/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'Test Firewall Rule'
    
    def test_update_firewall_rule(self, api_client, default_firewall_rule):
        """Test updating a firewall rule"""
        data = {'name': 'Updated Rule Name'}
        response = api_client.patch(
            f'/api/security/firewall/rules/{default_firewall_rule.id}/',
            data,
            format='json'
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Updated Rule Name'
    
    def test_delete_firewall_rule(self, api_client, default_firewall_rule):
        """Test deleting a firewall rule"""
        rule_id = default_firewall_rule.id
        response = api_client.delete(f'/api/security/firewall/rules/{rule_id}/')
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not FirewallRule.objects.filter(id=rule_id).exists()


@pytest.mark.django_db
class TestFirewallRuleTypes:
    """Test different firewall rule types"""
    
    def test_ip_whitelist_rule(self):
        """Test IP whitelist rule"""
        rule = FirewallRule.objects.create(
            name='Whitelist Rule',
            rule_type='ip_whitelist',
            priority=1,
            config={'ips': ['127.0.0.1', '::1']}
        )
        assert rule.rule_type == 'ip_whitelist'
        assert len(rule.config['ips']) == 2
    
    def test_ip_blacklist_rule(self):
        """Test IP blacklist rule"""
        rule = FirewallRule.objects.create(
            name='Blacklist Rule',
            rule_type='ip_blacklist',
            priority=5,
            config={'ips': ['1.2.3.4']}
        )
        assert rule.rule_type == 'ip_blacklist'
        assert '1.2.3.4' in rule.config['ips']
    
    def test_country_blacklist_rule(self):
        """Test country blacklist rule"""
        rule = FirewallRule.objects.create(
            name='Country Blacklist',
            rule_type='country_blacklist',
            priority=30,
            config={'countries': ['CN', 'RU']}
        )
        assert rule.rule_type == 'country_blacklist'
        assert 'CN' in rule.config['countries']

