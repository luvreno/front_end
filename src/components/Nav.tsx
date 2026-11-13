import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navItems, navCta, topStrip } from '../content';
import { Logo } from './Logo';
import { Icon } from './Icons';
import { useFocusTrap, useScrollLock } from '../hooks/a11y';
import { useConsent } from './ConsentContext';
import { allows } from '../lib/consent';

const hrefFor = (it: (typeof navItems)[number]) => it.route ?? `/#${it.id}`;

/** IntersectionObserver scroll-spy for the home page sections. */
function useScrollSpy(enabled: boolean): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) {
      setActive(null);
      return;
    }
    const visible = new Map<string, number>();
    let io: IntersectionObserver | null = null;
    let mo: MutationObserver | null = null;
    const observed = new Set<Element>();

    const attach = () => {
      for (const it of navItems) {
        const el = document.getElementById(it.id);
        if (el && !observed.has(el)) {
          observed.add(el);
          io?.observe(el);
        }
      }
    };
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.intersectionRatio);
          else visible.delete(e.target.id);
        }
        // the section closest to the top of the viewport that is in view wins
        let best: string | null = null;
        let bestTop = Infinity;
        for (const id of visible.keys()) {
          const top = Math.abs(document.getElementById(id)?.getBoundingClientRect().top ?? Infinity);
          if (top < bestTop) {
            bestTop = top;
            best = id;
          }
        }
        setActive(best);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.01, 0.5, 1] },
    );
    attach();
    // sections may mount after the nav (lazy content), so watch for them
    mo = new MutationObserver(attach);
    mo.observe(document.getElementById('main') || document.body, { childList: true, subtree: true });
    return () => {
      io?.disconnect();
      mo?.disconnect();
      observed.clear();
    };
  }, [enabled]);
  return active;
}

/**
 * Keeps the address bar in step with the section in view on the home page (/#pricing, /#faq...),
 * so the URL can be copied or shared from anywhere on the page. Uses replaceState, so it adds no
 * history entries and does not trigger a router navigation or ScrollManager.
 */
function useHashSync(enabled: boolean, active: string | null) {
  const scrolled = useRef(false);
  useEffect(() => {
    if (!enabled) return;
    scrolled.current = false;
    const onScroll = () => (scrolled.current = true);
    window.addEventListener('scroll', onScroll, { passive: true, once: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const write = (hash: string) => {
      if (hash === location.hash) return;
      try {
        history.replaceState(history.state, '', `${location.pathname}${location.search}${hash}`);
      } catch {
        /* Safari rate-limits replaceState; the URL simply stays as it was */
      }
    };
    if (active) {
      write(`#${active}`);
      return;
    }
    // Between tracked sections keep the last hash; back above the first one (hero, intro) drop it.
    let raf = 0;
    const check = () => {
      raf = 0;
      if (!scrolled.current) return; // first paint of a /#section link: ScrollManager has not scrolled yet
      const first = document.getElementById(navItems[0].id);
      if (first && first.getBoundingClientRect().top > window.innerHeight * 0.5) write('');
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [enabled, active]);
}

export function TopStrip() {
  const { consent } = useConsent();
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem(topStrip.storageKey) === '1' || sessionStorage.getItem(topStrip.storageKey) === '1') setHidden(true);
    } catch {
      /* storage blocked: show the strip */
    }
  }, []);
  const dismiss = () => {
    setHidden(true);
    try {
      // Remembered across visits only with Preferences consent, otherwise for this session.
      (allows(consent, 'preferences') ? localStorage : sessionStorage).setItem(topStrip.storageKey, '1');
    } catch {
      /* ignore */
    }
  };
  if (hidden) return null;
  return (
    <div className="top-strip on-dark" data-testid="top-strip">
      <div className="container top-strip-inner">
        <Link to={topStrip.to} className="top-strip-link">
          {topStrip.text} <span aria-hidden="true">→</span>
        </Link>
        <button type="button" className="top-strip-close" onClick={dismiss} aria-label="Dismiss announcement">
          <Icon name="close" size={18} />
        </button>
      </div>
    </div>
  );
}

export function Nav() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const spy = useScrollSpy(isHome);
  useHashSync(isHome, spy);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const menuBtn = useRef<HTMLButtonElement>(null);

  // close the menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const activeId = isHome ? spy : pathname.startsWith('/blog') ? 'journal' : null;
  const ctaActive = pathname === navCta.to;

  return (
    <header className="masthead" data-testid="masthead">
      <div className="container masthead-inner">
        <Link to="/" className="masthead-logo" aria-label="Luvreno home">
          <Logo />
        </Link>
        <nav aria-label="Primary" className="nav-desktop">
          <ol className="nav-index">
            {navItems.map((it) => {
              const active = activeId === it.id;
              return (
                <li key={it.id}>
                  <Link
                    to={hrefFor(it)}
                    className={`nav-link${active ? ' is-active' : ''}`}
                    aria-current={active ? (it.route && pathname.startsWith(it.route) ? 'page' : 'location') : undefined}
                    data-nav={it.id}
                  >
                    <span className="nav-num">{it.num}</span>
                    <span className="nav-label">{it.label}</span>
                    <span className="nav-tag" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
        <Link to={navCta.to} className={`tag-cta${ctaActive ? ' is-active' : ''}`} aria-current={ctaActive ? 'page' : undefined} data-testid="nav-cta">
          <span className="tag-cta-hole" aria-hidden="true" />
          {navCta.label}<span className="sr-only">{navCta.srHint}</span>
        </Link>
        <button
          ref={menuBtn}
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
          data-testid="menu-btn"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      <MobileMenu open={open} onClose={close} activeId={activeId} opener={menuBtn} />
    </header>
  );
}

function MobileMenu({ open, onClose, activeId, opener }: { open: boolean; onClose: () => void; activeId: string | null; opener: React.RefObject<HTMLButtonElement | null> }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, onClose, undefined, opener);
  useScrollLock(open);
  return (
    <div
      ref={ref}
      id="mobile-menu"
      className={`mobile-menu on-dark${open ? ' is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      hidden={!open}
      data-testid="mobile-menu"
    >
      <div className="mobile-menu-top">
        <Link to="/" onClick={onClose} aria-label="Luvreno home" className="masthead-logo">
          <Logo variant="dark" />
        </Link>
        <button type="button" className="menu-btn menu-btn-dark" onClick={onClose} aria-label="Close menu">
          Close
        </button>
      </div>
      <nav aria-label="Mobile" className="mobile-index">
        <svg className="mobile-thread" viewBox="0 0 20 600" preserveAspectRatio="none" aria-hidden="true">
          <path d="M10 0 C 2 80, 18 160, 10 240 S 2 400, 10 600" />
        </svg>
        <ol>
          {navItems.map((it, i) => (
            <li key={it.id} style={{ ['--i' as string]: i }}>
              <Link to={hrefFor(it)} onClick={onClose} className={activeId === it.id ? 'is-active' : undefined} aria-current={activeId === it.id ? 'location' : undefined}>
                <span className="mobile-num">{it.num}</span>
                <span className="mobile-label">{it.label}</span>
              </Link>
            </li>
          ))}
        </ol>
        <Link to={navCta.to} onClick={onClose} className="btn btn-primary btn-lg mobile-cta">
          {navCta.label}<span className="sr-only">{navCta.srHint}</span> <span className="arrow" aria-hidden="true">→</span>
        </Link>
      </nav>
    </div>
  );
}
