import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { clearScrollMemory, instantScrollTo, refreshScrollTriggers, releaseScroll, scrollHeld, settleScroll } from '../lib/gsap';

const jumpTo = (top: number) => {
  instantScrollTo(top);
  // hold the position the browser actually reached (it may clamp near the page end)
  settleScroll(window.scrollY);
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
 * Any scroll the code did not cause (wheel, touch, keys, scrollbar drag) ends the correction.
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
    clearScrollMemory();

    if (!hash) {
      if (samePage && !reduced() && window.scrollY > 0) {
        // logo or "/" link on the page you are already on: glide back to the top
        releaseScroll();
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      } else {
        jumpTo(0);
      }
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
          // follow the target if late layout moves it, until the hold ends (time out or any other scroll)
          settle = window.setInterval(() => {
            if (cancelled || !scrollHeld()) return window.clearInterval(settle);
            const t = target();
            if (Math.abs(t - window.scrollY) > 4) jumpTo(t);
          }, 150);
        }
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      };
      raf = requestAnimationFrame(go);
    }
    // New page: re-measure scroll animations once it has laid out. Not for jumps within the same page:
    // the layout has not changed, and a refresh re-sets the scroll position, which cancels a smooth scroll.
    const r = samePage ? 0 : window.setTimeout(refreshScrollTriggers, 120);
    return () => {
      cancelled = true;
      window.clearInterval(settle);
      cancelAnimationFrame(raf);
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
