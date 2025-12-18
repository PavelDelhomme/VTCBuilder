# Workflow de Validation - Éditeur et Blocs VTCBuilder

> **Fichier de travail consolidé** pour suivre la validation complète de l'éditeur et de tous les blocs étape par étape.
> 
> Ce fichier combine les informations de :
> - `EDITOR_ROADMAP.md` - Fonctionnalités de l'éditeur
> - `CHECKLIST_BLOCKS_ROADMAP.md` - Checklist détaillée de validation des blocs
> - `BLOCKS_ROADMAP.md` - Liste exhaustive des blocs

**Date de création :** 12/12/2024  
**Phase actuelle :** Phase 1 - Blocs de mise en page de base  
**Dernière mise à jour :** 12/12/2024

---

## 📊 Statut Global

- ✅ **Fonctionnel** : Fonctionnalité opérationnelle et validée
- 🔄 **En cours** : En développement ou validation
- ⏳ **Planifié** : Prévu mais pas encore commencé
- ❌ **À corriger** : Problème identifié nécessitant une correction
- 🧪 **En validation** : En cours de validation étape par étape
- ⬜ **Non validé** : Pas encore testé

---

## 🎯 Système de Validation par Phases

### Configuration

La validation se fait par phases contrôlées par la variable d'environnement `NEXT_PUBLIC_BLOCK_VALIDATION_PHASE` dans `frontend/.env.local` :

- **Phase 1** : Blocs de base (heading, text, container)
- **Phase 2** : + Columns
- **Phase 3** : + paragraph, button, image, line
- **Phase 4+** : Tous les blocs actifs

---

## 🧪 PHASE 1 : Blocs de Mise en Page de Base

**Objectif :** Valider les blocs fondamentaux de mise en page  
**Statut :** 🧪 En validation  
**Blocs activés :** heading, text, container

### Critères de validation pour chaque bloc :

- [ ] Le bloc s'affiche correctement dans l'éditeur
- [ ] Le bloc s'affiche correctement dans la prévisualisation
- [ ] Les propriétés de contenu sont éditables (texte, niveau, etc.)
- [ ] Les propriétés de style s'appliquent correctement (couleur, alignement, etc.)
- [ ] Le bloc est responsive (Desktop/Tablette/Mobile)
- [ ] Aucune erreur dans la console
- [ ] Le bloc fonctionne en mode sombre/clair
- [ ] Le drag & drop fonctionne pour réorganiser les blocs
- [ ] Le redimensionnement (layout) fonctionne
- [ ] La sauvegarde fonctionne correctement

### Blocs à valider :

#### 1. Heading (Titre) - `heading`
**Plan :** 🆓 Gratuit  
**Statut :** ⬜ Non validé

**Propriétés de contenu :**
- [ ] Niveau (h1-h6) - Éditable et fonctionnel
- [ ] Texte - Éditable et mis à jour en temps réel
- [ ] Alignement - Fonctionne (left, center, right, justify)

**Propriétés de style :**
- [ ] Couleur du texte - S'applique correctement
- [ ] Typographie (font-size, font-weight, font-family) - Fonctionne
- [ ] Espacement (padding, margin) - S'applique correctement
- [ ] Bordures - Fonctionnent si configurées

**Fonctionnalités :**
- [ ] Responsive (Desktop/Tablette/Mobile)
- [ ] Mode sombre/clair
- [ ] Drag & drop
- [ ] Redimensionnement layout
- [ ] Sauvegarde

**Notes :** _Ajouter vos notes ici après validation_

---

#### 2. Text (Texte) - `text`
**Plan :** 🆓 Gratuit  
**Statut :** ⬜ Non validé

**Propriétés de contenu :**
- [ ] Texte - Éditable et mis à jour en temps réel
- [ ] Formatage basique - Fonctionne

**Propriétés de style :**
- [ ] Couleur du texte - S'applique correctement
- [ ] Typographie - Fonctionne
- [ ] Espacement - S'applique correctement
- [ ] Bordures - Fonctionnent si configurées

