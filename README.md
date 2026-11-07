# Luvreno frontend (luvreno.net)

Static React site for Luvreno, an AI Customer Personalization & Recommendation Engine for retail and e-commerce. It is built with Vite and deployed by FTP to an Apache host. PHP endpoints in `api/` handle the contact form, newsletter and moderated testimonials.

- **Site:** https://luvreno.net
- **Dashboard (linked, not part of this repo):** https://portal.luvreno.net
- **Design:** "Stitch & Tag". Four colours only (`#161616`, `#346751`, `#C84B31`, `#ECDBBA`), with Fraunces, Figtree and IBM Plex Mono self-hosted.

## Quick start

```bash
npm install
cp .env.example .env        # then fill in the values below
npm run dev                 # http://localhost:5173 (PHP endpoints are stubbed locally)
npm run build               # writes dist/, ready to upload
npm run check               # full gate: types, lint, content, tests, build, links, contrast, PHP
```

Requires Node 20+ (tested on Node 24). `npm run check:php` also needs `php` on PATH (tested with PHP 8.2).

## Where things live

| What | Where |
| --- | --- |
| All text, numbers, links, prices, FAQ, company details | `src/content.ts` |
| Journal posts (Markdown with front matter) | `src/content/blog/*.md` |
| Real, permitted testimonials added by hand (optional) | `src/content/testimonials.seed.json` (empty by default) |
| Design tokens and type scale | `src/styles/base.css` |
| SEO titles, descriptions, JSON-LD | `src/lib/seoData.ts` |
| PHP endpoints and examples | `public/api/` |
| Apache rules | `public/.htaccess` |
| Logo geometry (favicons and OG image are generated from it) | `src/lib/brand.ts` |

Placeholders are written in square brackets, for example `[Phone to be added]`. They show as visible text but never become `tel:`, `mailto:` or JSON-LD. `npm run check:placeholders` lists every one that is still open.

## Configuration

### 1. `.env` (public values only, bundled into the browser)

| Variable | Value |
| --- | --- |
| `VITE_SITE_URL` | `https://luvreno.net` |
| `VITE_DASHBOARD_URL` | `https://portal.luvreno.net` |
| `VITE_RECAPTCHA_SITE_KEY` | reCAPTCHA v2 checkbox **site** key (see below) |
| `VITE_CHAT_PROVIDER` | `none` (the optional provider loader is a stub) |
| `VITE_STRIPE_LINK_STARTER` | Stripe **test-mode** Payment Link for Starter |
| `VITE_STRIPE_LINK_GROWTH` | Stripe **test-mode** Payment Link for Growth |

Never put secrets in `.env`: anything starting with `VITE_` is public. If a Stripe link is missing, its button renders disabled with "Sandbox checkout not configured". If the reCAPTCHA key is missing, the forms show "Contact form not configured" and their submit buttons are disabled in production. Rebuild after any change.

### 2. `api/config.php` (secrets, created by hand on the server)

Copy `public/api/config.example.php` to `api/config.php` **on the server** and fill it in:

```php
return [
    'RECAPTCHA_SECRET' => 'your reCAPTCHA v2 SECRET key',
    'RECAPTCHA_HOSTNAMES' => ['luvreno.net', 'www.luvreno.net'],
    'MAIL_TO' => 'inbox that receives messages',
    'MAIL_FROM' => 'no-reply@luvreno.net',   // a fixed address on your own domain
    'ADMIN_PASSWORD_HASH' => '...',          // see below
    'IP_SALT' => 'any long random string',
];
```

Create the admin password hash with:

```bash
php -r "echo password_hash('a-long-unique-password', PASSWORD_DEFAULT), PHP_EOL;"
```

`config.php` is gitignored, and `api/.htaccess` denies direct web access to `config*.php`, `lib.php` and data files.

### 3. reCAPTCHA keys

