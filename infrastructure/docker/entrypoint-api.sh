#!/bin/sh
set -e

echo "==> [Nirmaanify API] Initializing startup sequence..."

# Database synchronization
if [ -n "$DATABASE_URL" ]; then
    echo "==> [Nirmaanify API] Synchronizing database schema with Prisma..."
    pnpm --filter @nirmaanify/database exec prisma db push --skip-generate || {
        echo "==> [Nirmaanify API] Warning: Initial db push encountered an issue, retrying in 3 seconds..."
        sleep 3
        pnpm --filter @nirmaanify/database exec prisma db push --skip-generate
    }
    echo "==> [Nirmaanify API] Database schema synchronized successfully."
fi

echo "==> [Nirmaanify API] Launching API server..."
exec "$@"
