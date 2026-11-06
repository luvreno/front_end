import { MARK_PATHS } from '../lib/brand.ts';

interface MarkProps { size?: number; className?: string; title?: string; variant?: 'light' | 'dark' }

export function LogoMark({ size = 40, className, title, variant = 'light' }: MarkProps) {
  const holeFill = variant === 'dark' ? 'var(--c1)' : 'var(--c4)';
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <path d={MARK_PATHS.tag} fill="var(--c2)" />
      <circle {...MARK_PATHS.hole} fill={holeFill} />
      <path d={MARK_PATHS.l} fill="none" stroke="var(--c4)" strokeWidth="3.4" strokeLinecap="round" strokeDasharray="4.5 3.6" />
      <path d={MARK_PATHS.thread} fill="none" stroke="var(--c3)" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

interface LogoProps { variant?: 'light' | 'dark'; size?: number; className?: string }

/** Mark plus wordmark. `light` = for cream backgrounds, `dark` = for charcoal. */
export function Logo({ variant = 'light', size = 38, className = '' }: LogoProps) {
  return (
    <span className={`logo logo-${variant} ${className}`}>
      <LogoMark size={size} variant={variant} />
      <span className="logo-word">Luvreno</span>
    </span>
  );
}
