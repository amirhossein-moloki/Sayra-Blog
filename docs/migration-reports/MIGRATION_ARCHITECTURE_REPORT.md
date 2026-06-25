# Migration Architecture Report

## Overview
The migration system is designed as a modular ETL pipeline that ensures data integrity, SEO preservation, and idempotency when moving data from Django CMS to PlayNest.

## Architecture

### 1. Extraction Layer (Python/BeautifulSoup)
- **Batch Processing:** Data is extracted in configurable batches (default: 1000) to support millions of records.
- **DOM-based Transformation:** HTML content is parsed using BeautifulSoup during extraction to ensure high-fidelity cleanup of embedded media and internal links.
- **Location:** `PlayNest/src/migration/extractors/`

### 2. Transformation Layer (TypeScript)
- **Deterministic ID Mapping:** Uses MD5 hashing of `(EntityType + SourceID)` to generate stable CUIDs, ensuring idempotency.
- **Multi-Tenant Scope:** Automatically injects the target `gamingCenterId` into all entities.
- **Type Safety:** Ensures Enums (Statuses, Visibility) match PlayNest's schema.
- **Location:** `PlayNest/src/migration/transformers/`

### 3. Loading Layer (TypeScript/Prisma)
- **Simulation Mode:** Default mode that validates all transformations and integrity rules without database side effects.
- **Production Mode:** Uses Prisma Transactions with `upsert` logic to ensure atomic and idempotent inserts.
- **Dependency Ordering:** Entities are loaded in order: Users -> Media -> Taxonomy -> Content -> Engagement.
- **Location:** `PlayNest/src/migration/loaders/`

### 4. Validation Layer
- **Integrity Checks:** Explicitly verifies Foreign Key consistency, Comment tree structure, and Slug uniqueness before reporting success.
- **Dynamic Reporting:** Auto-generates Markdown reports after every run.
- **Location:** `PlayNest/src/migration/validators/`

## Production Execution Guide
To run the migration in a production environment with a live PostgreSQL database:
1. Ensure `DATABASE_URL` is correctly set in `.env`.
2. Run `npm install` in the `PlayNest` directory.
3. Run `npx prisma db push` to ensure the schema is up to date.
4. Execute: `npx tsx src/migration/index.ts --production`
