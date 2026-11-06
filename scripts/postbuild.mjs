// Post-build: per-route static HTML with the correct head, font preloads,
// sitemap.xml, rss.xml and robots.txt. Runs after `vite build`.
import fs from 'node:fs';
import path from 'node:path';
import { loadEnv } from './lib/env.mjs';
import { parseFrontMatter, validateMeta } from './lib/markdown.mjs';

const root = path.resolve(import.meta.dirname, '..');
loadEnv(root);
const dist = path.join(root, 'dist');
const { staticRoutes, postSeo, renderHeadHtml, canonical } = await import('../src/lib/seoData.ts');
const { site } = await import('../src/content.ts');

const fail = (msg) => {
  console.error(`postbuild: ${msg}`);
  process.exit(1);
};
if (!fs.existsSync(path.join(dist, 'index.html'))) fail('dist/index.html missing, run vite build first');

const buildDate = new Date().toISOString().slice(0, 10);
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

/* ---------- font preloads: the two critical files ---------- */
const assets = fs.readdirSync(path.join(dist, 'assets'));
const critical = ['fraunces-latin-600-normal', 'figtree-latin-400-normal'].map((name) => {
  const f = assets.find((a) => a.startsWith(name) && a.endsWith('.woff2'));
  if (!f) fail(`critical font ${name} not found in dist/assets`);
  return `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin>`;
});

/* ---------- blog posts ---------- */
const blogDir = path.join(root, 'src', 'content', 'blog');
const posts = fs
  .readdirSync(blogDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const { meta } = parseFrontMatter(fs.readFileSync(path.join(blogDir, f), 'utf8'));
    const errs = validateMeta(meta, f);
    if (errs.length) fail(errs.join('\n'));
    return meta;
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1));

/* ---------- per-route HTML ---------- */
function page(seo) {
  if (!template.includes('<!--seo-->')) fail('index.html is missing the <!--seo--> marker');
  return template.replace('<!--seo-->', renderHeadHtml(seo)).replace('<!--preload-->', critical.join('\n    '));
}
const outputs = [
  ['index.html', staticRoutes['/']],
  ['product.html', staticRoutes['/product']],
  ['blog.html', staticRoutes['/blog']],
  ['privacy.html', staticRoutes['/privacy']],
  ['terms.html', staticRoutes['/terms']],
  ['cookies.html', staticRoutes['/cookies']],
  ['checkout/success.html', staticRoutes['/checkout/success']],
  ['404.html', staticRoutes['/404']],
  ...posts.map((p) => [`blog/${p.slug}.html`, postSeo(p)]),
];
for (const [file, seo] of outputs) {
  const out = path.join(dist, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, page(seo));
}

/* ---------- sitemap.xml (canonical, indexable URLs only) ---------- */
const urls = [
  { loc: canonical('/'), lastmod: buildDate, priority: '1.0' },
  { loc: canonical('/product'), lastmod: buildDate, priority: '0.9' },
  { loc: canonical('/blog'), lastmod: posts[0]?.date || buildDate, priority: '0.8' },
  ...posts.map((p) => ({ loc: canonical(`/blog/${p.slug}`), lastmod: p.date, priority: '0.7' })),
  { loc: canonical('/privacy'), lastmod: buildDate, priority: '0.3' },
  { loc: canonical('/terms'), lastmod: buildDate, priority: '0.3' },
  { loc: canonical('/cookies'), lastmod: buildDate, priority: '0.3' },
];
const xmlEsc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
fs.writeFileSync(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${xmlEsc(u.loc)}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority></url>`)
    .join('\n')}\n</urlset>\n`,
);

/* ---------- rss.xml ---------- */
const rfc822 = (d) => new Date(d + 'T09:00:00Z').toUTCString();
fs.writeFileSync(
  path.join(dist, 'rss.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Luvreno Journal</title>
    <link>${site.url}/blog</link>
    <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>Practical notes on customer profiles, segments, recommendation rules and reports.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${posts
  .map(
    (p) => `    <item>
      <title>${xmlEsc(p.title)}</title>
      <link>${canonical(`/blog/${p.slug}`)}</link>
      <guid isPermaLink="true">${canonical(`/blog/${p.slug}`)}</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
      <category>${xmlEsc(p.category)}</category>
      <dc:creator>Luvreno Team</dc:creator>
      <description>${xmlEsc(p.excerpt)}</description>
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>
`,
);

/* ---------- robots.txt ---------- */
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /checkout/\n\nSitemap: ${site.url}/sitemap.xml\n`);

console.log(`postbuild: ${outputs.length} HTML files, sitemap (${urls.length} URLs), rss (${posts.length} posts), robots.txt`);
