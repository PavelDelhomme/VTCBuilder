# Roadmap de l'Éditeur de Blocs - VTCBuilder

> **Note:** Ce fichier liste toutes les fonctionnalités de l'éditeur à vérifier, améliorer ou implémenter.

## 📋 Statut Global

- ✅ **Fonctionnel** : Fonctionnalité opérationnelle
- 🔄 **En cours** : En développement
- ⏳ **Planifié** : Prévu mais pas encore commencé
- ❌ **À corriger** : Problème identifié nécessitant une correction
- 🎯 **Amélioration** : Amélioration suggérée
- 🧪 **En validation** : En cours de validation étape par étape

---

## 🧪 Système de Validation Étape par Étape

### Phase 1 : Blocs de Mise en Page de Base (EN COURS)
**Objectif :** Valider les blocs fondamentaux de mise en page

**Blocs activés :**
- ✅ Heading (Titre)
- ✅ Text (Texte)
- ✅ Container (Conteneur)

**Critères de validation :**
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

**Statut :** 🧪 En validation

---

### Phase 2 : Blocs Conteneurs
**Objectif :** Valider les blocs conteneurs pour organiser le contenu

**Blocs à activer :**
- ⏳ Columns (Colonnes)
- ⏳ Section (Section)

**Critères de validation :**
- [ ] Les conteneurs acceptent des blocs enfants
- [ ] Les blocs enfants s'affichent correctement
- [ ] Le clic droit sur les enfants ouvre les paramètres
- [ ] Le drag & drop fonctionne dans les conteneurs
- [ ] Les propriétés de style s'appliquent aux conteneurs
- [ ] Les conteneurs sont responsive

**Statut :** ⏳ En attente de Phase 1

---

### Phase 3 : Blocs de Contenu Avancés
**Objectif :** Valider les blocs de contenu plus complexes

**Blocs à activer :**
- ⏳ Paragraph (Paragraphe)
- ⏳ Button (Bouton)
- ⏳ Image (Image)
- ⏳ Line (Ligne)

**Statut :** ⏳ En attente de Phase 2

---

### Phase 4 : Blocs Interactifs
**Objectif :** Valider les blocs avec interactions

**Blocs à activer :**
- ⏳ Form (Formulaire)
- ⏳ Modal (Modal)
- ⏳ Tabs (Onglets)
- ⏳ Accordion (Accordéon)

**Statut :** ⏳ En attente de Phase 3

---

### Phase 5 : Blocs Complexes
**Objectif :** Valider les blocs les plus complexes

**Blocs à activer :**
- ⏳ Hero (Héro)
- ⏳ CTA Section (Section CTA)
- ⏳ Features Grid (Grille Fonctionnalités)
- ⏳ Footer (Pied de page)

**Statut :** ⏳ En attente de Phase 4

---

## 🎨 Interface Utilisateur

### Barre d'outils principale
- ✅ Boutons agrandis pour meilleure utilisabilité sur ordinateur
- ✅ Responsive : Icônes seulement sur petits écrans, texte + icônes sur grands écrans
- ✅ Tous les boutons tiennent sur une seule ligne
- ✅ Pas d'espace entre le header et la barre d'outils
- ✅ Contrôles de prévisualisation déplacés vers la barre d'outils principale

