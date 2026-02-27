# Rapports de tests

Tous les rapports sont **enregistrés** dans le projet. Aucun rapport n’est supprimé automatiquement.

## Emplacements des rapports

| Commande | Rapport | Emplacement |
|----------|---------|-------------|
| `make test-frontend` | Tous les tests Jest (sortie silencieuse) | `test-results/frontend.json` |
| `make test-editor` | Tests éditeur (Jest, sortie silencieuse) | `test-results/editor.json` |
| `make test-e2e` | Playwright E2E (HTML) | `frontend/playwright-report/index.html` |
| `make test-e2e` | Playwright E2E (JSON) | `test-results/e2e.json` |
| `make test-backend` | Tests pytest (JUnit XML) | `test-results/backend.xml` |
| `make test-api` | Tests des endpoints API | `test-results/api.json` |
| `make frontend-test-coverage` | Couverture Jest (tout le frontend) | `frontend/coverage/` (HTML: `lcov-report/index.html`) |
| `make test-reports` | Tests éditeur + couverture frontend | `test-results/editor.json` + `frontend/coverage/` |
| `make tests` / `make test-all` | Suite complète (test + test-reports + test-api + test-e2e) | Tous les rapports dans `test-results/` |
| `make backend-test` | pytest | Sortie console + `test-results/backend.xml` |
| `make test-coverage` | Couverture globale | `frontend/coverage/` + `backend-django/htmlcov/` |

## Générer tous les rapports (tests + couverture)

```bash
make test-reports
```

Génère :
- `test-results/editor.json` (résumé des tests éditeur)
- `frontend/coverage/` (couverture du frontend)

Pour inclure aussi les E2E et leur rapport HTML :

```bash
make test-e2e
# Puis ouvrir frontend/playwright-report/index.html
```

## Consulter les rapports

### Rapport éditeur (Jest JSON)
```bash
cat test-results/editor.json | jq '{passed: .numPassedTests, failed: .numFailedTests, total: .numTotalTests}'
```

### Rapport frontend complet (Jest JSON)
```bash
cat test-results/frontend.json | jq '{passed: .numPassedTests, failed: .numFailedTests, total: .numTotalTests}'
```

### Rapport API (JSON)
```bash
cat test-results/api.json | jq '.summary'
```

### Rapport backend (JUnit XML)
```bash
# Analyser avec un outil JUnit ou un script
cat test-results/backend.xml
```

### Rapport E2E Playwright (HTML)
```bash
cd frontend && npx playwright show-report
```
Ou ouvrir directement : `frontend/playwright-report/index.html`

### Couverture frontend
Ouvrir `frontend/coverage/lcov-report/index.html` dans un navigateur.

## Détails

- **Tests éditeur** : `make test-editor` exécute les tests Jest ciblés avec sortie silencieuse et écrit `test-results/editor.json`.
- **Tests frontend** : `make test-frontend` exécute tous les tests Jest et écrit `test-results/frontend.json`.
- **Tests backend** : `make test-backend` exécute pytest et écrit `test-results/backend.xml` (JUnit).
- **Tests API** : `make test-api` exécute les tests d’endpoints et écrit `test-results/api.json`.
- **E2E** : `make test-e2e` démarre la stack si besoin, applique les migrations, configure l’env de test, lance Playwright et enregistre le rapport dans `frontend/playwright-report/` et `test-results/e2e.json`.
- **Couverture** : `make frontend-test-coverage` lance tous les tests Jest du frontend avec couverture et enregistre dans `frontend/coverage/`.
