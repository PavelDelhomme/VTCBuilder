# Tests Complets Authentification / PATCH / WAF

Ce document décrit les tests automatisés complets pour vérifier le fonctionnement de l'authentification, des requêtes PATCH, du refresh de token et du WAF.

## 📋 Tests Inclus

### 1. Tests d'Authentification
- ✅ Login et récupération des tokens
- ✅ Vérification des tokens (access et refresh)
- ✅ Permissions super admin

### 2. Tests de Requêtes PATCH
- ✅ PATCH avec token valide
- ✅ Vérification du header Authorization
- ✅ PATCH après refresh de token
- ✅ Préservation du header Authorization après refresh

### 3. Tests de Refresh de Token
- ✅ Refresh de token manuel
- ✅ Refresh automatique lors d'un token expiré
- ✅ Nouveau token fonctionnel après refresh

### 4. Tests WAF (Web Application Firewall)
- ✅ Limites de taux pour utilisateur non authentifié
- ✅ Limites de taux pour utilisateur authentifié
- ✅ Vérification que les utilisateurs authentifiés ont plus de requêtes autorisées

### 5. Tests End-to-End
- ✅ Scénario complet : Login → PATCH → Refresh → PATCH
- ✅ Requêtes multiples avec refresh automatique
- ✅ Vérification des headers dans toutes les requêtes

## 🚀 Exécution des Tests

### Option 1 : Script de Vérification Complète (Recommandé)

```bash
./verify_auth_patch_complete.sh
```

Ce script :
1. Vérifie que les services Docker sont démarrés
2. Analyse les logs backend
3. Teste l'API directement avec curl
4. Exécute les tests Playwright
5. Vérifie les logs finaux

### Option 2 : Tests Playwright Seulement

```bash
./run_auth_patch_tests.sh
```

### Option 3 : Tests Playwright Manuels

```bash
cd frontend
npm run test:e2e e2e/auth-patch-waf.spec.ts
```

### Option 4 : Tests avec Interface Graphique

```bash
cd frontend
npm run test:e2e:ui
```

## ⚙️ Configuration

### Variables d'Environnement

Les tests utilisent ces variables (avec valeurs par défaut) :

```bash
export TEST_EMAIL="admin@vtcbuilder.com"
export TEST_PASSWORD="admin123"
export NEXT_PUBLIC_API_URL="http://localhost:9495/api"
export FRONTEND_URL="http://localhost:9494"
```

### Prérequis

1. **Services Docker démarrés** :
   ```bash
   docker-compose up -d
   ```

2. **Dépendances frontend installées** :
   ```bash
   cd frontend
   npm install
   ```

3. **Playwright installé** :
   ```bash
   cd frontend
   npx playwright install chromium
   ```

## 📊 Résultats Attendus

### Tests API Directs
- ✅ Login : HTTP 200 avec tokens
- ✅ PATCH avec token : HTTP 200 ou 201
- ✅ PATCH sans token : HTTP 401 ou 403
- ✅ PATCH après refresh : HTTP 200 ou 201

### Tests Playwright
- ✅ Tous les tests doivent passer
- ✅ Aucune erreur WAF dans la console
- ✅ Toutes les requêtes PATCH doivent avoir le header Authorization
- ✅ Refresh automatique doit fonctionner

### Logs Backend
- ✅ `auth_header=present` pour les requêtes authentifiées
- ✅ Pas de `auth_header=missing` pour les requêtes après refresh
- ✅ Pas d'erreurs 403 inattendues pour les super admins

## 🔍 Diagnostic

### Si les tests échouent

1. **Vérifier les logs backend** :
   ```bash
   docker-compose logs backend --tail 100 | grep -E "PATCH|auth_header|403"
   ```

2. **Vérifier les logs frontend** :
   ```bash
   docker-compose logs frontend --tail 100
   ```

3. **Tester manuellement avec curl** :
   ```bash
   # Login
   curl -X POST http://localhost:9495/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@vtcbuilder.com","password":"admin123"}'
   
   # PATCH (remplacer TOKEN)
   curl -X PATCH http://localhost:9495/api/system-settings/ \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"public_pages":{},"public_homepage_blocks":[]}'
   ```

4. **Vérifier le WAF** :
   ```bash
   docker-compose exec backend python manage.py clear_waf_rate_limit
   ```

## 📝 Fichiers de Test

- **`frontend/e2e/auth-patch-waf.spec.ts`** : Tests Playwright complets
- **`run_auth_patch_tests.sh`** : Script d'exécution des tests
- **`verify_auth_patch_complete.sh`** : Script de vérification complète

## 🎯 Scénarios Testés

### Scénario 1 : Login Simple
1. Login avec credentials valides
2. Récupération des tokens
3. Vérification de la validité des tokens

### Scénario 2 : PATCH avec Token
1. Login
2. Requête PATCH avec token
3. Vérification du succès (200/201)

### Scénario 3 : Refresh de Token
1. Login
2. Refresh du token
3. PATCH avec nouveau token
4. Vérification du succès

### Scénario 4 : Refresh Automatique
1. Login dans le navigateur
2. Navigation vers une page qui fait des PATCH
3. Vérification que le refresh automatique fonctionne
4. Vérification que les PATCH suivants ont le header Authorization

### Scénario 5 : WAF et Rate Limiting
1. Test de rate limiting pour utilisateur non authentifié
2. Test de rate limiting pour utilisateur authentifié
3. Vérification que les utilisateurs authentifiés ont plus de requêtes autorisées

## ✅ Checklist de Validation

Avant de considérer que tout fonctionne :

- [ ] Tous les tests Playwright passent
- [ ] Les tests API directs réussissent
- [ ] Les logs backend montrent `auth_header=present` pour les PATCH
- [ ] Pas d'erreurs 403 inattendues
- [ ] Le refresh automatique fonctionne
- [ ] Le header Authorization est préservé après refresh
- [ ] Le WAF ne bloque pas les utilisateurs authentifiés
- [ ] Les permissions super admin fonctionnent

## 🐛 Problèmes Connus et Solutions

### Problème : Tests échouent avec "auth_header=missing"

**Solution** : Vérifier que le code dans `frontend/src/lib/api.ts` utilise bien `AxiosHeaders` et `api.request()` pour les retries.

### Problème : WAF bloque trop de requêtes

**Solution** : Vérifier la configuration WAF dans `backend-django/security/middleware.py` et ajuster les limites pour les utilisateurs authentifiés.

### Problème : Refresh de token ne fonctionne pas

**Solution** : Vérifier que le token refresh est bien sauvegardé dans `localStorage` et que l'intercepteur axios préserve le header Authorization.

## 📚 Ressources

- [Documentation Playwright](https://playwright.dev/)
- [Documentation Axios](https://axios-http.com/)
- [Documentation Django REST Framework](https://www.django-rest-framework.org/)

