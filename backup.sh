#!/bin/bash
set -e

DB_CONTAINER="${DB_CONTAINER:-course-project-zada-postgres-1}"

if [ -z "${POSTGRES_DB}" ]; then
    DB_NAME=$(docker exec "${DB_CONTAINER}" sh -c 'echo $POSTGRES_DB' 2>/dev/null || echo "teamboard")
else
    DB_NAME="${POSTGRES_DB}"
fi

if [ -z "${POSTGRES_USER}" ]; then
    DB_USER=$(docker exec "${DB_CONTAINER}" sh -c 'echo $POSTGRES_USER' 2>/dev/null || echo "postgres")
else
    DB_USER="${POSTGRES_USER}"
fi
BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/teamboard_backup_${TIMESTAMP}.sql"

mkdir -p "${BACKUP_DIR}"

echo "=== Database Backup Started ==="
echo "Timestamp: $(date)"
echo "Container: ${DB_CONTAINER}"
echo "Database: ${DB_NAME}"
echo "Backup file: ${BACKUP_FILE}"
echo ""

if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    echo "ERROR: Container ${DB_CONTAINER} is not running!"
    exit 1
fi

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

if ! docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "${DB_NAME}"; then
    echo "WARNING: Database ${DB_NAME} does not exist yet. Creating it..."
    docker exec "${DB_CONTAINER}" psql -U "${DB_USER}" -d postgres -c "CREATE DATABASE ${DB_NAME};" 2>/dev/null || true
fi

echo "Creating database backup with user: ${DB_USER}..."
if docker exec "${DB_CONTAINER}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" > "${BACKUP_FILE}" 2>&1; then
    echo "Compressing backup..."
    gzip -f "${BACKUP_FILE}"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo ""
    echo "✅ Backup completed successfully!"
    echo "Backup file: ${BACKUP_FILE}"
    echo "Backup size: ${BACKUP_SIZE}"
    echo ""
    
    echo "Cleaning up old backups (keeping last 7 days)..."
    find "${BACKUP_DIR}" -name "teamboard_backup_*.sql.gz" -mtime +7 -delete
    echo "Cleanup complete."
    
    exit 0
else
    echo "❌ Backup failed!"
    exit 1
fi

