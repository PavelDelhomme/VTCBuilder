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

##@ Pages Publiques

generate-public-pages: ## Générer les pages publiques dans l'éditeur pour les tenants
	@printf "$(GREEN)🚀 Génération des pages publiques dans l'éditeur...$(NC)\n"
	@docker compose exec -T $(BACKEND_CONTAINER) python manage.py generate_public_pages || \
	 docker compose exec -T $(BACKEND_CONTAINER) python manage.py generate_public_pages --schema=public || \
	 (printf "$(YELLOW)⚠️  Impossible d'exécuter la commande dans le conteneur.$(NC)\n" && \
	  printf "$(BLUE)Exécutez manuellement :$(NC)\n" && \
	  printf "  cd backend-django && python manage.py generate_public_pages\n")

restore-public-pages: ## Restaurer les pages publiques depuis le backup
	@printf "$(GREEN)🔄 Restauration des pages publiques depuis le backup...$(NC)\n"
	@bash scripts/restore_public_pages.sh

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
	@printf "$(GREEN)📦 Installation du projet VTCBuilder Django...$(NC)\n"
	@printf "$(GREEN)🐳 Construction des images Docker...$(NC)\n"
	@cd backend-django && $(MAKE) install
	@printf "$(GREEN)✅ Installation terminée !$(NC)\n"
	@printf "$(BLUE)Utilisez 'make setup-backend-django' pour la configuration complète$(NC)\n"

setup: setup-backend-django ## Alias pour setup-backend-django

setup-backend-django: ## Installation et configuration complète du backend Django
	@printf "$(GREEN)✨ Configuration complète Django...$(NC)\n"
	@printf "$(YELLOW)📦 Installation du backend Django...$(NC)\n"
	@cd backend-django && $(MAKE) install
	@printf "$(YELLOW)🗄️  Configuration des migrations...$(NC)\n"
	@cd backend-django && $(MAKE) migrate
	@printf "$(YELLOW)🔐 Configuration des permissions...$(NC)\n"
	@cd backend-django && $(MAKE) setup-permissions
	@printf "$(GREEN)✅ Configuration terminée !$(NC)\n"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "$(GREEN)🚀 Application prête ! Utilisez 'make start' pour démarrer$(NC)\n"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "$(GREEN)📍 URLs disponibles après démarrage :$(NC)\n"
	@echo "   Frontend:     http://localhost:9494"
	@echo "   API Django:   http://localhost:9495/api/"
	@echo "   Admin Django: http://localhost:9495/admin/"
	@echo "   PgAdmin:      http://localhost:9498"
	@echo "   PostgreSQL:   localhost:9496"
	@echo "   Redis:        localhost:9497"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "$(GREEN)🔐 Compte Super Admin :$(NC)\n"
	@echo "   Email:    admin@vtcbuilder.com"
	@echo "   Password: admin123"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"

quick-start: setup-backend-django start ## Configuration complète + démarrage en une commande
	@printf "$(GREEN)🎉 Tout est prêt et démarré !$(NC)\n"

##@ Gestion des Containers

start: ## Démarrer tous les services
	@printf "$(GREEN)🚀 Démarrage des services Django...$(NC)\n"
	@cd backend-django && $(MAKE) start
	@printf "$(GREEN)✅ Services démarrés !$(NC)\n"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "$(GREEN)📍 URLs d'accès :$(NC)\n"
	@echo "   Frontend:     http://localhost:9494"
	@echo "   API Django:   http://localhost:9495/api/"
	@echo "   Admin Django: http://localhost:9495/admin/"
	@echo "   PgAdmin:      http://localhost:9498"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "$(GREEN)💡 Utilisez 'make logs' pour voir les logs$(NC)\n"
	@printf "$(GREEN)💡 Utilisez 'make status' pour vérifier le statut$(NC)\n"

up: ## Démarrer tous les services
	@printf "$(GREEN)🚀 Démarrage des services Django...$(NC)\n"
	@cd backend-django && $(MAKE) start
	@printf "$(GREEN)✅ Services démarrés !$(NC)\n"


stop: ## Arrêter tous les services
	@printf "$(YELLOW)⏸️  Arrêt des services...$(NC)\n"
	@cd backend-django && $(MAKE) stop
	@printf "$(GREEN)✅ Services arrêtés !$(NC)\n"

