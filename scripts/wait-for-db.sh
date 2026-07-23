#!/bin/sh
# scripts/wait-for-db.sh

set -e

host="$1"
port="${2:-5432}"

echo "Waiting for PostgreSQL at $host:$port..."

# Check only network connectivity/readiness of host and port
# This does not require POSTGRES_USER or POSTGRES_DB to be populated or match
until pg_isready -h "$host" -p "$port"; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec "$@"
