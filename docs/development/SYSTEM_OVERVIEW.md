# Vue d'Ensemble du Système VTCBuilder

## 🎯 Objectifs Principaux

1. **Tenant** : Gérer son site via son interface d'administration
2. **Super Admin** : Gérer les pages publiques du site VTCBuilder et le système global
3. **Impersonation** : Permettre au super admin de se connecter comme un tenant pour le support

---

## 📋 Comptes de Test

### Super Admin
- **Email** : `admin@vtcbuilder.com`
- **Mot de passe** : `admin123`
- **Dashboard** : `http://localhost:9494/admin/dashboard`

### Tenant de Démonstration
- **Email** : `demo@vtcbuilder.com`
- **Mot de passe** : `demo123`
- **Dashboard** : `http://localhost:9494/dashboard`
- **Tenant** : Demo VTC (slug: `demo-vtc`)

### Tenants de Test par Plan
- **Starter** : `test-starter@vtcbuilder.test` / `test123`
- **Business** : `test-business@vtcbuilder.test` / `test123`
- **Enterprise** : `test-enterprise@vtcbuilder.test` / `test123`

---

## 🏢 Interface Tenant (Dashboard)

**URL** : `http://localhost:9494/dashboard`

### Fonctionnalités Disponibles

1. **Pages** (`/dashboard/pages`)
   - Créer, modifier, supprimer des pages
   - Éditeur visuel de blocs
   - Publication/dépublication

2. **Services** (`/dashboard/services`)
   - Gestion des services VTC
   - Tarifs, zones, véhicules

3. **Réservations** (`/dashboard/bookings`)
   - Gestion des réservations
   - Statuts, paiements

4. **Utilisateurs** (`/dashboard/users`)
   - Gestion des utilisateurs du tenant
   - Rôles (tenant-admin, driver, operator)

5. **Templates** (`/dashboard/templates`)
   - Voir et appliquer des templates
   - Prévisualisation

6. **Facturation** (`/dashboard/billing`)
   - Voir les abonnements
   - Consulter les factures
   - Historique des paiements

7. **Paramètres** (`/dashboard/settings`)
   - Configuration du tenant
   - Branding (logo, couleurs)
   - Paramètres généraux

---

## 👑 Interface Super Admin

**URL** : `http://localhost:9494/admin/dashboard`

### Fonctionnalités Disponibles

1. **Dashboard** (`/admin/dashboard`)
   - Statistiques globales
   - Vue d'ensemble de la plateforme
   - Revenus, tenants, utilisateurs

2. **Page d'Accueil Publique** (`/admin/homepage`)
   - **Gestion de la page d'accueil du site VTCBuilder**
   - Éditeur visuel de blocs
   - Meta tags SEO
   - Contenu public

3. **Tenants** (`/admin/tenants`)
   - Liste de tous les tenants
   - Créer, modifier, suspendre, supprimer
   - Voir les détails (utilisateurs, facturation, site)

4. **Utilisateurs** (`/admin/users`)
   - Liste de tous les utilisateurs
   - **Impersonation** (bouton violet)
   - Réinitialisation de mot de passe
   - Activation/désactivation

5. **Blocs** (`/admin/blocks`)
   - Gérer les types de blocs
   - Créer, modifier, supprimer
   - Prévisualisation

6. **Templates** (`/admin/templates`)
   - Gérer les templates
   - Créer, modifier, supprimer
   - Upload d'images de prévisualisation

7. **Statistiques** (`/admin/stats`)
   - Statistiques détaillées
   - Analytics
   - Rapports

8. **Facturation** (`/admin/billing`)
   - Plans tarifaires
   - Abonnements
   - Factures
   - Paiements

9. **Paramètres** (`/admin/settings`)
   - Configuration système
   - Email, paiements
   - Sécurité

---

## 👤 Impersonation

### Comment Utiliser

1. **Se connecter en tant que super admin**
   - Aller sur `http://localhost:9494/admin/users`

2. **Trouver l'utilisateur à impersonner**
   - Cliquer sur le bouton violet (icône utilisateur) à côté de l'utilisateur

3. **Confirmer l'impersonation**
   - Une bannière jaune apparaît en haut de la page
   - Vous êtes maintenant connecté comme cet utilisateur

4. **Arrêter l'impersonation**
   - Cliquer sur "Arrêter l'impersonnification" dans la bannière
   - Retour automatique au compte super admin

### Fonctionnalités

- ✅ Bannière d'impersonation visible en haut de toutes les pages
- ✅ Accès complet au dashboard du tenant impersonné
- ✅ Bouton pour arrêter l'impersonation à tout moment
- ✅ Impossible d'impersonner un autre super admin

---

## 🚀 Commandes Utiles

### Initialisation
```bash
# Créer les plans tarifaires
make init-pricing-plans

# Créer les fonctionnalités
make init-features

# Créer les blocs et templates de base
make init-defaults

# Créer l'environnement de test complet
make setup-test-env
```

### Tests
```bash
# Tester l'accès aux fonctionnalités
make test-features

# Tester les endpoints API
make test-api
```

---

## 📝 Notes Importantes

1. **Super Admin** a toujours accès à toutes les fonctionnalités, même celles restreintes aux plans premium

2. **Tenants** ont accès uniquement aux fonctionnalités de leur plan d'abonnement

3. **Page d'Accueil Publique** est gérée uniquement par le super admin via `/admin/homepage`

4. **Impersonation** permet au super admin de voir exactement ce que voit un tenant

5. **Sécurité** : L'impersonation ne fonctionne que pour les super admins et ne peut pas être utilisée sur d'autres super admins

---

## 🔗 Liens Rapides

- **Site Public** : `http://localhost:9494`
- **Super Admin Dashboard** : `http://localhost:9494/admin/dashboard`
- **Tenant Dashboard** : `http://localhost:9494/dashboard`
- **Gestion Utilisateurs** : `http://localhost:9494/admin/users`
- **Page d'Accueil Publique** : `http://localhost:9494/admin/homepage`

