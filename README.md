# 🚀 VTCBuilder - Plateforme SaaS Multi-Tenant Django pour Chauffeurs VTC

**Plateforme complète de gestion VTC avec architecture multi-tenant moderne construite avec Django.**

**Le WordPress des chauffeurs VTC** - Créez votre site VTC professionnel en quelques clics !

---

## 📊 Suivi du Projet

> **⚠️ Pour suivre l'avancement du projet, consultez [STATUS.md](./STATUS.md)**  
> Ce fichier centralise toutes les informations importantes : état actuel, tâches, corrections, tests, etc.

---


## 📋 Fonctionnalités Principales

### 🔧 Backoffice Super Admin
- Gestion complète de tous les clients/tenants
- Déploiement automatique de nouveaux sites
- Analytics et statistiques globales
- Facturation automatisée
- Monitoring des performances

### 👥 Interface Client
- Éditeur de contenu visuel (WYSIWYG)
- Gestion des pages et des médias
- Personnalisation du design
- Analytics du site
- Gestion des formulaires et réservations

### 🌐 Sites Web Générés
- Templates responsive modernes
- SEO optimisé
- Performance optimale
- Sécurité renforcée
- Sous-domaines automatiques

## 🏗️ Architecture Technique

### Stack Technologique Moderne
- **Backend**: Django 5.0.1 (Python 3.12)
- **Frontend**: Next.js 14 (React 18 + TypeScript)
- **Base de données**: PostgreSQL 15
- **Cache**: Redis 7
- **Conteneurisation**: Docker & Docker Compose
- **Reverse Proxy**: Traefik (routage automatique)

### Architecture Multi-Tenant
- **Isolation complète**: Schémas PostgreSQL séparés par tenant
- **Routage intelligent**: Sous-domaines automatiques
- **Sécurité renforcée**: Middleware d'isolation des données
- **Scalabilité**: Containers Docker indépendants

## 📦 Structure du Projet

```
VTCBuilder/
├── backend-django/       # Backend Django (principal)
│   ├── vtcbuilder/      # Configuration Django
│   ├── tenants/         # Gestion utilisateurs/rôles
│   ├── pages/           # CMS et contenu
│   ├── services/        # Services VTC
│   ├── bookings/        # Réservations
│   ├── media/           # Gestion médias
│   └── api/             # Configuration API
├── frontend/            # Application Next.js
├── docker-compose.django.yml  # Configuration Docker Django
├── public-site/         # Templates de sites
└── docs/                # Documentation
```

## 🚀 Démarrage Rapide

### Prérequis
- Docker & Docker Compose
- Git
- Make (optionnel)

### Installation

```bash
# 1. Cloner le projet
git clone <votre-repo-github>
cd VTCBuilder

# 2. Installation complète avec Docker
cd backend-django
make setup

# 3. Démarrer les services
make start

# 4. Créer un tenant de démonstration (optionnel)
make demo-tenant
```

## 🔐 Accès à l'Application

### URLs d'accès
- **Frontend**: http://localhost:9494
- **API Django**: http://localhost:9495/api/
- **Admin Django**: http://localhost:9495/admin/
- **Traefik Dashboard**: http://localhost:5050
- **PgAdmin**: http://localhost:9498
- **PostgreSQL**: localhost:9496
- **Redis**: localhost:9497

### Comptes de test
- **Super Admin**: admin@vtcbuilder.com / admin123
- **Demo Tenant**: admin@demo-vtc-company.com / admin123

## 📊 Modèle Commercial

### Tarification Suggérée
- **Starter**: 29€/mois - 1 site, fonctionnalités de base
- **Business**: 49€/mois - 1 site, toutes fonctionnalités
- **Enterprise**: 99€/mois - Sites illimités, white-label

### Coûts de Revient (50 clients)
- Serveur VPS: 200€/mois
- APIs & Services: 100€/mois
- Outils: 50€/mois
- **Total**: 350€/mois = 7€/client/mois

### Marges
- Starter: 22€/client (76%)
- Business: 42€/client (86%)
- Enterprise: 92€/client (93%)

## 🛠️ Développement

### Développement Backend (Django)

```bash
cd backend-django

# Installation complète
make setup

# Démarrer les services
make start

# Commandes Django
make shell          # Shell Django
make migrate        # Migrations
make test           # Tests
make lint           # Vérification code
make format         # Formatage code

# Logs
make logs           # Tous les logs
make logs-db        # Logs PostgreSQL
```

### Développement Frontend (Next.js)

```bash
cd frontend

# Installation
npm install

# Développement
npm run dev         # Mode développement
npm run build       # Build production
npm run lint        # Vérification code
```

## 🧪 Tests et Qualité

### Commandes Principales (depuis la racine)

