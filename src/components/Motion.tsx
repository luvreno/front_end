import { m } from 'framer-motion';
import { useId, useRef, type ReactNode } from 'react';
import { useReducedMotion } from '../lib/motion';
import { useGsapContext } from '../lib/gsap';

interface RevealProps { children: ReactNode; className?: string; delay?: number; y?: number; as?: 'div' | 'li' | 'article' | 'section' }

/** Fades and lifts content in once. Reduced motion: instant fade only. */
export function Reveal({ children, className, delay = 0, y = 22, as = 'div' }: RevealProps) {
  const reduced = useReducedMotion();
  const Comp = m[as];
  return (
    <Comp
      className={className}
      initial={reduced ? { opacity: 1 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={reduced ? { duration: 0 } : { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
}

interface TagProps { label: string; variant?: 'cream' | 'green' | 'dark'; string?: boolean; className?: string; delay?: number }

/** A hang tag on a string that swings like a small pendulum and settles when it enters. */
export function HangTag({ label, variant = 'cream', string = true, className = '', delay = 0 }: TagProps) {
  const reduced = useReducedMotion();
  const cls = variant === 'green' ? 'hang-tag hang-tag-green' : variant === 'dark' ? 'hang-tag hang-tag-dark' : 'hang-tag';
  return (
    <m.span
      className={`tag-swing ${className}`}
      initial={reduced ? false : { rotate: -14 }}
      whileInView={reduced ? undefined : { rotate: [-14, 9, -5, 3, -1, 0] }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 1.8, delay, ease: 'easeOut' }}
      whileHover={reduced ? undefined : { rotate: [0, -6, 4, -2, 0], transition: { duration: 1 } }}
    >
      {string && <span className="tag-string" aria-hidden="true" />}
      <span className={cls}>{label}</span>
    </m.span>
  );
}

interface ThreadProps {
  d: string;
  viewBox: string;
  className?: string;
  /** reveal direction */
  axis?: 'x' | 'y';
  /** element whose scroll progress drives the stitch; defaults to the svg's parent */
  scrub?: boolean;
  preserveAspectRatio?: string;
}

/**
 * Decorative terracotta stitch path that "stitches itself" with scroll.
 * Only a transform (scale) on a mask rect is animated. aria-hidden.
 */
export function Thread({ d, viewBox, className = '', axis = 'y', scrub = true, preserveAspectRatio = 'none' }: ThreadProps) {
  const ref = useRef<SVGSVGElement>(null);
  const rawId = useId();
  const id = `th${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const reduced = useReducedMotion();
  const [, , w, h] = viewBox.split(/\s+/).map(Number);

  useGsapContext(
    ref,
    ({ gsap }) => {
      const rect = ref.current?.querySelector('.thread-reveal');
      const trigger = ref.current?.parentElement;
      if (!rect || !trigger) return;
      const from = axis === 'y' ? { scaleY: 0 } : { scaleX: 0 };
      const to = axis === 'y' ? { scaleY: 1 } : { scaleX: 1 };
      gsap.fromTo(rect, { ...from, transformOrigin: '0% 0%' }, {
        ...to,
        ease: 'none',
        scrollTrigger: scrub
          ? { trigger, start: 'top 80%', end: 'bottom 60%', scrub: 0.6 }
          : { trigger, start: 'top 85%', toggleActions: 'play none none none' },
        duration: scrub ? undefined : 1.4,
      });
    },
    [axis, scrub],
    !reduced,
  );

  return (
    <svg ref={ref} className={`thread-svg ${className}`} viewBox={viewBox} preserveAspectRatio={preserveAspectRatio} aria-hidden="true" focusable="false">
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="-20" y="-20" width={w + 40} height={h + 40}>
          <rect className="thread-reveal-static" x="-20" y="-20" width={w + 40} height={h + 40} fill="black" />
          <rect className={reduced ? '' : `thread-reveal thread-reveal-${axis}`}x="-20" y="-20" width={w + 40} height={h + 40} fill="white" />
        </mask>
      </defs>
      <path className="stitch" d={d} mask={`url(#${id})`} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
