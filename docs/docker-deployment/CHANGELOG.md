# Playnest Changelog - Dockerization & Hardening

This file logs all changes applied to the Playnest project to achieve production-grade Dockerization, container security hardening, and structural optimization.

---

## [1.1.0] - 2026-07-22

### Added
- Created a production-ready, highly secure `docker-compose.yml` with dual network segments, resource limits, and capability drops.
- Created `docker-compose.dev.yml` to support developer onboarding, hot-reloading, local volume mounts, and seeding.
- Added comprehensive deployment, security, and performance architecture documentation under `docs/docker-deployment/`.
- Introduced `DISABLE_WORKERS` and `DISABLE_HTTP` toggles inside `src/server.ts` to allow launching isolated HTTP API microservices and BullMQ workers independently.

### Changed
- Refactored `docker/Dockerfile` to employ multi-stage optimization:
  - Added `--chown=appuser:appuser` to all COPY commands in the runtime stage to eliminate root ownership.
  - Implemented caching optimizations with `--mount=type=cache,target=/root/.npm`.
  - Upgraded node version to 22.
- Hardened `docker/nginx/Dockerfile` and `docker/nginx/nginx.conf`:
  - Migrated to `nginx-unprivileged` base to run Nginx entirely as a non-root user.
  - Ported listening port to 8080 (internally mapped to standard 80).
  - Fine-tuned client buffer sizes, header limits, and timeouts to protect against Slowloris / DoS attacks.
- Secured `docker/backup/Dockerfile` and `docker/backup/entrypoint.sh`:
  - Created a dedicated `backupuser` and configured permissions.
  - Replaced the Alpine crond utility (which requires root) with a robust, pure-bash sleep-loop cron mechanism executing safely in user-space.

### Verified
- Ensured zero regression across the codebase.
- Executed Jest test suite (12 passed, 12 total) and ESLint (`npm run lint`), passing successfully.
