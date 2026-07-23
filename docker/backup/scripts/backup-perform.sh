#!/bin/bash
set -e

echo "--- Backup Process Started: $(date) ---"

# 1. Initialize Restic repository if it doesn't exist
if ! restic snapshots > /dev/null 2>&1; then
    echo "Initializing Restic repository..."
    restic init
fi

# 2. Perform Database Dump
echo "Backing up PostgreSQL database..."
/scripts/backup-db.sh

# 3. Handle Redis (Save RDB to disk before backup)
echo "Triggering Redis BGSAVE..."
if REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli -h redis BGSAVE; then
    echo "Waiting for Redis BGSAVE to complete..."
    while true; do
        BG_STATUS=$(REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli -h redis info persistence | grep rdb_bgsave_in_progress | tr -d '\r' | cut -d: -f2)
        if [ "$BG_STATUS" = "0" ]; then
            echo "Redis BGSAVE completed successfully."
            break
        elif [ "$BG_STATUS" = "1" ]; then
            echo "BGSAVE is still in progress, waiting..."
            sleep 1
        else
            echo "Warning: Unexpected BGSAVE status '$BG_STATUS'. Proceeding anyway."
            break
        fi
    done
else
    echo "Warning: Redis BGSAVE command failed, attempting fallback to SAVE..."
    if ! REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli -h redis SAVE; then
        echo "Warning: Redis SAVE also failed, continuing with existing RDB if present."
    fi
fi

# 4. Construct backup paths list dynamically to ensure extreme portability and avoid missing folder failures
BACKUP_PATHS=()

# Database dump directory
if [ -d "/tmp/db_dumps" ]; then
    BACKUP_PATHS+=("/tmp/db_dumps")
fi

# Media/storage directory
if [ -d "/storage" ]; then
    BACKUP_PATHS+=("/storage")
fi

# Redis data directory
if [ -d "/redis_data" ]; then
    BACKUP_PATHS+=("/redis_data")
fi

# Optional configs (if mounted/present)
if [ -d "/nginx_config" ]; then
    BACKUP_PATHS+=("/nginx_config")
fi
if [ -d "/project_root" ]; then
    BACKUP_PATHS+=("/project_root")
fi
if [ -d "/config" ]; then
    BACKUP_PATHS+=("/config")
fi

echo "Backup paths to process: ${BACKUP_PATHS[*]}"

# Run Restic Backup
echo "Creating Restic snapshot..."
restic backup "${BACKUP_PATHS[@]}" \
    --tag "automated" \
    --host "playnest-app"

RESTIC_EXIT_CODE=$?

# 5. Update health marker
if [ $RESTIC_EXIT_CODE -eq 0 ]; then
    echo "Backup successful!"
    date +%s > /var/log/last_success_backup
else
    echo "Backup FAILED with exit code $RESTIC_EXIT_CODE!"
    exit 1
fi

echo "--- Backup Process Finished: $(date) ---"
