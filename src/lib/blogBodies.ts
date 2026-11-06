import type { PostBody, PostMeta } from './blog';

// Bundled with the post page chunk only, so the article renders without a layout shift.
const mods = import.meta.glob<{ meta: PostMeta; html: string; headings: PostBody['headings'] }>('../content/blog/*.md', { eager: true });

const bySlug = new Map<string, PostBody>(Object.values(mods).map((m) => [m.meta.slug, { html: m.html, headings: m.headings }]));

export const getPostBody = (slug: string): PostBody | undefined => bySlug.get(slug);
