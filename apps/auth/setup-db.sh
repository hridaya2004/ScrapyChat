#!/bin/sh

# Exit on any error
set -e

echo "Starting database migration process..."

# Check for db connection
 if bun x drizzle-kit introspect --config=./drizzle.config.ts > /dev/null 2>&1; then
     echo "Database connection verified via drizzle-kit"
 else
     echo "Database connection failed completely"
     exit 1
 fi

# Run migrations
echo "Running database migrations..."
if bun x drizzle-kit migrate --config=./drizzle.config.ts; then
    echo "Database migrations completed successfully!"
else
    echo "Error: Database migrations failed"
    exit 1
fi

# Verify the migration was successful
echo "Verifying migration status..."
if bun x drizzle-kit introspect --config=./drizzle.config.ts > /dev/null 2>&1; then
    echo "Database schema verification passed"
else
    echo "Warning: Could not verify database schema"
fi

echo "Migration process completed successfully!"
