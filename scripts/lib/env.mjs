import fs from 'node:fs';
import path from 'node:path';

/** Loads KEY=value pairs from .env into process.env (without overriding real env vars). */
export function loadEnv(root) {
  const file = path.join(root, '.env');
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!m || line.trim().startsWith('#')) continue;
    const v = m[2].replace(/^(['"])(.*)\1$/, '$2');
    out[m[1]] = v;
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
  return out;
}
