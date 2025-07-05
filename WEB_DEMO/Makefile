# Makefile để quản lý Docker commands

.PHONY: help build run stop clean dev prod test logs

# Default target
help:
	@echo "Available commands:"
	@echo "  build     - Build Docker image"
	@echo "  run       - Run development container"
	@echo "  prod      - Run production container"
	@echo "  stop      - Stop all containers"
	@echo "  clean     - Remove containers and images"
	@echo "  dev       - Start development mode với volume mounts"
	@echo "  test      - Run tests"
	@echo "  logs      - Show container logs"
	@echo "  shell     - Open shell in container"

# Build Docker image
build:
	docker-compose build

# Run development
run:
	docker-compose up

# Run development in background
dev:
	docker-compose up -d
	@echo "Application running at http://localhost:5000"
	@echo "Use 'make logs' to see logs"
	@echo "Use 'make stop' to stop"

# Run production
prod:
	docker-compose --profile production up web-prod -d
	@echo "Production application running at http://localhost:5001"

# Stop containers
stop:
	docker-compose down

# Clean up
clean:
	docker-compose down --rmi all --volumes --remove-orphans
	docker system prune -f

# Show logs
logs:
	docker-compose logs -f

# Open shell in container
shell:
	docker-compose exec web bash

# Run tests
test:
	docker-compose exec web python test_api.py

# Build and run in one command
up: build run

# Rebuild and restart
restart: stop build run

# Monitor health
health:
	@echo "Checking application health..."
	@curl -f http://localhost:5000/api/health || echo "Health check failed"

# Quick development setup
setup:
	@echo "Setting up development environment..."
	cp .env.example .env
	@echo "Please update .env file with your configuration"
	make build
	make dev
