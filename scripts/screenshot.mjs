// Dev helper: full-page screenshots of a running preview.
// Usage: node scripts/screenshot.mjs <url-path> <width> <out.png> [--full] [--scroll]
import { chromium } from '@playwright/test';

const [, , p = '/', w = '1280', out = 'shot.png', ...flags] = process.argv;
const base = process.env.BASE_URL || 'http://localhost:4173';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(w), height: 900 } });
const logs = [];
page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && logs.push(`${m.type()}: ${m.text()}`));
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
page.on('requestfailed', (r) => logs.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));
await page.addInitScript(() => {
  try {
    sessionStorage.setItem('lv-intro-v1', '1');
    if (!location.search.includes('banner')) localStorage.setItem('lv-consent', JSON.stringify({ version: '2026-11-01', timestamp: new Date().toISOString(), necessary: true, preferences: false, analytics: false }));
  } catch {
    /* ignore */
  }
});
await page.goto(base + p, { waitUntil: 'networkidle' });
if (flags.includes('--scroll')) {
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 600) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}
const at = flags.find((f) => f.startsWith('--at='));
if (at) {
  await page.evaluate((sel) => document.querySelector(sel)?.scrollIntoView({ block: 'start', behavior: 'instant' }), at.slice(5));
  await page.waitForTimeout(1200);
}
await page.screenshot({ path: out, fullPage: flags.includes('--full') });
console.log(logs.length ? logs.join('\n') : 'no console errors');
await browser.close();
