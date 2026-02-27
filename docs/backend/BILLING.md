# 💳 Système de Facturation VTCBuilder

Documentation complète du système de facturation, paiement et plans tarifaires.

## 📋 Vue d'ensemble

Le système de facturation comprend :
- **Plans tarifaires** : Starter, Business, Enterprise
- **Abonnements** : Gestion des abonnements des tenants
- **Factures** : Génération et gestion des factures
- **Paiements** : Suivi des paiements
- **Méthodes de paiement** : Carte bancaire, virement, PayPal, etc.

## 🗂️ Modèles

### PricingPlan
Plan tarifaire avec prix mensuel/annuel, limites (sites, utilisateurs, stockage), et fonctionnalités.

### Subscription
Abonnement d'un tenant à un plan, avec statut (trial, active, cancelled, etc.) et dates de période.

### Invoice
Facture liée à un abonnement, avec montants (sous-total, taxe, total) et statut.

### Payment
Paiement lié à une facture, avec méthode de paiement et statut.

### PaymentMethod
Méthode de paiement disponible (Stripe, virement, PayPal, etc.) avec configuration.

## 🔌 API Endpoints

### Plans Tarifaires
- `GET /api/pricing-plans/` : Liste des plans
- `POST /api/pricing-plans/` : Créer un plan (super admin)
- `GET /api/pricing-plans/{id}/` : Détails d'un plan
- `PUT /api/pricing-plans/{id}/` : Modifier un plan (super admin)
- `DELETE /api/pricing-plans/{id}/` : Supprimer un plan (super admin)
- `POST /api/pricing-plans/{id}/move_up/` : Déplacer vers le haut
- `POST /api/pricing-plans/{id}/move_down/` : Déplacer vers le bas

### Abonnements
- `GET /api/subscriptions/` : Liste des abonnements
- `POST /api/subscriptions/` : Créer un abonnement
- `GET /api/subscriptions/{id}/` : Détails d'un abonnement
- `PUT /api/subscriptions/{id}/` : Modifier un abonnement
- `GET /api/subscriptions/tenants_without_subscription/` : Tenants sans abonnement
- `POST /api/subscriptions/{id}/cancel/` : Annuler un abonnement
- `POST /api/subscriptions/{id}/reactivate/` : Réactiver un abonnement
- `POST /api/subscriptions/{id}/activate/` : Activer (trial -> active)
- `POST /api/subscriptions/{id}/suspend/` : Suspendre (active -> past_due)
- `POST /api/subscriptions/{id}/update_plan/` : Changer de plan
- `POST /api/subscriptions/{id}/update_status/` : Modifier le statut (admin)
- `GET /api/subscriptions/{id}/details/` : Détails complets avec factures et paiements

### Factures
- `GET /api/invoices/` : Liste des factures
- `GET /api/invoices/{id}/` : Détails d'une facture
- `POST /api/invoices/generate/` : Générer une nouvelle facture
- `POST /api/invoices/{id}/mark_paid/` : Marquer comme payée (admin)
- `POST /api/invoices/{id}/send_reminder/` : Envoyer un rappel de paiement
- `GET /api/invoices/{id}/download_pdf/` : Télécharger le PDF

### Paiements
- `GET /api/payments/` : Liste des paiements
- `GET /api/payments/{id}/` : Détails d'un paiement

### Méthodes de Paiement
- `GET /api/payment-methods/` : Liste des méthodes
- `POST /api/payment-methods/` : Créer une méthode (super admin)
- `GET /api/payment-methods/{id}/` : Détails d'une méthode
- `PUT /api/payment-methods/{id}/` : Modifier une méthode (super admin)
- `POST /api/payment-methods/{id}/toggle_enabled/` : Activer/désactiver

## 🚀 Initialisation

### Plans Tarifaires
```bash
python manage.py init_pricing_plans
# Avec reset pour supprimer les anciens :
python manage.py init_pricing_plans --reset
```

### Méthodes de Paiement
```bash
python manage.py init_payment_methods
# Avec reset pour supprimer les anciennes :
python manage.py init_payment_methods --reset
```

## 🔐 Permissions

- **Super Admin** : Accès complet (créer/modifier/supprimer plans, méthodes, gérer tous les abonnements)
- **Tenant Admin** : Voir et gérer son propre abonnement, factures et paiements
- **Autres utilisateurs** : Lecture seule de leur abonnement

## 📚 Référence

Documentation déplacée depuis `backend-django/BILLING_README.md`. Voir aussi [FEATURES.md](./FEATURES.md) pour la gestion des fonctionnalités par plan.
