# Source System Assessment Report

## Overview
- **Framework:** Django 5.x
- **Database:** SQLite (db.sqlite3)
- **Architecture:** Single-tenant CMS
- **Content Language:** Multi-lingual support (English and Persian fields/docstrings)

## Entity Analysis

### Identity (users, posts)
- **User:** Extends `AbstractUser`. Includes `profile_picture` (OptimizedImageField).
- **AuthorProfile:** One-to-one with `User`. Stores `display_name`, `bio`, and `avatar` (FK to Media).

### Media (medias)
- **Media:** Centralized media management. Stores `storage_key`, `url`, `type`, `mime`, `dimensions`, `size_bytes`, `alt_text`, and `title`.
- **PostMedia:** Junction table for linking Media to Posts with `attachment_type` (in-content, cover, og-image).

### Taxonomy (posts)
- **Category:** Hierarchical (parent/child). Slug-based. Supports `order`.
- **Tag:** Simple slug-based labels.
- **Series:** Groups posts. Supports `order_strategy` (manual, by_date).

### Content (posts, pages)
- **Post:** Core content entity.
    - Statuses: `draft`, `review`, `scheduled`, `published`, `archived`.
    - Visibility: `public`, `private`, `unlisted`.
    - Relations: Author, Category, Series, Cover Media, OG Image.
    - SEO: `seo_title`, `seo_description`, `canonical_url`.
- **Revision:** Version history for Posts. Stores content, title, excerpt, and change note.
- **Page:** Static content.
    - Statuses: `draft`, `review`, `scheduled`, `published`, `archived`.
    - SEO: `seo_title`, `seo_description`.

### Engagement (interactions)
- **Comment:** Linked to Post. Hierarchical (nested replies).
    - Statuses: `pending`, `approved`, `spam`, `removed`.
    - Metadata: IP, User Agent.
- **Reaction:** Polymorphic (GenericForeignKey). Linked to User and content object. Reaction types are strings (e.g., "like").

### Navigation (navigation)
- **Menu:** Defined by location (`header`, `footer`, `sidebar`).
- **MenuItem:** Hierarchical. Stores `label`, `url`, `order`, `target_blank`.

## Constraints & Rules
- **Slugs:** Unique per model.
- **Media References:** Embedded in CKEditor HTML content and via FKs.
- **Ownership:** All content owned by specific Users/Authors.
- **ID Type:** 32-bit Integer (Auto-increment).

## Data Volume (Estimated)
- Posts: ~10 (Sample data generated for testing)
- Users: 1
- Media: ~20
- Categories: 5
- Tags: 10
