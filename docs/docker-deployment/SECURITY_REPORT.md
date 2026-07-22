# Playnest Production Security Audit Report

This report documents the security posture, hardening implementations, and risk-mitigation measures applied to the Playnest Docker deployment.

---

## 1. Executive Summary
The Playnest container deployment has been thoroughly audited and hardened to prevent vulnerabilities like container breakouts, horizontal network pivoting, host resources exhaustion, and unauthorized filesystem write access.

---

## 2. Implemented Security Controls

### 2.1 Non-Root User Execution
Running containers as root poses a critical risk if a remote code execution vulnerability is discovered in the application.
- **Node.js App / Worker**: Configured with a dedicated `appuser` (UID/GID 1000) inside `docker/Dockerfile`.
- **Nginx**: Leverages the official unprivileged image (`nginx-unprivileged:stable-alpine`) executing under user `nginx` (UID 101).
- **Backup Agent**: Executed as a non-privileged `backupuser` in `docker/backup/Dockerfile`.

### 2.2 Read-Only Root Filesystems
By making the container root filesystem immutable (`read_only: true`), malware or temporary exploit scripts cannot write persistent files to the container.
- **Implementation**: Enabled on `app`, `worker`, and `nginx`.
- **Writable Paths**: Volatile filesystems (like `/tmp`, `/var/cache/nginx`) are mounted using memory-backed `tmpfs`. Persistent media uploads are routed to a named volume (`app_storage`).

### 2.3 Kernel Capability Dropping
Docker containers have several Linux kernel capabilities enabled by default. To prevent container escape vulnerabilities, all capabilities are dropped.
- **Configuration**: `cap_drop: [ALL]` is defined for `app`, `worker`, `nginx`, and `backup` services inside `docker-compose.yml`.
- **Privilege Escalation**: Disabled via `no-new-privileges:true`.

### 2.4 Network Segmentation & Traffic Isolation
By separating public-facing and backend networks, we minimize the potential attack surface.
- **Networks**:
  - `frontend_net`: Restricted to Nginx and App.
  - `backend_net`: Connects App, Worker, DB, Redis, and Backup.
- **Result**: The PostgreSQL and Redis databases do not expose ports on the host's public interfaces and are completely unreachable from the outside world.

### 2.5 Resource Allocations
To prevent Denial of Service (DoS) attacks caused by memory exhaustion or infinite CPU loops:
- Strict resource constraints have been assigned using Compose `deploy.resources.limits` (e.g., maximum memory allocation of 512MB for app/worker instances).

---

## 3. Secret and Credential Handling
No hardcoded credentials, JWT keys, or database passwords reside in the Docker images. All configurations are fed dynamically at runtime through:
- A secure `.env` file mounted/passed as `env_file`.
- Automated PostgreSQL connection construction inside the container, utilizing dynamic environment-based parameters.
