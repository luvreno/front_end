// Lists every unfilled placeholder as a warning (does not fail the build).
// Covers: company details, social and citation links, public keys, Stripe links, prices, limits, legal fields.
import path from 'node:path';
import fs from 'node:fs';
import { loadEnv } from './lib/env.mjs';

const root = path.resolve(import.meta.dirname, '..');
const env = loadEnv(root);
const c = await import('../src/content.ts');
const warnings = [];
const w = (group, msg) => warnings.push([group, msg]);

for (const [k, v] of Object.entries(c.company)) if (c.isPlaceholder(v)) w('Company', `company.${k} = ${v}`);
if (!c.realLinks(c.socialLinks).length) w('Links', 'socialLinks is empty: the Social group is hidden in the footer');
if (!c.realLinks(c.citationLinks).length) w('Links', 'citationLinks is empty: the citation group is hidden in the footer');

const key = (name, why) => {
  const v = (env[name] ?? process.env[name] ?? '').trim();
  if (!v) w('Keys', `${name} is empty in .env: ${why}`);
  return v;
};
key('VITE_RECAPTCHA_SITE_KEY', 'contact and feedback forms show "not configured" and submit is disabled in production');
for (const p of c.pricing.plans) {
  if (!p.stripeEnv) continue;
  const v = key(p.stripeEnv, `${p.name} button renders disabled "Sandbox checkout not configured"`);
  if (v && !/^https:\/\/(buy|checkout)\.stripe\.com\//.test(v)) w('Keys', `${p.stripeEnv} does not look like a Stripe Payment Link`);
  if (v && !/test_/.test(v)) w('Keys', `${p.stripeEnv} does not contain "test_": confirm it is a TEST-mode link`);
}
const provider = (env.VITE_CHAT_PROVIDER || 'none').trim();
if (provider !== 'none') w('Keys', `VITE_CHAT_PROVIDER=${provider}: loader is a stub, wire the provider in src/lib/consent.ts and the CSP`);

const src = fs.readFileSync(path.join(root, 'src', 'content.ts'), 'utf8');
if (src.includes('PLACEHOLDER PRICES AND LIMITS: confirm with client')) {
  for (const p of c.pricing.plans) {
    if (p.pricePlaceholder) w('Pricing', `${p.name}: price ${p.monthlyUsd === null ? 'Contact us' : `$${p.monthlyUsd} per month`} is a placeholder`);
    if (p.limits.placeholder) w('Pricing', `${p.name}: limits (${p.limits.profiles} profiles, ${p.limits.products} products) are placeholders`);
  }
}
if (c.isPlaceholder(c.legal.retention)) w('Legal', `Privacy retention: ${c.legal.retention}`);
if (c.isPlaceholder(c.legal.governingLaw)) w('Legal', `Terms governing law: ${c.legal.governingLaw}`);
if (c.legal.draftBanner) w('Legal', `Privacy and Terms carry the banner "${c.legal.draftBanner}"`);
if (/Company details to be added/.test(src)) w('Company', 'About section shows "Company details to be added"');

if (!fs.existsSync(path.join(root, 'public', 'api', 'config.php'))) w('Server', 'public/api/config.php not present locally (expected): create it on the server from config.example.php');

const groups = [...new Set(warnings.map(([g]) => g))];
console.log(`check:placeholders: ${warnings.length} placeholder warning(s)`);
for (const g of groups) {
  console.log(`  ${g}`);
  for (const [gg, m] of warnings) if (gg === g) console.log(`    warning: ${m}`);
}
