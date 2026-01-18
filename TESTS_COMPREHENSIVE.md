# 🔬 Guide des Tests Exhaustifs - Auth/PATCH/WAF

Ce document décrit la suite complète de tests exhaustifs pour valider TOUS les cas possibles d'authentification, de requêtes PATCH, de refresh de token et de WAF.

## 📋 Structure des Tests

### 1. Tests Standards (`auth-patch-waf.spec.ts`)
- Tests de base pour validation rapide
- 10 scénarios principaux
- Environ 5-10 minutes d'exécution

### 2. Tests Exhaustifs (`auth-patch-waf-comprehensive.spec.ts`)
- Tests approfondis couvrant TOUS les cas possibles
- Plus de 20 scénarios détaillés
- Diagnostics complets pour chaque étape
- Environ 15-20 minutes d'exécution

## 🎯 Cas de Test Couverts

### ✅ Cas de Succès (C1-C4)
- **C1**: Login réussi avec vérifications complètes
- **C2**: PATCH avec token valide
- **C3**: Refresh de token et nouveau token fonctionnel
- **C4**: Scénario complet Login → PATCH → Refresh → PATCH

### ❌ Cas d'Erreur (E1-E5)
- **E1**: PATCH sans token (doit échouer 401/403)
- **E2**: PATCH avec token invalide
- **E3**: PATCH avec token mal formaté (plusieurs variantes)
- **E4**: Refresh avec token invalide
- **E5**: Refresh avec token expiré

### 🔧 Cas Limites (L1-L3)
- **L1**: Vérification des headers dans les requêtes
- **L2**: PATCH avec différents formats de header (Authorization, authorization, AUTHORIZATION)
- **L3**: PATCH avec token contenant des espaces

### 🛡️ Tests WAF (W1-W3)
- **W1**: Rate limiting pour utilisateur authentifié (30 requêtes)
- **W2**: Rate limiting pour utilisateur non authentifié (50 requêtes)
- **W3**: Test de burst requests (10 requêtes simultanées)

### 🔄 Tests de Régression (R1-R3)
- **R1**: Header Authorization préservé après refresh (CAS CRITIQUE)
- **R2**: Multiple refresh successifs (3 fois)
- **R3**: PATCH immédiatement après refresh (pas de race condition)

### 🌐 Tests End-to-End (E2E1-E2E2)
- **E2E1**: Login dans le navigateur + PATCH automatique
- **E2E2**: Refresh automatique dans le navigateur avec vérification complète

## 🚀 Exécution

### Option 1: Tests Complets avec Diagnostic (Recommandé)

```bash
./run_comprehensive_tests.sh
```

Ce script :
1. ✅ Vérifie Docker et les services
2. ✅ Analyse les logs backend
3. ✅ Teste l'API directement (login, PATCH, refresh)
4. ✅ Exécute les tests Playwright standards
5. ✅ Exécute les tests Playwright exhaustifs
6. ✅ Génère un rapport détaillé

**Durée totale**: ~20-30 minutes

### Option 2: Tests Standards Seulement

```bash
cd frontend
npm run test:e2e e2e/auth-patch-waf.spec.ts
```

**Durée**: ~5-10 minutes

### Option 3: Tests Exhaustifs Seulement

```bash
cd frontend
npm run test:e2e e2e/auth-patch-waf-comprehensive.spec.ts
```

**Durée**: ~15-20 minutes

## 📊 Diagnostics et Rapports

### Rapport Généré Automatiquement

Le script `run_comprehensive_tests.sh` génère :
- `test-results-YYYYMMDD_HHMMSS.log` : Logs complets
- `test-report-YYYYMMDD_HHMMSS.md` : Rapport Markdown détaillé

### Rapport Playwright HTML

```bash
cd frontend
npm run test:e2e:report
```

### Analyse des Logs Backend

```bash
# Voir les dernières requêtes PATCH
docker-compose logs backend --tail 200 | grep "PATCH.*system-settings"

# Voir les erreurs d'authentification
docker-compose logs backend --tail 200 | grep "auth_header=missing\|403\|401"

# Voir les refresh de tokens
docker-compose logs backend --tail 200 | grep "auth/refresh"
```

## 🔍 Diagnostic des Échecs

### Si un test échoue

1. **Consulter le rapport généré**
   ```bash
   cat test-report-*.md
   ```

2. **Vérifier les logs Playwright**
   ```bash
   cd frontend
   cat test-results/*/test.log
   ```

3. **Vérifier les logs backend en temps réel**
   ```bash
   docker-compose logs -f backend | grep -E "PATCH|auth_header|403"
   ```

4. **Tester manuellement avec curl**
   ```bash
   # Login
   TOKEN=$(curl -s -X POST http://localhost:9495/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@vtcbuilder.com","password":"admin123"}' \
     | grep -o '"access":"[^"]*' | cut -d'"' -f4)
   
   # PATCH
   curl -v -X PATCH http://localhost:9495/api/system-settings/ \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"public_pages":{},"public_homepage_blocks":[]}'
   ```

### Codes d'Erreur Courants

| Code | Signification | Solution |
|------|---------------|----------|
| 401 | Unauthorized | Token manquant ou expiré |
| 403 | Forbidden | Permissions insuffisantes ou WAF |
| 429 | Too Many Requests | Rate limiting activé |
| 500 | Internal Server Error | Problème backend |

## 📈 Métriques et KPIs

Les tests exhaustifs vérifient :

### Authentification
- ✅ Taux de succès du login: 100%
- ✅ Validité des tokens: 100%
- ✅ Format JWT correct: 100%

### Requêtes PATCH
- ✅ Taux de succès avec token valide: 100%
- ✅ Présence du header Authorization: 100%
- ✅ Taux de succès après refresh: 100%

### Refresh de Token
- ✅ Taux de succès du refresh: 100%
- ✅ Nouveau token fonctionnel: 100%
- ✅ Header préservé après refresh: 100%

### WAF
- ✅ Utilisateurs authentifiés: >50% de succès sur 30 requêtes
- ✅ Utilisateurs non authentifiés: Rate limiting actif
- ✅ Burst requests: Gestion correcte

## 🎯 Checklist de Validation

Avant de considérer que tout fonctionne :

- [ ] Tous les tests standards passent
- [ ] Tous les tests exhaustifs passent
- [ ] Login fonctionne à 100%
- [ ] PATCH avec token valide fonctionne
- [ ] Refresh de token fonctionne
- [ ] PATCH après refresh fonctionne
- [ ] Header Authorization toujours présent
- [ ] Pas d'erreur 403 inattendue
- [ ] WAF ne bloque pas les utilisateurs authentifiés
- [ ] Rate limiting fonctionne pour non authentifiés
- [ ] Tests E2E dans le navigateur fonctionnent

## 🔧 Maintenance

### Ajouter un Nouveau Test

1. Ouvrir `auth-patch-waf-comprehensive.spec.ts`
2. Ajouter un nouveau test dans la catégorie appropriée
3. Utiliser `logger.log()` pour le diagnostic
4. Ajouter la description dans ce document

### Mettre à Jour les Credentials

```bash
export TEST_EMAIL="nouveau@email.com"
export TEST_PASSWORD="nouveau_password"
```

### Ajuster les Timeouts

Modifier dans `playwright.config.ts`:
```typescript
timeout: 120 * 1000, // 2 minutes
```

## 📚 Références

- [Documentation Playwright](https://playwright.dev/)
- [Documentation Axios](https://axios-http.com/)
- [JWT.io](https://jwt.io/) - Pour décoder les tokens
- `DIAGNOSTIC_403.md` - Guide de diagnostic des erreurs 403

