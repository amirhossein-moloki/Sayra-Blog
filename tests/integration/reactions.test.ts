import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { reactionsStation } from '../../src/modules/reactions/reactions.station';
import { reactionsRepository } from '../../src/modules/reactions/reactions.repository';
import { ReactionType } from '@prisma/client';

jest.mock('../../src/modules/reactions/reactions.repository');
jest.mock('../../src/modules/audit/audit.station');
jest.mock('../../src/common/events/event-emitter');

describe('Reactions Module - Social Layer', () => {
  const gamingCenterId = 'gc1';
  const userId = 'user1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Reaction Rules', () => {
    it('should toggle a new reaction', async () => {
      const reaction = { id: 'r1', userId, type: ReactionType.LIKE, contentType: 'post', objectId: 'p1' };
      (reactionsRepository.toggleReaction as any).mockResolvedValue({
        action: 'created',
        reaction,
      });

      const result = await reactionsStation.toggleReaction(gamingCenterId, userId, {
        contentType: 'post',
        objectId: 'p1',
        type: ReactionType.LIKE,
      });

      expect(result.action).toBe('created');
      expect(result.reaction.type).toBe(ReactionType.LIKE);
    });

    it('should change an existing reaction type', async () => {
      const reaction = { id: 'r1', userId, type: ReactionType.LOVE, contentType: 'post', objectId: 'p1' };
      (reactionsRepository.toggleReaction as any).mockResolvedValue({
        action: 'updated',
        reaction,
        oldType: ReactionType.LIKE,
      });

      const result = await reactionsStation.toggleReaction(gamingCenterId, userId, {
        contentType: 'post',
        objectId: 'p1',
        type: ReactionType.LOVE,
      });

      expect(result.action).toBe('updated');
      expect(result.reaction.type).toBe(ReactionType.LOVE);
    });

    it('should remove a reaction when same type is toggled', async () => {
      const reaction = { id: 'r1', userId, type: ReactionType.LIKE, contentType: 'post', objectId: 'p1' };
      (reactionsRepository.toggleReaction as any).mockResolvedValue({
        action: 'removed',
        reaction,
      });

      const result = await reactionsStation.toggleReaction(gamingCenterId, userId, {
        contentType: 'post',
        objectId: 'p1',
        type: ReactionType.LIKE,
      });

      expect(result.action).toBe('removed');
    });
  });
});
