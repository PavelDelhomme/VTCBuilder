# Roadmap de l'Éditeur de Blocs - VTCBuilder

> **Note:** Ce fichier liste toutes les fonctionnalités de l'éditeur à vérifier, améliorer ou implémenter.

## 📋 Statut Global

- ✅ **Fonctionnel** : Fonctionnalité opérationnelle
- 🔄 **En cours** : En développement
- ⏳ **Planifié** : Prévu mais pas encore commencé
- ❌ **À corriger** : Problème identifié nécessitant une correction
- 🎯 **Amélioration** : Amélioration suggérée

---

## 🎨 Interface Utilisateur

### Barre d'outils principale
- ✅ Boutons agrandis pour meilleure utilisabilité sur ordinateur
- ✅ Responsive : Icônes seulement sur petits écrans, texte + icônes sur grands écrans
- 🔄 Amélioration de l'ordre et de la visibilité des boutons sur petits écrans
- ⏳ Menu déroulant pour boutons secondaires sur très petits écrans

### Boutons de la barre d'outils
- ✅ Retour aux projets
- ✅ Mode Desktop/Tablette/Mobile
- ✅ Mode sombre/Mode clair (prévisualisation)
- ✅ Ouvrir dans un nouvel onglet
- ✅ Indicateur de sauvegarde automatique
- ✅ Menu Options (Pages, Statut)
- ✅ Toggle liens (Activer/Désactiver)
- ✅ Annuler/Rétablir (Undo/Redo)
- ✅ Toggle Palette de blocs
- ✅ Bouton Sauvegarder/Publier

### Responsive Design
- ✅ Boutons s'adaptent à la taille de l'écran
- 🔄 Réorganisation intelligente des boutons sur petits écrans
- ⏳ Menu hamburger pour boutons secondaires sur mobile

---

## 🧩 Fonctionnalités de l'Éditeur

### Sélection et Navigation
- ✅ Sélection de blocs par clic
- ✅ Sélection de blocs enfants dans les conteneurs
- ✅ Hover pour identifier les blocs
- ⏳ Clic droit pour menu contextuel
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
- ⏳ Aperçu responsive (Desktop/Tablette/Mobile) dans l'éditeur

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
- ✅ Indicateur de statut de sauvegarde
- ✅ Gestion des brouillons et publications
- ⏳ Sauvegarde locale (localStorage) en cas de perte de connexion

---

## 🎯 Fonctionnalités Avancées

### Recherche et Filtrage
- ⏳ Recherche de blocs dans la palette
- ⏳ Filtrage par catégorie
- ⏳ Recherche dans le contenu des blocs

### Duplication et Copie
- ⏳ Dupliquer un bloc
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
- ❌ Bouton "Rétablir" peut être caché sous "Mode sombre/Mode clair" sur petits écrans
- 🔄 Amélioration de la détection des clics sur blocs enfants dans conteneurs
- ✅ Texte des boutons se met à jour en temps réel (corrigé)
- ✅ Layout par défaut des blocs (corrigé : 3 colonnes au lieu de 12)
- ✅ Boutons de la barre d'outils agrandis (corrigé)

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

---

## 📅 Priorités

### Priorité Haute 🔴
1. Améliorer la responsivité des boutons de la barre d'outils
2. Corriger le problème de visibilité du bouton "Rétablir"
3. Améliorer la sélection des blocs enfants dans les conteneurs

### Priorité Moyenne 🟡
1. Menu contextuel (clic droit)
2. Mode déplacement manuel
3. Recherche dans la palette de blocs

### Priorité Basse 🟢
1. Templates et presets
2. Export/Import
3. Collaboration en temps réel

---

**Dernière mise à jour :** 2024-12-12
**Maintenu par :** Équipe VTCBuilder