1. Go to https://www.google.com/recaptcha/admin/create.
2. Choose **reCAPTCHA v2 → "I'm not a robot" Checkbox**.
3. Add the domains `luvreno.net` and `www.luvreno.net`.
4. Put the **site key** in `.env` (`VITE_RECAPTCHA_SITE_KEY`) and the **secret key** in `api/config.php` (`RECAPTCHA_SECRET`).
5. Rebuild and upload.

### 4. Stripe test-mode Payment Links

1. In the Stripe Dashboard, switch on **Test mode**.
2. Create two products with monthly recurring prices: Starter (USD 39 per month) and Growth (USD 119 per month). These are placeholder prices to confirm with the client.
3. For each one, go to **Payment Links → New**, choose the price, and under **After payment** set **Don't show confirmation page → redirect** to `https://luvreno.net/checkout/success`.
4. Copy each link (it starts with `https://buy.stripe.com/test_`) into `VITE_STRIPE_LINK_STARTER` and `VITE_STRIPE_LINK_GROWTH`.
5. Rebuild and upload. Pay with the test card `4242 4242 4242 4242`, any future expiry date and any CVC.

## Deploying by FTP

1. Run `npm run check`, or at least `npm run build`. Do not upload if it fails.
2. Upload **the contents of `dist/`** (not the folder itself) to the web root of luvreno.net. Include the hidden files: `.htaccess`, `api/.htaccess` and `api/data/.htaccess`. Many FTP clients hide dotfiles by default, so turn on "show hidden files".
3. On the server, create `api/config.php` from `api/config.example.php` (see above). Do not upload a local copy with real secrets from your machine unless you mean to.
4. Make sure the `api/data/` folder is writable by PHP (usually 755 or 775, depending on the host). The endpoints create `testimonials.json` there on the first submission.
5. Upload new builds the same way. Hashed files in `assets/` can stay. Old ones are harmless and can be cleaned up occasionally.

`dist/` contains: the per-route HTML files (`index.html`, `product.html`, `blog.html`, `blog/<slug>.html`, legal pages, `checkout/success.html`, `404.html`), `assets/`, `.htaccess`, `robots.txt`, `sitemap.xml`, `rss.xml`, favicons, `site.webmanifest`, `og-image.png`, logos, `api/*.php` and `api/config.example.php`.

## After upload: checks to run

Replace nothing. These are the live URLs.

```bash
# HTTPS and www redirects: each should return 301 with the Location shown
curl -sI http://luvreno.net/            | grep -iE "^HTTP|^location"   # -> https://luvreno.net/
curl -sI http://www.luvreno.net/product | grep -iE "^HTTP|^location"   # -> https://luvreno.net/product
curl -sI https://www.luvreno.net/blog   | grep -iE "^HTTP|^location"   # -> https://luvreno.net/blog
curl -sI https://luvreno.net/blog/      | grep -iE "^HTTP|^location"   # -> https://luvreno.net/blog
curl -sI https://luvreno.net/product.html | grep -iE "^HTTP|^location" # -> https://luvreno.net/product

# Pages: 200, and a real 404 for unknown URLs
curl -sI https://luvreno.net/ | head -1
curl -sI https://luvreno.net/product | head -1
curl -sI https://luvreno.net/blog/manual-and-calculated-segments | head -1
curl -sI https://luvreno.net/no-such-page | head -1                    # -> 404

# Each page carries its own head for crawlers
curl -s https://luvreno.net/product | grep -o '<link rel="canonical"[^>]*>'
curl -s https://luvreno.net/product | grep -o '<title[^<]*</title>'

# SEO files
curl -sI https://luvreno.net/robots.txt | head -1
curl -sI https://luvreno.net/sitemap.xml | head -1
curl -sI https://luvreno.net/rss.xml | head -1

# Security and caching headers
curl -sI https://luvreno.net/ | grep -iE "strict-transport|content-security|x-frame|x-content-type|cache-control"
curl -sI https://luvreno.net/assets/$(curl -s https://luvreno.net/ | grep -o 'index-[^"]*\.js' | head -1) | grep -iE "cache-control|content-encoding"

# Secrets and data are not reachable (all should be 403 or 404)
curl -sI https://luvreno.net/api/config.php | head -1
curl -sI https://luvreno.net/api/config.example.php | head -1
curl -sI https://luvreno.net/api/lib.php | head -1
curl -sI https://luvreno.net/api/data/testimonials.json | head -1
curl -sI https://luvreno.net/.htaccess | head -1

# API responds
curl -s https://luvreno.net/api/testimonials.php                       # -> {"ok":true,"items":[...]}
```

