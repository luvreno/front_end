/**
 * Luvreno: single source of truth for all text, numbers, routes and links.
 * Rules (see README): no em dashes, no invented clients, numbers, awards or people.
 * Values wrapped in [square brackets] are visible placeholders and are reported by
 * `npm run check:placeholders`. Placeholders never become tel:, mailto: or JSON-LD.
 */

type Env = Record<string, string | undefined>;
// Vite injects import.meta.env in the browser build; post-build scripts in Node use process.env.
const env: Env =
  (import.meta as unknown as { env?: Env }).env ??
  (globalThis as unknown as { process?: { env: Env } }).process?.env ??
  {};

export const isPlaceholder = (v: string | undefined | null): boolean =>
  !v || /^\[.*\]$/.test(v.trim());

/* ------------------------------------------------------------------ site */

export const site = {
  name: 'Luvreno',
  url: (env.VITE_SITE_URL || 'https://luvreno.net').replace(/\/$/, ''),
  dashboardUrl: env.VITE_DASHBOARD_URL || 'https://portal.luvreno.net',
  tagline: 'AI Customer Personalization & Recommendation Engine',
  description:
    'Luvreno brings customer profiles, your product catalog, segments and recommendation rules into one workspace, with reports on how recommendations perform.',
  themeColor: '#ECDBBA',
  locale: 'en',
  ogImage: '/og-image.png',
} as const;

/** Read once so every module agrees. */
export const dashboardUrl = site.dashboardUrl;

export const routes = {
  home: '/',
  product: '/product',
  blog: '/blog',
  privacy: '/privacy',
  terms: '/terms',
  cookies: '/cookies',
  checkoutSuccess: '/checkout/success',
} as const;

/* --------------------------------------------------------------- company */

export const company = {
  legalName: 'Luvreno PVT LTD',
  legalNameUsa: 'Luvreno LLC',
  tradingName: 'Luvreno',
  founder: 'Akash Perera',
  foundedDate: '2023 November 10',
  phone: '+94112448408',
  phoneUsa: '+15086955665',
  email: 'help@luvreno.net',
  address: '234 Panchikawatte Road, 10 Colombo, Sri Lanka',
  addressUsa: '1549 Rt 9, Halfmoon NY 12065, United States',
  website: 'https://luvreno.net',
  hours: 'Monday to Friday, 9:00 AM - 6:00 PM',
};

/* ------------------------------------------------- social and citations */

