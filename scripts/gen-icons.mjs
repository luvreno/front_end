// Generates the favicon set, app icons, logo files and the 1200x630 Open Graph image from the brand artwork:
//   public/favicon.svg               the square mark (edited by hand, never overwritten here)
//   src/assets/graphics/logo*.svg    the wordmark, for light and dark backgrounds
// Output goes to public/ so Vite copies it to dist/.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import opentype from 'opentype.js';
import { COLORS } from '../src/lib/brand.ts';

const root = path.resolve(import.meta.dirname, '..');
const pub = path.join(root, 'public');
const gfx = path.join(root, 'src', 'assets', 'graphics');
const markSrc = fs.readFileSync(path.join(pub, 'favicon.svg'));
const logoSrc = fs.readFileSync(path.join(gfx, 'logo.svg'));
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
/** The mark centred on a square canvas, optionally on a solid background, padded by a share of the size. */
async function markPng(size, { bg = null, pad = 0.06 } = {}) {
  const inner = Math.round(size * (1 - pad * 2));
  const clear = { r: 0, g: 0, b: 0, alpha: 0 };
  // favicon.svg is used exactly as designed; only the raster icons trim its spare canvas so small sizes stay legible
  const trimmed = await sharp(markSrc, { density: 600 }).trim().png().toBuffer();
  const mark = await sharp(trimmed).resize(inner, inner, { fit: 'contain', background: clear }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: bg ?? clear } })
    .composite([{ input: mark, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

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

/** Text layer of the Open Graph image (the logo is composited on top in main). */
function ogSvg() {
  const W = 1200, H = 630;
  const l1 = textPath(fraunces, 'Make every customer experience', 96, 330, 62, COLORS.c1);
  const more = 'more ';
  const l2a = textPath(fraunces, more, 96, 410, 62, COLORS.c1);
  const l2b = textPath(frauncesItalic, 'personal.', 96 + width(fraunces, more, 62), 410, 62, COLORS.c3);
  const stitch = `<path d="M96 478 H 1104" stroke="${COLORS.c3}" stroke-width="3" stroke-dasharray="12 9"/>`;
  const eyebrow = textPath(mono, 'AI CUSTOMER PERSONALIZATION & RECOMMENDATION ENGINE', 96, 540, 22, COLORS.c1);
  const url = textPath(figtree, 'luvreno.net', W - 96 - width(figtree, 'luvreno.net', 26), 540, 26, COLORS.c1);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${COLORS.c4}"/>${l1}${l2a}${l2b}${stitch}${eyebrow}${url}</svg>`;
}

async function main() {
  fs.mkdirSync(pub, { recursive: true });

  // logo files for other sites and documents (the app imports the same artwork from src/assets)
  write('logo-light.svg', logoSrc);
  write('logo-dark.svg', fs.readFileSync(path.join(gfx, 'logo-on-dark.svg')));
  write('logo-mark.svg', markSrc);

  const cream = COLORS.c4;
  const icoPngs = [];
  for (const s of [16, 32, 48]) icoPngs.push({ size: s, buf: await markPng(s, { pad: 0.02 }) });
  write('favicon.ico', ico(icoPngs));
  write('apple-touch-icon.png', await markPng(180, { bg: cream, pad: 0.12 }));
  write('icon-192.png', await markPng(192, { bg: cream, pad: 0.1 }));
  write('icon-512.png', await markPng(512, { bg: cream, pad: 0.1 }));
  // maskable: content inside the 80% safe zone
  write('icon-maskable-512.png', await markPng(512, { bg: cream, pad: 0.2 }));

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

  const ogLogo = await sharp(logoSrc, { density: 300 }).resize({ width: 560 }).png().toBuffer();
  await sharp(Buffer.from(ogSvg()), { density: 144 })
    .resize(1200, 630)
    .composite([{ input: ogLogo, left: 96, top: 120 }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(pub, 'og-image.png'));

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
  console.log(`gen-icons: ${expected.length} files written and verified`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
