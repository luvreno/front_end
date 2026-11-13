// Shared by the <Seo> component and scripts/postbuild.mjs (run by Node with type stripping).
// Keep this file free of non-erasable TypeScript (no enums) and import with .ts extensions.
import { site, company, isPlaceholder, realLinks, socialLinks, citationLinks } from '../content.ts';

export interface SeoInput {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  type?: 'website' | 'article';
  image?: string;
  published?: string;
  modified?: string;
  section?: string;
  jsonLd?: object[];
}

export const TITLE_MAX = 60;
export const DESC_MAX = 160;

export function canonical(path: string): string {
  const clean = ('/' + path.replace(/^\/+/, '')).replace(/[?#].*$/, '');
  if (clean === '/') return site.url + '/';
  return site.url + clean.replace(/\/+$/, '');
}

export function absolute(path: string): string {
  return /^https?:\/\//.test(path) ? path : site.url + (path.startsWith('/') ? path : '/' + path);
}

/** Makes a title of 60 characters or fewer. */
export function fitTitle(main: string, suffix = 'Luvreno'): string {
  const full = `${main} | ${suffix}`;
  if (main === suffix || main.startsWith(suffix + ' |')) return main.slice(0, TITLE_MAX);
  if (full.length <= TITLE_MAX) return full;
  if (main.length <= TITLE_MAX) return main;
  return main.slice(0, TITLE_MAX - 3).replace(/\s+\S*$/, '') + '...';
}

export function organizationJsonLd(): object {
  const org: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: site.url + '/',
    logo: site.url + '/icon-512.png',
  };
  if (!isPlaceholder(company.legalName)) org.legalName = company.legalName;
  if (!isPlaceholder(company.email)) org.email = company.email;
  if (!isPlaceholder(company.phone)) org.telephone = company.phone;
  if (!isPlaceholder(company.address)) org.address = company.address;
  const same = [...realLinks(socialLinks), ...realLinks(citationLinks)].map((l) => l.url);
  if (same.length) org.sameAs = same;
  return org;
}

export function websiteJsonLd(): object {
  return { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: site.url + '/', inLanguage: 'en' };
}

export function articleJsonLd(p: { title: string; description: string; path: string; published: string; modified?: string; section?: string }): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    description: p.description,
    mainEntityOfPage: canonical(p.path),
    datePublished: p.published,
    dateModified: p.modified || p.published,
    articleSection: p.section,
    inLanguage: 'en',
    image: absolute(site.ogImage),
    author: { '@type': 'Organization', name: 'Luvreno Team', url: site.url + '/' },
    publisher: { '@type': 'Organization', name: site.name, logo: { '@type': 'ImageObject', url: site.url + '/icon-512.png' } },
  };
}

export const staticRoutes: Record<string, SeoInput> = {
  '/': {
    title: 'Luvreno | Customer Personalization & Recommendation Engine',
    description: 'Help your customers discover products that genuinely match their interests. Luvreno brings customer insights, product information and recommendations together.',
    path: '/',
    jsonLd: [organizationJsonLd(), websiteJsonLd()],
  },
  '/product': {
    title: fitTitle('L.VIA by Luvreno: Relevant Product Discovery'),
    description: 'Explore L.VIA by Luvreno: customer profiles, product catalogs, segments and clear recommendations, with a roadmap toward GPU-trained models.',
    path: '/product',
  },
  '/blog': {
    title: fitTitle('Journal: Notes on Relevant Retail'),
    description: 'Practical articles on customer segments, recommendation rules, related and complementary products, metrics and handling customer data responsibly.',
    path: '/blog',
  },
  '/privacy': {
    title: fitTitle('Privacy Policy'),
    description: 'How Luvreno handles contact, newsletter and feedback data, cookie choices, reCAPTCHA, optional analytics and sandbox payment links.',
    path: '/privacy',
  },
  '/terms': {
    title: fitTitle('Terms and Conditions'),
    description: 'The terms for using the Luvreno website and dashboard: accounts, acceptable use, intellectual property, disclaimers and liability.',
    path: '/terms',
  },
  '/cookies': {
    title: fitTitle('Cookie Policy'),
    description: 'The cookie and storage categories Luvreno uses, what each one does, and how to change your choice at any time.',
    path: '/cookies',
  },
  '/checkout/success': {
    title: fitTitle('Sandbox Payment Received'),
    description: 'Sandbox test payment received. No real charge was made and no account was created.',
    path: '/checkout/success',
    noindex: true,
  },
  '/404': {
    title: fitTitle('Page Not Found'),
    description: 'This page could not be found. Return to the Luvreno home page, the product page or the journal.',
    path: '/404',
    noindex: true,
  },
};

