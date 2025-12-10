# Checklist de Validation des Blocs - VTCBuilder

> **Note:** Ce fichier est une checklist pour validation manuelle de tous les blocs. Cochez `[x]` une fois qu'un bloc a été testé et validé comme fonctionnel.

## 📊 Légende des Plans

- **🆓 Gratuit** : Disponible pour tous les plans (Starter, Business, Enterprise)
- **⭐ Starter** : Disponible à partir du plan Starter
- **💼 Business** : Disponible à partir du plan Business
- **🏢 Enterprise** : Disponible uniquement pour le plan Enterprise

## 🎨 Propriétés de Style Disponibles

Tous les blocs supportent les propriétés de style suivantes :

### Couleurs
- `background_color` / `backgroundColor` : Couleur de fond
- `color` : Couleur du texte

### Typographie
- `font_family` / `fontFamily` : Famille de police (Arial, Roboto, Open Sans, etc.)
- `font_size` / `fontSize` : Taille de police (px, rem, em)
- `font_weight` / `fontWeight` : Poids de police (100-900, normal, bold)
- `font_style` / `fontStyle` : Style de police (normal, italic, oblique)
- `line_height` / `lineHeight` : Hauteur de ligne (1, 1.5, 24px, etc.)
- `letter_spacing` / `letterSpacing` : Espacement des lettres (0px, 0.1em, etc.)
- `word_spacing` / `wordSpacing` : Espacement des mots (normal, 0.2em, etc.)
- `text_transform` / `textTransform` : Transformation de texte (none, uppercase, lowercase, capitalize)
- `text_decoration` / `textDecoration` : Décoration de texte (none, underline, overline, line-through)
- `text_align` / `textAlign` : Alignement du texte (left, center, right, justify)
- `text_shadow` / `textShadow` : Ombre de texte (offsetX offsetY blur color)

### Espacement
- `padding` : Padding (top, right, bottom, left)
- `padding_top` / `paddingTop` : Padding haut
- `padding_right` / `paddingRight` : Padding droite
- `padding_bottom` / `paddingBottom` : Padding bas
- `padding_left` / `paddingLeft` : Padding gauche
- `margin` : Margin (top, right, bottom, left)
- `margin_top` / `marginTop` : Margin haut
- `margin_right` / `marginRight` : Margin droite
- `margin_bottom` / `marginBottom` : Margin bas
- `margin_left` / `marginLeft` : Margin gauche

### Bordures
- `border` : Bordure complète
- `border_width` / `borderWidth` : Largeur de bordure
- `border_style` / `borderStyle` : Style de bordure (solid, dashed, dotted, etc.)
- `border_color` / `borderColor` : Couleur de bordure
- `border_radius` / `borderRadius` : Rayon de bordure (coins arrondis)

### Dimensions
- `width` : Largeur
- `height` : Hauteur
- `max_width` / `maxWidth` : Largeur maximale
- `max_height` / `maxHeight` : Hauteur maximale
- `min_width` / `minWidth` : Largeur minimale
- `min_height` / `minHeight` : Hauteur minimale

### Avancé (Premium)
- `z_index` / `zIndex` : Superposition (Z-index)
- `position` : Type de position (static, relative, absolute, fixed, sticky)
- `opacity` : Opacité (0-1)
- `transform` : Transformations CSS (rotate, scale, translate, etc.)
- `box_shadow` / `boxShadow` : Ombre de boîte
- `overflow` : Gestion du débordement (visible, hidden, scroll, auto)
- `display` : Type d'affichage (block, inline, flex, grid, etc.)

---

## 📋 Blocs de Contenu (🆓 Gratuits)

### Blocs de Texte
- [ ] **Heading** (Titre) - `heading`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures
  - **Propriétés de contenu** : Niveau (h1-h6), texte, alignement
  - **Plan** : 🆓 Gratuit

- [ ] **Text** (Texte) - `text`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures
  - **Propriétés de contenu** : Texte, formatage basique
  - **Plan** : 🆓 Gratuit

- [ ] **Paragraph** (Paragraphe) - `paragraph`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures
  - **Propriétés de contenu** : Texte formaté
  - **Plan** : 🆓 Gratuit

- [ ] **Rich Text Editor** (Éditeur WYSIWYG) - `rich-text`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures
  - **Propriétés de contenu** : Contenu riche avec formatage complet
  - **Plan** : 🆓 Gratuit

