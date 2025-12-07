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

# Perform backup using pg_dump
echo "Creating database backup..."
if docker exec "${DB_CONTAINER}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" > "${BACKUP_FILE}"; then
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

