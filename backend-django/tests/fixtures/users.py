"""
Fixtures pour les utilisateurs de test
"""

import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def test_user(db):
    """Utilisateur de test standard"""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123',
        first_name='Test',
        last_name='User',
    )


@pytest.fixture
def test_superuser(db):
    """Superutilisateur de test"""
    return User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='adminpass123',
    )


@pytest.fixture
def test_user_client(client, test_user):
    """Client authentifié avec un utilisateur de test"""
    client.force_login(test_user)
    return client

