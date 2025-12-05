"""
Tests for Security Settings
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from security.models import SecuritySettings

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
def security_settings():
    """Create security settings"""
    return SecuritySettings.objects.get_or_create(
        defaults={
            'waf_enabled': True,
            'waf_mode': 'blocking',
            'rate_limit_enabled': True,
            'rate_limit_requests_per_minute': 60,
            'rate_limit_requests_per_hour': 1000,
        }
    )[0]


@pytest.mark.django_db
class TestSecuritySettingsModel:
    """Test SecuritySettings model"""
    
    def test_create_security_settings(self):
        """Test creating security settings"""
        settings = SecuritySettings.objects.create(
            waf_enabled=True,
            waf_mode='blocking',
            rate_limit_enabled=True,
            rate_limit_requests_per_minute=60
        )
        assert settings.id is not None
        assert settings.waf_enabled is True
        assert settings.waf_mode == 'blocking'
    
    def test_security_settings_singleton(self):
        """Test that only one SecuritySettings instance exists"""
        settings1 = SecuritySettings.objects.get_or_create()[0]
        settings2 = SecuritySettings.objects.get_or_create()[0]
        assert settings1.id == settings2.id
    
    def test_security_settings_str(self, security_settings):
        """Test security settings string representation"""
        assert 'Security Settings' in str(security_settings)


@pytest.mark.django_db
class TestSecuritySettingsAPI:
    """Test Security Settings API endpoints"""
    
    def test_get_security_settings(self, api_client, security_settings):
        """Test getting security settings"""
        response = api_client.get('/api/security/settings/')
        assert response.status_code == status.HTTP_200_OK
        assert 'waf_enabled' in response.data
        assert 'waf_mode' in response.data
    
    def test_update_security_settings(self, api_client, security_settings):
        """Test updating security settings"""
        data = {
            'waf_enabled': False,
            'waf_mode': 'monitoring',
            'rate_limit_requests_per_minute': 120
        }
        response = api_client.patch('/api/security/settings/', data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['waf_enabled'] is False
        assert response.data['waf_mode'] == 'monitoring'
        assert response.data['rate_limit_requests_per_minute'] == 120
    
    def test_update_rate_limiting(self, api_client, security_settings):
        """Test updating rate limiting settings"""
        data = {
            'rate_limit_enabled': True,
            'rate_limit_requests_per_minute': 100,
            'rate_limit_requests_per_hour': 5000
        }
        response = api_client.patch('/api/security/settings/', data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['rate_limit_requests_per_minute'] == 100
        assert response.data['rate_limit_requests_per_hour'] == 5000
    
    def test_update_alerting_settings(self, api_client, security_settings):
        """Test updating alerting settings"""
        data = {
            'alert_on_critical': True,
            'alert_on_high': True,
            'alert_on_medium': True,
            'alert_email': 'security@example.com'
        }
        response = api_client.patch('/api/security/settings/', data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['alert_on_medium'] is True
        assert response.data['alert_email'] == 'security@example.com'
    
    def test_update_auto_blocking_settings(self, api_client, security_settings):
        """Test updating auto-blocking settings"""
        data = {
            'auto_block_after_attempts': 10,
            'auto_block_duration_hours': 48
        }
        response = api_client.patch('/api/security/settings/', data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['auto_block_after_attempts'] == 10
        assert response.data['auto_block_duration_hours'] == 48

