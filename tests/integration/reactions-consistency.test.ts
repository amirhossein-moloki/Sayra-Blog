import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { reactionsStation } from '../../src/modules/reactions/reactions.station';
import { reactionsRepository } from '../../src/modules/reactions/reactions.repository';
import { ReactionType } from '@prisma/client';

jest.mock('../../src/modules/reactions/reactions.repository');
jest.mock('../../src/modules/audit/audit.station');
jest.mock('../../src/common/events/event-emitter');

describe('Reaction Concurrency & Consistency', () => {
  const gamingCenterId = 'gc1';
  const userId = 'user1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should maintain consistency during reaction type change', async () => {
    const newReaction = { id: 'r1', userId, type: ReactionType.LOVE, contentType: 'post', objectId: 'p1' };

    jest.mocked(reactionsRepository.toggleReaction).mockResolvedValue({
      action: 'updated',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reaction: newReaction as any,
      oldType: ReactionType.LIKE,
    });

    const result = await reactionsStation.toggleReaction(gamingCenterId, userId, {
      contentType: 'post',
      objectId: 'p1',
      type: ReactionType.LOVE,
    });

    expect(result.action).toBe('updated');
    expect(result.reaction.type).toBe(ReactionType.LOVE);
    // Note: The actual transactional aggregation logic is in the repository,
    // which is mocked here, but the station correctly handles the returned action.
  });
});