- [ ] **Markdown Editor** - `markdown`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures
  - **Propriétés de contenu** : Contenu Markdown
  - **Plan** : 🆓 Gratuit

- [ ] **HTML Raw** (HTML Brut) - `html-raw`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures
  - **Propriétés de contenu** : Code HTML brut
  - **Plan** : 🆓 Gratuit

### Blocs de Navigation
- [ ] **Breadcrumb** (Fil d'Ariane) - `breadcrumb`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures
  - **Propriétés de contenu** : Liste de liens hiérarchiques
  - **Plan** : 🆓 Gratuit

- [ ] **Pagination** - `pagination`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures
  - **Propriétés de contenu** : Navigation paginée
  - **Plan** : 🆓 Gratuit

### Blocs Interactifs
- [ ] **Button** (Bouton) - `button`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures, dimensions
  - **Propriétés de contenu** : Texte, lien, style (primary, secondary, etc.)
  - **Plan** : 🆓 Gratuit

- [ ] **Link** (Lien) - `link`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement
  - **Propriétés de contenu** : Texte, URL, target
  - **Plan** : 🆓 Gratuit

- [ ] **Tooltip** (Info-bulle) - `tooltip`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures, z-index
  - **Propriétés de contenu** : Texte, position (top, bottom, left, right)
  - **Plan** : 🆓 Gratuit

- [ ] **Popover** - `popover`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures, z-index
  - **Propriétés de contenu** : Contenu, position, trigger
  - **Plan** : 🆓 Gratuit

- [ ] **Dropdown** (Menu déroulant) - `dropdown`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures, z-index
  - **Propriétés de contenu** : Options, valeur par défaut
  - **Plan** : 🆓 Gratuit

### Blocs de Contenu Structuré
- [ ] **List** (Liste) - `list`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures
  - **Propriétés de contenu** : Type (ul, ol), items
  - **Plan** : 🆓 Gratuit

- [ ] **Quote** (Citation) - `quote`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures
  - **Propriétés de contenu** : Texte, auteur
  - **Plan** : 🆓 Gratuit

- [ ] **Code** - `code`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures
  - **Propriétés de contenu** : Code, langage
  - **Plan** : 🆓 Gratuit

- [ ] **Alert** (Alerte) - `alert`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures
  - **Propriétés de contenu** : Type (success, error, warning, info), message
  - **Plan** : 🆓 Gratuit

- [ ] **Table** (Tableau) - `table`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures
  - **Propriétés de contenu** : Colonnes, lignes, données
  - **Plan** : 🆓 Gratuit

### Blocs de Séparation
- [ ] **Line** (Ligne) - `line`
  - **Propriétés de style** : Couleurs, espacement, bordures, dimensions
  - **Propriétés de contenu** : Orientation (horizontal, vertical), style
  - **Plan** : 🆓 Gratuit

- [ ] **Divider** (Séparateur) - `divider`
  - **Propriétés de style** : Couleurs, espacement, bordures, dimensions
  - **Propriétés de contenu** : Orientation (horizontal, vertical), style
  - **Plan** : 🆓 Gratuit

- [ ] **Spacer** (Espaceur) - `spacer`
  - **Propriétés de style** : Dimensions, espacement
  - **Propriétés de contenu** : Orientation (horizontal, vertical), taille
  - **Plan** : 🆓 Gratuit

### Blocs d'Éléments
- [ ] **Icon** (Icône) - `icon`
  - **Propriétés de style** : Couleurs, dimensions, espacement, transform
  - **Propriétés de contenu** : Nom de l'icône, taille, bibliothèque (Font Awesome, etc.)
  - **Plan** : 🆓 Gratuit

- [ ] **Badge** (Badge/Étiquette) - `badge`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures
  - **Propriétés de contenu** : Texte, couleur, style
  - **Plan** : 🆓 Gratuit

- [ ] **Label** - `label`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement
  - **Propriétés de contenu** : Texte, for (association avec input)
  - **Plan** : 🆓 Gratuit

### Blocs de Métadonnées
- [ ] **Tags** - `tags`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures
  - **Propriétés de contenu** : Liste de tags
  - **Plan** : 🆓 Gratuit

- [ ] **Categories** (Catégories) - `categories`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures
  - **Propriétés de contenu** : Liste de catégories
  - **Plan** : 🆓 Gratuit

- [ ] **Author Box** (Boîte auteur) - `author-box`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures
  - **Propriétés de contenu** : Nom, photo, bio, liens sociaux
  - **Plan** : 🆓 Gratuit

- [ ] **Related Posts** (Articles liés) - `related-posts`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures
  - **Propriétés de contenu** : Articles connexes
  - **Plan** : 🆓 Gratuit

- [ ] **Table of Contents** (Table des matières) - `table-of-contents`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement, bordures
  - **Propriétés de contenu** : Génération automatique depuis les titres
  - **Plan** : 🆓 Gratuit

- [ ] **Reading Time** (Temps de lecture) - `reading-time`
  - **Propriétés de style** : Toutes les propriétés de typographie, couleurs, espacement
  - **Propriétés de contenu** : Calcul automatique du temps de lecture
  - **Plan** : 🆓 Gratuit

- [ ] **Share Buttons** (Boutons de partage) - `share-buttons`
  - **Propriétés de style** : Couleurs, espacement, bordures, dimensions
  - **Propriétés de contenu** : Plateformes (Facebook, Twitter, LinkedIn, etc.)
  - **Plan** : 🆓 Gratuit

---

## 🎨 Blocs de Mise en Page (🆓 Gratuits)

- [ ] **Container** (Conteneur) - `container`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Largeur maximale, centrage
  - **Plan** : 🆓 Gratuit

- [ ] **Flex Container** - `flex-container`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, display (flex)
  - **Propriétés de contenu** : Direction (row, column), wrap, gap, align-items, justify-content
  - **Plan** : 🆓 Gratuit

- [ ] **Grid Container** (Grille) - `grid-container`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, display (grid)
  - **Propriétés de contenu** : Colonnes, lignes, gap, template
  - **Plan** : 🆓 Gratuit

- [ ] **Columns** (Colonnes) - `columns`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Nombre de colonnes (1-12), responsive
  - **Plan** : 🆓 Gratuit

- [ ] **Rows** (Lignes) - `rows`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Système de lignes pour colonnes
  - **Plan** : 🆓 Gratuit

- [ ] **Section** - `section`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, background (image, couleur, gradient)
  - **Propriétés de contenu** : Image de fond, overlay, hauteur
  - **Plan** : 🆓 Gratuit

- [ ] **Flexbox** - `flexbox`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, display (flex)
  - **Propriétés de contenu** : Direction, wrap, gap, align-items, justify-content
  - **Plan** : 🆓 Gratuit

- [ ] **Grid** - `grid`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, display (grid)
  - **Propriétés de contenu** : Template columns/rows, gap, areas
  - **Plan** : 🆓 Gratuit

- [ ] **Stack** (Pile verticale) - `stack`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Direction verticale, gap
  - **Plan** : 🆓 Gratuit

- [ ] **Inline** (Ligne horizontale) - `inline`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Direction horizontale, gap
  - **Plan** : 🆓 Gratuit

- [ ] **Group** (Groupe) - `group`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Regroupement logique d'éléments
  - **Plan** : 🆓 Gratuit

- [ ] **Wrapper** (Enveloppe) - `wrapper`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Enveloppe générique pour contenir des éléments
  - **Plan** : 🆓 Gratuit

- [ ] **Header** (En-tête) - `header`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, position (sticky)
  - **Propriétés de contenu** : Logo, navigation, menu mobile
  - **Plan** : 🆓 Gratuit

- [ ] **Footer** (Pied de page) - `footer`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Colonnes, liens, copyright, newsletter
  - **Plan** : 🆓 Gratuit

---

## 🖼️ Blocs Médias (🆓 Gratuits)

- [ ] **Image** - `image`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, border-radius
  - **Propriétés de contenu** : URL, alt, légende, taille (cover, contain, auto)
  - **Plan** : 🆓 Gratuit

- [ ] **Gallery** (Galerie) - `gallery`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Images, colonnes, espacement, lightbox
  - **Plan** : 🆓 Gratuit

- [ ] **Video** (Vidéo) - `video`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : URL, autoplay, loop, controls, poster
  - **Plan** : 🆓 Gratuit

- [ ] **Video Embed** (Vidéo Embed) - `video-embed`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : URL YouTube/Vimeo, responsive
  - **Plan** : 🆓 Gratuit

- [ ] **Vimeo Embed** - `vimeo-embed`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : URL Vimeo, options
  - **Plan** : 🆓 Gratuit

- [ ] **SoundCloud Embed** - `soundcloud-embed`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : URL SoundCloud
  - **Plan** : 🆓 Gratuit

- [ ] **Spotify Embed** - `spotify-embed`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : URL Spotify
  - **Plan** : 🆓 Gratuit

- [ ] **Instagram Embed** - `instagram-embed`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : URL Instagram
  - **Plan** : 🆓 Gratuit

- [ ] **Twitter/X Embed** - `twitter-embed`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : URL Twitter/X
  - **Plan** : 🆓 Gratuit

- [ ] **Facebook Embed** - `facebook-embed`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : URL Facebook
  - **Plan** : 🆓 Gratuit

- [ ] **Embed** (Intégration) - `embed`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : URL iframe, responsive
  - **Plan** : 🆓 Gratuit

- [ ] **Audio Player** (Lecteur audio) - `audio-player`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : URL audio, controls, autoplay
  - **Plan** : 🆓 Gratuit

- [ ] **Map** (Carte) - `map`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Adresse, coordonnées, zoom, type (Google Maps, OpenStreetMap)
  - **Plan** : 🆓 Gratuit

- [ ] **Carousel** (Carrousel) - `carousel`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Items (images, contenu), autoplay, navigation, pagination
  - **Plan** : 🆓 Gratuit

- [ ] **Image Slider** (Diaporama) - `image-slider`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Images, transition, autoplay, navigation
  - **Plan** : 🆓 Gratuit

- [ ] **Lightbox** - `lightbox`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, z-index
  - **Propriétés de contenu** : Images, navigation, fermeture
  - **Plan** : 🆓 Gratuit

---

## 📊 Blocs de Données (⭐ Starter / 💼 Business / 🏢 Enterprise)

- [ ] **Chart** (Graphique) - `chart`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Type (line, bar, pie, etc.), données, options Chart.js
  - **Plan** : ⭐ Starter

- [ ] **Statistics** (Statistiques) - `stats`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Valeurs, labels, icônes, animations
  - **Plan** : ⭐ Starter

- [ ] **Counter** (Compteur) - `counter`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Valeur finale, durée, préfixe, suffixe, animation
  - **Plan** : ⭐ Starter

- [ ] **Progress Bar** (Barre de progression) - `progress-bar`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Pourcentage, couleur, animation, label
  - **Plan** : ⭐ Starter

- [ ] **Progress Circle** (Cercle de progression) - `progress-circle`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Pourcentage, couleur, animation, label
  - **Plan** : ⭐ Starter

- [ ] **Timeline** (Chronologie) - `timeline`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Événements, dates, positions (left, right, center)
  - **Plan** : ⭐ Starter

- [ ] **Calendar** (Calendrier) - `calendar`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Événements, vue (month, week, day), navigation
  - **Plan** : ⭐ Starter

- [ ] **Countdown** (Compte à rebours) - `countdown`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Date cible, format, animation
  - **Plan** : ⭐ Starter

---

## 📝 Blocs de Formulaire (🆓 Gratuits / ⭐ Starter / 💼 Business)

### Formulaires Gratuits
- [ ] **Form** (Formulaire de contact) - `form`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Champs, validation, action, méthode
  - **Plan** : 🆓 Gratuit

- [ ] **Form Newsletter** (Newsletter) - `form-newsletter`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Email, intégration service (Mailchimp, etc.)
  - **Plan** : 🆓 Gratuit

- [ ] **Form Search** (Recherche) - `form-search`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Placeholder, action, méthode
  - **Plan** : 🆓 Gratuit

- [ ] **Form Inscription** (Inscription) - `form-inscription`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Champs (nom, email, mot de passe), validation
  - **Plan** : 🆓 Gratuit

- [ ] **Form Login** (Formulaire de connexion) - `form-login`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Email, mot de passe, "Se souvenir", lien mot de passe oublié
  - **Plan** : 🆓 Gratuit

- [ ] **Booking Form** (Formulaire de réservation) - `booking-form`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Date, heure, nombre de personnes, informations contact
  - **Plan** : 🆓 Gratuit

- [ ] **Contact Form** (Formulaire contact) - `contact-form`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Nom, email, sujet, message
  - **Plan** : 🆓 Gratuit

- [ ] **Form Poll** (Sondage rapide) - `form-poll`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Question, options, résultats
  - **Plan** : 🆓 Gratuit

- [ ] **Form RSVP** - `form-rsvp`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Confirmation présence, nombre de personnes, allergies
  - **Plan** : 🆓 Gratuit

- [ ] **Captcha** - `captcha`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Type (reCAPTCHA, hCaptcha), clé
  - **Plan** : 🆓 Gratuit

### Formulaires Premium
- [ ] **Form Multi-step** (Formulaire multi-étapes) - `form-multi-step`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Étapes, progression, navigation
  - **Plan** : ⭐ Starter

- [ ] **Form Conditional** (Formulaire conditionnel) - `form-conditional`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Champs conditionnels, règles, logique
  - **Plan** : ⭐ Starter

- [ ] **Form Calculator** (Formulaire calculateur) - `form-calculator`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Calculs automatiques, formules, résultats
  - **Plan** : ⭐ Starter

- [ ] **Form File Upload** (Upload de fichiers) - `form-file-upload`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Types de fichiers, taille max, prévisualisation
  - **Plan** : ⭐ Starter

- [ ] **Form Payment** (Paiement) - `form-payment`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Intégration Stripe/PayPal, montant, devise
  - **Plan** : 💼 Business

- [ ] **Form Quiz** (Quiz) - `form-quiz`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Questions, réponses, score, résultats
  - **Plan** : ⭐ Starter

- [ ] **Form Survey** (Sondage) - `form-survey`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Questions multiples, types (choix multiple, texte, échelle), résultats
  - **Plan** : ⭐ Starter

---

## 🎯 Blocs Interactifs (⭐ Starter / 💼 Business / 🏢 Enterprise)

- [ ] **Tabs** (Onglets) - `tabs`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Onglets, contenu, style (tabs, pills)
  - **Plan** : ⭐ Starter

- [ ] **Accordion** (Accordéon) - `accordion`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Items, ouverture/fermeture, style
  - **Plan** : ⭐ Starter

- [ ] **Modal** (Modal/Popup) - `modal`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, z-index, position
  - **Propriétés de contenu** : Contenu, trigger, fermeture, taille
  - **Plan** : ⭐ Starter

- [ ] **FAQ Filters** (Filtres FAQ) - `faq-filters`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Catégories, filtres, FAQ items
  - **Plan** : ⭐ Starter

---

## 🎨 Blocs de Design (🆓 Gratuits / ⭐ Starter)

- [ ] **Hero** - `hero`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, background (image, couleur, gradient), overlay
  - **Propriétés de contenu** : Titre, sous-titre, CTA, image de fond, overlay
  - **Plan** : 🆓 Gratuit

- [ ] **Banner** (Bannière) - `banner`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, background
  - **Propriétés de contenu** : Contenu, image de fond, overlay, hauteur
  - **Plan** : 🆓 Gratuit

- [ ] **CTA Section** (Section CTA) - `cta-section`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, background
  - **Propriétés de contenu** : Titre, description, boutons CTA, style
  - **Plan** : 🆓 Gratuit

- [ ] **Feature Card** (Carte fonctionnalité) - `feature-card`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, border-radius, box-shadow
  - **Propriétés de contenu** : Icône, titre, description, lien
  - **Plan** : 🆓 Gratuit

- [ ] **Icon Box** (Boîte icône) - `icon-box`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, border-radius
  - **Propriétés de contenu** : Icône, titre, description, position icône
  - **Plan** : 🆓 Gratuit

- [ ] **Card** (Carte) - `card`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, border-radius, box-shadow
  - **Propriétés de contenu** : Contenu flexible, header, body, footer
  - **Plan** : 🆓 Gratuit

- [ ] **Card Grid** (Grille de cartes) - `card-grid`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Cartes, colonnes, responsive
  - **Plan** : 🆓 Gratuit

- [ ] **Testimonials** (Témoignages) - `testimonials`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Témoignages, auteur, photo, note, carousel
  - **Plan** : 🆓 Gratuit

- [ ] **Logo Grid** (Grille de logos) - `logo-grid`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Logos, colonnes, filtres, liens
  - **Plan** : 🆓 Gratuit

- [ ] **Logo Carousel** (Carrousel de logos) - `logo-carousel`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Logos, autoplay, navigation
  - **Plan** : 🆓 Gratuit

- [ ] **Team Member** (Membre d'équipe) - `team-member`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, border-radius
  - **Propriétés de contenu** : Photo, nom, poste, bio, liens sociaux
  - **Plan** : 🆓 Gratuit

- [ ] **Team Grid** (Grille d'équipe) - `team-grid`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Membres, colonnes, responsive
  - **Plan** : 🆓 Gratuit

- [ ] **Features Grid** (Grille Fonctionnalités) - `features-grid`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Fonctionnalités, colonnes, icônes
  - **Plan** : 🆓 Gratuit

---

## 📱 Blocs VTC Spécifiques (🆓 Gratuits / ⭐ Starter / 💼 Business)

- [ ] **Pricing Table VTC** (Tableau de prix VTC) - `pricing-table-vtc`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Tarifs, zones, services, comparaison
  - **Plan** : 🆓 Gratuit

- [ ] **Service Zones** (Zones de service) - `service-zones`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Zones, carte, tarifs par zone
  - **Plan** : 🆓 Gratuit

- [ ] **Vehicle Gallery** (Galerie véhicules) - `vehicle-gallery`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Véhicules, photos, détails, filtres
  - **Plan** : 🆓 Gratuit

- [ ] **Contact Buttons** (Boutons de contact) - `contact-buttons`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Téléphone, WhatsApp, Email, SMS
  - **Plan** : 🆓 Gratuit

- [ ] **Badges** - `badges`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Badges, certifications, sécurité
  - **Plan** : 🆓 Gratuit

- [ ] **Driver Profile** (Profil chauffeur) - `driver-profile`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, border-radius
  - **Propriétés de contenu** : Photo, nom, note, informations, véhicule
  - **Plan** : 🆓 Gratuit

- [ ] **Vehicle Comparison** (Comparaison véhicules) - `vehicle-comparison`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Véhicules, caractéristiques, tableau comparatif
  - **Plan** : ⭐ Starter

- [ ] **Service Packages** (Forfaits service) - `service-packages`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Forfaits, tarifs, services inclus
  - **Plan** : 🆓 Gratuit

- [ ] **Route Calculator** (Calculateur d'itinéraire) - `route-calculator`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Départ, arrivée, carte, distance, durée, tarif
  - **Plan** : ⭐ Starter

- [ ] **Fare Calculator** (Calculateur de tarif) - `fare-calculator`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Distance, durée, type véhicule, règles tarifaires, résultat
  - **Plan** : ⭐ Starter

- [ ] **Availability Calendar** (Calendrier disponibilité) - `availability-calendar`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Calendrier, disponibilité, réservation
  - **Plan** : ⭐ Starter

- [ ] **WhatsApp Button** - `whatsapp-button`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, border-radius
  - **Propriétés de contenu** : Numéro, message, position (flottant, inline)
  - **Plan** : 🆓 Gratuit

- [ ] **Phone Button** (Bouton téléphone) - `phone-button`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, border-radius
  - **Propriétés de contenu** : Numéro, position (flottant, inline)
  - **Plan** : 🆓 Gratuit

- [ ] **Email Button** (Bouton email) - `email-button`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, border-radius
  - **Propriétés de contenu** : Email, sujet, position (flottant, inline)
  - **Plan** : 🆓 Gratuit

- [ ] **SMS Button** (Bouton SMS) - `sms-button`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, border-radius
  - **Propriétés de contenu** : Numéro, message, position (flottant, inline)
  - **Plan** : 🆓 Gratuit

- [ ] **Trust Badges** (Badges de confiance) - `trust-badges`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Badges, certifications, sécurité, assurance
  - **Plan** : 🆓 Gratuit

- [ ] **Payment Methods** (Méthodes de paiement) - `payment-methods`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Logos méthodes de paiement, texte
  - **Plan** : 🆓 Gratuit

---

## 🛍️ Blocs E-commerce (💼 Business / 🏢 Enterprise)

- [ ] **Product Card** (Carte Produit) - `product-card`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, border-radius, box-shadow
  - **Propriétés de contenu** : Image, titre, prix, description, boutons
  - **Plan** : 💼 Business

- [ ] **Product Gallery** (Galerie produit) - `product-gallery`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Images, zoom, lightbox, thumbnails
  - **Plan** : 💼 Business

- [ ] **Product Details** (Détails produit) - `product-details`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Description, prix, options, variantes, stock
  - **Plan** : 💼 Business

- [ ] **Shopping Cart** (Panier) - `shopping-cart`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Produits, quantités, totaux, actions
  - **Plan** : 💼 Business

- [ ] **Checkout** (Paiement) - `checkout`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Formulaire, paiement, confirmation
  - **Plan** : 💼 Business

- [ ] **Pricing** (Tarifs) - `pricing`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Plans, prix, features, CTA
  - **Plan** : 🆓 Gratuit

- [ ] **Pricing Card** (Carte Tarif) - `pricing-card`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, border-radius, box-shadow
  - **Propriétés de contenu** : Nom, prix, features, CTA, badge (populaire, etc.)
  - **Plan** : 🆓 Gratuit

- [ ] **Pricing Cards Grid** (Grille Cartes Tarifs) - `pricing-cards-grid`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Cartes tarifs, colonnes, toggle mensuel/annuel
  - **Plan** : 🆓 Gratuit

- [ ] **Billing Cycle Toggle** (Toggle Mensuel/Annuel) - `billing-cycle-toggle`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Toggle, rabais annuel, mise à jour prix
  - **Plan** : 🆓 Gratuit

- [ ] **Add to Cart** (Ajouter au Panier) - `add-to-cart`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, border-radius
  - **Propriétés de contenu** : Produit, quantité, variantes, action
  - **Plan** : 💼 Business

- [ ] **Buy Now** (Acheter Maintenant) - `buy-now`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, border-radius
  - **Propriétés de contenu** : Produit, redirection checkout
  - **Plan** : 💼 Business

- [ ] **Reviews** (Avis Clients) - `reviews`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Avis, notes, auteurs, pagination
  - **Plan** : 💼 Business

- [ ] **Rating** (Évaluation) - `rating`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Note, étoiles, nombre d'avis, interactif
  - **Plan** : 🆓 Gratuit

- [ ] **Wishlist** (Liste de Souhaits) - `wishlist`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Produits, actions, partage
  - **Plan** : 💼 Business

- [ ] **Product Comparison** (Comparaison Produits) - `product-comparison`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Produits, caractéristiques, tableau
  - **Plan** : 💼 Business

---

## 🔧 Blocs Utilitaires (🆓 Gratuits)

- [ ] **Search Bar** (Barre de recherche) - `search-bar`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, border-radius
  - **Propriétés de contenu** : Placeholder, action, résultats
  - **Plan** : 🆓 Gratuit

- [ ] **Docs Grid** (Grille Documentation) - `docs-grid`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Sections documentation, icônes, liens
  - **Plan** : 🆓 Gratuit

- [ ] **Quick Start Section** (Section Démarrage Rapide) - `quick-start-section`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, background
  - **Propriétés de contenu** : Titre, description, étapes, CTA
  - **Plan** : 🆓 Gratuit

- [ ] **Support Hours** (Horaires Support) - `support-hours`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Horaires, fuseau horaire, statut (ouvert/fermé)
  - **Plan** : 🆓 Gratuit

- [ ] **Trial Info** (Info Essai Gratuit) - `trial-info`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, background
  - **Propriétés de contenu** : Durée essai, features, CTA
  - **Plan** : 🆓 Gratuit

- [ ] **FAQ Section** (Section FAQ) - `faq-section`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Questions, réponses, accordion, recherche
  - **Plan** : 🆓 Gratuit

- [ ] **Language Switcher** (Sélecteur langue) - `language-switcher`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, border-radius
  - **Propriétés de contenu** : Langues disponibles, drapeaux, sélection
  - **Plan** : 🆓 Gratuit

- [ ] **Theme Switcher** (Sélecteur thème) - `theme-switcher`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, border-radius
  - **Propriétés de contenu** : Thèmes (clair, sombre, auto), icônes
  - **Plan** : 🆓 Gratuit

- [ ] **Print Button** (Bouton imprimer) - `print-button`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, border-radius
  - **Propriétés de contenu** : Action impression, icône
  - **Plan** : 🆓 Gratuit

- [ ] **Copy Button** (Bouton copier) - `copy-button`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, border-radius
  - **Propriétés de contenu** : Texte à copier, confirmation
  - **Plan** : 🆓 Gratuit

- [ ] **Download Button** (Bouton télécharger) - `download-button`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, border-radius
  - **Propriétés de contenu** : Fichier, nom, type
  - **Plan** : 🆓 Gratuit

- [ ] **Back to Top** (Retour en haut) - `back-to-top`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, border-radius, position (fixed), z-index
  - **Propriétés de contenu** : Position (bottom-right, etc.), animation, seuil scroll
  - **Plan** : 🆓 Gratuit

- [ ] **Scroll Progress** (Progression Scroll) - `scroll-progress`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, position (fixed), z-index
  - **Propriétés de contenu** : Barre de progression, position (top, bottom), couleur
  - **Plan** : 🆓 Gratuit

- [ ] **Preloader** (Préchargeur) - `preloader`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, position (fixed), z-index, opacity
  - **Propriétés de contenu** : Animation, logo, texte, durée
  - **Plan** : 🆓 Gratuit

- [ ] **Loading Spinner** (Indicateur chargement) - `loading-spinner`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, opacity
  - **Propriétés de contenu** : Type spinner, couleur, taille
  - **Plan** : 🆓 Gratuit

- [ ] **Skeleton Loader** (Chargeur squelette) - `skeleton-loader`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, opacity
  - **Propriétés de contenu** : Forme, animation, nombre
  - **Plan** : 🆓 Gratuit

- [ ] **Coming Soon** (Bientôt Disponible) - `coming-soon`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, background
  - **Propriétés de contenu** : Message, date, formulaire notification
  - **Plan** : 🆓 Gratuit

- [ ] **Under Construction** (En Construction) - `under-construction`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, background
  - **Propriétés de contenu** : Message, illustration, contact
  - **Plan** : 🆓 Gratuit

- [ ] **404 Page** (Page 404) - `404-page`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, background
  - **Propriétés de contenu** : Message, illustration, liens navigation
  - **Plan** : 🆓 Gratuit

- [ ] **Cookie Consent** (Consentement Cookies) - `cookie-consent`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures, border-radius, position (fixed), z-index
  - **Propriétés de contenu** : Message, boutons (accepter, refuser), lien politique
  - **Plan** : 🆓 Gratuit

- [ ] **Contact Info** (Info Contact) - `contact-info`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Adresse, téléphone, email, horaires
  - **Plan** : 🆓 Gratuit

- [ ] **Contact Hours** (Heures Contact) - `contact-hours`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Horaires, jours, statut (ouvert/fermé)
  - **Plan** : 🆓 Gratuit

- [ ] **Social Links** (Liens Sociaux) - `social-links`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Plateformes, URLs, icônes, style
  - **Plan** : 🆓 Gratuit

- [ ] **Social Share** (Partage Social) - `social-share`
  - **Propriétés de style** : Toutes les propriétés, dimensions, espacement, bordures
  - **Propriétés de contenu** : Plateformes, URL à partager, compteurs
  - **Plan** : 🆓 Gratuit

---

## 📝 Notes de Validation

### Comment utiliser cette checklist :
1. Testez chaque bloc dans l'éditeur
2. Vérifiez que le bloc s'affiche correctement dans la prévisualisation
3. Vérifiez que les propriétés du bloc fonctionnent (édition, styles, etc.)
4. Vérifiez que le bloc fonctionne en mode responsive
5. Vérifiez que les propriétés de style s'appliquent correctement
6. Cochez `[x]` une fois le bloc validé

### Critères de validation :
- ✅ Le bloc s'affiche correctement
- ✅ Les propriétés sont éditables
- ✅ Les styles s'appliquent correctement
- ✅ Le bloc est responsive
- ✅ Aucune erreur dans la console
- ✅ Le bloc fonctionne en mode sombre/clair
- ✅ Les propriétés de style avancées fonctionnent (pour blocs premium)

### Attribution des Plans

#### 🆓 Gratuit (Tous les plans)
- Blocs de base (texte, images, liens, boutons)
- Blocs de mise en page (container, grid, flex)
- Formulaires de base (contact, newsletter, recherche)
- Blocs VTC essentiels (tarifs, zones, galerie véhicules)
- Blocs utilitaires (recherche, langue, thème)

#### ⭐ Starter (Starter et supérieurs)
- Blocs de données (graphiques, statistiques, compteurs)
- Formulaires avancés (multi-étapes, conditionnels, calculateur)
- Blocs interactifs (tabs, accordion, modal)
- Calculateurs VTC (itinéraire, tarif, disponibilité)

#### 💼 Business (Business et Enterprise)
- Formulaires de paiement
- Blocs e-commerce complets (panier, checkout, produits)
- Comparaisons avancées

#### 🏢 Enterprise (Enterprise uniquement)
- Fonctionnalités avancées spécifiques (à définir selon besoins)

---

**Date de création :** 04/12/2025  
**Dernière mise à jour :** 09/12/2025  
**Total de blocs :** 131 blocs
