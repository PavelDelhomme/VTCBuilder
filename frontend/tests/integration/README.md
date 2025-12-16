# Tests d'Intégration Frontend

Les tests d'intégration vérifient que plusieurs composants fonctionnent ensemble correctement.

## Structure

```
integration/
├── editor.test.tsx        # Tests de l'éditeur complet
├── api.test.ts            # Tests des appels API
└── workflows.test.tsx      # Tests des workflows utilisateur
```

## Exécution

```bash
# Tous les tests d'intégration
npm test -- integration

# Un fichier spécifique
npm test -- integration/editor.test.tsx
```

