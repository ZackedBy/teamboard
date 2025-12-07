#!/bin/bash
# Database Restore Script
# Restores PostgreSQL database from a backup file
# Usage: ./restore.sh <backup_file.sql[.gz]>

set -e  # Exit on error

# Configuration
DB_CONTAINER="${DB_CONTAINER:-course-project-zada-postgres-1}"
DB_NAME="${POSTGRES_DB:-teamboard}"
DB_USER="${POSTGRES_USER:-postgres}"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "ERROR: Backup file not specified!"
    echo "Usage: ./restore.sh <backup_file.sql[.gz]>"
    echo ""
    echo "Available backups:"
    ls -lh ./backups/teamboard_backup_*.sql* 2>/dev/null || echo "No backups found in ./backups/"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
    echo "ERROR: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

echo "=== Database Restore Started ==="
echo "Timestamp: $(date)"
echo "Container: ${DB_CONTAINER}"
echo "Database: ${DB_NAME}"
echo "Backup file: ${BACKUP_FILE}"
echo ""

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    echo "ERROR: Container ${DB_CONTAINER} is not running!"
    exit 1
fi

# Confirm before proceeding
read -p "⚠️  WARNING: This will overwrite the current database. Continue? (yes/no): " confirm
if [ "${confirm}" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo ""
echo "Dropping existing database connections..."
docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();" 2>/dev/null || true

echo "Dropping and recreating database..."
docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};"
docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -d postgres -c "CREATE DATABASE ${DB_NAME};"

echo "Restoring database from backup..."

# Check if backup is compressed
if [[ "${BACKUP_FILE}" == *.gz ]]; then
    echo "Decompressing and restoring..."
    gunzip -c "${BACKUP_FILE}" | docker exec -i "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}"
else
    echo "Restoring..."
    docker exec -i "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" < "${BACKUP_FILE}"
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database restored successfully!"
    echo ""
    echo "Verifying restore..."
    RECORD_COUNT=$(docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
    echo "Tables found: ${RECORD_COUNT}"
    echo ""
    echo "Restore complete!"
    exit 0
else
    echo "❌ Restore failed!"
    exit 1
fi

