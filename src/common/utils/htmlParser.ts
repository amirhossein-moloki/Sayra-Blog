import { env } from '../../config/env';

/**
 * Extract media storage keys from HTML content <img> tags.
 * Assumes media URLs are in the format /uploads/path/to/media or /media/path/to/media
 */
export const extractMediaKeysFromHtml = (html: string): string[] => {
  const mediaKeys: string[] = [];
  const imgTagRegex = /<img [^>]*src="([^"]+)"/g;
  let match;

  // Normalize public path to have trailing slash if it doesn't
  const publicPath = env?.MEDIA_LOCAL_PUBLIC_PATH
    ? (env.MEDIA_LOCAL_PUBLIC_PATH.endsWith('/')
      ? env.MEDIA_LOCAL_PUBLIC_PATH
      : `${env.MEDIA_LOCAL_PUBLIC_PATH}/`)
    : '/media/';

  while ((match = imgTagRegex.exec(html)) !== null) {
    const url = match[1];
    // In our system, the storage key is the path after /uploads/ or /media/
    if (url.includes('/uploads/')) {
      const parts = url.split('/uploads/');
      if (parts.length > 1) {
        mediaKeys.push(parts[1]);
      }
    } else if (url.includes(publicPath)) {
      const parts = url.split(publicPath);
      if (parts.length > 1) {
        mediaKeys.push(parts[1]);
      }
    } else if (url.includes('/media/')) {
      const parts = url.split('/media/');
      if (parts.length > 1) {
        mediaKeys.push(parts[1]);
      }
    }
  }

  return [...new Set(mediaKeys)]; // Return unique keys
};
