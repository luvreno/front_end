import logoUrl from '../assets/graphics/logo.svg';
import logoOnDarkUrl from '../assets/graphics/logo-on-dark.svg';
import markUrl from '../assets/graphics/mark.svg';

interface MarkProps { size?: number; className?: string; title?: string; variant?: 'light' | 'dark' }

/** The square brand mark (same artwork as the favicon). Decorative unless `title` is given. */
export function LogoMark({ size = 40, className, title }: MarkProps) {
  return <img className={className} src={markUrl} width={size} height={size} alt={title ?? ''} aria-hidden={title ? undefined : true} decoding="async" />;
}

interface LogoProps { variant?: 'light' | 'dark'; size?: number; className?: string }

/** Wordmark. `light` = for cream backgrounds, `dark` = for charcoal (green letters become cream). `size` = height in px. */
export function Logo({ variant = 'light', size = 30, className = '' }: LogoProps) {
  const h = size;
  const w = Math.round((h * 1045) / 141);
  return (
    <span className={`logo logo-${variant} ${className}`}>
      <img src={variant === 'dark' ? logoOnDarkUrl : logoUrl} width={w} height={h} alt="Luvreno" decoding="async" />
    </span>
  );
}
