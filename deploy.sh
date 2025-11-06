#!/bin/bash

# 🏥 Gabriel Family Clinic Healthcare Platform
# Automated Docker Deployment Script
# 
# Usage: ./deploy.sh [build|start|stop|restart|logs|status|clean]
# 
# Prerequisites:
# - Docker Engine 24.0+
# - Docker Compose 2.0+
# - 2GB+ RAM, 5GB+ disk space
# 
# Author: MiniMax Agent
# Generated: 2025-11-06 11:24:01

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="gabriel-clinic"
CONTAINER_NAME="gabriel-clinic-frontend"
DATA_DIR="/var/lib/gabriel-clinic"
LOG_DIR="/var/log/gabriel-clinic"
PORT=3000

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_docker() {
    log_info "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker 24.0+ first."
        exit 1
    fi
    
    DOCKER_VERSION=$(docker --version | grep -oP '\d+\.\d+' | head -1)
    if [ "$(printf '%s\n' "24.0" "$DOCKER_VERSION" | sort -V | head -n1)" = "24.0" ]; then
        log_success "Docker $DOCKER_VERSION detected"
    else
        log_error "Docker version $DOCKER_VERSION is too old. Please upgrade to 24.0+"
        exit 1
    fi
    
    if ! command -v docker compose &> /dev/null; then
        if ! command -v docker-compose &> /dev/null; then
            log_error "Docker Compose is not installed. Please install Docker Compose 2.0+"
            exit 1
        fi
        DOCKER_COMPOSE_CMD="docker-compose"
    else
        DOCKER_COMPOSE_CMD="docker compose"
    fi
    
    log_success "Docker Compose detected: $DOCKER_COMPOSE_CMD"
}

setup_directories() {
    log_info "Setting up directories for healthcare platform..."
    
    # Create directories
    sudo mkdir -p "$DATA_DIR"/{uploads,next-cache}
    sudo mkdir -p "$LOG_DIR"
    
    # Set ownership to healthcare platform user (1001:1001)
    sudo chown -R 1001:1001 "$DATA_DIR" 2>/dev/null || log_warning "Could not set ownership to user 1001:1001"
    sudo chown -R 1001:1001 "$LOG_DIR" 2>/dev/null || log_warning "Could not set ownership to user 1001:1001"
    
    # Set permissions
    sudo chmod -R 755 "$DATA_DIR"
    sudo chmod -R 755 "$LOG_DIR"
    
    log_success "Directories created and configured"
}

setup_environment() {
    log_info "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        if [ -f .env.docker ]; then
            log_info "Copying environment template..."
            cp .env.docker .env
            log_warning "Please edit .env file with your actual credentials before starting"
        else
            log_error "No .env.docker template found. Cannot proceed."
            exit 1
        fi
    else
        log_success "Environment file already exists"
    fi
}

build_image() {
    log_info "Building Gabriel Family Clinic healthcare platform..."
    
    setup_directories
    setup_environment
    
    # Build the Docker image
    if $DOCKER_COMPOSE_CMD build --no-cache; then
        log_success "Docker image built successfully"
    else
        log_error "Docker image build failed"
        exit 1
    fi
    
    # Show image information
    IMAGE_SIZE=$(docker images | grep gabriel-clinic | awk '{print $7}' | head -1)
    log_info "Image size: $IMAGE_SIZE"
}

start_service() {
    log_info "Starting Gabriel Family Clinic healthcare platform..."
    
    setup_directories
    setup_environment
    
    if $DOCKER_COMPOSE_CMD up -d; then
        log_success "Healthcare platform started successfully"
        
        # Wait for service to be ready
        log_info "Waiting for service to be ready..."
        sleep 10
        
        # Check health
        if curl -s http://localhost:$PORT >/dev/null 2>&1; then
            log_success "Healthcare platform is running at http://localhost:$PORT"
        else
            log_warning "Service may still be starting. Check logs with: ./deploy.sh logs"
        fi
    else
        log_error "Failed to start healthcare platform"
        exit 1
    fi
}

stop_service() {
    log_info "Stopping Gabriel Family Clinic healthcare platform..."
    
    if $DOCKER_COMPOSE_CMD down; then
        log_success "Healthcare platform stopped"
    else
        log_error "Failed to stop healthcare platform"
        exit 1
    fi
}

restart_service() {
    log_info "Restarting Gabriel Family Clinic healthcare platform..."
    
    if $DOCKER_COMPOSE_CMD restart; then
        log_success "Healthcare platform restarted"
        sleep 5
        log_success "Healthcare platform is running at http://localhost:$PORT"
    else
        log_error "Failed to restart healthcare platform"
        exit 1
    fi
}

