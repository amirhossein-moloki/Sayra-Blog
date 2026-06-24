import { describe, it, expect } from '@jest/globals';
import { postsStation } from '../../src/modules/posts/posts.station';
import { PageStatus } from '@prisma/client';
import AppError from '../../src/common/errors/AppError';

describe('Posts Module', () => {
  describe('State Transitions', () => {
    it('should allow valid transitions', () => {
      expect(() => postsStation.validateStateTransition(PageStatus.DRAFT, PageStatus.PUBLISHED)).not.toThrow();
      expect(() => postsStation.validateStateTransition(PageStatus.PUBLISHED, PageStatus.ARCHIVED)).not.toThrow();
      expect(() => postsStation.validateStateTransition(PageStatus.ARCHIVED, PageStatus.DRAFT)).not.toThrow();
    });

    it('should throw error for invalid transitions', () => {
      expect(() => postsStation.validateStateTransition(PageStatus.PUBLISHED, PageStatus.SCHEDULED))
        .toThrow(AppError);
    });
  });
});
