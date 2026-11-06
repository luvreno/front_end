import { useEffect, useState } from 'react';
import { LogoMark } from './Logo';

const KEY = 'lv-intro-v1';

/** A short logo intro: at most 1s, once per session, never blocks interaction. */
export function Intro() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let seen: boolean;
    try {
      seen = sessionStorage.getItem(KEY) === '1' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      sessionStorage.setItem(KEY, '1');
    } catch {
      seen = true;
    }
    if (seen) return;
    setShow(true);
    const t = window.setTimeout(() => setShow(false), 1000);
    return () => window.clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div className="intro" aria-hidden="true">
      <LogoMark size={72} className="intro-mark" />
    </div>
  );
}