**Fonctionnalités :**
- [ ] Responsive
- [ ] Mode sombre/clair
- [ ] Drag & drop
- [ ] Redimensionnement layout
- [ ] Sauvegarde

**Notes :** _Ajouter vos notes ici après validation_

---

#### 3. Container (Conteneur) - `container`
**Plan :** 🆓 Gratuit  
**Statut :** ⬜ Non validé

**Propriétés de contenu :**
- [ ] Accepte des blocs enfants - Fonctionne
- [ ] Largeur maximale - Configurable
- [ ] Centrage - Fonctionne

**Propriétés de style :**
- [ ] Couleur de fond - S'applique correctement
- [ ] Espacement (padding, margin) - S'applique correctement
- [ ] Bordures - Fonctionnent
- [ ] Dimensions - Fonctionnent

**Fonctionnalités :**
- [ ] Responsive
- [ ] Mode sombre/clair
- [ ] Drag & drop des enfants
- [ ] Sélection des enfants (clic droit)
- [ ] Redimensionnement layout
- [ ] Sauvegarde

**Notes :** _Ajouter vos notes ici après validation_

---

### Validation Phase 1 - Checklist finale

- [ ] Tous les blocs de la Phase 1 validés individuellement
- [ ] Aucune erreur console
- [ ] Tous les tests responsive passés
- [ ] Mode sombre/clair fonctionne pour tous
- [ ] Drag & drop fonctionne
- [ ] Sauvegarde fonctionne
- [ ] **Phase 1 validée** ✅

**Date de validation Phase 1 :** _À remplir_  
**Validé par :** _À remplir_

---

## 🧪 PHASE 2 : Blocs Conteneurs

**Objectif :** Valider les blocs conteneurs pour organiser le contenu  
**Statut :** ⏳ En attente de Phase 1  
**Blocs à activer :** columns, section

### Blocs à valider :

#### 4. Columns (Colonnes) - `columns`
**Plan :** 🆓 Gratuit  
**Statut :** ⏳ En attente

**Critères de validation :**
- [ ] Accepte des blocs enfants
- [ ] Les blocs enfants s'affichent correctement
- [ ] Le clic droit sur les enfants ouvre les paramètres
- [ ] Le drag & drop fonctionne dans les conteneurs
- [ ] Les propriétés de style s'appliquent aux conteneurs
- [ ] Les conteneurs sont responsive
- [ ] Nombre de colonnes configurable (1-12)
- [ ] Responsive columns (différentes colonnes par breakpoint)

**Notes :** _À remplir lors de la validation_

---

#### 5. Section - `section`
**Plan :** 🆓 Gratuit  
**Statut :** ⏳ En attente

**Critères de validation :**
- [ ] Accepte des blocs enfants
- [ ] Image de fond configurable
- [ ] Overlay configurable
- [ ] Hauteur configurable
- [ ] Responsive
- [ ] Mode sombre/clair

**Notes :** _À remplir lors de la validation_

---

### Validation Phase 2 - Checklist finale

- [ ] Tous les blocs de la Phase 2 validés
- [ ] **Phase 2 validée** ✅

**Date de validation Phase 2 :** _À remplir_  
**Validé par :** _À remplir_

---

## 🧪 PHASE 3 : Blocs de Contenu Avancés

**Objectif :** Valider les blocs de contenu plus complexes  
**Statut :** ⏳ En attente de Phase 2  
**Blocs à activer :** paragraph, button, image, line

### Blocs à valider :

#### 6. Paragraph (Paragraphe) - `paragraph`
**Plan :** 🆓 Gratuit  
**Statut :** ⏳ En attente

**Critères de validation :**
- [ ] Texte formaté éditable
- [ ] Propriétés de style fonctionnent
- [ ] Responsive
- [ ] Mode sombre/clair

**Notes :** _À remplir lors de la validation_

---

#### 7. Button (Bouton) - `button`
**Plan :** 🆓 Gratuit  
**Statut :** ⏳ En attente

