export type Category = 'Personalization' | 'Segmentation' | 'Merchandising' | 'Analytics' | 'Data and privacy';

export interface PostMeta {
  title: string;
  slug: string;
  date: string;
  category: Category;
  excerpt: string;
  readingTime: number;
  author: string;
  featured?: string;
}

export interface PostBody {
  html: string;
  headings: { id: string; text: string; level: number }[];
}

const metas = import.meta.glob<PostMeta>('../content/blog/*.md', { eager: true, import: 'meta' });
const bodies = import.meta.glob<PostBody>('../content/blog/*.md', { import: 'default' });

const pathBySlug = new Map<string, string>();
export const posts: PostMeta[] = Object.entries(metas)
  .map(([path, m]) => {
    pathBySlug.set(m.slug, path);
    return m;
  })
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));

export const categories = Array.from(new Set(posts.map((p) => p.category))).sort();

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);

export async function loadPostBody(slug: string): Promise<PostBody | null> {
  const path = pathBySlug.get(slug);
  if (!path) return null;
  return bodies[path]();
}

export function filterPosts(list: PostMeta[], category: string | null, query: string): PostMeta[] {
  const q = query.trim().toLowerCase();
  return list.filter((p) => {
    if (category && p.category !== category) return false;
    if (!q) return true;
    return `${p.title} ${p.excerpt} ${p.category}`.toLowerCase().includes(q);
  });
}

export function relatedPosts(slug: string, n = 3): PostMeta[] {
  const cur = getPost(slug);
  if (!cur) return [];
  const same = posts.filter((p) => p.slug !== slug && p.category === cur.category);
  const rest = posts.filter((p) => p.slug !== slug && p.category !== cur.category);
  return [...same, ...rest].slice(0, n);
}

export function neighbours(slug: string): { prev?: PostMeta; next?: PostMeta } {
  const i = posts.findIndex((p) => p.slug === slug);
  if (i < 0) return {};
  // posts are newest first: "previous" is older, "next" is newer
  return { prev: posts[i + 1], next: posts[i - 1] };
}

export const formatDate = (iso: string) => {
  const d = new Date(iso + 'T12:00:00Z');
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
};

export const categoryArt: Record<string, 'mug' | 'sneaker' | 'lamp' | 'tote' | 'plant' | 'notebook' | 'watch'> = {
  Personalization: 'lamp',
  Segmentation: 'tote',
  Merchandising: 'mug',
  Analytics: 'watch',
  'Data and privacy': 'notebook',
};
