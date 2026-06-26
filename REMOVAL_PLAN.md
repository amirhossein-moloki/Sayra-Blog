# Django Decommissioning Removal Plan

## Overview
This document outlines the phased removal of legacy Django-related components following the successful migration to PlayNest.

## Removal Targets

### Phase 1: Django Application Code
- Path: blog/, common/, core/, interactions/, navigation/, pages/, posts/, users/, medias/
- Description: All Django apps, models, views, and business logic.

### Phase 2: Python Environment and Configuration
- Files: manage.py, Dockerfile, docker-entrypoint.sh, requirements.txt, requirements.in, pyproject.toml, .coveragerc, .flake8
- Description: Management scripts, container definitions, and dependency lock files.

### Phase 3: Documentation and API Specs
- Files: openapi.json, openapi.yaml, openapi.mock.json, schema.yml, README.md, DEPLOYMENT_GUIDE.md
- Reports: All PHASE_*_REPORT.md files in the root directory.

### Phase 4: Support Systems and Collections
- Directories: tests/, templates/, locale/, docs/, mock-server/
- Collections: httpie-collection.json, httpie-mock-collection.json, postman_collection.json, postman_environment.json

### Phase 5: Transitional Scripts and Backups
- Scripts: scripts/traffic_shift.py, scripts/rollback.sh
- Backups: django_backup.sql, media_backup.tar.gz (to be archived externally before deletion)

### Phase 6: Infrastructure Cleanup
- File: docker-compose.yml (Cleanup of commented services)
- Directory: nginx/ (Redundant legacy configuration)

## Safety Measures
1. Verification: After each phase, ls and grep will be used to ensure only intended files were removed.
2. Persistence: PlayNest (PlayNest/) and its associated data volumes remain untouched.
3. Rollback: In case of catastrophic error during removal, the .git history allows for immediate restoration of the deleted codebase.
