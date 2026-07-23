FROM alpine:3.18

# Install dependencies with dynamic mirror fallback to handle regional CDN network issues
RUN for mirror in "dl-cdn.alpinelinux.org" "mirrors.ustc.edu.cn" "mirrors.aliyun.com" "uk.alpinelinux.org"; do \
        echo "Trying mirror: $mirror"; \
        echo "http://$mirror/alpine/v3.18/main" > /etc/apk/repositories && \
        echo "http://$mirror/alpine/v3.18/community" >> /etc/apk/repositories && \
        apk update --no-cache && \
        apk add --no-cache \
            restic \
            postgresql-client \
            redis \
            bash \
            curl \
            rclone \
            ca-certificates \
            tzdata && \
        break || echo "Failed package installation with mirror: $mirror"; \
    done

# Create backup and system directories
RUN mkdir -p /backups /scripts /data /config /storage /redis_data /nginx_config /project_root /var/log

# Create a non-root group and user
RUN addgroup -S backupuser && adduser -S -G backupuser backupuser

# Copy scripts
COPY scripts/ /scripts/
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /scripts/*.sh /entrypoint.sh

# Change ownership of backup-related directories to backupuser
RUN chown -R backupuser:backupuser /backups /scripts /data /config /storage /redis_data /nginx_config /project_root /var/log /entrypoint.sh

# Restic requires root/cap_sys_admin or similar if accessing raw devices,
# but for folder-level backups, it runs perfectly as non-root.
# Note: we need to run crond as non-root or execute tasks in a sleep loop.
# Alpine's standard crond requires root privileges to run.
# To make it fully non-root and secure, we can adapt entrypoint.sh to run a background sleep loop
# instead of crond, or run crond in a custom non-root mode.
# Let's adjust entrypoint.sh to support running as non-root with a simple, robust bash-based scheduler.

USER backupuser

# Default environment variables
ENV BACKUP_CRON_INTERVAL="3600"
ENV RESTIC_REPOSITORY="/backups"
ENV POSTGRES_HOST="db"
ENV POSTGRES_PORT="5432"

ENTRYPOINT ["/entrypoint.sh"]
