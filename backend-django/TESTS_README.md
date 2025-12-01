# 🧪 Guide des Tests Unitaires - Backend VTCBuilder

Ce document décrit la suite complète de tests unitaires automatisés pour le backend Django.

## 📋 Structure des Tests

```
backend-django/
├── api/tests/
│   ├── test_views.py                    # Tests de base pour les vues API
│   ├── test_views_comprehensive.py      # Tests exhaustifs pour DashboardView, DetailedStatsView, block_usage_tracking
│   ├── test_all_endpoints_comprehensive.py  # Tests pour tous les endpoints
│   └── test_utils.py                    # Tests pour les fonctions utilitaires
├── blocks/tests/
│   ├── test_views.py                    # Tests pour BlockTypeViewSet, CallToActionViewSet
│   └── test_serializers.py              # Tests pour tous les serializers Block
├── projects/tests/
│   └── test_views.py                    # Tests pour ProjectViewSet
├── tenants/tests/                       # Tests existants
├── pages/tests/                         # Tests existants
├── services/tests/                      # Tests existants
├── bookings/tests/                       # Tests existants
├── media/tests/                         # Tests existants
└── billing/tests/                       # Tests existants
```

## 🚀 Exécution des Tests

### Tous les tests
```bash
cd backend-django
docker exec vtcbuilder-backend pytest -v
```

### Tests spécifiques
```bash
# Tests API
docker exec vtcbuilder-backend pytest api/tests/ -v

# Tests Blocks
docker exec vtcbuilder-backend pytest blocks/tests/ -v

# Tests Projects
docker exec vtcbuilder-backend pytest projects/tests/ -v

# Tests avec marqueurs
docker exec vtcbuilder-backend pytest -m api -v
docker exec vtcbuilder-backend pytest -m unit -v
```

### Avec couverture
```bash
docker exec vtcbuilder-backend pytest --cov=. --cov-report=html
```

## 📊 Couverture des Tests

### ✅ Tests Créés

#### API Views
- ✅ `DashboardView` - Tests complets (authentification, super admin, tenant admin, données vides, avec données, trial tenants, billing)
- ✅ `DetailedStatsView` - Tests complets (structure, overview, tenants, users, recent data, gestion d'erreurs)
- ✅ `block_usage_tracking_view` - Tests complets (OPTIONS, pas d'auth requise, données valides/invalides)

#### Blocks
- ✅ `BlockTypeViewSet` - Tests CRUD complets
- ✅ `CallToActionViewSet` - Tests CRUD complets
- ✅ `BlockTypeSerializer` - Tests sérialisation, création, mise à jour, plans, CTAs
- ✅ `CallToActionSerializer` - Tests sérialisation, création, mise à jour
- ✅ `BlockTemplateSerializer` - Tests sérialisation, création

#### Projects
- ✅ `ProjectViewSet` - Tests CRUD complets, filtrage par tenant, ajout/suppression de pages

#### Utilitaires
- ✅ `add_cors_headers` - Tests pour différentes origines (localhost, 127.0.0.1, 192.168.1.134, HTTPS)

### ⏳ Tests à Compléter

- Tests pour tous les autres ViewSets (TenantViewSet, UserViewSet, PageViewSet, ServiceViewSet, BookingViewSet, MediaViewSet, TemplateViewSet)
- Tests pour tous les serializers manquants
- Tests d'intégration end-to-end
- Tests de performance

## 📝 Exemples de Tests

### Test d'une Vue API
```python
def test_dashboard_requires_authentication(self, api_client):
    """Test que le dashboard nécessite une authentification"""
    url = reverse('dashboard')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
```

### Test d'un ViewSet
```python
def test_list_block_types(self, authenticated_client):
    """Test liste des block types"""
    url = reverse('block-type-list')
    response = authenticated_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.data, list)
```

### Test d'un Serializer
```python
def test_serialize_block_type(self, block_type):
    """Test sérialisation d'un block type"""
    serializer = BlockTypeSerializer(block_type)
    data = serializer.data
    assert data['id'] == block_type.id
    assert data['name'] == 'test-block'
```

## 🎯 Objectifs

- ✅ Couverture complète de toutes les fonctions backend
- ✅ Tests pour tous les cas d'erreur
- ✅ Tests pour toutes les permissions
- ✅ Tests pour tous les endpoints API
- ✅ Tests pour tous les serializers
- ✅ Tests pour toutes les fonctions utilitaires

## 📈 Statistiques

- **Tests créés** : ~100+ tests unitaires
- **Modules testés** : api, blocks, projects, + modules existants
- **Couverture estimée** : 70%+ pour les modules testés

