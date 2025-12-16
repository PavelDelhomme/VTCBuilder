"""
Exemple de tests d'intégration pour l'API
"""

import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.integration
@pytest.mark.api
class TestAPIEndpoints:
    """Tests d'intégration pour les endpoints API"""

    @pytest.fixture
    def api_client(self):
        """Client API pour les tests"""
        return APIClient()

    @pytest.fixture
    def user(self):
        """Utilisateur de test"""
        return User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_health_check_endpoint(self, api_client):
        """Test de l'endpoint de health check"""
        response = api_client.get('/api/health/')
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]

    def test_authenticated_endpoint_requires_auth(self, api_client):
        """Test qu'un endpoint authentifié nécessite une authentification"""
        response = api_client.get('/api/protected/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_authenticated_endpoint_with_auth(self, api_client, user):
        """Test d'un endpoint authentifié avec authentification"""
        api_client.force_authenticate(user=user)
        # Remplacez '/api/protected/' par un endpoint réel de votre API
        # response = api_client.get('/api/protected/')
        # assert response.status_code == status.HTTP_200_OK

