import { useId, type ReactElement } from 'react';

/**
 * Brand marks for the footer's social and directory links.
 * LinkedIn and Crunchbase: official marks from Simple Icons (CC0, simple-icons 13.21.0).
 * F6S has no published mark there, so it is a matching square badge with the name knocked out.
 * All use currentColor, so they follow the footer's text and hover colours.
 */
export type BrandName = 'linkedin' | 'crunchbase' | 'f6s';

const LINKEDIN =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z';
const CRUNCHBASE =
  'M21.6 0H2.4A2.41 2.41 0 0 0 0 2.4v19.2A2.41 2.41 0 0 0 2.4 24h19.2a2.41 2.41 0 0 0 2.4-2.4V2.4A2.41 2.41 0 0 0 21.6 0zM7.045 14.465A2.11 2.11 0 0 0 9.84 13.42h1.66a3.69 3.69 0 1 1 0-1.75H9.84a2.11 2.11 0 1 0-2.795 2.795zm11.345.845a3.55 3.55 0 0 1-1.06.63 3.68 3.68 0 0 1-3.39-.38v.38h-1.51V5.37h1.5v4.11a3.74 3.74 0 0 1 1.8-.63H16a3.67 3.67 0 0 1 2.39 6.46zm-.223-2.766a2.104 2.104 0 1 1-4.207 0 2.104 2.104 0 0 1 4.207 0z';

function F6sMark() {
  const id = useId().replace(/:/g, '');
  return (
    <>
      <mask id={`f6s-${id}`}>
        <rect width="24" height="24" fill="#fff" />
        <text x="12" y="15.6" textAnchor="middle" fontFamily="var(--font-mono), monospace" fontWeight="700" fontSize="9.5" letterSpacing="-0.4" fill="#000">F6S</text>
      </mask>
      <rect width="24" height="24" rx="2.4" mask={`url(#f6s-${id})`} />
    </>
  );
}

const marks: Record<BrandName, () => ReactElement> = {
  linkedin: () => <path d={LINKEDIN} />,
  crunchbase: () => <path d={CRUNCHBASE} />,
  f6s: () => <F6sMark />,
};

/** Picks the mark from a link label ("LinkedIn", "Crunchbase", "F6S"); null if there is none. */
export function brandFor(label: string): BrandName | null {
  const k = label.toLowerCase().replace(/[^a-z0-9]/g, '');
  return k in marks ? (k as BrandName) : null;
}

export function BrandIcon({ name, size = 20 }: { name: BrandName; size?: number }) {
  const Mark = marks[name];
  return (
    <svg className="brand-icon" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <Mark />
    </svg>
  );
}
