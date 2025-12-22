# État du Projet - Extraction des Cases de BlockPreview.tsx

## 📍 Où nous en sommes

### ✅ Travail effectué

1. **Correction de la largeur dans l'éditeur (BlockEditor.tsx)**
   - ✅ Remplacement de la grille par `flex-col` pour que chaque bloc prenne sa propre ligne
   - ✅ Application de `layoutWidthClass` directement sur `SortableBlock`
   - ✅ Les blocs respectent maintenant leur largeur définie par layout (colonnes sur 12)
   - ✅ Centrage automatique des blocs si layout < 12 colonnes

2. **Correction de la largeur dans la prévisualisation (BlockPreview.tsx)**
   - ✅ Le système de colonnes est maintenant correctement appliqué
   - ✅ Les conteneurs respectent la largeur définie par les colonnes
   - ✅ Distinction entre `container`, `container-fluid` et `none`
   - ✅ Le `layoutWidth` est appliqué à l'intérieur du container, pas au-dessus

3. **Extraction des cases de BlockPreview.tsx**
   - ✅ Création de `frontend/src/components/editor/preview-cases/types.ts` avec les interfaces
   - ✅ Création de `frontend/src/components/editor/preview-cases/basic.tsx` avec 11 cases extraits
   - ✅ Création de `frontend/src/components/editor/preview-cases/index.ts` pour centraliser les exports
   - ✅ Modification de `BlockPreviewRenderer` pour utiliser les cases extraits en priorité

### 📊 Progression de l'extraction

**Cases extraits : 37/127 (29.1%)**

#### ✅ Cases extraits dans `basic.tsx` (11 cases) :
1. `heading` - Titres (h1, h2, h3, h4)
2. `text` - Texte avec support HTML
3. `image` - Images avec légende
4. `button` - Boutons avec styles variés
5. `video` - Vidéos iframe
6. `spacer` - Espaceurs verticaux/horizontaux
7. `divider` - Séparateurs
8. `alert` - Alertes (info, success, warning, error)
9. `code` - Blocs de code avec syntax highlighting
10. `paragraph` - Paragraphes
11. `line` - Lignes de texte

#### ✅ Cases extraits dans `layout.tsx` (13 cases) :
1. `container` - Conteneur avec enfants récursifs
2. `flex-container` - Conteneur flexbox
3. `grid-container` - Conteneur grid
4. `columns` - Colonnes avec grille
5. `rows` - Lignes
6. `section` - Section avec background et overlay
7. `header` - En-tête de page
8. `footer` - Pied de page
9. `flexbox` - Alias pour container
10. `grid` - Alias pour container
11. `stack` - Alias pour container
12. `inline` - Alias pour container
13. `group` - Alias pour container
14. `wrapper` - Alias pour container

#### ✅ Cases extraits dans `forms.tsx` (13 cases) :
1. `form-newsletter` - Formulaire newsletter
2. `form-search` - Formulaire de recherche
3. `form-inscription` - Formulaire d'inscription
4. `form-file-upload` - Upload de fichiers
5. `form-quiz` - Quiz interactif (avec useState)
6. `form-survey` - Sondage
7. `form-poll` - Sondage rapide (avec useState)
8. `form-rsvp` - Confirmation d'événement (avec useState)
9. `captcha` - Captcha
10. `form` - Formulaire générique (fallback)
11. `form-multi-step` - Formulaire multi-étapes (fallback)
12. `form-conditional` - Formulaire conditionnel (fallback)
13. `form-calculator` - Formulaire calculateur (fallback)
14. `form-payment` - Formulaire de paiement (fallback)

### 🔄 Cases restants à extraire : 90/127 (70.9%)

Le fichier `BlockPreview.tsx` fait actuellement **5119 lignes** avec **127 cases** dans le switch statement.

#### 📁 Structure des fichiers à créer :

1. **`preview-cases/layout.tsx`** - Blocs de mise en page (~15 cases)
   - `container`, `flex-container`, `grid-container`, `columns`, `rows`, `section`, `header`, `footer`, `flexbox`, `grid`, `stack`, `inline`, `group`, `wrapper`

2. **`preview-cases/forms.tsx`** - Tous les formulaires (~15 cases)
   - `form`, `form-newsletter`, `form-search`, `form-inscription`, `form-login`, `form-multi-step`, `booking-form`, `contact-form`, `captcha`, etc.

3. **`preview-cases/vtc.tsx`** - Blocs VTC spécifiques (~10 cases)
   - `route-calculator`, `fare-calculator`, `availability-calendar`, `service-zones`, `vehicle-gallery`, `driver-profile`, `service-packages`, `vehicle-comparison`, etc.

4. **`preview-cases/complex.tsx`** - Blocs complexes (~20 cases)
   - `hero`, `features-grid`, `features_grid`, `cta-section`, `faq-section`, `banner`, `testimonials`, `pricing`, `pricing_cards`, `pricing-card`, `pricing-cards-grid`, `billing-cycle-toggle`, `timeline`, `stats`, `social-links`, `table`, `chart`, etc.

5. **`preview-cases/interactive.tsx`** - Blocs interactifs (~10 cases)
   - `accordion`, `tabs`, `countdown`, `progress-bar`, `progress-circle`, `modal`, `calendar`, `rating`, `counter`, etc.

6. **`preview-cases/media.tsx`** - Médias (~8 cases)
   - `carousel`, `logo-grid`, `logo-carousel`, `image-slider`, `lightbox`, `vimeo-embed`, `gallery`, etc.

