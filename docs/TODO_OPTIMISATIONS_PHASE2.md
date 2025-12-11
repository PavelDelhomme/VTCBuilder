# 📋 TODO - Optimisations Phase 2 (Architecture)

## 🎯 Objectif
Réduire la consommation mémoire de **-50%** (actuellement -4.4%)

## ✅ Phase 1 - Terminée
- [x] Optimiser workers Gunicorn (4 → 2)
- [x] Ajouter limites Docker
- [x] Optimiser PostgreSQL
- [x] Activer cache Redis
- [x] Optimiser Next.js
- [x] Réduire les logs
- [x] Corriger erreurs frontend
- [x] Créer système de monitoring

## 🚧 Phase 2 - À Faire

### 1. Refactoring BlockPreview.tsx (6,210 lignes)
- [ ] Diviser en renderers séparés par type de bloc
- [ ] Créer `components/editor/BlockPreview/renderers/`
  - [ ] `HeroRenderer.tsx`
  - [ ] `FeaturesGridRenderer.tsx`
  - [ ] `PricingCardsRenderer.tsx`
  - [ ] `FooterRenderer.tsx`
  - [ ] `CTASectionRenderer.tsx`
  - [ ] ... (un renderer par type de bloc)
- [ ] Implémenter lazy loading avec `React.lazy()`
- [ ] Ajouter `React.memo()` à tous les renderers

### 2. Refactoring BlockEditor.tsx (9,946 lignes)
- [ ] Diviser en sous-composants
  - [ ] `BlockPalette.tsx` (palette de blocs)
  - [ ] `BlockPropertiesPanel.tsx` (panneau de propriétés)
  - [ ] `BlockPlacementArea.tsx` (zone de placement)
  - [ ] `BlockList.tsx` (liste des blocs)
- [ ] Implémenter lazy loading
- [ ] Ajouter `React.memo()` partout

### 3. Optimisations React
- [ ] Ajouter `useMemo()` pour les calculs coûteux
- [ ] Ajouter `useCallback()` pour toutes les fonctions passées en props
- [ ] Implémenter la virtualisation avec `@tanstack/react-virtual` pour les longues listes
- [ ] Optimiser les re-renders avec des sélecteurs Zustand

### 4. Code Splitting Next.js
- [ ] Configurer `next.config.js` avec splitChunks optimisé
- [ ] Créer des chunks séparés pour BlockEditor et BlockPreview
- [ ] Implémenter dynamic imports pour les routes lourdes

### 5. State Management
- [ ] Migrer vers Zustand avec sélecteurs
- [ ] Éviter les re-renders inutiles
- [ ] Limiter la taille de l'historique (useHistory)

### 6. Imports Optimisés
- [ ] Créer `components/icons/index.ts` pour centraliser les imports
- [ ] Remplacer tous les imports `*` par des imports nommés
- [ ] Vérifier tree-shaking avec `next build --analyze`

### 7. Tests et Validation
- [ ] Vérifier que toutes les fonctionnalités fonctionnent
- [ ] Mesurer la mémoire avant/après avec `make monitor-performance`
- [ ] Vérifier que la réduction est ≥ 50%
- [ ] Tester les performances (FCP, LCP, TTI)

## 📊 Métriques Cibles

| Métrique | Actuel | Cible | Réduction |
|----------|--------|-------|-----------|
| Mémoire totale | 3333 MB | ~1740 MB | -50% |
| Frontend | 155.5 MB | ~78 MB | -50% |
| Bundle size | 289 kB | <128 kB | -55% |

## 🔧 Commandes Utiles

```bash
# Monitoring
make monitor-performance
make compare-performance

# Build et analyse
cd frontend && npm run build
npx @next/bundle-analyzer

# Tests
npm run test
npm run type-check
```

## 📝 Notes

- Prioriser le refactoring de BlockPreview et BlockEditor (fichiers les plus volumineux)
- Tester après chaque étape pour éviter les régressions
- Documenter les changements dans `docs/ARCHITECTURE_OPTIMISATION.md`

