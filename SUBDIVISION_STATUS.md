# 📊 État des Subdivisions - VTCBuilder Editor

**Dernière mise à jour :** 2025-12-23  
**Objectif :** Subdiviser les gros fichiers de l'éditeur pour améliorer la maintenabilité et la lisibilité

---

## 📋 Vue d'ensemble

### Fichiers à subdiviser (par ordre de priorité)

| Fichier | Lignes | Statut | Priorité |
|---------|--------|--------|----------|
| `BlockEditor.tsx` | ~4277 | 🔴 À faire | 1 (Plus gros) |
| `ComplexRenderers.tsx` | ~1860 | 🔴 À faire | 2 |
| `BlockStylePanel.tsx` | ~978 | 🔴 À faire | 3 |
| `BlockRenderer.tsx` | ~412 | 🟡 Partiellement fait | 4 |

---

## ✅ Travail déjà effectué

### 1. BlockPreview.tsx - ✅ COMPLET (100%)
- **Statut :** Tous les cases extraits dans `preview-cases/`
- **Fichiers créés :**
  - `preview-cases/basic.tsx` (11 cases)
  - `preview-cases/layout.tsx` (15 cases)
  - `preview-cases/forms.tsx` (15 cases)
  - `preview-cases/vtc.tsx` (15 cases)
  - `preview-cases/complex.tsx` (13 cases)
  - `preview-cases/interactive.tsx` (9 cases)
  - `preview-cases/media.tsx` (10 cases)
  - `preview-cases/data.tsx` (9 cases)
  - `preview-cases/content.tsx` (20 cases)
  - `preview-cases/index.ts` (export centralisé)

### 2. BlockRenderer.tsx - 🟡 PARTIELLEMENT FAIT
- **Statut :** Cases extraits dans `renderer-cases/`
- **Fichiers créés :**
  - `renderer-cases/content-cards.tsx`
  - `renderer-cases/content-navigation.tsx`
  - `renderer-cases/content-media.tsx`
  - `renderer-cases/content-display.tsx`
  - `renderer-cases/vtc-forms.tsx`
  - `renderer-cases/vtc-display.tsx`
  - `renderer-cases/index.ts` (export centralisé)
- **Reste à faire :** Vérifier si tous les cases sont bien extraits

---

## 🔴 À FAIRE - Plan de Subdivision

### 1. BlockEditor.tsx (~4277 lignes) - PRIORITÉ 1

**Objectif :** Extraire les composants et hooks pour réduire la complexité

#### Composants à extraire :
- [ ] `DraggableBlock` → `components/DraggableBlock.tsx`
- [ ] `DraggableChildBlock` → `components/DraggableChildBlock.tsx`
- [ ] `BlocksPalettePopup` → `components/BlocksPalettePopup.tsx` (déjà extrait ?)
- [ ] `BlockPropertiesModal` → `components/BlockPropertiesModal.tsx` (déjà extrait ?)
- [ ] `BlockContextMenu` → `components/BlockContextMenu.tsx` (déjà extrait ?)
- [ ] `BlockStylePanel` → `components/BlockStylePanel.tsx` (déjà extrait ?)
- [ ] Autres composants internes

#### Hooks à extraire :
- [ ] `useBlockEditor` → `hooks/useBlockEditor.ts`
- [ ] `useDragAndDrop` → `hooks/useDragAndDrop.ts`
- [ ] `useBlockSelection` → `hooks/useBlockSelection.ts`
- [ ] `useUndoRedo` → `hooks/useUndoRedo.ts`
- [ ] Autres hooks personnalisés

#### Utilitaires à extraire :
- [ ] Fonctions de manipulation de blocs → `utils/block-utils.ts`
- [ ] Fonctions de validation → `utils/block-validation.ts`
- [ ] Constantes et types → `types/block-editor-types.ts`

**Estimation :** ~15-20 fichiers créés

---

### 2. ComplexRenderers.tsx (~1860 lignes) - PRIORITÉ 2

**Objectif :** Subdiviser les renderers complexes en fichiers thématiques

