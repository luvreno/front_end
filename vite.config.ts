import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { parseFrontMatter, validateMeta, renderMarkdown } from './scripts/lib/markdown.mjs';

/** Turns src/content/blog/*.md into modules with `meta`, `html` and `headings` at build time. */
function markdownPosts(): Plugin {
  return {
    name: 'luvreno-markdown',
    enforce: 'pre',
    transform(src, id) {
      const [file, query] = id.split('?');
      if (!file.endsWith('.md')) return null;
      const { meta, body } = parseFrontMatter(src);
      const errors = validateMeta(meta, id);
      if (errors.length) this.error(errors.join('\n'));
      const m = { ...meta, readingTime: Number(meta.readingTime) };
      if (query === 'meta') return { code: `export const meta = ${JSON.stringify(m)};
export default meta;`, map: null };
      const { html, headings } = renderMarkdown(body);
      return {
        code: `export const meta = ${JSON.stringify(m)};\nexport const html = ${JSON.stringify(html)};\nexport const headings = ${JSON.stringify(headings)};\nexport default { meta, html, headings };`,
        map: null,
      };
    },
  };
}

/**
 * Local dev/preview only (never part of dist): stand-in for the PHP endpoints, which run only on
 * the real server. E2E tests pick a scenario with an `lv-e2e` cookie instead of request interception:
 *   items         GET testimonials returns two approved sample items
 *   e2e           POSTs succeed (contact 200, testimonial 201 pending)
 *   contact-fail  contact POST returns 502
 * Without the cookie: empty list, and POSTs answer 503 like a server without PHP.
 * Also serves a reCAPTCHA stand-in script at /__e2e/recaptcha.js for the e2e build.
 */
const RECAPTCHA_STUB = `window.grecaptcha={render:function(el,o){var b=document.createElement('button');b.type='button';b.textContent='I am not a robot (test)';b.setAttribute('data-testid','captcha-stub');b.onclick=function(){o.callback('test-token')};el.appendChild(b);return 1},reset:function(){},getResponse:function(){return 'test-token'}};setTimeout(function(){window.__lvRecaptchaReady&&window.__lvRecaptchaReady()},0);`;

function localApiStub(): Plugin {
  const handler = (req: import('http').IncomingMessage, res: import('http').ServerResponse, next: () => void) => {
    const url = req.url || '';
    if (url.startsWith('/__e2e/recaptcha.js')) {
      res.setHeader('Content-Type', 'text/javascript');
      res.end(RECAPTCHA_STUB);
      return;
    }
    if (!url.startsWith('/api/')) return next();
    const scenario = /(?:^|;\s*)lv-e2e=([^;]*)/.exec(req.headers.cookie || '')?.[1] || '';
    const has = (s: string) => scenario.split('.').includes(s);
    res.setHeader('Content-Type', 'application/json');
    if (url.startsWith('/api/testimonials.php') && req.method === 'GET') {
      const items = has('items')
        ? [
            { id: 'a1', name: 'Reviewer A', rating: 5, message: 'Approved message one', date: '2026-11-01' },
            { id: 'a2', name: 'Reviewer B', rating: 4, message: 'Approved message two', date: '2026-11-02' },
          ]
        : [];
      res.end(JSON.stringify({ ok: true, items }));
      return;
    }
    if (req.method === 'POST' && has('e2e')) {
      if (url.startsWith('/api/contact.php') && has('contact-fail')) {
        res.statusCode = 502;
        res.end(JSON.stringify({ ok: false, error: 'Your message could not be sent.' }));
        return;
      }
      res.statusCode = url.startsWith('/api/testimonials.php') ? 201 : 200;
      res.end(JSON.stringify(url.startsWith('/api/testimonials.php') ? { ok: true, status: 'pending' } : { ok: true }));
      return;
    }
    res.statusCode = 503;
    res.end(JSON.stringify({ ok: false, error: 'PHP endpoints only run on the live server.' }));
  };
  return {
    name: 'luvreno-local-api-stub',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  plugins: [markdownPosts(), react(), localApiStub()],
  define: { __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)) },
  build: {
    target: ['es2020', 'safari15'],
    cssTarget: ['safari15'],
    assetsInlineLimit: 0,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/gsap')) return 'gsap';
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion-')) return 'motion';
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) return 'react';
          return undefined;
        },
      },
    },
  },
  server: { port: 5173 },
});
