# Phase 3 Gap Analysis & Implementation Plan

## Gap Analysis

### 1. Schema Gaps
- **Page Model**:
    - Missing `parentId`, `depth`, and `fullPath` for hierarchical routing.
    - Missing `isActive` for soft deletion consistency with other modules.
- **MenuItem Model**:
    - Missing `targetType` (PAGE, POST, URL, etc.) and `targetId`.
    - Missing `visibility` rules (PUBLIC, AUTHENTICATED, etc.).

### 2. Logic Gaps
- **Slug Routing**: Need logic to compute and update `fullPath` recursively when slugs or parents change.
- **Scheduled Publishing**: Existing worker only handles `Post`. Needs to be generalized or extended for `Page`.
- **Media Synchronization**: Existing worker only handles `Post`. Needs to be generalized or extended for `Page`.
- **Navigation Visibility**: Need a way to filter menu items based on user role/status.

## Implementation Plan

### Step 1: Database Schema Update (Prisma)
- Modify `Page` model to include hierarchy and `isActive`.
- Modify `MenuItem` model to include target details and visibility.
- Run `npx prisma generate`.

### Step 2: Pages Module
- **Repository**: CRUD operations, soft delete, hierarchy retrieval, fullPath calculation.
- **Station (Service)**: Lifecycle management, slug validation, sanitization, audit logging, events.
- **Controller/Routes**: REST API endpoints.
- **Validation**: Zod schemas for Page requests.

### Step 3: Navigation Module
- **Repository**: CRUD for Menus and MenuItems, hierarchical retrieval (preventing N+1).
- **Station**: Menu logic, visibility filtering.
- **Controller/Routes**: REST API endpoints.

### Step 4: SEO & Routing Enhancements
- Implement hierarchical slug resolution.
- Ensure SEO metadata is correctly handled in Pages.

### Step 5: Workers & Integration
- Extend/Generalize `scheduled-post-publisher.worker.ts` to support Pages.
- Extend `post-media-sync.worker.ts` to support Pages.
- Register new domain events.

### Step 6: Testing
- Unit tests for Services/Stations.
- Integration tests for nested Pages and Menus.
- Multi-tenant isolation tests.
