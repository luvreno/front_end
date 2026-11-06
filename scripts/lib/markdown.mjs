// Shared by the Vite plugin (build-time Markdown) and the post-build scripts.
import { Marked } from 'marked';

const REQUIRED = ['title', 'slug', 'date', 'category', 'excerpt', 'readingTime', 'author'];

/** Minimal front matter parser: `key: value` lines between --- fences. */
export function parseFrontMatter(src) {
  const text = src.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
  if (!m) throw new Error('Missing front matter');
  const meta = {};
  for (const line of m[1].split('\n')) {
    if (!line.trim()) continue;
    const i = line.indexOf(':');
    if (i < 1) throw new Error(`Bad front matter line: ${line}`);
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if (/^(['"]).*\1$/.test(val)) val = val.slice(1, -1);
    meta[key] = val;
  }
  return { meta, body: m[2] };
}

export function validateMeta(meta, file = '') {
  const errors = [];
  for (const k of REQUIRED) if (!meta[k]) errors.push(`${file}: missing "${k}"`);
  if (meta.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.slug)) errors.push(`${file}: slug must be kebab-case`);
  if (meta.date && !/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) errors.push(`${file}: date must be YYYY-MM-DD`);
  if (meta.readingTime && !/^\d+$/.test(String(meta.readingTime))) errors.push(`${file}: readingTime must be minutes`);
  if (meta.title && meta.title.length > 90) errors.push(`${file}: title too long`);
  if (meta.excerpt && meta.excerpt.length > 160) errors.push(`${file}: excerpt over 160 characters`);
  if (meta.author && meta.author !== 'Luvreno Team') errors.push(`${file}: author must be Luvreno Team`);
  return errors;
}

export const slugify = (s) =>
  s.toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Renders Markdown to HTML with accessible heading anchors, returns headings for the TOC. */
export function renderMarkdown(body) {
  const headings = [];
  const used = new Set();
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const plain = text.replace(/<[^>]+>/g, '');
        let id = slugify(plain) || 'section';
        while (used.has(id)) id += '-x';
        used.add(id);
        const level = Math.min(Math.max(depth, 2), 4);
        if (level <= 3) headings.push({ id, text: plain, level });
        return `<h${level} id="${id}" class="md-h">${text}<a class="h-anchor" href="#${id}" aria-label="Link to section ${esc(plain)}">#</a></h${level}>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const ext = /^https?:\/\//.test(href);
        const t = title ? ` title="${esc(title)}"` : '';
        return ext
          ? `<a href="${esc(href)}"${t} target="_blank" rel="noopener noreferrer">${text}</a>`
          : `<a href="${esc(href)}"${t}>${text}</a>`;
      },
    },
  });
  const html = marked.parse(body, { async: false });
  return { html, headings };
}

export function wordCount(body) {
  return body.replace(/[#>*_`[\]()-]/g, ' ').split(/\s+/).filter(Boolean).length;
}
