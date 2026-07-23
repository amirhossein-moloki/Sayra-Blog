#!/bin/sh
# scripts/start-production.sh

set -e

# Wait for database to be ready
./scripts/wait-for-db.sh db

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
