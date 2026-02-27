"""
Tests for Security Alerts
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from security.models import SecurityAlert, WAFLog, WAFRule
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
def waf_rule():
    """Create a WAF rule"""
    return WAFRule.objects.create(
        name='Test Rule',
        rule_type='sql_injection',
        priority=10,
        action='block'
    )


@pytest.fixture
def security_alert(waf_rule):
    """Create a security alert"""
    return SecurityAlert.objects.create(
        alert_type='attack_detected',
        severity='high',
        status='new',
        title='SQL Injection Attempt',
        message='A SQL injection attempt was detected',
        ip_address='192.168.1.100',
        related_rule=waf_rule
    )


@pytest.mark.django_db
class TestSecurityAlertModel:
    """Test SecurityAlert model"""
    
    def test_create_security_alert(self, waf_rule):
        """Test creating a security alert"""
        alert = SecurityAlert.objects.create(
            alert_type='attack_detected',
            severity='high',
            status='new',
            title='Test Alert',
            message='Test message',
            ip_address='192.168.1.100',
            related_rule=waf_rule
        )
        assert alert.id is not None
        assert alert.severity == 'high'
        assert alert.status == 'new'
    
    def test_security_alert_str(self, security_alert):
        """Test security alert string representation"""
        assert 'SQL Injection Attempt' in str(security_alert)
    
    def test_security_alert_ordering(self):
        """Test security alerts are ordered by creation date"""
        alert1 = SecurityAlert.objects.create(
            alert_type='attack_detected',
            severity='low',
            status='new',
            title='Alert 1',
            message='Message 1'
        )
        alert2 = SecurityAlert.objects.create(
            alert_type='rate_limit_exceeded',
            severity='high',
            status='new',
            title='Alert 2',
            message='Message 2'
        )
        alerts = list(SecurityAlert.objects.all().order_by('-created_at'))
        # Most recent first
        assert alerts[0].title == 'Alert 2'


@pytest.mark.django_db
class TestSecurityAlertAPI:
    """Test Security Alert API endpoints"""
    
    def test_list_security_alerts(self, api_client, security_alert):
        """Test listing security alerts"""
        response = api_client.get('/api/security/alerts/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1
    
    def test_filter_alerts_by_status(self, api_client, security_alert):
        """Test filtering alerts by status"""
        response = api_client.get('/api/security/alerts/?status=new')
        assert response.status_code == status.HTTP_200_OK
        items = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        if not isinstance(items, list):
            items = [items] if items else []
        assert all(alert.get('status') == 'new' for alert in items)

    def test_filter_alerts_by_severity(self, api_client, security_alert):
        """Test filtering alerts by severity"""
        response = api_client.get('/api/security/alerts/?severity=high')
        assert response.status_code == status.HTTP_200_OK
        items = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        if not isinstance(items, list):
            items = [items] if items else []
        assert all(alert.get('severity') == 'high' for alert in items)
    
    def test_acknowledge_alert(self, api_client, security_alert):
        """Test acknowledging a security alert"""
        response = api_client.post(
            f'/api/security/alerts/{security_alert.id}/acknowledge/'
        )
        assert response.status_code == status.HTTP_200_OK
        security_alert.refresh_from_db()
        assert security_alert.status == 'acknowledged'
        assert security_alert.acknowledged_at is not None
    
    def test_resolve_alert(self, api_client, security_alert):
        """Test resolving a security alert"""
        response = api_client.post(
            f'/api/security/alerts/{security_alert.id}/resolve/'
        )
        assert response.status_code == status.HTTP_200_OK
        security_alert.refresh_from_db()
        assert security_alert.status == 'resolved'
        assert security_alert.resolved_at is not None


@pytest.mark.django_db
class TestSecurityAlertCreation:
    """Test automatic security alert creation"""
    
    def test_alert_created_from_waf_log(self, waf_rule):
        """Test that alerts can be created from WAF logs"""
        log = WAFLog.objects.create(
            ip_address='192.168.1.100',
            request_method='GET',
            request_path='/test',
            action='blocked',
            severity='high',
            reason='SQL injection detected',
            matched_rule=waf_rule
        )
        
        alert = SecurityAlert.objects.create(
            alert_type='attack_detected',
            severity='high',
            status='new',
            title='Attack Detected',
            message=f'Attack from {log.ip_address}',
            ip_address=log.ip_address,
            related_log=log,
            related_rule=waf_rule
        )
        
        assert alert.related_log == log
        assert alert.related_rule == waf_rule
        assert alert.ip_address == log.ip_address

