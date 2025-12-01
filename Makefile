.PHONY: help install setup start stop restart build logs clean migrate migrations migrate-fresh superuser shell dbshell collectstatic test lint format logs-backend logs-db logs-redis npm-install npm-build npm-dev npm bash-backend bash-frontend db-cli test-billing test-subscriptions test-payments test-invoices test-pricing-plans test-trial-status test-trial-create test-trial-activate test-trial-expire test-trial-advance

# Variables
DOCKER_COMPOSE = docker-compose
BACKEND_CONTAINER = vtcbuilder-backend
FRONTEND_CONTAINER = vtcbuilder-frontend
MYSQL_CONTAINER = vtcbuilder-mysql
NGINX_CONTAINER = vtcbuilder-nginx

# Couleurs pour l'affichage
BLUE = \033[0;34m
GREEN = \033[0;32m
YELLOW = \033[0;33m
RED = \033[0;31m
NC = \033[0m # No Color

##@ Aide

help: ## Afficher l'aide
	@printf "$(BLUE)═══════════════════════════════════════════════════════════════$(NC)\n"
	@printf "$(GREEN)    VTCBuilder Django - Commandes disponibles$(NC)\n"
	@printf "$(BLUE)═══════════════════════════════════════════════════════════════$(NC)\n"
	@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(BLUE)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@printf "\n"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "$(GREEN)📁 Commandes Backend Django (backend-django/):$(NC)\n"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@cd backend-django && make help | grep -E "(install|setup|start|stop|restart|build|logs|clean|migrate|superuser|shell|test|lint|format|urls)" | sed 's/^/  /'
	@printf "\n"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "$(GREEN)📁 Commandes Frontend (frontend/):$(NC)\n"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "  $(YELLOW)npm-install         $(NC) Installer les dépendances npm\n"
	@printf "  $(YELLOW)npm-build           $(NC) Build du frontend\n"
	@printf "  $(YELLOW)npm-dev             $(NC) Démarrer le mode développement\n"
	@printf "  $(YELLOW)npm                 $(NC) Exécuter une commande npm\n"

##@ Installation et Configuration

install: ## Installation complète du projet
	@echo "$(GREEN)📦 Installation du projet VTCBuilder Django...$(NC)"
	@echo "$(GREEN)🐳 Construction des images Docker...$(NC)"
	@cd backend-django && $(MAKE) install
	@echo "$(GREEN)✅ Installation terminée !$(NC)"
	@echo "$(BLUE)Utilisez 'make setup-backend-django' pour la configuration complète$(NC)"

setup: setup-backend-django ## Alias pour setup-backend-django

setup-backend-django: ## Installation et configuration complète du backend Django
	@echo "$(GREEN)✨ Configuration complète Django...$(NC)"
	@echo "$(YELLOW)📦 Installation du backend Django...$(NC)"
	@cd backend-django && $(MAKE) install
	@echo "$(YELLOW)🗄️  Configuration des migrations...$(NC)"
	@cd backend-django && $(MAKE) migrate
	@echo "$(YELLOW)🔐 Configuration des permissions...$(NC)"
	@cd backend-django && $(MAKE) setup-permissions
	@echo "$(GREEN)✅ Configuration terminée !$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(GREEN)🚀 Application prête ! Utilisez 'make start' pour démarrer$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(GREEN)📍 URLs disponibles après démarrage :$(NC)"
	@echo "   Frontend:     http://localhost:9494"
	@echo "   API Django:   http://localhost:9495/api/"
	@echo "   Admin Django: http://localhost:9495/admin/"
	@echo "   PgAdmin:      http://localhost:9498"
	@echo "   PostgreSQL:   localhost:9496"
	@echo "   Redis:        localhost:9497"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(GREEN)🔐 Compte Super Admin :$(NC)"
	@echo "   Email:    admin@vtcbuilder.com"
	@echo "   Password: admin123"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"

quick-start: setup-backend-django start ## Configuration complète + démarrage en une commande
	@echo "$(GREEN)🎉 Tout est prêt et démarré !$(NC)"

##@ Gestion des Containers

start: ## Démarrer tous les services
	@echo "$(GREEN)🚀 Démarrage des services Django...$(NC)"
	@cd backend-django && $(MAKE) start
	@echo "$(GREEN)✅ Services démarrés !$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(GREEN)📍 URLs d'accès :$(NC)"
	@echo "   Frontend:     http://localhost:9494"
	@echo "   API Django:   http://localhost:9495/api/"
	@echo "   Admin Django: http://localhost:9495/admin/"
	@echo "   PgAdmin:      http://localhost:9498"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(GREEN)💡 Utilisez 'make logs' pour voir les logs$(NC)"
	@echo "$(GREEN)💡 Utilisez 'make status' pour vérifier le statut$(NC)"

up: ## Démarrer tous les services
	@echo "$(GREEN)🚀 Démarrage des services Django...$(NC)"
	@cd backend-django && $(MAKE) start
	@echo "$(GREEN)✅ Services démarrés !$(NC)"


stop: ## Arrêter tous les services
	@echo "$(YELLOW)⏸️  Arrêt des services...$(NC)"
	@cd backend-django && $(MAKE) stop
	@echo "$(GREEN)✅ Services arrêtés !$(NC)"

restart: ## Redémarrer tous les services
	@echo "$(YELLOW)🔄 Redémarrage des services...$(NC)"
	@cd backend-django && $(MAKE) restart
	@echo "$(GREEN)✅ Services redémarrés !$(NC)"

down: ## Arrêter et supprimer tous les containers
	@echo "$(RED)🗑️  Suppression des containers...$(NC)"
	@cd backend-django && $(MAKE) down
	@echo "$(GREEN)✅ Containers supprimés !$(NC)"

build: ## Reconstruire les images Docker
	@echo "$(GREEN)🔨 Reconstruction des images...$(NC)"
	@cd backend-django && $(MAKE) build
	@echo "$(GREEN)✅ Images reconstruites !$(NC)"

rebuild: ## Tout reconstruire et redémarrer
	@echo "$(GREEN)🔄 Reconstruction complète...$(NC)"
	@cd backend-django && $(MAKE) rebuild
	@echo "$(GREEN)✅ Reconstruction terminée !$(NC)"

status: ## Afficher le statut des services VTCBuilder
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "$(GREEN)📊 Statut des conteneurs VTCBuilder :$(NC)\n"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@docker ps --filter "name=vtcbuilder" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || true
	@printf "\n"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "$(GREEN)📈 Résumé :$(NC)\n"
	@RUNNING=$$(docker ps --filter "name=vtcbuilder" --format "{{.Names}}" | wc -l); \
	 STOPPED=$$(docker ps -a --filter "name=vtcbuilder" --filter "status=exited" --format "{{.Names}}" | wc -l); \
	 printf "  $(GREEN)●$(NC) En cours d'exécution : $$RUNNING\n"; \
	 if [ $$STOPPED -gt 0 ]; then printf "  $(RED)●$(NC) Arrêtés : $$STOPPED\n"; fi
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"

##@ Backend Django (backend-django/)

# Rediriger les commandes vers le Makefile Django
migrate: ## Exécuter les migrations Django
	@cd backend-django && $(MAKE) migrate

migrations: ## Créer de nouvelles migrations
	@cd backend-django && $(MAKE) migrations

migrate-fresh: ## Reset et re-exécuter les migrations
	@cd backend-django && $(MAKE) migrate-fresh

superuser: ## Créer un superutilisateur
	@cd backend-django && $(MAKE) superuser

shell: ## Accéder au shell Django
	@cd backend-django && $(MAKE) shell

dbshell: ## Accéder au shell PostgreSQL
	@cd backend-django && $(MAKE) dbshell

collectstatic: ## Collecter les fichiers statiques
	@cd backend-django && $(MAKE) collectstatic

test: test-backend test-frontend ## Exécuter tous les tests (backend + frontend)
	@echo "$(GREEN)✅ Tous les tests terminés !$(NC)"

test-backend: ## Exécuter les tests backend
	@echo "$(GREEN)🧪 Exécution des tests backend...$(NC)"
	@cd backend-django && $(MAKE) test
	@echo "$(GREEN)✅ Tests backend terminés !$(NC)"

test-api: ## Tester tous les endpoints de l'API
	@echo "$(GREEN)🧪 Tests des endpoints API...$(NC)"
	@cd backend-django && $(MAKE) test-api
	@echo "$(GREEN)✅ Tests API terminés !$(NC)"

test-frontend: ## Exécuter les tests frontend
	@echo "$(GREEN)🧪 Exécution des tests frontend...$(NC)"
	@cd frontend && npm test -- --passWithNoTests
	@echo "$(GREEN)✅ Tests frontend terminés !$(NC)"

check-errors: ## Vérifier les erreurs dans les logs backend
	@echo "$(BLUE)🔍 Vérification des erreurs...$(NC)"
	@cd backend-django && $(MAKE) check-errors

verify-features: ## Vérifier l'accès aux features selon les plans
	@echo "$(GREEN)🔐 Vérification de l'accès aux features...$(NC)"
	@cd backend-django && $(MAKE) verify-features
	@echo "$(GREEN)✅ Vérification terminée !$(NC)"

test-coverage: ## Exécuter les tests avec couverture de code
	@echo "$(GREEN)📊 Exécution des tests avec couverture...$(NC)"
	@cd backend-django && $(MAKE) test-coverage
	@cd frontend && npm test -- --coverage --passWithNoTests
	@echo "$(GREEN)✅ Rapports de couverture générés !$(NC)"

##@ Tests Billing (Abonnements, Paiements, Factures)

test-billing: test-subscriptions test-payments test-invoices ## Exécuter tous les tests de facturation
	@echo "$(GREEN)✅ Tous les tests de facturation terminés !$(NC)"

test-subscriptions: ## Tester les abonnements (subscriptions)
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(GREEN)🧪 Tests des Abonnements (Subscriptions)$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@cd backend-django && $(MAKE) test-subscriptions-internal
	@echo "$(GREEN)✅ Tests des abonnements terminés !$(NC)"

test-payments: ## Tester les paiements (payments)
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(GREEN)🧪 Tests des Paiements (Payments)$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@cd backend-django && $(MAKE) test-payments-internal
	@echo "$(GREEN)✅ Tests des paiements terminés !$(NC)"

test-invoices: ## Tester les factures (invoices)
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(GREEN)🧪 Tests des Factures (Invoices)$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@cd backend-django && $(MAKE) test-invoices-internal
	@echo "$(GREEN)✅ Tests des factures terminés !$(NC)"

test-pricing-plans: ## Tester les plans tarifaires (pricing plans)
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(GREEN)🧪 Tests des Plans Tarifaires (Pricing Plans)$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@cd backend-django && $(MAKE) test-pricing-plans-internal
	@echo "$(GREEN)✅ Tests des plans tarifaires terminés !$(NC)"

##@ Tests Trial (Abonnements d'essai)

test-trial-status: ## Afficher le statut de tous les abonnements trial
	@cd backend-django && $(MAKE) test-trial-status

test-trial-create: ## Créer un abonnement trial (usage: make test-trial-create TENANT_ID=1 PLAN_ID=1 DAYS=14)
	@cd backend-django && $(MAKE) test-trial-create TENANT_ID=$(TENANT_ID) PLAN_ID=$(PLAN_ID) DAYS=$(DAYS)

test-trial-activate: ## Activer un abonnement trial (usage: make test-trial-activate TENANT_ID=1)
	@cd backend-django && $(MAKE) test-trial-activate TENANT_ID=$(TENANT_ID)

test-trial-expire: ## Expirer un abonnement trial (usage: make test-trial-expire TENANT_ID=1)
	@cd backend-django && $(MAKE) test-trial-expire TENANT_ID=$(TENANT_ID)

test-trial-advance: ## Avancer le temps pour simuler l'expiration (usage: make test-trial-advance DAYS=15)
	@cd backend-django && $(MAKE) test-trial-advance DAYS=$(DAYS)

lint: ## Vérification du code avec flake8
	@cd backend-django && $(MAKE) lint

format: ## Formatage du code avec black
	@cd backend-django && $(MAKE) format

demo-tenant: ## Créer un tenant de démonstration
	@cd backend-django && $(MAKE) demo-tenant

logs: logs-backend ## Voir tous les logs (alias pour logs-backend)

logs-backend: ## Logs du backend Django
	@cd backend-django && $(MAKE) logs

logs-db: ## Logs PostgreSQL
	@cd backend-django && $(MAKE) logs-db

logs-redis: ## Logs Redis
	@cd backend-django && $(MAKE) logs-redis

##@ Frontend (frontend/)

npm-install: ## Installer les dépendances npm
	@echo "$(GREEN)📦 Installation des dépendances npm...$(NC)"
	@cd frontend && npm install

npm-build: ## Build du frontend
	@echo "$(GREEN)🔨 Build du frontend...$(NC)"
	@cd frontend && npm run build

npm-dev: ## Démarrer le mode développement
	@echo "$(GREEN)🚀 Démarrage du mode développement...$(NC)"
	@cd frontend && npm run dev

npm-test: ## Tester le frontend (unitaires)
	@echo "$(GREEN)🧪 Tests unitaires du frontend...$(NC)"
	@cd frontend && npm test -- --passWithNoTests
	@echo "$(GREEN)✅ Tests frontend terminés$(NC)"

npm: ## Exécuter une commande npm
	@echo "$(BLUE)🔧 Exécution de npm $(cmd)...$(NC)"
	@cd frontend && npm $(cmd)

##@ Accès aux Containers

bash-backend: ## Accéder au terminal du backend Django
	@echo "$(BLUE)🔧 Accès au container backend Django...$(NC)"
	@cd backend-django && $(MAKE) shell

bash-frontend: ## Accéder au terminal du frontend
	@echo "$(BLUE)🔧 Accès au container frontend...$(NC)"
	@docker exec -it vtcbuilder-frontend /bin/sh

db-cli: ## Accéder à PostgreSQL CLI
	@echo "$(BLUE)🗄️  Accès à PostgreSQL...$(NC)"
	@cd backend-django && $(MAKE) dbshell

##@ Nettoyage

clean: ## Nettoyer les containers et volumes
	@echo "$(RED)🧹 Nettoyage complet...$(NC)"
	@$(DOCKER_COMPOSE) down -v
	@docker system prune -f
	@echo "$(GREEN)✅ Nettoyage terminé !$(NC)"

clean-all: clean ## Nettoyage complet + suppression des images
	@docker rmi $(shell docker images -q vtcbuilder* 2>/dev/null) 2>/dev/null || true
	@echo "$(GREEN)✅ Nettoyage complet terminé !$(NC)"

reset: clean-all install start ## Reset complet du projet

##@ Production

prod-build: ## Build pour la production
	@echo "$(GREEN)🚀 Build production...$(NC)"
	@$(DOCKER_COMPOSE) -f docker-compose.yml -f docker-compose.prod.yml build
	@echo "$(GREEN)✅ Build production terminé !$(NC)"

prod-up: ## Démarrer en mode production
	@echo "$(GREEN)🚀 Démarrage en production...$(NC)"
	@$(DOCKER_COMPOSE) -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✅ Production démarrée !$(NC)"

prod-deploy: prod-build prod-up migrate optimize ## Déploiement complet en production
	@echo "$(GREEN)✅ Déploiement production terminé !$(NC)"

##@ Utilitaires

# Commandes Laravel obsolètes supprimées - Projet migré vers Django

urls: ## Afficher toutes les URLs du projet
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(GREEN)🌐 URLs de l'application VTCBuilder :$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "  $(YELLOW)Frontend Next.js:$(NC)  http://localhost:9494"
	@echo "  $(YELLOW)Backend API:$(NC)        http://localhost:9495/api/"
	@echo "  $(YELLOW)Admin Django:$(NC)       http://localhost:9495/admin/"
	@echo "  $(YELLOW)PgAdmin:$(NC)            http://localhost:9498"
	@echo "  $(YELLOW)PostgreSQL:$(NC)         localhost:9496"
	@echo "  $(YELLOW)Redis:$(NC)              localhost:9497"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(GREEN)🔐 Comptes de test :$(NC)"
	@echo "  $(YELLOW)Super Admin:$(NC)        admin@vtcbuilder.com / admin123"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"

info: ## Informations système Docker
	@echo "$(BLUE)ℹ️  Informations Docker :$(NC)"
	@docker --version
	@docker-compose --version
	@echo ""
	@echo "$(BLUE)💾 Utilisation disque :$(NC)"
	@docker system df

# Commande par défaut
.DEFAULT_GOAL := help

