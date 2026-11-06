import { LogoMark } from './Logo';

/** Loading state for lazy routes. Reserves height so the footer does not jump. */
export function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <LogoMark size={56} className="loader-mark" />
      <span className="sr-only">Loading page</span>
    </div>
  );
}
