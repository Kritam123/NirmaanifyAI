#!/bin/bash
# ==============================================================================
# NIRMAANIFY AI — PRODUCTION VPS DEPLOYMENT SCRIPT (DIGITALOCEAN)
# ==============================================================================
# Deploys, updates, builds, and health-checks all Docker services on VPS.
# Usage:
#   ./scripts/deploy.sh [OPTIONS]
# Options:
#   --branch <name>    Specify git branch to deploy (default: current or main)
#   --skip-pull        Skip pulling latest git changes
#   --no-cache         Build Docker images without cache
#   --skip-migrate     Skip database migration step
#   --help             Show help message
# ==============================================================================

set -euo pipefail

# ANSI Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

BRANCH=""
SKIP_PULL=false
NO_CACHE=""
SKIP_MIGRATE=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --branch)
            BRANCH="$2"
            shift 2
            ;;
        --skip-pull)
            SKIP_PULL=true
            shift
            ;;
        --no-cache)
            NO_CACHE="--no-cache"
            shift
            ;;
        --skip-migrate)
            SKIP_MIGRATE=true
            shift
            ;;
        --help|-h)
            echo "Usage: ./scripts/deploy.sh [OPTIONS]"
            echo "  --branch <name>    Deploy a specific branch (default: current git branch)"
            echo "  --skip-pull        Skip git pull"
            echo "  --no-cache         Force complete Docker rebuild without cache"
            echo "  --skip-migrate     Skip database migration/schema push"
            exit 0
            ;;
        *)
            echo -e "${RED}[ERROR] Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

COMPOSE_FILE="docker-compose.prod.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
    COMPOSE_FILE="docker-compose-prod.yml"
fi

echo -e "${CYAN}${BOLD}"
echo "=================================================================="
echo "         Nirmaanify AI — Production Deployment Runner             "
echo "=================================================================="
echo -e "${NC}"

# ------------------------------------------------------------------------------
# 1. Pre-flight Environment Validations
# ------------------------------------------------------------------------------
echo -e "${BLUE}==> [1/6] Running pre-flight environment checks...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}[ERROR] Docker is not installed. Please run './scripts/setup-vps.sh' first.${NC}"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo -e "${RED}[ERROR] Docker Compose plugin is not installed.${NC}"
    exit 1
fi

if [ ! -f .env ]; then
    echo -e "${RED}[ERROR] '.env' file not found!${NC}"
    echo -e "Please create your .env configuration before deploying:"
    echo -e "  cp .env.production.example .env"
    echo -e "  nano .env"
    exit 1
fi

# Check for unconfigured placeholder values in .env
if grep -q "replace_with_" .env; then
    echo -e "${YELLOW}[WARNING] Found placeholder values (replace_with_...) in .env!${NC}"
    echo -e "${YELLOW}Please replace all secrets with strong values for production safety.${NC}"
    if [ -t 0 ] && [ "${CI:-false}" != "true" ]; then
        read -rp "Do you still want to proceed with deployment? (y/N): " CONTINUE_WITH_PLACEHOLDERS
        if [[ ! "$CONTINUE_WITH_PLACEHOLDERS" =~ ^[Yy]$ ]]; then
            echo "Aborting deployment. Please edit .env."
            exit 1
        fi
    fi
fi

echo -e "${GREEN}✓ Environment validated successfully.${NC}"

# ------------------------------------------------------------------------------
# 2. Git Synchronization
# ------------------------------------------------------------------------------
if [ "$SKIP_PULL" = false ] && [ -d .git ]; then
    echo -e "\n${BLUE}==> [2/6] Pulling latest code updates from Git repository...${NC}"
    if [ -n "$BRANCH" ]; then
        git checkout "$BRANCH"
    else
        BRANCH=$(git rev-parse --abbrev-ref HEAD)
    fi
    echo "Current branch: $BRANCH"
    git pull origin "$BRANCH"
    echo -e "${GREEN}✓ Git repository synchronized.${NC}"
else
    echo -e "\n${YELLOW}==> [2/6] Skipping Git pull.${NC}"
fi

