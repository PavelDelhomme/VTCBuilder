# Guide des Commandes Make

Ce guide répertorie toutes les commandes `make` disponibles pour gérer la qualité et les tests du projet.

## 🚀 Installation

```bash
make setup          # Installation complète (dépendances + pre-commit)
make install        # Alias pour setup
```

## 🧪 Tests

### Tous les Tests

```bash
make test                    # Tous les tests (frontend + backend)
make test-coverage          # Tests avec couverture complète
```

### Tests par Type

```bash
make test-unit              # Tests unitaires uniquement
make test-integration       # Tests d'intégration uniquement
make test-e2e              # Tests E2E (Playwright)
```

### Tests par Composant

```bash
make test-frontend          # Tests frontend uniquement
make test-backend           # Tests backend uniquement
make frontend-test-watch    # Tests frontend en mode watch
```

## ✨ Qualité Complète

```bash
make quality                # Qualité complète (analyse + tests)
make quality-frontend       # Qualité frontend
make quality-backend        # Qualité backend
```

## 🔍 Analyse (Sans Tests)

```bash
make analyze                # Analyse complète (sans tests)
make analyze-frontend       # Analyse frontend
make analyze-backend       # Analyse backend
```

## 🔧 Linting

```bash
make lint                   # Linter tout (frontend + backend)
make lint-frontend         # Linter frontend
make lint-backend          # Linter backend
make frontend-lint-fix      # Corriger automatiquement ESLint
```

## 🎨 Formatage

```bash
make format                 # Formater tout (frontend + backend)
make format-frontend       # Formater frontend
make format-backend        # Formater backend
make backend-format-imports # Trier les imports backend
```

## 📘 Vérification des Types

```bash
make type-check            # Vérifier TypeScript frontend
make type-check-frontend   # Alias
```

## 🧹 Utilitaires

```bash
make check                 # Vérification rapide
make clean                 # Nettoyer les fichiers temporaires
make help                  # Afficher l'aide complète
```

## 📋 Exemples d'Usage

### Workflow Complet

```bash
# 1. Installation
make setup

# 2. Qualité complète
make quality

# 3. Avant un commit
make lint format type-check
```

### Développement Frontend

```bash
# Tests en mode watch
make frontend-test-watch

# Qualité frontend
make quality-frontend

# Formatage automatique
make format-frontend
```

### Développement Backend

```bash
# Tests unitaires uniquement
make backend-test-unit

# Qualité backend
make quality-backend

# Formatage automatique
make format-backend
```

### CI/CD

```bash
# Pour CI/CD, utiliser les commandes complètes
make test-coverage         # Tests avec couverture
make analyze              # Analyse sans tests (plus rapide)
```

## 🎯 Commandes Recommandées

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

## 📚 Voir Aussi

- `docs/tests/README-TESTS.md` - Documentation complète des tests
- `docs/tests/QUICK-START-TESTS.md` - Guide de démarrage rapide

