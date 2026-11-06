import { LazyMotion, MotionConfig } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';

const loadFeatures = () => import('./motionFeatures').then((r) => r.default);

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

const QUERY = '(prefers-reduced-motion: reduce)';
const initialReduced = () => {
  try {
    return typeof window !== 'undefined' && window.matchMedia(QUERY).matches;
  } catch {
    return false;
  }
};

/** Live prefers-reduced-motion value with listener cleanup. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(initialReduced);
  useEffect(() => {
    let mq: MediaQueryList;
    try {
      mq = window.matchMedia(QUERY);
    } catch {
      return;
    }
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduced;
}

/** True when the device has a fine pointer that can hover. */
export function useFineHover(): boolean {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    let mq: MediaQueryList;
    try {
      mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    } catch {
      return;
    }
    const on = () => setFine(mq.matches);
    on();
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return fine;
}
