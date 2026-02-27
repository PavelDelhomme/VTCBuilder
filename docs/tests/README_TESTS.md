# 🧪 Guide Complet des Tests - VTCBuilder

## 🎯 Objectif

Ce système de tests unitaires couvre **TOUT** :
- ✅ Chaque service frontend
- ✅ Chaque composant/widget frontend  
- ✅ Chaque modèle backend
- ✅ Chaque vue/endpoint API backend
- ✅ Chaque fonction utilitaire

## 🚀 Commandes Disponibles

### Tester tout le projet
```bash
make test
```
Exécute tous les tests frontend + backend

### Tester uniquement le frontend
```bash
make test-frontend
# ou
cd frontend && npm test
```

### Tester uniquement le backend
```bash
make test-backend
# ou
cd backend-django && make test
```

### Tests avec couverture de code
```bash
make test-coverage
```
Génère des rapports de couverture HTML dans `htmlcov/` et `coverage/`

## 📁 Structure des Tests

### Frontend Tests
```
frontend/src/__tests__/
├── services/
│   ├── auth.service.test.ts      ✅
│   ├── user.service.test.ts      ✅
│   ├── tenant.service.test.ts    ⏳ À créer
│   ├── billing.service.test.ts   ⏳ À créer
│   ├── page.service.test.ts      ⏳ À créer
│   └── ...
├── components/
│   ├── AdminSidebar.test.tsx     ✅
│   ├── AdminLayout.test.tsx      ⏳ À créer
│   ├── Sidebar.test.tsx          ⏳ À créer
│   └── ...
└── utils/
    └── ...
```

### Backend Tests
```
backend-django/
├── tenants/tests/
│   ├── test_models.py            ✅
│   ├── test_views.py             ✅
│   └── test_serializers.py       ⏳ À créer
├── billing/tests/
│   ├── test_models.py            ⏳ À créer
│   └── test_views.py             ⏳ À créer
└── ...
```

## 📝 Exemples de Tests Créés

### ✅ Frontend - Service (auth.service.test.ts)
- Test login/logout
- Test register
- Test gestion tokens
- Test vérification rôles

### ✅ Frontend - Composant (AdminSidebar.test.tsx)
- Test rendu du composant
- Test interaction boutons
- Test navigation
- Test fermeture drawer

### ✅ Backend - Modèle (test_models.py)
- Test création tenant/user
- Test propriétés (is_active, is_trial)
- Test soft delete
- Test tokens (reset password, invitation)

### ✅ Backend - Vue API (test_views.py)
- Test endpoints authentification
- Test CRUD tenants
- Test permissions super admin
- Test actions (suspend, activate, delete)

## 🔧 Comment Créer de Nouveaux Tests

### Pour un Service Frontend

```typescript
// frontend/src/__tests__/services/mon-service.test.ts
import monService from '@/services/mon-service'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('MonService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all items', async () => {
      const mockData = [{ id: 1, name: 'Item 1' }]
      ;(api.get as jest.Mock).mockResolvedValue({ data: mockData })
      
      const result = await monService.getAll()
      
      expect(api.get).toHaveBeenCalledWith('/endpoint/')
      expect(result).toEqual(mockData)
    })
  })
})
```

### Pour un Composant Frontend

```typescript
// frontend/src/__tests__/components/MonComposant.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import MonComposant from '@/components/MonComposant'

describe('MonComposant', () => {
  it('should render correctly', () => {
    render(<MonComposant />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('should handle clicks', () => {
    const onClick = jest.fn()
    render(<MonComposant onClick={onClick} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
```

### Pour un Modèle Backend

```python
# backend-django/mon_app/tests/test_models.py
import pytest
from mon_app.models import MonModele

@pytest.mark.django_db
@pytest.mark.model
class TestMonModele:
    def test_create_instance(self):
        instance = MonModele.objects.create(name='Test')
        assert instance.name == 'Test'
    
    def test_method(self):
        instance = MonModele.objects.create(name='Test')
        assert instance.ma_methode() == 'expected_result'
```

