import { IdMapper } from '../utils/id-mapper';
import config from '../migration-config.json';

export function transformMediaTaxonomy(data: any) {
  const transformedMedia = data.media.map((m: any) => ({
    id: IdMapper.getOrCreate('Media', m.id),
    gamingCenterId: config.gamingCenterId,
    type: (m.type || 'IMAGE').toUpperCase(),
    url: m.url,
    storageKey: m.storage_key,
    mime: m.mime,
    width: m.width,
    height: m.height,
    sizeBytes: m.size_bytes,
    altText: m.alt_text,
    title: m.title,
    isActive: m.is_active === 1,
    uploadedById: m.uploaded_by_id ? IdMapper.get('User', m.uploaded_by_id) : null,
    createdAt: new Date(m.created_at),
    updatedAt: new Date(m.updated_at),
  }));

  const transformedCategories = data.category.map((c: any) => ({
    id: IdMapper.getOrCreate('Category', c.id),
    gamingCenterId: config.gamingCenterId,
    slug: c.slug,
    name: c.name,
    parentId: c.parent_id ? IdMapper.getOrCreate('Category', c.parent_id) : null,
    description: c.description,
    order: c.order,
    isActive: c.is_active === 1,
    createdAt: new Date(c.created_at),
    updatedAt: new Date(c.updated_at),
  }));

  const transformedTags = data.tag.map((t: any) => ({
    id: IdMapper.getOrCreate('Tag', t.id),
    gamingCenterId: config.gamingCenterId,
    slug: t.slug,
    name: t.name,
    description: t.description,
    isActive: t.is_active === 1,
    createdAt: new Date(t.created_at),
    updatedAt: new Date(t.updated_at),
  }));

  const transformedSeries = data.series.map((s: any) => ({
    id: IdMapper.getOrCreate('Series', s.id),
    gamingCenterId: config.gamingCenterId,
    slug: s.slug,
    title: s.title,
    description: s.description,
    orderStrategy: (s.order_strategy || 'MANUAL').toUpperCase(),
    isActive: s.is_active === 1,
    createdAt: new Date(s.created_at),
    updatedAt: new Date(s.updated_at),
  }));

  return { media: transformedMedia, categories: transformedCategories, tags: transformedTags, series: transformedSeries };
}
