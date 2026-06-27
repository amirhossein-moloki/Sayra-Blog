import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { commentsStation } from '../../src/modules/comments/comments.station';
import { commentsRepository } from '../../src/modules/comments/comments.repository';

jest.mock('../../src/modules/comments/comments.repository');
jest.mock('../../src/modules/audit/audit.station');
jest.mock('../../src/common/events/event-emitter');

describe('Comments Module - Social Layer', () => {
  const gamingCenterId = 'gc1';
  const userId = 'user1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Anti-Abuse', () => {
    it('should throw error if rate limit is exceeded', async () => {
      jest.mocked(commentsRepository.countRecentByUser).mockResolvedValue(5);

      await expect(commentsStation.createComment(gamingCenterId, userId, {
        postId: 'post1',
        content: 'Hello'
      })).rejects.toThrow('Rate limit exceeded');
    });

    it('should throw error if duplicate comment is detected', async () => {
      jest.mocked(commentsRepository.countRecentByUser).mockResolvedValue(0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.mocked(commentsRepository.findDuplicate).mockResolvedValue({ id: 'c1' } as any);

      await expect(commentsStation.createComment(gamingCenterId, userId, {
        postId: 'post1',
        content: 'Hello'
      })).rejects.toThrow('Duplicate comment detected');
    });
  });

  describe('Nesting', () => {
    it('should calculate depth and rootId correctly for replies', async () => {
      jest.mocked(commentsRepository.countRecentByUser).mockResolvedValue(0);
      jest.mocked(commentsRepository.findDuplicate).mockResolvedValue(null);
      /* eslint-disable @typescript-eslint/no-explicit-any */
      jest.mocked(commentsRepository.findById).mockResolvedValue({
        id: 'parent1',
        depth: 0,
        rootId: null,
      } as any);
      jest.mocked(commentsRepository.create).mockImplementation((data: any) => Promise.resolve({ id: 'child1', ...data } as any));

      const result = await commentsStation.createComment(gamingCenterId, userId, {
        postId: 'post1',
        content: 'Reply',
        parentId: 'parent1'
      });

      expect(result.depth).toBe(1);
      expect(result.rootId).toBe('parent1');
    });

    it('should throw error if max depth is exceeded', async () => {
      jest.mocked(commentsRepository.countRecentByUser).mockResolvedValue(0);
      jest.mocked(commentsRepository.findDuplicate).mockResolvedValue(null);
      jest.mocked(commentsRepository.findById).mockResolvedValue({
        id: 'parent9',
        depth: 10,
        rootId: 'root1',
      } as any);
      /* eslint-enable @typescript-eslint/no-explicit-any */

      await expect(commentsStation.createComment(gamingCenterId, userId, {
        postId: 'post1',
        content: 'Too deep',
        parentId: 'parent9'
      })).rejects.toThrow('Maximum comment depth of 10 reached.');
    });
  });

  describe('Tree Building', () => {
    it('should build a nested tree structure', () => {
      const root = { id: 'r1', content: 'root', parentId: null };
      const descendants = [
        { id: 'c1', content: 'child 1', parentId: 'r1' },
        { id: 'c2', content: 'child 2', parentId: 'c1' },
      ];

      const tree = commentsStation.buildTree(root, descendants);

      expect(tree.id).toBe('r1');
      expect(tree.replies).toHaveLength(1);
      expect(tree.replies![0].id).toBe('c1');
      expect(tree.replies![0].replies).toHaveLength(1);
      expect(tree.replies![0].replies![0].id).toBe('c2');
    });
  });
});
