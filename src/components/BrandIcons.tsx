import { useId, type ReactElement } from 'react';

/**
 * Brand marks for the footer's social and directory links.
 * LinkedIn, Facebook, X, YouTube, Pinterest and Crunchbase: official marks from Simple Icons (CC0, simple-icons 13.21.0).
 * F6S has no published mark there, so it is a matching square badge with the name knocked out.
 * All use currentColor, so they follow the footer's text and hover colours.
 */
export type BrandName = 'linkedin' | 'facebook' | 'x' | 'youtube' | 'pinterest' | 'crunchbase' | 'f6s';

const LINKEDIN =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z';
const CRUNCHBASE =
  'M21.6 0H2.4A2.41 2.41 0 0 0 0 2.4v19.2A2.41 2.41 0 0 0 2.4 24h19.2a2.41 2.41 0 0 0 2.4-2.4V2.4A2.41 2.41 0 0 0 21.6 0zM7.045 14.465A2.11 2.11 0 0 0 9.84 13.42h1.66a3.69 3.69 0 1 1 0-1.75H9.84a2.11 2.11 0 1 0-2.795 2.795zm11.345.845a3.55 3.55 0 0 1-1.06.63 3.68 3.68 0 0 1-3.39-.38v.38h-1.51V5.37h1.5v4.11a3.74 3.74 0 0 1 1.8-.63H16a3.67 3.67 0 0 1 2.39 6.46zm-.223-2.766a2.104 2.104 0 1 1-4.207 0 2.104 2.104 0 0 1 4.207 0z';
const FACEBOOK =
  'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z';
const X =
  'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z';
const YOUTUBE =
  'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z';
const PINTEREST =
  'M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z';

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
  facebook: () => <path d={FACEBOOK} />,
  x: () => <path d={X} />,
  youtube: () => <path d={YOUTUBE} />,
  pinterest: () => <path d={PINTEREST} />,
  crunchbase: () => <path d={CRUNCHBASE} />,
  f6s: () => <F6sMark />,
};

const aliases: Record<string, BrandName> = { xtwitter: 'x', twitter: 'x' };

/** Picks the mark from a link label ("LinkedIn", "X (Twitter)", "F6S"); null if there is none. */
export function brandFor(label: string): BrandName | null {
  const k0 = label.toLowerCase().replace(/[^a-z0-9]/g, '');
  const k = aliases[k0] ?? k0;
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
