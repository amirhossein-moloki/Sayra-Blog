# Backend Migration Roadmap: Django to Express.js (PlayNest)

## 1. Architecture Analysis

### Django Backend (Current Production)
*   **Architecture**: Modular Monolith.
*   **Domain Model**: Single-tenant blog platform.
*   **Key Apps**:
    *   `users`: Identity and Auth (JWT + Google OAuth2).
    *   `posts`: Content engine (Posts, Categories, Tags, Series, Revisions).
    *   `medias`: Centralized media library and processing.
    *   `interactions`: Social layer (Threaded comments, Generic reactions).
    *   `navigation` & `pages`: CMS structural components.
*   **Background Jobs**: Celery-based (Scheduled publishing, view counts).
*   **Data Integrity**: Django ORM with PostgreSQL.

### Express.js Backend (PlayNest - Target)
*   **Architecture**: Domain-Driven Multi-tenant system.
*   **Domain Model**: Gaming Center Management & Reservation with integrated CMS.
*   **Key Modules**: `auth`, `users`, `gamingCenter`, `media`, `settings`, `audit`, `notifications`, `webhooks`.
*   **Status**: Core infrastructure (multi-tenancy, auth, auditing) is highly mature. CMS modules are defined in Prisma but not yet implemented in code.
*   **Background Jobs**: BullMQ-based.
*   **Data Integrity**: Prisma ORM with PostgreSQL.

---

## 2. Feature Parity Matrix

| Feature | Django Implementation | PlayNest Status | Gap / Requirement |
| :--- | :--- | :--- | :--- |
| **Authentication** | JWT + Google OAuth2 | JWT + OTP (Phone) | Need to add Google OAuth2 to PlayNest. |
| **User Profiles** | Basic + Author Profiles | User + Staff Profiles | Author profile needs to be integrated with `GamingCenter`. |
| **Post Engine** | Full (Draft/Published/Scheduled) | Prisma Schema Only | Implementation of controllers, services, and BullMQ jobs needed. |
| **Media Library** | Registry + Local/S3 | Registry + S3/Local | Parity achieved; needs tenant-aware access control. |
| **Comments** | Threaded (Nested) | Prisma Schema Only | Implementation of nested logic and moderation needed. |
| **Reactions** | Generic (Likes/Emojis) | Prisma Schema Only | Polymorphic implementation needed. |
| **Taxonomies** | Hierarchical Categories/Tags | Prisma Schema Only | Implementation needed. |
| **Pages/Menus** | Static Pages + Menus | Prisma Schema Only | Implementation needed. |
| **Analytics** | View counts (Async) | Summary Tables | PlayNest uses sophisticated pre-calculated analytics. |

---

## 3. Gap Analysis Report

### Critical Gaps
1.  **Missing CMS Modules**: While `Post`, `Page`, and `Comment` models exist in Prisma, the corresponding controllers, repositories, and routes are absent in `src/modules`.
2.  **Multi-Tenancy Alignment**: Django content is global. In PlayNest, every piece of content (`Post`, `Category`, etc.) must belong to a `GamingCenter`.
3.  **Rich Text Handling**: Django uses CKEditor 5. PlayNest needs to ensure its API handles the HTML output and media syncing logic (implemented in Django's `sync_post_media`).
4.  **Background Processing**: Migration of Celery tasks to BullMQ (specifically for scheduled publishing).

---

## 4. Migration Strategy

### Approach: Strangler Fig Pattern
We will incrementally implement CMS features in PlayNest and proxy traffic from the old Django backend to the new Express services.

### Risk Assessment & Mitigation
*   **Data Loss**: Use Prisma migrations and validation scripts during ETL.
*   **SEO Impact**: Maintain slug consistency and implement 301 redirects if necessary.
*   **Downtime**: Use a parallel-run phase where both systems are active.

---

## 5. Execution Plan & Milestones

### Phase 1: Core CMS Implementation (Complexity: Medium)
*   **Goal**: Implement `Taxonomy` and `Post` modules in PlayNest.
*   **Dependencies**: `gamingCenter`, `users`, `media`.
*   **Tasks**:
    *   Create `posts` module (Repository, Service, Controller).
    *   Implement `sync_post_media` equivalent for BullMQ.
    *   Implement Scheduled Publishing worker.

### Phase 2: Social & Interaction Layer (Complexity: Medium)
*   **Goal**: Implement `Comments` and `Reactions`.
*   **Dependencies**: `posts`.
*   **Tasks**:
    *   Implement nested comment tree retrieval.
    *   Implement generic reaction system (Polymorphic).

### Phase 3: Structural CMS (Complexity: Low)
*   **Goal**: Implement `Pages` and `Navigation`.
*   **Tasks**:
    *   Create `pages` and `navigation` modules.
    *   Implement Menu hierarchy logic.

---

## 6. Target Architecture Recommendations

1.  **Shared Repository Pattern**: Continue using the repository pattern established in PlayNest for data access.
2.  **Standardized Response Envelope**: Ensure all new modules use the `res.ok` and `AppError` patterns.
3.  **Media URL Strategy**: Implement a consistent URL strategy as defined in `PlayNest/docs/media-url-strategy.md`.
4.  **Tenant Isolation**: Strictly enforce `gamingCenterId` checks in all CMS routes.

---

## 7. Migration Sequence

1.  **Milestone 1**: Media & Asset parity (Tenant-aware uploads).
2.  **Milestone 2**: Post & Taxonomy engine implementation.
3.  **Milestone 3**: Data migration of existing Blog posts into a "Global" or "Primary" GamingCenter.
4.  **Milestone 4**: Social features (Comments/Reactions) migration.
5.  **Milestone 5**: Full DNS switchover and Django decommissioning.
