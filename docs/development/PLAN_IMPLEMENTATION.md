# 📋 PLAN D'IMPLÉMENTATION COMPLET - VTCBuilder

**Date de création** : 2025-11-27  
**Objectif** : Implémenter toutes les fonctionnalités manquantes selon STATUS.md

---

## 🎯 Objectifs

1. ✅ Corriger tous les tests backend (36 échoués, 2 erreurs)
2. 💳 Intégration Stripe complète (paiements, abonnements, webhooks)
3. 📝 Éditeur WordPress-like complet (blocs, drag & drop, code HTML/CSS)
4. 📋 Système de formulaires intégré dans l'éditeur
5. 🌓 Mode sombre/clair (détection auto + toggle manuel)
6. 🧪 Tests frontend complets
7. 📊 Mise à jour STATUS.md

---

## Phase 1 : CORRECTION DES TESTS BACKEND 🔴 CRITIQUE

### 1.1 Tests tenant-specific (pages, services, bookings, media)
**Problème** : Besoin de `tenant_context` et schémas PostgreSQL  
**Solution** :
- Créer fixtures tenant avec schémas dans setUp
- Utiliser `tenant_context` pour toutes les opérations
- Créer Domain pour chaque tenant de test

### 1.2 Tests Tenant model
**Problème** : Slug non auto-généré dans tests  
**Solution** :
- Générer slug explicitement avec `slugify()` dans tests
- Vérifier logique auto-génération dans modèle

### 1.3 Tests méthodes manquantes
**Problème** : `is_active()`, `is_trial()` déjà implémentées, tests à corriger

**Fichiers à corriger** :
- `backend-django/tenants/tests/test_models.py`
- `backend-django/pages/tests/test_models.py`
- `backend-django/services/tests/test_models.py`
- `backend-django/bookings/tests/test_models.py`
- `backend-django/media/tests/test_models.py`
- `backend-django/billing/tests/test_views.py`

---

## Phase 2 : INTÉGRATION STRIPE COMPLÈTE 💳

### 2.1 Backend - Services Stripe
**Fichiers à créer/modifier** :
- `backend-django/billing/stripe_service.py` - Service Stripe
- `backend-django/billing/webhooks.py` - Webhooks Stripe
- `backend-django/billing/views.py` - Endpoints paiement

**Fonctionnalités** :
- ✅ Créer client Stripe
- ✅ Créer subscription Stripe
- ✅ Gérer payment intents
- ✅ Webhooks (subscription.updated, invoice.paid, etc.)
- ✅ Annuler/Reactiver abonnements
- ✅ Gérer payment methods

### 2.2 Frontend - Interface Paiement
**Fichiers à créer/modifier** :
- `frontend/src/app/dashboard/billing/checkout/page.tsx` - Page checkout
- `frontend/src/components/payment/StripeCheckout.tsx` - Composant Stripe
- `frontend/src/services/stripe.service.ts` - Service Stripe frontend

**Fonctionnalités** :
- ✅ Formulaire de paiement avec Stripe Elements
- ✅ Sélection plan tarifaire
- ✅ Gestion payment methods
- ✅ Affichage factures
- ✅ Historique paiements