```bash
# Installation complète de l'infrastructure
make setup

# Tous les tests (frontend + backend)
make test

# Qualité complète (analyse + tests)
make quality

# Analyse complète (sans tests)
make analyze
```

### Tests par Type

```bash
make tests          # Tout (alias de test-all) : test + test-reports + test-api + test-e2e
make test-all       # Idem : lance tous les tests existants
make test           # Unitaires + intégration (frontend + backend)
make test-editor    # Tests éditeur uniquement (sortie silencieuse)
make test-reports   # Rapports : tests éditeur + couverture frontend
make test-api       # Tests des endpoints API (backend)
make test-e2e       # E2E autonome (stack + migrations + Playwright)
make test-coverage  # Couverture frontend + backend
```

- **`make tests`** (ou **`make test-all`**) : à lancer pour vérifier que tout fonctionne (ex. avant push). Enchaîne test, test-reports, test-api, test-e2e.
- **`make test-e2e`** : démarre tout (postgres, redis, backend, **migrations Django**, frontend si besoin), configure l’env de test, lance Playwright. La première fois, faire avant **`make build`**.
- **`make test-editor`** : tests de l’éditeur avec **sortie silencieuse** (`--silent`), rapport JSON dans `test-results/editor.json`.
- **`make test-api`** : tests des endpoints API (démarre postgres/redis/backend si besoin).
- **`make test-reports`** : génère les rapports (tests éditeur + couverture frontend) ; tout est enregistré (voir [docs/tests/RAPPORTS-TESTS.md](./docs/tests/RAPPORTS-TESTS.md)).

Les tests backend utilisent une **base de données de test** (conteneur ou `vtcbuilder_test` en CI). Détails : [docs/tests/ENVIRONNEMENT-TESTS.md](./docs/tests/ENVIRONNEMENT-TESTS.md). Rapports : [docs/tests/RAPPORTS-TESTS.md](./docs/tests/RAPPORTS-TESTS.md).

### Tests par Composant

```bash
make test-frontend      # Tests frontend uniquement
make test-backend       # Tests backend uniquement
```

### Qualité et Analyse

```bash
make quality            # Qualité complète (frontend + backend)
make quality-frontend   # Qualité frontend
make quality-backend    # Qualité backend
make analyze           # Analyse sans tests
make lint              # Linter tout le code
make format            # Formater tout le code
```

### Voir Toutes les Commandes

```bash
make help              # Aide complète avec toutes les commandes
```

📚 **Documentation complète** : Voir [docs/COMMANDES.md](./docs/COMMANDES.md) pour le guide détaillé.

### Base de données

```bash
# Accès PostgreSQL
make dbshell

# Migrations Django
make migrations     # Créer nouvelles migrations
make migrate        # Appliquer migrations
```

## 📈 Roadmap

### ✅ Phase 1 - Migration & MVP Django (Terminée)
- [x] Migration complète Laravel → Django
- [x] Architecture multi-tenant avec django-tenants
- [x] API REST complète avec DRF
- [x] Système de rôles et permissions
- [x] Déploiement Docker optimisé

### 🚧 Phase 2 - Fonctionnalités Avancées (En cours)
- [ ] Éditeur visuel avancé (drag & drop)
- [ ] Système de templates multiples
- [ ] Analytics et statistiques détaillées
- [ ] Facturation Stripe intégrée
- [ ] Interface frontend complète

### 📋 Phase 3 - Évolution Produit (Planifiée)
- [ ] Marketplace de templates premium
- [ ] White-label complet
- [ ] Application mobile PWA
- [ ] Intégrations tierces (calendrier, paiements)
- [ ] API GraphQL

## 📝 License

**MIT License** - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👨‍💻 Auteur & Support

Développé avec ❤️ pour créer la meilleure solution SaaS multi-tenant pour chauffeurs VTC.

**Support** : Pour toute question ou assistance :
- 📧 Email : support@vtcbuilder.com
- 💬 Discord : [Rejoindre la communauté](https://discord.gg/vtcbuilder)
- 🐛 Issues : [GitHub Issues](https://github.com/votre-username/vtcbuilder-django/issues)

---

<div align="center">

**🎯 Prêt pour la production ?**

[![Deploy](https://img.shields.io/badge/Deploy-Production-green.svg)](https://github.com/votre-username/vtcbuilder-django/actions)

**⭐ Si ce projet vous plaît, n'oubliez pas de lui donner une étoile !**

[![GitHub stars](https://img.shields.io/github/stars/votre-username/vtcbuilder-django.svg?style=social&label=Star)](https://github.com/votre-username/vtcbuilder-django)
[![GitHub forks](https://img.shields.io/github/forks/votre-username/vtcbuilder-django.svg?style=social&label=Fork)](https://github.com/votre-username/vtcbuilder-django/fork)

</div>

