// Fails when a price could be shown from anywhere other than getPrice(),
// or when the built bundle disagrees with the pricing module.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const { pricing } = await import('../src/content.ts');
const errors = [];

const walk = (dir) =>
  fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)])) : [];

// 1. Source: no hard-coded "$<number>" or "<number> per month" outside the pricing module.
const allowed = new Set(['src/content.ts', 'src/lib/pricing.ts']);
const money = /\$\s?\d|\b\d+(?:[.,]\d+)?\s*(?:USD|per month|\/\s?mo(?:nth)?)\b|(?:USD|US\$)\s?\d/;
for (const f of walk(path.join(root, 'src'))) {
  const rel = path.relative(root, f).replace(/\\/g, '/');
  if (allowed.has(rel) || !/\.(tsx?|md|css)$/.test(f)) continue;
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const code = line.replace(/\$\{[^}]*\}/g, '');
    if (money.test(code)) errors.push(`${rel}:${i + 1} hard-coded price text: ${line.trim().slice(0, 100)}`);
  });
}

// 2. Every plan's number appears in content only once, as monthlyUsd.
const contentSrc = fs.readFileSync(path.join(root, 'src', 'content.ts'), 'utf8');
for (const p of pricing.plans) {
  if (p.monthlyUsd === null) continue;
  const n = (contentSrc.match(new RegExp(`monthlyUsd:\\s*${p.monthlyUsd}\\b`, 'g')) || []).length;
  if (n !== 1) errors.push(`content.ts: expected one monthlyUsd: ${p.monthlyUsd} for ${p.id}, found ${n}`);
  if (!/^PLACEHOLDER PRICES AND LIMITS: confirm with client\.$/m.test(contentSrc.replace(/^\s*\/\/\s?/gm, ''))) errors.push('content.ts: missing the PLACEHOLDER PRICES AND LIMITS comment');
}

// 3. Built bundle: no competing price literals for any plan.
const assets = walk(path.join(root, 'dist', 'assets')).filter((f) => f.endsWith('.js'));
for (const f of assets) {
  const js = fs.readFileSync(f, 'utf8');
  for (const p of pricing.plans) {
    if (p.monthlyUsd === null) continue;
    const literal = new RegExp(`["'\`]\\$${p.monthlyUsd}(?:\\.\\d+)?\\b`);
    if (literal.test(js)) errors.push(`${path.basename(f)}: literal "$${p.monthlyUsd}" found in bundle (must come from getPrice)`);
  }
  if (/annual|per year|yearly/i.test(js) && /pricing/i.test(js) && /billed annually|per year/i.test(js)) errors.push(`${path.basename(f)}: annual pricing text in bundle`);
}

if (errors.length) {
  console.error('check:prices FAILED\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log(`check:prices: ${pricing.plans.length} plans, one source (getPrice), ${assets.length} bundles scanned`);
