// Generates the favicon set, logo files and the 1200x630 Open Graph image from the logo.
// Output goes to public/ so Vite copies it to dist/.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import opentype from 'opentype.js';
import { markSvg, MARK_PATHS, COLORS } from '../src/lib/brand.ts';

const root = path.resolve(import.meta.dirname, '..');
const pub = path.join(root, 'public');
const fontDir = (pkg) => path.join(root, 'node_modules', '@fontsource', pkg, 'files');
const loadFont = (pkg, file) => {
  const b = fs.readFileSync(path.join(fontDir(pkg), file));
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const fraunces = loadFont('fraunces', 'fraunces-latin-600-normal.woff');
const frauncesItalic = loadFont('fraunces', 'fraunces-latin-500-italic.woff');
const figtree = loadFont('figtree', 'figtree-latin-500-normal.woff');
const mono = loadFont('ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff');

// opentype.js occasionally yields NaN control points for implied on-curve points:
// fall back to the segment midpoint so no glyph drops out.
const f2 = (n) => (Math.round(n * 100) / 100).toString();
function glyphD(p) {
  let px = 0, py = 0;
  const out = [];
  for (const c of p.commands) {
    const fix = (v, a, b) => (Number.isFinite(v) ? v : (a + b) / 2);
    if (c.type === 'M' || c.type === 'L') out.push(`${c.type}${f2(c.x)} ${f2(c.y)}`);
    else if (c.type === 'Q') out.push(`Q${f2(fix(c.x1, px, c.x))} ${f2(fix(c.y1, py, c.y))} ${f2(c.x)} ${f2(c.y)}`);
    else if (c.type === 'C') out.push(`C${f2(fix(c.x1, px, c.x))} ${f2(fix(c.y1, py, c.y))} ${f2(fix(c.x2, px, c.x))} ${f2(fix(c.y2, py, c.y))} ${f2(c.x)} ${f2(c.y)}`);
    else if (c.type === 'Z') out.push('Z');
    if (c.type !== 'Z') {
      px = c.x;
      py = c.y;
    }
  }
  return out.join('');
}
const textPath = (font, text, x, y, size, fill) =>
  `<g fill="${fill}">${font.getPaths(text, x, y, size).map(glyphD).filter(Boolean).map((d) => `<path d="${d}"/>`).join('')}</g>`;
const width = (font, text, size) => font.getAdvanceWidth(text, size);

const write = (name, data) => fs.writeFileSync(path.join(pub, name), data);
const png = (svg, size) => sharp(Buffer.from(svg), { density: 300 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

/** ICO container with embedded PNG images (supported by all current browsers). */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = 6 + dir.length;
  pngs.forEach(({ size, buf }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt8(0, o + 2);
    dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(buf.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += buf.length;
  });
  return Buffer.concat([header, dir, ...pngs.map((p) => p.buf)]);
}

function logoSvg(variant) {
  const ink = variant === 'dark' ? COLORS.c4 : COLORS.c1;
  const hole = variant === 'dark' ? COLORS.c1 : COLORS.c4;
  const mark = markSvg({ hole }).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  const word = textPath(fraunces, 'Luvreno', 76, 46, 40, ink);
  const w = Math.ceil(76 + width(fraunces, 'Luvreno', 40) + 4);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="64" viewBox="0 0 ${w} 64" role="img" aria-label="Luvreno">${mark}${word}</svg>`;
}

function ogSvg() {
  const W = 1200, H = 630;
  const mark = `<g transform="translate(96 96) scale(2.4)">${markSvg({ hole: COLORS.c4 }).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g>`;
  const word = textPath(fraunces, 'Luvreno', 270, 210, 96, COLORS.c1);
  const l1 = textPath(fraunces, 'Show every customer the', 96, 360, 64, COLORS.c1);
  const right = 'right';
  const l2a = textPath(frauncesItalic, right, 96, 440, 64, COLORS.c3);
  const l2b = textPath(fraunces, 'product next.', 96 + width(frauncesItalic, right, 64) + 18, 440, 64, COLORS.c1);
  const eyebrow = textPath(mono, 'AI CUSTOMER PERSONALIZATION & RECOMMENDATION ENGINE', 96, 540, 22, COLORS.c1);
  const url = textPath(figtree, 'luvreno.net', W - 96 - width(figtree, 'luvreno.net', 26), 540, 26, COLORS.c1);
  // the thread with a hang tag
  const thread = `<path d="M760 120 C 900 60, 1040 170, 1110 110" fill="none" stroke="${COLORS.c3}" stroke-width="4" stroke-dasharray="14 10" stroke-linecap="round"/>`;
  const tag = `<g transform="translate(1040 150) rotate(-10)"><path d="M18 0h96a12 12 0 0 1 12 12v24a12 12 0 0 1-12 12H18L0 24z" fill="${COLORS.c2}"/><circle cx="20" cy="24" r="5" fill="${COLORS.c4}"/>${textPath(mono, 'For you', 34, 31, 20, COLORS.c4)}</g>`;
  const stitch = `<path d="M96 488 H 1104" stroke="${COLORS.c3}" stroke-width="3" stroke-dasharray="12 9"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${COLORS.c4}"/>${thread}${tag}${mark}${word}${l1}${l2a}${l2b}${stitch}${eyebrow}${url}</svg>`;
}

async function main() {
  fs.mkdirSync(pub, { recursive: true });

  // favicon.svg: transparent background, works on light and dark tabs
  write('favicon.svg', markSvg({ hole: COLORS.c4 }));
  write('logo-light.svg', logoSvg('light'));
  write('logo-dark.svg', logoSvg('dark'));
  write('logo-mark.svg', markSvg({ hole: COLORS.c4 }));

  const onCream = (pad) => markSvg({ size: 512, bg: COLORS.c4, padding: pad });
  const icoPngs = [];
  for (const s of [16, 32, 48]) icoPngs.push({ size: s, buf: await png(markSvg({ size: s, padding: 2 }), s) });
  write('favicon.ico', ico(icoPngs));
  write('apple-touch-icon.png', await png(onCream(8), 180));
  write('icon-192.png', await png(onCream(6), 192));
  write('icon-512.png', await png(onCream(6), 512));
  // maskable: content inside the 80% safe zone
  write('icon-maskable-512.png', await png(onCream(18), 512));

  const manifest = {
    name: 'Luvreno',
    short_name: 'Luvreno',
    description: 'AI Customer Personalization & Recommendation Engine',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: COLORS.c4,
    theme_color: COLORS.c4,
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
  write('site.webmanifest', JSON.stringify(manifest, null, 2) + '\n');

  await sharp(Buffer.from(ogSvg()), { density: 144 }).resize(1200, 630).png({ compressionLevel: 9 }).toFile(path.join(pub, 'og-image.png'));

  const expected = ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'site.webmanifest', 'og-image.png', 'logo-light.svg', 'logo-dark.svg'];
  const missing = expected.filter((f) => !fs.existsSync(path.join(pub, f)) || fs.statSync(path.join(pub, f)).size === 0);
  if (missing.length) {
    console.error('gen-icons: missing', missing);
    process.exit(1);
  }
  const meta = await sharp(path.join(pub, 'og-image.png')).metadata();
  if (meta.width !== 1200 || meta.height !== 630) {
    console.error('gen-icons: og-image is not 1200x630');
    process.exit(1);
  }
  void MARK_PATHS;
  console.log(`gen-icons: ${expected.length} files written and verified`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
