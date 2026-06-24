import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { commentsStation } from '../../src/modules/comments/comments.station';
import { commentsRepository } from '../../src/modules/comments/comments.repository';
import { reactionsStation } from '../../src/modules/reactions/reactions.station';
import { reactionsRepository } from '../../src/modules/reactions/reactions.repository';

jest.mock('../../src/modules/comments/comments.repository');
jest.mock('../../src/modules/reactions/reactions.repository');
jest.mock('../../src/modules/audit/audit.station');
jest.mock('../../src/common/events/event-emitter');

describe('Multi-Tenant Boundary Tests', () => {
  const TENANT_A = 'tenant-a';
  const TENANT_B = 'tenant-b';
  const USER_A = 'user-a';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Comments Tenant Isolation', () => {
    it('should not allow replying to a comment from another tenant', async () => {
      (commentsRepository.countRecentByUser as any).mockResolvedValue(0);
      (commentsRepository.findDuplicate as any).mockResolvedValue(null);
      (commentsRepository.findById as any).mockImplementation((id: string, gcId: string) => {
        if (id === 'comment-b' && gcId === TENANT_A) return Promise.resolve(null);
        if (id === 'comment-b' && gcId === TENANT_B) return Promise.resolve({ id: 'comment-b', gamingCenterId: TENANT_B, depth: 0 });
        return Promise.resolve(null);
      });

      await expect(commentsStation.createComment(TENANT_A, USER_A, {
        postId: 'post-a',
        content: 'Illegal reply',
        parentId: 'comment-b'
      })).rejects.toThrow('Parent comment not found');
    });

    it('should not allow fetching comment tree of another tenant', async () => {
      (commentsRepository.findRootsPaginated as any).mockImplementation((gcId: string) => {
        if (gcId !== TENANT_A) return Promise.resolve({ data: [], meta: {} });
        return Promise.resolve({ data: [{ id: 'root-a' }], meta: {} });
      });

      const result = await commentsStation.getCommentTree(TENANT_B, 'post-a', 1, 10);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('Reactions Tenant Isolation', () => {
    it('should ensure aggregates are filtered by tenant', async () => {
      (reactionsRepository.getAggregates as any).mockImplementation((gcId: string) => {
        if (gcId !== TENANT_A) return Promise.resolve({});
        return Promise.resolve({ LIKE: 10 });
      });

      const result = await reactionsStation.getAggregates(TENANT_B, 'post', 'post-a');
      expect(result).toEqual({});
    });
  });
});
