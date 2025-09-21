# Makefile for Docker management

.PHONY: dev prod down clean logs help

# Development commands
dev:
	docker-compose -f docker-compose.dev.yml --env-file .env.dev up --build

dev-detached:
	docker-compose -f docker-compose.dev.yml --env-file .env.dev up --build -d

dev-down:
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

dev-logs-backend:
	docker-compose -f docker-compose.dev.yml logs -f backend

dev-logs-frontend:
	docker-compose -f docker-compose.dev.yml logs -f frontend

# Production commands
prod:
	docker-compose -f docker-compose.prod.yml --env-file .env.prod up --build -d

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

# Database commands
db-dev:
	docker-compose -f docker-compose.dev.yml up db redis -d

db-prod:
	docker-compose -f docker-compose.prod.yml up db redis -d

# Clean up commands
clean:
	docker system prune -f
	docker volume prune -f

clean-all:
	docker system prune -a -f
	docker volume prune -f

# Rebuild without cache
rebuild-dev:
	docker-compose -f docker-compose.dev.yml build --no-cache
	docker-compose -f docker-compose.dev.yml --env-file .env.dev up

rebuild-prod:
	docker-compose -f docker-compose.prod.yml build --no-cache
	docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Health check
health:
	@echo "Checking container health..."
	docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Help
help:
	@echo "Available commands:"
	@echo "  dev              - Start development environment"
	@echo "  dev-detached     - Start development environment in background"
	@echo "  dev-down         - Stop development environment"
	@echo "  dev-logs         - Show development logs"
	@echo "  dev-logs-backend - Show backend logs only"
	@echo "  dev-logs-frontend- Show frontend logs only"
	@echo "  prod             - Start production environment"
	@echo "  prod-down        - Stop production environment"
	@echo "  prod-logs        - Show production logs"
	@echo "  db-dev           - Start only database services (dev)"
	@echo "  db-prod          - Start only database services (prod)"
	@echo "  clean            - Clean up unused Docker resources"
	@echo "  clean-all        - Clean up all Docker resources"
	@echo "  rebuild-dev      - Rebuild and start development environment"
	@echo "  rebuild-prod     - Rebuild and start production environment"
	@echo "  health           - Show container health status"
	@echo "  help             - Show this help message"