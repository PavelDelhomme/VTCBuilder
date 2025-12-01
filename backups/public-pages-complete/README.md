# Backup Complet des Pages Publiques

Ce répertoire contient une sauvegarde complète de TOUTES les pages publiques originales avant leur migration vers l'éditeur de pages.

## Fichiers sauvegardés

- `page.tsx` - Page d'accueil originale (`/`)
- `docs-page.tsx` - Page documentation originale (`/docs`)
- `contact-page.tsx` - Page contact originale (`/contact`)
- `faq-page.tsx` - Page FAQ originale (`/faq`)
- `register-page.tsx` - Page inscription originale (`/register`)
- `features-page.tsx` - Page fonctionnalités originale (`/features`)
- `templates-page.tsx` - Page templates originale (`/templates`)
- `legal-privacy-page.tsx` - Page politique de confidentialité originale (`/legal/privacy`)
- `legal-terms-page.tsx` - Page conditions générales originale (`/legal/terms`)

## Restauration

Pour restaurer toutes les pages publiques originales :

```bash
make restore-public-pages
```

Ou manuellement :

```bash
bash scripts/restore_public_pages.sh
```

Le script restaurera automatiquement toutes les pages disponibles dans ce backup et réinitialisera les SystemSettings pour retirer les blocs générés.

## Notes importantes

- ⚠️ **Ce backup est la version COMPLÈTE et ORIGINALE** de toutes les pages publiques
- Les pages sauvegardées sont les versions originales avec le code React/Next.js complet
- La restauration réinitialise aussi les SystemSettings pour retirer les blocs générés
- Vous pouvez basculer entre les deux versions à tout moment

