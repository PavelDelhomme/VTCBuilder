# Makefile pour VTCBuilder
# Optimisé pour réduire la consommation mémoire et CPU

.PHONY: help up start stop restart build rebuild logs status clean monitor-performance compare-performance

help:
	@echo "Commandes disponibles:"
	@echo "  make up                 - Démarrer tous les services (alias de start)"
	@echo "  make start              - Démarrer tous les services"
	@echo "  make stop               - Arrêter tous les services"
	@echo "  make restart            - Redémarrer tous les services"
	@echo "  make build              - Construire les images Docker"
	@echo "  make rebuild            - Reconstruire les images Docker"
	@echo "  make logs               - Voir les logs de tous les services"
	@echo "  make logs-backend       - Voir les logs du backend"
	@echo "  make logs-frontend      - Voir les logs du frontend"
	@echo "  make logs-db            - Voir les logs de PostgreSQL"
	@echo "  make logs-redis         - Voir les logs de Redis"
	@echo "  make status             - Voir le statut des services"
	@echo "  make clean              - Nettoyer les conteneurs et volumes"
	@echo "  make monitor-performance - Collecter les métriques de performance"
	@echo "  make compare-performance - Comparer les rapports de performance"
	@echo "  make bash-backend       - Ouvrir un shell dans le conteneur backend"

# Variables
DOCKER_COMPOSE = docker-compose
COMPOSE_FILE = docker-compose.yml

# Services
up: start

start:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) up -d

stop:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) stop

restart:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) restart
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) up -d

down:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down

build:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) build

rebuild:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) build --no-cache

logs:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f

logs-backend:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f backend

logs-frontend:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f frontend

logs-db:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f postgres

logs-redis:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f redis

logs-pgadmin:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f pgadmin

status:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) ps

clean:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down -v
	docker system prune -f

# Performance monitoring
monitor-performance:
	@./scripts/monitor_performance.sh

compare-performance:
	@python3 scripts/compare_performance.py

# Shell access
bash-backend:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec backend bash

# Migrations
migrate:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec backend python manage.py migrate

makemigrations:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec backend python manage.py makemigrations

# Super admin
createsuperuser:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec backend python manage.py createsuperuser
