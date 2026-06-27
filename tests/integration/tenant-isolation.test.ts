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
      jest.mocked(commentsRepository.countRecentByUser).mockResolvedValue(0);
      jest.mocked(commentsRepository.findDuplicate).mockResolvedValue(null);
      jest.mocked(commentsRepository.findById).mockImplementation((id: string, gcId: string) => {
        if (id === 'comment-b' && gcId === TENANT_A) return Promise.resolve(null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (id === 'comment-b' && gcId === TENANT_B) return Promise.resolve({ id: 'comment-b', gamingCenterId: TENANT_B, depth: 0 } as any);
        return Promise.resolve(null);
      });

      await expect(commentsStation.createComment(TENANT_A, USER_A, {
        postId: 'post-a',
        content: 'Illegal reply',
        parentId: 'comment-b'
      })).rejects.toThrow('Parent comment not found');
    });

    it('should not allow fetching comment tree of another tenant', async () => {
      jest.mocked(commentsRepository.findRootsPaginated).mockImplementation((gcId: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (gcId !== TENANT_A) return Promise.resolve({ data: [], meta: {} } as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return Promise.resolve({ data: [{ id: 'root-a' }], meta: {} } as any);
      });

      const result = await commentsStation.getCommentTree(TENANT_B, 'post-a', 1, 10);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('Reactions Tenant Isolation', () => {
    it('should ensure aggregates are filtered by tenant', async () => {
      jest.mocked(reactionsRepository.getAggregates).mockImplementation((gcId: string) => {
        if (gcId !== TENANT_A) return Promise.resolve({});
        return Promise.resolve({ LIKE: 10 });
      });

      const result = await reactionsStation.getAggregates(TENANT_B, 'post', 'post-a');
      expect(result).toEqual({});
    });
  });
});
