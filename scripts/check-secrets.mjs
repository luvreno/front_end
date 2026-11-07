// Scans every file git would include (tracked + untracked, not ignored) for secrets.
// Run before any push. Exit code 1 on findings.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard'], { cwd: root }).toString().split('\n').filter(Boolean);

// Google's documented public reCAPTCHA TEST secret, used only by scripts/check-php.mjs
const ALLOWED = ['6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe', 'test-pass-123'];
const patterns = [
  ['Stripe secret key', /\b(sk|rk)_(live|test)_[0-9a-zA-Z]{10,}/],
  ['Stripe webhook secret', /\bwhsec_[0-9a-zA-Z]{10,}/],
  ['Private key block', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['reCAPTCHA secret', /\b6L[0-9A-Za-z_-]{38}\b/],
  ['bcrypt/argon hash', /\$(2[aby]|argon2id?)\$[^\s'"]{20,}/],
  ['Generic secret assignment', /(secret|password|passwd|api[_-]?key|token)\s*['"]?\s*[:=]>?\s*['"][^'"\s]{12,}['"]/i],
];
const forbiddenFiles = [/^\.env$/, /^\.env\.(local|production)$/, /(^|\/)config\.php$/, /^secrets\.txt$/, /(^|\/)api\/data\/.+\.json$/];

const findings = [];
for (const f of files) {
  if (forbiddenFiles.some((r) => r.test(f))) findings.push(`${f}: this file must not be committed`);
  if (/\.(png|ico|woff2?|jpg|webp)$/.test(f) || f === 'package-lock.json') continue;
  const full = path.join(root, f);
  if (!fs.existsSync(full)) continue;
  const text = fs.readFileSync(full, 'utf8');
  text.split('\n').forEach((line, i) => {
    for (const [name, re] of patterns) {
      const m = re.exec(line);
      if (!m) continue;
      if (ALLOWED.some((a) => line.includes(a))) continue;
      // the scanner's own pattern list and documentation of placeholders are fine
      if (f === 'scripts/check-secrets.mjs') continue;
      findings.push(`${f}:${i + 1} possible ${name}: ${line.trim().slice(0, 80)}`);
    }
  });
}

console.log(`check:secrets: scanned ${files.length} files that git would push`);
if (findings.length) {
  console.error(`check:secrets FAILED (${findings.length})\n  ` + findings.join('\n  '));
  process.exit(1);
}
console.log('check:secrets: no secrets found; .env, config.php, secrets.txt and api/data/*.json are not included');
