import { useEffect, type RefObject } from 'react';

type GsapModule = typeof import('./gsapCore');
let promise: Promise<GsapModule> | null = null;
let loaded: GsapModule | null = null;

/** GSAP and ScrollTrigger are loaded on demand so they never block first paint. */
export function loadGsap(): Promise<GsapModule> {
  if (!promise) {
    promise = import('./gsapCore').then((m) => {
      loaded = m;
      installGuard(m);
      return m;
    });
  }
  return promise;
}

/**
 * Jump to `y` with no animation. The behaviour is passed explicitly: toggling the CSS
 * scroll-behavior around the call is not reliable (Chromium can still use the cached
 * `smooth` value, start an animation, and a later correction then stops it half way).
 */
export function instantScrollTo(y: number) {
  window.scrollTo({ top: y, left: 0, behavior: 'instant' as ScrollBehavior });
}

/**
 * Refresh ScrollTrigger positions if GSAP has been loaded, without letting it
 * restore a scroll position it cached earlier (that would undo ScrollManager).
 */
export function refreshScrollTriggers() {
  if (!loaded) return;
  const y = window.scrollY;
  loaded.ScrollTrigger.clearScrollMemory('manual');
  loaded.ScrollTrigger.refresh();
  if (Math.abs(window.scrollY - y) > 1) instantScrollTo(y);
}

/** Forget any scroll positions ScrollTrigger remembered for the previous page. */
export function clearScrollMemory() {
  loaded?.ScrollTrigger.clearScrollMemory('manual');
}

/*
 * Navigation guard. ScrollTrigger caches the scroll position between ticks; if it auto-refreshes
 * right after ScrollManager jumps (before it has seen the scroll event), it "restores" the stale
 * value. For a short window after each navigation we re-apply the position ScrollManager chose.
 */
let intended: { y: number; until: number } | null = null;
let guardInstalled = false;

function installGuard(m: GsapModule) {
  if (guardInstalled) return;
  guardInstalled = true;
  m.ScrollTrigger.addEventListener('refresh', () => {
    if (!intended || performance.now() > intended.until) return;
    if (Math.abs(window.scrollY - intended.y) > 2) {
      instantScrollTo(intended.y);
      m.ScrollTrigger.update();
    }
  });
}

/** Called by ScrollManager after it sets the scroll position for a navigation. */
export function settleScroll(y: number) {
  intended = { y, until: performance.now() + 3000 };
  if (loaded) {
    installGuard(loaded);
    loaded.ScrollTrigger.update();
  } else {
    promise?.then(installGuard).catch(() => undefined);
  }
}

/** Cancels the guard as soon as the visitor scrolls on purpose. */
export function releaseScroll() {
  intended = null;
}

/** True while ScrollManager is still holding a position it chose for a navigation. */
export const scrollHeld = () => !!intended && performance.now() < intended.until;

// Any scroll that did not come from ScrollManager (scrollbar drag, find-in-page, scripts) ends the hold.
// ScrollTrigger's own restore is corrected synchronously in the 'refresh' listener above, so by the
// time its scroll event arrives the position already matches and the hold survives.
if (typeof window !== 'undefined') {
  window.addEventListener(
    'scroll',
    () => {
      if (intended && Math.abs(window.scrollY - intended.y) > 4) intended = null;
    },
    { passive: true },
  );
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
