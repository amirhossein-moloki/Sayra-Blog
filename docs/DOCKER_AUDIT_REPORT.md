# Playnest Dockerization Audit & Project Analysis Report

This report contains a complete, professional, production-grade architectural analysis and Dockerization audit of the Playnest project, as part of Phases 1 and 2.

---

## Part 1: Project Analysis (Phase 1)

### 1. Architecture Overview
Playnest is a multi-tenant Gaming Center Management and Reservation Platform.
- **Architectural Pattern**: Centered around a multi-tenant `GamingCenter` model, using a layered architecture (Station/Repository/Controller/Route/Middleware).
- **Tenant Isolation**: Handled via `tenantGuard` and scoped Prisma queries where the tenant context is derived from request parameters or actor metadata.
- **Concurrency & Job Management**: Leverages **Redis** and **BullMQ** for managing asynchronous tasks (e.g., scheduled publishing, SMS notifications, and media synchronization).
- **Database Access**: Uses **Prisma ORM** targeting a **PostgreSQL** database.

### 2. Technology Stack
- **Runtime**: Node.js v22 (using `node:22-slim` base)
- **Language**: TypeScript v5.4.5
- **Framework**: Express v4.19.2
- **Database**: PostgreSQL v15
- **Caching & Queue**: Redis (BullMQ v5.77.6)
- **Security & Cryptography**: Argon2 v0.44.0, Bcryptjs v2.4.3, JWT (jsonwebtoken v9.0.2), Helmet v8.1.0
- **Validation**: Zod v3.23.8
- **Logging**: Pino / Pino-Http
- **Static Assets/Media**: Local filesystem driver or S3 bucket integration, utilizing Sharp v0.33.5 for image processing.

### 3. Startup and Runtime Flow
#### Startup Flow
1. **Process Initialization**: Env vars parsed and validated via Zod schema (`src/config/env.ts`).
2. **Database Connectivity**: Prisma client is instantiated. Migrations are executed prior to startup via `prisma migrate deploy` in the startup script.
3. **Queue & Workers Initialization**: BullMQ workers are instantiated (`src/jobs/workers/index.ts`).
4. **HTTP Server Boot**: Express application starts listening on the configured `PORT`.

#### Runtime Flow
1. **Client Request**: Lands on Nginx (Reverse Proxy).
2. **Static/Media Files**: Nginx handles static file requests directly from a shared volume if using the local media driver, avoiding Node.js overhead.
3. **API Requests**: Nginx forwards to the Node.js application.
4. **Authentication / Tenant Guards**: Middleware validates JWT, tenant headers, or API keys (`req.actor` context).
5. **Business Logic**: Handled in Controllers, spawning asynchronous background tasks (e.g., DB operations or pushing jobs to Redis/BullMQ).
6. **Background Tasks**: BullMQ workers process queued items (e.g., sending SMS, synchronizing media, or publishing posts).

### 4. Dependency Graph (High Level)
```
[Client] ---> [ Nginx (Reverse Proxy) ]
                     |
         +-----------+-----------+
         | (Static)              | (API Routes)
         v                       v
 [Media Volume] <----- [ Express App (Playnest) ]
                         |            |
                         v            v
                   [ PostgreSQL ]   [ Redis (BullMQ / Limits) ]
```

### 5. Identified Architectural Issues
- **Coupled Services**: By default, the single `app` service runs the Express HTTP server and *all* background workers/schedulers. This breaks scalability best practices: if HTTP traffic spikes, scaling the `app` container unnecessarily duplicates background workers, leading to duplicate scheduling or race conditions.
- **Single Network Bridge**: All containers are connected to the default docker network bridge. This lacks network-level segmentation, exposing internal databases and caching engines to the same network layer as Nginx.
- **Volume Ownership**: Build artifacts are copied from the builder stage without explicit `--chown`, meaning runtime directories are owned by root, while the container runs under `appuser`. This could prevent temporary directories/files from being written.

