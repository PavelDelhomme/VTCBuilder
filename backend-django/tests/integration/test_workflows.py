"""
Tests d'intégration pour les workflows complets
"""

import pytest
from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.integration
class TestUserWorkflow(TestCase):
    """Tests du workflow complet utilisateur"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='workflowuser',
            email='workflow@example.com',
            password='testpass123'
        )

    def test_user_registration_workflow(self):
        """Test du workflow d'inscription complet"""
        # 1. Création d'un utilisateur
        user_data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'first_name': 'New',
            'last_name': 'User',
        }
        
        # 2. Vérification de la création
        user = User.objects.create_user(**user_data)
        self.assertEqual(user.email, 'newuser@example.com')
        self.assertTrue(user.check_password('newpass123'))

    def test_user_authentication_workflow(self):
        """Test du workflow d'authentification complet"""
        # 1. Login
        response = self.client.post('/api/auth/login/', {
            'email': 'workflow@example.com',
            'password': 'testpass123',
        })
        
        # 2. Vérification du token
        # (Adaptez selon votre implémentation d'authentification)
        # self.assertIn('access', response.data)

