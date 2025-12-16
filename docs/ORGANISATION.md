# Organisation du Projet

## Structure de la Racine

La racine du projet ne contient que les fichiers essentiels :

### Fichiers de Configuration
- `.gitignore` - Fichiers ignorés par Git
- `.dockerignore` - Fichiers ignorés par Docker
- `.env.example` - Exemple de fichier d'environnement
- `.pre-commit-config.yaml` - Configuration des pre-commit hooks

### Docker
- `docker-compose.yml` - Configuration Docker Compose principale
- `docker-compose.django.yml` - Configuration Django
- `docker-compose.playwright.yml` - Configuration Playwright
- `docker-compose.prod.yml` - Configuration production
- `docker-compose.simple.yml` - Configuration simplifiée

### Documentation Principale
- `README.md` - Documentation principale du projet
- `Makefile` - Commandes globales du projet
- `start.sh` - Script de démarrage

### Roadmaps et Status
- `BLOCKS_ROADMAP.md` - Roadmap des blocs
- `CHECKLIST_BLOCKS_ROADMAP.md` - Checklist des blocs
- `STATUS.md` - Statut du projet

## Organisation des Dossiers

### Documentation (`docs/`)
- `docs/tests/` - Documentation des tests
- `docs/development/` - Documentation de développement
- `docs/architecture/` - Documentation d'architecture
- `docs/configuration/` - Documentation de configuration

### Scripts (`scripts/`)
- `scripts/tools/` - Scripts Python utilitaires
- `scripts/backend/` - Scripts backend
- `scripts/frontend/` - Scripts frontend
- `scripts/utils/` - Scripts utilitaires

### Tests (`tests/`)
- Tests globaux du projet

### Backend (`backend-django/`)
- Code Django complet
- Tests dans `backend-django/tests/`

### Frontend (`frontend/`)
- Code Next.js/React complet
- Tests dans `frontend/tests/`

## Règles d'Organisation

1. **Racine** : Seulement les fichiers essentiels listés ci-dessus
2. **Documentation** : Tous les fichiers `.md` de documentation dans `docs/`
3. **Scripts** : Tous les scripts dans `scripts/` avec sous-dossiers appropriés
4. **Tests** : Tests organisés dans `tests/` ou dans les dossiers `frontend/tests/` et `backend-django/tests/`

