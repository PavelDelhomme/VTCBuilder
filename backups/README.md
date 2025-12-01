# Backup des Pages Publiques

Ce répertoire contient les sauvegardes des pages publiques originales avant leur migration vers l'éditeur de pages.

## Fichiers sauvegardés

- `page.tsx.backup` - Page d'accueil originale (`/`)
- `docs-page.tsx.backup` - Page documentation originale (`/docs`)
- `contact-page.tsx.backup` - Page contact originale (`/contact`)
- `faq-page.tsx.backup` - Page FAQ originale (`/faq`)

## Restauration

Pour restaurer les pages publiques originales :

```bash
make restore-public-pages
```

Ou manuellement :

```bash
bash scripts/restore_public_pages.sh
```

## Génération des pages dans l'éditeur

Pour générer les pages publiques dans l'éditeur de pages (pour les tenants) :

```bash
make generate-public-pages
```

Ou manuellement :

```bash
docker compose exec backend python manage.py generate_public_pages
```

## Notes

- Les pages sauvegardées sont les versions originales avec le code React/Next.js
- Les pages générées dans l'éditeur utilisent le système de blocs
- Vous pouvez basculer entre les deux versions à tout moment

