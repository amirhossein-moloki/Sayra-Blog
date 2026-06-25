# Target System Assessment Report

## Overview
- **Framework:** Express.js + TypeScript
- **Database:** PostgreSQL (via Prisma)
- **Architecture:** Multi-tenant (GamingCenter-based isolation)
- **ID Type:** CUID (String)

## Entity Analysis (CMS Modules)

### Identity
- **GamingCenter:** The tenant container. All data must be linked to a `gamingCenterId`.
- **User:** Tenant-aware. Roles: `MANAGER`, `STAFF`, etc. Includes `bio`, `avatarUrl`, `isPublic`.
- **AuthorProfile:** Maps to `User`. Stores `displayName`, `bio`, `avatarId`.

### Media
- **Media:** Linked to `GamingCenter`. Supports `type` (IMAGE, VIDEO, etc.) and `purpose` (COVER, GALLERY, etc.).
- **PostMedia:** Links Media to Post with `attachmentType`.

### Taxonomy
- **Category:** Hierarchical. `unique([gamingCenterId, slug])`.
- **Tag:** `unique([gamingCenterId, slug])`.
- **Series:** `unique([gamingCenterId, slug])`. Supports `orderStrategy` (MANUAL, BY_DATE).

### Content
- **Post:**
    - Statuses: `DRAFT`, `REVIEW`, `SCHEDULED`, `PUBLISHED`, `ARCHIVED`.
    - Visibility: `PUBLIC`, `PRIVATE`, `UNLISTED`.
- **Revision:** Stores history for Posts.
- **Page:** Hierarchical routing support (`fullPath`, `depth`). Supports sections or raw content.

### Engagement
- **Comment:** Tenant-aware. Linked to Post and User. Hierarchical (`rootId`, `depth`).
    - Statuses: `PENDING`, `APPROVED`, `REJECTED`, `DELETED`.
- **Reaction:** Tenant-aware. Polymorphic simulation via `contentType` and `objectId`.
- **ReactionAggregate:** Stores counts per type to optimize retrieval.

### Navigation
- **Menu:** Linked to `GamingCenter` and `MenuLocation`.
- **MenuItem:** Hierarchical. Supports `targetType` (PAGE, POST, CATEGORY, TAG, URL) and `visibility` rules.

## Tenant Isolation Rules
- Every record must have a `gamingCenterId`.
- Slugs must be unique within a `GamingCenter`.
- Users are scoped to a `GamingCenter`.

## Existing Data State
- Currently empty or containing minimal seed data.
- Requires creation of a Primary GamingCenter for migration.
