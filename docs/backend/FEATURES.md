# Gestion des Fonctionnalités par Abonnement

Ce document explique comment gérer les fonctionnalités selon les abonnements dans VTCBuilder.

## Vue d'ensemble

Le système de gestion des fonctionnalités permet de :
- ✅ Restreindre l'accès aux fonctionnalités selon le plan d'abonnement
- ✅ Donner accès à toutes les fonctionnalités pour le super admin
- ✅ Gérer les fonctionnalités disponibles pour chaque plan tarifaire

## Architecture

### 1. Modèle `Feature` (tenants/models.py)

Chaque fonctionnalité est définie avec :
- `name` : Identifiant unique (ex: `'blocks-editor'`, `'analytics'`)
- `label` : Nom affiché
- `description` : Description de la fonctionnalité
- `available_plans` : Relation ManyToMany avec `PricingPlan`
- `is_active` : Si la fonctionnalité est active

### 2. Modèle `PricingPlan` (billing/models.py)

Chaque plan tarifaire définit :
- `name` : Nom du plan (Starter, Business, Enterprise)
- `slug` : Identifiant unique
- `price_monthly` / `price_yearly` : Prix
- `max_sites`, `max_users`, `max_storage_gb` : Limites

### 3. Modèle `Subscription` (billing/models.py)

Chaque tenant a un abonnement qui :
- Lie le tenant à un `PricingPlan`
- Définit le statut (`active`, `trial`, `cancelled`, etc.)
- Gère les dates de période

## Comment gérer les fonctionnalités

### Créer une nouvelle fonctionnalité

1. **Via l'interface admin Django** : `/admin/tenants/feature/`
2. **Via une commande de management** : voir le code dans `tenants/management/commands/init_features.py`
3. **Via la commande `init_features`** : `python manage.py init_features`

### Vérifier l'accès

#### Backend (Python)
```python
from tenants.models import User
user = User.objects.get(email='test@example.com')
if user.can_use_feature('analytics'):
    pass
```

#### Frontend (React)
```typescript
import { useFeatures } from '@/contexts/FeaturesContext'
const { hasFeature } = useFeatures()
if (hasFeature('analytics')) { ... }
```

## Commandes utiles

```bash
docker exec vtcbuilder-backend python manage.py init_features
```

## Référence

Documentation déplacée depuis `backend-django/FEATURES_MANAGEMENT.md`. Voir aussi [BILLING.md](./BILLING.md).
