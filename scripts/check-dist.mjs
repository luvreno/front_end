// Verifies dist/ is complete and every generated HTML head is valid.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const errors = [];
const warn = [];
const exists = (f) => fs.existsSync(path.join(dist, f)) && fs.statSync(path.join(dist, f)).size > 0;

const required = [
  'index.html', 'product.html', 'blog.html', 'privacy.html', 'terms.html', 'cookies.html', '404.html', 'checkout/success.html',
  'robots.txt', 'sitemap.xml', 'rss.xml', '.htaccess',
  'favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'site.webmanifest', 'og-image.png',
  'logo-light.svg', 'logo-dark.svg',
  'api/contact.php', 'api/testimonials.php', 'api/testimonials-admin.php', 'api/lib.php', 'api/config.example.php', 'api/.htaccess', 'api/data/.htaccess',
];
for (const f of required) if (!exists(f)) errors.push(`missing dist/${f}`);
if (fs.existsSync(path.join(dist, 'api', 'config.php'))) warn.push('dist/api/config.php exists (contains secrets): make sure you mean to upload it');

const decode = (v) => v.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));
const htmlFiles = walk(dist).filter((f) => f.endsWith('.html'));
const sitemap = exists('sitemap.xml') ? fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8') : '';

for (const file of htmlFiles) {
  const rel = path.relative(dist, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');
  const head = html.split('</head>')[0];
  const titles = [...head.matchAll(/<title[^>]*>([^<]*)<\/title>/g)];
  const descs = [...head.matchAll(/<meta name="description" content="([^"]*)"/g)];
  const canon = [...head.matchAll(/<link rel="canonical" href="([^"]*)"/g)];
  const noindex = /<meta name="robots" content="noindex/.test(head);
  if (titles.length !== 1) errors.push(`${rel}: ${titles.length} <title> tags`);
  else if (decode(titles[0][1]).length > 60) errors.push(`${rel}: title over 60 characters (${titles[0][1].length})`);
  if (descs.length !== 1) errors.push(`${rel}: ${descs.length} meta descriptions`);
  else if (decode(descs[0][1]).length > 160) errors.push(`${rel}: description over 160 characters`);
  if (!noindex) {
    if (canon.length !== 1) errors.push(`${rel}: expected exactly one canonical, found ${canon.length}`);
    else {
      const href = canon[0][1];
      if (!/^https:\/\//.test(href)) errors.push(`${rel}: canonical not absolute`);
      if (href.endsWith('/') && rel !== 'index.html') errors.push(`${rel}: canonical has a trailing slash`);
      if (!sitemap.includes(`<loc>${href}</loc>`)) errors.push(`${rel}: canonical ${href} not in sitemap`);
    }
  } else if (canon.length) {
    errors.push(`${rel}: noindex page should not declare a canonical`);
  }
  if (!/<html lang="en"/.test(html)) errors.push(`${rel}: missing lang="en"`);
  if (!/name="viewport"/.test(head)) errors.push(`${rel}: missing viewport`);
  if (!/property="og:image" content="https:\/\/[^"]+og-image\.png"/.test(head)) errors.push(`${rel}: missing absolute og:image`);
  if (!/rel="preload"[^>]+as="font"/.test(head)) errors.push(`${rel}: missing font preload`);
  if (/fonts\.googleapis|fonts\.gstatic/.test(html)) errors.push(`${rel}: Google Fonts request found`);
}
if (/checkout|404/.test(sitemap)) errors.push('sitemap contains a noindex URL');

const robots = exists('robots.txt') ? fs.readFileSync(path.join(dist, 'robots.txt'), 'utf8') : '';
for (const line of ['Disallow: /api/', 'Disallow: /checkout/', 'Sitemap: https://']) if (!robots.includes(line)) errors.push(`robots.txt missing "${line}"`);

// CSP in .htaccess must allow the exact inline script shipped in the HTML
if (exists('.htaccess') && exists('index.html')) {
  const { createHash } = await import('node:crypto');
  const idx = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const ht = fs.readFileSync(path.join(dist, '.htaccess'), 'utf8');
  for (const m of idx.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    const h = `sha256-${createHash('sha256').update(m[1]).digest('base64')}`;
    if (!ht.includes(h)) errors.push(`.htaccess CSP is missing '${h}' for an inline script in index.html`);
  }
  for (const part of ['RewriteCond %{HTTP:X-Forwarded-Proto}', 'ErrorDocument 404 /404.html', 'Strict-Transport-Security']) {
    if (!ht.includes(part)) errors.push(`.htaccess missing ${part}`);
  }
}

for (const w of warn) console.warn(`check-dist warning: ${w}`);
if (errors.length) {
  console.error('check-dist FAILED:\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log(`check-dist: ${required.length} required files present, ${htmlFiles.length} HTML heads valid`);
