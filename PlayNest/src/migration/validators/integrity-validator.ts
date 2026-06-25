import { IdMapper } from '../utils/id-mapper';

export function validateIntegrity(data: any) {
  const issues: string[] = [];

  // 1. Foreign Key Consistency: Post -> Author
  const authorIds = new Set(data.authors.map((a: any) => a.userId));
  data.posts.forEach((p: any) => {
    if (!authorIds.has(p.authorId)) {
      issues.push(`Post ${p.id} references missing Author ${p.authorId}`);
    }
  });

  // 2. Foreign Key Consistency: Post -> Category
  const categoryIds = new Set(data.categories.map((c: any) => c.id));
  data.posts.forEach((p: any) => {
    if (p.categoryId && !categoryIds.has(p.categoryId)) {
      issues.push(`Post ${p.id} references missing Category ${p.categoryId}`);
    }
  });

  // 3. Comment Tree Integrity
  const commentIds = new Set(data.comments.map((c: any) => c.id));
  data.comments.forEach((c: any) => {
    if (c.parentId && !commentIds.has(c.parentId)) {
      issues.push(`Comment ${c.id} references missing parent Comment ${c.parentId}`);
    }
  });

  // 4. Slug Uniqueness
  const postSlugs = new Set();
  data.posts.forEach((p: any) => {
    if (postSlugs.has(p.slug)) {
      issues.push(`Duplicate post slug detected: ${p.slug}`);
    }
    postSlugs.add(p.slug);
  });

  return {
    isValid: issues.length === 0,
    issues
  };
}
