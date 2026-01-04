.PHONY: help install clean-install clean build package lint lint-fix format format-fix test all check-ci pre-commit

# Default target
.DEFAULT_GOAL := help

# Node and npm settings for hermetic builds
NODE_VERSION := 20
NPM_CONFIG_CACHE := $(PWD)/.npm-cache

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
NC := \033[0m # No Color

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Smart install - checks state and installs appropriately
	@echo "$(CYAN)Checking project state...$(NC)"
	@if [ ! -f package-lock.json ]; then \
		echo "No package-lock.json found, performing initial setup..."; \
		rm -rf node_modules dist coverage .npm-cache; \
		npm install --cache=$(NPM_CONFIG_CACHE); \
	elif [ ! -d node_modules ]; then \
		echo "No node_modules found, installing from package-lock.json..."; \
		npm ci --cache=$(NPM_CONFIG_CACHE); \
	else \
		echo "Found package-lock.json and node_modules, using npm ci for clean install..."; \
		npm ci --cache=$(NPM_CONFIG_CACHE); \
	fi
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

clean-install: clean ## Force complete clean and fresh install
	@$(MAKE) install

clean: ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	@rm -rf dist
	@rm -rf node_modules
	@rm -rf .npm-cache
	@rm -rf coverage

build: ## Build TypeScript source
	@echo "Building TypeScript..."
	@npm run build

package: build ## Package the action with ncc
	@echo "Packaging action..."
	@npm run package

lint: ## Run ESLint on all TypeScript files
	@echo "$(CYAN)Running linter...$(NC)"
	npm run lint
	@echo "$(GREEN)✓ Linting passed$(NC)"

lint-fix: ## Fix linting issues automatically
	@echo "$(CYAN)Fixing linting issues...$(NC)"
	npm run lint:fix
	@echo "$(GREEN)✓ Linting issues fixed$(NC)"

format: ## Format code with Prettier
	@echo "$(CYAN)Formatting code...$(NC)"
	npm run format
	@echo "$(GREEN)✓ Code formatted$(NC)"

format-fix: ## Alias for format (formats code)
	@$(MAKE) format

format-check: ## Check code formatting
	@echo "$(CYAN)Checking code formatting...$(NC)"
	npm run format:check
	@echo "$(GREEN)✓ Format check passed$(NC)"

test: ## Run tests
	@echo "Running tests..."
	@npm run test

pre-commit: ## Run pre-commit checks (lint-staged on staged files only)
	@echo "$(CYAN)Running pre-commit checks...$(NC)"
	@npx lint-staged
	@echo "$(GREEN)✓ Pre-commit checks passed$(NC)"

all: install format lint test package ## Run all checks and build

check-ci: format-check lint test package ## CI check (no auto-formatting)
	@echo "All CI checks passed!"

# Deterministic build targets
.PHONY: hermetic-build
hermetic-build: clean install ## Hermetic build from clean state
	@echo "Running hermetic build..."
	@$(MAKE) all
