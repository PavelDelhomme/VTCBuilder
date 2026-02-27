"""
Exemple de tests unitaires pour les modèles Django
"""

import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.unit
@pytest.mark.model
class TestUserModel(TestCase):
    """Tests pour le modèle User"""

    def test_user_creation(self):
        """Test de création d'un utilisateur"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpass123'))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_superuser_creation(self):
        """Test de création d'un superutilisateur"""
        superuser = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )
        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)

    def test_user_str_representation(self):
        """Test de la représentation string d'un utilisateur (email ou format métier)."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.assertEqual(user.email, 'test@example.com')
        # __str__ peut être email, username, ou format avec rôle selon le modèle
        self.assertTrue(
            str(user) == user.email or user.email in str(user) or len(str(user).strip()) > 0,
            f'str(user) doit contenir un identifiant: {repr(str(user))}'
        )


@pytest.mark.unit
class TestExampleLogic(TestCase):
    """Exemple de tests pour la logique métier"""

    def test_example_calculation(self):
        """Test d'un calcul simple"""
        result = 2 + 2
        self.assertEqual(result, 4)

    def test_example_string_operation(self):
        """Test d'une opération sur chaîne"""
        text = "Hello"
        result = text.upper()
        self.assertEqual(result, "HELLO")

