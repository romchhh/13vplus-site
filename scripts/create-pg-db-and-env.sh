#!/usr/bin/env bash
# Creates a PostgreSQL database and sets DATABASE_URL in .env
#
# Usage:
#   ./scripts/create-pg-db-and-env.sh [db_name]
#   DB_NAME=wellness_site ./scripts/create-pg-db-and-env.sh
#
# Requires: psql, .env or .env.example (for other vars). Uses local postgres by default.

set -e

DB_NAME="${DB_NAME:-${1:-wellness_site}}"
ENV_FILE=".env"

# Connection defaults (override via env: PGHOST, PGUSER, PGPASSWORD, PGPORT)
PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-postgres}"
# PGPASSWORD set by user or leave empty for peer auth

echo ""
echo "Creating database: $DB_NAME"
echo "Host: $PGHOST:$PGPORT User: $PGUSER"
echo ""

# Create database (connect to 'postgres' to create another DB)
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 \
  && echo "Database '$DB_NAME' already exists." \
  || psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres -c "CREATE DATABASE \"$DB_NAME\";"

# Build DATABASE_URL (no password in URL if empty - use .pgpass or env)
if [ -n "$PGPASSWORD" ]; then
  DATABASE_URL="postgresql://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$DB_NAME"
else
  DATABASE_URL="postgresql://$PGUSER@$PGHOST:$PGPORT/$DB_NAME"
fi

# Create .env from .env.example if missing
if [ ! -f "$ENV_FILE" ]; then
  if [ -f .env.example ]; then
    cp .env.example "$ENV_FILE"
    echo "Created $ENV_FILE from .env.example"
  else
    touch "$ENV_FILE"
    echo "Created empty $ENV_FILE"
  fi
fi

# Update or add DATABASE_URL in .env
if grep -q '^DATABASE_URL=' "$ENV_FILE" 2>/dev/null; then
  if sed --version 2>/dev/null | grep -q GNU; then
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$DATABASE_URL\"|" "$ENV_FILE"
  else
    sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"$DATABASE_URL\"|" "$ENV_FILE"
  fi
  echo "Updated DATABASE_URL in $ENV_FILE"
else
  echo "DATABASE_URL=\"$DATABASE_URL\"" >> "$ENV_FILE"
  echo "Appended DATABASE_URL to $ENV_FILE"
fi

echo ""
echo "Next: npm run migrate"
echo ""
