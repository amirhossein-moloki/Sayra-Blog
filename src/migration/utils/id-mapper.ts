import { createHash } from 'crypto';

export class IdMapper {
  /**
   * Generates a deterministic CUID-like string based on entity type and old ID.
   * This ensures idempotency across multiple migration runs.
   */
  static getDeterministicId(entityType: string, oldId: number | string): string {
    const hash = createHash('md5')
      .update(`${entityType}:${oldId}`)
      .digest('hex');

    // Convert MD5 to a 25-char string starting with 'c' to mimic CUID
    return 'c' + hash.substring(0, 24);
  }

  static getOrCreate(entityType: string, oldId: number): string {
    return this.getDeterministicId(entityType, oldId);
  }

  static get(entityType: string, oldId: number): string {
    return this.getDeterministicId(entityType, oldId);
  }
}