---

## Part 2: Dockerization Audit (Phase 2)

### 1. Dockerfile Analysis (`docker/Dockerfile`)

#### Weaknesses & Inefficiencies
1. **Implicit COPY Ownership**:
   ```dockerfile
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/node_modules ./node_modules
   ```
   Files are copied with `root` ownership. The runtime container runs under `USER appuser`. This violates the Principle of Least Privilege and can cause permission issues if the application or a native library attempts to write to `/app` (e.g., Prisma engine temp files, Sharp caching, or uploads).
2. **Non-Optimized Build Cache**:
   Prisma generation and package installation should leverage Docker layer caching efficiently. Currently, `COPY . .` is run before `npm run build`, which is correct, but any change in source code invalidates subsequent layers. The dependencies section is well-cached, but can be improved by separating build-only packages.
3. **Tightly-Coupled Entrypoint Script**:
   The `wait-for-db.sh` script is coupled to the default CMD in the Dockerfile, but overridden in `docker-compose.yml`, which bypasses database checks entirely.
4. **Missing Read-Only Support**:
   The runtime container's filesystem is fully writeable by default. A more secure approach is running with a read-only root filesystem and mounting writeable directories (`/tmp`, `/app/storage`) as tmpfs or named volumes.

### 2. Compose Analysis (`docker-compose.yml`)

#### Weaknesses & Vulnerabilities
1. **No Service Separation**:
   There is no separate `worker` service. HTTP traffic and background jobs are bundled inside the same application container.
2. **Missing Resource Limits**:
   No `deploy.resources.limits` or legacy `mem_limit`/`cpus` are defined. A memory leak or a malicious denial-of-service attack could exhaust host system resources and bring down the entire server.
3. **No Network Isolation**:
   No custom network drivers (e.g., internal-only backend networks) are defined. All containers communicate over the default bridge network, and databases are bound to host ports (`5432:5432`, `6379:6379`) unnecessarily, increasing the external attack surface.
4. **No Log Rotation Policy**:
   Containers do not have `logging.options` defined. Over time, JSON log files can grow to gigabytes, exhausting disk space.
5. **No Healthchecks on Application and Nginx**:
   While `db` and `redis` have healthy checks, the `app` and `nginx` containers completely lack health checks.
6. **Hardcoded/Insecure Host Volume Mounts**:
   The backup service mounts host paths like `./backups` and `.env` directly. This limits portability across different deployment hosts.

### 3. Nginx Audit (`docker/nginx/`)
- Runs as `root` inside the container. It should run as a non-root user (e.g., `nginx` on non-privileged port like `8080`).
- Gzip is enabled, but cache parameters, optimal buffers, and timeouts can be further tuned for higher load capacity.

### 4. Backup Service Audit (`docker/backup/`)
- Runs as `root` user, which is a major security concern if the backup container gets compromised.
- Environment variables and credentials are raw, without proper secrets handling.

---

## Part 3: Solutions & Optimization Strategy

We will address these deficiencies in Phases 3 to 7:
1. **Introduce Microservices Separation**: Define `app` (HTTP API) and `worker` (BullMQ workers) using the same multi-stage image but with granular toggle environment variables (`DISABLE_HTTP` and `DISABLE_WORKERS`).
2. **Implement Network Segmentation**: Establish a `frontend` network (Nginx <-> App) and a `backend` network (App, Worker <-> Redis, DB).
3. **Enforce Container Hardening**:
   - Run Nginx, Backup, and App containers as non-root users.
   - Set `read_only: true` on containers, providing `tmpfs` mounts for `/tmp` and `/var/run`.
   - Apply `cap_drop: [ALL]` to all services.
   - Define exact CPU and Memory resource limits.
4. **Optimize Docker Images**: Use multi-stage builds, target explicit versions, and guarantee proper file permissions using `COPY --chown=appuser:appuser`.
5. **Integrate Logging Rotation**: Enforce size-based log limits for all services.
