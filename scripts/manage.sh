#!/bin/bash
# ==============================================================================
# NIRMAANIFY AI — OPERATIONS & SERVICE MANAGEMENT HELPER
# ==============================================================================
# Fast CLI utility for managing production containers on the VPS.
# ==============================================================================

set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
    COMPOSE_FILE="docker-compose-prod.yml"
fi

COMMAND="${1:-help}"
SERVICE="${2:-}"

# Load .env
if [ -f .env ]; then
    set -a
    . ./.env
    set +a
fi

case "$COMMAND" in
    status)
        echo "=== Container Status ==="
        docker compose -f "$COMPOSE_FILE" ps
        echo -e "\n=== Resource Usage ==="
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}"
        ;;
    logs)
        if [ -n "$SERVICE" ]; then
            docker compose -f "$COMPOSE_FILE" logs -f --tail=100 "$SERVICE"
        else
            docker compose -f "$COMPOSE_FILE" logs -f --tail=50
        fi
        ;;
    restart)
        if [ -n "$SERVICE" ]; then
            echo "Restarting $SERVICE..."
            docker compose -f "$COMPOSE_FILE" restart "$SERVICE"
        else
            echo "Restarting all services..."
            docker compose -f "$COMPOSE_FILE" restart
        fi
        ;;
    stop)
        echo "Stopping all services..."
        docker compose -f "$COMPOSE_FILE" down
        ;;
    start)
        echo "Starting all services..."
        docker compose -f "$COMPOSE_FILE" up -d
        ;;
    db-shell)
        echo "Connecting to PostgreSQL database '${POSTGRES_DB:-nirmaanify}'..."
        docker compose -f "$COMPOSE_FILE" exec postgres psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-nirmaanify}"
        ;;
    db-push)
        echo "Running Prisma db push..."
        docker compose -f "$COMPOSE_FILE" exec api pnpm --filter @nirmaanify/database exec prisma db push --skip-generate
        ;;
    redis-cli)
        echo "Connecting to Redis CLI..."
        if [ -n "${REDIS_PASSWORD:-}" ]; then
            docker compose -f "$COMPOSE_FILE" exec redis redis-cli -a "$REDIS_PASSWORD"
        else
            docker compose -f "$COMPOSE_FILE" exec redis redis-cli
        fi
        ;;
    cert-renew)
        echo "Testing Let's Encrypt certificate renewal..."
        docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "certbot renew --dry-run" certbot
        ;;
    help|*)
        echo "Nirmaanify AI Management Helper"
        echo "Usage: ./scripts/manage.sh <command> [service]"
        echo ""
        echo "Commands:"
        echo "  status            View running containers & live memory/CPU usage"
        echo "  logs [service]    Follow real-time container logs (e.g. api, web, worker, nginx)"
        echo "  restart [service] Restart all services or a specific container"
        echo "  stop              Stop all Docker services"
        echo "  start             Start all Docker services in background"
        echo "  db-shell          Enter interactive psql terminal inside PostgreSQL"
        echo "  db-push           Apply latest Prisma schema changes to database"
        echo "  redis-cli         Open Redis CLI inside redis container"
        echo "  cert-renew        Test Let's Encrypt SSL certificate auto-renewal"
        ;;
esac
