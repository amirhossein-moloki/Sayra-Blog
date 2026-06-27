import { IdMapper } from '../utils/id-mapper';
import config from '../migration-config.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformSocialNav(data: Record<string, any[]>) {
  // Using Record<string, any> for raw migration data as it's from a legacy source with inconsistent schema
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedComments = data.comment.map((c: Record<string, any>) => ({
    id: IdMapper.getOrCreate('Comment', c.id),
    gamingCenterId: config.gamingCenterId,
    postId: IdMapper.get('Post', c.post_id),
    userId: IdMapper.get('User', c.user_id),
    parentId: c.parent_id ? IdMapper.getOrCreate('Comment', c.parent_id) : null,
    content: c.content,
    status: mapCommentStatus(c.status),
    ip: c.ip,
    userAgent: c.user_agent,
    isActive: c.is_active === 1,
    createdAt: new Date(c.created_at),
    updatedAt: new Date(c.updated_at),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedReactions = data.reaction.map((r: Record<string, any>) => ({
    id: IdMapper.getOrCreate('Reaction', r.id),
    gamingCenterId: config.gamingCenterId,
    userId: IdMapper.get('User', r.user_id),
    type: mapReactionType(r.reaction),
    contentType: mapContentType(r.content_type_id),
    objectId: r.object_id.toString(),
    isActive: r.is_active === 1,
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedMenus = data.menu.map((m: Record<string, any>) => ({
    id: IdMapper.getOrCreate('Menu', m.id),
    gamingCenterId: config.gamingCenterId,
    name: m.name,
    location: (m.location || 'HEADER').toUpperCase(),
    isActive: m.is_active === 1,
    createdAt: new Date(m.created_at),
    updatedAt: new Date(m.updated_at),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedMenuItems = data.menuitem.map((mi: Record<string, any>) => ({
    id: IdMapper.getOrCreate('MenuItem', mi.id),
    menuId: IdMapper.get('Menu', mi.menu_id),
    parentId: mi.parent_id ? IdMapper.getOrCreate('MenuItem', mi.parent_id) : null,
    label: mi.label,
    url: mi.url,
    order: mi.order,
    targetBlank: mi.target_blank === 1,
    isActive: mi.is_active === 1,
    createdAt: new Date(mi.created_at),
    updatedAt: new Date(mi.updated_at),
  }));

  return {
    comments: transformedComments,
    reactions: transformedReactions,
    menus: transformedMenus,
    menuItems: transformedMenuItems
  };
}

function mapCommentStatus(status: string) {
  const map: Record<string, string> = {
    'approved': 'APPROVED',
    'pending': 'PENDING',
    'spam': 'REJECTED',
    'removed': 'DELETED'
  };
  return map[status] || 'PENDING';
}

function mapReactionType() {
  return 'LIKE';
}

function mapContentType() {
  return 'post';
}
