"""
Tests for WAF Logs
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from security.models import WAFLog, WAFRule
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


@pytest.fixture
def api_client():
    """Create an authenticated API client"""
    client = APIClient()
    user = User.objects.create_user(
        email='test@example.com',
        password='testpass123',
        is_staff=True,
        is_superuser=True
    )
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def waf_rule():
    """Create a WAF rule"""
    return WAFRule.objects.create(
        name='Test Rule',
        rule_type='sql_injection',
        priority=10,
        action='block'
    )


@pytest.fixture
def waf_log(waf_rule):
    """Create a WAF log"""
    return WAFLog.objects.create(
        ip_address='192.168.1.100',
        user_agent='Mozilla/5.0',
        request_method='GET',
        request_path='/test?q=SELECT * FROM users',
        request_headers={'User-Agent': 'Mozilla/5.0'},
        action='blocked',
        severity='high',
        reason='SQL injection pattern detected',
        matched_rule=waf_rule,
        response_status=403
    )


@pytest.mark.django_db
class TestWAFLogModel:
    """Test WAFLog model"""
    
    def test_create_waf_log(self, waf_rule):
        """Test creating a WAF log"""
        log = WAFLog.objects.create(
            ip_address='192.168.1.100',
            request_method='GET',
            request_path='/test',
            action='blocked',
            severity='high',
            reason='Test reason',
            matched_rule=waf_rule
        )
        assert log.id is not None
        assert log.ip_address == '192.168.1.100'
        assert log.action == 'blocked'
    
    def test_waf_log_str(self, waf_log):
        """Test WAF log string representation"""
        assert '192.168.1.100' in str(waf_log)
        assert '/test' in str(waf_log)
    
    def test_waf_log_ordering(self):
        """Test WAF logs are ordered by timestamp"""
        log1 = WAFLog.objects.create(
            ip_address='1.1.1.1',
            request_method='GET',
            request_path='/test1',
            action='allowed'
        )
        log2 = WAFLog.objects.create(
            ip_address='2.2.2.2',
            request_method='POST',
            request_path='/test2',
            action='blocked'
        )
        logs = list(WAFLog.objects.all().order_by('-timestamp'))
        # Most recent first
        assert logs[0].ip_address == '2.2.2.2'


@pytest.mark.django_db
class TestWAFLogAPI:
    """Test WAF Log API endpoints"""
    
    def test_list_waf_logs(self, api_client, waf_log):
        """Test listing WAF logs"""
        response = api_client.get('/api/security/waf/logs/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1
    
    def test_filter_logs_by_ip(self, api_client, waf_log):
        """Test filtering logs by IP address"""
        response = api_client.get('/api/security/waf/logs/?ip_address=192.168.1.100')
        assert response.status_code == status.HTTP_200_OK
        assert all(log['ip_address'] == '192.168.1.100' for log in response.data)
    
    def test_filter_logs_by_severity(self, api_client, waf_log):
        """Test filtering logs by severity"""
        response = api_client.get('/api/security/waf/logs/?severity=high')
        assert response.status_code == status.HTTP_200_OK
        assert all(log['severity'] == 'high' for log in response.data)
    
    def test_filter_logs_by_action(self, api_client, waf_log):
        """Test filtering logs by action"""
        response = api_client.get('/api/security/waf/logs/?action=blocked')
        assert response.status_code == status.HTTP_200_OK
        assert all(log['action'] == 'blocked' for log in response.data)
    
    def test_filter_logs_by_days(self, api_client, waf_log):
        """Test filtering logs by days"""
        response = api_client.get('/api/security/waf/logs/?days=7')
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestWAFLogStats:
    """Test WAF Log statistics"""
    
    def test_waf_stats_endpoint(self, api_client, waf_rule):
        """Test WAF stats endpoint"""
        # Create multiple logs
        WAFLog.objects.create(
            ip_address='192.168.1.100',
            request_method='GET',
            request_path='/test1',
            action='blocked',
            severity='high',
            matched_rule=waf_rule
        )
        WAFLog.objects.create(
            ip_address='192.168.1.100',
            request_method='POST',
            request_path='/test2',
            action='blocked',
            severity='high',
            matched_rule=waf_rule
        )
        WAFLog.objects.create(
            ip_address='192.168.1.200',
            request_method='GET',
            request_path='/test3',
            action='allowed',
            severity='low'
        )
        
        response = api_client.get('/api/security/waf/logs/stats/?days=7')
        assert response.status_code == status.HTTP_200_OK
        assert 'total_requests' in response.data
        assert 'blocked' in response.data
        assert 'allowed' in response.data
        assert response.data['total_requests'] == 3
        assert response.data['blocked'] == 2
        assert response.data['allowed'] == 1
    
    def test_waf_stats_threats_by_type(self, api_client, waf_rule):
        """Test threats by type in stats"""
        WAFLog.objects.create(
            ip_address='192.168.1.100',
            request_method='GET',
            request_path='/test',
            action='blocked',
            severity='high',
            matched_rule=waf_rule
        )
        
        response = api_client.get('/api/security/waf/logs/stats/?days=7')
        assert response.status_code == status.HTTP_200_OK
        assert 'threats_by_type' in response.data
        assert 'top_threatening_ips' in response.data

