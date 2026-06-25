# Tenant Migration Strategy Report

## Context
The source Django CMS is a single-tenant system where all content is global. The target PlayNest system is multi-tenant, requiring every entity to be associated with a `GamingCenter`.

## Migration Options

### Option A: Create a Primary GamingCenter (Recommended)
Migrate all Django content into a single, new GamingCenter in PlayNest.
- **Pros:**
    - Simplest mapping logic.
    - Preserves all relationships exactly as they are.
    - SEO slugs remain unique within the tenant.
- **Cons:**
    - Doesn't take advantage of PlayNest's multi-tenancy immediately.

### Option B: Distribute Content across Multiple GamingCenters
Split content based on categories, authors, or other metadata into different GamingCenters.
- **Pros:**
    - Aligns with a multi-tenant business model if content is truly distinct.
- **Cons:**
    - High complexity in mapping.
    - Breaking shared relationships (e.g., tags, media).
    - SEO impact due to slug changes or domain partitioning.

## Recommendation: Option A (Primary GamingCenter)

### Reasoning
1. **Data Integrity:** The source system was designed as a single entity. Forcing a split during migration introduces significant risk of data loss or relationship corruption.
2. **SEO Stability:** Maintaining a single tenant ensures that slug uniqueness is preserved exactly as it was in the source system, preventing URL conflicts.
3. **Simplicity:** A 1:1 migration of the global scope to a single tenant scope is the safest and most auditably correct approach.

### Implementation
- Generate a new `GamingCenter` with:
    - `name`: "Primary CMS"
    - `slug`: "primary-cms"
- Use this `gamingCenterId` for all migrated records.
