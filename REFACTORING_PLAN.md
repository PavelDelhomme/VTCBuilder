# Plan de Refactoring - BlockPreview.tsx et BlockRenderer.tsx

## 📊 État actuel

- **BlockPreview.tsx** : 5117 lignes
- **BlockRenderer.tsx** : 2887 lignes
- **Total** : 8004 lignes

## 🎯 Objectif

Subdiviser ces deux fichiers en sous-fichiers modulaires pour améliorer la maintenabilité, la lisibilité et la testabilité.

---

## 📁 Structure proposée pour BlockPreview.tsx

### 1. **BlockPreview.tsx** (composant principal - ~200 lignes)
- Interface `BlockPreviewProps`
- Composant `BlockPreview` principal
- Logique de base (props, état initial)
- Import et utilisation des sous-composants

### 2. **hooks/useBlockPreview.ts** (~300 lignes)
- `useBlockPreview` hook personnalisé
- Logique de drag & drop (handleDragStart, handleDragEnd)
- Handlers de clics (handleBlockClick, handleBlockDoubleClick, handleBlockRightClick)
- Gestion de l'inspecteur (inspectorMode)
- Gestion du hover (hoveredElement)
- Sensors pour dnd-kit

### 3. **hooks/useBlockPreviewEvents.ts** (~200 lignes)
- Gestion des événements DOM (mouseover, mouseout, click)
- Détection des blocs au survol
- Gestion des outlines pour l'inspecteur
- Nettoyage des event listeners

### 4. **components/SortablePreviewBlock.tsx** (~100 lignes)
- Composant `SortablePreviewBlock`
- Intégration avec `useSortable` de dnd-kit
- Styles et transformations
- Props et types

### 5. **components/FAQSectionPreview.tsx** (~80 lignes)
- Composant `FAQSectionPreview`
- Gestion de l'état ouvert/fermé
- Styles et animations

### 6. **components/BlockPreviewRenderer.tsx** (~4000 lignes → réduit à ~500 lignes)
- Composant `BlockPreviewRenderer`
- Calcul des styles (wrapperStyles, contentStyles)
- Calcul du layoutWidth
- Appel à `getBlockPreviewCase` pour les cases extraits
- Fallback vers le switch case original (qui sera progressivement supprimé)
- **Note** : Ce fichier sera grandement réduit une fois tous les cases extraits

### 7. **utils/blockStyles.ts** (~200 lignes)
- Fonction `calculateWrapperStyles(block, theme)`
- Fonction `calculateContentStyles(block, theme)`
- Fonction `getLayoutWidth(block)` - calcul des colonnes
- Fonction `getContainerClass(block)`
- Utilitaires de styles

### 8. **types/BlockPreview.types.ts** (~50 lignes)
- Interface `BlockPreviewProps`
- Types pour les handlers
- Types pour les états

---

## 📁 Structure proposée pour BlockRenderer.tsx

### 1. **BlockRenderer.tsx** (composant principal - ~200 lignes)
- Interface `BlockRendererProps`
- Composant `BlockRenderer` principal
- Logique de base
- Import et utilisation des sous-composants

### 2. **components/BlockPropertiesPanel.tsx** (~1500 lignes)
- Panneau de propriétés des blocs
- Tous les champs de configuration
- Gestion des différents types de blocs
- Imports des configs depuis `blocks-implementations.tsx`

### 3. **components/BlockPropertiesFields.tsx** (~800 lignes)
- Champs de formulaire réutilisables
- Input, Textarea, Select, Checkbox, etc.
- Composants de sélection (ImageSelector, PageSelector, etc.)
- Validation et erreurs

### 4. **utils/blockConfigHelpers.ts** (~200 lignes)
- Fonctions utilitaires pour la configuration
- Helpers pour les valeurs par défaut
- Validation des données de blocs
- Transformation des données

### 5. **hooks/useBlockProperties.ts** (~100 lignes)
- Hook pour gérer l'état des propriétés
- Gestion des changements
- Validation en temps réel

### 6. **types/BlockRenderer.types.ts** (~50 lignes)
- Interface `BlockRendererProps`
- Types pour les propriétés
- Types pour les configs

---

## 🔄 Ordre d'implémentation

### Phase 1 : BlockPreview.tsx
1. ✅ Créer `types/BlockPreview.types.ts`
2. ✅ Créer `utils/blockStyles.ts`
3. ✅ Créer `hooks/useBlockPreview.ts`
4. ✅ Créer `hooks/useBlockPreviewEvents.ts`
5. ✅ Créer `components/SortablePreviewBlock.tsx`
6. ✅ Créer `components/FAQSectionPreview.tsx`
7. ✅ Refactoriser `components/BlockPreviewRenderer.tsx`
8. ✅ Refactoriser `BlockPreview.tsx` principal

### Phase 2 : BlockRenderer.tsx
1. ✅ Créer `types/BlockRenderer.types.ts`
2. ✅ Créer `utils/blockConfigHelpers.ts`
3. ✅ Créer `hooks/useBlockProperties.ts`
4. ✅ Créer `components/BlockPropertiesFields.tsx`
5. ✅ Créer `components/BlockPropertiesPanel.tsx`
6. ✅ Refactoriser `BlockRenderer.tsx` principal

---

## 📝 Notes importantes

### Imports circulaires
- Éviter les imports circulaires entre les fichiers
- Utiliser des types partagés dans `types/`
- Centraliser les utilitaires communs

### Tests
- Chaque sous-fichier doit être testable indépendamment
- Créer des tests unitaires pour les hooks
- Créer des tests de composants pour les composants

### Performance
- Maintenir les `memo()` et optimisations existantes
- Vérifier que les hooks ne causent pas de re-renders inutiles
- Optimiser les calculs de styles

### Compatibilité
- Maintenir la compatibilité avec le code existant
- Ne pas casser les props ou interfaces publiques
- Migration progressive

---

## ✅ Checklist

### BlockPreview.tsx
- [ ] Créer types/BlockPreview.types.ts
- [ ] Créer utils/blockStyles.ts
- [ ] Créer hooks/useBlockPreview.ts
- [ ] Créer hooks/useBlockPreviewEvents.ts
- [ ] Créer components/SortablePreviewBlock.tsx
- [ ] Créer components/FAQSectionPreview.tsx
- [ ] Refactoriser components/BlockPreviewRenderer.tsx
- [ ] Refactoriser BlockPreview.tsx principal
- [ ] Tests unitaires
- [ ] Vérification des performances

### BlockRenderer.tsx
- [ ] Créer types/BlockRenderer.types.ts
- [ ] Créer utils/blockConfigHelpers.ts
- [ ] Créer hooks/useBlockProperties.ts
- [ ] Créer components/BlockPropertiesFields.tsx
- [ ] Créer components/BlockPropertiesPanel.tsx
- [ ] Refactoriser BlockRenderer.tsx principal
- [ ] Tests unitaires
- [ ] Vérification des performances

---

**Date de création** : Après extraction de 24 cases (basic + layout + forms)
**Prochaine étape** : Commencer la Phase 1 - BlockPreview.tsx

