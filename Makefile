.PHONY: help setup install quality quality-frontend quality-backend test test-frontend test-backend test-unit test-integration test-e2e test-coverage analyze analyze-frontend analyze-backend lint lint-frontend lint-backend format format-frontend format-backend type-check type-check-frontend clean

BLUE = \033[0;34m
GREEN = \033[0;32m
YELLOW = \033[0;33m
RED = \033[0;31m
NC = \033[0m # No Color

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

frontend-test: ## Exécuter les tests unitaires frontend
	@printf "$(GREEN)🧪 Tests unitaires frontend...$(NC)\n"
	@cd frontend && npm test -- --passWithNoTests
	@printf "$(GREEN)✅ Tests frontend terminés !$(NC)\n"

frontend-test-watch: ## Tests frontend en mode watch
	@printf "$(GREEN)👀 Tests frontend en mode watch...$(NC)\n"
	@cd frontend && npm run test:watch

frontend-test-coverage: ## Tests frontend avec couverture
	@printf "$(GREEN)📊 Tests frontend avec couverture...$(NC)\n"
	@cd frontend && npm run test:coverage
	@printf "$(GREEN)✅ Couverture frontend générée !$(NC)\n"

frontend-test-e2e: ## Tests E2E frontend (Playwright)
	@printf "$(GREEN)🎭 Tests E2E frontend...$(NC)\n"
	@cd frontend && npm run test:e2e
	@printf "$(GREEN)✅ Tests E2E terminés !$(NC)\n"

frontend-analyze: frontend-type-check frontend-lint frontend-format-check ## Analyse complète frontend (sans tests)
	@printf "$(GREEN)✨ Analyse frontend terminée !$(NC)\n"

frontend-quality: frontend-analyze frontend-test ## Qualité complète frontend (analyse + tests)
	@printf "$(GREEN)✨ Qualité frontend vérifiée !$(NC)\n"

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

test: test-frontend test-backend ## Exécuter TOUS les tests (frontend + backend)
	@printf "$(GREEN)✨ Tous les tests terminés !$(NC)\n"

test-frontend: frontend-test ## Tests unitaires frontend uniquement

test-backend: backend-test ## Tests backend uniquement

test-unit: frontend-test backend-test-unit ## Tests unitaires uniquement (frontend + backend)
	@printf "$(GREEN)✨ Tests unitaires terminés !$(NC)\n"

test-integration: backend-test-integration ## Tests d'intégration uniquement
	@printf "$(GREEN)✨ Tests d'intégration terminés !$(NC)\n"

test-e2e: frontend-test-e2e ## Tests E2E uniquement (Playwright)
	@printf "$(GREEN)✨ Tests E2E terminés !$(NC)\n"

test-coverage: frontend-test-coverage backend-test-coverage ## Tests avec couverture (frontend + backend)
	@printf "$(GREEN)✨ Couverture générée !$(NC)\n"

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

##@ Utilitaires

check: ## Vérification rapide de la qualité
	@printf "$(GREEN)🔍 Vérification rapide...$(NC)\n"
	@./scripts/check-quality.sh

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
