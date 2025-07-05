#!/bin/bash

# Setup script cho Inspection Management System

set -e

echo "🚀 Setting up Inspection Management System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file from .env.example..."
    cp .env.example .env
    print_warning "Please update .env file with your configuration before running the application."
fi

# Build Docker image
print_status "Building Docker image..."
docker-compose build

# Function to show usage
show_usage() {
    echo ""
    echo "🎯 Usage options:"
    echo "  ./setup.sh run       - Run development mode"
    echo "  ./setup.sh prod      - Run production mode"
    echo "  ./setup.sh test      - Run tests"
    echo "  ./setup.sh clean     - Clean up containers and images"
    echo ""
}

# Handle command line arguments
case ${1:-run} in
    "run")
        print_status "Starting development mode..."
        docker-compose up
        ;;
    "prod")
        print_status "Starting production mode..."
        docker-compose --profile production up web-prod
        ;;
    "test")
        print_status "Running tests..."
        docker-compose up -d
        sleep 10  # Wait for container to start
        docker-compose exec web python test_api.py
        docker-compose down
        ;;
    "clean")
        print_status "Cleaning up..."
        docker-compose down --rmi all --volumes --remove-orphans
        docker system prune -f
        print_status "Cleanup completed!"
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        show_usage
        exit 1
        ;;
esac

print_status "Setup completed! 🎉"
