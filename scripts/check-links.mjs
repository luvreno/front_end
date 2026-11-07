// Renders every route of the built site in Chromium and checks every link:
// non-empty, never "#", internal routes exist, #ids exist on the target page,
// external links use https with target=_blank and rel="noopener noreferrer",
// and no tel:/mailto: is built from a placeholder. Saves the external links for check:external.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { startPreview } from './lib/serve.mjs';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
if (!fs.existsSync(path.join(dist, 'sitemap.xml'))) {
  console.error('check:links needs a build first (npm run build)');
  process.exit(1);
}
const sitemap = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
const routes = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1] || '/');
routes.push('/checkout/success', '/this-page-does-not-exist');
const known = new Set([...routes.filter((r) => !r.includes('does-not-exist')), '/sitemap.xml', '/rss.xml', '/robots.txt']);

const { base, stop } = await startPreview(4300 + Math.floor(Math.random() * 300));
const browser = await chromium.launch();
const errors = [];
const external = new Map();
const idsByRoute = new Map();
const pending = [];
let checked = 0;

try {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem('lv-intro-v1', '1');
    } catch {
      /* ignore */
    }
  });
  const page = await ctx.newPage();
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: 'networkidle' });
    await page.waitForSelector('footer');
    const data = await page.evaluate(() => ({
      ids: [...document.querySelectorAll('[id]')].map((e) => e.id),
      links: [...document.querySelectorAll('a')].map((a) => ({
        raw: a.getAttribute('href'),
        abs: a.href,
        target: a.getAttribute('target'),
        rel: a.getAttribute('rel') || '',
        text: (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 60),
      })),
    }));
    idsByRoute.set(route, new Set(data.ids));
    for (const l of data.links) {
      checked++;
      const where = `${route} -> "${l.text}"`;
      if (l.raw === null || l.raw.trim() === '') { errors.push(`${where}: empty href`); continue; }
      if (l.raw.trim() === '#') { errors.push(`${where}: href="#"`); continue; }
      if (/^(tel|mailto):/.test(l.raw)) {
        if (/\[|%5B/.test(l.raw)) errors.push(`${where}: ${l.raw} built from a placeholder`);
        continue;
      }
      if (/^javascript:/i.test(l.raw)) { errors.push(`${where}: javascript: link`); continue; }
      const u = new URL(l.abs);
      if (u.origin !== new URL(base).origin) {
        if (u.protocol !== 'https:') errors.push(`${where}: external link is not https (${l.abs})`);
        if (l.target !== '_blank') errors.push(`${where}: external link without target="_blank"`);
        if (!/noopener/.test(l.rel) || !/noreferrer/.test(l.rel)) errors.push(`${where}: external link without rel="noopener noreferrer"`);
        external.set(l.abs, [...(external.get(l.abs) || []), route]);
        continue;
      }
      const p = u.pathname.replace(/\/$/, '') || '/';
      if (p === route && u.hash) {
        if (!data.ids.includes(decodeURIComponent(u.hash.slice(1)))) errors.push(`${where}: same-page ${u.hash} not found`);
        continue;
      }
      if (!known.has(p)) errors.push(`${where}: internal route ${p} does not exist`);
      if (u.hash) pending.push({ where, path: p, id: decodeURIComponent(u.hash.slice(1)) });
    }
  }
  for (const h of pending) {
    if (!idsByRoute.has(h.path)) {
      await page.goto(base + h.path, { waitUntil: 'networkidle' });
      idsByRoute.set(h.path, new Set(await page.evaluate(() => [...document.querySelectorAll('[id]')].map((e) => e.id))));
    }
    if (!idsByRoute.get(h.path).has(h.id)) errors.push(`${h.where}: #${h.id} not found on ${h.path}`);
  }
  for (const f of ['/sitemap.xml', '/rss.xml', '/robots.txt']) {
    const r = await fetch(base + f);
    if (!r.ok) errors.push(`${f} returned ${r.status}`);
  }
} finally {
  await browser.close();
  stop();
}

const cacheDir = path.join(root, 'node_modules', '.cache', 'luvreno');
fs.mkdirSync(cacheDir, { recursive: true });
fs.writeFileSync(path.join(cacheDir, 'links.json'), JSON.stringify(Object.fromEntries(external), null, 2));

if (errors.length) {
  console.error(`check:links FAILED (${errors.length})\n  ` + [...new Set(errors)].join('\n  '));
  process.exit(1);
}
console.log(`check:links: ${routes.length} routes rendered, ${checked} links checked, ${pending.length} hash targets verified, ${external.size} unique external links (saved for check:external)`);
