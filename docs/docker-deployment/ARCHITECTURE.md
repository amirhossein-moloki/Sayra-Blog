# Playnest System Architecture

The following Mermaid diagram describes the containerized system architecture, networking layers, and service separation designed for the Playnest production deployment.

```mermaid
graph TD
    Client[Client / Public API] --->|Port 80| Nginx[Nginx Reverse Proxy]

    subgraph Frontend Network (frontend_net)
        Nginx --->|Port 8080| App[Express App HTTP Server]
    end

    subgraph Backend Network (backend_net)
        App --->|Port 5432| DB[PostgreSQL Database]
        App --->|Port 6379| Redis[Redis Caching & Queue]

        Worker[BullMQ Worker Instance] --->|Port 5432| DB
        Worker --->|Port 6379| Redis

        Backup[Backup Agent] --->|Port 5432| DB
        Backup --->|Port 6379| Redis
        Backup -.->|Read-Only Volume| Storage[(Media Storage Volume)]
    end

    App -.->|Read-Write Volume| Storage
    Worker -.->|Read-Write Volume| Storage
    Nginx -.->|Read-Only Volume| Storage
```

---

## Service Components

1. **Nginx Proxy**: Routes API traffic, applies rate limiting, strips debug headers, and directly serves static media.
2. **App Service**: Handles HTTP endpoints and API business logic. Schedulers and background workers are disabled inside this instance.
3. **Worker Service**: Standalone Node.js container executing BullMQ queues (SMS worker, scheduled publishing, media syncer).
4. **PostgreSQL**: Stores persistent relational models under schema protection.
5. **Redis**: Handles BullMQ backends and application rate-limiting states.
6. **Backup Service**: Performs hourly database dumps and snapshots using Restic safely as a non-root agent.
