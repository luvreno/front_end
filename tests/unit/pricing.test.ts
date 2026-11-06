import { describe, expect, it } from 'vitest';
import { pricing } from '../../src/content';
import { getPrice, getCheckoutLink, getPlan } from '../../src/lib/pricing';

describe('getPrice', () => {
  it('returns monthly USD for Starter', () => {
    const p = getPrice('starter');
    expect(p.amount).toBe(39);
    expect(p.display).toBe('$39');
    expect(p.long).toBe('$39 per month');
    expect(p.suffix).toBe('/ month');
    expect(p.currency).toBe('USD');
    expect(p.isContact).toBe(false);
  });

  it('returns monthly USD for Growth', () => {
    const p = getPrice('growth');
    expect(p.amount).toBe(119);
    expect(p.long).toBe('$119 per month');
  });

  it('returns Contact us for Enterprise', () => {
    const p = getPrice('enterprise');
    expect(p.amount).toBeNull();
    expect(p.display).toBe('Contact us');
    expect(p.isContact).toBe(true);
  });

  it('is pure and agrees with the plan object for every plan', () => {
    for (const plan of pricing.plans) {
      expect(getPrice(plan)).toEqual(getPrice(plan.id));
      expect(getPrice(plan).amount).toBe(plan.monthlyUsd);
    }
  });

  it('never mentions annual or yearly pricing', () => {
    for (const plan of pricing.plans) {
      expect(JSON.stringify(getPrice(plan))).not.toMatch(/year|annual/i);
    }
    expect(JSON.stringify(pricing)).not.toMatch(/annual|yearly|per year|\/ ?yr/i);
  });

  it('throws for unknown plans', () => {
    // @ts-expect-error invalid id on purpose
    expect(() => getPrice('platinum')).toThrow();
  });
});

describe('getCheckoutLink', () => {
  const starter = getPlan('starter');
  it('accepts a Stripe test Payment Link', () => {
    expect(getCheckoutLink(starter, { VITE_STRIPE_LINK_STARTER: 'https://buy.stripe.com/test_abc123' })).toBe('https://buy.stripe.com/test_abc123');
  });
  it('rejects missing, empty or non-Stripe values', () => {
    expect(getCheckoutLink(starter, {})).toBeNull();
    expect(getCheckoutLink(starter, { VITE_STRIPE_LINK_STARTER: '' })).toBeNull();
    expect(getCheckoutLink(starter, { VITE_STRIPE_LINK_STARTER: '#' })).toBeNull();
    expect(getCheckoutLink(starter, { VITE_STRIPE_LINK_STARTER: 'https://evil.example.com/pay' })).toBeNull();
  });
  it('has no link for Enterprise', () => {
    expect(getCheckoutLink(getPlan('enterprise'), { VITE_STRIPE_LINK_STARTER: 'https://buy.stripe.com/test_x' })).toBeNull();
  });
});
