# État du projet – À suivre en priorité

**Fichier de référence à la racine** : ce document résume ce qui s’est passé, à quoi ça sert, où on en est et quoi faire maintenant.

---

## Où on en est (dernière mise à jour)

### Tests

- **`make tests`** (ou **`make test-all`**) : lance **toute** la suite sans s’arrêter au premier échec. Chaque étape écrit son rapport dans **`test-results/`** :
  - `test` → frontend (Jest) + backend (pytest) → `test-results/frontend.json`, `test-results/backend.xml`
  - `test-reports` → éditeur + couverture frontend → `test-results/editor.json`, `frontend/coverage/`
  - `test-api` → endpoints API → `test-results/api.json`
  - `test-e2e` → Playwright → `test-results/e2e.json`, `frontend/playwright-report/`
- Les tests frontend qui échouaient (auth.service, media.service, mocks, ThemeProvider, BlockPreview) ont été corrigés pour alignement avec le code actuel.
- **Rapports** : tout est dans **`test-results/`** (voir `test-results/README.md`). Format par type : JSON (Jest, API, Playwright) et JUnit XML (pytest).

### Documentation

- **Backend** : `BILLING_README.md`, `FEATURES_MANAGEMENT.md`, `TESTS_README.md` dans `backend-django/` pointent vers **`docs/backend/`** (BILLING.md, FEATURES.md, TESTS-BACKEND.md). Le détail reste dans `docs/backend/`.
- **Racine** : ce **STATUS.md** est le point d’entrée pour “quoi faire maintenant”. Les autres .md de suivi (plan, phases, validation) sont listés plus bas.

---

## À faire maintenant (priorité immédiate)

1. **Lancer la suite de tests**  
   ```bash
   make tests
   ```  
   Puis ouvrir **`test-results/`** et les rapports (frontend.json, editor.json, backend.xml, api.json, e2e.json) pour voir ce qui échoue encore, le cas échéant.

2. **Corriger les échecs**  
   Utiliser les rapports dans `test-results/` pour corriger les tests ou le code. Les tests backend tournent dans le conteneur (pytest, test_all_endpoints.py).

3. **Subdivision / refacto**  
   Si tu reprends la subdivision de l’éditeur ou le refactoring, suivre les docs listées dans “Documents de suivi” ci‑dessous.

---

## Documents de suivi (à la racine et dans docs/)

À consulter selon le besoin :

| Fichier | Rôle |
|--------|------|
| **STATUS.md** (ce fichier) | Point d’entrée : état actuel, quoi faire maintenant |
| **README.md** | Présentation du projet, commandes principales (dont `make tests`) |
| **REFACTORING_PLAN.md** | Plan de refactoring global |
| **PHASES_VALIDATION.md** | Phases de validation |
| **VALIDATION_WORKFLOW.md** | Workflow de validation |
| **SUBDIVISION_STATUS.md** | État de la subdivision des fichiers éditeur |
| **RESULTATS_TESTS.md** | Résultats / synthèse des tests (si tenu à jour) |
| **docs/tests/README.md** | Vue d’ensemble des tests (frontend, backend, E2E, rapports) |
| **docs/tests/ETAT-TESTS.md** | État détaillé des tests et commandes |
| **docs/tests/RAPPORTS-TESTS.md** | Où sont les rapports et comment les utiliser |
| **docs/backend/BILLING.md** | Facturation (ex‑BILLING_README) |
| **docs/backend/FEATURES.md** | Gestion des fonctionnalités (ex‑FEATURES_MANAGEMENT) |
| **docs/backend/TESTS-BACKEND.md** | Tests backend (ex‑TESTS_README) |

---

## Commandes utiles

```bash
make tests           # Suite complète (tous les rapports dans test-results/)
make test            # Frontend Jest + backend pytest uniquement
make test-editor     # Tests éditeur (sortie silencieuse)
make test-reports    # Rapports éditeur + couverture frontend
make test-api        # Tests des endpoints API
make test-e2e        # E2E (stack + Playwright)
make test-results-list   # Lister le contenu de test-results/
```

---

**En résumé** : pour savoir “quoi faire maintenant”, lire ce STATUS.md et lancer `make tests` ; pour le détail des tests et rapports, utiliser `docs/tests/` et `test-results/README.md`.