# ------------------------------------------------------------------------------
# 3. Docker Image Build
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}==> [3/6] Building production Docker container images...${NC}"
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Source .env variables for build arguments (like NEXT_PUBLIC_API_URL)
set -a
[ -f .env ] && . ./.env
set +a

# Normalize DATABASE_URL and REDIS_HOST for Docker container deployment if localhost was specified
if [ -n "${DATABASE_URL:-}" ]; then
    case "$DATABASE_URL" in
        *@localhost:*|*@127.0.0.1:*|*@localhost/*|*@127.0.0.1/*|*@localhost\?*|*@127.0.0.1\?*)
            echo -e "${YELLOW}[NOTICE] DATABASE_URL points to localhost. Translating to 'postgres' container host for Docker deployment...${NC}"
            export DATABASE_URL=$(printf '%s\n' "$DATABASE_URL" | sed -E 's/@(localhost|127\.0\.0\.1)([:/?]|$)/@postgres\2/g')
            sed -i.bak -E 's/@(localhost|127\.0\.0\.1)([:/?]|$)/@postgres\2/g' .env 2>/dev/null || true
            rm -f .env.bak 2>/dev/null || true
            ;;
    esac
fi

if [ "${REDIS_HOST:-}" = "localhost" ] || [ "${REDIS_HOST:-}" = "127.0.0.1" ]; then
    export REDIS_HOST="redis"
fi

# Pre-build cleanup: clean dangling images and stale builder cache older than 72h while preserving active layer cache
echo -e "${CYAN}Managing VPS disk space while preserving active build cache...${NC}"
docker image prune -f 2>/dev/null || true
docker builder prune -f --keep-storage 5GB --filter "until=72h" 2>/dev/null || \
docker builder prune -f --filter "until=72h" 2>/dev/null || true
echo -e "${CYAN}Current VPS disk space available for build:${NC}"
df -h /

# Build images sequentially to prevent memory exhaustion / OOM killer on VPS
echo -e "${CYAN}Building API service image...${NC}"
docker compose -f "$COMPOSE_FILE" build $NO_CACHE api

echo -e "${CYAN}Building Worker service image...${NC}"
docker compose -f "$COMPOSE_FILE" build $NO_CACHE worker

echo -e "${CYAN}Building Web frontend image...${NC}"
docker compose -f "$COMPOSE_FILE" build $NO_CACHE web

echo -e "${GREEN}✓ Docker images built successfully.${NC}"

# ------------------------------------------------------------------------------
# 4. Database Pre-deployment & Migrations
# ------------------------------------------------------------------------------
if [ "$SKIP_MIGRATE" = false ]; then
    echo -e "\n${BLUE}==> [4/6] Bootstrapping database and running schema synchronization...${NC}"
    # Ensure database and redis are healthy first
    docker compose -f "$COMPOSE_FILE" up -d postgres redis

    echo "Waiting for PostgreSQL to be ready..."
    docker compose -f "$COMPOSE_FILE" exec -T postgres sh -c '
        until pg_isready -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-nirmaanify}"; do
            echo "Waiting for PostgreSQL..."
            sleep 2
        done
    '

    echo "Synchronizing Prisma schema..."
    # Run db push via temporary api container instance to ensure exact schema sync
    docker compose -f "$COMPOSE_FILE" run --rm --no-deps api \
        pnpm --filter @nirmaanify/database exec prisma db push --skip-generate

    echo -e "${GREEN}✓ Database schema synchronized.${NC}"
else
    echo -e "\n${YELLOW}==> [4/6] Skipping database migrations.${NC}"
fi

# ------------------------------------------------------------------------------
# 5. Rolling Start of All Containers
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}==> [5/6] Launching all production services...${NC}"

# Ensure host ports 80 & 443 are free for Docker Nginx
echo -e "${CYAN}Ensuring host web ports (80/443) are free for Docker Nginx...${NC}"

# 1. Stop host systemd web servers (nginx, apache2, httpd, lighttpd) if active
if command -v systemctl &>/dev/null; then
    for srv in nginx apache2 httpd lighttpd; do
        if systemctl is-active --quiet "$srv" 2>/dev/null; then
            echo -e "${YELLOW}[NOTICE] Stopping native host service '$srv' (occupying port 80/443)...${NC}"
            systemctl stop "$srv" 2>/dev/null || true
            systemctl disable "$srv" 2>/dev/null || true
        fi
    done
fi

# 2. Stop any rogue non-compose Docker containers listening on ports 80 or 443
for port in 80 443; do
    CONFLICT_CONTAINERS=$(docker ps -q --filter "publish=$port" 2>/dev/null || true)
    for cid in $CONFLICT_CONTAINERS; do
        cname=$(docker inspect --format '{{.Name}}' "$cid" 2>/dev/null | sed 's/^\///')
        if [ "$cname" != "nirmaanify-nginx" ]; then
            echo -e "${YELLOW}[NOTICE] Stopping conflicting container '$cname' ($cid) listening on port $port...${NC}"
            docker stop "$cid" 2>/dev/null || true
        fi
    done
done

# 3. If port 80 or 443 is still held by a lingering non-docker process, terminate it
if command -v fuser &>/dev/null; then
    for port in 80 443; do
        PIDS=$(fuser "${port}/tcp" 2>/dev/null || true)
        for pid in $PIDS; do
            pname=$(ps -p "$pid" -o comm= 2>/dev/null || true)
            if [ "$pname" != "docker-proxy" ] && [ "$pname" != "dockerd" ] && [ -n "$pname" ]; then
                echo -e "${YELLOW}[NOTICE] Terminating host process '$pname' (PID $pid) listening on port $port...${NC}"
                kill -9 "$pid" 2>/dev/null || true
            fi
        done
    done
fi

# 4. Remove any stale nirmaanify-nginx container before starting to avoid network endpoint conflicts
if docker ps -a --format '{{.Names}}' | grep -Eq "^nirmaanify-nginx$"; then
    echo -e "${CYAN}Resetting nirmaanify-nginx container for clean port binding...${NC}"
    docker rm -f nirmaanify-nginx 2>/dev/null || true
fi

docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

# ------------------------------------------------------------------------------
# 6. Post-deployment Health Verification & Clean Up
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}==> [6/6] Verifying service health status...${NC}"

# Wait for API container health
MAX_RETRIES=15
COUNT=0
HEALTHY=false

echo "Checking API status..."
while [ $COUNT -lt $MAX_RETRIES ]; do
    if curl -s -f http://localhost:4000/ > /dev/null 2>&1 || curl -s -f http://127.0.0.1:4000/api/v1 > /dev/null 2>&1; then
        HEALTHY=true
        break
    fi
    COUNT=$((COUNT + 1))
    echo "Waiting for API service to respond... ($COUNT/$MAX_RETRIES)"
    sleep 3
done

if [ "$HEALTHY" = true ]; then
    echo -e "${GREEN}✓ API service is online and responding.${NC}"
else
    echo -e "${YELLOW}[WARNING] API service did not respond within timeout. Checking container logs...${NC}"
    docker compose -f "$COMPOSE_FILE" logs --tail=30 api
fi

# Clean up dangling images to keep VPS disk clean
echo -e "\nPruning unused Docker images and build caches..."
docker image prune -f > /dev/null 2>&1 || true

echo -e "\n${GREEN}${BOLD}=================================================================="
echo "          Deployment Finished Successfully! 🚀                    "
echo "==================================================================${NC}"
docker compose -f "$COMPOSE_FILE" ps
echo -e "\n${CYAN}Useful Operational Commands:${NC}"
echo -e "  View all logs:          ${BOLD}docker compose -f $COMPOSE_FILE logs -f${NC}"
echo -e "  View API logs:          ${BOLD}docker compose -f $COMPOSE_FILE logs -f api${NC}"
echo -e "  View Web logs:          ${BOLD}docker compose -f $COMPOSE_FILE logs -f web${NC}"
echo -e "  View Worker logs:       ${BOLD}docker compose -f $COMPOSE_FILE logs -f worker${NC}"
echo -e "  Restart all services:   ${BOLD}docker compose -f $COMPOSE_FILE restart${NC}"
echo -e "  Stop all services:      ${BOLD}docker compose -f $COMPOSE_FILE down${NC}"
echo -e "==================================================================\n"
