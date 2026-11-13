// WCAG AA contrast check on the rendered site, plus the Stitch & Tag colour rules:
//  - every visible text element meets 4.5:1 (normal) or 3:1 (large: >= 24px, or >= 18.66px bold)
//  - terracotta (#C84B31) is never text below large size
//  - green (#346751) is never text on charcoal
//  - every colour used is one of the four tokens (plus opacity); no pure black or white
// Also prints the token pair matrix. Needs a build (npm run build).
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { startPreview } from './lib/serve.mjs';

const root = path.resolve(import.meta.dirname, '..');
const T = { charcoal: [22, 22, 22], green: [52, 103, 81], terracotta: [200, 75, 49], cream: [236, 219, 186] };
const lum = ([r, g, b]) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// 1. Token matrix (informational, and a guard that the palette itself has not changed)
console.log('Token pairs (text on background):');
for (const [fn, f] of Object.entries(T)) {
  for (const [bn, b] of Object.entries(T)) {
    if (fn === bn) continue;
    const r = ratio(f, b);
    console.log(`  ${fn.padEnd(10)} on ${bn.padEnd(10)} ${r.toFixed(2)}:1 ${r >= 4.5 ? 'AA' : r >= 3 ? 'AA large only' : 'fail'}`);
  }
}

if (!fs.existsSync(path.join(root, 'dist', 'index.html'))) {
  console.error('check:contrast needs a build first (npm run build)');
  process.exit(1);
}

const posts = fs.readdirSync(path.join(root, 'src', 'content', 'blog')).map((f) => '/blog/' + f.replace(/\.md$/, ''));
const routes = ['/', '/product', '/blog', posts[0], '/privacy', '/terms', '/cookies', '/checkout/success', '/missing-page'];
const { base, stop } = await startPreview(4700 + Math.floor(Math.random() * 200));
const browser = await chromium.launch();
const errors = new Set();
let scanned = 0;

// runs in the page: returns every visible text element with its colours and size
const collect = (tokens) => {
  const parse = (s) => {
    const m = /rgba?\(([^)]+)\)/.exec(s);
    if (!m) return null;
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  };
  const blend = (top, bottom) => [0, 1, 2].map((i) => Math.round(top[i] * top[3] + bottom[i] * (1 - top[3])));
  const isToken = (c) => Object.values(tokens).some((t) => Math.abs(t[0] - c[0]) <= 1 && Math.abs(t[1] - c[1]) <= 1 && Math.abs(t[2] - c[2]) <= 1);
  const bgOf = (el) => {
    const chain = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) chain.push(n);
    let bg = parse(getComputedStyle(document.documentElement).backgroundColor) || [236, 219, 186, 1];
    bg = bg.slice(0, 3);
    for (let i = chain.length - 1; i >= 0; i--) {
      const c = parse(getComputedStyle(chain[i]).backgroundColor);
      if (c && c[3] > 0) bg = blend(c, bg);
    }
    return bg;
  };
  const hidden = (el) => {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.display === 'none' || s.visibility === 'hidden' || n.getAttribute('aria-hidden') === 'true' || n.hasAttribute('hidden')) return true;
      if (n.classList.contains('sr-only') || n.classList.contains('honeypot')) return true;
    }
    const r = el.getBoundingClientRect();
    return r.width < 1 || r.height < 1;
  };
  const out = [];
  const offPalette = [];
  for (const el of document.querySelectorAll('body *')) {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME'].includes(el.tagName)) continue;
    // third-party live chat (Chatwoot) draws its own launcher; its colours are set in the Chatwoot dashboard
    if (el.closest('.woot--bubble-holder, .woot-widget-holder, .woot-widget-bubble, [id^="cw-"]')) continue;
    const s = getComputedStyle(el);
    // palette rule: every painted colour is a token (alpha allowed). Only visible, painted things count:
    // SVG shapes (not svg/g/defs or mask content, where black and white are mask luminance), borders with width,
    // backgrounds, and the text colour of elements that hold text.
    const isShape = el instanceof SVGGeometryElement && !el.closest('mask, defs, clipPath');
    const holdsText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    const visible = !hidden(el) && parseFloat(s.opacity) > 0;
    for (const prop of ['color', 'backgroundColor', 'borderTopColor', 'fill', 'stroke']) {
      if (!visible) break;
      const c = parse(s[prop]);
      if (!c || c[3] === 0) continue;
      if (prop === 'color' && !holdsText) continue;
      if (prop === 'borderTopColor' && (parseFloat(s.borderTopWidth) === 0 || s.borderTopStyle === 'none')) continue;
      if ((prop === 'fill' || prop === 'stroke') && !isShape) continue;
      if (prop === 'stroke' && (s.stroke === 'none' || parseFloat(s.strokeWidth) === 0)) continue;
      if (!isToken(c)) offPalette.push(`${el.tagName.toLowerCase()}.${String(el.className.baseVal ?? el.className).split(' ')[0]} ${prop} ${s[prop]}`);
    }
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
    if (!hasText || hidden(el)) continue;
    const fg = parse(s.color);
    const bg = bgOf(el);
    out.push({
      text: el.textContent.trim().slice(0, 50),
      sel: `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`,
      fg: fg[3] < 1 ? blend(fg, bg) : fg.slice(0, 3),
      rawFg: fg.slice(0, 3),
      bg,
      size: parseFloat(s.fontSize),
      weight: parseInt(s.fontWeight, 10),
    });
  }
  return { out, offPalette: [...new Set(offPalette)] };
};