export interface ExtLink { label: string; url: string }
/** Add real profile URLs only. Empty strings are ignored, empty groups are hidden. */
export const socialLinks: ExtLink[] = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/company/luvreno/' },
];
/** Business listings and citation sources. Real URLs only. */
export const citationLinks: ExtLink[] = [
  { label: 'Crunchbase', url: 'https://www.crunchbase.com/organization/luvreno' },
  { label: 'F6S', url: 'https://www.f6s.com/luvreno' },
];
export const realLinks = (list: ExtLink[]) =>
  list.filter((l) => /^https:\/\/[^\s#]+\.[^\s#]+/.test(l.url.trim()));

/* ------------------------------------------------------------ navigation */

export interface NavItem { id: string; label: string; num: string; route?: string }
export const navItems: NavItem[] = [
  { num: '01', id: 'features', label: 'Features' },
  { num: '02', id: 'how-it-works', label: 'How It Works' },
  { num: '03', id: 'pricing', label: 'Pricing' },
  { num: '04', id: 'journal', label: 'Journal', route: '/blog' },
  { num: '05', id: 'faq', label: 'FAQ' },
  { num: '06', id: 'contact', label: 'Contact' },
];
export const navCta = { label: 'Get Started', to: routes.product };
export const topStrip = { text: 'The weekly edit: new from the journal', to: routes.blog, storageKey: 'lv-strip-dismissed-v1' };

/* ------------------------------------------------------------------ hero */

export const hero = {
  eyebrow: 'AI Customer Personalization & Recommendation Engine',
  titleBefore: 'Make Every Customer Experience More',
  /** One word = no cycling. Add more words to rotate them. */
  cycleWords: ['Personal.'],
  titleAfter: '',
  cycleMs: 2600,
  text: 'Help your customers discover products that genuinely match their interests. Luvreno brings customer insights, product information and recommendation management together, helping retail and e-commerce businesses create more relevant shopping experiences.',
  cta: { label: 'Explore the Platform', to: routes.product },
  secondaryCta: { label: 'Discover What We Do', to: '/#about' },
  artAlt: 'A customer profile at the centre, linked to a dress, a pair of sneakers and a laptop recommended for them',
};

export const marquee = {
  label: 'A few categories a catalog can organise',
  note: 'Illustrative',
  words: ['Home', 'Fashion', 'Beauty', 'Electronics', 'Grocery', 'Sports', 'Toys', 'Books'],
};

/* --------------------------------------------------------------- problem */

export const problem = {
  eyebrow: 'The scattered shelf',
  title: 'Retail information rarely lives in one place.',
  notes: [
    'Customer data and product data live in disconnected systems.',
    'Purchasing patterns are hard to see.',
    'Product information is spread across files and tools.',
    'Generic suggestions limit product discovery.',
    'There is little visibility into engagement.',
  ],
  recordTitle: 'One Luvreno record',
  record: [
    { k: 'Customer', v: 'Customer 1042' },
    { k: 'Segment', v: 'Home and living interest' },
    { k: 'Catalog', v: '3 linked products' },
    { k: 'Rule', v: 'Complementary product' },
    { k: 'Report', v: 'Impressions, clicks, conversions' },
  ],
  recordNote: 'Illustrative record, no real customer data.',
};

/* ---------------------------------------------------------- how it works */

export const steps = [
  { art: 'customers', title: 'Add customers and preferences', text: 'Create profiles with attributes, preferences and purchase history in one place.' },
  { art: 'catalog', title: 'Organise the product catalog', text: 'Keep names, categories, attributes, pricing and availability structured.' },
  { art: 'segments', title: 'Build segments', text: 'Group customers by attributes, purchase frequency and product interests.' },
  { art: 'rules', title: 'Configure recommendation rules', text: 'Decide which products are shown to which customers, and why.' },
  { art: 'performance', title: 'Review performance', text: 'Compare impressions, clicks and conversions over the periods you choose.' },
] as const;

/* -------------------------------------------------------------- features */

export const features = {
  eyebrow: 'Features',
  title: 'Six modules, one workspace.',
  cards: [
    { id: 'rules', size: 'large', title: 'Recommendation Rules', text: 'Build customer-specific, segment-based, related-product and complementary-product rules from preferences, product attributes and purchase history.' },
    { id: 'profiles', size: 'small', title: 'Customer Profiles', text: 'Profiles with preferences, attributes and history, with search, filters and access restrictions.' },
    { id: 'catalog', size: 'small', title: 'Product Catalog', text: 'Categories, brands, attributes, pricing and availability kept in one structured list.' },
    { id: 'segments', size: 'small', title: 'Segmentation', text: 'Manual segments and calculated results, kept clearly apart.' },
    { id: 'history', size: 'small', title: 'Interaction History', text: 'Recorded interactions and recommendation engagement, stored per profile.' },
    { id: 'reports', size: 'small', title: 'Analytics and Reports', text: 'Customer, product and recommendation summaries with data export.' },
  ],
  facts: [
    { value: '6', label: 'core modules' },
    { value: '4', label: 'recommendation types' },
    { value: 'Audit', label: 'history on changes' },
    { value: '7-day', label: 'delivery' },
  ],
};

/* ------------------------------------------------------------ rule shelf */

export type ProductArt = 'mug' | 'sneaker' | 'lamp' | 'tote' | 'plant' | 'notebook' | 'watch';
export const ruleShelf = {
  eyebrow: 'Try it',
  title: 'The rule shelf',
  text: 'Pick a segment and a rule type to see which sample products a rule could place on the shelf.',
  banner: 'Illustrative, sample products and rules, no real customer data.',
  segments: [
    { id: 'frequent', label: 'Frequent buyers' },
    { id: 'home', label: 'Home and living interest' },
    { id: 'first', label: 'First purchase' },
  ],
  rules: [
    { id: 'customer', label: 'Customer-specific', tag: 'For you' },
    { id: 'segment', label: 'Segment-based', tag: 'Popular in segment' },
    { id: 'related', label: 'Related product', tag: 'Similar to' },
    { id: 'complementary', label: 'Complementary product', tag: 'Often bought together' },
  ],
  /** products[segment][rule] -> three sample products and a reason */
  results: {
    frequent: {
      customer: { items: ['watch', 'sneaker', 'tote'], why: 'Shown because the profile lists accessories as a saved preference.' },
      segment: { items: ['sneaker', 'tote', 'notebook'], why: 'Shown because these items are linked to the Frequent buyers segment.' },
      related: { items: ['sneaker', 'watch', 'tote'], why: 'Shown because they share the category and brand of a past purchase.' },
      complementary: { items: ['tote', 'notebook', 'watch'], why: 'Shown because a rule pairs these with a recently purchased item.' },
    },
    home: {
      customer: { items: ['lamp', 'plant', 'mug'], why: 'Shown because the profile lists home decor as a preference.' },
      segment: { items: ['plant', 'lamp', 'mug'], why: 'Shown because these products are linked to the Home and living segment.' },
      related: { items: ['lamp', 'plant', 'notebook'], why: 'Shown because they share the Home category attribute.' },
      complementary: { items: ['mug', 'plant', 'lamp'], why: 'Shown because a rule pairs a lamp with plants and mugs.' },
    },
    first: {
      customer: { items: ['mug', 'notebook', 'tote'], why: 'Shown because the profile has one purchase and one saved preference.' },
      segment: { items: ['notebook', 'mug', 'plant'], why: 'Shown because these are the products linked to First purchase.' },
      related: { items: ['notebook', 'tote', 'mug'], why: 'Shown because they share the category of the first purchase.' },
      complementary: { items: ['tote', 'mug', 'notebook'], why: 'Shown because a rule pairs the first purchase with these items.' },
    },
  } as Record<string, Record<string, { items: ProductArt[]; why: string }>>,
};

export const productNames: Record<ProductArt, string> = {
  mug: 'Stoneware mug',
  sneaker: 'Canvas sneaker',
  lamp: 'Desk lamp',
  tote: 'Cotton tote',
  plant: 'Plant pot',
  notebook: 'Linen notebook',
  watch: 'Field watch',
};

/* ------------------------------------------------------------- built for */

export const builtFor = {
  eyebrow: 'Built for',
  title: 'Made for the people who run the shelf.',
  tabs: [
    {
      id: 'owners',
      label: 'Business owners and retail managers',
      full: 'E-commerce business owners and retail managers',
      scenario: 'You want one place to see who your customers are and which products you offer, and to decide what should be suggested to whom without a spreadsheet for every list.',
      modules: ['Customer Profiles', 'Product Catalog', 'Recommendation Rules'],
    },
    {
      id: 'marketing',
      label: 'Marketing and CX teams',
      full: 'Digital marketing teams and customer experience managers',
      scenario: 'You plan campaigns around groups of customers. You build segments from interests and purchase frequency, link products to them and check how the suggestions were received.',
      modules: ['Segmentation', 'Recommendation Rules', 'Analytics and Reports'],
    },
    {
      id: 'analysts',
      label: 'Product managers and analysts',
      full: 'Product managers and retail data analysts',
      scenario: 'You care about structure. You keep catalog attributes clean, review interaction history and export reports on impressions, clicks and conversions for the periods you study.',
      modules: ['Product Catalog', 'Interaction History', 'Analytics and Reports'],
    },
  ],
};

/* ------------------------------------------------------------------ about */

export const about = {
  eyebrow: 'About',
  statement:
    'Retail teams hold customer and product information in separate places. Luvreno brings them into one workspace, so relevant products are easier to find.',
  values: [
    { title: 'Central records', text: 'Profiles, products and rules in one place.' },
    { title: 'Relevant discovery', text: 'Suggestions that follow rules you can read.' },
    { title: 'Clear engagement reporting', text: 'Impressions, clicks and conversions per period.' },
    { title: 'Controlled access', text: 'Roles decide who sees customer information.' },
  ],
  note: 'Founded on November 10, 2023 by Akash Perera. Operating as Luvreno PVT LTD in Sri Lanka and Luvreno LLC in the United States.',
};

/* -------------------------------------------------------------------- faq */

export interface Faq { q: string; a: string; keywords: string[] }
export const faqCopy = {
  eyebrow: 'FAQ',
  title: 'Explore The Luvreno Experience',
  lead: 'Still have a question? Use the chat in the corner or write to us through the contact form.',
};

export const faqs: Faq[] = [
  {
    q: 'What does Luvreno offer to retail and e-commerce businesses?',
    a: 'Luvreno provides a centralized platform for managing customer profiles, product catalogs, customer segments and product recommendations. It helps businesses organize important information, understand customer preferences and manage more relevant product discovery experiences.',
    keywords: ['what is luvreno', 'luvreno', 'about luvreno', 'platform', 'what does it do', 'overview', 'offer'],
  },
  {
    q: 'How can Luvreno help businesses understand their customers better?',
    a: 'Luvreno allows businesses to maintain customer profiles, preferences, purchasing information and recorded interactions. These details can be used to organize customer segments and gain a clearer understanding of different shopping interests and behaviours.',
    keywords: ['understand', 'customers', 'profile', 'profiles', 'preferences', 'segment', 'segments', 'behaviour', 'behavior', 'interactions'],
  },
  {
    q: 'Can businesses create personalized product recommendations?',
    a: 'Yes. Luvreno supports configurable recommendation workflows based on customer preferences, product attributes and available purchase history. Businesses can manage customer-specific, segment-based, related-product and complementary-product suggestions.',
    keywords: ['recommendation', 'recommendations', 'personalized', 'personalised', 'personalization', 'suggestions', 'related', 'complementary', 'rules', 'how'],
  },
  {
    q: 'Does Luvreno provide insights into recommendation performance?',
    a: 'Yes. Businesses can review available recommendation impressions, clicks and conversion records through performance dashboards and reports. These insights help teams understand recommendation engagement and evaluate their personalization activities.',
    keywords: ['recommendation performance', 'insights', 'performance', 'reports', 'report', 'analytics', 'impressions', 'clicks', 'conversions', 'metrics'],
  },
  {
    q: 'Can Luvreno support different business teams and user roles?',
    a: 'Yes. Luvreno supports secure authentication and role-based access management. This helps businesses control access to customer information, product records and administrative functions according to assigned permissions.',
    keywords: ['roles', 'role', 'team', 'teams', 'access', 'permissions', 'security', 'secure', 'authentication', 'protect', 'data'],
  },
  {
    q: 'Can Luvreno adapt to the needs of growing retail businesses?',
    a: 'Luvreno is designed around a flexible subscription model, with proposed plans accommodating different customer profile volumes, product catalog sizes and business requirements. Enterprise-oriented options may also support multiple stores, expanded reporting and team access management.',
    keywords: ['grow', 'growing', 'scale', 'plans', 'plan', 'subscription', 'enterprise', 'stores', 'adapt'],
  },
];

/* --------------------------------------------------------------- contact */

export const contactSubjects = [
  { id: 'general', label: 'General enquiry' },
  { id: 'demo', label: 'Product walkthrough' },
  { id: 'pricing', label: 'Pricing question' },
  { id: 'enterprise', label: 'Enterprise plan' },
  { id: 'support', label: 'Dashboard support' },
  { id: 'assistant', label: 'Follow-up from the assistant' },
  { id: 'other', label: 'Other' },
] as const;
export type SubjectId = (typeof contactSubjects)[number]['id'];

export const contact = {
  eyebrow: 'Contact',
  title: "Let's Build Better Customer Experiences",
  text: 'Have questions about customer personalization or product recommendations? Connect with our team and explore how Luvreno can support your business.',
  limits: { name: 100, email: 254, company: 120, message: 3000, messageMin: 10 },
  notConfigured: 'Contact form not configured',
  success: 'Thank you. Your message was received and we will reply by email.',
  error: 'Your message could not be sent. Please try again in a moment.',
};

export const closing = {
  title: 'Make every shopping journey more relevant with recommendations that understand customer preferences.',
  cta: 'Open the Dashboard',
};

export const journalTeaser = { eyebrow: 'From the journal', title: 'Notes on relevant retail.', link: 'Visit the Journal' };

/* ---------------------------------------------------------------- pricing */

// PLACEHOLDER PRICES AND LIMITS: confirm with client.
export type PlanId = 'starter' | 'growth' | 'enterprise';
export interface Plan {
  id: PlanId;
  name: string;
  /** Monthly price in whole USD. null = Contact us. */
  monthlyUsd: number | null;
  /** PLACEHOLDER */
  pricePlaceholder: boolean;
  blurb: string;
  /** Every limit is a PLACEHOLDER to confirm with the client. */
  limits: { profiles: string; products: string; placeholder: true };
  features: string[];
  stripeEnv?: 'VITE_STRIPE_LINK_STARTER' | 'VITE_STRIPE_LINK_GROWTH';
  highlight?: boolean;
}

export const pricing = {
  eyebrow: 'Pricing',
  title: 'Monthly plans, sized to your catalog.',
  text: 'Plans follow the number of customer profiles and catalog size. All prices are per month in USD.',
  currency: 'USD',
  sandboxBadge: 'Sandbox mode: no real charges',
  testCardNote: 'Use Stripe test card 4242 4242 4242 4242 with any future date and any CVC.',
  notConfigured: 'Sandbox checkout not configured',
  customNote: 'Need something custom?',
  customLink: 'Talk to us.',
  /** Button label on plan cards: 'Choose Starter', 'Choose Growth'. The price is read out to screen readers too. */
  planCta: 'Choose',
  contactCta: 'Contact us',
  plans: [
    {
      id: 'starter',
      name: 'Starter',
      monthlyUsd: 39,
      pricePlaceholder: true,
      blurb: 'For a single store getting customer and product records in order.',
      limits: { profiles: '2,500', products: '500', placeholder: true },
      features: ['Customer profiles', 'Product catalog', 'Manual segments', 'Recommendation rules', 'Standard reports'],
      stripeEnv: 'VITE_STRIPE_LINK_STARTER',
    },
    {
      id: 'growth',
      name: 'Growth',
      monthlyUsd: 119,
      pricePlaceholder: true,
      blurb: 'For growing catalogs that need premium analytics and segmentation.',
      limits: { profiles: '25,000', products: '5,000', placeholder: true },
      features: ['Everything in Starter', 'Calculated segments', 'Premium recommendation analytics', 'Interaction history', 'Data export'],
      stripeEnv: 'VITE_STRIPE_LINK_GROWTH',
      highlight: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyUsd: null,
      pricePlaceholder: true,
      blurb: 'For retailers with multiple stores and wider teams.',
      limits: { profiles: 'Custom', products: 'Custom', placeholder: true },
      features: ['Everything in Growth', 'Multiple stores', 'Advanced reporting', 'Team access and roles', 'Audit history'],
    },
  ] as Plan[],
  /** Feature comparison table rows: value per plan. */
  comparison: [
    { feature: 'Customer profiles', values: ['limit:profiles', 'limit:profiles', 'limit:profiles'] },
    { feature: 'Catalog products', values: ['limit:products', 'limit:products', 'limit:products'] },
    { feature: 'Recommendation rule types', values: ['4', '4', '4'] },
    { feature: 'Manual segments', values: ['yes', 'yes', 'yes'] },
    { feature: 'Calculated segments', values: ['no', 'yes', 'yes'] },
    { feature: 'Premium recommendation analytics', values: ['no', 'yes', 'yes'] },
    { feature: 'Data export', values: ['no', 'yes', 'yes'] },
    { feature: 'Multiple stores', values: ['no', 'no', 'yes'] },
    { feature: 'Advanced reporting', values: ['no', 'no', 'yes'] },
    { feature: 'Team access and roles', values: ['Basic', 'Basic', 'Advanced'] },
  ],
};

export const checkoutSuccess = {
  title: 'Sandbox payment received',
  text: 'Sandbox test payment received. No real charge was made and no account was created.',
};

/* ---------------------------------------------------------- product page */

export const productPage = {
  eyebrow: 'The Product',
  title: 'Luvreno Platform',
  line: 'Customer profiles, catalog, segments, rules and reports in one retail workspace.',
  openDashboard: 'Open Dashboard',
  backHome: 'Back to Home',
  mockLabel: 'Illustrative preview',
  flow: ['Customer and Product Data', 'Segments', 'Recommendation Rules', 'Recommendation Records', 'Performance Reports'],
  modules: [
    {
      id: 'profiles', icon: 'profile', title: 'Customer Profile Management',
      text: 'Create, update, categorise and manage customer profiles with the preferences and attributes your team works with.',
      bullets: ['Preferences and attributes per profile', 'Interaction and purchase history', 'Search and filters', 'Segment assignment with access restrictions'],
    },
    {
      id: 'catalog', icon: 'catalog', title: 'Product Catalog Management',
      text: 'Keep names, descriptions, categories, attributes, pricing and availability structured and easy to maintain.',
      bullets: ['Organise by category, brand and business-defined attributes', 'Product updates in one place', 'Search and filtering', 'Structured imports where implemented'],
    },
    {
      id: 'segments', icon: 'segment', title: 'Customer Segmentation',
      text: 'Build segments from profile attributes, purchasing frequency, product interests and recorded interactions.',
      bullets: ['Define segment criteria', 'Link products to customer groups', 'Manual segments kept apart from calculated results'],
    },
    {
      id: 'recommendations', icon: 'rule', title: 'Recommendation Management',
      text: 'Configure rules from customer preferences, product attributes and purchase history.',
      bullets: ['Customer-specific recommendations', 'Segment-based recommendations', 'Related-product and complementary-product rules', 'Recommendation history and engagement records'],
    },
    {
      id: 'analytics', icon: 'report', title: 'Analytics and Reporting',
      text: 'Customer, product and recommendation summaries for the periods you select.',
      bullets: ['Impressions, clicks and conversions', 'Selected time periods', 'Reports and data export'],
    },
    {
      id: 'security', icon: 'lock', title: 'Security and Administration',
      text: 'Access to customer information is controlled and changes are traceable.',
      bullets: ['Secure authentication', 'Role-based access', 'Audit records', 'Controlled access to customer information'],
    },
  ],
  tourTabs: [
    { id: 'customers', label: 'Customers' },
    { id: 'catalog', label: 'Catalog' },
    { id: 'segments', label: 'Segments' },
    { id: 'rules', label: 'Rules' },
    { id: 'reports', label: 'Reports' },
  ],
  architecture: {
    title: 'Architecture overview',
    layers: [
      { title: 'Presentation layer', items: ['Customer dashboards', 'Product catalogs', 'Segmentation interfaces', 'Recommendation views', 'Reports'], caption: 'What your team sees and works in.' },
      { title: 'Application and data layer', items: ['Laravel workflows for customers', 'Products', 'Recommendation rules', 'Structured SQL storage'], caption: 'Where records, rules and history are processed and stored.' },
    ],
    note: 'Large media files may be stored separately, with their references kept in SQL.',
  },
  foundation: {
    title: 'Proposed Technology Foundation',
    cards: [
      { name: 'NVIDIA Merlin', text: 'A framework for building and deploying large-scale recommender systems using customer behaviour and product interaction data.' },
      { name: 'NVIDIA RAPIDS', text: 'GPU-accelerated data science and analytics libraries for large-scale data processing.' },
      { name: 'NVIDIA NeMo', text: 'A framework for building, customising and managing generative AI and other AI model workflows.' },
      { name: 'NVIDIA Triton Inference Server', text: 'An inference-serving platform supporting model deployment across multiple frameworks and environments.' },
    ],
    disclaimer: 'These technologies are shown for technical context and product positioning only. Their presence does not indicate that Luvreno has integrated, deployed or implemented them.',
  },
  governance: {
    title: 'Governance and enterprise readiness',
    items: [
      { title: 'Role-based access', text: 'Access to customer profiles, product records and administrative functions depends on the role.' },
      { title: 'Traceable changes', text: 'Customer updates, segmentation criteria and recommendation configurations are recorded.' },
      { title: 'Controlled handling', text: 'Customer information, interaction records and exported reports are handled under controlled access.' },
    ],
  },
  useCases: [
    { title: 'E-commerce stores', text: 'Keep profiles and the catalog together and set rules for what each customer group is shown.' },
    { title: 'Multi-store retail teams', text: 'Share one catalog structure and one set of segments across stores, with roles for each team.' },
    { title: 'Marketing and customer experience teams', text: 'Plan around segments, link products to them and read the engagement reports.' },
  ],
  faqs: [
    { q: 'Is there a trained AI model inside Luvreno?', a: 'No. Recommendations come from the rules you configure and the data you provide.' },
    { q: 'Can I import my existing catalog?', a: 'Structured imports are supported where they have been implemented for your setup. Otherwise products can be added and updated in the catalog module.' },
    { q: 'Which recommendation types are available?', a: 'Four: customer-specific, segment-based, related-product and complementary-product.' },
    { q: 'Who can see customer information?', a: 'Only users whose role allows it. Changes are kept in audit records.' },
    { q: 'Where do I sign in?', a: 'Use the Open Dashboard button to go to the Luvreno dashboard sign-in page.' },
  ],
  finalTitle: 'See it in the dashboard.',
  talkToUs: 'Talk to Us',
};

/* ----------------------------------------------------------- testimonials */

export const testimonialsCopy = {
  eyebrow: 'Feedback',
  title: 'What people say, once they say it.',
  empty: 'No public feedback yet. Be the first to share your experience.',
  formTitle: 'Share your feedback',
  consent: 'I agree this may be published',
  pendingNote: 'Thank you. Your feedback was received and will appear once it has been reviewed.',
  error: 'Your feedback could not be sent. Please try again in a moment.',
  limits: { name: 80, company: 80, role: 80, message: 600, messageMin: 20 },
  pollMs: 30000,
};

/* ------------------------------------------------------------- newsletter */

export const newsletter = {
  title: 'Get the weekly edit',
  text: 'New journal posts and product notes, once a week.',
  success: 'You are on the list. Thank you.',
  error: 'That did not work. Please try again in a moment.',
};

/* ------------------------------------------------------------------ footer */

export const footer = {
  line: 'Every shelf, a little more relevant.',
  links: [
    { label: 'Features', to: '/#features' },
    { label: 'How It Works', to: '/#how-it-works' },
    { label: 'Pricing', to: '/#pricing' },
    { label: 'Journal', to: '/blog' },
    { label: 'About', to: '/#about' },
    { label: 'FAQ', to: '/#faq' },
    { label: 'Contact', to: '/#contact' },
    { label: 'Privacy', to: '/privacy' },
    { label: 'Terms', to: '/terms' },
  ],
};

/* ------------------------------------------------------------------ cookies */

export const consentConfig = {
  version: '2026-11-01',
  storageKey: 'lv-consent',
  categories: [
    { id: 'necessary', label: 'Necessary', locked: true, text: 'Needed for the site to work, such as remembering your cookie choice and keeping the chat for this session.' },
    { id: 'preferences', label: 'Preferences', locked: false, text: 'Remembers choices like a dismissed announcement strip, and allows an optional chat provider if one is enabled.' },
    { id: 'analytics', label: 'Analytics', locked: false, text: 'Optional, anonymous usage measurement. No analytics script is loaded unless you allow it.' },
  ],
} as const;

/* ------------------------------------------------------------------ chatbot */

export const chatbot = {
  title: 'Luvreno assistant',
  label: 'Automated assistant, not a live agent.',
  greeting: 'Hello. I can answer common questions about Luvreno from our FAQ. What would you like to know?',
  chips: ['What does Luvreno offer?', 'Pricing', 'Can I see recommendation performance?', 'How do I sign in?', 'Contact'],
  fallback: 'I am not sure about that one, and I would rather not guess. You can send the question to the team through the contact form.',
  contactButton: 'Ask the team',
  storageKey: 'lv-chat-v1',
};

/* ------------------------------------------------------------------- legal */

export const legal = {
  draftBanner: '',
  retention: 'We retain personal data for up to 24 months as described in our Privacy Policy',
  governingLaw: 'The laws of Sri Lanka, excluding its conflicts of law rules, shall govern these Terms and Your use of the Service',
};

export const blogCopy = {
  title: 'Journal',
  intro: 'Practical notes on customer profiles, segments, recommendation rules and the reports that show whether they help.',
  searchLabel: 'Search the journal',
  all: 'All',
  loadMore: 'Load more',
  pageSize: 4,
  empty: 'No posts match that search.',
};
