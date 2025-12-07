#!/bin/bash
# Database Backup Script
# Exports PostgreSQL database using pg_dump
# Usage: ./backup.sh [backup_directory]

set -e  # Exit on error

# Configuration
DB_CONTAINER="${DB_CONTAINER:-course-project-zada-postgres-1}"
DB_NAME="${POSTGRES_DB:-teamboard}"
DB_USER="${POSTGRES_USER:-postgres}"
BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/teamboard_backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo "=== Database Backup Started ==="
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

# Wait for database to be ready
echo "Waiting for database to be ready..."
for i in {1..30}; do
    if docker exec "${DB_CONTAINER}" pg_isready > /dev/null 2>&1; then
        echo "Database is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "ERROR: Database is not ready after 30 seconds!"
        exit 1
    fi
    sleep 1
done

# Try to determine the actual database user
# PostgreSQL Docker image creates a user based on POSTGRES_USER env var
# If postgres user doesn't exist, try to find the actual user
ACTUAL_USER="${DB_USER}"
if ! docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
    echo "WARNING: User ${DB_USER} doesn't exist. Trying to find actual user..."
    # Try common alternatives or check environment
    POSTGRES_USER_ENV=$(docker exec "${DB_CONTAINER}" sh -c 'echo $POSTGRES_USER' 2>/dev/null || echo "")
    if [ -n "${POSTGRES_USER_ENV}" ]; then
        ACTUAL_USER="${POSTGRES_USER_ENV}"
        echo "Found user from environment: ${ACTUAL_USER}"
    else
        # Try connecting without user (uses default)
        if docker exec "${DB_CONTAINER}" psql -d postgres -c "SELECT current_user;" > /dev/null 2>&1; then
            ACTUAL_USER=$(docker exec "${DB_CONTAINER}" psql -d postgres -t -c "SELECT current_user;" 2>/dev/null | tr -d ' ')
            echo "Found user from connection: ${ACTUAL_USER}"
        else
            echo "ERROR: Cannot determine database user. Please check database initialization."
            exit 1
        fi
    fi
fi

# Check if database exists, create if needed
if ! docker exec "${DB_CONTAINER}" psql -U "${ACTUAL_USER}" -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "${DB_NAME}"; then
    echo "WARNING: Database ${DB_NAME} does not exist yet. Creating it..."
    docker exec "${DB_CONTAINER}" psql -U "${ACTUAL_USER}" -d postgres -c "CREATE DATABASE ${DB_NAME};" 2>/dev/null || true
fi

# Perform backup using pg_dump
echo "Creating database backup with user: ${ACTUAL_USER}..."
if docker exec "${DB_CONTAINER}" pg_dump -U "${ACTUAL_USER}" -d "${DB_NAME}" > "${BACKUP_FILE}" 2>&1; then
    # Compress the backup
    echo "Compressing backup..."
    gzip -f "${BACKUP_FILE}"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo ""
    echo "✅ Backup completed successfully!"
    echo "Backup file: ${BACKUP_FILE}"
    echo "Backup size: ${BACKUP_SIZE}"
    echo ""
    
    # Keep only last 7 days of backups (optional cleanup)
    echo "Cleaning up old backups (keeping last 7 days)..."
    find "${BACKUP_DIR}" -name "teamboard_backup_*.sql.gz" -mtime +7 -delete
    echo "Cleanup complete."
    
    exit 0
else
    echo "❌ Backup failed!"
    exit 1
fi

