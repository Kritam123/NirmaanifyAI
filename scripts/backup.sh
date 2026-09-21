#!/bin/bash
# ==============================================================================
# NIRMAANIFY AI — POSTGRESQL & DATA BACKUP SCRIPT
# ==============================================================================
# Creates automated compressed backups of PostgreSQL database with retention.
# Recommended cron setup: Run daily at 02:00 AM UTC
#   0 2 * * * /opt/nirmaanify/scripts/backup.sh >> /var/log/nirmaanify-backup.log 2>&1
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups/db}"
RETENTION_DAYS=7
TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/nirmaanify_backup_${TIMESTAMP}.sql.gz"

COMPOSE_FILE="docker-compose.prod.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
    COMPOSE_FILE="docker-compose-prod.yml"
fi

mkdir -p "$BACKUP_DIR"

# Source environment
if [ -f .env ]; then
    set -a
    . ./.env
    set +a
fi

DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-nirmaanify}"

echo "[$(date -Iseconds)] Starting automated database backup for '${DB_NAME}'..."

# Execute pg_dump directly inside PostgreSQL container and stream into gzip
docker compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "[$(date -Iseconds)] Backup created successfully: ${BACKUP_FILE} (${FILE_SIZE})"

# Prune backups older than retention period
echo "[$(date -Iseconds)] Cleaning backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_DIR" -type f -name "nirmaanify_backup_*.sql.gz" -mtime +"$RETENTION_DAYS" -exec rm -f {} \;

echo "[$(date -Iseconds)] Backup routine finished."
