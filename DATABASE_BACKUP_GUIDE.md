# Database Backup & Restore Guide

## Overview

This guide explains how to backup and restore your PostgreSQL database running in Docker containers.

## Files

- `backup.sh` - Script to create database backups
- `restore.sh` - Script to restore database from backup
- `setup-backup-cron.sh` - Script to set up automated backups via cron

## Manual Backup

### Step 1: Create a Backup

```bash
# Basic usage (saves to ./backups/)
./backup.sh

# Specify custom backup directory
./backup.sh /path/to/backups
```

**What it does:**
- Connects to the PostgreSQL container
- Exports the database using `pg_dump`
- Compresses the backup file
- Saves with timestamp: `teamboard_backup_YYYYMMDD_HHMMSS.sql.gz`
- Automatically cleans up backups older than 7 days

**Example output:**
```
=== Database Backup Started ===
Timestamp: Sat Dec  7 16:00:00 UTC 2024
Container: course-project-zada-postgres-1
Database: teamboard
Backup file: ./backups/teamboard_backup_20241207_160000.sql

Creating database backup...
Compressing backup...

✅ Backup completed successfully!
Backup file: ./backups/teamboard_backup_20241207_160000.sql.gz
Backup size: 2.5M
```

### Step 2: Verify Backup

```bash
# List all backups
ls -lh ./backups/

# View backup file info
file ./backups/teamboard_backup_*.sql.gz
```

## Manual Restore

### Step 1: List Available Backups

```bash
# List all backups
ls -lh ./backups/teamboard_backup_*.sql.gz
```

### Step 2: Restore from Backup

```bash
# Restore from a specific backup
./restore.sh ./backups/teamboard_backup_20241207_160000.sql.gz
```

**What it does:**
- Prompts for confirmation (type "yes" to proceed)
- Drops existing database connections
- Drops and recreates the database
- Restores data from backup file
- Verifies the restore was successful

**Example output:**
```
=== Database Restore Started ===
Timestamp: Sat Dec  7 16:05:00 UTC 2024
Container: course-project-zada-postgres-1
Database: teamboard
Backup file: ./backups/teamboard_backup_20241207_160000.sql.gz

⚠️  WARNING: This will overwrite the current database. Continue? (yes/no): yes

Dropping existing database connections...
Dropping and recreating database...
Restoring database from backup...
Decompressing and restoring...

✅ Database restored successfully!

Verifying restore...
Tables found: 5

Restore complete!
```

## Automated Backups with Cron

### Setup Automated Backups

```bash
# Run the setup script
./setup-backup-cron.sh
```

This will:
- Add a cron job that runs every 12 hours
- Cron expression: `0 */12 * * *` (at minute 0 of every 12th hour)
- Logs output to `./backups/backup.log`

### Manual Cron Setup

If you prefer to set up cron manually:

```bash
# Edit crontab
crontab -e

# Add this line (runs every 12 hours):
0 */12 * * * /path/to/course-project-zada/backup.sh >> /path/to/course-project-zada/backups/backup.log 2>&1
```

### Cron Expression Explained

- `0 */12 * * *` = Every 12 hours at minute 0
  - `0` = minute 0
  - `*/12` = every 12 hours
  - `*` = every day of month
  - `*` = every month
  - `*` = every day of week

### View Cron Logs

```bash
# View backup logs
tail -f ./backups/backup.log

# View cron job status
crontab -l
```

### Remove Cron Job

```bash
# Edit crontab and remove the backup line
crontab -e

# Or remove programmatically
crontab -l | grep -v "backup.sh" | crontab -
```

## Testing Backup & Restore

### Complete Test Workflow

```bash
# 1. Create initial backup
./backup.sh

# 2. Note the backup file name
BACKUP_FILE=$(ls -t ./backups/teamboard_backup_*.sql.gz | head -1)
echo "Backup file: ${BACKUP_FILE}"

# 3. Stop and remove database container
docker compose -f docker-compose.staging.yml stop postgres
docker compose -f docker-compose.staging.yml rm -f postgres

# 4. Remove database volume (optional, for complete test)
docker volume rm course-project-zada_postgres_data

# 5. Recreate database container
docker compose -f docker-compose.staging.yml up -d postgres

# 6. Wait for database to be ready
sleep 10

# 7. Restore from backup
./restore.sh "${BACKUP_FILE}"

# 8. Verify data is restored
docker exec course-project-zada-postgres-1 psql -U postgres -d teamboard -c "\dt"
```

## Environment Variables

You can customize the backup/restore behavior with environment variables:

```bash
# Custom container name
export DB_CONTAINER="my-postgres-container"

# Custom database name
export POSTGRES_DB="mydb"

# Custom database user
export POSTGRES_USER="myuser"

# Run backup with custom settings
./backup.sh
```

## Troubleshooting

### Container Not Found

```bash
# List running containers
docker ps

# Update DB_CONTAINER variable
export DB_CONTAINER="actual-container-name"
./backup.sh
```

### Permission Denied

```bash
# Make scripts executable
chmod +x backup.sh restore.sh setup-backup-cron.sh
```

### Backup Fails

```bash
# Check container logs
docker logs course-project-zada-postgres-1

# Verify database is accessible
docker exec course-project-zada-postgres-1 psql -U postgres -d teamboard -c "\l"
```

## Best Practices

1. **Regular Backups**: Set up automated backups (every 12 hours or daily)
2. **Test Restores**: Periodically test restoring from backups
3. **Offsite Storage**: Copy backups to remote storage (S3, etc.)
4. **Retention Policy**: Keep backups for at least 30 days
5. **Monitor Logs**: Check backup logs regularly for errors

## Screenshots for Deliverables

### Screenshot 1: pg_dump Export
```bash
# Run backup and capture output
./backup.sh | tee backup_output.txt
```

### Screenshot 2: psql Restore
```bash
# Run restore and capture output
./restore.sh ./backups/teamboard_backup_YYYYMMDD_HHMMSS.sql.gz | tee restore_output.txt
```

### Screenshot 3: Cron Expression
```bash
# Show cron job
crontab -l | grep backup.sh
```

