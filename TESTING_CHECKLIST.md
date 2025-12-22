# 📋 Checklist Complète de Tests - VTCBuilder

## 🎯 Objectif
Ce document liste tous les tests à effectuer pour valider le bon fonctionnement de l'interface backoffice et de l'interface publique.

---

## 🔐 1. Authentification & Autorisation

### 1.1 Connexion
- [ ] Connexion avec email/mot de passe valide
- [ ] Connexion avec email/mot de passe invalide
- [ ] Affichage des messages d'erreur appropriés
- [ ] Redirection après connexion réussie
- [ ] Persistance de la session (refresh de page)
- [ ] Déconnexion fonctionnelle
- [ ] Redirection après déconnexion

### 1.2 Inscription
- [ ] Inscription avec données valides
- [ ] Validation des champs (email, mot de passe, etc.)
- [ ] Gestion des erreurs (email déjà utilisé, etc.)
- [ ] Redirection après inscription réussie

### 1.3 Récupération de mot de passe
- [ ] Demande de réinitialisation avec email valide
- [ ] Envoi d'email de réinitialisation
- [ ] Réinitialisation avec token valide
- [ ] Réinitialisation avec token invalide/expiré

### 1.4 Rôles et permissions
- [ ] Accès Super Admin (toutes les fonctionnalités)
- [ ] Accès Admin Tenant (fonctionnalités limitées)
- [ ] Accès Client (fonctionnalités limitées)
- [ ] Restrictions d'accès selon le rôle
- [ ] Affichage conditionnel des menus selon le rôle

---

## 🏠 2. Interface Publique (Frontend)

### 2.1 Page d'accueil
- [ ] Affichage correct de la page d'accueil
- [ ] Navigation fonctionnelle
- [ ] Responsive design (mobile, tablette, desktop)
- [ ] Mode clair/sombre fonctionnel
- [ ] Liens de navigation fonctionnels

### 2.2 Pages publiques
- [ ] Affichage des pages publiques créées
- [ ] Navigation entre pages publiques
- [ ] URLs personnalisées fonctionnelles
- [ ] SEO (meta tags, etc.)

### 2.3 Blocs de contenu
- [ ] Affichage de tous les types de blocs
- [ ] Blocs de texte (heading, paragraph, etc.)
- [ ] Blocs média (image, video, gallery, etc.)
- [ ] Blocs de formulaire (contact, newsletter, etc.)
- [ ] Blocs interactifs (tabs, accordion, modal, etc.)
- [ ] Blocs VTC (booking form, pricing table, etc.)
- [ ] Blocs e-commerce (product gallery, add to cart, etc.)
- [ ] Responsive des blocs
- [ ] Styles personnalisés appliqués

---

## 🎨 3. Éditeur de Blocs (Block Editor)

### 3.1 Palette de blocs
- [ ] Affichage de tous les types de blocs disponibles
- [ ] Catégorisation des blocs
- [ ] Recherche de blocs
- [ ] Filtrage par catégorie
- [ ] Drag & drop depuis la palette

### 3.2 Ajout de blocs
- [ ] Ajout de bloc depuis la palette
- [ ] Ajout de bloc par drag & drop
- [ ] Positionnement correct du bloc
- [ ] Bloc ajouté dans la liste

### 3.3 Édition de blocs
- [ ] Sélection d'un bloc
- [ ] Affichage du panneau de propriétés
- [ ] Modification des propriétés
- [ ] Sauvegarde automatique
- [ ] Prévisualisation en temps réel
- [ ] Annulation des modifications (undo/redo)

### 3.4 Déplacement de blocs
- [ ] Drag & drop pour réorganiser
- [ ] Déplacement vers un conteneur
- [ ] Déplacement d'un bloc enfant
- [ ] Indicateur visuel pendant le drag
- [ ] Position finale correcte

### 3.5 Redimensionnement de blocs
- [ ] Redimensionnement horizontal
- [ ] Redimensionnement vertical
- [ ] Indicateur de largeur (colonnes, %, px)
- [ ] Limites min/max respectées
- [ ] Adaptation du conteneur

### 3.6 Suppression de blocs
- [ ] Suppression d'un bloc
- [ ] Suppression avec confirmation
- [ ] Suppression d'un bloc avec enfants
- [ ] Récupération après suppression (undo)

