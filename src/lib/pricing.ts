import { pricing, type Plan, type PlanId } from '../content';

export interface PriceInfo {
  planId: PlanId;
  amount: number | null;
  currency: 'USD';
  /** "$39" or "Contact us" */
  display: string;
  /** "$39 per month" or "Contact us" */
  long: string;
  /** "/ month" suffix, empty for contact */
  suffix: string;
  isContact: boolean;
}

/** The one place a price string is produced. Pure, monthly only. */
export function getPrice(plan: Plan | PlanId): PriceInfo {
  const p = typeof plan === 'string' ? pricing.plans.find((x) => x.id === plan) : plan;
  if (!p) throw new Error(`Unknown plan: ${String(plan)}`);
  if (p.monthlyUsd === null) {
    return { planId: p.id, amount: null, currency: 'USD', display: 'Contact us', long: 'Contact us', suffix: '', isContact: true };
  }
  if (!Number.isFinite(p.monthlyUsd) || p.monthlyUsd < 0) throw new Error(`Invalid price for ${p.id}`);
  const display = `$${p.monthlyUsd.toLocaleString('en-US')}`;
  return { planId: p.id, amount: p.monthlyUsd, currency: 'USD', display, long: `${display} per month`, suffix: '/ month', isContact: false };
}

export const getPlan = (id: PlanId): Plan => {
  const p = pricing.plans.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown plan: ${id}`);
  return p;
};

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

/** Stripe test-mode Payment Link for a plan, or null when missing or invalid. */
export function getCheckoutLink(plan: Plan, source: Record<string, string | undefined> = env): string | null {
  if (!plan.stripeEnv) return null;
  const v = (source[plan.stripeEnv] || '').trim();
  return /^https:\/\/(buy|checkout)\.stripe\.com\/\S+$/.test(v) ? v : null;
}