**Critères de validation :**
- [ ] Texte éditable en temps réel
- [ ] Lien configurable
- [ ] Style (primary, secondary, etc.) fonctionne
- [ ] Propriétés de style fonctionnent
- [ ] Responsive
- [ ] Mode sombre/clair
- [ ] Clic fonctionne

**Notes :** _À remplir lors de la validation_

---

#### 8. Image - `image`
**Plan :** 🆓 Gratuit  
**Statut :** ⏳ En attente

**Critères de validation :**
- [ ] Upload d'image fonctionne
- [ ] URL d'image fonctionne
- [ ] Alt text configurable
- [ ] Légende configurable
- [ ] Taille (cover, contain, auto) fonctionne
- [ ] Alignement fonctionne
- [ ] Responsive
- [ ] Mode sombre/clair

**Notes :** _À remplir lors de la validation_

---

#### 9. Line (Ligne) - `line`
**Plan :** 🆓 Gratuit  
**Statut :** ⏳ En attente

**Critères de validation :**
- [ ] Orientation (horizontal, vertical) fonctionne
- [ ] Style de ligne configurable
- [ ] Couleur configurable
- [ ] Responsive
- [ ] Mode sombre/clair

**Notes :** _À remplir lors de la validation_

---

### Validation Phase 3 - Checklist finale

- [ ] Tous les blocs de la Phase 3 validés
- [ ] **Phase 3 validée** ✅

**Date de validation Phase 3 :** _À remplir_  
**Validé par :** _À remplir_

---

## 🧪 PHASE 4+ : Tous les Blocs Actifs

**Objectif :** Valider tous les blocs disponibles  
**Statut :** ⏳ En attente de Phase 3

### Blocs à valider (liste complète) :

Voir la section "📋 Liste Complète des Blocs" ci-dessous pour la checklist détaillée de chaque bloc.

---

## 🎨 Validation de l'Interface Éditeur

### Barre d'outils principale

- [x] Boutons agrandis pour meilleure utilisabilité sur ordinateur
- [x] Responsive : Icônes seulement sur petits écrans, texte + icônes sur grands écrans
- [x] Tous les boutons tiennent sur une seule ligne
- [x] Pas d'espace entre le header et la barre d'outils
- [x] Contrôles de prévisualisation déplacés vers la barre d'outils principale

### Boutons de la barre d'outils

- [x] Retour aux projets
- [x] Mode Desktop/Tablette/Mobile
- [x] Mode sombre/Mode clair
- [x] Menu Options (Pages, Statut) - Corrigé
- [x] Toggle liens (Activer/Désactiver)
- [x] Annuler/Rétablir (Undo/Redo)
- [x] Toggle Palette de blocs
- [x] Bouton Sauvegarder/Publier
- [x] État de sauvegarde (heure dernière sauvegarde)
- [x] Bouton SEO (ouvre modal)

### Fonctionnalités de l'Éditeur

#### Sélection et Navigation
- [x] Sélection de blocs par clic
- [x] Sélection de blocs enfants dans les conteneurs
- [x] Hover pour identifier les blocs
- [x] Clic droit pour menu contextuel (avec option "Déplacer")
- [ ] Mode déplacement manuel (drag & drop avec souris)
- [ ] Déplacer des blocs entre conteneurs
- [ ] Déplacer des blocs au-dessus/en dessous d'autres blocs

#### Drag & Drop
- [x] Glisser-déposer des blocs depuis la palette
- [x] Réorganisation des blocs par drag & drop
- [ ] Amélioration de la détection des zones de drop
- [ ] Indicateurs visuels pour zones de drop valides
- [ ] Drag & drop dans les conteneurs

#### Mise à jour en temps réel
- [x] Mise à jour immédiate du texte (titres, paragraphes, boutons)
- [x] Mise à jour immédiate des propriétés de contenu (niveau, alignement, couleur)
- [x] Debounce pour les propriétés de style (padding, margin, etc.)
- [x] Prévisualisation en direct synchronisée avec l'éditeur

