# Playnest Deployment & Operations Guide

This guide describes how to run and operate Playnest in development and production environments using Docker and Docker Compose.

---

## 1. Prerequisites
- Docker Engine v20.10+
- Docker Compose v2.0+

---

## 2. Environment Configuration
Create a `.env` file in the root directory (you can copy `.env.example` as a template):
```bash
cp .env.example .env
```
Ensure you change all default secure parameters (secrets, passwords, API keys) before running in production.

---

## 3. Local Development Setup
For local development with hot-reloading:
```bash
docker compose -f docker-compose.dev.yml up --build
```
This runs:
- **db**: PostgreSQL database at localhost:5432
- **redis**: Redis in alpine at localhost:6379
- **app**: Playnest API with tsx hot-reloading at localhost:3000 (mounted local directory `/app`)

---

## 4. Production Deployment
To build and start all production services in the background:
```bash
docker compose up -d --build
```
This command runs the secure multi-stage deployment architecture:
1. **db**: Highly tuned and isolated PostgreSQL database.
2. **redis**: In-memory caching and queuing backend.
3. **app**: Node.js Express server running with `DISABLE_WORKERS=true` (HTTP traffic only).
4. **worker**: Node.js worker instance running with `DISABLE_HTTP=true` (BullMQ workers only).
5. **nginx**: Unprivileged reverse proxy routing API, healthchecks, and serving static media files directly.
6. **backup**: Automatic non-root restic/cron-based backup worker.

### 5. Scaling Services
To handle high HTTP traffic spikes, you can scale the `app` microservice independently without multiplying background workers:
```bash
docker compose up -d --scale app=3
```

### 6. Checking logs
To view log records for all services:
```bash
docker compose logs -f
```
Or for a specific service:
```bash
docker compose logs -f app
```

---

## 7. Security Hardening & Isolation
This architecture adheres to strict corporate security standards:
- **Principle of Least Privilege**: All containers execute as dedicated unprivileged users (`appuser`, `nginx` at 101, `backupuser`).
- **Read-Only Root Filesystem**: Root filesystem is mounted as read-only (`read_only: true`). Temporary execution paths are mounted as secure memory-only (`tmpfs`).
- **Dropped Capabilities**: All services drop kernel capabilities (`cap_drop: [ALL]`) to prevent container breakout exploits.
- **Network Segmentation**: Two secure internal network bridges:
  - `frontend_net`: Connects `nginx` and `app` for API requests.
  - `backend_net`: Connects `app`, `worker`, `db`, `redis`, and `backup` services. Databases are entirely unreachable from the public internet.
- **Log Rotation**: Size limits are applied (`max-size: 10m`, `max-file: 3`) to prevent disk space exhaustion attacks.
