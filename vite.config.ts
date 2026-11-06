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

export default defineConfig({
  plugins: [markdownPosts(), react()],
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
