// Requests every external link found by check:links (run that first) and reports status.
// Network dependent, so it is separate from `npm run check`. Exit code 1 if any link fails.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const file = path.join(root, 'node_modules', '.cache', 'luvreno', 'links.json');
if (!fs.existsSync(file)) {
  console.error('Run npm run check:links first (it saves the list of external links).');
  process.exit(1);
}
const links = Object.keys(JSON.parse(fs.readFileSync(file, 'utf8')));
let failed = 0;
for (const url of links) {
  let status;
  try {
    const ctrl = AbortSignal.timeout(15000);
    let r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl, headers: { 'User-Agent': 'Mozilla/5.0 (link check)' } });
    if (r.status === 405 || r.status === 403) r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'Mozilla/5.0 (link check)' } });
    status = String(r.status);
    if (r.status >= 400) failed++;
  } catch (e) {
    failed++;
    status = `unreachable (${e.cause?.code || e.name})`;
  }
  console.log(`${status.padEnd(28)} ${url}`);
}
if (failed) {
  console.error(`check:external: ${failed} of ${links.length} external links failed`);
  process.exit(1);
}
console.log(`check:external: ${links.length} external links reachable`);
