# 🚀 Guide de Démarrage Rapide - Tests et Qualité

## Installation

```bash
# Installer toutes les dépendances
./scripts/setup-quality.sh
```

## Commandes Rapides

### Frontend

```bash
cd frontend

# Analyse complète
npm run analyze

# Qualité complète (avec corrections)
npm run quality:fix

# Tests uniquement
npm test
```

### Backend

```bash
cd backend-django

# Analyse complète
make analyze

# Qualité complète
make quality

# Tests uniquement
make test
```

### Global (depuis la racine)

```bash
# Analyse complète (frontend + backend)
make analyze-all

# Tests complets
make test-all

# Qualité complète
make quality-all
```

## Vérification Rapide

```bash
# Vérification rapide de la qualité
./scripts/check-quality.sh

# Exécuter tous les tests
./scripts/run-all-tests.sh
```

## Pre-commit Hooks

```bash
# Installer les hooks
pip install pre-commit
pre-commit install

# Tester les hooks
pre-commit run --all-files
```

## Structure des Tests

### Frontend
- `frontend/tests/unit/` - Tests unitaires
- `frontend/tests/integration/` - Tests d'intégration
- `frontend/e2e/` - Tests E2E avec Playwright

### Backend
- `backend-django/tests/unit/` - Tests unitaires
- `backend-django/tests/integration/` - Tests d'intégration

## Documentation Complète

Voir `README-TESTS.md` pour la documentation complète.

