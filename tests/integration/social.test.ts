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
      (commentsRepository.countRecentByUser as any).mockResolvedValue(5);

      await expect(commentsStation.createComment(gamingCenterId, userId, {
        postId: 'post1',
        content: 'Hello'
      })).rejects.toThrow('Rate limit exceeded');
    });

    it('should throw error if duplicate comment is detected', async () => {
      (commentsRepository.countRecentByUser as any).mockResolvedValue(0);
      (commentsRepository.findDuplicate as any).mockResolvedValue({ id: 'c1' });

      await expect(commentsStation.createComment(gamingCenterId, userId, {
        postId: 'post1',
        content: 'Hello'
      })).rejects.toThrow('Duplicate comment detected');
    });
  });

  describe('Nesting', () => {
    it('should calculate depth and rootId correctly for replies', async () => {
      (commentsRepository.countRecentByUser as any).mockResolvedValue(0);
      (commentsRepository.findDuplicate as any).mockResolvedValue(null);
      (commentsRepository.findById as any).mockResolvedValue({
        id: 'parent1',
        depth: 0,
        rootId: null,
      });
      (commentsRepository.create as any).mockImplementation((data: any) => Promise.resolve({ id: 'child1', ...data }));

      const result = await commentsStation.createComment(gamingCenterId, userId, {
        postId: 'post1',
        content: 'Reply',
        parentId: 'parent1'
      });

      expect(result.depth).toBe(1);
      expect(result.rootId).toBe('parent1');
    });

    it('should throw error if max depth is exceeded', async () => {
      (commentsRepository.countRecentByUser as any).mockResolvedValue(0);
      (commentsRepository.findDuplicate as any).mockResolvedValue(null);
      (commentsRepository.findById as any).mockResolvedValue({
        id: 'parent9',
        depth: 10,
        rootId: 'root1',
      });

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
