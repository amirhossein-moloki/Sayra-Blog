/**
 * Extract media storage keys from HTML content <img> tags.
 * Assumes media URLs are in the format /uploads/path/to/media
 */
export const extractMediaKeysFromHtml = (html: string): string[] => {
  const mediaKeys: string[] = [];
  const imgTagRegex = /<img [^>]*src="([^"]+)"/g;
  let match;

  while ((match = imgTagRegex.exec(html)) !== null) {
    const url = match[1];
    // In our system, the storage key is the path after /uploads/
    if (url.includes('/uploads/')) {
      const parts = url.split('/uploads/');
      if (parts.length > 1) {
        mediaKeys.push(parts[1]);
      }
    }
  }

  return [...new Set(mediaKeys)]; // Return unique keys
};