### 3.7 Duplication de blocs
- [ ] Duplication d'un bloc
- [ ] Duplication d'un bloc avec enfants
- [ ] Position du bloc dupliqué

### 3.8 Styles de blocs
- [ ] Modification des couleurs (background, text)
- [ ] Modification des espacements (padding, margin)
- [ ] Modification des bordures
- [ ] Modification des ombres
- [ ] Application des styles en prévisualisation

### 3.9 Layout des blocs
- [ ] Modification de la largeur (colonnes)
- [ ] Modification de l'alignement
- [ ] Modification de la disposition (flex, grid)
- [ ] Responsive breakpoints

### 3.10 Prévisualisation
- [ ] Affichage de la prévisualisation en temps réel
- [ ] Synchronisation avec l'éditeur
- [ ] Scroll indépendant
- [ ] Mode responsive dans la prévisualisation

---

## 📄 4. Gestion des Pages

### 4.1 Liste des pages
- [ ] Affichage de toutes les pages
- [ ] Filtrage par statut (draft, published)
- [ ] Recherche de pages
- [ ] Tri des pages
- [ ] Pagination si nécessaire

### 4.2 Création de page
- [ ] Création d'une nouvelle page
- [ ] Saisie du titre
- [ ] Saisie de l'URL/slug
- [ ] Sélection d'un template (optionnel)
- [ ] Sauvegarde de la page

### 4.3 Édition de page
- [ ] Ouverture de l'éditeur de page
- [ ] Modification du titre
- [ ] Modification de l'URL/slug
- [ ] Modification du contenu (blocs)
- [ ] Sauvegarde des modifications

### 4.4 Édition visuelle de page
- [ ] Ouverture de l'éditeur visuel
- [ ] Ajout de blocs dans l'éditeur visuel
- [ ] Modification de blocs dans l'éditeur visuel
- [ ] Prévisualisation en temps réel
- [ ] Sauvegarde depuis l'éditeur visuel

### 4.5 Publication de page
- [ ] Publication d'une page (draft → published)
- [ ] Dépublier une page (published → draft)
- [ ] Affichage de la page publiée publiquement
- [ ] Page non publiée non accessible publiquement

### 4.6 Suppression de page
- [ ] Suppression d'une page
- [ ] Confirmation de suppression
- [ ] Page supprimée non accessible

---

## 🎨 5. Templates

### 5.1 Liste des templates
- [ ] Affichage de tous les templates
- [ ] Prévisualisation des templates
- [ ] Filtrage par catégorie

### 5.2 Utilisation de template
- [ ] Création de page depuis un template
- [ ] Tous les blocs du template copiés
- [ ] Modification possible après création

---

## 🏢 6. Gestion des Tenants (Super Admin)

### 6.1 Liste des tenants
- [ ] Affichage de tous les tenants
- [ ] Informations de chaque tenant
- [ ] Statut de chaque tenant
- [ ] Recherche de tenants

### 6.2 Création de tenant
- [ ] Création d'un nouveau tenant
- [ ] Saisie des informations (nom, slug, etc.)
- [ ] Attribution d'un admin
- [ ] Sauvegarde du tenant

### 6.3 Édition de tenant
- [ ] Modification des informations
- [ ] Modification du statut (actif/inactif)
- [ ] Modification des paramètres
- [ ] Sauvegarde des modifications

### 6.4 Gestion des utilisateurs du tenant
- [ ] Liste des utilisateurs du tenant
- [ ] Ajout d'utilisateur au tenant
- [ ] Modification d'utilisateur
- [ ] Suppression d'utilisateur

### 6.5 Paramètres du tenant
- [ ] Configuration générale
- [ ] Configuration du site
- [ ] Configuration de facturation
- [ ] Sauvegarde des paramètres

---

## 👥 7. Gestion des Utilisateurs

### 7.1 Liste des utilisateurs
- [ ] Affichage de tous les utilisateurs
- [ ] Filtrage par rôle
- [ ] Recherche d'utilisateur
- [ ] Informations de chaque utilisateur

### 7.2 Création d'utilisateur
- [ ] Création d'un nouvel utilisateur
- [ ] Saisie des informations (nom, email, etc.)
- [ ] Attribution d'un rôle
- [ ] Attribution à un tenant (si applicable)
- [ ] Sauvegarde de l'utilisateur

