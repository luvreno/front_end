import type { ReactElement } from 'react';
/** Small line-art icons, decorative unless a label is passed. */
export type IconName =
  | 'profile' | 'catalog' | 'segment' | 'rule' | 'report' | 'lock' | 'history'
  | 'arrow' | 'close' | 'chat' | 'check' | 'plus' | 'up' | 'link' | 'send' | 'star' | 'external' | 'search';

const paths: Record<IconName, ReactElement> = {
  profile: (<><circle cx="12" cy="8.5" r="3.6" /><path d="M4.5 20c.8-4 3.8-6 7.5-6s6.7 2 7.5 6" /></>),
  catalog: (<><rect x="3.5" y="4" width="7" height="7" rx="1.5" /><rect x="13.5" y="4" width="7" height="7" rx="1.5" /><rect x="3.5" y="14" width="7" height="6.5" rx="1.5" /><path d="M14 16h6M14 19h4" /></>),
  segment: (<><circle cx="8" cy="9" r="4.5" /><circle cx="16" cy="9" r="4.5" /><circle cx="12" cy="16" r="4.5" /></>),
  rule: (<><path d="M4 6h10M4 12h6M4 18h12" /><circle cx="18" cy="6" r="2.4" /><circle cx="14" cy="12" r="2.4" /><path d="M19 16l2 2-2 2" /></>),
  report: (<><path d="M4 20V4M4 20h16" /><path d="M8 16v-4M12 16V8M16 16v-6" /></>),
  lock: (<><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2" /></>),
  history: (<><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v3.5h3.5" /><path d="M12 8v4.5l3 2" /></>),
  arrow: (<path d="M5 12h14M13 6l6 6-6 6" />),
  close: (<path d="M6 6l12 12M18 6L6 18" />),
  chat: (<path d="M5 18.5V7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H9z" />),
  check: (<path d="M5 12.5l4.5 4.5L19 7.5" />),
  plus: (<path d="M12 5v14M5 12h14" />),
  up: (<path d="M12 19V5M6 11l6-6 6 6" />),
  link: (<><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>),
  send: (<path d="M4 12l16-7-6 15-3-6z" />),
  star: (<path d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z" />),
  external: (<><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>),
  search: (<><circle cx="11" cy="11" r="6" /><path d="M16 16l4 4" /></>),
};

interface Props { name: IconName; size?: number; className?: string; label?: string; strokeWidth?: number }

export function Icon({ name, size = 22, className, label, strokeWidth = 1.8 }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
