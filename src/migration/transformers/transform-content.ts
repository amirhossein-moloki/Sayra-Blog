import { IdMapper } from '../utils/id-mapper';
import config from '../migration-config.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformContent(data: Record<string, any[]>) {
  // Using Record<string, any> for raw migration data from legacy source
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedPosts = data.post.map((p: Record<string, any>) => ({
    id: IdMapper.getOrCreate('Post', p.id),
    gamingCenterId: config.gamingCenterId,
    slug: p.slug,
    canonicalUrl: p.canonical_url,
    title: p.title,
    excerpt: p.excerpt,
    isHot: p.is_hot === 1,
    content: p.content, // HTML already transformed by DOM-based extractor
    readingTimeSec: p.reading_time_sec,
    status: (p.status || 'DRAFT').toUpperCase(),
    visibility: (p.visibility || 'PUBLIC').toUpperCase(),
    publishedAt: p.published_at ? new Date(p.published_at) : null,
    scheduledAt: p.scheduled_at ? new Date(p.scheduled_at) : null,
    viewsCount: p.views_count,
    authorId: IdMapper.get('User', p.author_id),
    categoryId: p.category_id ? IdMapper.get('Category', p.category_id) : null,
    seriesId: p.series_id ? IdMapper.get('Series', p.series_id) : null,
    coverMediaId: p.cover_media_id ? IdMapper.get('Media', p.cover_media_id) : null,
    ogImageId: p.og_image_id ? IdMapper.get('Media', p.og_image_id) : null,
    seoTitle: p.seo_title,
    seoDescription: p.seo_description,
    isActive: p.is_active === 1,
    createdAt: new Date(p.created_at),
    updatedAt: new Date(p.updated_at),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedRevisions = data.revision.map((r: Record<string, any>) => ({
    id: IdMapper.getOrCreate('Revision', r.id),
    postId: IdMapper.get('Post', r.post_id),
    editorId: r.editor_id ? IdMapper.get('User', r.editor_id) : null,
    content: r.content, // HTML already transformed by DOM-based extractor
    title: r.title,
    excerpt: r.excerpt,
    changeNote: r.change_note,
    isActive: r.is_active === 1,
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedPages = data.page.map((pg: Record<string, any>) => ({
    id: IdMapper.getOrCreate('Page', pg.id),
    gamingCenterId: config.gamingCenterId,
    slug: pg.slug,
    fullPath: pg.slug,
    title: pg.title,
    content: pg.content, // HTML already transformed by DOM-based extractor
    status: (pg.status || 'DRAFT').toUpperCase(),
    publishedAt: pg.published_at ? new Date(pg.published_at) : null,
    seoTitle: pg.seo_title,
    seoDescription: pg.seo_description,
    isActive: pg.is_active === 1,
    createdAt: new Date(pg.created_at),
    updatedAt: new Date(pg.updated_at),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedPostTags = data.posttag.map((pt: Record<string, any>) => ({
    postId: IdMapper.get('Post', pt.post_id),
    tagId: IdMapper.get('Tag', pt.tag_id),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedPostMedia = data.postmedia.map((pm: Record<string, any>) => ({
    id: IdMapper.getOrCreate('PostMedia', pm.id),
    postId: IdMapper.get('Post', pm.post_id),
    mediaId: IdMapper.get('Media', pm.media_id),
    attachmentType: pm.attachment_type,
    isActive: pm.is_active === 1,
  }));

  return {
    posts: transformedPosts,
    revisions: transformedRevisions,
    pages: transformedPages,
    postTags: transformedPostTags,
    postMedia: transformedPostMedia
  };
}
