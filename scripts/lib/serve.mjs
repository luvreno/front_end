import { spawn } from 'node:child_process';
import path from 'node:path';

/** Starts `vite preview` for dist/ on a port and resolves once it answers. */
export async function startPreview(port) {
  const root = path.resolve(import.meta.dirname, '..', '..');
  const bin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
  const proc = spawn(process.execPath, [bin, 'preview', '--port', String(port), '--strictPort'], { cwd: root, stdio: 'ignore' });
  const base = `http://localhost:${port}`;
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(base + '/');
      if (r.ok) return { base, stop: () => proc.kill() };
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  proc.kill();
  throw new Error('vite preview did not start');
}
