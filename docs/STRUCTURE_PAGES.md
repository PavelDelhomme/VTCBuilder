# Structure des Pages dans VTCBuilder

## Vue d'ensemble

VTCBuilder utilise deux types de pages :

### 1. Pages Publiques (SystemSettings)
**Projet** : `VTCBuilder - Site Public` (vtcbuilder-public-site)  
**Stockage** : `SystemSettings.public_homepage_blocks` et `SystemSettings.public_pages`  
**Accès** : Tous les visiteurs du site public VTCBuilder

### 2. Pages Tenant
**Projet** : `{Tenant Name} - Site Principal` (ex: `test-starter-site`)  
**Stockage** : Table `pages` dans le schéma du tenant  
**Accès** : Visiteurs du site du tenant spécifique

---

## Structure des Pages Publiques

### Page d'Accueil (Home)
- **Slug** : `home`
- **Stockage** : `SystemSettings.public_homepage_blocks` (pas dans `public_pages`)
- **URL** : `/` (racine du site)
- **Description** : Page principale du site public VTCBuilder

### Pages Principales
Pages au niveau racine (pas de sous-dossier) :

1. **Contact** (`contact`)
   - URL : `/contact`
   - Description : Page de contact

2. **Documentation** (`docs`)
   - URL : `/docs`
   - Description : Documentation du produit

3. **FAQ** (`faq`)
   - URL : `/faq`
   - Description : Questions fréquentes

4. **Fonctionnalités** (`features`)
   - URL : `/features`
   - Description : Liste des fonctionnalités

5. **Modèles de Sites** (`templates`)
   - URL : `/templates`
   - Description : Galerie de modèles

### Sous-pages (Pages Hiérarchiques)
Pages avec un slug contenant `/` (sous-dossier) :

1. **Conditions Générales de Vente** (`legal/terms`)
   - URL : `/legal/terms`
   - Parent : `home` (Page d'accueil)
   - Description : CGV du service

2. **Politique de Confidentialité** (`legal/privacy`)
   - URL : `/legal/privacy`
   - Parent : `home` (Page d'accueil)
   - Description : Politique de confidentialité

### Structure Hiérarchique Actuelle

```
home (Page d'accueil)
├── legal/terms (Conditions Générales de Vente)
└── legal/privacy (Politique de Confidentialité)

contact (Contact)
docs (Documentation)
faq (FAQ)
features (Fonctionnalités)
templates (Modèles de Sites)
```

---

## Structure des Pages Tenant

Chaque tenant a ses propres pages dans son schéma de base de données :

### Exemple : Test Starter
- **Projet** : `Test Starter - Site Principal`
- **Pages** :
  - `accueil` (Page d'accueil du tenant)
  - `services` (Nos Services)
  - `contact` (Contact)

### Identifiants Uniques

**Solution implémentée** : Utilisation d'un identifiant composite `tenant_id:page_id` pour référencer les pages tenant dans `ProjectPage` :
- **Format** : `{tenant_id}:{page_id}`
- **Exemple** : `3:1` = Page ID 1 du tenant ID 3
- **Avantage** : Identifiant unique global, même si plusieurs tenants ont des pages avec le même ID local

**Migration** : Les anciennes références (format simple `page_id`) sont automatiquement migrées vers le nouveau format lors de l'exécution de `migrate_tenant_page_references`.

**Compatibilité** : Le code gère les deux formats (ancien et nouveau) pour assurer la rétrocompatibilité.

---

## Distinction Projets

### Projet Système (VTCBuilder - Site Public)
- **ID** : Variable (chercher `is_system_project=True`)
- **Slug** : `vtcbuilder-public-site`
- **Tenant** : `null` (pas de tenant)
- **Pages** : Pages publiques uniquement
- **URL** : `http://localhost:9494/` (ou domaine public)

### Projets Tenant
- **ID** : Variable
- **Slug** : `{tenant-slug}-site`
- **Tenant** : Référence au tenant propriétaire
- **Pages** : Pages tenant uniquement
- **URL** : `http://{tenant-domain}/` (ex: `http://test-starter.localhost/`)

---

## Règles de Nommage

### Pages Publiques
- **Homepage** : Toujours `home`, stockée dans `public_homepage_blocks`
- **Autres pages** : Slug simple (ex: `contact`, `docs`) ou hiérarchique (ex: `legal/terms`)
- **Pas de duplication** : `home` ne doit PAS être dans `public_pages` si `public_homepage_blocks` existe

### Pages Tenant
- **Homepage** : Généralement `accueil` ou `home`
- **Autres pages** : Slugs libres selon les besoins du tenant
- **Pas de conflit** : Chaque tenant a son propre schéma, donc pas de conflit de slugs entre tenants

---

## Bonnes Pratiques

1. **Ne jamais dupliquer `home`** : Si `public_homepage_blocks` existe, ne pas ajouter `home` dans `public_pages`
2. **Hiérarchie claire** : Utiliser `/` dans les slugs pour les sous-pages (ex: `legal/terms`)
3. **Identifiants uniques** : Pour les pages tenant, utiliser `tenant_id:page_id` dans `ProjectPage.page_slug`
4. **Séparation claire** : Ne jamais mélanger pages publiques et tenant dans le même projet