const sameRgb = (a, b) => a.every((v, i) => Math.abs(v - b[i]) <= 1);

try {
  for (const width of [375, 1280]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await ctx.addInitScript(() => sessionStorage.setItem('lv-intro-v1', '1'));
    const page = await ctx.newPage();
    for (const route of routes) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      // reveal everything that animates in on scroll
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 500) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 30));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(300);
      const states = [{ name: 'page', act: async () => {} }];
      if (route === '/') {
        // the built-in assistant is optional (the live site uses Chatwoot); check its panel only when it is mounted
        if (await page.locator('[data-testid="chat-fab"]').count()) states.push({ name: 'chat open', act: async () => { await page.click('[data-testid="chat-fab"]'); await page.waitForTimeout(200); } });
        if (width === 375) states.push({ name: 'menu open', act: async () => { await page.keyboard.press('Escape'); await page.click('[data-testid="menu-btn"]'); await page.waitForTimeout(600); } });
      }
      for (const st of states) {
        await st.act();
        const { out, offPalette } = await page.evaluate(collect, T);
        for (const o of offPalette) errors.add(`${route} @${width}: colour outside the palette: ${o}`);
        for (const t of out) {
          scanned++;
          const large = t.size >= 24 || (t.size >= 18.66 && t.weight >= 700);
          const r = ratio(t.fg, t.bg);
          const where = `${route} @${width} [${st.name}] ${t.sel} "${t.text}"`;
          if (r < (large ? 3 : 4.5)) errors.add(`${where}: ${r.toFixed(2)}:1 (${large ? 'large' : 'normal'} text, ${t.size}px)`);
          if (sameRgb(t.rawFg, T.terracotta) && !large) errors.add(`${where}: terracotta used for small text (${t.size}px)`);
          if (sameRgb(t.rawFg, T.green) && sameRgb(t.bg, T.charcoal)) errors.add(`${where}: green text on charcoal`);
          if (sameRgb(t.bg, T.terracotta) && !large) errors.add(`${where}: small text on a terracotta background`);
        }
      }
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  stop();
}

if (errors.size) {
  console.error(`check:contrast FAILED (${errors.size})\n  ` + [...errors].slice(0, 80).join('\n  '));
  process.exit(1);
}
console.log(`check:contrast: ${scanned} text elements on ${routes.length} routes at 375 and 1280px pass AA, colour rules hold, palette is the four tokens only`);
