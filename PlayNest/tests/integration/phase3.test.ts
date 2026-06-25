import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { pagesStation } from '../../src/modules/pages/pages.station';
import { pagesRepository } from '../../src/modules/pages/pages.repository';
import { navigationStation } from '../../src/modules/navigation/navigation.station';
import { navigationRepository } from '../../src/modules/navigation/navigation.repository';
import { prisma } from '../../src/config/prisma';
import { PageStatus, MenuLocation, UserRole, MenuItemTargetType, NavigationVisibilityRule } from '@prisma/client';

jest.mock('../../src/modules/pages/pages.repository');
jest.mock('../../src/modules/navigation/navigation.repository');
jest.mock('../../src/modules/audit/audit.station');
jest.mock('../../src/common/events/event-emitter');
jest.mock('../../src/config/prisma', () => ({
  prisma: {
    page: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    menu: {
      findUnique: jest.fn(),
    }
  }
}));

describe('Phase 3 - Structural CMS Integration Tests (Mocked)', () => {
  const gamingCenterId = 'gc-1';
  const actor = { id: 'user-1', actorType: 'USER' as any };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Pages Hierarchy', () => {
    it('should create a hierarchical page structure and compute fullPath', async () => {
      const parent = { id: 'parent-1', fullPath: 'about', depth: 0, slug: 'about' };
      (pagesRepository.findPageByFullPath as any).mockResolvedValue(null);
      (prisma.page.findUnique as any).mockResolvedValue(parent);
      (pagesRepository.createPage as any).mockImplementation((data: any, fullPath: string, depth: number) => ({
        ...data,
        id: 'child-1',
        fullPath,
        depth
      }));

      const child = await pagesStation.createPage(
        { gamingCenterId, slug: 'team', title: 'Our Team', parentId: 'parent-1' },
        actor
      );

      expect(child.fullPath).toBe('about/team');
      expect(child.depth).toBe(1);
    });

    it('should prevent circular references', async () => {
       (pagesRepository.findPageById as any).mockResolvedValue({ id: 'page-1', fullPath: 'page-1', slug: 'page-1', parentId: null, depth: 0 });

       await expect(pagesStation.updatePage('page-1', gamingCenterId, { parentId: 'page-1' }, actor))
         .rejects.toThrow('A page cannot be its own parent');
    });

    it('should prevent moving a page under its descendant', async () => {
       (pagesRepository.findPageById as any).mockResolvedValue({ id: 'parent-1', fullPath: 'parent', slug: 'parent' });
       (pagesRepository.findChildren as any).mockImplementation((id: string) => {
         if (id === 'parent-1') return Promise.resolve([{ id: 'child-1' }]);
         if (id === 'child-1') return Promise.resolve([]);
         return Promise.resolve([]);
       });

       await expect(pagesStation.updatePage('parent-1', gamingCenterId, { parentId: 'child-1' }, actor))
         .rejects.toThrow('A page cannot be moved under its own descendant');
    });
  });

  describe('Navigation & Visibility', () => {
    it('should build a menu tree and apply visibility rules', async () => {
      const mockItems = [
        { id: '1', label: 'Public', url: '/', visibility: NavigationVisibilityRule.PUBLIC, parentId: null, order: 1 },
        { id: '2', label: 'Admin', url: '/admin', visibility: NavigationVisibilityRule.ADMIN, parentId: null, order: 2 }
      ];

      (navigationRepository.findMenuByLocation as any).mockResolvedValue({
        id: 'menu-1',
        items: mockItems
      });

      const publicTree = await navigationStation.getMenuTree(MenuLocation.HEADER, gamingCenterId);
      expect(publicTree?.items).toHaveLength(1);
      expect(publicTree?.items[0].label).toBe('Public');

      const adminTree = await navigationStation.getMenuTree(MenuLocation.HEADER, gamingCenterId, { role: UserRole.ADMIN });
      expect(adminTree?.items).toHaveLength(2);
    });
  });
});
