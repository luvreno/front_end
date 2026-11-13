import { test, expect, type Page } from '@playwright/test';

const PROD = 'http://127.0.0.1:4281';
const posts = [
  'why-generic-recommendations-fall-flat',
  'manual-and-calculated-segments',
  'recommendation-rules-merchandisers-can-maintain',
  'related-vs-complementary-products',
  'recommendation-metrics-to-track',
  'handling-customer-data-responsibly',
];
const routes = ['/', '/product', '/blog', ...posts.map((p) => `/blog/${p}`), '/privacy', '/terms', '/cookies', '/checkout/success', '/no-such-page'];

const width = (page: Page) => page.viewportSize()?.width ?? 1280;
const isDesktop = (page: Page) => width(page) >= 1024;

interface Watch { errors: string[]; thirdParty: string[] }

/** Stubs the API and Google's reCAPTCHA script, records console errors and failed requests. */
/**
 * Picks an API scenario for the local preview stub (see vite.config.ts) with a cookie.
 * Request interception (page.route) is not used: in this environment it makes Firefox and
 * WebKit abort the first navigation, even for static files.
 */
async function scenario(page: Page, ...flags: string[]) {
  const ctx = page.context();
  await ctx.clearCookies({ name: 'lv-e2e' });
  const value = ['e2e', ...flags].join('.');
  await ctx.addCookies([
    { name: 'lv-e2e', value, url: 'http://127.0.0.1:4280' },
    { name: 'lv-e2e', value, url: 'http://127.0.0.1:4281' },
  ]);
}

async function prepare(page: Page, opts: { consent?: boolean; testimonials?: boolean } = {}): Promise<Watch> {
  const w: Watch = { errors: [], thirdParty: [] };
  page.on('console', (m) => m.type() === 'error' && w.errors.push(`console: ${m.text()}`));
  page.on('pageerror', (e) => w.errors.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => {
    const reason = r.failure()?.errorText || '';
    // navigations away and aborted polls are not failures
    if (!/ERR_ABORTED|NS_BINDING_ABORTED|cancelled|Load request cancelled/i.test(reason)) w.errors.push(`requestfailed: ${r.url()} ${reason}`);
  });
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (!['localhost', '127.0.0.1'].includes(u.hostname)) w.thirdParty.push(r.url());
  });
  await scenario(page, ...(opts.testimonials ? ['items'] : []));
  await page.addInitScript((consent) => {
    sessionStorage.setItem('lv-intro-v1', '1');
    if (consent) localStorage.setItem('lv-consent', JSON.stringify({ version: '2026-11-01', timestamp: new Date().toISOString(), necessary: true, preferences: false, analytics: false }));
  }, opts.consent ?? true);
  return w;
}

test.describe('every route', () => {
  for (const route of routes) {
    test(`${route} loads without console errors or failed requests`, async ({ page }) => {
      const w = await prepare(page);
      const res = await page.goto(route, { waitUntil: 'networkidle' });
      expect(res?.status()).toBeLessThan(400);
      await expect(page.locator('h1')).toHaveCount(1);
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 40));
        }
      });
      await page.waitForTimeout(300);
      expect(w.errors).toEqual([]);
      // no horizontal page scroll at any width: the page cannot be panned sideways, even without the
      // body clip (iOS), and nothing outside a clipping container extends past the viewport
      const overflow = await page.evaluate(() => {
        document.body.style.setProperty('overflow-x', 'visible', 'important');
        window.scrollTo(400, window.scrollY);
        const panned = window.scrollX;
        window.scrollTo(0, window.scrollY);
        const clipped = (el: Element) => {
          for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) if (getComputedStyle(n).overflowX !== 'visible') return true;
          return false;
        };
        const offenders = [...document.querySelectorAll('body *')]
          .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.right > window.innerWidth + 1 && getComputedStyle(el).position !== 'fixed' && !clipped(el); })
          .map((el) => `${el.tagName.toLowerCase()}.${String((el as HTMLElement).className)}`);
        document.body.style.removeProperty('overflow-x');
        return { panned, offenders };
      });
      expect(overflow).toEqual({ panned: 0, offenders: [] });
    });
  }
});