### Pour une Vue API Backend

```python
# backend-django/mon_app/tests/test_views.py
import pytest
from rest_framework.test import APIClient
from django.urls import reverse

@pytest.mark.django_db
@pytest.mark.api
class TestMonViewSet:
    @pytest.fixture
    def api_client(self):
        return APIClient()
    
    def test_list_endpoint(self, api_client):
        url = reverse('mon-viewset-list')
        response = api_client.get(url)
        assert response.status_code == 200
```

## ✅ Checklist des Tests à Créer

### Frontend Services (10 services)
- [x] auth.service.test.ts
- [x] user.service.test.ts
- [x] tenant.service.test.ts
- [x] billing.service.test.ts
- [x] page.service.test.ts
- [x] service.service.test.ts
- [x] booking.service.test.ts
- [x] media.service.test.ts
- [x] template.service.test.ts
- [x] settings.service.test.ts

### Frontend Components (11 composants)
- [x] AdminSidebar.test.tsx
- [x] AdminLayout.test.tsx
- [x] TenantLayout.test.tsx
- [x] Sidebar.test.tsx
- [x] MobileHeader.test.tsx
- [x] ResponsiveTable.test.tsx
- [x] ImpersonationBanner.test.tsx
- [x] Navbar.test.tsx
- [x] PublicHeader.test.tsx
- [x] PublicFooter.test.tsx
- [x] PublicLayout.test.tsx

### Backend Modèles
- [x] tenants/tests/test_models.py
- [x] billing/tests/test_models.py
- [x] pages/tests/test_models.py
- [x] services/tests/test_models.py
- [x] bookings/tests/test_models.py
- [x] media/tests/test_models.py

### Backend Serializers
- [x] tenants/tests/test_serializers.py

### Backend Vues/API
- [x] tenants/tests/test_views.py
- [x] billing/tests/test_views.py
- [x] pages/tests/test_views.py
- [x] services/tests/test_views.py
- [x] bookings/tests/test_views.py
- [x] media/tests/test_views.py
- [x] api/tests/test_views.py

## 📊 Couverture de Code

Le système est configuré pour maintenir une couverture minimale de **70%**.

Vérifier la couverture :
```bash
make test-coverage
```

Les rapports sont générés dans :
- Frontend : `frontend/coverage/`
- Backend : `backend-django/htmlcov/`

## 🎯 Prochaines Étapes

1. ✅ Système de tests configuré
2. ✅ Tous les tests créés (services, composants, modèles, vues, serializers)
3. ⏳ Exécuter `make test` régulièrement
4. ⏳ Maintenir la couverture > 70%

## ✅ Statut d'Implémentation

**TOUS LES TESTS ONT ÉTÉ CRÉÉS !**

- ✅ 10 tests de services frontend
- ✅ 11 tests de composants frontend
- ✅ 6 tests de modèles backend
- ✅ 1 test de serializers backend
- ✅ 7 tests de vues/API backend

**Total : 35+ fichiers de tests unitaires créés !**

### Tests E2E (Playwright)

- **Commande** : `make test-e2e` (depuis la racine) ou `cd frontend && npm run test:e2e`
- **Prérequis** : stack démarrée (`make start`), environnement de test backend configuré (`cd backend-django && make setup-test-env`). Voir [ENVIRONNEMENT-TESTS.md](./ENVIRONNEMENT-TESTS.md) et [frontend/e2e/README.md](../frontend/e2e/README.md).
- **CI** : le workflow GitHub `quality.yml` inclut un job `e2e-playwright` qui lance les tests E2E après les jobs frontend et backend (base de test dédiée, backend et frontend démarrés dans le job).

## 📚 Documentation

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [pytest Documentation](https://docs.pytest.org/)
- [pytest-django](https://pytest-django.readthedocs.io/)

