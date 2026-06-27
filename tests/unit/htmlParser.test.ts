import { describe, it, expect } from '@jest/globals';
import { extractMediaKeysFromHtml } from '../../src/common/utils/htmlParser';

describe('htmlParser', () => {
  describe('extractMediaKeysFromHtml', () => {
    it('should extract media keys from img tags', () => {
      const html = `
        <p>Hello world</p>
        <img src="/uploads/gamingCenters/clxyz123/media/original/uuid1.jpg" alt="test">
        <img src="/uploads/gamingCenters/clxyz123/media/original/uuid2.png">
        <p>Some more text</p>
        <img src="https://external.com/image.jpg">
      `;
      const keys = extractMediaKeysFromHtml(html);
      expect(keys).toEqual([
        'gamingCenters/clxyz123/media/original/uuid1.jpg',
        'gamingCenters/clxyz123/media/original/uuid2.png'
      ]);
    });

    it('should return empty array if no matches found', () => {
      const html = '<p>No images here</p>';
      const keys = extractMediaKeysFromHtml(html);
      expect(keys).toEqual([]);
    });

    it('should handle duplicate images and return unique keys', () => {
      const html = `
        <img src="/uploads/img1.jpg">
        <img src="/uploads/img1.jpg">
      `;
      const keys = extractMediaKeysFromHtml(html);
      expect(keys).toEqual(['img1.jpg']);
    });
  });
});