#### Layout et Responsive
- [x] Système de colonnes (1-12 sur 12)
- [x] Layout par défaut : 3 colonnes (au lieu de 12)
- [x] Redimensionnement des blocs par drag des poignées
- [x] Sélecteur de layout dans le panneau de propriétés
- [x] Aperçu responsive (Desktop/Tablette/Mobile) dans l'éditeur

#### Propriétés des Blocs

**Panneau de Contenu**
- [x] Édition du texte des blocs
- [x] Configuration des propriétés spécifiques (niveau de titre, URL, etc.)
- [x] Sélecteur de page pour les liens
- [ ] Éditeur de texte riche (WYSIWYG)

**Panneau de Style**
- [x] Couleurs (background, text)
- [x] Typographie (font-size, font-weight, etc.)
- [x] Espacement (padding, margin)
- [x] Alignement (text-align)
- [x] Bordures et ombres
- [ ] Animations et transitions
- [ ] Responsive styles (mobile/tablet/desktop)

**Panneau de Mise en page**
- [x] Layout (colonnes sur 12)
- [x] Conteneur (container, container-fluid, none)
- [x] Position (static, relative, absolute, fixed, sticky)
- [ ] Z-index
- [ ] Overflow

#### Historique (Undo/Redo)
- [x] Historique complet des modifications
- [x] Annuler (Ctrl+Z)
- [x] Rétablir (Ctrl+Y)
- [x] Indicateurs visuels (boutons désactivés si pas d'historique)
- [ ] Historique limité (éviter consommation mémoire excessive)

#### Sauvegarde
- [x] Sauvegarde manuelle (Ctrl+S)
- [x] Sauvegarde automatique
- [x] Indicateur de statut de sauvegarde (heure dernière sauvegarde)
- [x] Gestion des brouillons et publications
- [ ] Sauvegarde locale (localStorage) en cas de perte de connexion

---

## 📋 Liste Complète des Blocs à Valider

> **Note :** Cette section liste tous les blocs disponibles. Cochez `[x]` une fois qu'un bloc a été testé et validé comme fonctionnel.

### 📋 Blocs de Contenu (🆓 Gratuits)

#### Blocs de Texte
- [ ] **Heading** (Titre) - `heading` - Phase 1
- [ ] **Text** (Texte) - `text` - Phase 1
- [ ] **Paragraph** (Paragraphe) - `paragraph` - Phase 3
- [ ] **Rich Text Editor** (Éditeur WYSIWYG) - `rich-text`
- [ ] **Markdown Editor** - `markdown`
- [ ] **HTML Raw** (HTML Brut) - `html-raw`

#### Blocs de Navigation
- [ ] **Breadcrumb** (Fil d'Ariane) - `breadcrumb`
- [ ] **Pagination** - `pagination`

#### Blocs Interactifs
- [ ] **Button** (Bouton) - `button` - Phase 3
- [ ] **Link** (Lien) - `link`
- [ ] **Tooltip** (Info-bulle) - `tooltip`
- [ ] **Popover** - `popover`
- [ ] **Dropdown** (Menu déroulant) - `dropdown`

#### Blocs de Contenu Structuré
- [ ] **List** (Liste) - `list`
- [ ] **Quote** (Citation) - `quote`
- [ ] **Code** - `code`
- [ ] **Alert** (Alerte) - `alert`
- [ ] **Table** (Tableau) - `table`

#### Blocs de Séparation
- [ ] **Line** (Ligne) - `line` - Phase 3
- [ ] **Divider** (Séparateur) - `divider`
- [ ] **Spacer** (Espaceur) - `spacer`

#### Blocs d'Éléments
- [ ] **Icon** (Icône) - `icon`
- [ ] **Badge** (Badge/Étiquette) - `badge`
- [ ] **Label** - `label`

#### Blocs de Métadonnées
- [ ] **Tags** - `tags`
- [ ] **Categories** (Catégories) - `categories`
- [ ] **Author Box** (Boîte auteur) - `author-box`
- [ ] **Related Posts** (Articles liés) - `related-posts`
- [ ] **Table of Contents** (Table des matières) - `table-of-contents`
- [ ] **Reading Time** (Temps de lecture) - `reading-time`
- [ ] **Share Buttons** (Boutons de partage) - `share-buttons`

---

### 🎨 Blocs de Mise en Page (🆓 Gratuits)

- [ ] **Container** (Conteneur) - `container` - Phase 1
- [ ] **Flex Container** - `flex-container`
- [ ] **Grid Container** (Grille) - `grid-container`
- [ ] **Columns** (Colonnes) - `columns` - Phase 2
- [ ] **Rows** (Lignes) - `rows`
- [ ] **Section** - `section` - Phase 2
- [ ] **Flexbox** - `flexbox`
- [ ] **Grid** - `grid`
- [ ] **Stack** (Pile verticale) - `stack`
- [ ] **Inline** (Ligne horizontale) - `inline`
- [ ] **Group** (Groupe) - `group`
- [ ] **Wrapper** (Enveloppe) - `wrapper`
- [ ] **Header** (En-tête) - `header`
- [ ] **Footer** (Pied de page) - `footer`

---

### 🖼️ Blocs Médias (🆓 Gratuits)

- [ ] **Image** - `image` - Phase 3
- [ ] **Gallery** (Galerie) - `gallery`
- [ ] **Video** (Vidéo) - `video`
- [ ] **Video Embed** (Vidéo Embed) - `video-embed`
- [ ] **Vimeo Embed** - `vimeo-embed`
- [ ] **SoundCloud Embed** - `soundcloud-embed`
- [ ] **Spotify Embed** - `spotify-embed`
- [ ] **Instagram Embed** - `instagram-embed`
- [ ] **Twitter/X Embed** - `twitter-embed`
- [ ] **Facebook Embed** - `facebook-embed`
- [ ] **Embed** (Intégration) - `embed`
- [ ] **Audio Player** (Lecteur audio) - `audio-player`
- [ ] **Map** (Carte) - `map`
- [ ] **Carousel** (Carrousel) - `carousel`
- [ ] **Image Slider** (Diaporama) - `image-slider`
- [ ] **Lightbox** - `lightbox`

---

### 📊 Blocs de Données (⭐ Starter / 💼 Business / 🏢 Enterprise)

- [ ] **Chart** (Graphique) - `chart`
- [ ] **Statistics** (Statistiques) - `stats`
- [ ] **Counter** (Compteur) - `counter`
- [ ] **Progress Bar** (Barre de progression) - `progress-bar`
- [ ] **Progress Circle** (Cercle de progression) - `progress-circle`
- [ ] **Timeline** (Chronologie) - `timeline`
- [ ] **Calendar** (Calendrier) - `calendar`
- [ ] **Countdown** (Compte à rebours) - `countdown`

---

### 📝 Blocs de Formulaire (🆓 Gratuits / ⭐ Starter / 💼 Business)

#### Formulaires Gratuits
- [ ] **Form** (Formulaire de contact) - `form`
- [ ] **Form Newsletter** (Newsletter) - `form-newsletter`
- [ ] **Form Search** (Recherche) - `form-search`
- [ ] **Form Inscription** (Inscription) - `form-inscription`
- [ ] **Form Login** (Formulaire de connexion) - `form-login`
- [ ] **Booking Form** (Formulaire de réservation) - `booking-form`
- [ ] **Contact Form** (Formulaire contact) - `contact-form`
- [ ] **Form Poll** (Sondage rapide) - `form-poll`
- [ ] **Form RSVP** - `form-rsvp`
- [ ] **Captcha** - `captcha`

#### Formulaires Premium
- [ ] **Form Multi-step** (Formulaire multi-étapes) - `form-multi-step`
- [ ] **Form Conditional** (Formulaire conditionnel) - `form-conditional`
- [ ] **Form Calculator** (Formulaire calculateur) - `form-calculator`
- [ ] **Form File Upload** (Upload de fichiers) - `form-file-upload`
- [ ] **Form Payment** (Paiement) - `form-payment`
- [ ] **Form Quiz** (Quiz) - `form-quiz`
- [ ] **Form Survey** (Sondage) - `form-survey`

---

### 🎯 Blocs Interactifs (⭐ Starter / 💼 Business / 🏢 Enterprise)

- [ ] **Tabs** (Onglets) - `tabs`
- [ ] **Accordion** (Accordéon) - `accordion`
- [ ] **Modal** (Modal/Popup) - `modal`
- [ ] **FAQ Filters** (Filtres FAQ) - `faq-filters`

---

### 🎨 Blocs de Design (🆓 Gratuits / ⭐ Starter)

- [ ] **Hero** - `hero`
- [ ] **Banner** (Bannière) - `banner`
- [ ] **CTA Section** (Section CTA) - `cta-section`
- [ ] **Feature Card** (Carte fonctionnalité) - `feature-card`
- [ ] **Icon Box** (Boîte icône) - `icon-box`
- [ ] **Card** (Carte) - `card`
- [ ] **Card Grid** (Grille de cartes) - `card-grid`
- [ ] **Testimonials** (Témoignages) - `testimonials`
- [ ] **Logo Grid** (Grille de logos) - `logo-grid`
- [ ] **Logo Carousel** (Carrousel de logos) - `logo-carousel`
- [ ] **Team Member** (Membre d'équipe) - `team-member`
- [ ] **Team Grid** (Grille d'équipe) - `team-grid`
- [ ] **Features Grid** (Grille Fonctionnalités) - `features-grid`

---

### 📱 Blocs VTC Spécifiques (🆓 Gratuits / ⭐ Starter / 💼 Business)

- [ ] **Pricing Table VTC** (Tableau de prix VTC) - `pricing-table-vtc`
- [ ] **Service Zones** (Zones de service) - `service-zones`
- [ ] **Vehicle Gallery** (Galerie véhicules) - `vehicle-gallery`
- [ ] **Contact Buttons** (Boutons de contact) - `contact-buttons`
- [ ] **Badges** - `badges`
- [ ] **Driver Profile** (Profil chauffeur) - `driver-profile`
- [ ] **Vehicle Comparison** (Comparaison véhicules) - `vehicle-comparison`
- [ ] **Service Packages** (Forfaits service) - `service-packages`
- [ ] **Route Calculator** (Calculateur d'itinéraire) - `route-calculator`
- [ ] **Fare Calculator** (Calculateur de tarif) - `fare-calculator`
- [ ] **Availability Calendar** (Calendrier disponibilité) - `availability-calendar`
- [ ] **WhatsApp Button** - `whatsapp-button`
- [ ] **Phone Button** (Bouton téléphone) - `phone-button`
- [ ] **Email Button** (Bouton email) - `email-button`
- [ ] **SMS Button** (Bouton SMS) - `sms-button`
- [ ] **Trust Badges** (Badges de confiance) - `trust-badges`
- [ ] **Payment Methods** (Méthodes de paiement) - `payment-methods`

---

### 🛍️ Blocs E-commerce (💼 Business / 🏢 Enterprise)

- [ ] **Product Card** (Carte Produit) - `product-card`
- [ ] **Product Gallery** (Galerie produit) - `product-gallery`
- [ ] **Product Details** (Détails produit) - `product-details`
- [ ] **Shopping Cart** (Panier) - `shopping-cart`
- [ ] **Checkout** (Paiement) - `checkout`
- [ ] **Pricing** (Tarifs) - `pricing`
- [ ] **Pricing Card** (Carte Tarif) - `pricing-card`
- [ ] **Pricing Cards Grid** (Grille Cartes Tarifs) - `pricing-cards-grid`
- [ ] **Billing Cycle Toggle** (Toggle Mensuel/Annuel) - `billing-cycle-toggle`
- [ ] **Add to Cart** (Ajouter au Panier) - `add-to-cart`
- [ ] **Buy Now** (Acheter Maintenant) - `buy-now`
- [ ] **Reviews** (Avis Clients) - `reviews`
- [ ] **Rating** (Évaluation) - `rating`
- [ ] **Wishlist** (Liste de Souhaits) - `wishlist`
- [ ] **Product Comparison** (Comparaison Produits) - `product-comparison`

---

### 🔧 Blocs Utilitaires (🆓 Gratuits)

- [ ] **Search Bar** (Barre de recherche) - `search-bar`
- [ ] **Docs Grid** (Grille Documentation) - `docs-grid`
- [ ] **Quick Start Section** (Section Démarrage Rapide) - `quick-start-section`
- [ ] **Support Hours** (Horaires Support) - `support-hours`
- [ ] **Trial Info** (Info Essai Gratuit) - `trial-info`
- [ ] **FAQ Section** (Section FAQ) - `faq-section`
- [ ] **Language Switcher** (Sélecteur langue) - `language-switcher`
- [ ] **Theme Switcher** (Sélecteur thème) - `theme-switcher`
- [ ] **Print Button** (Bouton imprimer) - `print-button`
- [ ] **Copy Button** (Bouton copier) - `copy-button`
- [ ] **Download Button** (Bouton télécharger) - `download-button`
- [ ] **Back to Top** (Retour en haut) - `back-to-top`
- [ ] **Scroll Progress** (Progression Scroll) - `scroll-progress`
- [ ] **Preloader** (Préchargeur) - `preloader`
- [ ] **Loading Spinner** (Indicateur chargement) - `loading-spinner`
- [ ] **Skeleton Loader** (Chargeur squelette) - `skeleton-loader`
- [ ] **Coming Soon** (Bientôt Disponible) - `coming-soon`
- [ ] **Under Construction** (En Construction) - `under-construction`
- [ ] **404 Page** (Page 404) - `404-page`
- [ ] **Cookie Consent** (Consentement Cookies) - `cookie-consent`
- [ ] **Contact Info** (Info Contact) - `contact-info`
- [ ] **Contact Hours** (Heures Contact) - `contact-hours`
- [ ] **Social Links** (Liens Sociaux) - `social-links`
- [ ] **Social Share** (Partage Social) - `social-share`

---

## 📝 Notes de Validation

### Comment utiliser ce fichier :

1. **Commencez par la Phase 1** - Validez les blocs de base
2. **Cochez les critères** au fur et à mesure de vos tests
3. **Ajoutez des notes** dans la section "Notes" de chaque bloc
4. **Validez la phase complète** avant de passer à la suivante
5. **Mettez à jour le statut** de chaque bloc (✅ Validé, ⬜ Non validé, ❌ Problème)

### Critères de validation standard :

- ✅ Le bloc s'affiche correctement
- ✅ Les propriétés sont éditables
- ✅ Les styles s'appliquent correctement
- ✅ Le bloc est responsive
- ✅ Aucune erreur dans la console
- ✅ Le bloc fonctionne en mode sombre/clair
- ✅ Les propriétés de style avancées fonctionnent (pour blocs premium)

### Problèmes identifiés :

_Utilisez cette section pour noter les problèmes rencontrés lors de la validation_

- **Date :** _Date du problème_
- **Bloc :** _Nom du bloc_
- **Problème :** _Description du problème_
- **Solution :** _Solution appliquée ou à appliquer_

---

## 🎯 Prochaines Étapes

1. **Phase 1** : Valider heading, text, container
2. **Phase 2** : Activer et valider columns, section
3. **Phase 3** : Activer et valider paragraph, button, image, line
4. **Phase 4+** : Activer tous les blocs et valider progressivement

---

**Dernière mise à jour :** 12/12/2024  
**Phase actuelle :** Phase 1 - Blocs de mise en page de base  
**Statut global :** 🧪 En validation

