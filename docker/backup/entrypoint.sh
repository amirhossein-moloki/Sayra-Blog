#!/bin/bash
set -e

# Initialize log files
touch /var/log/backup.log

echo "Backup agent started in non-root mode."
echo "Backup Interval: ${BACKUP_CRON_INTERVAL:-3600} seconds"

# Run backup once on startup to ensure system is operational
echo "Executing initial startup backup..."
/scripts/backup-perform.sh >> /var/log/backup.log 2>&1 || echo "Initial backup completed with warnings/errors (see log)."

# Since alpine's crond requires root to run, we run a secure and reliable bash sleep loop.
# This prevents running any root processes or SUID binaries inside our secure environment.
while true; do
    sleep "${BACKUP_CRON_INTERVAL:-3600}"
    echo "--- Scheduled Backup Run: $(date) ---" >> /var/log/backup.log
    /scripts/backup-perform.sh >> /var/log/backup.log 2>&1 || echo "Scheduled backup run failed." >> /var/log/backup.log

    # Run maintenance daily (approx every 24 hours, i.e., every 24 * 3600 seconds)
    # We can run maintenance once every 24 cycles of the backup loop.
    ((cycle++))
    if [ "$cycle" -ge 24 ]; then
        cycle=0
        echo "--- Scheduled Maintenance Run: $(date) ---" >> /var/log/backup.log
        /scripts/maintenance.sh >> /var/log/backup.log 2>&1 || echo "Scheduled maintenance run failed." >> /var/log/backup.log
    fi
done
