# 🏗️ Infrastructure Complète de Tests et d'Analyse

## 📁 Structure Complète

```
VTCBuilder/
├── frontend/
│   ├── .prettierrc.json          # Configuration Prettier
│   ├── .prettierignore           # Fichiers ignorés par Prettier
│   ├── .eslintignore             # Fichiers ignorés par ESLint
│   ├── eslint.config.js          # Configuration ESLint moderne
│   ├── tsconfig.strict.json      # TypeScript strict
│   ├── scripts/
│   │   └── analyze.sh            # Script d'analyse frontend
│   └── tests/
│       ├── unit/                 # Tests unitaires
│       │   ├── components/      # Tests composants
│       │   ├── services/         # Tests services
│       │   ├── hooks/            # Tests hooks
│       │   └── utils/            # Tests utilitaires
│       ├── integration/         # Tests d'intégration
│       └── fixtures/             # Données de test
│
├── backend-django/
│   ├── pyproject.toml            # Black, isort, pytest, mypy
│   ├── .flake8                   # Configuration Flake8
│   ├── .pylintrc                 # Configuration Pylint
│   ├── scripts/
│   │   └── analyze.sh           # Script d'analyse backend
│   └── tests/
│       ├── unit/                 # Tests unitaires
│       │   ├── models/          # Tests modèles
│       │   ├── views/           # Tests vues
│       │   ├── serializers/      # Tests sérialiseurs
│       │   └── utils/            # Tests utilitaires
│       ├── integration/          # Tests d'intégration
│       │   ├── api/             # Tests API
│       │   └── workflows/       # Tests workflows
│       └── fixtures/            # Données de test
│
├── scripts/
│   ├── setup-quality.sh          # Installation infrastructure
│   ├── check-quality.sh          # Vérification rapide
│   └── run-all-tests.sh          # Exécution tous tests
│
├── .github/
│   └── workflows/
│       └── quality.yml           # CI/CD GitHub Actions
│
├── .pre-commit-config.yaml       # Pre-commit hooks
├── Makefile                      # Commandes globales
├── README-TESTS.md               # Documentation complète
└── QUICK-START-TESTS.md          # Guide démarrage rapide
```

## 🎯 Outils Configurés

### Frontend

| Outil | Usage | Commande |
|-------|------|----------|
| **TypeScript** | Vérification de types | `npm run type-check` |
| **ESLint** | Analyse de code | `npm run lint` |
| **Prettier** | Formatage | `npm run format` |
| **Jest** | Tests unitaires | `npm test` |
| **Playwright** | Tests E2E | `npm run test:e2e` |

### Backend

| Outil | Usage | Commande |
|-------|------|----------|
| **Black** | Formatage | `make format` |
| **isort** | Tri imports | `make format-imports` |
| **Flake8** | Linting | `make lint` |
| **Pylint** | Analyse statique | `make lint-pylint` |
| **mypy** | Vérification types | `make lint-mypy` |
| **pytest** | Tests unitaires | `make test` |

## 🚀 Commandes Principales

### Installation

```bash
# Installer toute l'infrastructure
./scripts/setup-quality.sh
```

### Frontend

```bash
cd frontend

# Analyse complète
npm run analyze

# Qualité complète
npm run quality

# Tests
npm test
npm run test:coverage
```

### Backend

```bash
cd backend-django

# Analyse complète
make analyze

# Qualité complète
make quality

# Tests
make test
make test-coverage
```

### Global

```bash
# Depuis la racine
make analyze-all      # Analyse frontend + backend
make test-all         # Tests frontend + backend
make quality-all      # Qualité complète
```

## 📊 Couverture de Code

### Frontend
- **Seuil minimum**: 70% (branches, functions, lines, statements)
- **Génération**: `npm run test:coverage`
- **Rapport**: `frontend/coverage/`

### Backend
- **Génération**: `make test-coverage`
- **Rapport**: `backend-django/htmlcov/`

## 🔒 Pre-commit Hooks

Les hooks vérifient automatiquement :
- Formatage (Black, Prettier)
- Linting (Flake8, ESLint)
- Tri des imports (isort)
- Fichiers YAML/JSON valides
- Pas de conflits de merge

**Installation**:
```bash
pip install pre-commit
pre-commit install
```

## 🎨 Standards de Code

### Frontend
- **TypeScript**: Mode strict disponible (`tsconfig.strict.json`)
- **ESLint**: Règles Next.js + TypeScript
- **Prettier**: Formatage automatique avec plugin Tailwind

### Backend
- **Black**: Longueur de ligne 100
- **isort**: Compatible avec Black
- **Flake8**: Max complexity 10
- **Pylint**: Configuration adaptée Django

## 📝 Exemples de Tests

### Frontend - Composant

```typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Backend - Modèle

```python
import pytest
from django.test import TestCase

@pytest.mark.unit
class TestMyModel(TestCase):
    def test_model_creation(self):
        obj = MyModel.objects.create(name="Test")
        self.assertEqual(obj.name, "Test")
```

## 🔧 Dépannage

### Frontend

```bash
# Nettoyer le cache
rm -rf .next node_modules/.cache

# Réinstaller
rm -rf node_modules && npm install
```

### Backend

```bash
# Nettoyer Python
find . -type d -name __pycache__ -exec rm -r {} +
find . -type f -name "*.pyc" -delete

# Réinstaller
pip install -r requirements.txt
```

## 📚 Documentation

- **Complète**: `README-TESTS.md`
- **Démarrage rapide**: `QUICK-START-TESTS.md`
- **Frontend**: `frontend/tests/README.md`
- **Backend**: `backend-django/tests/README.md`

## ✅ Checklist de Vérification

- [x] ESLint configuré
- [x] Prettier configuré
- [x] TypeScript strict disponible
- [x] Jest configuré
- [x] Playwright configuré
- [x] Black configuré
- [x] Flake8 configuré
- [x] Pylint configuré
- [x] mypy configuré
- [x] pytest configuré
- [x] Pre-commit hooks configurés
- [x] Scripts d'analyse créés
- [x] Exemples de tests fournis
- [x] Documentation complète

## 🎓 Prochaines Étapes

1. **Exécuter l'installation**: `./scripts/setup-quality.sh`
2. **Vérifier la qualité**: `./scripts/check-quality.sh`
3. **Exécuter les tests**: `./scripts/run-all-tests.sh`
4. **Installer pre-commit**: `pre-commit install`
5. **Commencer à écrire des tests** dans les dossiers `tests/`

