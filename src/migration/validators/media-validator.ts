// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateMediaIntegrity(data: any) {
  const issues: string[] = [];

  // 1. Missing References in PostMedia
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mediaIds = new Set(data.media.map((m: any) => m.id));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data.postMedia.forEach((pm: any) => {
    if (!mediaIds.has(pm.mediaId)) {
      issues.push(`PostMedia ${pm.id} references missing Media ${pm.mediaId}`);
    }
  });

  // 2. Duplicate Media Hashes (Simulated check)
  const storageKeys = new Set();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data.media.forEach((m: any) => {
    if (storageKeys.has(m.storageKey)) {
      // Warning only, as multiple DB records can point to same file
      // but often indicates redundancy
    }
    storageKeys.add(m.storageKey);
  });

  return {
    isValid: issues.length === 0,
    issues
  };
}
