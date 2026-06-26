# Legacy Dependency Map Report

## Django Application Components
The legacy Django backend has been fully removed.

### Removed Applications
- blog/
- common/
- core/
- interactions/
- medias/
- navigation/
- pages/
- posts/
- users/

### Removed Infrastructure
- manage.py
- Dockerfile
- docker-entrypoint.sh
- requirements.txt & requirements.in
- pyproject.toml
- locale/
- templates/
- tests/
- docs/
- mock-server/
- nginx/

## PlayNest Independence Verification
- Codebase: PlayNest (PlayNest/src/) is self-contained.
- Database: PlayNest uses its own PostgreSQL database.
- Nginx: PlayNest uses its own Nginx configuration.
