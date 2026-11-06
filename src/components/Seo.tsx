import { useEffect } from 'react';
import { headTags, type SeoInput } from '../lib/seoData.ts';

/**
 * Writes the document head for the current route. The post-build HTML already
 * contains the same tags (marked data-seo) for crawlers; this replaces them on navigation,
 * so there is always exactly one canonical.
 */
export function Seo(props: SeoInput) {
  const key = JSON.stringify(props);
  useEffect(() => {
    const s = JSON.parse(key) as SeoInput;
    const head = document.head;
    head.querySelectorAll('[data-seo], link[rel="canonical"]').forEach((el) => el.remove());
    for (const t of headTags(s)) {
      if (t.tag === 'title') {
        document.title = t.text || '';
        continue;
      }
      const el = document.createElement(t.tag);
      for (const [k, v] of Object.entries(t.attrs)) el.setAttribute(k, v);
      el.setAttribute('data-seo', '');
      if (t.text) el.textContent = t.text;
      head.appendChild(el);
    }
  }, [key]);
  return null;
}
