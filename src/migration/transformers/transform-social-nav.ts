import { IdMapper } from '../utils/id-mapper';
import config from '../migration-config.json';

export function transformSocialNav(data: any) {
  const transformedComments = data.comment.map((c: any) => ({
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

  const transformedReactions = data.reaction.map((r: any) => ({
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

  const transformedMenus = data.menu.map((m: any) => ({
    id: IdMapper.getOrCreate('Menu', m.id),
    gamingCenterId: config.gamingCenterId,
    name: m.name,
    location: (m.location || 'HEADER').toUpperCase(),
    isActive: m.is_active === 1,
    createdAt: new Date(m.created_at),
    updatedAt: new Date(m.updated_at),
  }));

  const transformedMenuItems = data.menuitem.map((mi: any) => ({
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
  const map: any = {
    'approved': 'APPROVED',
    'pending': 'PENDING',
    'spam': 'REJECTED',
    'removed': 'DELETED'
  };
  return map[status] || 'PENDING';
}

function mapReactionType(type: string) {
  return 'LIKE';
}

function mapContentType(id: number) {
  return 'post';
}
