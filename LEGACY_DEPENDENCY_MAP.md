# Legacy Dependency Map Report

## Django Application Components
The following directories and files constitute the legacy Django backend:

### Core Applications
- blog/: Project configuration, settings, and root URL routing.
- common/: Shared utilities, base classes, and middleware for Django apps.
- core/: Core business logic, base models, and the Shadow Proxy middleware.
- interactions/: Social features (Comments, Reactions).
- medias/: Centralized media management and processing.
- navigation/: Menu and navigation structure management.
- pages/: Static and hierarchical page management.
- posts/: Content engine, taxonomies, and publishing workflows.
- users/: Identity management and authentication.

### Support Infrastructure
- manage.py: Django management CLI.
- Dockerfile: Legacy container definition.
- docker-entrypoint.sh: Legacy container entry point.
- requirements.txt & requirements.in: Python dependencies.
- pyproject.toml: Python project configuration.
- locale/: Localization files.
- templates/: HTML templates.
- tests/: Legacy test suite.
- docs/: Legacy documentation.
- mock-server/: Legacy mock server.
- nginx/: Legacy Nginx configuration.

### Data and Assets
- django_backup.sql: Snapshot of the Django database.
- media_backup.tar.gz: Snapshot of legacy media files.

## PlayNest Independence Verification
- Codebase: PlayNest (PlayNest/src/) maintains its own common, modules, and config directories. Grep analysis confirms no imports from legacy root directories.
- Database: PlayNest uses a separate PostgreSQL database (playenest-db) as defined in PlayNest/docker-compose.yml.
- Nginx: PlayNest has its own Nginx configuration in PlayNest/docker/nginx/.
- Migrations: The migration system in PlayNest/src/migration/ is the only component that interacts with legacy data, and it is designed for one-time batch processing.

## Connectivity
- Traffic: Nginx is configured to route 100% of traffic to PlayNest.
- Shadow Traffic: ShadowProxyMiddleware in core/middleware/shadow_proxy.py is no longer receiving traffic as Django itself is unreachable.
