#!/bin/bash
# Setup script to add backup cron job
# This script adds a cron job to run backups every 12 hours

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="${SCRIPT_DIR}/backup.sh"
CRON_EXPRESSION="0 */12 * * *"  # Every 12 hours at minute 0
CRON_JOB="${CRON_EXPRESSION} ${BACKUP_SCRIPT} >> ${SCRIPT_DIR}/backups/backup.log 2>&1"

echo "=== Setting up Database Backup Cron Job ==="
echo ""
echo "Cron expression: ${CRON_EXPRESSION} (Every 12 hours)"
echo "Backup script: ${BACKUP_SCRIPT}"
echo ""

# Check if backup script exists
if [ ! -f "${BACKUP_SCRIPT}" ]; then
    echo "ERROR: Backup script not found: ${BACKUP_SCRIPT}"
    exit 1
fi

# Make backup script executable
chmod +x "${BACKUP_SCRIPT}"

# Create backups directory
mkdir -p "${SCRIPT_DIR}/backups"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "${BACKUP_SCRIPT}"; then
    echo "⚠️  Cron job already exists. Removing old entry..."
    crontab -l 2>/dev/null | grep -v "${BACKUP_SCRIPT}" | crontab -
fi

# Add new cron job
echo "Adding cron job..."
(crontab -l 2>/dev/null; echo "${CRON_JOB}") | crontab -

echo "✅ Cron job added successfully!"
echo ""
echo "Current crontab:"
crontab -l | grep "${BACKUP_SCRIPT}"
echo ""
echo "To view cron logs: tail -f ${SCRIPT_DIR}/backups/backup.log"
echo "To remove the cron job: crontab -e (then delete the line)"

