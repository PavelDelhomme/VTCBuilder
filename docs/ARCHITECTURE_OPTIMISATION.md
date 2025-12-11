# 🏗️ Architecture Frontend Optimisée - VTCBuilder

## 📊 Analyse Actuelle

### Problèmes Identifiés

1. **Fichiers Monolithiques**
   - `BlockEditor.tsx`: **9,946 lignes** (trop volumineux)
   - `BlockPreview.tsx`: **6,210 lignes** (trop volumineux)
   - `blocks-implementations.tsx`: **2,679 lignes**

2. **Consommation Mémoire**
   - Pages Next.js > 128 kB (289 kB détecté)
   - Pas assez de code splitting
   - Composants non optimisés (peu de `React.memo`, `useMemo`, `useCallback`)

3. **Bundle Size**
   - Tous les blocs chargés en même temps
   - Pas de lazy loading des composants lourds
   - Imports non optimisés

## 🎯 Architecture Proposée

### 1. Code Splitting et Lazy Loading

#### Structure Modulaire

```
frontend/src/
├── components/
│   ├── editor/
│   │   ├── BlockEditor/
│   │   │   ├── index.tsx (composant principal léger)
│   │   │   ├── BlockPalette.tsx (lazy)
│   │   │   ├── BlockPropertiesPanel.tsx (lazy)
│   │   │   └── BlockPlacementArea.tsx
│   │   ├── BlockPreview/
│   │   │   ├── index.tsx (composant principal léger)
│   │   │   ├── renderers/
│   │   │   │   ├── HeroRenderer.tsx (lazy)
│   │   │   │   ├── FeaturesGridRenderer.tsx (lazy)
│   │   │   │   ├── PricingCardsRenderer.tsx (lazy)
│   │   │   │   └── ... (un renderer par type de bloc)
│   │   │   └── BlockPreviewRenderer.tsx (lazy)
│   │   └── blocks/
│   │       ├── common/ (blocs simples)
│   │       ├── layout/ (blocs de mise en page)
│   │       ├── forms/ (blocs de formulaire)
│   │       └── vtc/ (blocs spécifiques VTC)
```

#### Implémentation

```typescript
// BlockPreview/index.tsx
import { lazy, Suspense } from 'react'

const HeroRenderer = lazy(() => import('./renderers/HeroRenderer'))
const FeaturesGridRenderer = lazy(() => import('./renderers/FeaturesGridRenderer'))
const PricingCardsRenderer = lazy(() => import('./renderers/PricingCardsRenderer'))

// Charger seulement le renderer nécessaire
function BlockPreviewRenderer({ block, theme }) {
  const Renderer = useMemo(() => {
    switch(block.type) {
      case 'hero': return HeroRenderer
      case 'features-grid': return FeaturesGridRenderer
      case 'pricing_cards': return PricingCardsRenderer
      default: return DefaultRenderer
    }
  }, [block.type])
  
  return (
    <Suspense fallback={<BlockSkeleton />}>
      <Renderer block={block} theme={theme} />
    </Suspense>
  )
}
```

### 2. Optimisation des Composants

#### Memoization Systématique

```typescript
// Avant
function BlockPreview({ blocks, theme }) {
  return blocks.map(block => <BlockRenderer block={block} />)
}

// Après
const BlockPreview = memo(function BlockPreview({ blocks, theme }) {
  const renderedBlocks = useMemo(() => 
    blocks.map(block => <BlockRenderer key={block.id} block={block} theme={theme} />),
    [blocks, theme]
  )
  return renderedBlocks
}, (prev, next) => 
  prev.blocks.length === next.blocks.length &&
  prev.theme === next.theme &&
  prev.blocks.every((b, i) => b.id === next.blocks[i]?.id)
)
```

#### Virtualisation pour les Longues Listes

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

