# Documentation des Tests

Cette section contient toute la documentation relative aux tests et à l'analyse de code.

## Fichiers disponibles

- **README-TESTS.md** - Documentation complète des tests (unitaires, intégration)
- **ENVIRONNEMENT-TESTS.md** - Environnement et base de données de tests, `make test`, E2E
- **RAPPORTS-TESTS.md** - Emplacement et consultation des rapports (Jest, Playwright, couverture)
- **ETAT-TESTS.md** - Où on en est : résumé, commandes, correctifs récents

## Commandes principales

- **`make test`** : tous les tests unitaires et d'intégration (frontend Jest + backend pytest). Pas besoin de démarrer la stack.
- **`make test-e2e`** : tests E2E Playwright (stack démarrée + BDD de test configurée). Voir [ENVIRONNEMENT-TESTS.md](./ENVIRONNEMENT-TESTS.md).
- **`make test-all`** : `make test` puis `make test-e2e` (validation complète).

## Navigation

- [Documentation complète](./README_TESTS.md)
- [Environnement et BDD de test](./ENVIRONNEMENT-TESTS.md)
- [Rapports (où sont enregistrés les rapports)](./RAPPORTS-TESTS.md)
- [État des tests (où on en est)](./ETAT-TESTS.md)
- [Tests E2E frontend](../frontend/e2e/README.md)

