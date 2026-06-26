# PlayNest — Enterprise-Grade Gaming Center CMS

## Project Overview
PlayNest is a high-performance, multi-tenant content management system designed for gaming centers. It is the successor to the legacy Django-based blog platform, providing a modern Express.js/TypeScript architecture with superior scalability and engagement features.

## Repository Status: Decommissioned Legacy
The legacy Django backend has been fully decommissioned and removed from this repository as of Phase 7. The repository now exclusively hosts the PlayNest system.

### Core Architecture
- **Backend:** Node.js / Express.js / TypeScript
- **Database:** PostgreSQL 15 (via Prisma ORM)
- **Background Jobs:** BullMQ + Redis
- **Multi-tenancy:** GamingCenter-centric isolation
- **CMS:** Hierarchical Pages, Taxonomies, and Posts

## Navigation
- **PlayNest Source:** [PlayNest/](./PlayNest/)
- **Documentation:** [PlayNest/docs/](./PlayNest/docs/)
- **Migrations:** [PlayNest/src/migration/](./PlayNest/src/migration/)

## Decommissioning Reports
The following reports detail the final decommissioning process of the legacy Django system:
- [FINAL_DECOMMISSION_REPORT.md](./FINAL_DECOMMISSION_REPORT.md)
- [SAFETY_VALIDATION_REPORT.md](./SAFETY_VALIDATION_REPORT.md)
- [POST_REMOVAL_HEALTH_REPORT.md](./POST_REMOVAL_HEALTH_REPORT.md)
- [LEGACY_DEPENDENCY_MAP.md](./LEGACY_DEPENDENCY_MAP.md)
- [REMOVAL_PLAN.md](./REMOVAL_PLAN.md)
- [RISK_ASSESSMENT_REPORT.md](./RISK_ASSESSMENT_REPORT.md)

## Quick Start (PlayNest)
1. Navigate to the PlayNest directory:
   ```bash
   cd PlayNest
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Follow the instructions in [PlayNest/README.md](./PlayNest/README.md) for further setup.