### 2.3 Webhooks Stripe
**Endpoint** : `POST /api/billing/webhooks/stripe/`  
**Événements gérés** :
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`
- `payment_intent.succeeded`

---

## Phase 3 : ÉDITEUR WORDPRESS-LIKE 📝

### 3.1 Backend - API Blocs
**Fichiers à créer/modifier** :
- `backend-django/blocks/serializers.py` - Serializers blocs
- `backend-django/blocks/views.py` - ViewSets blocs
- `backend-django/blocks/validators.py` - Validateurs
- `backend-django/blocks/utils.py` - Utilitaires (sanitization)

**Endpoints** :
```
GET    /api/blocks/types/              # Types de blocs disponibles
POST   /api/pages/{id}/blocks/         # Ajouter bloc
PUT    /api/pages/{id}/blocks/{id}/    # Modifier bloc
DELETE /api/pages/{id}/blocks/{id}/    # Supprimer bloc
POST   /api/pages/{id}/blocks/reorder/ # Réorganiser
```

### 3.2 Frontend - Éditeur de Blocs
**Fichiers à créer** :
- `frontend/src/components/blocks/BlockEditor.tsx` - Éditeur principal
- `frontend/src/components/blocks/BlockPalette.tsx` - Palette de blocs
- `frontend/src/components/blocks/BlockRenderer.tsx` - Renderer
- `frontend/src/components/blocks/BlockEditorPanel.tsx` - Panel d'édition
- `frontend/src/components/blocks/types/` - Types de blocs (Text, Image, Video, etc.)
- `frontend/src/services/blocks.service.ts` - Service API

**Fonctionnalités** :
- ✅ Drag & drop pour réorganiser
- ✅ Ajouter blocs depuis palette
- ✅ Éditer blocs en cliquant
- ✅ Prévisualisation temps réel
- ✅ Mode responsive (mobile/tablet/desktop)
- ✅ Bloc Code (HTML/CSS/JS)

### 3.3 Types de Blocs à Implémenter
1. **Text** - Texte enrichi (WYSIWYG)
2. **Image** - Upload et gestion images
3. **Video** - YouTube, Vimeo, upload
4. **Button** - Boutons avec liens
5. **Code** - HTML/CSS/JS personnalisé
6. **Gallery** - Galerie d'images
7. **Columns** - Layout colonnes
8. **Spacer** - Espacement
9. **Divider** - Séparateur
10. **Embed** - Iframes
11. **Form** - Formulaires (Phase 4)

---

## Phase 4 : SYSTÈME DE FORMULAIRES 📋

### 4.1 Backend - Modèles Formulaires
**Fichiers à créer** :
- `backend-django/forms/models.py` - Modèles Formulaire, Champ, Soumission
- `backend-django/forms/serializers.py`
- `backend-django/forms/views.py`

**Modèles** :
- `Form` - Formulaire (nom, champs, paramètres)
- `FormField` - Champ de formulaire (type, label, validation)
- `FormSubmission` - Soumission (données, statut)

### 4.2 Frontend - Constructeur de Formulaires
**Fichiers à créer** :
- `frontend/src/components/forms/FormBuilder.tsx` - Constructeur
- `frontend/src/components/forms/FormFieldEditor.tsx` - Éditeur champ
- `frontend/src/components/forms/FormPreview.tsx` - Prévisualisation
- `frontend/src/components/blocks/types/FormBlock.tsx` - Bloc formulaire

**Types de champs** :
- Text, Textarea, Email, Tel
- Select, Radio, Checkbox
- Date, Time, Number
- File Upload
- Hidden

### 4.3 Intégration dans Éditeur
- Ajouter bloc "Form" dans palette
- Sélectionner formulaire existant ou créer nouveau
- Afficher formulaire sur page publique
- Gérer soumissions dans interface tenant

---

## Phase 5 : MODE SOMBRE/CLAIR 🌓

### 5.1 Backend
- Aucun changement nécessaire (préférence utilisateur côté frontend)

### 5.2 Frontend
**Fichiers à créer/modifier** :
- `frontend/src/hooks/useTheme.ts` - Hook gestion thème
- `frontend/src/context/ThemeContext.tsx` - Context thème
- `frontend/src/components/ThemeToggle.tsx` - Toggle bouton
- Modifier tous les composants pour supporter dark mode

**Fonctionnalités** :
- ✅ Détection automatique thème système
- ✅ Toggle manuel
- ✅ Persistance dans localStorage
- ✅ Classes Tailwind dark: pour tous composants

---

## Phase 6 : TESTS FRONTEND 🧪

### 6.1 Exécuter Tests
```bash
cd frontend && npm install && npm test
```

### 6.2 Corriger Erreurs
- Analyser résultats
- Corriger tests échoués
- Ajouter tests manquants

### 6.3 Tests à Créer
- Tests composants éditeur
- Tests Stripe integration
- Tests formulaires
- Tests mode sombre

---

## Phase 7 : DOCUMENTATION 📊

### 7.1 Mise à jour STATUS.md
- ✅ Marquer tâches complétées
- ✅ Ajouter nouvelles fonctionnalités
- ✅ Mettre à jour progression

### 7.2 Documentation Technique
- Guide utilisation éditeur
- Guide intégration Stripe
- Guide création formulaires

---

## Ordre d'Exécution

1. **Phase 1** - Correction tests (critique pour stabilité)
2. **Phase 2** - Stripe (nécessaire pour monétisation)
3. **Phase 3** - Éditeur (core feature)
4. **Phase 4** - Formulaires (extension éditeur)
5. **Phase 5** - Mode sombre (UX)
6. **Phase 6** - Tests frontend (qualité)
7. **Phase 7** - Documentation (finalisation)

---

## Estimation Temps

- Phase 1 : 2-3h
- Phase 2 : 4-5h
- Phase 3 : 8-10h
- Phase 4 : 4-5h
- Phase 5 : 2-3h
- Phase 6 : 2-3h
- Phase 7 : 1h

**Total estimé** : ~25-30h de développement

---

**Dernière mise à jour** : 2025-11-27