restart: ## Redémarrer tous les services
	@printf "$(YELLOW)🔄 Redémarrage des services...$(NC)\n"
	@cd backend-django && $(MAKE) restart
	@printf "$(GREEN)✅ Services redémarrés !$(NC)\n"

down: ## Arrêter et supprimer tous les containers
	@printf "$(RED)🗑️  Suppression des containers...$(NC)\n"
	@cd backend-django && $(MAKE) down
	@printf "$(GREEN)✅ Containers supprimés !$(NC)\n"

build: ## Reconstruire les images Docker
	@printf "$(GREEN)🔨 Reconstruction des images...$(NC)\n"
	@cd backend-django && $(MAKE) build
	@printf "$(GREEN)✅ Images reconstruites !$(NC)\n"

rebuild: ## Tout reconstruire et redémarrer
	@printf "$(GREEN)🔄 Reconstruction complète...$(NC)\n"
	@cd backend-django && $(MAKE) rebuild
	@printf "$(GREEN)✅ Reconstruction terminée !$(NC)\n"

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
	@printf "$(GREEN)✅ Tous les tests terminés !$(NC)\n"

test-backend: ## Exécuter les tests backend
	@printf "$(GREEN)🧪 Exécution des tests backend...$(NC)\n"
	@cd backend-django && $(MAKE) test
	@printf "$(GREEN)✅ Tests backend terminés !$(NC)\n"

test-api: ## Tester tous les endpoints de l'API
	@printf "$(GREEN)🧪 Tests des endpoints API...$(NC)\n"
	@cd backend-django && $(MAKE) test-api
	@printf "$(GREEN)✅ Tests API terminés !$(NC)\n"

test-frontend: ## Exécuter les tests frontend
	@printf "$(GREEN)🧪 Exécution des tests frontend...$(NC)\n"
	@cd frontend && npm test -- --passWithNoTests
	@printf "$(GREEN)✅ Tests frontend terminés !$(NC)\n"

check-errors: ## Vérifier les erreurs dans les logs backend
	@printf "$(BLUE)🔍 Vérification des erreurs...$(NC)\n"
	@cd backend-django && $(MAKE) check-errors

verify-features: ## Vérifier l'accès aux features selon les plans
	@printf "$(GREEN)🔐 Vérification de l'accès aux features...$(NC)\n"
	@cd backend-django && $(MAKE) verify-features
	@printf "$(GREEN)✅ Vérification terminée !$(NC)\n"

test-coverage: ## Exécuter les tests avec couverture de code
	@printf "$(GREEN)📊 Exécution des tests avec couverture...$(NC)\n"
	@cd backend-django && $(MAKE) test-coverage
	@cd frontend && npm test -- --coverage --passWithNoTests
	@printf "$(GREEN)✅ Rapports de couverture générés !$(NC)\n"

##@ Tests Billing (Abonnements, Paiements, Factures)

test-billing: test-subscriptions test-payments test-invoices ## Exécuter tous les tests de facturation
	@printf "$(GREEN)✅ Tous les tests de facturation terminés !$(NC)\n"

test-subscriptions: ## Tester les abonnements (subscriptions)
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "$(GREEN)🧪 Tests des Abonnements (Subscriptions)$(NC)\n"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@cd backend-django && $(MAKE) test-subscriptions-internal
	@printf "$(GREEN)✅ Tests des abonnements terminés !$(NC)\n"

test-payments: ## Tester les paiements (payments)
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "$(GREEN)🧪 Tests des Paiements (Payments)$(NC)\n"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@cd backend-django && $(MAKE) test-payments-internal
	@printf "$(GREEN)✅ Tests des paiements terminés !$(NC)\n"

test-invoices: ## Tester les factures (invoices)
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "$(GREEN)🧪 Tests des Factures (Invoices)$(NC)\n"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@cd backend-django && $(MAKE) test-invoices-internal
	@printf "$(GREEN)✅ Tests des factures terminés !$(NC)\n"

test-pricing-plans: ## Tester les plans tarifaires (pricing plans)
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "$(GREEN)🧪 Tests des Plans Tarifaires (Pricing Plans)$(NC)\n"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@cd backend-django && $(MAKE) test-pricing-plans-internal
	@printf "$(GREEN)✅ Tests des plans tarifaires terminés !$(NC)\n"

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
	@printf "$(GREEN)📦 Installation des dépendances npm...$(NC)\n"
	@cd frontend && npm install