show_logs() {
    log_info "Showing logs for Gabriel Family Clinic..."
    
    if [ "$2" = "--follow" ] || [ "$2" = "-f" ]; then
        $DOCKER_COMPOSE_CMD logs -f "$CONTAINER_NAME"
    else
        $DOCKER_COMPOSE_CMD logs --tail=50 "$CONTAINER_NAME"
    fi
}

show_status() {
    log_info "Checking Gabriel Family Clinic status..."
    
    # Check Docker Compose status
    echo -e "\n${BLUE}=== Container Status ===${NC}"
    $DOCKER_COMPOSE_CMD ps
    
    # Check resource usage
    echo -e "\n${BLUE}=== Resource Usage ===${NC}"
    if command -v docker &> /dev/null; then
        docker stats "$CONTAINER_NAME" --no-stream 2>/dev/null || log_warning "Container stats not available"
    fi
    
    # Check health endpoint
    echo -e "\n${BLUE}=== Health Check ===${NC}"
    if curl -s http://localhost:$PORT/api/health >/dev/null 2>&1; then
        echo -e "Health check: ${GREEN}✓ HEALTHY${NC}"
    else
        echo -e "Health check: ${RED}✗ UNHEALTHY${NC}"
    fi
    
    # Show quick access info
    echo -e "\n${BLUE}=== Quick Access ===${NC}"
    echo "Healthcare Platform: http://localhost:$PORT"
    echo "Patient Portal: http://localhost:$PORT/patient/dashboard"
    echo "Doctor Portal: http://localhost:$PORT/doctor/dashboard"
    echo "Admin Panel: http://localhost:$PORT/admin/security/dashboard"
}

clean_all() {
    log_warning "This will remove all containers, images, and data. Continue? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        log_info "Cleaning up Docker resources..."
        
        # Stop and remove containers
        $DOCKER_COMPOSE_CMD down -v 2>/dev/null || true
        
        # Remove images
        docker rmi -f gabriel-clinic-frontend 2>/dev/null || true
        
        # Clean system
        docker system prune -f
        
        log_success "Cleanup completed"
    else
        log_info "Cleanup cancelled"
    fi
}

health_check() {
    log_info "Performing healthcare platform health check..."
    
    # Check container status
    CONTAINER_STATUS=$($DOCKER_COMPOSE_CMD ps --format "table {{.Container}}\t{{.Status}}" | grep "$CONTAINER_NAME" | awk '{print $2}')
    
    if [[ "$CONTAINER_STATUS" == *"Up"* ]]; then
        log_success "Container is running"
    else
        log_error "Container is not running"
        return 1
    fi
    
    # Check health endpoint
    if curl -f -s http://localhost:$PORT/api/health >/dev/null; then
        log_success "Health endpoint is responding"
    else
        log_error "Health endpoint is not responding"
        return 1
    fi
    
    # Check logs for errors
    ERROR_COUNT=$($DOCKER_COMPOSE_CMD logs --since=1h "$CONTAINER_NAME" | grep -i "error" | wc -l)
    if [ "$ERROR_COUNT" -eq 0 ]; then
        log_success "No errors in recent logs"
    else
        log_warning "Found $ERROR_COUNT errors in recent logs"
    fi
    
    log_success "Health check completed"
}

show_help() {
    echo -e "${BLUE}Gabriel Family Clinic - Docker Deployment Script${NC}\n"
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  build          Build the Docker image"
    echo "  start          Start the healthcare platform"
    echo "  stop           Stop the healthcare platform"
    echo "  restart        Restart the healthcare platform"
    echo "  status         Show platform status and resource usage"
    echo "  logs [--follow] Show platform logs (add --follow for live logs)"
    echo "  health         Perform health check"
    echo "  clean          Remove all containers, images, and data"
    echo "  help           Show this help message"
    echo ""
    echo "Quick Start:"
    echo "  1. ./deploy.sh build"
    echo "  2. ./deploy.sh start"
    echo "  3. Open http://localhost:3000"
    echo ""
    echo "Environment:"
    echo "  - Platform will run on port 3000"
    echo "  - Configuration file: .env"
    echo "  - Data directory: $DATA_DIR"
    echo "  - Logs directory: $LOG_DIR"
}

# Main execution
main() {
    case "$1" in
        "build")
            check_docker
            build_image
            ;;
        "start")
            check_docker
            start_service
            ;;
        "stop")
            check_docker
            stop_service
            ;;
        "restart")
            check_docker
            restart_service
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$@"
            ;;
        "health")
            check_docker
            health_check
            ;;
        "clean")
            clean_all
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        "")
            log_error "No command specified"
            show_help
            exit 1
            ;;
        *)
            log_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Check if running in the correct directory
if [ ! -f "docker-compose.yml" ]; then
    log_error "This script must be run from the Gabriel Family Clinic project directory"
    log_info "Please run: cd /workspace/gabriel-family-clinic"
    exit 1
fi

# Execute main function
main "$@"