7. **`preview-cases/data.tsx`** - Données et affichage (~15 cases)
   - `table`, `chart`, `card`, `card-grid`, `icon-box`, `feature-card`, `team-member`, `badges`, etc.

8. **`preview-cases/content.tsx`** - Contenu riche (~15 cases)
   - `rich-text`, `markdown`, `html-raw`, `icon`, `label`, `tooltip`, `popover`, `dropdown`, `categories`, `author-box`, `related-posts`, `table-of-contents`, `reading-time`, `share-buttons`, `list`, `link`, `quote`, etc.

9. **`preview-cases/ecommerce.tsx`** - E-commerce (~8 cases)
   - `product-gallery`, `product-details`, `add-to-cart`, `buy-now`, `trust-badges`, `payment-methods`, etc.

10. **`preview-cases/misc.tsx`** - Divers (~10 cases)
    - `search-bar`, `audio-player`, `email-button`, `sms-button`, `docs-grid`, `quick-start-section`, `support-hours`, `trial-info`, etc.

## 🔧 Comment continuer le travail

### Étape 1 : Identifier les cases à extraire

Dans `BlockPreview.tsx`, chercher tous les `case 'xxx':` dans la fonction `getBlockContent()` (ligne ~1006).

### Étape 2 : Créer les fichiers de catégories

Pour chaque catégorie, créer un fichier dans `frontend/src/components/editor/preview-cases/` :

```typescript
import React from 'react'
import { PreviewCaseProps } from './types'

export function renderContainer(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles, contentStyles, blockTypes } = props
  // ... code du case original ...
}

// Export map
export const layoutCases: Record<string, (props: PreviewCaseProps) => React.ReactElement | null> = {
  'container': renderContainer,
  'flex-container': renderFlexContainer,
  // ... etc
}
```

### Étape 3 : Mettre à jour l'index

Dans `frontend/src/components/editor/preview-cases/index.ts` :

```typescript
import { layoutCases } from './layout'
// ... autres imports ...

export function getBlockPreviewCase(blockType: string): ((props: PreviewCaseProps) => React.ReactElement | null) | null {
  const allCases: Record<string, (props: PreviewCaseProps) => React.ReactElement | null> = {
    ...basicCases,
    ...layoutCases,
    // ... autres cases ...
  }
  
  return allCases[blockType] || null
}
```

### Étape 4 : Tester

1. Vérifier que les cases extraits fonctionnent correctement
2. Vérifier que le fallback vers le switch original fonctionne si un case n'est pas extrait
3. Tester dans l'éditeur et la prévisualisation

### Étape 5 : Supprimer les cases du switch original

Une fois tous les cases extraits et testés, supprimer les cases du switch dans `BlockPreview.tsx` et ne garder que le `default` case.

## 📝 Notes importantes

### Structure des props

Tous les renderers reçoivent `PreviewCaseProps` :
```typescript
interface PreviewCaseProps {
  block: Block
  blockType?: BlockType
  blockTypes?: BlockType[]
  theme?: 'light' | 'dark'
  wrapperStyles: React.CSSProperties
  contentStyles: React.CSSProperties
}
```

### Gestion des enfants (recursion)

Pour les blocs qui ont des enfants (container, columns, etc.), utiliser `BlockPreviewRenderer` :
```typescript
import { BlockPreviewRenderer } from '../BlockPreview'

// Dans le renderer
{block.children && block.children.map((childBlock: Block) => (
  <BlockPreviewRenderer
    key={childBlock.id}
    block={childBlock}
    blockType={blockTypes?.find(bt => bt.name === childBlock.type)}
    blockTypes={blockTypes}
    theme={theme}
  />
))}
```

### Gestion du thème

Toujours vérifier `theme === 'dark'` pour les couleurs et styles adaptatifs.

### Styles wrapper vs content

- `wrapperStyles` : styles du conteneur externe (margin, padding, background, etc.)
- `contentStyles` : styles du contenu interne (typography, colors, etc.)

## 🎯 Objectif final

- ✅ Extraire tous les 127 cases dans des fichiers modulaires
- ✅ Réduire `BlockPreview.tsx` de 5119 lignes à ~500 lignes (wrapper + fallback)
- ✅ Améliorer la maintenabilité et la lisibilité du code
- ✅ Faciliter l'ajout de nouveaux blocs

## 📌 Prochaine session

1. Commencer par `layout.tsx` (blocs de mise en page)
2. Puis `forms.tsx` (formulaires)
3. Continuer avec les autres catégories dans l'ordre logique
4. Tester après chaque catégorie extraite
5. Commit régulier après chaque catégorie complète

## 🔗 Fichiers clés

- `frontend/src/components/editor/BlockPreview.tsx` - Fichier source (5119 lignes)
- `frontend/src/components/editor/preview-cases/types.ts` - Interfaces
- `frontend/src/components/editor/preview-cases/basic.tsx` - Cases de base (11 cases)
- `frontend/src/components/editor/preview-cases/index.ts` - Index centralisé
- `frontend/src/components/editor/BlockEditor.tsx` - Éditeur (largeur corrigée)

---

**Dernière mise à jour** : Après extraction de 37 cases (11 basic + 13 layout + 13 forms)
**Prochaine étape** : 
1. Continuer l'extraction des cases restants (vtc, complex, interactive, media, data, content, ecommerce, misc)
2. Commencer la subdivision de BlockPreview.tsx selon REFACTORING_PLAN.md
3. Commencer la subdivision de BlockRenderer.tsx selon REFACTORING_PLAN.md
