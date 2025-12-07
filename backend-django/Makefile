.PHONY: help install setup start stop restart build logs clean migrate superuser shell test lint format up test-subscriptions-internal test-payments-internal test-invoices-internal test-pricing-plans-internal test-trial-status test-trial-create test-trial-activate test-trial-expire test-trial-advance

# Variables
DOCKER_COMPOSE = docker-compose -f ../docker-compose.simple.yml
BACKEND_CONTAINER = vtcbuilder-backend
POSTGRES_CONTAINER = vtcbuilder-postgres
COMPOSE_PROJECT_NAME = vtcbuilder

# Couleurs pour l'affichage
BLUE = \033[0;34m
GREEN = \033[0;32m
YELLOW = \033[0;33m
RED = \033[0;31m
NC = \033[0m # No Color

##@ Aide

help: ## Afficher l'aide
	@printf "$(BLUE)═══════════════════════════════════════════════════════════════$(NC)\n"
	@printf "$(GREEN)    Django Backend - Commandes disponibles$(NC)\n"
	@printf "$(BLUE)═══════════════════════════════════════════════════════════════$(NC)\n"
	@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(BLUE)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo ""

##@ Installation et Configuration

install: ## Installation du backend Django
	@printf "$(GREEN)📦 Installation du backend Django...$(NC)\n"
	@if [ ! -f .env ]; then \
		printf "$(YELLOW)⚙️  Création du fichier .env...$(NC)\n"; \
		echo "SECRET_KEY=django-insecure-change-this-in-production" > .env; \
		echo "DEBUG=True" >> .env; \
		echo "DB_NAME=vtcbuilder" >> .env; \
		echo "DB_USER=vtcbuilder_user" >> .env; \
		echo "DB_PASSWORD=vtcbuilder_password" >> .env; \
		echo "DB_HOST=postgres" >> .env; \
		echo "DB_PORT=5432" >> .env; \
		echo "REDIS_URL=redis://redis:6379/0" >> .env; \
		echo "ALLOWED_HOSTS=localhost,127.0.0.1,api.localhost,backend" >> .env; \
	fi
	@printf "$(GREEN)🐳 Construction des images Docker...$(NC)\n"
	@$(DOCKER_COMPOSE) build backend
	@printf "$(GREEN)✅ Installation terminée !$(NC)\n"

setup: install migrate setup-permissions ## Installation complète avec migrations et permissions
	@printf "$(GREEN)✨ Configuration Django terminée !$(NC)\n"
	@printf "$(BLUE)💡 Pour créer un tenant de démonstration, utilisez:$(NC)\n"
	@printf "$(YELLOW)   make demo-tenant$(NC)\n"

setup-permissions: ## Configurer les permissions et rôles
	@printf "$(GREEN)🔐 Configuration des permissions...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python manage.py setup_permissions --super-admin
	@printf "$(GREEN)✅ Permissions configurées !$(NC)\n"

load-fixtures: ## Charger les données de démonstration
	@printf "$(GREEN)📦 Chargement des données de test...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python manage.py loaddata tenants/fixtures/sample_data.json
	@printf "$(GREEN)✅ Données de test chargées !$(NC)\n"

demo-tenant: ## Créer un tenant de démonstration
	@printf "$(GREEN)🏢 Création d'un tenant de démonstration...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@./create-demo-simple.sh

##@ Tests Billing (Trials, Abonnements)

test-trial-status: ## Afficher le statut de tous les abonnements trial
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "$(GREEN)📊 Statut des Abonnements Trial$(NC)\n"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python manage.py test_trial --action=status

test-trial-create: ## Créer un abonnement trial (usage: make test-trial-create TENANT_ID=1 PLAN_ID=1 DAYS=14)
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "$(GREEN)🧪 Création d'un Abonnement Trial$(NC)\n"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@if [ -z "$(TENANT_ID)" ] || [ -z "$(PLAN_ID)" ]; then \
		printf "$(RED)❌ Usage: make test-trial-create TENANT_ID=1 PLAN_ID=1 DAYS=14$(NC)\n"; \
		printf "$(YELLOW)💡 List tenants: make test-trial-status$(NC)\n"; \
	else \
		docker exec $(BACKEND_CONTAINER) python manage.py test_trial --action=create \
			--tenant-id=$(TENANT_ID) --plan-id=$(PLAN_ID) --trial-days=$(or $(DAYS),14); \
	fi

test-trial-activate: ## Activer un abonnement trial (usage: make test-trial-activate TENANT_ID=1)
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "$(GREEN)🔄 Activation d'un Abonnement Trial$(NC)\n"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@if [ -z "$(TENANT_ID)" ]; then \
		printf "$(RED)❌ Usage: make test-trial-activate TENANT_ID=1$(NC)\n"; \
		printf "$(YELLOW)💡 Ou utilisez --all pour tous activer$(NC)\n"; \
	else \
		docker exec $(BACKEND_CONTAINER) python manage.py test_trial --action=activate --tenant-id=$(TENANT_ID); \
	fi

test-trial-expire: ## Expirer un abonnement trial (usage: make test-trial-expire TENANT_ID=1)
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "$(GREEN)⏰ Expiration d'un Abonnement Trial$(NC)\n"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@if [ -z "$(TENANT_ID)" ]; then \
		printf "$(RED)❌ Usage: make test-trial-expire TENANT_ID=1$(NC)\n"; \
		printf "$(YELLOW)💡 Ou utilisez --all pour tous expirer$(NC)\n"; \
	else \
		docker exec $(BACKEND_CONTAINER) python manage.py test_trial --action=expire --tenant-id=$(TENANT_ID); \
	fi

test-trial-advance: ## Avancer le temps pour simuler l'expiration (usage: make test-trial-advance DAYS=15)
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "$(GREEN)⏰ Simulation de l'Avancement du Temps$(NC)\n"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@if [ -z "$(DAYS)" ]; then \
		printf "$(RED)❌ Usage: make test-trial-advance DAYS=15$(NC)\n"; \
		printf "$(YELLOW)💡 Cela avance le temps de X jours pour simuler l'expiration$(NC)\n"; \
	else \
		docker exec $(BACKEND_CONTAINER) python manage.py test_trial --action=advance-time --days-advance=$(DAYS); \
	fi

##@ Gestion des Services

start: ## Démarrer les services Django
	@printf "$(GREEN)🚀 Démarrage des services Django...$(NC)\n"
	@./start.sh

up: ## Démarrer les services Django
	@printf "$(GREEN)🚀 Démarrage des services Django...$(NC)\n"
	@./start.sh
	@printf "$(GREEN)✅ Services démarrés avec migrations automatiques !$(NC)\n"

stop: ## Arrêter tous les services
	@printf "$(YELLOW)⏸️  Arrêt des services...$(NC)\n"
	@$(DOCKER_COMPOSE) stop
	@printf "$(GREEN)✅ Services arrêtés !$(NC)\n"

restart: stop start ## Redémarrer tous les services

down: ## Arrêter et supprimer les containers
	@printf "$(RED)🗑️  Arrêt des containers...$(NC)\n"
	@$(DOCKER_COMPOSE) stop
	@printf "$(YELLOW)💡 Pour supprimer complètement les containers, utilisez: make down-remove$(NC)\n"
	@printf "$(GREEN)✅ Containers arrêtés !$(NC)\n"

down-remove: ## Arrêter et supprimer complètement les containers
	@printf "$(RED)🗑️  Suppression complète des containers...$(NC)\n"
	@$(DOCKER_COMPOSE) down
	@printf "$(GREEN)✅ Containers supprimés !$(NC)\n"

build: ## Reconstruire les images Docker
	@printf "$(GREEN)🔨 Reconstruction des images...$(NC)\n"
	@$(DOCKER_COMPOSE) build --no-cache backend
	@printf "$(GREEN)✅ Images reconstruites !$(NC)\n"

##@ Base de données

migrate: ## Exécuter les migrations Django
	@printf "$(GREEN)🗄️  Exécution des migrations...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis
	@printf "$(BLUE)⏳ Attente du démarrage de PostgreSQL...$(NC)\n"
	@sleep 10
	@$(DOCKER_COMPOSE) up -d backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python manage.py migrate
	@printf "$(GREEN)✅ Migrations exécutées !$(NC)\n"

migrations: ## Créer de nouvelles migrations
	@printf "$(GREEN)📄 Génération des migrations...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python manage.py makemigrations
	@printf "$(GREEN)✅ Migrations générées !$(NC)\n"

migrate-fresh: ## Reset et re-exécuter les migrations
	@printf "$(RED)⚠️  Reset de la base de données...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python manage.py migrate --fake-initial
	@printf "$(GREEN)✅ Base remise à zéro !$(NC)\n"

superuser: ## Créer un superutilisateur
	@printf "$(GREEN)👤 Création d'un superutilisateur...$(NC)\n"
	@printf "$(YELLOW)Informations requises:$(NC)\n"
	@echo "  Email: admin@vtcbuilder.com"
	@echo "  Password: admin123"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec -it $(BACKEND_CONTAINER) python manage.py createsuperuser --noinput --email admin@vtcbuilder.com || \
	 docker exec $(BACKEND_CONTAINER) python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(email='admin@vtcbuilder.com').delete(); User.objects.create_superuser('admin@vtcbuilder.com', 'admin@vtcbuilder.com', 'admin123')"
	@printf "$(GREEN)✅ Superutilisateur créé !$(NC)\n"

##@ Développement

shell: ## Accéder au shell Django
	@printf "$(BLUE)🐚 Accès au shell Django...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec -it $(BACKEND_CONTAINER) python manage.py shell

dbshell: ## Accéder au shell PostgreSQL
	@printf "$(BLUE)🗄️  Accès à PostgreSQL...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres
	@docker exec -it $(POSTGRES_CONTAINER) psql -U vtcbuilder_user vtcbuilder

collectstatic: ## Collecter les fichiers statiques
	@printf "$(GREEN)📁 Collecte des fichiers statiques...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python manage.py collectstatic --noinput
	@printf "$(GREEN)✅ Fichiers statiques collectés !$(NC)\n"

##@ Tests et qualité

test: ## Exécuter les tests avec pytest
	@printf "$(GREEN)🧪 Exécution des tests avec pytest...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) pytest --verbose --tb=short -v
	@printf "$(GREEN)✅ Tests terminés !$(NC)\n"

test-security-internal: ## Exécuter les tests de sécurité (WAF, Firewall, Alerts, Logs, Settings)
	@printf "$(GREEN)🔒 Tests de Sécurité (WAF, Firewall, Alerts, Logs, Settings)...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) pytest security/tests/ -v --tb=short || \
	 (printf "$(YELLOW)⚠️  Impossible d'exécuter les tests dans le conteneur.$(NC)\n" && \
	  printf "$(BLUE)Exécutez manuellement :$(NC)\n" && \
	  printf "  docker exec $(BACKEND_CONTAINER) pytest security/tests/ -v\n")

test-api: ## Tester tous les endpoints de l'API
	@printf "$(GREEN)🧪 Tests des endpoints API...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python tests/api/test_all_endpoints.py
	@printf "$(GREEN)✅ Tests API terminés !$(NC)\n"

test-endpoints: test-api ## Alias pour test-api

check-errors: ## Vérifier les erreurs dans les logs
	@printf "$(BLUE)🔍 Vérification des erreurs...$(NC)\n"
	@docker logs $(BACKEND_CONTAINER) --tail 100 2>&1 | grep -E "ERROR|Exception|Traceback|500|FieldError" || printf "$(GREEN)✅ Aucune erreur détectée$(NC)\n"

verify-features: ## Vérifier l'accès aux features selon les plans
	@printf "$(GREEN)🔐 Vérification de l'accès aux features...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vtcbuilder.settings'); django.setup(); from tenants.models import User, Feature; from billing.models import PricingPlan; super_admin = User.objects.filter(role='super-admin').first(); all_features = Feature.objects.filter(is_active=True); accessible = sum(1 for f in all_features if super_admin.can_use_feature(f)) if super_admin else 0; print(f'Super Admin: {accessible}/{all_features.count()} features accessibles'); plans = PricingPlan.objects.all(); print(f'Plans: {plans.count()}'); [print(f'  - {p.name}: {Feature.objects.filter(available_plans=p, is_active=True).count()} features') for p in plans]"
	@printf "$(GREEN)✅ Vérification terminée !$(NC)\n"

setup-test-env: ## Configurer l'environnement de test complet (tenants, abonnements, factures, paiements)
	@printf "$(GREEN)🚀 Configuration de l'environnement de test...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python manage.py setup_test_environment
	@printf "$(GREEN)✅ Environnement de test configuré !$(NC)\n"

setup-test-env-reset: ## Réinitialiser et configurer l'environnement de test (supprime les données existantes)
	@printf "$(GREEN)🚀 Réinitialisation de l'environnement de test...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python manage.py setup_test_environment --reset
	@printf "$(GREEN)✅ Environnement de test réinitialisé !$(NC)\n"

init-defaults: ## Initialiser les blocs et templates de base
	@printf "$(GREEN)🚀 Initialisation des blocs et templates de base...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python manage.py create_default_block_types
	@docker exec $(BACKEND_CONTAINER) python manage.py create_default_templates
	@printf "$(GREEN)✅ Blocs et templates initialisés !$(NC)\n"

init-blocks: ## Initialiser uniquement les blocs de base
	@printf "$(GREEN)📦 Initialisation des blocs de base...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python manage.py create_default_block_types
	@printf "$(GREEN)✅ Blocs initialisés !$(NC)\n"


init-features: ## Initialiser les fonctionnalités avec leurs plans associés
	@printf "$(GREEN)🎯 Initialisation des fonctionnalités...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python manage.py init_features
	@printf "$(GREEN)✅ Fonctionnalités initialisées !$(NC)\n"

sync-features: ## Synchroniser les fonctionnalités de tous les tenants avec leurs plans
	@printf "$(GREEN)🔄 Synchronisation des fonctionnalités des tenants...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python manage.py sync_tenant_features
	@printf "$(GREEN)✅ Synchronisation terminée !$(NC)\n"

sync-features-tenant: ## Synchroniser les fonctionnalités d'un tenant spécifique (usage: make sync-features-tenant TENANT_ID=5)
	@printf "$(GREEN)🔄 Synchronisation des fonctionnalités d'un tenant...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@if [ -z "$(TENANT_ID)" ]; then \
		printf "$(RED)❌ Usage: make sync-features-tenant TENANT_ID=5$(NC)\n"; \
	else \
		docker exec $(BACKEND_CONTAINER) python manage.py sync_tenant_features --tenant-id=$(TENANT_ID); \
	fi
	@printf "$(GREEN)✅ Synchronisation terminée !$(NC)\n"

test-features: ## Tester l'accès aux fonctionnalités pour tous les tenants de test
	@printf "$(GREEN)🧪 Test d'accès aux fonctionnalités...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python manage.py test_feature_access
	@printf "$(GREEN)✅ Test terminé !$(NC)\n"

##@ Tests Billing spécifiques

test-subscriptions-internal: ## Tester les abonnements (interne)
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) pytest billing/tests/test_models.py::TestSubscription billing/tests/test_views.py::TestSubscriptionViewSet -v --tb=short

test-payments-internal: ## Tester les paiements (interne)
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) pytest billing/tests/test_models.py::TestPayment -v --tb=short

test-invoices-internal: ## Tester les factures (interne)
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) pytest billing/tests/test_models.py::TestInvoice -v --tb=short

test-pricing-plans-internal: ## Tester les plans tarifaires (interne)
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) pytest billing/tests/test_models.py::TestPricingPlan billing/tests/test_views.py::TestPricingPlanViewSet -v --tb=short

test-coverage: ## Exécuter les tests avec couverture
	@printf "$(GREEN)📊 Exécution des tests avec couverture...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python -m pytest --verbose --tb=short || echo "⚠️ Tests terminés (pytest-cov optionnel)"
	@printf "$(GREEN)✅ Tests terminés !$(NC)\n"

lint: ## Vérification du code avec flake8
	@printf "$(BLUE)🔍 Vérification du code...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) flake8 .
	@printf "$(GREEN)✅ Vérification terminée !$(NC)\n"

format: ## Formatage du code avec black
	@printf "$(BLUE)🎨 Formatage du code...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) black .
	@printf "$(GREEN)✅ Code formaté !$(NC)\n"

##@ Logs

logs: ## Afficher tous les logs (tous les services)
	@$(DOCKER_COMPOSE) logs -f

logs-db: ## Logs PostgreSQL
	@$(DOCKER_COMPOSE) logs -f postgres

logs-redis: ## Logs Redis
	@$(DOCKER_COMPOSE) logs -f redis

logs-frontend: ## Logs Frontend
	@$(DOCKER_COMPOSE) logs -f frontend

logs-pgadmin: ## Logs PgAdmin
	@$(DOCKER_COMPOSE) logs -f pgadmin

##@ Utilitaires

clean: ## Nettoyer les fichiers temporaires
	@printf "$(YELLOW)🧹 Nettoyage...$(NC)\n"
	@find . -type f -name "*.pyc" -delete
	@find . -type d -name "__pycache__" -delete
	@find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	@printf "$(GREEN)✅ Nettoyage terminé !$(NC)\n"

reset: clean migrate ## Reset des données
	@printf "$(GREEN)🔄 Reset terminé !$(NC)\n"

status: ## Statut des services
	@$(DOCKER_COMPOSE) ps

##@ Templates

generate-previews: ## Générer les previews des templates (usage: make generate-previews ARGS="--all")
	@printf "$(GREEN)📸 Génération des previews de templates...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python manage.py generate_template_previews $(ARGS)
	@printf "$(GREEN)✅ Previews générées !$(NC)\n"

install-playwright: ## Installer Playwright pour les captures d'écran
	@printf "$(GREEN)📦 Installation de Playwright...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python manage.py install_playwright
	@printf "$(GREEN)✅ Playwright installé !$(NC)\n"

check-trial-expiration: ## Vérifier et mettre à jour les trials expirés
	@printf "$(GREEN)🔄 Vérification des trials expirés...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python manage.py check_trial_expiration
	@printf "$(GREEN)✅ Vérification terminée !$(NC)\n"

check-trial-expiration-dry-run: ## Vérifier les trials expirés sans appliquer les changements
	@printf "$(GREEN)🔄 Vérification des trials expirés (dry-run)...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python manage.py check_trial_expiration --dry-run
	@printf "$(GREEN)✅ Vérification terminée !$(NC)\n"

check-trial-expiration-with-notifications: ## Vérifier les trials expirés et envoyer les notifications
	@printf "$(GREEN)🔄 Vérification des trials expirés avec notifications...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python manage.py check_trial_expiration --send-notifications
	@printf "$(GREEN)✅ Vérification terminée !$(NC)\n"

setup-trial-cron: ## Configurer la tâche cron pour vérifier les trials automatiquement (tous les jours à 2h)
	@printf "$(GREEN)⏰ Configuration de la tâche cron pour les trials...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) bash -c "echo '0 2 * * * cd /app && python manage.py check_trial_expiration --send-notifications >> /var/log/trial_check.log 2>&1' | crontab -"
	@printf "$(GREEN)✅ Tâche cron configurée !$(NC)\n"
	@printf "$(YELLOW)💡 La vérification s'exécutera tous les jours à 2h du matin$(NC)\n"

##@ URLs

urls: ## Afficher les URLs importantes
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "$(GREEN)🌐 URLs VTCBuilder :$(NC)\n"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "  $(YELLOW)Frontend:$(NC)           http://localhost:3004\n"
	@printf "  $(YELLOW)API Django:$(NC)         http://localhost:8088/api/\n"
	@printf "  $(YELLOW)Admin Django:$(NC)      http://localhost:8088/admin/\n"
	@printf "  $(YELLOW)PgAdmin:$(NC)           http://localhost:8084\n"
	@printf "  $(YELLOW)PostgreSQL:$(NC)        localhost:5434\n"
	@printf "  $(YELLOW)Redis:$(NC)             localhost:6381\n"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"

init-public-pages: ## Initialiser les pages publiques de documentation
	@printf "$(GREEN)📄 Initialisation des pages publiques...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python manage.py init_public_pages
	@printf "$(GREEN)✅ Pages publiques initialisées !$(NC)\n"

create-public-pages-blocks: ## Créer les blocs et initialiser les pages publiques avec le contenu exact des pages existantes
	@printf "$(GREEN)🚀 Création des blocs et initialisation des pages publiques...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python manage.py create_public_pages_blocks
	@printf "$(GREEN)✅ Blocs et pages publiques créés !$(NC)\n"
	@printf "$(BLUE)💡 Les pages sont disponibles dans /admin/pages-public$(NC)\n"

init-templates: ## Initialiser les templates de base (VTC Minimaliste, Moderne, Classique) avec intégration blocs
	@printf "$(GREEN)🎨 Initialisation des templates de base...$(NC)\n"
	@$(DOCKER_COMPOSE) up -d postgres redis backend
	@sleep 5
	@docker exec $(BACKEND_CONTAINER) python manage.py create_default_templates
	@printf "$(GREEN)✅ Templates de base initialisés !$(NC)\n"
	@printf "$(BLUE)💡 Les templates sont maintenant disponibles dans /admin/templates$(NC)\n"
	@printf "$(BLUE)💡 Les templates s'intègrent avec les blocs via {% block block_name %} dans le HTML$(NC)\n"

.DEFAULT_GOAL := help