test('hero button reaches /product', async ({ page }) => {
  await prepare(page);
  await page.goto('/');
  await page.getByTestId('hero-cta').click();
  await expect(page).toHaveURL(/\/product$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Make every recommendation feel more relevant.');
  await expect(page.getByText('L.VIA by Luvreno', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('/product presents L.VIA, its roadmap and the live portal', async ({ page }) => {
  await prepare(page);
  await page.goto('/product');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Make every recommendation feel more relevant.');
  await expect(page.getByRole('heading', { name: /thoughtful path from rules to learned recommendations/i })).toBeVisible();
  await expect(page.getByText(/GPU-trained models and Triton serving/i)).toBeVisible();
  const open = page.getByTestId('open-dashboard');
  await expect(open).toHaveAttribute('href', /^https:\/\/portal\.luvreno\.net\/?$/);
  await expect(open).toHaveAttribute('target', '_blank');
  await expect(open).toHaveAttribute('rel', 'noopener noreferrer');
  await page.getByTestId('back-home').click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId('hero-cta')).toBeVisible();
});

test('mobile L.VIA navigation CTA opens /product', async ({ page }) => {
  test.skip(isDesktop(page), 'mobile menu is shown under 1024px');
  await prepare(page);
  await page.goto('/');
  await page.getByTestId('menu-btn').click();
  const cta = page.locator('.mobile-cta');
  await expect(cta).toHaveAttribute('href', '/product');
  await cta.click();
  await expect(page).toHaveURL(/\/product$/);
});

test('mobile menu traps focus, closes with Esc and restores focus', async ({ page }) => {
  test.skip(isDesktop(page), 'hamburger is shown under 1024px');
  await prepare(page);
  await page.goto('/');
  const btn = page.getByTestId('menu-btn');
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  await btn.click();
  const menu = page.getByTestId('mobile-menu');
  await expect(menu).toBeVisible();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab');
    expect(await menu.evaluate((m) => m.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Shift+Tab');
  expect(await menu.evaluate((m) => m.contains(document.activeElement))).toBe(true);
  expect(await page.evaluate(() => document.body.classList.contains('scroll-locked'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(btn).toBeFocused();
  expect(await page.evaluate(() => document.body.classList.contains('scroll-locked'))).toBe(false);
  // closes on link click too
  await btn.click();
  await menu.getByRole('link', { name: /Pricing/ }).click();
  await expect(menu).toBeHidden();
  await expect(page).toHaveURL(/#pricing$/);
});

test('nav highlight follows scroll on the home page', async ({ page }) => {
  test.skip(!isDesktop(page), 'desktop index nav');
  await prepare(page);
  await page.goto('/');
  for (const id of ['features', 'pricing', 'faq']) {
    await page.locator(`#${id}`).evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await expect(page.locator(`.nav-index a[data-nav="${id}"]`)).toHaveAttribute('aria-current', 'location');
  }
  await page.goto('/blog');
  await expect(page.locator('.nav-index a[data-nav="journal"]')).toHaveAttribute('aria-current', 'page');
  await page.goto('/product');
  await expect(page.getByTestId('nav-cta')).toHaveAttribute('aria-current', 'page');
  await expect(page.getByTestId('nav-cta')).toHaveAttribute('href', '/product');
});

test('/blog to /#pricing scrolls to pricing', async ({ page }) => {
  const w = await prepare(page);
  await page.goto('/blog');
  await page.getByTestId('footer').getByRole('link', { name: 'Pricing', exact: true }).click();
  await expect(page).toHaveURL(/\/#pricing$/);
  await expect.poll(async () => page.locator('#pricing').evaluate((el) => Math.round(el.getBoundingClientRect().top)), { timeout: 15000 }).toBeLessThan(140);
  expect(await page.locator('#pricing').evaluate((el) => el.getBoundingClientRect().top)).toBeGreaterThan(-10);
  expect(w.errors).toEqual([]);
});

test('route change scrolls to the top', async ({ page }) => {
  await prepare(page);
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, 2500));
  await page.getByTestId('footer').getByRole('link', { name: 'Privacy' }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test('cookie consent blocks optional scripts until allowed', async ({ page }) => {
  const w = await prepare(page, { consent: false });
  await page.goto('/product', { waitUntil: 'networkidle' });
  const banner = page.getByTestId('consent-banner');
  await expect(banner).toBeVisible();
  expect(w.thirdParty).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.dataset.analytics)).toBeUndefined();
  // reject is as prominent as accept: same button style
  const accept = banner.getByRole('button', { name: 'Accept all' });
  const reject = banner.getByRole('button', { name: 'Reject non-essential' });
  expect(await reject.getAttribute('class')).toBe(await accept.getAttribute('class'));
  // customise dialog: labelled toggles, Esc closes
  await banner.getByRole('button', { name: 'Customise' }).click();
  const dialog = page.getByTestId('consent-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel('Necessary (always on)')).toBeDisabled();
  await expect(dialog.getByLabel('Analytics')).not.toBeChecked();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await reject.click();
  await expect(banner).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.dataset.analytics)).toBeUndefined();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('lv-consent') || 'null'));
  expect(stored).toMatchObject({ version: '2026-11-01', preferences: false, analytics: false });
  // reopen from the Cookies page and accept
  await page.goto('/cookies');
  await page.getByRole('button', { name: 'Open cookie preferences' }).click();
  await page.getByTestId('consent-dialog').getByRole('button', { name: 'Accept all' }).click();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.analytics)).toBe('allowed');
  expect(w.thirdParty).toEqual([]);
});

test('pricing numbers match everywhere and are monthly only', async ({ page }) => {
  await prepare(page);
  const seen = new Map<string, Set<string>>();
  for (const route of ['/', '/product']) {
    await page.goto(route);
    for (const el of await page.locator('[data-price-plan]').all()) {
      const plan = (await el.getAttribute('data-price-plan'))!;
      const price = (await el.getAttribute('data-price'))!;
      if (!seen.has(plan)) seen.set(plan, new Set());
      seen.get(plan)!.add(price);
    }
  }
  expect([...seen.keys()].sort()).toEqual(['enterprise', 'growth', 'starter']);
  expect([...seen.get('starter')!]).toEqual(['$39 per month']);
  expect([...seen.get('growth')!]).toEqual(['$119 per month']);
  expect([...seen.get('enterprise')!]).toEqual(['Contact us']);
  await page.goto('/');
  const pricing = page.locator('#pricing');
  await expect(pricing).not.toContainText(/annual|yearly|per year|save \d/i);
  await expect(pricing.getByTestId('sandbox-badge')).toHaveText('Sandbox mode: no real charges');
  await expect(pricing).toContainText('4242 4242 4242 4242');
  const starter = page.getByTestId('plan-starter-cta');
  await expect(starter).toHaveAttribute('href', /^https:\/\/buy\.stripe\.com\/test_/);
  await expect(starter).toHaveAttribute('target', '_blank');
  await expect(page.locator('table caption')).toContainText('per month');
  await page.getByTestId('plan-enterprise-cta').click();
  await expect(page).toHaveURL(/subject=enterprise#contact$/);
  await expect(page.locator('#cf-subject')).toHaveValue('enterprise');
});

test('production build: checkout and contact are either configured or clearly disabled (never a dead link)', async ({ page }) => {
  await prepare(page);
  await page.goto(`${PROD}/`);
  for (const id of ['starter', 'growth']) {
    const b = page.getByTestId(`plan-${id}-cta`);
    const href = await b.getAttribute('href');
    if (href === null) {
      // no Stripe link in .env: a disabled button that says so
      await expect(b).toBeDisabled();
      await expect(b).toHaveText('Sandbox checkout not configured');
    } else {
      // configured: a real Stripe payment link that opens in a new tab
      expect(href).toMatch(/^https:\/\/(buy|checkout)\.stripe\.com\//);
      await expect(b).toHaveAttribute('target', '_blank');
    }
  }
  const notConfigured = page.getByTestId('contact-not-configured');
  if (await notConfigured.count()) {
    await expect(notConfigured).toHaveText('Contact form not configured');
    await expect(page.getByTestId('contact-form').getByRole('button', { name: 'Send message' })).toBeDisabled();
  } else {
    await expect(page.getByTestId('contact-form').getByRole('button', { name: 'Send message' })).toBeEnabled();
  }
});

test('checkout success page explains the sandbox', async ({ page }) => {
  await prepare(page);
  await page.goto('/checkout/success');
  await expect(page.getByTestId('checkout-text')).toHaveText('Sandbox test payment received. No real charge was made and no account was created.');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('blog search and category filters work', async ({ page }) => {
  await prepare(page);
  await page.goto('/blog');
  const cards = page.getByTestId('post-card');
  await expect(cards).toHaveCount(5); // featured + 4 (load more)
  await page.getByTestId('load-more').click();
  await expect(cards).toHaveCount(6);
  await page.getByTestId('category-chip').filter({ hasText: 'Merchandising' }).click();
  await expect(page).toHaveURL(/category=Merchandising/);
  await expect(cards).toHaveCount(2);
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page.getByTestId('blog-search').fill('segments');
  await expect(page).toHaveURL(/q=segments/);
  await expect(cards.first()).toContainText(/segment/i);
  await page.getByTestId('blog-search').fill('zzzz nothing');
  await expect(page.getByTestId('blog-empty')).toBeVisible();
  // a post renders with TOC and anchors
  await page.goto(`/blog/${posts[3]}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Related and complementary/);
  await expect(page.locator('.toc a').first()).toHaveAttribute('href', /^#/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://luvreno.net/blog/${posts[3]}`);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
});

test('rule shelf updates from segment and rule choices', async ({ page }) => {
  await prepare(page);
  await page.goto('/');
  const why = page.getByTestId('shelf-why');
  await expect(page.getByTestId('shelf-banner')).toHaveText('Illustrative, sample products and rules, no real customer data.');
  const before = await why.textContent();
  await page.getByLabel('Home and living interest').check();
  await page.getByLabel('Complementary product').check();
  await expect(why).toContainText('pairs a lamp with plants and mugs');
  expect(await why.textContent()).not.toBe(before);
  await expect(page.getByTestId('rule-shelf-output').locator('.shelf-product-name', { hasText: 'Plant pot' }).first()).toBeVisible();
  // keyboard: arrow keys move within a radio group
  await page.getByLabel('Complementary product').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByLabel('Related product')).toBeChecked();
});

test('testimonials: empty state, validation and pending submission', async ({ page }) => {
  await prepare(page);
  await page.goto('/');
  await expect(page.getByTestId('testimonials-empty')).toHaveText(/No public feedback yet\. Be the first to share your experience\./);
  const form = page.getByTestId('testimonial-form');
  await form.getByRole('button', { name: 'Send feedback' }).click();
  await expect(form.locator('[aria-invalid="true"]').first()).toBeVisible();
  await expect(form).toContainText('Please enter your name.');
  await expect(form).toContainText('Please choose a rating from 1 to 5.');
  await expect(form).toContainText('Please confirm that this may be published.');
  await form.getByLabel('Name').fill('Sam');
  await form.locator('label.rating-opt').nth(3).click();
  await form.getByLabel('Your feedback').fill('Readable rules and clear reports for our team.');
  await form.getByLabel('I agree this may be published').check();
  await form.getByTestId('captcha-stub').click();
  await form.getByRole('button', { name: 'Send feedback' }).click();
  await expect(page.getByTestId('testimonial-success')).toBeVisible();
});

test('approved testimonials show a carousel and summary from approved items only', async ({ page }) => {
  await prepare(page, { testimonials: true });
  await page.goto('/');
  await expect(page.getByTestId('rating-summary')).toContainText('4.5 average from 2 approved reviews');
  await expect(page.getByTestId('testimonial-track').locator('li')).toHaveCount(2);
  await expect(page.getByTestId('testimonials-empty')).toHaveCount(0);
});

test('contact form validates and only shows success after the server confirms', async ({ page }) => {
  await prepare(page);
  await page.goto('/#contact');
  const form = page.getByTestId('contact-form');
  await form.getByRole('button', { name: 'Send message' }).click();
  await expect(page.locator('#cf-name')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#cf-name')).toHaveAttribute('aria-describedby', 'cf-name-err');
  await page.locator('#cf-name').fill('Sam');
  await page.locator('#cf-email').fill('sam@example.com');
  await page.locator('#cf-subject').selectOption('general');
  await page.locator('#cf-message').fill('Hello, I would like a walkthrough.');
  await form.getByRole('button', { name: 'Send message' }).click();
  await expect(form).toContainText('Please tick the reCAPTCHA checkbox.');
  await expect(page.getByTestId('contact-success')).toHaveCount(0);
  await form.getByTestId('captcha-stub').click();
  await scenario(page, 'contact-fail');
  await form.getByRole('button', { name: 'Send message' }).click();
  await expect(form.getByRole('alert')).toContainText('could not be sent');
  await expect(page.getByTestId('contact-success')).toHaveCount(0);
  await scenario(page);
  await form.getByTestId('captcha-stub').click();
  await form.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByTestId('contact-success')).toBeVisible();
});

test('every internal link resolves to a real page', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium-1280', 'one engine is enough for the crawl');
  await prepare(page);
  const found = new Set<string>();
  for (const r of ['/', '/product', '/blog', '/privacy']) {
    await page.goto(r);
    for (const href of await page.locator('a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!))) found.add(href.split('#')[0].split('?')[0] || '/');
  }
  for (const href of found) {
    if (/\.(xml|txt)$/.test(href)) {
      expect((await page.request.get(href)).status(), href).toBe(200);
      continue;
    }
    await page.goto(href);
    await expect(page.getByRole('heading', { level: 1 }), href).not.toHaveText('This page is not on the shelf.');
  }
  expect(found.size).toBeGreaterThanOrEqual(8);
});

test('head: one canonical, absolute, and favicons exist', async ({ page, request }) => {
  await prepare(page);
  await page.goto(`${PROD}/product`);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://luvreno.net/product');
  for (const f of ['/favicon.svg', '/favicon.ico', '/apple-touch-icon.png', '/icon-192.png', '/icon-512.png', '/site.webmanifest', '/og-image.png']) {
    expect((await request.get(PROD + f)).status(), f).toBe(200);
  }
});
