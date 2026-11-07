// Fails on em dashes (U+2014) or "--" in any user-facing text, and on filler or unfinished copy.
// Scans: src (ts, tsx, md, json), index.html, public text files and PHP, and dist HTML/XML if built.
// CSS custom properties such as var(--c1) and code decrements such as i-- are not text and are ignored.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const EM = '—';
const errors = [];

const walk = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.name === 'node_modules' ? [] : d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]))
    : [];

// "--" used as punctuation: surrounded by spaces/letters, not a CSS variable (--name) or a decrement (x--)
const doubleDash = /(^|[\s\w.,;:!?)\]])--(?=[\s.,;:!?]|$)|(^|\s)--(?=\s)|[A-Za-z]--[A-Za-z]/;
const filler = /\b(delve|seamless(?:ly)?|cutting[- ]edge|game[- ]chang(?:er|ing)|revolutioni[sz]e|supercharge|unlock the power|in today'?s fast[- ]paced|elevate your|harness the power|lorem ipsum|coming soon)\b/i;
const todo = /\b(TODO|FIXME|TBD)\b/;

function scanText(rel, text, { md = false } = {}) {
  const lines = text.split(/\r?\n/);
  let inFront = false;
  lines.forEach((line, i) => {
    const where = `${rel}:${i + 1}`;
    if (md) {
      if (i === 0 && line === '---') { inFront = true; return; }
      if (inFront) { if (line === '---') inFront = false; else if (line.includes(EM)) errors.push(`${where} em dash`); return; }
      if (/^\s*\|?\s*:?-{3,}/.test(line)) return; // table separator row
    }
    if (line.includes(EM)) errors.push(`${where} em dash: ${line.trim().slice(0, 90)}`);
    // ignore CSS custom properties in code files
    const stripped = line.replace(/var\(--[\w-]+/g, '').replace(/['"`]--[\w-]+['"`]/g, '').replace(/\[\s*'--[\w-]+'/g, '').replace(/\w+--(?=[;)\s]|$)/g, '');
    if (doubleDash.test(stripped)) errors.push(`${where} double dash: ${line.trim().slice(0, 90)}`);
    if (filler.test(line)) errors.push(`${where} filler or unfinished copy: ${line.trim().slice(0, 90)}`);
    if (todo.test(line)) errors.push(`${where} TODO marker: ${line.trim().slice(0, 90)}`);
  });
}

const sources = [
  ...walk(path.join(root, 'src')).filter((f) => /\.(tsx?|md|json)$/.test(f)),
  path.join(root, 'index.html'),
  ...walk(path.join(root, 'public')).filter((f) => /\.(php|txt|webmanifest|svg)$/.test(f)),
];
for (const f of sources) {
  const rel = path.relative(root, f).replace(/\\/g, '/');
  scanText(rel, fs.readFileSync(f, 'utf8'), { md: f.endsWith('.md') });
}

// Built output: visible text of the generated HTML heads, sitemap and feed
const dist = path.join(root, 'dist');
for (const f of walk(dist).filter((f) => /\.(html|xml)$/.test(f))) {
  const rel = path.relative(root, f).replace(/\\/g, '/');
  const text = fs.readFileSync(f, 'utf8').replace(/<script type="module"[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  if (text.includes(EM)) errors.push(`${rel} em dash in built output`);
  if (/<!--(?!seo|preload)/.test(text) === false && /\s--\s/.test(text.replace(/<!--[\s\S]*?-->/g, ''))) errors.push(`${rel} double dash in built output`);
}
// Built JS bundles must not carry an em dash in any string
for (const f of walk(path.join(dist, 'assets')).filter((f) => f.endsWith('.js'))) {
  const js = fs.readFileSync(f, 'utf8');
  if (js.includes(EM)) {
    const i = js.indexOf(EM);
    // third-party libraries can contain em dashes in comments or messages; only fail if it sits in our copy
    const ctx = js.slice(Math.max(0, i - 60), i + 60);
    if (!/react|framer|gsap|scheduler|warning|Error/i.test(ctx)) errors.push(`${path.basename(f)} em dash in bundle near: ${ctx.replace(/\s+/g, ' ')}`);
  }
}

if (errors.length) {
  console.error(`check:dashes FAILED (${errors.length})\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log(`check:dashes: ${sources.length} source files and built output clean (no em dashes, no "--", no filler, no TODO)`);
