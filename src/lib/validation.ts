import { testimonialsCopy, contact } from '../content';

export interface TestimonialInput { name: string; company?: string; role?: string; rating: number; message: string; consent: boolean }
export type Errors<T> = Partial<Record<keyof T, string>>;

// eslint-disable-next-line no-control-regex
const CTRL = /[\u0000-\u001F\u007F]/g;
export const clean = (s: unknown) => (typeof s === 'string' ? s.replace(CTRL, ' ').trim() : '');
export const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;

export function validateTestimonial(v: TestimonialInput): Errors<TestimonialInput> {
  const L = testimonialsCopy.limits;
  const e: Errors<TestimonialInput> = {};
  const name = clean(v.name);
  if (name.length < 2) e.name = 'Please enter your name.';
  else if (name.length > L.name) e.name = `Please keep the name under ${L.name} characters.`;
  if (clean(v.company).length > L.company) e.company = `Please keep this under ${L.company} characters.`;
  if (clean(v.role).length > L.role) e.role = `Please keep this under ${L.role} characters.`;
  if (!Number.isInteger(v.rating) || v.rating < 1 || v.rating > 5) e.rating = 'Please choose a rating from 1 to 5.';
  const msg = clean(v.message);
  if (msg.length < L.messageMin) e.message = `Please write at least ${L.messageMin} characters.`;
  else if (msg.length > L.message) e.message = `Please keep the message under ${L.message} characters.`;
  if (!v.consent) e.consent = 'Please confirm that this may be published.';
  return e;
}

export interface ContactInput { name: string; email: string; company?: string; subject: string; message: string }
export function validateContact(v: ContactInput, subjects: readonly string[]): Errors<ContactInput> {
  const L = contact.limits;
  const e: Errors<ContactInput> = {};
  const name = clean(v.name);
  if (name.length < 2) e.name = 'Please enter your name.';
  else if (name.length > L.name) e.name = `Please keep the name under ${L.name} characters.`;
  const email = clean(v.email);
  if (!EMAIL_RE.test(email) || email.length > L.email) e.email = 'Please enter a valid email address.';
  if (clean(v.company).length > L.company) e.company = `Please keep this under ${L.company} characters.`;
  if (!subjects.includes(v.subject)) e.subject = 'Please choose a subject.';
  const msg = clean(v.message);
  if (msg.length < L.messageMin) e.message = `Please write at least ${L.messageMin} characters.`;
  else if (msg.length > L.message) e.message = `Please keep the message under ${L.message} characters.`;
  return e;
}

export interface Testimonial { id: string; name: string; company?: string; role?: string; rating: number; message: string; date: string }

/** Defensive parse of the API response or seed file. Unknown shapes become an empty list. */
export function parseTestimonials(raw: unknown): Testimonial[] {
  const list: unknown[] =
    raw && typeof raw === 'object' && Array.isArray((raw as { items?: unknown }).items)
      ? (raw as { items: unknown[] }).items
      : Array.isArray(raw)
        ? raw
        : [];
  return list.flatMap((x) => {
    if (!x || typeof x !== 'object') return [];
    const t = x as Record<string, unknown>;
    const rating = Number(t.rating);
    if (typeof t.id !== 'string' || typeof t.name !== 'string' || typeof t.message !== 'string') return [];
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return [];
    return [{
      id: t.id,
      name: t.name,
      message: t.message,
      rating,
      company: typeof t.company === 'string' && t.company ? t.company : undefined,
      role: typeof t.role === 'string' && t.role ? t.role : undefined,
      date: typeof t.date === 'string' ? t.date : '',
    }];
  });
}

export function ratingSummary(items: Testimonial[]): { count: number; average: number } {
  if (!items.length) return { count: 0, average: 0 };
  const avg = items.reduce((a, t) => a + t.rating, 0) / items.length;
  return { count: items.length, average: Math.round(avg * 10) / 10 };
}
