import { useEffect, useRef, useState, type RefObject } from 'react';

export const RECAPTCHA_SITE_KEY = (import.meta.env.VITE_RECAPTCHA_SITE_KEY || '').trim();
export const recaptchaConfigured = RECAPTCHA_SITE_KEY.length > 10;

let loader: Promise<void> | null = null;

/** Loads the reCAPTCHA v2 script once, on demand. */
function loadScript(): Promise<void> {
  if (window.grecaptcha?.render) return Promise.resolve();
  if (!loader) {
    loader = new Promise<void>((resolve, reject) => {
      window.__lvRecaptchaReady = () => resolve();
      const s = document.createElement('script');
      // VITE_RECAPTCHA_SCRIPT_URL is set only by .env.e2e (a local stand-in); production loads Google's script
      const base = (import.meta.env.VITE_RECAPTCHA_SCRIPT_URL || '').trim() || 'https://www.google.com/recaptcha/api.js';
      s.src = `${base}?onload=__lvRecaptchaReady&render=explicit&hl=en`;
      s.async = true;
      s.defer = true;
      s.onerror = () => {
        loader = null;
        reject(new Error('recaptcha failed to load'));
      };
      document.head.appendChild(s);
    });
  }
  return loader;
}

/**
 * Renders a v2 checkbox into `box` once `trigger` is within 400px of the viewport.
 * Returns the current token (empty until solved) and a reset function.
 */
export function useRecaptcha(box: RefObject<HTMLDivElement | null>, trigger: RefObject<HTMLElement | null>) {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const widget = useRef<number | null>(null);

  useEffect(() => {
    if (!recaptchaConfigured || !trigger.current) return;
    let cancelled = false;
    const start = () => {
      setStatus('loading');
      loadScript()
        .then(() => {
          const el = box.current;
          if (cancelled || !el || !window.grecaptcha || widget.current !== null) return;
          // the mount node is owned by reCAPTCHA only: React never renders children into it
          const holder = document.createElement('div');
          el.appendChild(holder);
          widget.current = window.grecaptcha.render(holder, {
            sitekey: RECAPTCHA_SITE_KEY,
            callback: (t: string) => setToken(t),
            'expired-callback': () => setToken(''),
            'error-callback': () => setToken(''),
          });
          setStatus('ready');
        })
        .catch(() => !cancelled && setStatus('error'));
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { rootMargin: '400px 0px' },
    );
    io.observe(trigger.current);
    const mount = box.current;
    return () => {
      cancelled = true;
      io.disconnect();
      widget.current = null;
      // safe: this node never has React-managed children
      mount?.replaceChildren();
    };
  }, [box, trigger]);

  const reset = () => {
    setToken('');
    try {
      if (widget.current !== null) window.grecaptcha?.reset(widget.current);
    } catch {
      /* ignore */
    }
  };
  return { token, status, reset };
}
