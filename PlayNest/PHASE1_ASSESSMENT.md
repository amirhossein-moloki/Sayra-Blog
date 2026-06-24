# Architecture Assessment & Gap Analysis - Phase 1 CMS Migration

## 1. Architecture Assessment

### 1.1 Project Structure
PlayNest follows a modular monolith architecture. Each module (e.g., `auth`, `gamingCenter`, `users`) is self-contained within `src/modules`.

### 1.2 Patterns & Standards
- **Repository Pattern:** Each entity has a dedicated repository for database operations using Prisma.
- **Station Layer:** Acts as a Service Layer, encapsulating business logic, audit logging, and coordinating between repositories.
- **Controller Layer:** Handles HTTP requests, input validation using Zod, and sends responses using a standard envelope.
- **Multi-Tenancy:** The `GamingCenter` model serves as the tenant boundary. Tenant isolation is enforced via `tenantGuard` middleware and `gamingCenterId` checks in repositories/stations.
- **Error Handling:** Standardized via `AppError` and a global `errorHandler` middleware.
- **Response Standard:** Standardized via `responseMiddleware` providing `res.ok`, `res.created`, etc.
- **Validation:** Zod is used for request body and query validation.
- **Background Jobs:** BullMQ is used for asynchronous tasks (e.g., SMS notifications).

### 1.3 Existing Media Module
The `media` module handles file uploads to local storage or S3. It includes `media-upload.station.ts`.

## 2. Gap Analysis

### 2.1 Missing Modules
- **Taxonomy Module:** No implementation for Categories and Tags CRUD.
- **Posts Module:** No implementation for Posts, Series, and Revisions.

### 2.2 Functional Gaps
- **Media Synchronization:** The Django `sync_post_media` logic (parsing HTML for `<img>` tags and updating `PostMedia` relations) is missing.
- **Scheduled Publishing:** A mechanism to automatically publish posts at a specific time is missing.
- **Soft Delete:** While supported by some models in the schema (`isActive` flag), implementation in repositories is needed for CMS entities.
- **Revision History:** The `Revision` model exists but is not currently utilized during post updates.

### 2.3 Schema Assessment
The current `schema.prisma` is quite comprehensive and already includes models for `Post`, `Category`, `Tag`, `Series`, `Revision`, and `PostMedia`.
- **Observation:** `PageStatus` enum is used for `Post.status`. It includes `DRAFT`, `REVIEW`, `SCHEDULED`, `PUBLISHED`, `ARCHIVED`, which matches requirements.
- **Observation:** `PostMedia` junction table is correctly set up for in-content media tracking.

## 3. Implementation Strategy

- **Module Creation:** Create `taxonomy` and `posts` modules following existing patterns.
- **Tenant Isolation:** Ensure all queries include `gamingCenterId`.
- **Async Jobs:** Implement BullMQ workers for media sync and scheduled publishing.
- **HTML Parsing:** Use a light HTML parser or regex (as in Django) to detect media references in post content.
