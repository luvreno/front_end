// Runs the Playwright suite against two preview servers started here (not by Playwright):
//   127.0.0.1:4280  dist-e2e (public test keys, see .env.e2e)
//   127.0.0.1:4281  dist     (the production build as uploaded)
// In this environment, servers launched by Playwright's webServer made Firefox and WebKit abort
// or hang on navigation; servers started here behave normally. Extra args go to `playwright test`.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const vite = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const cli = path.join(root, 'node_modules', '@playwright', 'test', 'cli.js');
for (const d of ['dist', 'dist-e2e']) {
  if (!fs.existsSync(path.join(root, d, 'index.html'))) {
    console.error(`e2e: ${d}/ is missing. Run "npm run build" and "npm run build:e2e" first.`);
    process.exit(1);
  }
}

const servers = [
  spawn(process.execPath, [vite, 'preview', '--outDir', 'dist-e2e', '--host', '127.0.0.1', '--port', '4280', '--strictPort'], { cwd: root, stdio: ['ignore', 'ignore', 'inherit'] }),
  spawn(process.execPath, [vite, 'preview', '--host', '127.0.0.1', '--port', '4281', '--strictPort'], { cwd: root, stdio: ['ignore', 'ignore', 'inherit'] }),
];
const stop = () => servers.forEach((s) => s.kill());
process.on('SIGINT', () => { stop(); process.exit(130); });

async function waitFor(url) {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error(`server did not start: ${url}`);
}

let code = 1;
try {
  await Promise.all([waitFor('http://127.0.0.1:4280/'), waitFor('http://127.0.0.1:4281/')]);
  const run = spawn(process.execPath, [cli, 'test', ...process.argv.slice(2)], { cwd: root, stdio: 'inherit' });
  code = await new Promise((r) => run.on('exit', (c) => r(c ?? 1)));
} catch (e) {
  console.error(String(e));
} finally {
  stop();
}
process.exit(code);
