# Configuration des Phases de Validation des Blocs

## 📍 Où configurer la phase de validation ?

La phase de validation se configure dans le fichier **`frontend/.env.local`** (à la racine du dossier `frontend`).

Si le fichier n'existe pas, créez-le.

## 🔧 Configuration

Ajoutez cette ligne dans `frontend/.env.local` :

```bash
# Phase de validation des blocs dans l'éditeur
# Valeurs possibles : 1, 2, 3, 4 (ou supérieur pour tous les blocs)
NEXT_PUBLIC_BLOCK_VALIDATION_PHASE=1
```

## 📋 Phases disponibles

### Phase 1 : Blocs de Mise en Page de Base
**Blocs activés :**
- `heading` (Titre)
- `text` (Texte)
- `container` (Conteneur)

**Configuration :**
```bash
NEXT_PUBLIC_BLOCK_VALIDATION_PHASE=1
```

**Objectif :** Valider les blocs fondamentaux de mise en page avant d'ajouter des blocs plus complexes.

---

### Phase 2 : Blocs Conteneurs
**Blocs activés :**
- Tous les blocs de la Phase 1
- `columns` (Colonnes)

**Configuration :**
```bash
NEXT_PUBLIC_BLOCK_VALIDATION_PHASE=2
```

**Objectif :** Valider les blocs conteneurs pour organiser le contenu.

---

### Phase 3 : Blocs de Contenu Avancés
**Blocs activés :**
- Tous les blocs des Phases 1 et 2
- `paragraph` (Paragraphe)
- `button` (Bouton)
- `image` (Image)
- `line` (Ligne)

**Configuration :**
```bash
NEXT_PUBLIC_BLOCK_VALIDATION_PHASE=3
```

**Objectif :** Valider les blocs de contenu plus complexes.

---

### Phase 4+ : Tous les Blocs Actifs
**Blocs activés :**
- Tous les blocs marqués comme `is_active: true` dans l'interface admin

**Configuration :**
```bash
NEXT_PUBLIC_BLOCK_VALIDATION_PHASE=4
# ou toute valeur supérieure à 3
```

**Objectif :** Tester tous les blocs disponibles.

---

## 🚀 Comment utiliser

1. **Ouvrez ou créez** le fichier `frontend/.env.local`
2. **Ajoutez** la ligne avec la phase souhaitée :
   ```bash
   NEXT_PUBLIC_BLOCK_VALIDATION_PHASE=1
   ```
3. **Redémarrez** le serveur de développement :
   ```bash
   # Option 1 : Avec Make (recommandé)
   make restart-frontend-dev
   # Puis relancez manuellement : cd frontend && npm run dev
   
   # Option 2 : Redémarrer toute la stack
   make restart
   
   # Option 3 : Manuellement
   # Arrêtez le serveur (Ctrl+C)
   # Puis relancez-le
   cd frontend && npm run dev
   ```

## ⚠️ Important

- Les modifications dans `.env.local` nécessitent un **redémarrage du serveur** pour être prises en compte
- Le fichier `.env.local` est dans `.gitignore` et ne sera **pas commité** (c'est normal, c'est pour votre configuration locale)
- Si vous ne définissez pas la variable, la **Phase 1** sera utilisée par défaut

## 📝 Exemple de fichier `.env.local` complet

```bash
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:9495

# Phase de validation des blocs dans l'éditeur
# Phase 1 : heading, text, container
# Phase 2 : + columns
# Phase 3 : + paragraph, button, image, line
# Phase 4+ : Tous les blocs actifs
NEXT_PUBLIC_BLOCK_VALIDATION_PHASE=1
```

## 🔍 Vérifier la phase active

Pour vérifier quelle phase est actuellement active, ouvrez la console du navigateur (F12) et tapez :
```javascript
console.log(process.env.NEXT_PUBLIC_BLOCK_VALIDATION_PHASE)
```

Ou regardez dans l'interface admin des blocs (`/admin/blocks`), la colonne "Phase validation" indique la phase de chaque bloc.

---

**Dernière mise à jour :** 2024-12-12

