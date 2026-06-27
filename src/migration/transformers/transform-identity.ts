import { IdMapper } from '../utils/id-mapper';
import config from '../migration-config.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformIdentity(data: Record<string, any[]>) {
  // Using Record<string, any> for raw migration data from legacy source
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedUsers = data.user.map((user: Record<string, any>) => ({
    id: IdMapper.getOrCreate('User', user.id),
    gamingCenterId: config.gamingCenterId,
    username: user.username,
    email: user.email,
    passwordHash: user.password,
    fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
    phone: user.phone_number || '0000000000',
    role: user.is_superuser ? 'ADMIN' : (user.is_staff ? 'STAFF' : 'STAFF'),
    isActive: user.is_active === 1,
    createdAt: new Date(user.date_joined),
    updatedAt: new Date(),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedAuthors = data.authorprofile.map((author: Record<string, any>) => ({
    userId: IdMapper.get('User', author.user_id),
    displayName: author.display_name,
    bio: author.bio,
    avatarId: author.avatar_id ? IdMapper.getOrCreate('Media', author.avatar_id) : null,
    isActive: author.is_active === 1,
    createdAt: new Date(author.created_at),
    updatedAt: new Date(author.updated_at),
  }));

  return { users: transformedUsers, authors: transformedAuthors };
}