export interface HeadTag { tag: 'title' | 'meta' | 'link' | 'script'; attrs: Record<string, string>; text?: string }

export function headTags(s: SeoInput): HeadTag[] {
  const url = canonical(s.path);
  const image = absolute(s.image || site.ogImage);
  const tags: HeadTag[] = [
    { tag: 'title', attrs: {}, text: s.title },
    { tag: 'meta', attrs: { name: 'description', content: s.description } },
    { tag: 'meta', attrs: { name: 'robots', content: s.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large' } },
    { tag: 'meta', attrs: { property: 'og:site_name', content: site.name } },
    { tag: 'meta', attrs: { property: 'og:locale', content: 'en_US' } },
    { tag: 'meta', attrs: { property: 'og:type', content: s.type || 'website' } },
    { tag: 'meta', attrs: { property: 'og:title', content: s.title } },
    { tag: 'meta', attrs: { property: 'og:description', content: s.description } },
    { tag: 'meta', attrs: { property: 'og:url', content: url } },
    { tag: 'meta', attrs: { property: 'og:image', content: image } },
    { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
    { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
    { tag: 'meta', attrs: { property: 'og:image:alt', content: 'Luvreno logo with the line Make every customer experience more personal' } },
    { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
    { tag: 'meta', attrs: { name: 'twitter:title', content: s.title } },
    { tag: 'meta', attrs: { name: 'twitter:description', content: s.description } },
    { tag: 'meta', attrs: { name: 'twitter:image', content: image } },
  ];
  if (!s.noindex) tags.push({ tag: 'link', attrs: { rel: 'canonical', href: url } });
  if (s.type === 'article') {
    if (s.published) tags.push({ tag: 'meta', attrs: { property: 'article:published_time', content: s.published } });
    tags.push({ tag: 'meta', attrs: { property: 'article:modified_time', content: s.modified || s.published || '' } });
    tags.push({ tag: 'meta', attrs: { property: 'article:author', content: 'Luvreno Team' } });
    if (s.section) tags.push({ tag: 'meta', attrs: { property: 'article:section', content: s.section } });
  }
  for (const j of s.jsonLd || []) tags.push({ tag: 'script', attrs: { type: 'application/ld+json' }, text: JSON.stringify(j) });
  return tags;
}

const escAttr = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escText = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function renderHeadHtml(s: SeoInput): string {
  return headTags(s)
    .map((t) => {
      const attrs = Object.entries({ ...t.attrs, 'data-seo': '' })
        .map(([k, v]) => (v === '' && k === 'data-seo' ? k : `${k}="${escAttr(v)}"`))
        .join(' ');
      if (t.tag === 'title') return `<title data-seo>${escText(t.text || '')}</title>`;
      if (t.tag === 'script') return `<script ${attrs}>${(t.text || '').replace(/</g, '\\u003c')}</script>`;
      return `<${t.tag} ${attrs}>`;
    })
    .join('\n    ');
}

export function postSeo(p: { title: string; slug: string; excerpt: string; date: string; category: string }): SeoInput {
  const path = `/blog/${p.slug}`;
  const journal = `${p.title} | Luvreno Journal`;
  return {
    title: journal.length <= TITLE_MAX ? journal : fitTitle(p.title),
    description: p.excerpt.slice(0, DESC_MAX),
    path,
    type: 'article',
    published: p.date,
    modified: p.date,
    section: p.category,
    jsonLd: [articleJsonLd({ title: p.title, description: p.excerpt, path, published: p.date, section: p.category })],
  };
}
