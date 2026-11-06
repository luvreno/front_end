import type { ReactElement } from 'react';
import type { ProductArt as Kind } from '../content';

/** Line-art product objects: charcoal strokes with flat green, terracotta or cream fills. */
const S = { stroke: 'var(--c1)', strokeWidth: 2.2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

const art: Record<Kind, ReactElement> = {
  mug: (
    <g {...S}>
      <ellipse cx="60" cy="98" rx="34" ry="5" fill="rgba(22,22,22,.08)" stroke="none" />
      <path d="M30 40h50v42a12 12 0 0 1-12 12H42a12 12 0 0 1-12-12z" fill="var(--c2)" />
      <path d="M80 50h6a10 10 0 0 1 0 20h-6" fill="none" />
      <path d="M30 52h50" fill="none" strokeDasharray="4 4" stroke="var(--c4)" />
      <path d="M44 30c0-5 6-5 6-10M58 30c0-5 6-5 6-10" fill="none" />
    </g>
  ),
  sneaker: (
    <g {...S}>
      <ellipse cx="60" cy="96" rx="44" ry="5" fill="rgba(22,22,22,.08)" stroke="none" />
      <path d="M16 82V58c0-4 3-7 7-7h8l10 10 14-4c12 8 30 14 42 16a8 8 0 0 1 7 8v1H16z" fill="var(--c4)" />
      <path d="M16 82h88v6a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3z" fill="var(--c3)" />
      <path d="M41 61l6 8M50 58l6 8M59 61l5 7" fill="none" />
      <path d="M23 51c0-8 8-10 12-4" fill="none" />
    </g>
  ),
  lamp: (
    <g {...S}>
      <ellipse cx="60" cy="100" rx="30" ry="4" fill="rgba(22,22,22,.08)" stroke="none" />
      <path d="M40 24h40l12 30H28z" fill="var(--c3)" />
      <path d="M60 54v36" fill="none" />
      <path d="M42 96a18 6 0 0 1 36 0z" fill="var(--c2)" />
      <path d="M52 62a8 8 0 0 0 16 0" fill="var(--c4)" />
    </g>
  ),
  tote: (
    <g {...S}>
      <ellipse cx="60" cy="100" rx="34" ry="4" fill="rgba(22,22,22,.08)" stroke="none" />
      <path d="M44 42c0-20 32-20 32 0" fill="none" strokeWidth="3" />
      <path d="M28 42h64l-6 54H34z" fill="var(--c4)" />
      <path d="M40 60h40M40 68h28" fill="none" stroke="var(--c3)" strokeDasharray="5 4" />
      <circle cx="74" cy="80" r="7" fill="var(--c2)" />
    </g>
  ),
  plant: (
    <g {...S}>
      <ellipse cx="60" cy="102" rx="28" ry="4" fill="rgba(22,22,22,.08)" stroke="none" />
      <path d="M60 64C58 46 46 36 32 36c0 16 12 26 28 28zM60 64c2-22 16-34 32-34 0 20-14 32-32 34zM60 64V40" fill="var(--c2)" />
      <path d="M38 64h44l-6 34H44z" fill="var(--c3)" />
      <path d="M36 64h48v8H36z" fill="var(--c4)" />
    </g>
  ),
  notebook: (
    <g {...S}>
      <ellipse cx="60" cy="102" rx="32" ry="4" fill="rgba(22,22,22,.08)" stroke="none" />
      <rect x="32" y="20" width="56" height="76" rx="6" fill="var(--c2)" />
      <path d="M42 20v76" fill="none" stroke="var(--c4)" strokeDasharray="4 4" />
      <rect x="52" y="36" width="26" height="14" rx="3" fill="var(--c4)" />
      <path d="M82 20v30l-5-4-5 4V20" fill="var(--c3)" />
    </g>
  ),
  watch: (
    <g {...S}>
      <ellipse cx="60" cy="104" rx="22" ry="4" fill="rgba(22,22,22,.08)" stroke="none" />
      <path d="M48 16h24l-3 22H51zM51 82h18l3 20H48z" fill="var(--c3)" />
      <circle cx="60" cy="60" r="24" fill="var(--c4)" />
      <circle cx="60" cy="60" r="18" fill="none" strokeDasharray="2 5" />
      <path d="M60 48v12l8 6" fill="none" stroke="var(--c2)" strokeWidth="3" />
      <path d="M84 58h4v6h-4" fill="var(--c2)" />
    </g>
  ),
};

interface Props { kind: Kind; size?: number; className?: string; label?: string }

export function ProductArt({ kind, size = 120, className, label }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {art[kind]}
    </svg>
  );
}
