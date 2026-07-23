#!/bin/sh
# scripts/start-production.sh

set -e

# Default host/port values
DB_HOST="db"
DB_PORT="5432"

if [ -n "$DATABASE_URL" ]; then
  # Dynamically extract host and port from DATABASE_URL
  # Input format: postgresql://user:password@host:port/database

  # Remove protocol prefix and everything after '/'
  URL_WITHOUT_PROTO=$(echo "$DATABASE_URL" | sed -e 's|[^:]*://||' -e 's|/.*||')

  # Get everything after '@' (which is host:port)
  HOST_PORT_PART=$(echo "$URL_WITHOUT_PROTO" | sed -e 's|.*@||')

  # Extract host (everything before ':')
  DB_HOST=$(echo "$HOST_PORT_PART" | sed -e 's|:.*||')

  # Extract port (everything after ':') if present, otherwise fallback to 5432
  if echo "$HOST_PORT_PART" | grep -q ":"; then
    DB_PORT=$(echo "$HOST_PORT_PART" | sed -e 's|.*:||')
  fi
fi

# Wait for database to be ready
./scripts/wait-for-db.sh "$DB_HOST" "$DB_PORT"

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Seed database if requested
if [ "$RUN_SEED" = "true" ]; then
  echo "Seeding database..."
  npm run db:seed
fi

# Start the application or worker with exec to assume PID 1
if [ "$DISABLE_HTTP" = "true" ]; then
  echo "Starting worker process..."
  exec node dist/server.js
else
  echo "Starting web server..."
  exec node dist/server.js
fi
