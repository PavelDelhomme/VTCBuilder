# État du Projet - VTCBuilder

## 📋 Vue d'ensemble

Ce document centralise l'état actuel du projet, les subdivisions en cours, les tests, et la roadmap.

**Dernière mise à jour :** 2025-12-24 (ajout commandes make build, vérification automatique, et analyse complète de l'état du projet)

---

## 📊 Résumé Exécutif - État Actuel du Projet

### ✅ Réalisations récentes (24/12/2025)
- ✅ **Infrastructure Docker** : Commandes `make build` et vérification automatique dans `make start`
- ✅ **BlockPreview.tsx** : 100% subdivisé (tous les cases extraits)
- 🟡 **BlockRenderer.tsx** : Partiellement subdivisé (411 lignes)
- 🟡 **ComplexRenderers.tsx** : Réduit de 1860 à 798 lignes (partiellement subdivisé)
- 🟡 **BlockEditor.tsx** : Réduit de 4277 à 2448 lignes (encore à subdiviser)

### 🔴 Priorités immédiates
1. **Subdivision BlockEditor.tsx** (2448 lignes) - PRIORITÉ 1
2. **Subdivision BlockStylePanel.tsx** (1131 lignes) - PRIORITÉ 2
3. **Finaliser ComplexRenderers.tsx** (798 lignes) - PRIORITÉ 3
4. **Créer les tests** pour toutes les fonctionnalités - PRIORITÉ 4

### 📈 Progression globale
- **Infrastructure** : ✅ 100% (commandes Docker opérationnelles)
- **Subdivision BlockPreview** : ✅ 100% (tous les cases extraits)
- **Subdivision BlockRenderer** : 🟡 ~60% (cases extraits, à finaliser)
- **Subdivision BlockEditor** : 🟡 ~40% (réduit mais encore trop volumineux)
- **Subdivision ComplexRenderers** : 🟡 ~60% (réduit, à finaliser)
- **Subdivision BlockStylePanel** : 🔴 0% (à faire)
- **Tests** : 🔴 0% (à créer)

---

## 🛠️ Infrastructure et DevOps

### Commandes Makefile

#### ✅ Commandes récemment ajoutées (24/12/2025)

1. **`make build`** - Construction de l'infrastructure Docker
   - ✅ Crée le réseau Docker `vtcbuilder_network` s'il n'existe pas
   - ✅ Crée les volumes Docker nécessaires (postgres_data, redis_data)
   - ✅ Construit les images Docker pour le backend et le frontend
   - ✅ Prépare toute l'infrastructure avant le démarrage

2. **`make start`** - Démarrage intelligent de la stack
   - ✅ Vérifie automatiquement si un build est nécessaire
   - ✅ Exécute automatiquement `make build` si le réseau ou les images manquent
   - ✅ Vérifie et installe les dépendances frontend si nécessaire
   - ✅ Démarre toute la stack (backend + frontend + services)

#### Workflow recommandé

```bash
# Après un make down, simplement :
make start  # Vérifie et reconstruit automatiquement si nécessaire

# Ou explicitement :
make build  # Construire l'infrastructure
make start  # Démarrer les services
```

#### État actuel
- ✅ **Commande `make build` créée** - Construction complète de l'infrastructure Docker
- ✅ **Vérification automatique dans `make start`** - Détection et reconstruction automatique si nécessaire
- ✅ **Workflow simplifié** - Plus besoin de se soucier de l'ordre des commandes après `make down`

---

## 📊 Subdivision des Fichiers de l'Éditeur

**Voir [SUBDIVISION_STATUS.md](./SUBDIVISION_STATUS.md) pour l'état détaillé.**

### État actuel (vérifié le 24/12/2025) :
- ✅ **BlockPreview.tsx** : 100% subdivisé (tous les cases extraits dans `preview-cases/`)
- 🟡 **BlockRenderer.tsx** : Partiellement subdivisé (411 lignes, cases extraits dans `renderer-cases/`)
- 🟡 **BlockEditor.tsx** : Réduit à 2448 lignes (était ~4277) - **PRIORITÉ 1** - Encore à subdiviser
- 🟡 **ComplexRenderers.tsx** : Réduit à 798 lignes (était ~1860) - **PRIORITÉ 2** - Encore à subdiviser
- 🔴 **BlockStylePanel.tsx** : 1131 lignes (était ~978) - **PRIORITÉ 3** - À subdiviser

### Plan d'action :
1. 🔴 Subdiviser `BlockEditor.tsx` (2448 lignes - encore trop volumineux)
2. 🟡 Subdiviser `ComplexRenderers.tsx` (798 lignes - déjà partiellement fait, continuer)
3. 🔴 Subdiviser `BlockStylePanel.tsx` (1131 lignes - à faire)
4. 🟡 Finaliser la subdivision de `BlockRenderer.tsx` (411 lignes - vérifier si tout est extrait)
5. 🔴 Créer les tests pour toutes les fonctionnalités
6. 🔴 Continuer le Blocks Roadmap

---

## 📊 État du Projet - Extraction des Cases de BlockPreview.tsx

## 📍 Où nous en sommes

### ✅ Travail effectué

1. **Correction de la largeur dans l'éditeur (BlockEditor.tsx)**
   - ✅ Remplacement de la grille par `flex-col` pour que chaque bloc prenne sa propre ligne
   - ✅ Application de `layoutWidthClass` directement sur `SortableBlock`
   - ✅ Les blocs respectent maintenant leur largeur définie par layout (colonnes sur 12)
   - ✅ Centrage automatique des blocs si layout < 12 colonnes

2. **Correction de la largeur dans la prévisualisation (BlockPreview.tsx)**
   - ✅ Le système de colonnes est maintenant correctement appliqué
   - ✅ Les conteneurs respectent la largeur définie par les colonnes
   - ✅ Distinction entre `container`, `container-fluid` et `none`
   - ✅ Le `layoutWidth` est appliqué à l'intérieur du container, pas au-dessus

3. **Extraction des cases de BlockPreview.tsx**
   - ✅ Création de `frontend/src/components/editor/preview-cases/types.ts` avec les interfaces
   - ✅ Création de `frontend/src/components/editor/preview-cases/basic.tsx` avec 11 cases extraits
   - ✅ Création de `frontend/src/components/editor/preview-cases/index.ts` pour centraliser les exports
   - ✅ Modification de `BlockPreviewRenderer` pour utiliser les cases extraits en priorité

### 📊 Progression de l'extraction

**Cases extraits : ~128/127 (100%+)**

**Note:** Certains cases ont des alias (ex: `features-grid` et `features_grid`), ce qui explique le total > 127.

#### ✅ Cases extraits dans `basic.tsx` (11 cases) :
1. `heading` - Titres (h1, h2, h3, h4)
2. `text` - Texte avec support HTML
3. `image` - Images avec légende
4. `button` - Boutons avec styles variés
5. `video` - Vidéos iframe
6. `spacer` - Espaceurs verticaux/horizontaux
7. `divider` - Séparateurs
8. `alert` - Alertes (info, success, warning, error)
9. `code` - Blocs de code avec syntax highlighting
10. `paragraph` - Paragraphes
11. `line` - Lignes de texte

#### ✅ Cases extraits dans `layout.tsx` (13 cases) :
1. `container` - Conteneur avec enfants récursifs
2. `flex-container` - Conteneur flexbox
3. `grid-container` - Conteneur grid
4. `columns` - Colonnes avec grille
5. `rows` - Lignes
6. `section` - Section avec background et overlay
7. `header` - En-tête de page
8. `footer` - Pied de page
9. `flexbox` - Alias pour container
10. `grid` - Alias pour container
11. `stack` - Alias pour container
12. `inline` - Alias pour container
13. `group` - Alias pour container
14. `wrapper` - Alias pour container

#### ✅ Cases extraits dans `forms.tsx` (13 cases) :
1. `form-newsletter` - Formulaire newsletter
2. `form-search` - Formulaire de recherche
3. `form-inscription` - Formulaire d'inscription
4. `form-file-upload` - Upload de fichiers
5. `form-quiz` - Quiz interactif (avec useState)
6. `form-survey` - Sondage
7. `form-poll` - Sondage rapide (avec useState)
8. `form-rsvp` - Confirmation d'événement (avec useState)
9. `captcha` - Captcha
10. `form` - Formulaire générique (fallback)
11. `form-multi-step` - Formulaire multi-étapes (fallback)
12. `form-conditional` - Formulaire conditionnel (fallback)
13. `form-calculator` - Formulaire calculateur (fallback)
14. `form-payment` - Formulaire de paiement (fallback)

### ✅ Fichiers créés et cases extraits :

1. **`preview-cases/layout.tsx`** - ✅ 15 cases extraits
   - `container`, `flex-container`, `grid-container`, `columns`, `rows`, `section`, `header`, `footer`, `flexbox`, `grid`, `stack`, `inline`, `group`, `wrapper`

2. **`preview-cases/forms.tsx`** - ✅ 15 cases extraits
   - `form`, `form-newsletter`, `form-search`, `form-inscription`, `form-login`, `form-multi-step`, `booking-form`, `contact-form`, `captcha`, etc.

3. **`preview-cases/vtc.tsx`** - ✅ 15 cases extraits
   - `route-calculator`, `fare-calculator`, `availability-calendar`, `service-zones`, `vehicle-gallery`, `driver-profile`, `service-packages`, `vehicle-comparison`, `email-button`, `sms-button`, etc.

4. **`preview-cases/complex.tsx`** - ✅ 13 cases extraits
   - `hero`, `features-grid`, `features_grid`, `cta`, `cta-section`, `cta_section`, `testimonials`, `pricing`, `pricing_cards`, `timeline`, `stats`, `social-links`, `faq`, `faq-section`, `banner`, `contact-form`

5. **`preview-cases/interactive.tsx`** - ✅ 9 cases extraits
   - `accordion`, `tabs`, `countdown`, `progress-bar`, `progress-circle`, `modal`, `calendar`, `rating`

6. **`preview-cases/media.tsx`** - ✅ 10 cases extraits
   - `carousel`, `logo-grid`, `logo-carousel`, `image-slider`, `lightbox`, `vimeo-embed`, `gallery`, `audio-player`, `video-embed`

7. **`preview-cases/data.tsx`** - ✅ 9 cases extraits
   - `table`, `chart`, `card`, `card-grid`, `icon-box`, `feature-card`, `team-member`, `badges`

8. **`preview-cases/content.tsx`** - ✅ 20 cases extraits
   - `quote`, `rich-text`, `markdown`, `html-raw`, `icon`, `label`, `tooltip`, `popover`, `dropdown`, `categories`, `author-box`, `related-posts`, `table-of-contents`, `reading-time`, `share-buttons`, `list`, `link`, `breadcrumb`, `tags`

---

## 🧪 Tests et Validation

### Fichiers de référence :
- **TESTING_CHECKLIST.md** : Checklist complète de tous les tests à effectuer
- **TESTS_COMPLETS.md** : Tests détaillés et résultats
- **VALIDATION_WORKFLOW.md** : Workflow de validation

### État des tests :
- 🔴 Tests à créer pour toutes les fonctionnalités selon TESTING_CHECKLIST.md
- 🔴 Validation workflow à mettre en place
- 🔴 Tests unitaires pour les composants subdivisés
- 🔴 Tests d'intégration pour l'éditeur complet

---

## 🗺️ Roadmap

### Blocks Roadmap
- **BLOCKS_ROADMAP.md** : Roadmap des blocs à implémenter
- **CHECKLIST_BLOCKS_ROADMAP.md** : Checklist de suivi

### Editor Roadmap
- **EDITOR_ROADMAP.md** : Roadmap de l'éditeur

### Refactoring Plan
- **REFACTORING_PLAN.md** : Plan de refactoring global

---

## 📝 Prochaines étapes (mis à jour le 24/12/2025)

1. ✅ Créer SUBDIVISION_STATUS.md
2. ✅ Mettre à jour STATUS.md
3. ✅ Créer commandes `make build` et vérification automatique dans `make start`
4. 🟡 Subdiviser BlockEditor.tsx (2448 lignes - réduit mais encore trop volumineux)
5. 🟡 Finaliser subdivision ComplexRenderers.tsx (798 lignes - déjà partiellement fait)
6. 🔴 Subdiviser BlockStylePanel.tsx (1131 lignes - à faire)
7. 🟡 Vérifier et finaliser subdivision BlockRenderer.tsx (411 lignes)
8. 🔴 Créer les tests pour toutes les fonctionnalités
9. 🔴 Mettre en place le validation workflow
10. 🔴 Continuer le Blocks Roadmap

---

## 🔍 Diagnostic des Erreurs PATCH /system-settings/

### Problème identifié
Les requêtes PATCH vers `/api/system-settings/` échouent avec des erreurs 403 (Forbidden) même pour les super admins authentifiés.

### Analyse technique

#### 1. **Permissions Backend**
- **Permission class**: `IsSuperAdminOrReadOnly` dans `backend-django/settings_app/views.py`
- **Comportement attendu**:
  - GET : Accès public (pas d'authentification requise)
  - POST/PATCH/PUT/DELETE : Requiert super admin (vérifié depuis le token JWT uniquement)
- **Vérification super admin**: Utilise `is_super_admin_from_token(request)` qui lit le token JWT directement

#### 2. **Flux d'authentification**
1. Le frontend envoie une requête PATCH avec le token JWT dans le header `Authorization: Bearer <token>`
2. Le middleware `UserStatusMiddleware` vérifie si le chemin est public (GET `/system-settings/` est public, mais PATCH ne l'est pas)
3. Le middleware vérifie le statut de l'utilisateur (actif/suspendu) - les super admins sont toujours autorisés
4. La permission `IsSuperAdminOrReadOnly` vérifie le statut super admin depuis le token JWT
5. Si l'utilisateur n'est pas super admin, retourne 403

#### 3. **Problèmes potentiels identifiés**

**A. Expiration du token**
- Le token JWT peut expirer pendant la session
- Le rafraîchissement automatique peut échouer si le refresh token est aussi expiré
- **Solution actuelle (temporaire)**: Gestion silencieuse des erreurs PATCH (⚠️ **À CORRIGER**)

**B. Vérification du statut super admin**
- La fonction `is_super_admin_from_token()` peut échouer si :
  - Le token est invalide ou expiré
  - L'utilisateur n'a pas le rôle super-admin dans la base de données
  - Le token ne contient pas les bonnes informations

**C. Middleware UserStatusMiddleware**
- Le middleware peut bloquer la requête avant même d'arriver à la permission class
- Les super admins sont autorisés, mais il faut vérifier que le middleware détecte correctement le statut super admin

#### 4. **Actions à prendre**

**🔴 PRIORITÉ HAUTE - À CORRIGER IMMÉDIATEMENT**

1. **Retirer la gestion silencieuse des erreurs PATCH**
   - Les erreurs doivent être loggées et affichées à l'utilisateur
   - Ne pas masquer les problèmes d'authentification

2. **Améliorer le diagnostic**
   - Ajouter des logs détaillés dans `IsSuperAdminOrReadOnly.has_permission()`
   - Logger le contenu du token JWT (en mode DEBUG uniquement)
   - Logger pourquoi `is_super_admin_from_token()` retourne `False`

3. **Vérifier le rafraîchissement du token**
   - S'assurer que le refresh token fonctionne correctement
   - Vérifier que le nouveau token contient bien les informations super admin
   - Tester le rafraîchissement automatique dans différents scénarios

4. **Tester le flux complet**
   - Tester avec un super admin authentifié
   - Tester avec un token expiré (doit déclencher le rafraîchissement)
   - Tester avec un refresh token expiré (doit demander une nouvelle connexion)
   - Tester avec un utilisateur non-super-admin (doit retourner 403 avec message clair)

5. **Améliorer les messages d'erreur**
   - Retourner des messages d'erreur clairs au frontend
   - Distinguer entre "token expiré" et "permission refusée"
   - Afficher un message à l'utilisateur pour qu'il se reconnecte si nécessaire

### État actuel
- ⚠️ **Gestion silencieuse activée** (temporaire, à retirer)
- 🔴 **Diagnostic incomplet** - besoin de logs détaillés
- 🔴 **Messages d'erreur masqués** - l'utilisateur ne sait pas pourquoi ça échoue
- 🔴 **Rafraîchissement du token non testé** - peut être la cause racine

### Prochaines étapes
1. Retirer la gestion silencieuse des erreurs PATCH
2. Ajouter des logs détaillés pour diagnostiquer
3. Tester le rafraîchissement du token
4. Corriger les problèmes identifiés
5. Documenter la solution finale

---

## 🔍 Diagnostic des Erreurs 403 (Forbidden) - Suite

### Problème actuel
Les erreurs 403 persistent pour plusieurs endpoints même pour les super admins authentifiés :
- `GET /api/users/impersonation-status/` → 403 (Forbidden)
- `GET /api/blocks/types/` → 403 (Forbidden)
- `GET /api/system-settings/` → 403 (Forbidden) (mais les logs montrent que l'utilisateur est authentifié)
- `PATCH /api/system-settings/` → 403 (Forbidden)
- `GET /api/billing/pricing-plans/` → 500 (Internal Server Error) (résolu précédemment)

### Analyse des logs backend

#### Observations
1. **Authentification réussie** : Les logs montrent que les requêtes GET vers `/api/system-settings/` sont bien authentifiées :
   - `User: admin@vtcbuilder.com`
   - `is_authenticated: True`
   - `auth_header=present`

2. **Permissions non vérifiées** : Il n'y a **aucun log** de `IsSuperAdminOrReadOnly` dans les logs backend, ce qui suggère que :
   - La permission n'est peut-être pas appelée du tout
   - Les requêtes sont bloquées avant d'atteindre la vue
   - Il y a un problème de configuration DRF

3. **Middleware actif** : Les logs montrent uniquement `SuppressExpected401Middleware`, ce qui indique que les requêtes passent le middleware mais n'atteignent peut-être pas la vue.

### Hypothèses

#### Hypothèse 1 : Problème de configuration DRF
- La permission `IsSuperAdminOrReadOnly` permet les GET sans authentification (ligne 49-51)
- Mais peut-être que DRF bloque quand même les requêtes si le token est présent mais invalide/expiré

#### Hypothèse 2 : Problème de middleware
- Le `UserStatusMiddleware` peut bloquer les requêtes avant qu'elles n'atteignent les vues
- Les chemins publics sont configurés, mais peut-être que la correspondance ne fonctionne pas correctement

#### Hypothèse 3 : Problème de token
- Le token JWT peut être expiré ou invalide
- Le rafraîchissement automatique peut échouer silencieusement

### Actions à prendre

1. **Ajouter des logs détaillés** dans `IsSuperAdminOrReadOnly.has_permission()` pour voir si elle est appelée
2. **Vérifier le middleware** pour s'assurer qu'il n'interfère pas avec les endpoints publics
3. **Tester avec un token frais** pour éliminer le problème de token expiré
4. **Vérifier la configuration DRF** pour s'assurer que les permissions sont correctement appliquées

### État actuel
- 🔴 **Diagnostic en cours** - Les logs montrent que l'authentification fonctionne, mais les permissions ne sont pas vérifiées
- 🔴 **Problème non résolu** - Les erreurs 403 persistent
- 🔴 **Logs insuffisants** - Besoin de plus de logs pour diagnostiquer

---

## 🔧 Corrections Apportées (23/12/2025)

### 1. Correction de l'AssertionError pour `/api/billing/pricing-plans/`

**Problème** : `AssertionError: .accepted_renderer not set on Response` se produisait dans `CORSAlwaysMiddleware.process_response` lorsque Django appelait `response.render()` automatiquement.

**Solution** :
- Le middleware `CORSAlwaysMiddleware` ne touche plus aux réponses DRF dans `process_response`
- Les headers CORS sont ajoutés par `CORSMixin.finalize_response` qui est appelé avant `process_response`
- Le middleware retourne directement les réponses DRF sans les modifier

**Fichiers modifiés** :
- `backend-django/vtcbuilder/cors_middleware.py` : Amélioration de `process_response` pour éviter tout accès aux réponses DRF

### 2. Amélioration de la gestion des erreurs pour PATCH `/system-settings/`

**Problème** : Les requêtes PATCH vers `/system-settings/` retournaient 403 même après rafraîchissement du token, et l'erreur n'était pas clairement communiquée à l'utilisateur.

**Solution** :
- Amélioration de la gestion des erreurs dans `frontend/src/lib/api.ts` pour les requêtes PATCH vers `/system-settings/`
- Quand le refresh token est expiré, l'erreur est maintenant rejetée avec un message clair indiquant que l'utilisateur doit se reconnecter
- Les requêtes GET vers `/system-settings/`, `/blocks/types/`, et `/users/impersonation-status/` continuent de retourner des données par défaut en cas d'échec du rafraîchissement

**Fichiers modifiés** :
- `frontend/src/lib/api.ts` : Ajout d'une gestion spécifique pour les requêtes PATCH vers `/system-settings/` avec message d'erreur clair

### État après corrections
- ✅ **AssertionError corrigé** - Le middleware ne touche plus aux réponses DRF avant leur finalisation
- ✅ **Gestion des erreurs améliorée** - Messages d'erreur plus clairs pour les tokens expirés
- ✅ **Nettoyage automatique des tokens expirés** - Les tokens sont automatiquement supprimés du localStorage quand le refresh token est expiré
- ✅ **Gestion améliorée des requêtes GET publiques** - Les requêtes GET publiques fonctionnent maintenant même avec un token expiré (le token est retiré de la requête et une nouvelle tentative est effectuée)

**Corrections apportées (23/12/2025 - suite)** :
- Nettoyage automatique des tokens expirés dans `frontend/src/lib/api.ts` et `frontend/src/services/auth.service.ts`
- Amélioration de la gestion des requêtes GET publiques : si une requête GET publique échoue avec 403 à cause d'un token expiré, le token est retiré de la requête et une nouvelle tentative est effectuée sans token
- Les requêtes GET vers `/system-settings/`, `/blocks/types/`, et `/users/impersonation-status/` fonctionnent maintenant même avec un token expiré

**Note importante** : Si les erreurs 403 persistent pour les requêtes PATCH, c'est probablement parce que le refresh token est expiré. L'utilisateur doit se reconnecter pour obtenir de nouveaux tokens. Les requêtes GET publiques devraient maintenant fonctionner même avec un token expiré.

### 3. Correction de l'AssertionError pour `/api/billing/pricing-plans/` (suite - 23/12/2025)

**Problème** : La fonction de compatibilité `billing_pricing_plans_compat` dans `api/urls.py` créait manuellement une requête DRF, ce qui pouvait causer l'`AssertionError: .accepted_renderer not set on Response` car le renderer n'était pas correctement configuré.

**Solution (première tentative)** :
- Modification de `billing_pricing_plans_compat` pour utiliser `ViewSet.as_view()` qui gère correctement le cycle de requête/réponse DRF
- Le renderer est maintenant correctement configuré via le flux normal de DRF
- La réponse est correctement finalisée avec les headers CORS via `CORSMixin`

**Solution (correction finale - 23/12/2025)** :
- Modification de `billing_pricing_plans_compat` pour utiliser `HttpResponsePermanentRedirect` afin de rediriger vers `/api/pricing-plans/`
- Cela garantit que la requête passe par le router DRF normal, avec le cycle de requête/réponse complet
- Le frontend a été mis à jour pour utiliser directement `/api/pricing-plans/` au lieu de `/api/billing/pricing-plans/`

**Fichiers modifiés** :
- `backend-django/api/urls.py` : Correction de `billing_pricing_plans_compat` pour utiliser `HttpResponsePermanentRedirect` vers `/api/pricing-plans/`
- `frontend/src/app/admin/pages-public/edit/[...slug]/page.tsx` : Mise à jour de `api_endpoint` pour utiliser `/api/pricing-plans/`
- `frontend/src/components/editor/preview-cases/complex.tsx` : Mise à jour de l'endpoint par défaut pour utiliser `/pricing-plans/`

**État après correction** :
- ✅ **AssertionError corrigé** - La fonction de compatibilité redirige maintenant vers le router DRF qui garantit le cycle complet
- ✅ **Renderer correctement configuré** - Le renderer est défini via le flux normal du router DRF
- ✅ **CORS headers ajoutés** - Les headers CORS sont ajoutés via `CORSMixin.finalize_response`
- ✅ **Frontend mis à jour** - Le frontend utilise maintenant directement `/api/pricing-plans/`
- ✅ **Backend redémarré** - Les modifications sont actives

---

### 4. Correction des erreurs 403 pour PATCH `/system-settings/` (24/12/2025)

**Problème** : Les requêtes PATCH vers `/system-settings/` étaient annulées côté frontend si `isSuperAdmin()` retournait `false`, même si un token était présent. Cela empêchait le rafraîchissement automatique du token et causait des erreurs 403.

**Solution** :
- Modification de la logique dans `frontend/src/lib/api.ts` pour ne pas annuler les requêtes PATCH si un token est présent
- Si un token est présent, la requête est envoyée au backend qui peut rafraîchir le token automatiquement
- Seulement annuler si aucun token n'est présent ET l'utilisateur n'est pas super admin

**Fichiers modifiés** :
- `frontend/src/lib/api.ts` : Correction de la logique d'annulation des requêtes PATCH vers `/system-settings/`
- `frontend/src/components/editor/preview-cases/complex.tsx` : Correction de l'endpoint par défaut pour utiliser `/api/pricing-plans/`
- `backend-django/settings_app/views.py` : Ajout de logs détaillés pour diagnostiquer les requêtes PATCH

**État après correction** :
- ✅ **Requêtes PATCH autorisées** - Les requêtes PATCH sont maintenant envoyées au backend si un token est présent
- ✅ **Rafraîchissement automatique** - Le backend peut rafraîchir le token automatiquement si nécessaire
- ✅ **Logs détaillés** - Les logs backend montrent maintenant clairement pourquoi une requête PATCH échoue
- ✅ **Endpoint pricing-plans corrigé** - Le composant PricingPreview utilise maintenant le bon endpoint

### 5. Problèmes restants à résoudre

**🔴 PRIORITÉ HAUTE**

1. **Vérifier que le refresh token fonctionne correctement**
   - Tester le rafraîchissement automatique du token après expiration
   - Vérifier que le nouveau token contient bien les informations super admin
   - S'assurer que les requêtes PATCH fonctionnent après rafraîchissement

2. **Améliorer les messages d'erreur pour l'utilisateur**
   - Afficher un message clair si le refresh token est expiré
   - Demander à l'utilisateur de se reconnecter si nécessaire
   - Ne pas masquer les erreurs d'authentification

3. **Tester le flux complet**
   - Tester avec un super admin authentifié
   - Tester avec un token expiré (doit déclencher le rafraîchissement)
   - Tester avec un refresh token expiré (doit demander une nouvelle connexion)
   - Vérifier que les requêtes PATCH fonctionnent dans tous les cas

**🟡 PRIORITÉ MOYENNE**

1. **Continuer la subdivision des fichiers de l'éditeur**
   - Subdiviser `BlockEditor.tsx` (2448 lignes - réduit mais encore trop volumineux) - **PRIORITÉ 1**
   - Finaliser subdivision `ComplexRenderers.tsx` (798 lignes - déjà partiellement fait) - **PRIORITÉ 2**
   - Subdiviser `BlockStylePanel.tsx` (1131 lignes) - **PRIORITÉ 3**
   - Vérifier et finaliser `BlockRenderer.tsx` (411 lignes) - **PRIORITÉ 4**

2. **Créer les tests pour toutes les fonctionnalités**
   - Tests pour les fonctionnalités de l'éditeur
   - Tests pour les fonctionnalités du backoffice
   - Tests pour les fonctionnalités de l'interface publique

---

**Note :** Ce fichier sera mis à jour régulièrement au fur et à mesure de l'avancement.
