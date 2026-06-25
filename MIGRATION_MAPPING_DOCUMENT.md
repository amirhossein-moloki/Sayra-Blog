# Migration Mapping Document

## Entity Mappings

### 1. User & Author
| Source (Django User/AuthorProfile) | Target (PlayNest User/AuthorProfile) | Transformation / Logic |
| --- | --- | --- |
| `User.id` | `User.id` | Map Integer to CUID (Generated) |
| `User.username` | `User.username` | Preserve |
| `User.email` | `User.email` | Preserve |
| `User.password` | `User.passwordHash` | Preserve (Compatible hash) |
| `User.is_staff` | `User.isStaff` | Boolean mapping |
| `AuthorProfile.display_name` | `AuthorProfile.displayName` | Preserve |
| `AuthorProfile.bio` | `AuthorProfile.bio` | Preserve |
| `AuthorProfile.avatar_id` | `AuthorProfile.avatarId` | Map to new Media CUID |

### 2. Media
| Source (Django Media) | Target (PlayNest Media) | Transformation / Logic |
| --- | --- | --- |
| `id` | `id` | Map Integer to CUID |
| `url` | `url` | Preserve (Update base URL if needed) |
| `type` | `type` | Map to Enum: `IMAGE`, `VIDEO`, etc. |
| `mime` | `mime` | Preserve |
| `size_bytes` | `sizeBytes` | Preserve |
| `alt_text` | `altText` | Preserve |

### 3. Taxonomy (Category, Tag, Series)
| Source (Django) | Target (PlayNest) | Transformation / Logic |
| --- | --- | --- |
| `Category.slug` | `Category.slug` | Preserve |
| `Category.parent_id` | `Category.parentId` | Map to new Category CUID |
| `Tag.name` | `Tag.name` | Preserve |
| `Series.order_strategy` | `Series.orderStrategy` | Convert to Uppercase Enum |

### 4. Post & Page
| Source (Django) | Target (PlayNest) | Transformation / Logic |
| --- | --- | --- |
| `Post.slug` | `Post.slug` | Preserve |
| `Post.status` | `Post.status` | Convert to Uppercase Enum |
| `Post.content` | `Post.content` | Regex replace Media IDs/URLs in HTML |
| `Page.slug` | `Page.slug` | Preserve |
| `Page.seo_title` | `Page.seoTitle` | Preserve |

### 5. Engagement (Comment, Reaction)
| Source (Django) | Target (PlayNest) | Transformation / Logic |
| --- | --- | --- |
| `Comment.status` | `Comment.status` | Map: `approved` -> `APPROVED`, `spam` -> `REJECTED`, etc. |
| `Comment.parent_id` | `Comment.parentId` | Map to new Comment CUID |
| `Reaction.reaction` | `Reaction.type` | Map string (e.g. "like") to Enum `LIKE` |
| `Reaction.object_id` | `Reaction.objectId` | Map Integer ID to new CUID |

### 6. Navigation
| Source (Django) | Target (PlayNest) | Transformation / Logic |
| --- | --- | --- |
| `Menu.location` | `Menu.location` | Convert to Uppercase Enum |
| `MenuItem.url` | `MenuItem.url` | Preserve |
| `MenuItem.parent_id` | `MenuItem.parentId` | Map to new MenuItem CUID |

## Default Values
- `gamingCenterId`: ID of the Primary GamingCenter created for migration.
- `isActive`: Default to `true` unless source is inactive.
- `createdAt` / `updatedAt`: Preserve from source.

## Unsupported Fields
- Django's `AbstractUser.first_name` / `last_name` (Map to `fullName`).
- Complex custom CKEditor plugins not supported by PlayNest.
