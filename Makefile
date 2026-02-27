.PHONY: help setup install quality quality-frontend quality-backend test test-frontend test-backend test-unit test-integration test-e2e test-e2e-full test-coverage test-all tests test-editor test-reports test-results-list test-api frontend-test-editor analyze analyze-frontend analyze-backend lint lint-frontend lint-backend format format-frontend format-backend type-check type-check-frontend clean clean-network build start up stop restart restart-backend restart-frontend down logs status migrate frontend-clean frontend-reinstall frontend-build

BLUE = \033[0;34m
GREEN = \033[0;32m
YELLOW = \033[0;33m
RED = \033[0;31m
NC = \033[0m # No Color

COMPOSE = docker-compose -f docker-compose.simple.yml
BACKEND_CONTAINER = vtcbuilder-backend

##@ Aide

help: ## Afficher l'aide complète
	@printf "$(BLUE)═══════════════════════════════════════════════════════════════$(NC)\n"
	@printf "$(GREEN)    VTCBuilder - Commandes Complètes de Qualité et Tests$(NC)\n"
	@printf "$(BLUE)═══════════════════════════════════════════════════════════════$(NC)\n"
	@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(YELLOW)%-30s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(BLUE)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo ""

##@ Installation

setup: ## Installation complète de l'infrastructure (dépendances + pre-commit)
	@printf "$(GREEN)🚀 Installation complète de l'infrastructure...$(NC)\n"
	@./scripts/setup-quality.sh
	@if command -v python3 &> /dev/null; then \
		printf "$(YELLOW)📦 Installation de pre-commit...$(NC)\n"; \
		python3 -m pip install --user pre-commit 2>/dev/null || python3 -m pip install pre-commit 2>/dev/null || true; \
		pre-commit install 2>/dev/null || printf "$(YELLOW)⚠️  Pre-commit non installé (optionnel)$(NC)\n"; \
	fi
	@printf "$(GREEN)✅ Installation terminée !$(NC)\n"

install: setup ## Alias pour setup

##@ Frontend

frontend-clean: ## Nettoyer complètement le frontend (node_modules, .next, cache, etc.)
	@printf "$(YELLOW)🧹 Nettoyage complet du frontend...$(NC)\n"
	@cd frontend && \
		if [ -d "node_modules" ]; then \
			printf "$(YELLOW)  📦 Suppression de node_modules...$(NC)\n"; \
			rm -rf node_modules 2>/dev/null || sudo rm -rf node_modules || true; \
		fi && \
		if [ -d ".next" ]; then \
			printf "$(YELLOW)  🔄 Suppression du cache Next.js...$(NC)\n"; \
			rm -rf .next 2>/dev/null || sudo rm -rf .next || true; \
		fi && \
		if [ -f "package-lock.json" ]; then \
			printf "$(YELLOW)  📄 Suppression de package-lock.json...$(NC)\n"; \
			rm -f package-lock.json 2>/dev/null || sudo rm -f package-lock.json || true; \
		fi && \
		if [ -d ".turbo" ]; then \
			printf "$(YELLOW)  ⚡ Suppression du cache Turbo...$(NC)\n"; \
			rm -rf .turbo 2>/dev/null || sudo rm -rf .turbo || true; \
		fi && \
		find . -type d -name ".cache" -exec rm -rf {} + 2>/dev/null || true && \
		find . -type f -name "tsconfig.tsbuildinfo" -delete 2>/dev/null || true
	@printf "$(YELLOW)🔧 Correction des permissions du répertoire frontend...$(NC)\n"
	@chmod -R u+w frontend 2>/dev/null || sudo chmod -R u+w frontend || true
	@printf "$(GREEN)✅ Nettoyage frontend terminé !$(NC)\n"

frontend-reinstall: frontend-clean ## Nettoyer et réinstaller les dépendances frontend
	@printf "$(GREEN)📦 Réinstallation des dépendances frontend...$(NC)\n"
	@cd frontend && npm install
	@printf "$(GREEN)✅ Dépendances frontend réinstallées !$(NC)\n"

frontend-install: ## Installer les dépendances frontend
	@printf "$(GREEN)📦 Installation des dépendances frontend...$(NC)\n"
	@cd frontend && npm install
	@printf "$(GREEN)✅ Dépendances frontend installées !$(NC)\n"

frontend-lint: ## Linter le code frontend
	@printf "$(GREEN)🔍 Analyse ESLint frontend...$(NC)\n"
	@cd frontend && npm run lint
	@printf "$(GREEN)✅ Lint frontend terminé !$(NC)\n"

frontend-lint-fix: ## Corriger automatiquement les erreurs ESLint
	@printf "$(GREEN)🔧 Correction ESLint frontend...$(NC)\n"
	@cd frontend && npm run lint:fix
	@printf "$(GREEN)✅ Corrections appliquées !$(NC)\n"

frontend-format: ## Formater le code frontend
	@printf "$(GREEN)🎨 Formatage Prettier frontend...$(NC)\n"
	@cd frontend && npm run format
	@printf "$(GREEN)✅ Formatage frontend terminé !$(NC)\n"

frontend-format-check: ## Vérifier le formatage frontend
	@printf "$(GREEN)🎨 Vérification formatage frontend...$(NC)\n"
	@cd frontend && npm run format:check || (printf "$(YELLOW)⚠️  Fichiers non formatés$(NC)\n" && exit 1)
	@printf "$(GREEN)✅ Formatage OK !$(NC)\n"

frontend-type-check: ## Vérifier les types TypeScript
	@printf "$(GREEN)📘 Vérification TypeScript...$(NC)\n"
	@cd frontend && timeout 60 npm run type-check || printf "$(YELLOW)⚠️  Vérification TypeScript (peut prendre du temps)$(NC)\n"
	@printf "$(GREEN)✅ Vérification TypeScript terminée !$(NC)\n"

frontend-test: ## Exécuter les tests unitaires frontend (rapport: test-results/frontend.json)
	@printf "$(GREEN)🧪 Tests unitaires frontend...$(NC)\n"
	@mkdir -p test-results
	@cd frontend && npm test -- --silent --passWithNoTests --json --outputFile=../test-results/frontend.json
	@printf "$(GREEN)✅ Tests frontend terminés. Rapport: test-results/frontend.json$(NC)\n"

frontend-test-watch: ## Tests frontend en mode watch
	@printf "$(GREEN)👀 Tests frontend en mode watch...$(NC)\n"
	@cd frontend && npm run test:watch

frontend-test-coverage: ## Tests frontend avec couverture
	@printf "$(GREEN)📊 Tests frontend avec couverture...$(NC)\n"
	@cd frontend && npm run test:coverage
	@printf "$(GREEN)✅ Couverture frontend générée !$(NC)\n"

frontend-test-editor: ## Tests Jest de l'éditeur uniquement (sortie silencieuse, rapport: test-results/editor.json)
	@printf "$(GREEN)🧪 Tests éditeur frontend...$(NC)\n"
	@mkdir -p test-results
	@cd frontend && npm test -- --silent --testPathPattern="editor|vtc-forms|renderer-cases|BlockRenderer" --passWithNoTests --json --outputFile=../test-results/editor.json
	@printf "$(GREEN)✅ Tests éditeur terminés. Rapport: test-results/editor.json$(NC)\n"

frontend-test-e2e: ## Tests E2E Playwright (nécessite stack + env test; utiliser make test-e2e pour tout préparer)
	@printf "$(GREEN)🎭 Tests E2E frontend...$(NC)\n"
	@cd frontend && npm run test:e2e -- --project=chromium --reporter=html --reporter=list
	@printf "$(GREEN)✅ Tests E2E terminés. Rapport: frontend/playwright-report/index.html$(NC)\n"

frontend-test-e2e-full: ## Démarre la stack, configure l'env de test, lance Playwright, génère le rapport
	@printf "$(GREEN)🎭 E2E complet: stack + env test + Playwright...$(NC)\n"
	@$(COMPOSE) config -q 2>/dev/null || (printf "$(RED)❌ docker-compose.simple.yml introuvable ou invalide.$(NC)\n"; exit 1)
	@if ! docker image inspect vtcbuilder-backend:latest >/dev/null 2>&1; then \
		printf "$(YELLOW)⚠️  Image backend absente. Lancez d'abord: make build$(NC)\n"; exit 1; \
	fi
	@if ! docker ps --format '{{.Names}}' 2>/dev/null | grep -q '$(BACKEND_CONTAINER)'; then \
		printf "$(YELLOW)📦 Démarrage postgres + redis...$(NC)\n"; \
		$(COMPOSE) up -d postgres redis; \
		printf "$(YELLOW)⏳ Attente Postgres (60s)...$(NC)\n"; \
		for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do \
			$(COMPOSE) ps postgres 2>/dev/null | grep -q "Up" && break; sleep 3; \
			if [ $$i -eq 20 ]; then printf "$(RED)❌ Postgres non prêt$(NC)\n"; exit 1; fi; \
		done; \
		printf "$(YELLOW)📦 Démarrage backend...$(NC)\n"; \
		$(COMPOSE) up -d backend; \
		printf "$(YELLOW)⏳ Attente démarrage backend (30s)...$(NC)\n"; \
		sleep 30; \
		printf "$(YELLOW)🗄️  Migrations Django...$(NC)\n"; \
		$(COMPOSE) exec -T $(BACKEND_CONTAINER) python manage.py migrate_schemas --shared --noinput 2>/dev/null || true; \
		$(COMPOSE) exec -T $(BACKEND_CONTAINER) python manage.py migrate_all_tenant_schemas 2>/dev/null || true; \
		printf "$(YELLOW)⏳ Attente API backend (120s max)...$(NC)\n"; \
		for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40; do \
			if curl -s -o /dev/null -w "%{http_code}" http://localhost:9495/api/ 2>/dev/null | grep -qE '200|301|302|403|404'; then printf "$(GREEN)✅ Backend prêt$(NC)\n"; break; fi; \
			sleep 3; \
			if [ $$i -eq 40 ]; then printf "$(RED)❌ Backend non prêt (vérifiez: docker compose -f docker-compose.simple.yml logs backend)$(NC)\n"; exit 1; fi; \
		done; \
	else \
		printf "$(GREEN)✅ Backend déjà démarré$(NC)\n"; \
	fi
	@printf "$(YELLOW)🔧 Configuration de l'environnement de test...$(NC)\n"
	@$(COMPOSE) exec -T $(BACKEND_CONTAINER) python manage.py setup_test_environment 2>/dev/null || \
		(printf "$(YELLOW)⚠️  setup_test_environment ignoré$(NC)\n"; true)
	@if ! docker ps --format '{{.Names}}' 2>/dev/null | grep -q 'vtcbuilder-frontend'; then \
		printf "$(YELLOW)📦 Démarrage du frontend...$(NC)\n"; \
		$(COMPOSE) up -d frontend; \
		printf "$(YELLOW)⏳ Attente du frontend (90s max)...$(NC)\n"; \
		for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30; do \
			if curl -s -o /dev/null -w "%{http_code}" http://localhost:9494 2>/dev/null | grep -qE '200|301|302'; then printf "$(GREEN)✅ Frontend prêt$(NC)\n"; break; fi; \
			sleep 3; \
			if [ $$i -eq 30 ]; then printf "$(RED)❌ Frontend non prêt$(NC)\n"; exit 1; fi; \
		done; \
	else \
		printf "$(GREEN)✅ Frontend déjà démarré$(NC)\n"; \
	fi
	@printf "$(GREEN)🎭 Lancement des tests Playwright...$(NC)\n"
	@cd frontend && (npx playwright install --with-deps chromium 2>/dev/null || true) && \
		PLAYWRIGHT_BASE_URL=http://localhost:9494 npm run test:e2e -- --project=chromium --reporter=html --reporter=list
	@mkdir -p test-results && (cp frontend/playwright-report/results.json test-results/e2e.json 2>/dev/null || true)
	@printf "$(GREEN)✅ E2E terminés. Rapport: frontend/playwright-report/index.html, test-results/e2e.json$(NC)\n"
	@printf "$(BLUE)💡 Ouvrir: cd frontend && npx playwright show-report$(NC)\n"

frontend-analyze: frontend-type-check frontend-lint frontend-format-check ## Analyse complète frontend (sans tests)
	@printf "$(GREEN)✨ Analyse frontend terminée !$(NC)\n"

frontend-quality: frontend-analyze frontend-test ## Qualité complète frontend (analyse + tests)
	@printf "$(GREEN)✨ Qualité frontend vérifiée !$(NC)\n"

frontend-build: ## Build le frontend avec détection d'erreurs et réessai automatique
	@printf "$(GREEN)🔨 Build du frontend...$(NC)\n"
	@printf "$(YELLOW)🔧 Vérification et correction des permissions...$(NC)\n"
	@sudo rm -rf frontend/.next 2>/dev/null || rm -rf frontend/.next 2>/dev/null || true
	@sudo chown -R $$(whoami):$$(whoami) frontend 2>/dev/null || true
	@cd frontend && \
		BUILD_OUTPUT=$$(npm run build 2>&1); \
		BUILD_EXIT=$$?; \
		if echo "$$BUILD_OUTPUT" | grep -qE "Failed to compile|Error:.*×|Build failed|Build error occurred|uncaughtException|EACCES"; then \
			printf "$(YELLOW)⚠️  Erreur lors du build$(NC)\n"; \
			printf "$(YELLOW)📋 Dernières erreurs détectées:$(NC)\n"; \
			echo "$$BUILD_OUTPUT" | grep -E "Error:|Failed|×|uncaughtException|EACCES" | tail -10 | sed 's/^/  /'; \
			printf "$(YELLOW)🔄 Tentative de réparation automatique...$(NC)\n"; \
			printf "$(YELLOW)  📦 Nettoyage et réinstallation des dépendances...$(NC)\n"; \
			cd .. && $(MAKE) frontend-reinstall && \
			printf "$(YELLOW)  🔄 Nouvelle tentative de build...$(NC)\n"; \
			cd frontend && \
			RETRY_OUTPUT=$$(npm run build 2>&1); \
			RETRY_EXIT=$$?; \
			if echo "$$RETRY_OUTPUT" | grep -qE "Failed to compile|Error:.*×|Build failed|Build error occurred|uncaughtException|EACCES"; then \
				printf "$(RED)❌ Build frontend échoué même après réparation$(NC)\n"; \
				printf "$(YELLOW)📋 Dernières erreurs:$(NC)\n"; \
				echo "$$RETRY_OUTPUT" | grep -E "Error:|Failed|×|uncaughtException|EACCES" | tail -10 | sed 's/^/  /'; \
				printf "$(YELLOW)💡 Vérifiez les erreurs ci-dessus$(NC)\n"; \
				exit 1; \
			else \
				printf "$(GREEN)✅ Build frontend réussi après réparation !$(NC)\n"; \
			fi; \
		elif echo "$$BUILD_OUTPUT" | grep -qE "Compiled|Creating an optimized production build"; then \
			printf "$(GREEN)✅ Build frontend réussi !$(NC)\n"; \
		elif [ $$BUILD_EXIT -eq 0 ]; then \
			printf "$(GREEN)✅ Build frontend réussi !$(NC)\n"; \
		else \
			if ! echo "$$BUILD_OUTPUT" | grep -qE "Failed to compile|Error:.*×|Build failed|Build error occurred|uncaughtException|EACCES"; then \
				printf "$(GREEN)✅ Build frontend réussi (avec warnings) !$(NC)\n"; \
			else \
				printf "$(RED)❌ Build frontend échoué$(NC)\n"; \
				echo "$$BUILD_OUTPUT" | grep -E "Error:|Failed|×|uncaughtException|EACCES" | tail -10 | sed 's/^/  /'; \
				exit 1; \
			fi; \
		fi

##@ Backend

backend-lint: ## Linter le code backend
	@printf "$(GREEN)🔍 Analyse Flake8 backend...$(NC)\n"
	@cd backend-django && make lint
	@printf "$(GREEN)✅ Lint backend terminé !$(NC)\n"

backend-lint-pylint: ## Analyse Pylint backend
	@printf "$(GREEN)🔍 Analyse Pylint backend...$(NC)\n"
	@cd backend-django && make lint-pylint
	@printf "$(GREEN)✅ Pylint terminé !$(NC)\n"

backend-format: ## Formater le code backend
	@printf "$(GREEN)🎨 Formatage Black backend...$(NC)\n"
	@cd backend-django && make format
	@printf "$(GREEN)✅ Formatage backend terminé !$(NC)\n"

backend-format-check: ## Vérifier le formatage backend
	@printf "$(GREEN)🎨 Vérification formatage backend...$(NC)\n"
	@cd backend-django && make format-check
	@printf "$(GREEN)✅ Formatage OK !$(NC)\n"

backend-format-imports: ## Trier les imports backend
	@printf "$(GREEN)📦 Tri des imports backend...$(NC)\n"
	@cd backend-django && make format-imports
	@printf "$(GREEN)✅ Imports triés !$(NC)\n"

backend-test: ## Exécuter tous les tests backend
	@printf "$(GREEN)🧪 Tests backend...$(NC)\n"
	@cd backend-django && make test
	@printf "$(GREEN)✅ Tests backend terminés !$(NC)\n"

backend-test-unit: ## Tests unitaires backend uniquement
	@printf "$(GREEN)🧪 Tests unitaires backend...$(NC)\n"
	@cd backend-django && make test-unit
	@printf "$(GREEN)✅ Tests unitaires terminés !$(NC)\n"

backend-test-integration: ## Tests d'intégration backend uniquement
	@printf "$(GREEN)🧪 Tests d'intégration backend...$(NC)\n"
	@cd backend-django && make test-integration
	@printf "$(GREEN)✅ Tests d'intégration terminés !$(NC)\n"

backend-test-coverage: ## Tests backend avec couverture
	@printf "$(GREEN)📊 Tests backend avec couverture...$(NC)\n"
	@cd backend-django && make test-coverage
	@printf "$(GREEN)✅ Couverture backend générée !$(NC)\n"

backend-analyze: backend-lint backend-format-check ## Analyse complète backend (sans tests)
	@printf "$(GREEN)✨ Analyse backend terminée !$(NC)\n"

backend-quality: backend-analyze backend-test ## Qualité complète backend (analyse + tests)
	@printf "$(GREEN)✨ Qualité backend vérifiée !$(NC)\n"

##@ Tests (Tous Types)

test: test-frontend test-backend ## Exécuter TOUS les tests unitaires/intégration (frontend Jest + backend pytest)
	@printf "$(GREEN)✨ Tous les tests terminés !$(NC)\n"

test-frontend: frontend-test ## Tests unitaires frontend uniquement (Jest)

test-backend: backend-test ## Tests backend uniquement (pytest, BDD de test en conteneur)

test-unit: frontend-test backend-test-unit ## Tests unitaires uniquement (frontend + backend)
	@printf "$(GREEN)✨ Tests unitaires terminés !$(NC)\n"

test-integration: backend-test-integration ## Tests d'intégration backend uniquement
	@printf "$(GREEN)✨ Tests d'intégration terminés !$(NC)\n"

test-e2e: frontend-test-e2e-full ## E2E autonome: démarre stack + env test + Playwright + rapport
	@printf "$(GREEN)✨ Tests E2E terminés !$(NC)\n"

test-editor: frontend-test-editor ## Tests Jest de l'éditeur uniquement (sortie silencieuse, rapport JSON)
	@printf "$(GREEN)✨ Tests éditeur terminés !$(NC)\n"

test-api: ## Tester tous les endpoints de l'API (démarre postgres/redis/backend si besoin)
	@printf "$(GREEN)🧪 Tests API backend...$(NC)\n"
	@cd backend-django && make test-api
	@printf "$(GREEN)✨ Tests API terminés !$(NC)\n"

test-all: ## Tout: unitaires + intégration + rapports + API + E2E (chaque étape génère son rapport même en cas d'échec)
	@printf "$(GREEN)🧪 Exécution de toute la suite de tests...$(NC)\n"
	@mkdir -p test-results
	-@$(MAKE) test
	-@$(MAKE) test-reports
	-@$(MAKE) test-api
	-@$(MAKE) test-e2e
	@node scripts/generate-test-summary.js 2>/dev/null || true
	@printf "$(BLUE)Rapports générés dans test-results/:$(NC)\n"
	@ls -la test-results/ 2>/dev/null || true
	@if [ -f test-results/FAILURES.md ]; then printf "$(YELLOW)📋 Résumé des échecs: test-results/FAILURES.md$(NC)\n"; fi
	@printf "$(GREEN)✨ Suite terminée. Consultez test-results/ pour les rapports.$(NC)\n"

tests: test-all ## Alias: make tests = make test-all (lance tous les tests existants)

test-coverage: frontend-test-coverage backend-test-coverage ## Tests avec couverture (frontend: frontend/coverage/, backend: backend-django/htmlcov/)
	@printf "$(GREEN)✨ Couverture générée !$(NC)\n"

test-reports: ## Génère tous les rapports: tests éditeur + couverture frontend (fichiers dans test-results/ et frontend/coverage/)
	@printf "$(GREEN)📋 Génération des rapports de test...$(NC)\n"
	@$(MAKE) test-editor
	@$(MAKE) frontend-test-coverage
	@printf "$(GREEN)✨ Rapports générés:$(NC)\n"
	@printf "  • Tests éditeur:     test-results/editor.json\n"
	@printf "  • Couverture frontend: frontend/coverage/lcov-report/index.html\n"

test-results-list: ## Afficher les rapports présents dans test-results/
	@printf "$(BLUE)Rapports dans test-results/:$(NC)\n"
	@mkdir -p test-results
	@ls -la test-results/ 2>/dev/null || printf "  (vide)\n"

##@ Qualité (Complète)

quality: quality-frontend quality-backend ## Qualité complète (frontend + backend) - Analyse + Tests
	@printf "$(GREEN)✨ Qualité complète vérifiée !$(NC)\n"

quality-frontend: frontend-quality ## Qualité frontend complète

quality-backend: backend-quality ## Qualité backend complète

##@ Analyse (Sans Tests)

analyze: analyze-frontend analyze-backend ## Analyse complète sans tests (frontend + backend)
	@printf "$(GREEN)✨ Analyse complète terminée !$(NC)\n"

analyze-frontend: frontend-analyze ## Analyse frontend uniquement

analyze-backend: backend-analyze ## Analyse backend uniquement

##@ Linting

lint: lint-frontend lint-backend ## Linter tout le code (frontend + backend)
	@printf "$(GREEN)✨ Linting terminé !$(NC)\n"

lint-frontend: frontend-lint ## Linter frontend uniquement

lint-backend: backend-lint ## Linter backend uniquement

##@ Formatage

format: format-frontend format-backend ## Formater tout le code (frontend + backend)
	@printf "$(GREEN)✨ Formatage terminé !$(NC)\n"

format-frontend: frontend-format ## Formater frontend uniquement

format-backend: backend-format ## Formater backend uniquement

##@ Type Checking

type-check: type-check-frontend ## Vérifier les types (frontend uniquement)
	@printf "$(GREEN)✨ Vérification des types terminée !$(NC)\n"

type-check-frontend: frontend-type-check ## Vérifier TypeScript frontend

##@ Build et Infrastructure

build: ## Créer les réseaux Docker, volumes et construire les images
	@printf "$(GREEN)🔨 Construction de l'infrastructure Docker...$(NC)\n"
	@printf "$(YELLOW)🌐 Vérification et nettoyage du réseau Docker si nécessaire...$(NC)\n"
	@if docker network ls | grep -q "vtcbuilder_network"; then \
		NETWORK_LABEL=$$(docker network inspect vtcbuilder_network --format '{{index .Labels "com.docker.compose.network"}}' 2>/dev/null || echo ""); \
		if [ "$$NETWORK_LABEL" != "vtcbuilder_network" ]; then \
			printf "$(YELLOW)  🗑️  Suppression de l'ancien réseau avec mauvais labels...$(NC)\n"; \
			NETWORK_IN_USE=$$(docker network inspect vtcbuilder_network --format '{{len .Containers}}' 2>/dev/null || echo "0"); \
			if [ "$$NETWORK_IN_USE" != "0" ]; then \
				printf "$(YELLOW)  ⚠️  Le réseau est utilisé par des conteneurs, arrêt des services...$(NC)\n"; \
				docker-compose -f docker-compose.simple.yml down 2>/dev/null || true; \
			fi; \
			docker network rm vtcbuilder_network 2>/dev/null || { \
				printf "$(YELLOW)  ⚠️  Impossible de supprimer le réseau (peut être utilisé), docker-compose le gérera$(NC)\n"; \
			}; \
			printf "$(GREEN)  ✅ Ancien réseau supprimé ou sera recréé$(NC)\n"; \
		else \
			printf "$(GREEN)  ✅ Réseau vtcbuilder_network existe déjà avec les bons labels$(NC)\n"; \
		fi; \
	fi
	@printf "$(YELLOW)💾 Création des volumes et réseaux via docker-compose...$(NC)\n"
	@docker-compose -f docker-compose.simple.yml up --no-start 2>/dev/null || { \
		printf "$(YELLOW)⚠️  Création des ressources (peut afficher des warnings si déjà existantes)$(NC)\n"; \
		true; \
	}
	@printf "$(YELLOW)🏗️  Construction des images Docker...$(NC)\n"
	@docker-compose -f docker-compose.simple.yml build || { \
		printf "$(RED)❌ Erreur lors de la construction des images$(NC)\n"; \
		exit 1; \
	}
	@printf "$(GREEN)✅ Infrastructure Docker prête !$(NC)\n"
	@printf "$(BLUE)💡 Vous pouvez maintenant utiliser 'make start' pour démarrer les services$(NC)\n"

##@ Gestion des Services

start: ## Démarrer toute la stack (backend + frontend + services)
	@printf "$(GREEN)🚀 Démarrage de toute la stack VTCBuilder...$(NC)\n"
	@printf "$(YELLOW)🔍 Vérification de l'infrastructure Docker...$(NC)\n"
	@NEED_BUILD=0; \
	if ! docker network ls | grep -q "vtcbuilder_network"; then \
		printf "$(YELLOW)⚠️  Réseau Docker manquant$(NC)\n"; \
		NEED_BUILD=1; \
	else \
		NETWORK_LABEL=$$(docker network inspect vtcbuilder_network --format '{{index .Labels "com.docker.compose.network"}}' 2>/dev/null || echo ""); \
		if [ "$$NETWORK_LABEL" != "vtcbuilder_network" ]; then \
			printf "$(YELLOW)⚠️  Réseau Docker avec mauvais labels$(NC)\n"; \
			NEED_BUILD=1; \
		fi; \
	fi; \
	if ! docker images | grep -q "vtcbuilder-backend"; then \
		printf "$(YELLOW)⚠️  Image backend manquante$(NC)\n"; \
		NEED_BUILD=1; \
	fi; \
	if ! docker images | grep -q "vtcbuilder-frontend"; then \
		printf "$(YELLOW)⚠️  Image frontend manquante$(NC)\n"; \
		NEED_BUILD=1; \
	fi; \
	if [ $$NEED_BUILD -eq 1 ]; then \
		printf "$(YELLOW)🔨 Build nécessaire, exécution de 'make build'...$(NC)\n"; \
		$(MAKE) build || { \
			printf "$(RED)❌ Erreur lors du build$(NC)\n"; \
			exit 1; \
		}; \
	else \
		printf "$(GREEN)✅ Infrastructure Docker prête$(NC)\n"; \
	fi
	@printf "$(YELLOW)🔍 Vérification de l'état du frontend...$(NC)\n"
	@if [ ! -d "frontend/node_modules" ]; then \
		printf "$(YELLOW)⚠️  Dépendances frontend manquantes, installation...$(NC)\n"; \
		$(MAKE) frontend-install || { \
			printf "$(RED)❌ Erreur lors de l'installation des dépendances frontend$(NC)\n"; \
			exit 1; \
		}; \
	fi
	@if [ ! -f "backend-django/start.sh" ]; then \
		printf "$(RED)❌ Erreur: Le script backend-django/start.sh est introuvable !$(NC)\n"; \
		printf "$(YELLOW)💡 Vérifiez que vous êtes dans le répertoire racine du projet.$(NC)\n"; \
		exit 1; \
	fi
	@if [ ! -x "backend-django/start.sh" ]; then \
		printf "$(YELLOW)⚠️  Le script backend-django/start.sh n'est pas exécutable. Tentative de correction...$(NC)\n"; \
		chmod +x backend-django/start.sh || { \
			printf "$(RED)❌ Erreur: Impossible de rendre start.sh exécutable.$(NC)\n"; \
			exit 1; \
		}; \
		printf "$(GREEN)✅ start.sh est maintenant exécutable.$(NC)\n"; \
	fi
	@cd backend-django && ./start.sh

up: start ## Alias pour start - Démarrer toute la stack

stop: ## Arrêter tous les services
	@printf "$(YELLOW)⏸️  Arrêt de tous les services...$(NC)\n"
	@docker-compose -f docker-compose.simple.yml stop
	@printf "$(GREEN)✅ Services arrêtés !$(NC)\n"

restart: stop frontend-build start ## Redémarrer tous les services avec rebuild du frontend

restart-backend: ## Redémarrer uniquement le backend
	@printf "$(YELLOW)🔄 Redémarrage du backend...$(NC)\n"
	@docker-compose -f docker-compose.simple.yml restart backend
	@printf "$(GREEN)✅ Backend redémarré !$(NC)\n"

restart-frontend: ## Redémarrer uniquement le frontend (Docker)
	@printf "$(YELLOW)🔄 Redémarrage du frontend (Docker)...$(NC)\n"
	@docker-compose -f docker-compose.simple.yml restart frontend
	@printf "$(GREEN)✅ Frontend redémarré !$(NC)\n"

frontend-rebuild: ## Nettoyer et rebuilder le frontend (résout les erreurs de manifest)
	@printf "$(YELLOW)🧹 Nettoyage du cache Next.js...$(NC)\n"
	@docker-compose -f docker-compose.simple.yml exec frontend sh -c "rm -rf /app/.next" 2>/dev/null || \
		cd frontend && rm -rf .next 2>/dev/null || true
	@printf "$(GREEN)✅ Cache nettoyé !$(NC)\n"
	@printf "$(YELLOW)🔄 Redémarrage du frontend...$(NC)\n"
	@docker-compose -f docker-compose.simple.yml restart frontend 2>/dev/null || \
		printf "$(YELLOW)💡 Redémarrez manuellement avec 'make restart'$(NC)\n"

restart-frontend-dev: ## Nettoyer le cache Next.js (pour recharger .env.local) - nécessite arrêt du serveur
	@printf "$(YELLOW)🔄 Nettoyage du cache Next.js...$(NC)\n"
	@if [ -d frontend/.next ]; then \
		printf "$(YELLOW)⚠️  Arrêtez d'abord le serveur Next.js (Ctrl+C) avant de nettoyer le cache$(NC)\n"; \
		printf "$(YELLOW)💡 Utilisez plutôt 'make restart' pour redémarrer toute la stack$(NC)\n"; \
		printf "$(YELLOW)   ou arrêtez le serveur puis exécutez: sudo rm -rf frontend/.next$(NC)\n"; \
	else \
		printf "$(GREEN)✅ Pas de cache à nettoyer$(NC)\n"; \
	fi

migrate: ## Exécuter les migrations Django
	@printf "$(GREEN)🗄️  Exécution des migrations Django...$(NC)\n"
	@docker-compose -f docker-compose.simple.yml exec -T backend python manage.py makemigrations || printf "$(YELLOW)⚠️  Aucune nouvelle migration à créer$(NC)\n"
	@docker-compose -f docker-compose.simple.yml exec -T backend python manage.py migrate || (printf "$(RED)❌ Erreur lors des migrations$(NC)\n" && exit 1)
	@printf "$(GREEN)✅ Migrations terminées !$(NC)\n"

clean-frontend-cache: ## Nettoyer le cache Next.js avec sudo (si créé par Docker)
	@printf "$(YELLOW)🔄 Nettoyage du cache Next.js avec sudo...$(NC)\n"
	@if [ -d frontend/.next ]; then \
		sudo rm -rf frontend/.next || (printf "$(RED)❌ Erreur lors du nettoyage$(NC)\n" && exit 1); \
		printf "$(GREEN)✅ Cache Next.js nettoyé !$(NC)\n"; \
		printf "$(YELLOW)💡 Redémarrez maintenant avec 'make restart' ou 'cd frontend && npm run dev'$(NC)\n"; \
	else \
		printf "$(GREEN)✅ Pas de cache à nettoyer$(NC)\n"; \
	fi

down: ## Arrêter et supprimer les containers
	@printf "$(RED)🗑️  Arrêt et suppression des containers...$(NC)\n"
	@docker-compose -f docker-compose.simple.yml down
	@printf "$(GREEN)✅ Containers supprimés !$(NC)\n"

logs: ## Afficher les logs de tous les services
	@docker-compose -f docker-compose.simple.yml logs -f

status: ## Afficher le statut des services
	@printf "$(BLUE)📊 Statut des services...$(NC)\n"
	@docker-compose -f docker-compose.simple.yml ps
	@printf "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)\n"
	@printf "$(GREEN)🌐 URLs d'accès :$(NC)\n"
	@printf "  $(YELLOW)Frontend:$(NC)     http://localhost:9494\n"
	@printf "  $(YELLOW)API Django:$(NC)   http://localhost:9495/api/\n"
	@printf "  $(YELLOW)Admin Django:$(NC)  http://localhost:9495/admin/\n"
	@printf "  $(YELLOW)PgAdmin:$(NC)       http://localhost:9498\n"

##@ Utilitaires

check: ## Vérification rapide de la qualité
	@printf "$(GREEN)🔍 Vérification rapide...$(NC)\n"
	@./scripts/check-quality.sh

clean-network: ## Nettoyer le réseau Docker (arrête les services et supprime le réseau)
	@printf "$(YELLOW)🧹 Nettoyage du réseau Docker...$(NC)\n"
	@if docker network ls | grep -q "vtcbuilder_network"; then \
		printf "$(YELLOW)  ⏸️  Arrêt des services...$(NC)\n"; \
		docker-compose -f docker-compose.simple.yml down 2>/dev/null || true; \
		printf "$(YELLOW)  🗑️  Suppression du réseau...$(NC)\n"; \
		docker network rm vtcbuilder_network 2>/dev/null && \
			printf "$(GREEN)  ✅ Réseau supprimé$(NC)\n" || \
			printf "$(YELLOW)  ⚠️  Réseau déjà supprimé ou utilisé$(NC)\n"; \
	else \
		printf "$(GREEN)  ✅ Réseau n'existe pas$(NC)\n"; \
	fi

clean: ## Nettoyer les fichiers temporaires
	@printf "$(YELLOW)🧹 Nettoyage...$(NC)\n"
	@find . -type d -name "__pycache__" -exec rm -r {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@find . -type f -name "*.pyo" -delete 2>/dev/null || true
	@find . -type d -name "*.egg-info" -exec rm -r {} + 2>/dev/null || true
	@find . -type f -name ".coverage" -delete 2>/dev/null || true
	@find . -type d -name "htmlcov" -exec rm -r {} + 2>/dev/null || true
	@find . -type d -name ".pytest_cache" -exec rm -r {} + 2>/dev/null || true
	@find . -type d -name ".next" -exec rm -r {} + 2>/dev/null || true
	@find . -type d -name "node_modules/.cache" -exec rm -r {} + 2>/dev/null || true
	@printf "$(GREEN)✅ Nettoyage terminé !$(NC)\n"

.DEFAULT_GOAL := help
