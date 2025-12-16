# Tests Frontend

Ce dossier contient tous les tests pour le frontend Next.js/React.

## Structure

```
tests/
├── unit/              # Tests unitaires
│   ├── components/    # Tests des composants React
│   ├── services/      # Tests des services
│   ├── hooks/         # Tests des hooks personnalisés
│   └── utils/         # Tests des utilitaires
├── integration/       # Tests d'intégration
└── fixtures/          # Données de test
```

## Commandes

```bash
# Exécuter tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage

# Tests E2E avec Playwright
npm run test:e2e

# Analyse complète (lint + type-check + tests)
npm run analyze
```

## Écriture de tests

### Exemple de test de composant

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

### Exemple de test de service

```typescript
import { apiService } from '@/services/api.service'

describe('apiService', () => {
  it('should fetch data correctly', async () => {
    const data = await apiService.get('/endpoint')
    expect(data).toBeDefined()
  })
})
```

