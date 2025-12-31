# Tests E2E avec Playwright

## Structure des tests

Les tests sont organisés par domaine fonctionnel :

- `auth/` - Tests d'authentification
  - `login.spec.ts` - Tests de connexion de base
  - `waf-errors.spec.ts` - Tests pour vérifier l'absence d'erreurs WAF
  - `authentication-flow.spec.ts` - Tests du flux d'authentification complet

- `admin/` - Tests de l'interface d'administration
  - `editor.spec.ts` - Tests de l'éditeur de pages
  - `editor-contact.spec.ts` - Tests spécifiques pour l'éditeur de la page contact
  - `pages-public.spec.ts` - Tests de la gestion des pages publiques
  - `dashboard.spec.ts` - Tests du tableau de bord
  - Et autres...

## Exécution des tests

### Tous les tests
```bash
cd frontend
npm run test:e2e
```

### Tests en mode UI (recommandé pour le développement)
```bash
npm run test:e2e:ui
```

### Tests en mode headed (avec navigateur visible)
```bash
npm run test:e2e:headed
```

### Tests en mode debug
```bash
npm run test:e2e:debug
```

### Tests spécifiques
```bash
# Tests d'authentification uniquement
npx playwright test e2e/auth

# Tests WAF uniquement
npx playwright test e2e/auth/waf-errors.spec.ts

# Tests de l'éditeur contact uniquement
npx playwright test e2e/admin/editor-contact.spec.ts
```

### Voir le rapport
```bash
npm run test:e2e:report
```

## Tests WAF

Les tests dans `auth/waf-errors.spec.ts` vérifient spécifiquement :
- ✅ Aucune erreur WAF lors de la connexion
- ✅ Gestion gracieuse des erreurs 403 sans détection WAF incorrecte
- ✅ Pas de redirection vers login après authentification réussie
- ✅ Maintien de l'authentification après rechargement de page
- ✅ Gestion de multiples tentatives de connexion sans erreurs WAF

## Tests d'authentification

Les tests dans `auth/authentication-flow.spec.ts` vérifient :
- ✅ Flux d'authentification complet
- ✅ Persistance du token et de l'utilisateur
- ✅ Gestion des erreurs d'authentification
- ✅ Maintien de l'authentification lors de la navigation
- ✅ Rafraîchissement du token sans erreurs

## Tests de l'éditeur

Les tests dans `admin/editor-contact.spec.ts` vérifient :
- ✅ Ouverture de l'éditeur de page contact sans erreurs
- ✅ Affichage de l'interface d'édition
- ✅ Pas de redirection vers login
- ✅ Chargement des données sans erreurs WAF
- ✅ Opérations de sauvegarde sans erreurs
- ✅ Navigation entre pages sans perte d'authentification

## Configuration

La configuration Playwright se trouve dans `playwright.config.ts`.

### Variables d'environnement

- `PLAYWRIGHT_BASE_URL` - URL de base pour les tests (défaut: `http://localhost:9494`)
- `CI` - Mode CI (active les retries et désactive le parallélisme)

### Credentials de test

Les credentials de test sont définis dans `fixtures.ts` :
- Super admin: `admin@vtcbuilder.com` / `admin123`
- Tenant user: `test@delhomme.ovh` / `tenant123`

⚠️ **Important**: Assurez-vous que ces utilisateurs existent dans votre base de données de test.

## Dépannage

### Les tests échouent avec des erreurs de timeout
- Vérifiez que le frontend est bien démarré sur `http://localhost:9494`
- Vérifiez que le backend est accessible
- Augmentez le timeout dans `playwright.config.ts` si nécessaire

### Les tests échouent avec des erreurs WAF
- Vérifiez les logs du backend pour voir si le WAF bloque réellement les requêtes
- Vérifiez la configuration du WAF dans le backend
- Vérifiez que les credentials de test sont corrects

### Les tests échouent avec des erreurs d'authentification
- Vérifiez que les utilisateurs de test existent dans la base de données
- Vérifiez que les credentials dans `fixtures.ts` sont corrects
- Vérifiez que le backend accepte les requêtes depuis `localhost:9494`

## CI/CD

Les tests peuvent être exécutés en CI avec :
```bash
CI=true npm run test:e2e
```

En mode CI, les tests :
- S'exécutent avec retries (2 tentatives)
- S'exécutent en série (1 worker)
- Génèrent des traces pour les échecs
- Génèrent des screenshots pour les échecs
- Génèrent des vidéos pour les échecs
