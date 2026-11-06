// Brand geometry shared by the React logo and scripts/gen-icons.mjs. Plain TS, no JSX.
export const COLORS = { c1: '#161616', c2: '#346751', c3: '#C84B31', c4: '#ECDBBA' } as const;

/** Luvreno mark (64x64): a hang tag whose stitched, looped thread forms a soft "L". */
export const MARK_PATHS = {
  tag: 'M29.2 6.6a4.4 4.4 0 0 1 5.6 0l14.6 12.1a5 5 0 0 1 1.8 3.9V55a5 5 0 0 1-5 5H18.8a5 5 0 0 1-5-5V22.6a5 5 0 0 1 1.8-3.9z',
  hole: { cx: 32, cy: 18, r: 3.8 },
  l: 'M24.5 29v14.5a5.5 5.5 0 0 0 5.5 5.5h12',
  thread: 'M32 18C27 7 15 2 8.5 7.5 3.5 11.8 7 19 13 17',
};

/** Standalone SVG markup of the mark with literal colours (for favicons and files). */
export function markSvg(opts: { size?: number; bg?: string; hole?: string; padding?: number } = {}): string {
  const { size = 64, bg, hole = COLORS.c4, padding = 0 } = opts;
  const vb = 64 + padding * 2;
  const bgRect = bg ? `<rect x="${-padding}" y="${-padding}" width="${vb}" height="${vb}" fill="${bg}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${-padding} ${-padding} ${vb} ${vb}">${bgRect}<path d="${MARK_PATHS.tag}" fill="${COLORS.c2}"/><circle cx="${MARK_PATHS.hole.cx}" cy="${MARK_PATHS.hole.cy}" r="${MARK_PATHS.hole.r}" fill="${hole}"/><path d="${MARK_PATHS.l}" fill="none" stroke="${COLORS.c4}" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="4.5 3.6"/><path d="${MARK_PATHS.thread}" fill="none" stroke="${COLORS.c3}" stroke-width="2.6" stroke-linecap="round"/></svg>`;
}
