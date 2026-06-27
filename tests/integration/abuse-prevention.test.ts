import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { commentsStation } from '../../src/modules/comments/comments.station';
import { commentsRepository } from '../../src/modules/comments/comments.repository';

jest.mock('../../src/modules/comments/comments.repository');
jest.mock('../../src/modules/audit/audit.station');
jest.mock('../../src/common/events/event-emitter');

describe('Enhanced Abuse Prevention', () => {
  const gamingCenterId = 'gc1';
  const userId = 'user1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should detect duplicate comment with whitespace and case variations', async () => {
    jest.mocked(commentsRepository.countRecentByUser).mockResolvedValue(0);
    jest.mocked(commentsRepository.findDuplicate).mockImplementation((_uid, _pid, content) => {
      if (content === 'hello world') return Promise.resolve({ id: 'existing' });
      return Promise.resolve(null);
    });

    await expect(commentsStation.createComment(gamingCenterId, userId, {
      postId: 'post1',
      content: '  HELLO   world  '
    })).rejects.toThrow('Duplicate comment detected');
  });
});
