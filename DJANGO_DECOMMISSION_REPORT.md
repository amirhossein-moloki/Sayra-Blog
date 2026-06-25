# DJANGO DECOMMISSION REPORT

## 1. Action Summary
Django services have been disabled in the production orchestration configuration to finalize the cutover to PlayNest.

## 2. Deactivated Services
- `web`: Django API/Web server.
- `celery_high_priority`: Background worker.
- `celery_default`: Background worker.
- `celery_low_priority`: Background worker.
- `celery-beat`: Scheduled task scheduler.

## 3. Data Preservation
- **Database**: PostgreSQL (Django) remains active for historical data access and audit purposes.
- **Media**: Media files have been backed up and the source volume remains intact.

## 4. Repository Status
The Django repository and associated deployment configurations are marked for archiving. No further feature development will occur on the Django codebase.

## 5. Post-Decommission Status
PlayNest is now the sole provider for CMS and Social functionality.
