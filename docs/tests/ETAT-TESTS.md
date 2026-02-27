# État des tests – Où on en est

Dernière mise à jour : suite aux correctifs E2E, rapports, bruit console, et cibles `make tests` / `test-api`.

## Commande principale : tout lancer

```bash
make tests
```

**Alias de `make test-all`** : enchaîne dans l’ordre :
1. **make test** – tests unitaires et d’intégration (frontend Jest + backend pytest)
2. **make test-reports** – rapports (tests éditeur + couverture frontend)
3. **make test-api** – tests des endpoints API (postgres/redis/backend démarrés si besoin)
4. **make test-e2e** – E2E Playwright (stack + migrations + env test + rapport)

À lancer régulièrement pour vérifier que tout fonctionne (ex. avant un push).

## Résumé des cibles

| Commande | Effet | Rapports |
|----------|--------|----------|
| **make tests** | = make test-all (tout) | Voir ci-dessous |
| **make test-all** | test + test-reports + test-api + test-e2e | test-results/*.json, *.xml, coverage/, playwright-report/ |
| **make test** | Frontend Jest + backend pytest | Console |
| **make test-editor** | Tests éditeur uniquement (sortie silencieuse) | test-results/editor.json |
| **make test-reports** | test-editor + couverture frontend | test-results/editor.json + frontend/coverage/ |
| **make test-api** | Tests des endpoints API (backend doit être démarrable) | Console |
| **make test-e2e** | E2E autonome (stack + migrations + Playwright) | frontend/playwright-report/ |
| **make test-coverage** | Couverture frontend + backend | frontend/coverage/, backend-django/htmlcov/ |

## Ce qui a été corrigé

1. **Sortie console des tests éditeur**  
   `make test-editor` utilise maintenant l’option Jest **`--silent`** : plus de flood console (blockTypes, loadBlockTypes, etc.).

2. **E2E « Backend non prêt »**  
   `make test-e2e` : démarrage postgres/redis → attente Postgres → démarrage backend → **migrations Django** → attente API (120 s max) → setup_test_environment → frontend → Playwright.

3. **Rapports enregistrés**  
   Tous les rapports sont persistés (voir [RAPPORTS-TESTS.md](./RAPPORTS-TESTS.md)).

4. **Alias make tests**  
   `make tests` = `make test-all` pour lancer tous les tests existants.

5. **make test-api**  
   Cible dédiée aux tests des endpoints API (backend-django, via conteneur).

## Prérequis E2E

- **Première fois** : `make build` puis `make test-e2e` (ou `make tests`).
- **Ensuite** : `make test-e2e` ou `make tests` suffit (démarre les conteneurs si besoin, migrations, env test, Playwright).

## Commandes rapides

```bash
make tests         # Tout : test + test-reports + test-api + test-e2e (à lancer avant push)
make test-all      # Idem que make tests
make test-editor   # Tests éditeur, sortie silencieuse, rapport JSON
make test-reports  # Tests éditeur + couverture frontend (rapports enregistrés)
make test-api      # Tests des endpoints API (démarre backend si besoin)
make test-e2e      # E2E autonome (stack + migrations + Playwright)
make test          # Tous les tests unitaires/intégration (sans E2E ni rapports)
```

Voir [RAPPORTS-TESTS.md](./RAPPORTS-TESTS.md) pour le détail des emplacements et [ENVIRONNEMENT-TESTS.md](./ENVIRONNEMENT-TESTS.md) pour l’environnement et la BDD de test.
