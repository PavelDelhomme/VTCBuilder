# 🚀 Guide Rapide - Commandes Make

## Installation

```bash
make setup
```

Cette commande installe :
- ✅ Dépendances frontend (npm)
- ✅ Dépendances backend (pip)
- ✅ Pre-commit hooks

## Commandes Essentielles

### 🧪 Tests

```bash
make test              # TOUS les tests (frontend + backend)
make test-unit         # Tests unitaires uniquement
make test-integration  # Tests d'intégration uniquement
make test-e2e         # Tests E2E (Playwright)
make test-coverage    # Tests avec couverture
```

### ✨ Qualité Complète

```bash
make quality           # Qualité complète (analyse + tests)
make quality-frontend  # Qualité frontend
make quality-backend   # Qualité backend
```

### 🔍 Analyse (Sans Tests)

```bash
make analyze          # Analyse complète (sans tests)
make analyze-frontend # Analyse frontend
make analyze-backend  # Analyse backend
```

### 🔧 Linting & Formatage

```bash
make lint              # Linter tout
make format            # Formater tout
make type-check        # Vérifier TypeScript
```

## Workflow Recommandé

### Avant un Commit

```bash
make lint format type-check test
```

### Avant un Push

```bash
make quality
```

### Après un Pull

```bash
make setup test
```

## Voir Toutes les Commandes

```bash
make help
```

## Documentation Complète

- [docs/COMMANDES.md](./COMMANDES.md) - Guide complet avec exemples
- [docs/tests/README-TESTS.md](./tests/README-TESTS.md) - Documentation des tests

