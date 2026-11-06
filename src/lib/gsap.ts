import { useEffect, type RefObject } from 'react';

type GsapModule = typeof import('./gsapCore');
let promise: Promise<GsapModule> | null = null;
let loaded: GsapModule | null = null;

/** GSAP and ScrollTrigger are loaded on demand so they never block first paint. */
export function loadGsap(): Promise<GsapModule> {
  if (!promise) {
    promise = import('./gsapCore').then((m) => {
      loaded = m;
      return m;
    });
  }
  return promise;
}

/** Refresh ScrollTrigger positions if GSAP has been loaded. */
export function refreshScrollTriggers() {
  loaded?.ScrollTrigger.refresh();
}

type Setup = (m: GsapModule) => void;

/**
 * Runs `setup` inside gsap.context() scoped to `scope` and reverts on unmount.
 * Safe under StrictMode double mounting: a cancelled mount never creates a context.
 */
export function useGsapContext(scope: RefObject<HTMLElement | SVGElement | null>, setup: Setup, deps: readonly unknown[], enabled = true) {
  useEffect(() => {
    if (!enabled || !scope.current) return;
    let cancelled = false;
    let ctx: { revert: () => void } | null = null;
    loadGsap()
      .then((m) => {
        if (cancelled || !scope.current) return;
        ctx = m.gsap.context(() => setup(m), scope.current);
      })
      .catch(() => {
        /* animation is optional: show the full decorative thread */
        document.documentElement.classList.add('thread-failed');
      });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, scope, ...deps]);
}
