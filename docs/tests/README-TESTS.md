# Guide Complet des Tests et de l'Analyse de Code

Ce document décrit l'infrastructure complète de tests et d'analyse pour le projet VTCBuilder.

## 📋 Table des matières

- [Frontend](#frontend)
- [Backend](#backend)
- [Commandes globales](#commandes-globales)
- [Pre-commit Hooks](#pre-commit-hooks)
- [CI/CD](#cicd)

## 🎨 Frontend

### Structure des tests

```
frontend/
├── src/
│   └── __tests__/          # Tests existants
├── tests/                   # Nouveaux tests organisés
│   ├── unit/               # Tests unitaires
│   │   ├── components/    # Tests des composants
│   │   ├── services/       # Tests des services
│   │   ├── hooks/          # Tests des hooks
│   │   └── utils/          # Tests des utilitaires
│   ├── integration/        # Tests d'intégration
│   └── fixtures/           # Données de test
├── e2e/                    # Tests E2E avec Playwright
└── scripts/
    └── analyze.sh          # Script d'analyse complète
```

### Commandes disponibles

```bash
# Installation
cd frontend
npm install

# Analyse de syntaxe
npm run lint              # ESLint
npm run lint:fix          # ESLint avec correction automatique
npm run type-check        # Vérification TypeScript
npm run type-check:strict # Vérification TypeScript stricte

# Formatage
npm run format            # Formater avec Prettier
npm run format:check      # Vérifier le formatage

# Tests
npm test                  # Tests unitaires
npm run test:watch        # Tests en mode watch
npm run test:coverage     # Tests avec couverture
npm run test:ci           # Tests pour CI/CD

# Tests E2E
npm run test:e2e          # Tests Playwright
npm run test:e2e:ui       # Interface UI Playwright
npm run test:e2e:headed   # Tests avec navigateur visible

# Analyse complète
npm run analyze           # Analyse complète (lint + type-check + tests)
npm run quality           # Qualité complète
npm run quality:fix        # Corriger automatiquement
```

### Configuration

- **ESLint**: `.eslintrc.json` et `eslint.config.js`
- **Prettier**: `.prettierrc.json`
- **TypeScript**: `tsconfig.json` et `tsconfig.strict.json`
- **Jest**: `jest.config.js` et `jest.setup.js`
- **Playwright**: `playwright.config.ts`

## 🐍 Backend

### Structure des tests

```
backend-django/
├── tests/                 # Tests organisés
│   ├── unit/             # Tests unitaires
│   │   ├── models/       # Tests des modèles
│   │   ├── views/        # Tests des vues
│   │   ├── serializers/  # Tests des sérialiseurs
│   │   └── utils/         # Tests des utilitaires
│   ├── integration/      # Tests d'intégration
│   │   ├── api/          # Tests des endpoints API
│   │   └── workflows/    # Tests des workflows
│   └── fixtures/         # Données de test
├── scripts/
│   └── analyze.sh        # Script d'analyse complète
├── pyproject.toml        # Configuration Black, isort, pytest, mypy
├── .flake8              # Configuration Flake8
└── .pylintrc            # Configuration Pylint
```

### Commandes disponibles

```bash
# Depuis le répertoire backend-django
cd backend-django

# Analyse de syntaxe
make lint                 # Flake8
make lint-pylint         # Pylint
make lint-mypy           # Mypy (type hints)

# Formatage
make format              # Black
make format-check        # Vérifier le formatage
make format-imports      # Trier les imports (isort)

# Tests
make test                # Tous les tests
make test-unit           # Tests unitaires uniquement
make test-integration    # Tests d'intégration uniquement
make test-coverage       # Tests avec couverture

# Analyse complète
make analyze             # Analyse complète (lint + format + tests)
make quality             # Qualité complète
```

### Configuration

- **Black**: `pyproject.toml` (formatage)
- **isort**: `pyproject.toml` (tri des imports)
- **Flake8**: `.flake8` (linting)
- **Pylint**: `.pylintrc` (analyse statique)
- **mypy**: `pyproject.toml` (vérification de types)
- **pytest**: `pytest.ini` et `pyproject.toml`

## 🌐 Commandes Globales

Depuis la racine du projet :

```bash
# Analyse complète (frontend + backend)
make analyze-all

# Tests complets (frontend + backend)
make test-all

# Qualité complète (frontend + backend)
make quality-all

# Aide
make help
```

## 🔒 Pre-commit Hooks

Les pre-commit hooks vérifient automatiquement la qualité du code avant chaque commit.

### Installation

```bash
# Installer pre-commit
pip install pre-commit

# Installer les hooks
pre-commit install

# Tester les hooks
pre-commit run --all-files
```

### Hooks configurés

- **Backend**: Black, isort, Flake8
- **Frontend**: Prettier, ESLint
- **Général**: trailing-whitespace, end-of-file-fixer, check-yaml, check-json

## 🚀 CI/CD

### Frontend

Les tests frontend peuvent être intégrés dans votre pipeline CI/CD :

```yaml
# Exemple GitHub Actions
- name: Frontend Quality
  run: |
    cd frontend
    npm ci
    npm run quality
```

### Backend

Les tests backend peuvent être intégrés dans votre pipeline CI/CD :

```yaml
# Exemple GitHub Actions
- name: Backend Quality
  run: |
    cd backend-django
    make analyze
```

## 📊 Couverture de Code

### Frontend

```bash
cd frontend
npm run test:coverage
```

La couverture est générée dans `frontend/coverage/`

### Backend

```bash
cd backend-django
make test-coverage
```

La couverture est générée dans `backend-django/htmlcov/`

## 🎯 Bonnes Pratiques

### Frontend

1. **Tests unitaires** : Tester chaque composant/service isolément
2. **Tests d'intégration** : Tester les interactions entre composants
3. **Tests E2E** : Tester les flux utilisateur complets
4. **TypeScript strict** : Utiliser `npm run type-check:strict` régulièrement

### Backend

1. **Tests unitaires** : Tester chaque fonction/méthode isolément
2. **Tests d'intégration** : Tester les endpoints API complets
3. **Fixtures** : Utiliser des fixtures pour les données de test
4. **Markers pytest** : Utiliser les markers (`@pytest.mark.unit`, etc.)

## 🔧 Dépannage

### Frontend

```bash
# Nettoyer le cache
rm -rf frontend/.next frontend/node_modules/.cache

# Réinstaller les dépendances
cd frontend && rm -rf node_modules && npm install
```

### Backend

```bash
# Nettoyer le cache Python
cd backend-django
find . -type d -name __pycache__ -exec rm -r {} +
find . -type f -name "*.pyc" -delete

# Réinstaller les dépendances
pip install -r requirements.txt
```

## 📝 Exemples de Tests

Voir les fichiers d'exemple dans :
- `frontend/tests/unit/`
- `backend-django/tests/unit/`
- `backend-django/tests/integration/`

