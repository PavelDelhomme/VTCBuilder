"""
Exemple de tests unitaires pour les sérialiseurs Django REST Framework
"""

import pytest
from rest_framework.test import APITestCase
from rest_framework import status


@pytest.mark.unit
class TestSerializerValidation(APITestCase):
    """Tests pour la validation des sérialiseurs"""

    def test_example_serializer_valid_data(self):
        """Test avec des données valides"""
        # Exemple de test de sérialiseur
        # Remplacez par vos sérialiseurs réels
        valid_data = {
            'name': 'Test Name',
            'email': 'test@example.com',
        }
        # serializer = MySerializer(data=valid_data)
        # self.assertTrue(serializer.is_valid())

    def test_example_serializer_invalid_data(self):
        """Test avec des données invalides"""
        invalid_data = {
            'name': '',  # Champ requis vide
            'email': 'invalid-email',  # Email invalide
        }
        # serializer = MySerializer(data=invalid_data)
        # self.assertFalse(serializer.is_valid())
        # self.assertIn('name', serializer.errors)
        # self.assertIn('email', serializer.errors)

