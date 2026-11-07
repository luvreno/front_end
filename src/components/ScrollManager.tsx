import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { clearScrollMemory, refreshScrollTriggers, releaseScroll, settleScroll } from '../lib/gsap';

const jumpTo = (top: number) => {
  const root = document.documentElement;
  const prev = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, top);
  root.style.scrollBehavior = prev;
  settleScroll(top);
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
 * With a hash, waits for the element (lazy routes) and scrolls to it, then keeps it in place
 * for a moment while late layout (fonts, lazy chunks, ScrollTrigger refreshes) settles.
 * Any real user scroll input ends the correction immediately.
 */
export function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  const prevPath = useRef<string | null>(null);

  useLayoutEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  }, []);

  // user input wins over any automatic correction
  useEffect(() => {
    const onInput = (e: Event) => {
      if (e instanceof KeyboardEvent && !['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)) return;
      releaseScroll();
      window.dispatchEvent(new Event('lv-user-scroll'));
    };
    const opts = { passive: true, capture: true } as const;
    window.addEventListener('wheel', onInput, opts);
    window.addEventListener('touchmove', onInput, opts);
    window.addEventListener('keydown', onInput, opts);
    return () => {
      window.removeEventListener('wheel', onInput, opts);
      window.removeEventListener('touchmove', onInput, opts);
      window.removeEventListener('keydown', onInput, opts);
    };
  }, []);

  useEffect(() => {
    const samePage = prevPath.current === pathname;
    prevPath.current = pathname;
    let raf = 0;
    let settle = 0;
    let cancelled = false;
    const stop = () => {
      cancelled = true;
      window.clearInterval(settle);
    };
    window.addEventListener('lv-user-scroll', stop);
    clearScrollMemory();

    if (!hash) {
      jumpTo(0);
      // hold the top briefly while the new route lays out
      const until = performance.now() + 1200;
      settle = window.setInterval(() => {
        if (cancelled || performance.now() > until) return window.clearInterval(settle);
        if (window.scrollY > 2) jumpTo(0);
      }, 100);
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
        const target = () => Math.round(el.getBoundingClientRect().top + window.scrollY - offset);
        if (samePage && !reduced()) {
          releaseScroll();
          window.scrollTo({ top: target(), behavior: 'smooth' });
        } else {
          jumpTo(target());
          // keep the target in place while layout settles (max 2.5s)
          const until = performance.now() + 2500;
          settle = window.setInterval(() => {
            if (cancelled || performance.now() > until) return window.clearInterval(settle);
            const t = target();
            if (Math.abs(t - window.scrollY) > 4) jumpTo(t);
          }, 150);
        }
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      };
      raf = requestAnimationFrame(go);
    }
    const r = window.setTimeout(refreshScrollTriggers, 120);
    return () => {
      stop();
      cancelAnimationFrame(raf);
      window.clearTimeout(r);
      window.removeEventListener('lv-user-scroll', stop);
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
