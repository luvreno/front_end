import { describe, expect, it } from 'vitest';
import { answer, normalise } from '../../src/lib/chatMatcher';
import { chatbot, faqs } from '../../src/content';

describe('chat matcher', () => {
  it('normalises input', () => {
    expect(normalise('  What IS Luvreno?! ')).toBe('what is luvreno');
  });

  it('answers every suggested chip', () => {
    for (const chip of chatbot.chips) {
      const a = answer(chip);
      expect(a.matched, chip).toBe(true);
      expect(a.text.length, chip).toBeGreaterThan(20);
    }
  });

  it('answers what Luvreno is from the FAQ', () => {
    expect(answer('What is Luvreno?').text).toBe(faqs[0].a);
  });

  it('says no to live tracking', () => {
    const a = answer('Does it track shoppers live?');
    expect(a.matched).toBe(true);
    expect(a.text).toMatch(/^No\./);
    expect(answer('can it connect to shopify').text).toMatch(/does not connect/);
  });

  it('gives monthly prices from getPrice', () => {
    const a = answer('how much does it cost');
    expect(a.action).toBe('pricing');
    expect(a.text).toContain('$39 per month');
    expect(a.text).toContain('$119 per month');
    expect(a.text).toContain('Contact us');
    expect(a.text).not.toMatch(/year|annual/i);
  });

  it('points sign-in questions to the dashboard', () => {
    expect(answer('How do I sign in?').action).toBe('dashboard');
    expect(answer('where is the login').action).toBe('dashboard');
  });

  it('routes contact questions to the form without inventing an email', () => {
    const a = answer('Contact');
    expect(a.action).toBe('contact');
    expect(a.text).not.toMatch(/@/);
  });

  it('explains recommendations come from rules, not a trained model', () => {
    expect(answer('how are recommendations generated').text).toMatch(/not from a trained model/);
  });

  it('handles segments and data protection', () => {
    expect(answer('manual vs calculated segments').text).toMatch(/manual segment/i);
    expect(answer('is my customer data secure').text).toMatch(/role-based access/);
  });

  it('admits when it does not know', () => {
    for (const q of ['what is the weather in Paris', 'tell me a joke', 'qwerty zzz']) {
      const a = answer(q);
      expect(a.matched, q).toBe(false);
      expect(a.action).toBe('contact');
    }
    expect(answer('   ').matched).toBe(false);
  });
});
