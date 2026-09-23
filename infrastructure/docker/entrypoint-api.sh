#!/bin/sh
set -e

echo "==> [Nirmaanify API] Initializing startup sequence..."

# Ensure DATABASE_URL uses the internal docker container hostname 'postgres' instead of 'localhost'
if [ -n "$DATABASE_URL" ]; then
    case "$DATABASE_URL" in
        *@localhost:*|*@127.0.0.1:*|*@localhost/*|*@127.0.0.1/*|*@localhost\?*|*@127.0.0.1\?*)
            echo "==> [Nirmaanify API] Detected localhost in DATABASE_URL. Rewriting hostname to 'postgres' for container networking..."
            DATABASE_URL=$(printf '%s\n' "$DATABASE_URL" | sed -E 's/@(localhost|127\.0\.0\.1)([:/?]|$)/@postgres\2/g')
            export DATABASE_URL
            ;;
    esac

    # If an explicit database push/migration command is passed as container arguments,
    # skip the automatic startup schema push to prevent duplicate runs
    case "$*" in
        *"prisma db push"*|*"prisma migrate"*)
            echo "==> [Nirmaanify API] Explicit database command specified, proceeding directly..."
            ;;
        *)
            echo "==> [Nirmaanify API] Synchronizing database schema with Prisma..."
            pnpm --filter @nirmaanify/database exec prisma db push --skip-generate || {
                echo "==> [Nirmaanify API] Warning: Initial db push encountered an issue, retrying in 3 seconds..."
                sleep 3
                pnpm --filter @nirmaanify/database exec prisma db push --skip-generate
            }
            echo "==> [Nirmaanify API] Database schema synchronized successfully."
            ;;
    esac
fi

echo "==> [Nirmaanify API] Launching API server..."
exec "$@"