function BlockList({ blocks }) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: blocks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 5,
  })
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <BlockRenderer block={blocks[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 3. State Management Optimisé

#### Utiliser Zustand avec Sélecteurs

```typescript
// store/editorStore.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface EditorState {
  blocks: Block[]
  selectedBlockId: string | null
  theme: 'light' | 'dark'
}

const useEditorStore = create<EditorState>()(
  subscribeWithSelector((set) => ({
    blocks: [],
    selectedBlockId: null,
    theme: 'light',
    setBlocks: (blocks) => set({ blocks }),
    setSelectedBlock: (id) => set({ selectedBlockId: id }),
  }))
)

// Utilisation avec sélecteur pour éviter les re-renders
function BlockList() {
  // Ne re-render que si blocks change, pas si selectedBlockId change
  const blocks = useEditorStore(state => state.blocks)
  return <div>{blocks.map(...)}</div>
}
```

### 4. Optimisation des Imports

#### Tree Shaking Agressif

```typescript
// ❌ Avant - Importe toute la bibliothèque
import * as Icons from '@heroicons/react/24/outline'

// ✅ Après - Importe seulement ce qui est nécessaire
import { Bars3Icon } from '@heroicons/react/24/outline'
import { XMarkIcon } from '@heroicons/react/24/outline'

// Créer un fichier d'index pour centraliser
// components/icons/index.ts
export { Bars3Icon, XMarkIcon, ... } from '@heroicons/react/24/outline'
```

#### Dynamic Imports pour les Routes

```typescript
// app/admin/homepage/page.tsx
import dynamic from 'next/dynamic'

const HomepageEditor = dynamic(
  () => import('@/components/admin/HomepageEditor'),
  { 
    loading: () => <PageLoader />,
    ssr: false // Désactiver SSR pour les composants lourds
  }
)
```

### 5. Optimisation des Bundles

#### Configuration Next.js Optimisée

```javascript
// next.config.js
module.exports = {
  // ... config existante
  experimental: {
    optimizePackageImports: [
      '@heroicons/react',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      'recharts',
    ],
  },
  webpack: (config, { dev, isServer }) => {
    // Optimisation des chunks
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Séparer les gros composants
            blockEditor: {
              test: /[\\/]components[\\/]editor[\\/]BlockEditor/,
              name: 'block-editor',
              priority: 30,
            },
            blockPreview: {
              test: /[\\/]components[\\/]editor[\\/]BlockPreview/,
              name: 'block-preview',
              priority: 30,
            },
            // Vendor chunks séparés
            dndKit: {
              test: /[\\/]node_modules[\\/]@dnd-kit/,
              name: 'dnd-kit',
              priority: 20,
            },
            heroicons: {
              test: /[\\/]node_modules[\\/]@heroicons/,
              name: 'heroicons',
              priority: 20,
            },
          },
        },
      }
    }
    return config
  },
}
```

### 6. Optimisation Mémoire

#### Limiter l'Historique

```typescript
// hooks/useHistory.ts
export function useHistory<T>(initialState: T, maxHistorySize: number = 10) {
  // Réduire de 20 à 10 pour économiser la mémoire
  // Compresser les états avec quickHash
}
```

#### Nettoyer les Listeners

```typescript
useEffect(() => {
  const handler = () => { /* ... */ }
  window.addEventListener('resize', handler)
  return () => window.removeEventListener('resize', handler)
}, [])
```

#### Éviter les Closures Inutiles

```typescript
// ❌ Avant - Crée une nouvelle fonction à chaque render
function Component() {
  const handleClick = () => {
    console.log('clicked')
  }
  return <button onClick={handleClick}>Click</button>
}

// ✅ Après - Mémorise la fonction
function Component() {
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])
  return <button onClick={handleClick}>Click</button>
}
```

### 7. Architecture Micro-Frontend (Option Avancée)

Pour une réduction encore plus importante, considérer une architecture micro-frontend :

```
┌─────────────────────────────────────┐
│         Shell Application           │
│  (Next.js - Routing & Auth)          │
└─────────────────────────────────────┘
           │
    ┌──────┴──────┬──────────┬──────────┐
    │             │          │          │
┌───▼───┐   ┌────▼───┐  ┌───▼───┐  ┌───▼───┐
│Editor │   │Preview │  │Blocks │  │Admin  │
│Module │   │Module  │  │Module │  │Module │
│(Lazy) │   │(Lazy)  │  │(Lazy) │  │(Lazy) │
└───────┘   └────────┘  └───────┘  └───────┘
```

Chaque module est un bundle séparé chargé à la demande.

## 📈 Gains Attendus

### Mémoire
- **Avant**: ~768MB (frontend)
- **Après**: ~400MB (réduction ~48%)
- **Méthodes**:
  - Code splitting: -30%
  - Memoization: -15%
  - Virtualisation: -10%

### Bundle Size
- **Avant**: 289 kB par page
- **Après**: <128 kB par page
- **Méthodes**:
  - Lazy loading: -40%
  - Tree shaking: -20%
  - Compression: -15%

### CPU
- **Réduction**: ~35%
- **Méthodes**:
  - Memoization: -20%
  - Virtualisation: -10%
  - Optimisation re-renders: -5%

## 🚀 Plan de Migration

### Phase 1: Refactoring Immédiat (1-2 jours)
1. ✅ Corriger les erreurs de syntaxe
2. ✅ Ajouter les limites Docker
3. ✅ Optimiser la configuration Next.js
4. ⏳ Diviser BlockPreview en renderers séparés
5. ⏳ Diviser BlockEditor en sous-composants

### Phase 2: Optimisations React (2-3 jours)
1. ⏳ Ajouter `React.memo` partout
2. ⏳ Utiliser `useMemo` et `useCallback`
3. ⏳ Implémenter la virtualisation
4. ⏳ Optimiser les imports

### Phase 3: Architecture Avancée (3-5 jours)
1. ⏳ Implémenter le lazy loading complet
2. ⏳ Créer le système de monitoring
3. ⏳ Optimiser le state management
4. ⏳ Tests de performance

## 📝 Checklist d'Optimisation

- [ ] Diviser BlockEditor.tsx en sous-composants
- [ ] Diviser BlockPreview.tsx en renderers séparés
- [ ] Implémenter lazy loading pour tous les renderers
- [ ] Ajouter React.memo à tous les composants
- [ ] Utiliser useMemo/useCallback partout
- [ ] Implémenter la virtualisation pour les listes
- [ ] Optimiser les imports (tree shaking)
- [ ] Configurer le code splitting Next.js
- [ ] Limiter l'historique (useHistory)
- [ ] Nettoyer tous les event listeners
- [ ] Créer le système de monitoring
- [ ] Documenter les métriques avant/après

## 🔧 Outils de Monitoring

### Script de Performance

```bash
# Collecter les métriques
./scripts/monitor_performance.sh

# Comparer les rapports
python3 scripts/compare_performance.py
```

### Métriques à Surveiller

1. **Mémoire**
   - Mémoire totale des conteneurs
   - Mémoire par conteneur
   - Mémoire heap Node.js

2. **CPU**
   - Utilisation CPU totale
   - CPU par conteneur
   - Temps de réponse API

3. **Bundle Size**
   - Taille des chunks Next.js
   - Taille des pages
   - Taille des assets

4. **Performance**
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Time to Interactive (TTI)

## 💡 Recommandations Finales

1. **Priorité 1**: Diviser les fichiers monolithiques (BlockEditor, BlockPreview)
2. **Priorité 2**: Implémenter le lazy loading systématique
3. **Priorité 3**: Ajouter la memoization partout
4. **Priorité 4**: Virtualiser les longues listes
5. **Priorité 5**: Optimiser le state management

Cette architecture permettra de réduire la consommation mémoire de **~50%** tout en maintenant toutes les fonctionnalités.

