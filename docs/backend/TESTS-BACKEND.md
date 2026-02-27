# 🧪 Tests Backend (Django / pytest)

Guide des tests unitaires et d’intégration du backend VTCBuilder.

## Structure

```
backend-django/
├── api/tests/
├── blocks/tests/
├── projects/tests/
├── tenants/tests/
├── pages/tests/
├── services/tests/
├── bookings/tests/
├── media/tests/
├── billing/tests/
└── tests/
    ├── api/test_all_endpoints.py   # Script de test de tous les endpoints API
    └── integration/
```

## Exécution

### Depuis la racine du projet

```bash
make test-backend    # Tous les tests pytest + rapport test-results/backend.xml
make test-api       # Tests des endpoints API (script) + rapport test-results/api.json
```

### Depuis backend-django

```bash
cd backend-django
make test           # pytest avec JUnit XML → ../test-results/backend.xml
make test-api       # python tests/api/test_all_endpoints.py → ../test-results/api.json
make test-unit      # pytest -m unit
make test-integration  # pytest -m integration
```

### Avec Docker (conteneur backend déjà démarré)

```bash
docker exec vtcbuilder-backend pytest -v
docker exec vtcbuilder-backend pytest api/tests/ -v
docker exec vtcbuilder-backend pytest -m api -v
docker exec vtcbuilder-backend pytest --cov=. --cov-report=html
```

## Rapports

- **JUnit XML** : `test-results/backend.xml` (généré par `make test-backend` ou `make test`)
- **API JSON** : `test-results/api.json` (généré par `make test-api`)

## Référence

Documentation déplacée depuis `backend-django/TESTS_README.md`. Voir aussi [docs/tests/README.md](../tests/README.md) pour la vue d’ensemble des tests (frontend + backend + E2E).