npm-build: ## Build du frontend
	@printf "$(GREEN)🔨 Build du frontend...$(NC)\n"
	@cd frontend && npm run build

npm-dev: ## Démarrer le mode développement
	@printf "$(GREEN)🚀 Démarrage du mode développement...$(NC)\n"
	@cd frontend && npm run dev

npm-test: ## Tester le frontend (unitaires)
	@printf "$(GREEN)🧪 Tests unitaires du frontend...$(NC)\n"
	@cd frontend && npm test -- --passWithNoTests
	@printf "$(GREEN)✅ Tests frontend terminés$(NC)\n"

npm: ## Exécuter une commande npm
	@printf "$(BLUE)🔧 Exécution de npm $(cmd)...$(NC)\n"
	@cd frontend && npm $(cmd)

##@ Accès aux Containers

bash-backend: ## Accéder au terminal du backend Django
	@printf "$(BLUE)🔧 Accès au container backend Django...$(NC)\n"
	@cd backend-django && $(MAKE) shell

bash-frontend: ## Accéder au terminal du frontend
	@printf "$(BLUE)🔧 Accès au container frontend...$(NC)\n"
	@docker exec -it vtcbuilder-frontend /bin/sh

db-cli: ## Accéder à PostgreSQL CLI
	@printf "$(BLUE)🗄️  Accès à PostgreSQL...$(NC)\n"
	@cd backend-django && $(MAKE) dbshell

##@ Nettoyage

clean: ## Nettoyer les containers et volumes
	@printf "$(RED)🧹 Nettoyage complet...$(NC)\n"
	@$(DOCKER_COMPOSE) down -v
	@docker system prune -f
	@printf "$(GREEN)✅ Nettoyage terminé !$(NC)\n"

clean-all: clean ## Nettoyage complet + suppression des images
	@docker rmi $(shell docker images -q vtcbuilder* 2>/dev/null) 2>/dev/null || true
	@printf "$(GREEN)✅ Nettoyage complet terminé !$(NC)\n"

reset: clean-all install start ## Reset complet du projet

##@ Production

prod-build: ## Build pour la production
	@printf "$(GREEN)🚀 Build production...$(NC)\n"
	@$(DOCKER_COMPOSE) -f docker-compose.yml -f docker-compose.prod.yml build
	@printf "$(GREEN)✅ Build production terminé !$(NC)\n"

prod-up: ## Démarrer en mode production
	@printf "$(GREEN)🚀 Démarrage en production...$(NC)\n"
	@$(DOCKER_COMPOSE) -f docker-compose.yml -f docker-compose.prod.yml up -d
	@printf "$(GREEN)✅ Production démarrée !$(NC)\n"

prod-deploy: prod-build prod-up migrate optimize ## Déploiement complet en production
	@printf "$(GREEN)✅ Déploiement production terminé !$(NC)\n"

##@ Utilitaires

# Commandes Laravel obsolètes supprimées - Projet migré vers Django

urls: ## Afficher toutes les URLs du projet
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "$(GREEN)🌐 URLs de l'application VTCBuilder :$(NC)\n"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@echo "  $(YELLOW)Frontend Next.js:$(NC)  http://localhost:9494"
	@echo "  $(YELLOW)Backend API:$(NC)        http://localhost:9495/api/"
	@echo "  $(YELLOW)Admin Django:$(NC)       http://localhost:9495/admin/"
	@echo "  $(YELLOW)PgAdmin:$(NC)            http://localhost:9498"
	@echo "  $(YELLOW)PostgreSQL:$(NC)         localhost:9496"
	@echo "  $(YELLOW)Redis:$(NC)              localhost:9497"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "$(GREEN)🔐 Comptes de test :$(NC)\n"
	@echo "  $(YELLOW)Super Admin:$(NC)        admin@vtcbuilder.com / admin123"
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"

info: ## Informations système Docker
	@printf "$(BLUE)ℹ️  Informations Docker :$(NC)\n"
	@docker --version
	@docker-compose --version
	@echo ""
	@printf "$(BLUE)💾 Utilisation disque :$(NC)\n"
	@docker system df

# Commande par défaut
.DEFAULT_GOAL := help

