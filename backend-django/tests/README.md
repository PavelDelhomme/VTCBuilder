# Tests Backend

Ce dossier contient tous les tests pour le backend Django.

## Structure

```
tests/
├── unit/              # Tests unitaires
│   ├── models/        # Tests des modèles
│   ├── views/         # Tests des vues
│   ├── serializers/   # Tests des sérialiseurs
│   └── utils/         # Tests des utilitaires
├── integration/       # Tests d'intégration
│   ├── api/           # Tests des endpoints API
│   └── workflows/     # Tests des workflows complets
└── fixtures/          # Données de test
```

## Commandes

```bash
# Exécuter tous les tests
make test

# Tests unitaires uniquement
make test-unit

# Tests d'intégration uniquement
make test-integration

# Tests avec couverture
make test-coverage

# Analyse complète (lint + format + tests)
make analyze
```

## Écriture de tests

### Exemple de test de modèle

```python
import pytest
from django.test import TestCase
from myapp.models import MyModel

class TestMyModel(TestCase):
    def test_model_creation(self):
        obj = MyModel.objects.create(name="Test")
        self.assertEqual(obj.name, "Test")
```

### Exemple de test d'API

```python
import pytest
from rest_framework.test import APIClient
from rest_framework import status

@pytest.mark.api
def test_api_endpoint():
    client = APIClient()
    response = client.get('/api/endpoint/')
    assert response.status_code == status.HTTP_200_OK
```