### Boutons de la barre d'outils
- ✅ Retour aux projets
- ✅ Mode Desktop/Tablette/Mobile (déplacé dans la barre d'outils)
- ✅ Mode sombre/Mode clair (déplacé dans la barre d'outils)
- ✅ Menu Options (Pages, Statut) - Corrigé (affichage)
- ✅ Toggle liens (Activer/Désactiver)
- ✅ Annuler/Rétablir (Undo/Redo)
- ✅ Toggle Palette de blocs
- ✅ Bouton Sauvegarder/Publier
- ✅ État de sauvegarde (heure dernière sauvegarde)

### Responsive Design
- ✅ Boutons s'adaptent à la taille de l'écran
- ✅ Réorganisation intelligente des boutons sur petits écrans
- ⏳ Menu hamburger pour boutons secondaires sur mobile

---

## 🧩 Fonctionnalités de l'Éditeur

### Sélection et Navigation
- ✅ Sélection de blocs par clic
- ✅ Sélection de blocs enfants dans les conteneurs
- ✅ Hover pour identifier les blocs
- ✅ Clic droit pour menu contextuel (avec option "Déplacer")
- ⏳ Mode déplacement manuel (drag & drop avec souris)
- ⏳ Déplacer des blocs entre conteneurs
- ⏳ Déplacer des blocs au-dessus/en dessous d'autres blocs

### Drag & Drop
- ✅ Glisser-déposer des blocs depuis la palette
- ✅ Réorganisation des blocs par drag & drop
- 🔄 Amélioration de la détection des zones de drop
- ⏳ Indicateurs visuels pour zones de drop valides
- ⏳ Drag & drop dans les conteneurs

### Mise à jour en temps réel
- ✅ Mise à jour immédiate du texte (titres, paragraphes, boutons)
- ✅ Mise à jour immédiate des propriétés de contenu (niveau, alignement, couleur)
- ✅ Debounce pour les propriétés de style (padding, margin, etc.)
- ✅ Prévisualisation en direct synchronisée avec l'éditeur

### Layout et Responsive
- ✅ Système de colonnes (1-12 sur 12)
- ✅ Layout par défaut : 3 colonnes (au lieu de 12)
- ✅ Redimensionnement des blocs par drag des poignées
- ✅ Sélecteur de layout dans le panneau de propriétés
- ✅ Aperçu responsive (Desktop/Tablette/Mobile) dans l'éditeur

### Propriétés des Blocs

#### Panneau de Contenu
- ✅ Édition du texte des blocs
- ✅ Configuration des propriétés spécifiques (niveau de titre, URL, etc.)
- ✅ Sélecteur de page pour les liens
- ⏳ Éditeur de texte riche (WYSIWYG)
- ⏳ Prévisualisation des médias

#### Panneau de Style
- ✅ Couleurs (background, text)
- ✅ Typographie (font-size, font-weight, etc.)
- ✅ Espacement (padding, margin)
- ✅ Alignement (text-align)
- ✅ Bordures et ombres
- ⏳ Animations et transitions
- ⏳ Responsive styles (mobile/tablet/desktop)

#### Panneau de Mise en page
- ✅ Layout (colonnes sur 12)
- ✅ Conteneur (container, container-fluid, none)
- ✅ Position (static, relative, absolute, fixed, sticky)
- ⏳ Z-index
- ⏳ Overflow

### Historique (Undo/Redo)
- ✅ Historique complet des modifications
- ✅ Annuler (Ctrl+Z)
- ✅ Rétablir (Ctrl+Y)
- ✅ Indicateurs visuels (boutons désactivés si pas d'historique)
- ⏳ Historique limité (éviter consommation mémoire excessive)

### Sauvegarde
- ✅ Sauvegarde manuelle (Ctrl+S)
- ✅ Sauvegarde automatique
- ✅ Indicateur de statut de sauvegarde (heure dernière sauvegarde)
- ✅ Gestion des brouillons et publications
- ⏳ Sauvegarde locale (localStorage) en cas de perte de connexion

---

## 🎯 Fonctionnalités Avancées

### Recherche et Filtrage
- ⏳ Recherche de blocs dans la palette
- ⏳ Filtrage par catégorie
- ⏳ Recherche dans le contenu des blocs

### Duplication et Copie
- ✅ Dupliquer un bloc (menu contextuel)
- ⏳ Copier/Coller des blocs
- ⏳ Copier/Coller entre pages

### Templates et Presets
- ⏳ Sauvegarder un bloc comme template
- ⏳ Appliquer un template à un bloc
- ⏳ Bibliothèque de templates

### Collaboration
- ⏳ Édition simultanée (multi-utilisateurs)
- ⏳ Indicateurs de présence
- ⏳ Historique des modifications par utilisateur

### Export/Import
- ⏳ Exporter une page en JSON
- ⏳ Importer une page depuis JSON
- ⏳ Export HTML statique

---

## 🐛 Bugs et Corrections

### Problèmes Identifiés
- ✅ Bouton "Rétablir" peut être caché sous "Mode sombre/Mode clair" sur petits écrans (corrigé)
- ✅ Amélioration de la détection des clics sur blocs enfants dans conteneurs (corrigé)
- ✅ Texte des boutons se met à jour en temps réel (corrigé)
- ✅ Layout par défaut des blocs (corrigé : 3 colonnes au lieu de 12)
- ✅ Boutons de la barre d'outils agrandis (corrigé)
- ✅ Dropdown Options n'affiche rien (corrigé)
- ✅ Espace entre header et barre d'outils (corrigé)
- ✅ Option "Déplacer" dans menu contextuel (ajouté)
- ✅ État de sauvegarde affiché (ajouté)

### Problèmes Potentiels
- ⏳ Performance avec beaucoup de blocs
- ⏳ Gestion de la mémoire pour l'historique
- ⏳ Synchronisation entre éditeur et prévisualisation

---

## 🚀 Améliorations Futures

### Performance
- ⏳ Virtualisation de la liste des blocs
- ⏳ Lazy loading des blocs complexes
- ⏳ Optimisation du rendu de la prévisualisation
- ⏳ Debounce optimisé selon le type de modification

### Accessibilité
- ⏳ Navigation au clavier complète
- ⏳ Support des lecteurs d'écran
- ⏳ Contraste et lisibilité améliorés
- ⏳ Raccourcis clavier documentés

### Expérience Utilisateur
- ⏳ Tutoriel interactif pour nouveaux utilisateurs
- ⏳ Tooltips contextuels améliorés
- ⏳ Messages d'erreur plus clairs
- ⏳ Confirmations pour actions destructives
- ⏳ Raccourcis clavier personnalisables

### Fonctionnalités Métier
- ⏳ Validation des formulaires
- ⏳ Aperçu SEO en temps réel
- ⏳ Analyse de performance de la page
- ⏳ Suggestions d'amélioration automatiques

---

## 📝 Notes de Développement

### Architecture
- L'éditeur utilise React avec TypeScript
- Gestion d'état avec hooks personnalisés (useHistory)
- Drag & drop avec dnd-kit
- Prévisualisation isolée du thème de l'éditeur

### Fichiers Principaux
- `frontend/src/app/admin/homepage/page.tsx` - Page principale de l'éditeur
- `frontend/src/components/editor/BlockEditor.tsx` - Composant principal de l'éditeur
- `frontend/src/components/editor/BlockPreview.tsx` - Composant de prévisualisation
- `frontend/src/components/editor/types.ts` - Types TypeScript

### Tests
- ⏳ Tests unitaires pour les composants de l'éditeur
- ⏳ Tests d'intégration pour le drag & drop
- ⏳ Tests E2E pour le flux complet d'édition

### Système de Validation
- Les blocs sont validés étape par étape selon les phases définies
- Variable d'environnement `NEXT_PUBLIC_BLOCK_VALIDATION_PHASE` pour contrôler les phases
- Chaque phase valide un groupe de blocs avant de passer à la suivante
- Voir `CHECKLIST_BLOCKS_ROADMAP.md` pour la checklist détaillée de chaque bloc

---

## 📅 Priorités

### Priorité Haute 🔴
1. ✅ Améliorer la responsivité des boutons de la barre d'outils (fait)
2. ✅ Corriger le problème de visibilité du bouton "Rétablir" (fait)
3. ✅ Améliorer la sélection des blocs enfants dans les conteneurs (fait)
4. 🧪 **Valider Phase 1 : Blocs de mise en page de base** (en cours)

### Priorité Moyenne 🟡
1. 🧪 Valider Phase 2 : Blocs conteneurs
2. Menu contextuel (clic droit) - Amélioration
3. Mode déplacement manuel
4. Recherche dans la palette de blocs

### Priorité Basse 🟢
1. Templates et presets
2. Export/Import
3. Collaboration en temps réel

---

## 🔗 Liens vers les autres fichiers de roadmap

- **BLOCKS_ROADMAP.md** : Liste exhaustive de tous les blocs potentiels
- **CHECKLIST_BLOCKS_ROADMAP.md** : Checklist détaillée pour validation de chaque bloc

---

**Dernière mise à jour :** 2024-12-12
**Maintenu par :** Équipe VTCBuilder
**Phase de validation actuelle :** Phase 1 - Blocs de mise en page de base
