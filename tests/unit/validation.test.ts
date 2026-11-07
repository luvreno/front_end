import { describe, expect, it } from 'vitest';
import { parseTestimonials, ratingSummary, validateContact, validateTestimonial } from '../../src/lib/validation';
import seed from '../../src/content/testimonials.seed.json';

const good = { name: 'Sam Lee', company: '', role: '', rating: 5, message: 'Readable rules and clear reports for us.', consent: true };

describe('testimonial validation', () => {
  it('accepts a complete submission', () => {
    expect(validateTestimonial(good)).toEqual({});
  });
  it('requires name, rating, message length and consent', () => {
    const e = validateTestimonial({ name: 'S', rating: 0, message: 'short', consent: false });
    expect(Object.keys(e).sort()).toEqual(['consent', 'message', 'name', 'rating']);
  });
  it('caps lengths', () => {
    expect(validateTestimonial({ ...good, message: 'x'.repeat(601) }).message).toBeTruthy();
    expect(validateTestimonial({ ...good, name: 'x'.repeat(81) }).name).toBeTruthy();
    expect(validateTestimonial({ ...good, company: 'x'.repeat(81) }).company).toBeTruthy();
  });
  it('rejects non-integer and out-of-range ratings', () => {
    expect(validateTestimonial({ ...good, rating: 6 }).rating).toBeTruthy();
    expect(validateTestimonial({ ...good, rating: 3.5 }).rating).toBeTruthy();
  });
});

describe('testimonial parsing', () => {
  it('ships an empty seed file', () => {
    expect(seed).toEqual([]);
    expect(parseTestimonials(seed)).toEqual([]);
  });
  it('accepts the API shape and drops invalid items', () => {
    const items = parseTestimonials({ ok: true, items: [
      { id: 'a1', name: 'Sam', rating: 4, message: 'Fine', date: '2026-11-01', company: '' },
      { id: 'a2', name: 'X', rating: 9, message: 'bad rating' },
      { name: 'no id', rating: 5, message: 'x' },
      'nonsense',
    ] });
    expect(items).toHaveLength(1);
    expect(items[0].company).toBeUndefined();
  });
  it('treats unknown responses as empty', () => {
    expect(parseTestimonials(null)).toEqual([]);
    expect(parseTestimonials('<html>')).toEqual([]);
    expect(parseTestimonials({ error: 'x' })).toEqual([]);
  });
  it('summarises approved ratings only from what it is given', () => {
    expect(ratingSummary([])).toEqual({ count: 0, average: 0 });
    const items = parseTestimonials([{ id: '1', name: 'A', rating: 5, message: 'm' }, { id: '2', name: 'B', rating: 4, message: 'm' }]);
    expect(ratingSummary(items)).toEqual({ count: 2, average: 4.5 });
  });
});

describe('contact validation', () => {
  const subjects = ['general', 'enterprise'];
  it('accepts a valid message', () => {
    expect(validateContact({ name: 'Sam', email: 'sam@example.com', subject: 'general', message: 'Hello there team' }, subjects)).toEqual({});
  });
  it('rejects bad email, unknown subject and short message', () => {
    const e = validateContact({ name: 'Sam', email: 'sam@', subject: 'other', message: 'hi' }, subjects);
    expect(Object.keys(e).sort()).toEqual(['email', 'message', 'subject']);
  });
  it('rejects header injection attempts in email', () => {
    expect(validateContact({ name: 'Sam', email: 'a@b.com\nBcc: c@d.com', subject: 'general', message: 'Hello there team' }, subjects).email).toBeTruthy();
  });
});