### 7.3 Édition d'utilisateur
- [ ] Modification des informations
- [ ] Modification du rôle
- [ ] Modification du statut (actif/inactif)
- [ ] Réinitialisation du mot de passe
- [ ] Sauvegarde des modifications

### 7.4 Suppression d'utilisateur
- [ ] Suppression d'un utilisateur
- [ ] Confirmation de suppression
- [ ] Utilisateur supprimé non accessible

---

## 💰 8. Facturation (Billing)

### 8.1 Tableau de bord de facturation
- [ ] Affichage des informations de facturation
- [ ] Statut de l'abonnement
- [ ] Historique des paiements
- [ ] Prochain paiement

### 8.2 Plans d'abonnement
- [ ] Affichage des plans disponibles
- [ ] Comparaison des plans
- [ ] Changement de plan
- [ ] Mise à jour de l'abonnement

### 8.3 Factures
- [ ] Liste des factures
- [ ] Téléchargement d'une facture
- [ ] Détails d'une facture
- [ ] Historique complet

### 8.4 Méthodes de paiement
- [ ] Ajout d'une méthode de paiement
- [ ] Modification d'une méthode de paiement
- [ ] Suppression d'une méthode de paiement
- [ ] Méthode par défaut

---

## ⚙️ 9. Paramètres

### 9.1 Paramètres généraux
- [ ] Modification des paramètres généraux
- [ ] Nom de l'application
- [ ] Logo
- [ ] Favicon
- [ ] Sauvegarde des paramètres

### 9.2 Paramètres de sécurité
- [ ] Modification du mot de passe
- [ ] Authentification à deux facteurs (si disponible)
- [ ] Sessions actives
- [ ] Déconnexion des autres appareils

### 9.3 Paramètres de notification
- [ ] Configuration des notifications email
- [ ] Configuration des notifications in-app
- [ ] Préférences de notification

---

## 📊 10. Analytics & Rapports

### 10.1 Tableau de bord analytics
- [ ] Affichage des statistiques
- [ ] Graphiques et visualisations
- [ ] Filtres par période
- [ ] Export des données

### 10.2 Rapports d'utilisation
- [ ] Utilisation des blocs
- [ ] Pages les plus visitées
- [ ] Utilisateurs actifs
- [ ] Performance

---

## 🔍 11. Recherche & Filtres

### 11.1 Recherche globale
- [ ] Recherche dans toutes les pages
- [ ] Recherche dans les blocs
- [ ] Recherche dans les utilisateurs
- [ ] Résultats pertinents

### 11.2 Filtres
- [ ] Filtrage par date
- [ ] Filtrage par statut
- [ ] Filtrage par catégorie
- [ ] Combinaison de filtres

---

## 📱 12. Responsive Design

### 12.1 Mobile (< 768px)
- [ ] Navigation mobile fonctionnelle
- [ ] Menu hamburger
- [ ] Éditeur adapté mobile
- [ ] Prévisualisation mobile
- [ ] Tous les formulaires fonctionnels

### 12.2 Tablette (768px - 1024px)
- [ ] Layout adapté tablette
- [ ] Navigation tablette
- [ ] Éditeur tablette
- [ ] Prévisualisation tablette

### 12.3 Desktop (> 1024px)
- [ ] Layout complet desktop
- [ ] Toutes les fonctionnalités accessibles
- [ ] Multi-colonnes fonctionnelles

---

## 🌓 13. Mode Clair/Sombre

### 13.1 Basculement de thème
- [ ] Basculement clair → sombre
- [ ] Basculement sombre → clair
- [ ] Persistance du choix
- [ ] Toutes les pages respectent le thème

### 13.2 Cohérence visuelle
- [ ] Couleurs cohérentes dans tout le thème
- [ ] Contrastes suffisants
- [ ] Lisibilité dans les deux modes

---

## 🔔 14. Notifications & Messages

### 14.1 Notifications système
- [ ] Affichage des notifications
- [ ] Types de notifications (success, error, warning, info)
- [ ] Auto-fermeture des notifications
- [ ] Historique des notifications

### 14.2 Messages d'erreur
- [ ] Messages d'erreur clairs
- [ ] Messages d'erreur contextuels
- [ ] Suggestions de correction

### 14.3 Messages de succès
- [ ] Confirmation des actions réussies
- [ ] Messages informatifs

