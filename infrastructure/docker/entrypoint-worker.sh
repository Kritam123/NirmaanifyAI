#!/bin/sh
set -e

echo "==> [Nirmaanify Worker] Initializing startup sequence..."

# Ensure DATABASE_URL uses the internal docker container hostname 'postgres' instead of 'localhost'
if [ -n "$DATABASE_URL" ]; then
    case "$DATABASE_URL" in
        *@localhost:*|*@127.0.0.1:*|*@localhost/*|*@127.0.0.1/*|*@localhost\?*|*@127.0.0.1\?*)
            echo "==> [Nirmaanify Worker] Detected localhost in DATABASE_URL. Rewriting hostname to 'postgres' for container networking..."
            DATABASE_URL=$(printf '%s\n' "$DATABASE_URL" | sed -E 's/@(localhost|127\.0\.0\.1)([:/?]|$)/@postgres\2/g')
            export DATABASE_URL
            ;;
    esac
fi

echo "==> [Nirmaanify Worker] Launching Worker service..."
exec "$@"
