# Backup - Page d'accueil publique VTCBuilder

Ce dossier contient une sauvegarde complète du code de la page d'accueil publique (landing page) avant l'intégration du builder.

## Fichiers

- `PublicHomePageContent.backup.tsx` : Code complet de la fonction `PublicHomePageContent` avec toute la landing page (Hero, Features, Pricing, CTA, Footer)

## Comment restaurer l'ancienne version

### Option 1 : Restaurer via l'interface admin

1. Aller dans `/admin/pages-public`
2. Cliquer sur "Éditer" pour la page "Page d'accueil" (slug: `home`)
3. Dans les paramètres de la page, changer le statut de publication à "Brouillon" (`draft`)
4. La page d'accueil utilisera automatiquement l'ancienne version (backup)

### Option 2 : Restaurer manuellement le code

1. Ouvrir `frontend/src/app/page.tsx`
2. Trouver la fonction `PublicHomePageContent`
3. Remplacer son contenu par celui de `PublicHomePageContent.backup.tsx`
4. Modifier la condition dans `HomePage()` pour forcer l'utilisation de l'ancienne version :

```typescript
// Forcer l'utilisation de l'ancienne version
if (false && useBlocks && homepageStatus === 'published' && homepageBlocks.length > 0) {
  // ... code avec blocs
}

// Sinon, utiliser l'ancienne version
return <PublicHomePageContent pricingPlans={pricingPlans} loading={loading} />
```

## Comment administrer la page d'accueil avec le builder

1. Aller dans `/admin/pages-public`
2. Cliquer sur "Éditer" pour la page "Page d'accueil" (slug: `home`)
3. Utiliser l'éditeur de blocs pour modifier la page
4. Publier la page en changeant le statut à "Publié" (`published`)
5. La page d'accueil utilisera automatiquement les blocs du builder

## Notes importantes

- La page d'accueil utilise les blocs du builder **uniquement** si :
  - `public_homepage_status === 'published'`
  - `public_homepage_blocks.length > 0`
- Sinon, elle utilise automatiquement l'ancienne version (backup)
- Vous pouvez basculer entre les deux versions en changeant simplement le statut de publication dans l'admin

## Date de sauvegarde

2024 - Version avant intégration du builder