#### Fichiers à créer :
- [ ] `renderers/complex/hero.tsx` → `renderHero`
- [ ] `renderers/complex/features.tsx` → `renderFeaturesGrid`, `renderFeatureCard`
- [ ] `renderers/complex/cta.tsx` → `renderCTASection`
- [ ] `renderers/complex/testimonials.tsx` → `renderTestimonials`
- [ ] `renderers/complex/pricing.tsx` → `renderPricing`
- [ ] `renderers/complex/timeline.tsx` → `renderTimeline`
- [ ] `renderers/complex/stats.tsx` → `renderStats`
- [ ] `renderers/complex/social.tsx` → `renderSocialLinks`
- [ ] `renderers/complex/faq.tsx` → `renderFAQ`
- [ ] `renderers/complex/accordion.tsx` → `renderAccordion` (si pas déjà dans interactive)
- [ ] Autres renderers complexes

**Estimation :** ~10-12 fichiers créés

---

### 3. BlockStylePanel.tsx (~978 lignes) - PRIORITÉ 3

**Objectif :** Extraire les panneaux de style en composants réutilisables

#### Composants à extraire :
- [ ] `ColorPickerPanel` → `components/style/ColorPickerPanel.tsx`
- [ ] `SpacingPanel` → `components/style/SpacingPanel.tsx`
- [ ] `BorderPanel` → `components/style/BorderPanel.tsx`
- [ ] `ShadowPanel` → `components/style/ShadowPanel.tsx`
- [ ] `TypographyPanel` → `components/style/TypographyPanel.tsx`
- [ ] `LayoutPanel` → `components/style/LayoutPanel.tsx`
- [ ] `BackgroundPanel` → `components/style/BackgroundPanel.tsx`
- [ ] `ResponsivePanel` → `components/style/ResponsivePanel.tsx`

#### Hooks à extraire :
- [ ] `useStylePanel` → `hooks/useStylePanel.ts`
- [ ] `useColorPicker` → `hooks/useColorPicker.ts`

**Estimation :** ~10-12 fichiers créés

---

## 📝 Notes de Subdivision

### Principes à suivre :
1. **Un fichier = une responsabilité** : Chaque fichier doit avoir un rôle clair
2. **Réutilisabilité** : Extraire les composants réutilisables
3. **Testabilité** : Faciliter les tests unitaires
4. **Lisibilité** : Réduire la complexité cognitive
5. **Maintenabilité** : Faciliter les modifications futures

### Structure cible :
```
frontend/src/components/editor/
├── components/          # Composants réutilisables
│   ├── DraggableBlock.tsx
│   ├── DraggableChildBlock.tsx
│   └── style/          # Composants de style
├── hooks/              # Hooks personnalisés
│   ├── useBlockEditor.ts
│   └── useDragAndDrop.ts
├── utils/              # Utilitaires
│   ├── block-utils.ts
│   └── block-validation.ts
├── types/              # Types TypeScript
│   └── block-editor-types.ts
└── renderers/          # Renderers (déjà partiellement organisé)
    └── complex/        # Renderers complexes (à subdiviser)
```

---

## ✅ Checklist de Validation

Après chaque subdivision :
- [ ] Le code compile sans erreurs
- [ ] Les tests passent (si existants)
- [ ] L'application démarre correctement
- [ ] Aucune régression fonctionnelle
- [ ] Les imports sont corrects
- [ ] La documentation est mise à jour
- [ ] Commit et push effectués

---

## 📅 Planning

### Phase 1 : BlockEditor.tsx (Priorité 1)
- **Durée estimée :** 2-3 jours
- **Début :** À planifier
- **Fin :** À planifier

### Phase 2 : ComplexRenderers.tsx (Priorité 2)
- **Durée estimée :** 1-2 jours
- **Début :** Après Phase 1
- **Fin :** À planifier

### Phase 3 : BlockStylePanel.tsx (Priorité 3)
- **Durée estimée :** 1 jour
- **Début :** Après Phase 2
- **Fin :** À planifier

### Phase 4 : Tests et Validation
- **Durée estimée :** 2-3 jours
- **Début :** Après toutes les subdivisions
- **Fin :** À planifier

---

## 🔄 Prochaines étapes

1. ✅ Créer ce fichier de suivi
2. 🔴 Commencer la subdivision de `BlockEditor.tsx`
3. 🔴 Continuer avec `ComplexRenderers.tsx`
4. 🔴 Finir avec `BlockStylePanel.tsx`
5. 🔴 Créer les tests pour toutes les fonctionnalités
6. 🔴 Mettre à jour la documentation
7. 🔴 Continuer le Blocks Roadmap

---

**Note :** Ce fichier sera mis à jour régulièrement au fur et à mesure de l'avancement.

