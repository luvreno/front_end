import { faqs, pricing } from '../content';
import { getPrice } from './pricing';

export type Action = 'contact' | 'dashboard' | 'pricing';
export interface Answer { text: string; matched: boolean; action?: Action }

export const normalise = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const priceSummary = () =>
  pricing.plans.map((p) => `${p.name}: ${getPrice(p).long}`).join('. ') + '. All plans are billed monthly.';

interface Intent { id: string; keywords: string[]; answer: () => Answer; weight?: number }

const intents: Intent[] = [
  {
    id: 'pricing', weight: 1.2,
    keywords: ['price', 'prices', 'pricing', 'cost', 'how much', 'plan', 'plans', 'monthly', 'subscription', 'starter', 'growth', 'enterprise'],
    answer: () => ({ text: priceSummary(), matched: true, action: 'pricing' }),
  },
  {
    id: 'signin', weight: 1.3,
    keywords: ['sign in', 'signin', 'log in', 'login', 'dashboard', 'portal', 'password'],
    answer: () => ({ text: 'You can sign in from the dashboard. Use the Open Dashboard button on the product page, or the Dashboard link in the footer.', matched: true, action: 'dashboard' }),
  },
  {
    id: 'contact', weight: 1.1,
    keywords: ['contact', 'email', 'phone', 'talk', 'human', 'person', 'reach', 'support', 'call'],
    answer: () => ({
      text: 'The quickest way to reach the team is the contact form on the home page.',
      matched: true,
      action: 'contact',
    }),
  },
  ...faqs.map((f, i) => ({ id: `faq-${i}`, keywords: f.keywords, answer: () => ({ text: f.a, matched: true }) })),
];

const STOP = new Set(['the', 'a', 'an', 'is', 'it', 'i', 'to', 'do', 'does', 'of', 'and', 'or', 'my', 'me', 'you', 'can', 'what', 'how', 'for', 'in', 'on', 'with', 'are', 'about']);

function score(q: string, words: Set<string>, kw: string): number {
  const k = normalise(kw);
  if (!k) return 0;
  if (k.includes(' ')) return (' ' + q + ' ').includes(' ' + k + ' ') ? 2 : 0;
  if (STOP.has(k)) return 0;
  if (words.has(k)) return 1;
  for (const w of words) {
    if (w.length > 3 && (w === k + 's' || k === w + 's' || (k.length > 4 && w.startsWith(k)))) return 0.8;
  }
  return 0;
}

/** Keyword matcher over the FAQ and site facts. Returns matched: false when nothing fits. */
export function answer(input: string): Answer {
  const q = normalise(input);
  if (!q) return { text: 'Please type a question.', matched: false };
  const words = new Set(q.split(' '));
  let best: { s: number; i: Intent } | null = null;
  for (const it of intents) {
    const s = it.keywords.reduce((acc, kw) => acc + score(q, words, kw), 0) * (it.weight ?? 1);
    if (s > 0 && (!best || s > best.s)) best = { s, i: it };
  }
  if (!best || best.s < 0.8) return { text: '', matched: false, action: 'contact' };
  return best.i.answer();
}
