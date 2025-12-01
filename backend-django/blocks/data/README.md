# 📦 Définitions de Blocs - Source Unique de Vérité

Ce répertoire contient les définitions de blocs au format JSON, permettant une gestion centralisée et réutilisable des blocs dans tout le système.

## 📁 Fichiers

### `default_blocks.json`
Contient toutes les définitions de blocs par défaut (128 blocs).

**Structure d'un bloc :**
```json
{
  "name": "container",
  "label": "Conteneur",
  "icon": "📦",
  "category": "layout",
  "description": "Conteneur avec largeur maximale",
  "order": -10,
  "schema": {},
  "default_styles": {},
  "is_active": true
}
```

**Champs disponibles :**
- `name` (requis) : Identifiant unique du bloc
- `label` : Nom affiché dans l'interface
- `icon` : Icône emoji ou caractère
- `category` : `content`, `layout`, `media`, ou `custom`
- `description` : Description du bloc
- `order` : Ordre d'affichage (négatif pour les blocs structurels)
- `schema` : Schéma JSON pour les propriétés du bloc
- `default_styles` : Styles par défaut
- `is_active` : Si le bloc est actif

### `render_templates.json`
Contient les templates de rendu JSON pour chaque bloc.

**Structure d'un template :**
```json
{
  "heading": {
    "type": "component",
    "component": "heading",
    "props": {
      "className": "mb-6",
      "style": {
        "textAlign": "{{data.align}}",
        "fontSize": "{{styles.font_size}}"
      }
    },
    "children": "{{data.text}}",
    "level": "{{data.level}}"
  }
}
```

## 🔧 Utilisation

### Backend (Django)

**Créer/mettre à jour les blocs depuis le JSON :**
```bash
python manage.py create_default_block_types
```

**Exporter les render templates vers JSON :**
```bash
python manage.py export_render_templates
```

### Frontend (Next.js)

Les blocs sont chargés depuis l'API Django, mais vous pouvez aussi utiliser le fichier JSON directement :

```typescript
import { loadBlockDefinitions } from '@/lib/block-definitions'

const blocks = await loadBlockDefinitions()
```

## 📝 Modification des Blocs

1. **Modifier `default_blocks.json`** pour ajouter/modifier un bloc
2. **Exécuter `create_default_block_types`** pour appliquer les changements
3. **Les modifications sont synchronisées** avec la base de données

## 🎯 Avantages

- ✅ **Source unique de vérité** : Toutes les définitions dans un seul fichier JSON
- ✅ **Versioning** : Les définitions peuvent être versionnées avec Git
- ✅ **Réutilisabilité** : Même fichier utilisé backend et frontend
- ✅ **Maintenabilité** : Plus facile à modifier qu'un gros fichier Python
- ✅ **Non répétitif** : Pas de duplication de code

## 📊 Statistiques

- **Total blocs définis** : 128
- **Catégories** : content, layout, media, custom
- **Templates de rendu** : 12+ (en expansion)

