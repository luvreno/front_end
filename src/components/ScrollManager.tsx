import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { refreshScrollTriggers } from '../lib/gsap';

const jumpTo = (top: number) => {
  const root = document.documentElement;
  const prev = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, top);
  root.style.scrollBehavior = prev;
};

const reduced = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return true;
  }
};

/**
 * Top of page on every route change unless the URL has a hash.
 * With a hash, waits for the element (lazy routes) and scrolls to it.
 */
export function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  const prevPath = useRef<string | null>(null);

  useLayoutEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  }, []);

  useEffect(() => {
    const samePage = prevPath.current === pathname;
    prevPath.current = pathname;
    let raf = 0;
    let settle = 0;
    let cancelled = false;

    if (!hash) {
      jumpTo(0);
    } else {
      const id = decodeURIComponent(hash.slice(1));
      const started = performance.now();
      const go = () => {
        if (cancelled) return;
        const el = document.getElementById(id);
        if (!el) {
          if (performance.now() - started < 5000) raf = requestAnimationFrame(go);
          return;
        }
        const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
        const target = () => el.getBoundingClientRect().top + window.scrollY - offset;
        if (samePage && !reduced()) {
          window.scrollTo({ top: target(), behavior: 'smooth' });
        } else {
          jumpTo(target());
          // late layout (fonts, lazy images) can move the target: correct once
          settle = window.setTimeout(() => {
            if (!cancelled && Math.abs(target() - window.scrollY) > 4) jumpTo(target());
          }, 450);
        }
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      };
      raf = requestAnimationFrame(go);
    }
    const r = window.setTimeout(refreshScrollTriggers, 120);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
      window.clearTimeout(r);
    };
  }, [pathname, hash, key]);

  // refresh trigger positions once web fonts have loaded
  useEffect(() => {
    let alive = true;
    document.fonts?.ready.then(() => alive && refreshScrollTriggers()).catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  return null;
}
