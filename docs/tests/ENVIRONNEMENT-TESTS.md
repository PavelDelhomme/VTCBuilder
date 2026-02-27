# Environnement et base de données de tests

## Vue d'ensemble

Les tests VTCBuilder s'exécutent dans un **environnement dédié**, séparé de la production et du développement :

- **Backend** : base PostgreSQL de test (`vtcbuilder_test` en CI, ou conteneur dédié avec `make test-backend`)
- **Frontend** : tests Jest (unitaires / intégration) sans serveur ; tests E2E Playwright contre une instance démarrée (locale ou CI)
- **Données** : utilisateurs et tenants de test définis dans les fixtures / `setup_test_environment`

## Exécution des tests

### Via Make (recommandé)

Toutes les commandes ci-dessous se lancent depuis la **racine du projet**.

| Commande | Description |
|----------|-------------|
| `make test` | **Tous les tests** : frontend (Jest) + backend (pytest). Pas besoin de stack démarrée. |
| `make test-frontend` | Uniquement les tests frontend (Jest) |
| `make test-backend` | Uniquement les tests backend (pytest dans le conteneur) |
| `make test-e2e` | Tests E2E Playwright. **Nécessite la stack démarrée** (`make start`) et une BDD avec utilisateurs de test. |
| `make test-all` | `make test` puis `make test-e2e` (tests complets incluant E2E) |
| `make test-coverage` | Tests avec rapports de couverture (frontend + backend) |

### Backend : base de données de test

- **En local (Docker)** : `make test-backend` exécute pytest **dans le conteneur** backend. Le conteneur utilise la même base que le dev (ou une base dédiée selon `docker-compose` / `.env`). Les tests Django utilisent une base de test créée par pytest-django.
- **En CI** : le workflow GitHub utilise un service Postgres avec `POSTGRES_DB: vtcbuilder_test` et des variables `DB_*` pour pointer dessus. Les tests ne touchent pas à la BDD de production.

### Frontend : Jest vs Playwright

- **Jest** (`make test-frontend` ou `npm test` dans `frontend/`) : tests unitaires et d’intégration. Ils **n’exécutent pas** les specs Playwright (dossier `e2e/` est exclu via `testPathIgnorePatterns`).
- **Playwright** (`make test-e2e` ou `npm run test:e2e`) : tests E2E dans de vrais navigateurs. Ils ont besoin :
  - d’une app frontend accessible (par défaut `http://localhost:9494`) ;
  - d’un backend API accessible (ex. `http://localhost:9495`) ;
  - d’utilisateurs de test en BDD (super admin, tenant user). Voir `frontend/e2e/fixtures.ts` et `make setup-test-env` / `make load-fixtures` dans le backend.

## Préparer l’environnement pour les tests E2E

1. Démarrer la stack : `make start` (ou `make up`).
2. (Recommandé) Charger ou réinitialiser l’environnement de test backend :
   - `cd backend-django && make setup-test-env` pour créer/configurer tenants et données de test ;
   - ou `make load-fixtures` pour charger les fixtures.
3. Vérifier que les identifiants dans `frontend/e2e/fixtures.ts` existent en BDD :
   - Super admin : `admin@vtcbuilder.com` / `admin123`
   - Tenant user : `test@delhomme.ovh` / `tenant123`
4. Lancer les E2E : `make test-e2e` (ou `cd frontend && npm run test:e2e`).

## Résumé : qui lance quoi

- **`make test`** : API (backend pytest) + fonctionnalité frontend (Jest), **sans** E2E, **sans** obligation d’avoir la stack démarrée pour le frontend.
- **`make test-e2e`** : validation E2E complète du frontend (et flux API via l’UI), avec **stack démarrée** et **base de test** configurée.
- **`make test-all`** : enchaîne `make test` puis `make test-e2e` pour tout valider (y compris workflow de validation E2E).
