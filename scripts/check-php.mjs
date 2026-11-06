// Lints every PHP file and runs functional checks against PHP's built-in server
// using a throwaway copy of public/api with a test config. Needs `php` on PATH.
// Set PHP_LIVE_RECAPTCHA=1 to also run a submission through Google's public test key (network).
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const api = path.join(root, 'public', 'api');
const fails = [];
const ok = (cond, msg) => (cond ? console.log(`  pass  ${msg}`) : (fails.push(msg), console.log(`  FAIL  ${msg}`)));

try {
  execFileSync('php', ['-v'], { stdio: 'ignore' });
} catch {
  console.warn('check:php skipped: php is not installed (Manual verification needed)');
  process.exit(0);
}

console.log('php -l');
for (const f of fs.readdirSync(api).filter((f) => f.endsWith('.php'))) {
  try {
    execFileSync('php', ['-l', path.join(api, f)], { stdio: 'pipe' });
    ok(true, `syntax ${f}`);
  } catch (e) {
    ok(false, `syntax ${f}: ${e.stdout}`);
  }
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lv-php-'));
fs.cpSync(api, path.join(tmp, 'api'), { recursive: true });
fs.rmSync(path.join(tmp, 'api', 'config.php'), { force: true });
fs.rmSync(path.join(tmp, 'api', 'data', 'testimonials.json'), { force: true });
const hash = execFileSync('php', ['-r', "echo password_hash('test-pass-123', PASSWORD_DEFAULT);"]).toString();
fs.writeFileSync(
  path.join(tmp, 'api', 'config.php'),
  `<?php return ['RECAPTCHA_SECRET' => '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe', 'RECAPTCHA_HOSTNAMES' => ['testkey.google.com'], 'MAIL_TO' => 'test@example.com', 'MAIL_FROM' => 'no-reply@example.com', 'ADMIN_PASSWORD_HASH' => '${hash}', 'IP_SALT' => 'check-${Date.now()}'];`,
);
const port = 8100 + Math.floor(Math.random() * 500);
const server = spawn('php', ['-S', `127.0.0.1:${port}`, '-t', tmp], { stdio: 'ignore' });
const B = `http://127.0.0.1:${port}/api`;
const J = { 'Content-Type': 'application/json' };

async function waitUp() {
  for (let i = 0; i < 40; i++) {
    try {
      await fetch(`${B}/testimonials.php`);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 150));
    }
  }
  throw new Error('php server did not start');
}

