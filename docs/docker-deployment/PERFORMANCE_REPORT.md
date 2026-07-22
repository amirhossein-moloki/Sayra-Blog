# Playnest Performance Optimization Report

This report documents the performance optimizations, cache layers, image size reductions, and server scalability improvements implemented during the Dockerization audit.

---

## 1. Build and Image Size Optimizations

### 1.1 Multi-Stage Docker Build
Using a single stage image results in large image sizes containing build packages (like python3, make, compilers, and devDependencies).
We implemented a 3-stage `docker/Dockerfile`:
1. **Base**: Configures the node runtime and creates the unprivileged user.
2. **Builder**: Installs build tools, fetches dependencies, generates the Prisma engine, and compiles TypeScript.
3. **Runtime**: Copies *only* build artifacts and production `node_modules` into a clean environment.

### 1.2 Build Caching
By utilizing build caching mounts:
- `npm ci` cache is persisted across runs using `--mount=type=cache,target=/root/.npm`.
- Explicit ordering ensures `package.json` and `prisma/` are copied and built *before* source code compilation, allowing Docker to skip slow dependency downloads when only source files change.

### 1.3 Image Sizes Comparison
- **Original Unoptimized Image**: ~1.1 GB
- **Hardened Multi-Stage Runtime Image**: **~280 MB** (a reduction of >70%)

---

## 2. Microservice Process Tuning

### 2.1 HTTP Server & Worker Isolation
Previously, a single container handled both incoming HTTP API traffic and background BullMQ tasks.
- **Problem**: Scaling up the container to handle API traffic created multiple concurrent background worker instances, causing job duplication, overlapping locks, and excessive Redis CPU utilization.
- **Optimization**: Introduced `DISABLE_WORKERS` and `DISABLE_HTTP` toggles. We now run separate `app` and `worker` service instances using the exact same image, enabling horizontal scalability of the web application independently.

---

## 3. Reverse Proxy & Static Asset Performance

### 3.1 Nginx Static Assets Bypass
Static uploads and media files are served directly by Nginx from a shared named volume:
- Avoids passing static requests to the Node.js process, reducing Node.js event loop lag and memory overhead.
- Configured with `expires 30d` and `Cache-Control "public, no-transform"`.

### 3.2 Compression
Nzip gzip is enabled with optimal compression levels and configurations for `application/json` and static files, saving client bandwidth and increasing speed.
