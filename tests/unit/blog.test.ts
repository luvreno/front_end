import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseFrontMatter, validateMeta, wordCount, renderMarkdown } from '../../scripts/lib/markdown.mjs';
import { filterPosts, type PostMeta } from '../../src/lib/blog';

const dir = path.resolve(__dirname, '../../src/content/blog');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
const parsed = files.map((f) => ({ f, ...parseFrontMatter(fs.readFileSync(path.join(dir, f), 'utf8')) }));

describe('blog front matter', () => {
  it('has exactly six posts', () => {
    expect(files).toHaveLength(6);
  });

  it.each(parsed)('$f has valid front matter', ({ f, meta }) => {
    expect(validateMeta(meta, f)).toEqual([]);
    expect(meta.author).toBe('Luvreno Team');
    expect(`${meta.slug}.md`).toBe(f);
  });

  it.each(parsed)('$f is 700 to 1000 words', ({ body }) => {
    const n = wordCount(body);
    expect(n).toBeGreaterThanOrEqual(700);
    expect(n).toBeLessThanOrEqual(1000);
  });

  it.each(parsed)('$f has no em dashes, statistics or named studies', ({ meta, body }) => {
    const all = JSON.stringify(meta) + body;
    expect(all).not.toMatch(/—/);
    expect(body).not.toMatch(/\d+(\.\d+)?\s?%|percent\b/i);
    expect(body).not.toMatch(/\b(study|survey|research) (by|from|shows|found)\b/i);
  });

  it('slugs and dates are unique', () => {
    expect(new Set(parsed.map((p) => p.meta.slug)).size).toBe(parsed.length);
  });

  it('rejects broken front matter', () => {
    expect(() => parseFrontMatter('no fences here')).toThrow();
    expect(validateMeta({ title: 'x', slug: 'Bad Slug', date: '2026/01/01', category: 'A', excerpt: 'e', readingTime: 'five', author: 'Someone' })).toHaveLength(4);
  });

  it('renders headings with anchors and a TOC', () => {
    const { html, headings } = renderMarkdown('## First part\n\ntext\n\n### Sub part\n\n## First part');
    expect(headings.map((h) => h.id)).toEqual(['first-part', 'sub-part', 'first-part-x']);
    expect(html).toContain('<h2 id="first-part"');
    expect(html).toContain('href="#first-part"');
  });

  it('external links open safely', () => {
    expect(renderMarkdown('[a](https://example.com)').html).toContain('rel="noopener noreferrer"');
  });
});

describe('blog filtering', () => {
  const list = parsed.map((p) => ({ ...p.meta, readingTime: Number(p.meta.readingTime) }) as unknown as PostMeta);
  it('filters by category and query', () => {
    expect(filterPosts(list, 'Merchandising', '')).toHaveLength(2);
    expect(filterPosts(list, null, 'segments').length).toBeGreaterThan(0);
    expect(filterPosts(list, 'Analytics', 'segments')).toHaveLength(0);
    expect(filterPosts(list, null, '')).toHaveLength(6);
  });
});