try {
  await waitUp();
  console.log('testimonials.php');
  let r = await fetch(`${B}/testimonials.php`);
  const etag = r.headers.get('etag');
  ok(r.status === 200 && JSON.stringify(await r.json()) === '{"ok":true,"items":[]}', 'GET returns an empty approved list');
  ok(!!etag, 'GET sends an ETag');
  r = await fetch(`${B}/testimonials.php`, { headers: { 'If-None-Match': etag } });
  ok(r.status === 304, 'If-None-Match returns 304');
  r = await fetch(`${B}/testimonials.php`, { method: 'POST', body: 'a=b', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  ok(r.status === 415, 'non-JSON POST is rejected (415)');
  r = await fetch(`${B}/testimonials.php`, { method: 'POST', headers: J, body: JSON.stringify({ name: 'A', rating: 9, message: 'x', consent: false }) });
  ok(r.status === 422, 'invalid submission is rejected (422)');
  r = await fetch(`${B}/testimonials.php`, { method: 'POST', headers: J, body: JSON.stringify({ name: 'Sam', rating: 4, message: 'Write to me at someone@example.com for details', consent: true }) });
  ok(r.status === 422, 'email address in the message is rejected');
  r = await fetch(`${B}/testimonials.php`, { method: 'POST', headers: J, body: JSON.stringify({ name: 'Sam', rating: 4, message: 'Readable rules and clear reports for us.', consent: true }) });
  ok(r.status === 400, 'missing reCAPTCHA is rejected (400)');
  r = await fetch(`${B}/testimonials.php`, { method: 'POST', headers: J, body: JSON.stringify({ website: 'bot' }) });
  ok(r.status === 200, 'honeypot gets a silent 200');
  r = await fetch(`${B}/testimonials.php`, { method: 'POST', headers: J, body: JSON.stringify({ x: 'a'.repeat(11000) }) });
  ok(r.status === 413, 'oversized body is rejected (413)');

  console.log('contact.php');
  r = await fetch(`${B}/contact.php`);
  ok(r.status === 405, 'GET is not allowed (405)');
  r = await fetch(`${B}/contact.php`, { method: 'POST', headers: J, body: JSON.stringify({ type: 'contact', name: 'A', email: 'bad', subject: 'x', message: 'hi' }) });
  ok(r.status === 422, 'invalid contact is rejected (422)');
  r = await fetch(`${B}/contact.php`, { method: 'POST', headers: J, body: JSON.stringify({ type: 'contact', name: 'Sam', email: 'sam@example.com\r\nBcc: x@y.z', subject: 'General enquiry', message: 'Hello there team' }) });
  ok(r.status === 422, 'header injection in email is rejected');
  r = await fetch(`${B}/contact.php`, { method: 'POST', headers: J, body: JSON.stringify({ type: 'contact', name: 'Sam', email: 'sam@example.com', subject: 'General enquiry', message: 'Hello there team' }) });
  const body = await r.json();
  ok(r.status === 400 && !JSON.stringify(body).match(/secret|warning|stack|\.php/i), 'contact without reCAPTCHA is rejected without internal details');
  const lib = await fetch(`${B}/lib.php`);
  ok(lib.status === 404, 'lib.php is not directly usable (404)');

  console.log('testimonials-admin.php');
  let cookie = '';
  const admin = async (form) => {
    const res = await fetch(`${B}/testimonials-admin.php`, {
      method: form ? 'POST' : 'GET',
      headers: { Cookie: cookie, ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}) },
      body: form ? new URLSearchParams(form) : undefined,
      redirect: 'manual',
    });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0];
    return { status: res.status, text: await res.text(), headers: res.headers };
  };
  let page = await admin();
  ok(/noindex/.test(page.headers.get('x-robots-tag') || ''), 'admin sends noindex');
  let csrf = /name="csrf" value="([a-f0-9]+)"/.exec(page.text)?.[1];
  ok((await admin({ action: 'login', password: 'test-pass-123' })).status === 400, 'login without CSRF token is rejected');
  ok((await admin({ csrf, action: 'login', password: 'test-pass-123' })).status === 303, 'login with password and CSRF succeeds');
  page = await admin();
  ok(/Log out/.test(page.text), 'logged-in page shows a Log out button');
  csrf = /name="csrf" value="([a-f0-9]+)"/.exec(page.text)?.[1];
  ok((await admin({ action: 'delete', id: 'abc' })).status === 400, 'admin action without CSRF is rejected');
  await admin({ csrf, action: 'logout' });
  cookie = '';
  page = await admin();
  csrf = /name="csrf" value="([a-f0-9]+)"/.exec(page.text)?.[1];
  for (let i = 0; i < 5; i++) await admin({ csrf, action: 'login', password: `wrong-${i}` });
  ok((await admin({ csrf, action: 'login', password: 'test-pass-123' })).status === 429, 'lockout after 5 failed logins blocks even the right password');

  if (process.env.PHP_LIVE_RECAPTCHA === '1') {
    console.log('live reCAPTCHA (network)');
    fs.rmSync(path.join(tmp, 'api', 'data', 'login-attempts.json'), { force: true });
    r = await fetch(`${B}/testimonials.php`, { method: 'POST', headers: J, body: JSON.stringify({ name: 'Sam', rating: 4, message: 'Readable rules and clear reports for us.', consent: true, recaptcha: 'test' }) });
    ok(r.status === 201, 'valid submission with Google test key is stored as pending');
    r = await fetch(`${B}/testimonials.php`);
    ok((await r.json()).items.length === 0, 'pending items are not public');
  }
} catch (e) {
  fails.push(String(e));
  console.error(e);
} finally {
  server.kill();
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (fails.length) {
  console.error(`check:php FAILED (${fails.length})`);
  process.exit(1);
}
console.log('check:php: all checks passed');
