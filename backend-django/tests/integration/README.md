# Tests d'Intégration Backend

Les tests d'intégration vérifient que plusieurs composants Django fonctionnent ensemble.

## Structure

```
integration/
├── test_api_example.py     # Tests des endpoints API
├── test_workflows.py       # Tests des workflows complets
└── test_database.py        # Tests de la base de données
```

## Exécution

```bash
# Tous les tests d'intégration
make test-integration

# Ou avec pytest directement
pytest -m integration

# Un fichier spécifique
pytest tests/integration/test_workflows.py
```

