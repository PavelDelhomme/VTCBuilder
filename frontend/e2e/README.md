# Tests E2E Playwright

Ce répertoire contient tous les tests end-to-end (E2E) pour VTCBuilder utilisant Playwright.

## Structure

```
e2e/
├── fixtures.ts              # Fixtures partagées (utilisateurs de test)
├── auth/                    # Tests d'authentification
│   └── login.spec.ts
├── admin/                   # Tests des pages admin
│   ├── dashboard.spec.ts
│   ├── users.spec.ts
│   ├── tenants.spec.ts
│   ├── billing.spec.ts
│   ├── pages-public.spec.ts
│   ├── editor.spec.ts
│   ├── settings.spec.ts
│   ├── stats.spec.ts
│   ├── blocks.spec.ts
│   ├── templates.spec.ts
│   └── projects.spec.ts
├── dashboard/               # Tests du dashboard tenant (à venir)
└── public/                  # Tests des pages publiques (à venir)
```

## Installation

```bash
# Dans le conteneur frontend
docker exec vtcbuilder-frontend sh -c "cd /app && npm install -D @playwright/test playwright"
docker exec vtcbuilder-frontend sh -c "cd /app && npx playwright install chromium --with-deps"
```

## Exécution

### Depuis le conteneur Docker

```bash
# Tous les tests
make test-e2e

# Ou directement
bash scripts/frontend/run_playwright_tests.sh
```

### Depuis l'hôte (si Playwright est installé localement)

```bash
cd frontend
npx playwright test
```

### Tests spécifiques

```bash
# Un seul fichier
npx playwright test e2e/auth/login.spec.ts

# Un seul test
npx playwright test e2e/auth/login.spec.ts -g "should login as super admin"
```

## Rapports

Les rapports HTML sont générés dans `playwright-report/` :

```bash
# Voir le rapport
cd frontend
npx playwright show-report
```

## Configuration

La configuration se trouve dans `playwright.config.ts` :
- Base URL : `http://localhost:9494` (ou `http://frontend:3000` dans Docker)
- Timeout : 30 secondes par test
- Navigateurs : Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari

## Utilisateurs de test

Les fixtures définissent deux utilisateurs :
- **Super Admin** : `admin@vtcbuilder.com` / `admin123`
- **Tenant User** : `test@delhomme.ovh` / `tenant123`

## Notes

- Les tests nécessitent que le frontend et le backend soient en cours d'exécution
- Certains tests peuvent nécessiter des données de test dans la base de données
- Les tests sont conçus pour être idempotents (peuvent être exécutés plusieurs fois)

