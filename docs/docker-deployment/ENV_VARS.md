# Environment Variables Reference

Below is a detailed list of all environment variables supported by Playnest and their purposes.

---

| Variable Name | Default Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Environment mode (`development`, `test`, `production`) |
| `PORT` | `3000` | Port on which the HTTP server listens |
| `POSTGRES_USER` | `playnest_admin` | Database username |
| `POSTGRES_PASSWORD` | - | Database secure password |
| `POSTGRES_DB` | `playnest_prod` | Relational database schema name |
| `DATABASE_URL` | - | Formatted Prisma connection URL |
| `REDIS_URL` | `redis://redis:6379` | Connection URI for the Redis cache/queue layer |
| `RESTIC_PASSWORD` | - | Password used by restic backup engine |
| `JWT_ACCESS_SECRET` | - | Secure encryption key for access tokens |
| `JWT_REFRESH_SECRET` | - | Secure encryption key for refresh tokens |
| `STATIC_API_KEY` | - | Header verification API key |
| `DISABLE_WORKERS` | `false` | Run without initializing BullMQ queues |
| `DISABLE_HTTP` | `false` | Run without instantiating Express HTTP server |