Then, in a browser: submit the contact form and confirm the email arrives, sign up to the newsletter, submit feedback and approve it at `https://luvreno.net/api/testimonials-admin.php`, run one Stripe test payment for each plan, and check SEOptimer (or a similar tool) for canonical, sitemap and robots.

## Testimonial moderation

- Visitors submit feedback on the home page. It is stored as **pending** in `api/data/testimonials.json` and is never public until approved.
- Moderate at `https://luvreno.net/api/testimonials-admin.php` (HTTPS only, noindex). Log in with the password whose hash is in `config.php`, then approve, reject or delete. Use **Log out** when done.
- Five failed logins in 15 minutes from the same address lock the form for 15 minutes.
- The pending queue is capped at 200. Feedback containing links or email addresses is rejected.
- The home page polls every 30 seconds while the tab is visible, so approved items appear without a reload.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server (PHP endpoints answered by a local stub) |
| `npm run build` | Icons, type-check, Vite build, per-route HTML, sitemap, RSS, robots, price check, dist check |
| `npm run check` | Full gate: everything below except `check:external` and `e2e` |
| `npm run typecheck` / `lint` / `test` | TypeScript, ESLint, Vitest unit tests |
| `npm run check:dashes` | Fails on em dashes, `--` in text, filler phrases, lorem ipsum, "coming soon", TODO |
| `npm run check:placeholders` | Lists every unfilled placeholder (warnings only) |
| `npm run check:links` | Renders every route in Chromium and validates every link and `#id` |
| `npm run check:contrast` | WCAG AA on every rendered text element at 375 and 1280px, plus the colour rules |
| `npm run check:prices` | Fails if any price is shown from anywhere but `getPrice()` |
| `npm run check:php` | PHP lint and functional tests of the endpoints (`PHP_LIVE_RECAPTCHA=1` adds a live Google test-key round trip) |
| `npm run check:external` | Requests every external link (network; run `check:links` first) |
| `npm run check:secrets` | Scans everything git would push for secrets. Run before every push |
| `npm run e2e` | Playwright in Chromium, Firefox and WebKit at 375, 768 and 1280px |

The e2e suite builds a separate `dist-e2e/` with public test values from `.env.e2e`: Google's documented test site key and fake `test_` Stripe URLs. In the tests, Google's script is stubbed and the API is mocked. A second server runs the real `dist/` to check the "not configured" states.

## Editing content

- **Text, prices, FAQ:** edit `src/content.ts`. The block marked `// PLACEHOLDER PRICES AND LIMITS: confirm with client.` holds the plan prices and limits. Everything that shows a price uses `getPrice()`, so one change updates the cards, the comparison table, the product page and the chatbot.
- **New Journal post:** add `src/content/blog/<slug>.md` with front matter (`title`, `slug`, `date`, `category`, `excerpt`, `readingTime`, `author: Luvreno Team`). The sitemap, RSS and static HTML are generated at build time.
- **Social and citation links:** add real URLs to `socialLinks` / `citationLinks` in `content.ts`. Empty groups stay hidden.
- **Company details:** replace the bracketed placeholders in `company`. Phone and email become links automatically once they are real.
- **Analytics or a chat provider:** wire them in `loadAnalytics()` / `loadChatProvider()` in `src/lib/consent.ts` (they only run after consent), and add the provider's domains to the CSP in `public/.htaccess`.