---

## 🚀 15. Performance

### 15.1 Temps de chargement
- [ ] Chargement initial rapide
- [ ] Chargement des pages rapide
- [ ] Chargement de l'éditeur rapide
- [ ] Optimisation des images

### 15.2 Réactivité
- [ ] Interface réactive
- [ ] Pas de lag lors des interactions
- [ ] Animations fluides
- [ ] Drag & drop fluide

---

## 🔒 16. Sécurité

### 16.1 Protection CSRF
- [ ] Protection contre les attaques CSRF
- [ ] Tokens de sécurité valides

### 16.2 Validation des données
- [ ] Validation côté client
- [ ] Validation côté serveur
- [ ] Sanitization des entrées

### 16.3 Gestion des sessions
- [ ] Expiration de session
- [ ] Déconnexion automatique
- [ ] Sécurité des cookies

---

## 🧪 17. Tests Fonctionnels Spécifiques

### 17.1 Formulaires
- [ ] Validation des champs requis
- [ ] Validation des formats (email, URL, etc.)
- [ ] Soumission de formulaire
- [ ] Messages d'erreur de validation
- [ ] Réinitialisation de formulaire

### 17.2 Upload de fichiers
- [ ] Upload d'images
- [ ] Upload de documents
- [ ] Validation du type de fichier
- [ ] Validation de la taille
- [ ] Prévisualisation des fichiers uploadés

### 17.3 Modales
- [ ] Ouverture de modale
- [ ] Fermeture de modale
- [ ] Fermeture avec ESC
- [ ] Fermeture en cliquant à l'extérieur
- [ ] Contenu de la modale fonctionnel

### 17.4 Dropdowns/Menus
- [ ] Ouverture de dropdown
- [ ] Sélection d'option
- [ ] Fermeture de dropdown
- [ ] Recherche dans dropdown

---

## 🐛 18. Gestion des Erreurs

### 18.1 Erreurs réseau
- [ ] Gestion des erreurs 404
- [ ] Gestion des erreurs 500
- [ ] Gestion des timeouts
- [ ] Messages d'erreur appropriés
- [ ] Possibilité de réessayer

### 18.2 Erreurs de validation
- [ ] Affichage des erreurs de validation
- [ ] Erreurs contextuelles
- [ ] Correction des erreurs

### 18.3 États de chargement
- [ ] Indicateurs de chargement
- [ ] Skeleton screens
- [ ] États vides (empty states)

---

## 📝 19. Tests de Régression

### 19.1 Fonctionnalités existantes
- [ ] Vérification que les anciennes fonctionnalités fonctionnent toujours
- [ ] Pas de régression après nouvelles fonctionnalités
- [ ] Compatibilité avec les données existantes

### 19.2 Migrations de données
- [ ] Migration des données existantes
- [ ] Pas de perte de données
- [ ] Format des données compatible

---

## 🎯 20. Tests d'Intégration

### 20.1 Intégration avec l'API
- [ ] Toutes les requêtes API fonctionnent
- [ ] Gestion des erreurs API
- [ ] Authentification API
- [ ] Rate limiting respecté

### 20.2 Intégration avec services externes
- [ ] Intégration Stripe (paiements)
- [ ] Intégration email (envoi d'emails)
- [ ] Intégration stockage (images, fichiers)

---

## 📋 Notes de Test

### Environnements à tester
- [ ] Développement local
- [ ] Staging
- [ ] Production

### Navigateurs à tester
- [ ] Chrome (dernière version)
- [ ] Firefox (dernière version)
- [ ] Safari (dernière version)
- [ ] Edge (dernière version)

### Cas limites à tester
- [ ] Données vides
- [ ] Données très longues
- [ ] Caractères spéciaux
- [ ] Concurrence (plusieurs utilisateurs)
- [ ] Données corrompues

---

## ✅ Checklist de Validation Finale

- [ ] Tous les tests ci-dessus passent
- [ ] Aucune erreur console
- [ ] Aucune erreur réseau
- [ ] Performance acceptable
- [ ] Accessibilité de base
- [ ] Documentation à jour
- [ ] Code review effectué
- [ ] Tests automatisés passent

---

**Date de création :** 2025-12-22  
**Dernière mise à jour :** 2025-12-22  
**Version :** 1.0


