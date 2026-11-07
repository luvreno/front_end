import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { contact, contactSubjects, company, isPlaceholder } from '../content';
import { validateContact, type ContactInput, type Errors } from '../lib/validation';
import { postJSON } from '../lib/api';
import { useRecaptcha, recaptchaConfigured } from '../lib/recaptcha';

type Status = 'idle' | 'sending' | 'ok' | 'error';
const subjectIds = contactSubjects.map((s) => s.id) as readonly string[];
const empty: ContactInput = { name: '', email: '', company: '', subject: '', message: '' };

export function ContactSection() {
  return (
    <section id="contact" className="section section-cream contact" aria-labelledby="contact-title">
      <div className="container contact-grid">
        <div>
          <p className="eyebrow">{contact.eyebrow}</p>
          <h2 id="contact-title">{contact.title}</h2>
          <p className="lead">{contact.text}</p>
          <dl className="contact-details">
            <div><dt>Email</dt><dd>{isPlaceholder(company.email) ? company.email : <a href={`mailto:${company.email}`}>{company.email}</a>}</dd></div>
            <div><dt>Phone</dt><dd>{isPlaceholder(company.phone) ? company.phone : <a href={`tel:${company.phone.replace(/[^+\d]/g, '')}`}>{company.phone}</a>}</dd></div>
            <div><dt>Address</dt><dd>{company.address}</dd></div>
            <div><dt>Hours</dt><dd>{company.hours}</dd></div>
          </dl>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}

export function ContactForm() {
  const { search, key } = useLocation();
  const [v, setV] = useState<ContactInput>(empty);
  const [hp, setHp] = useState('');
  const [errors, setErrors] = useState<Errors<ContactInput>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactInput, boolean>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [captchaErr, setCaptchaErr] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const { token, status: capStatus, reset } = useRecaptcha(boxRef, formRef);

  // Prefill from links like /?subject=enterprise#contact or the chatbot hand-off.
  useEffect(() => {
    const p = new URLSearchParams(search);
    const s = p.get('subject');
    const q = p.get('q');
    if (s && subjectIds.includes(s)) {
      setV((cur) => ({ ...cur, subject: s, message: q && !cur.message ? `Question for the team: ${q.slice(0, 500)}` : cur.message }));
      setStatus('idle');
    }
  }, [search, key]);

  const set = (k: keyof ContactInput) => (e: { target: { value: string } }) => {
    const next = { ...v, [k]: e.target.value };
    setV(next);
    if (touched[k]) setErrors(validateContact(next, subjectIds));
  };
  const blur = (k: keyof ContactInput) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors(validateContact(v, subjectIds));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    const errs = validateContact(v, subjectIds);
    setErrors(errs);
    setTouched({ name: true, email: true, company: true, subject: true, message: true });
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    if (recaptchaConfigured && !token) {
      setCaptchaErr('Please tick the reCAPTCHA checkbox.');
      return;
    }
    setCaptchaErr('');
    setStatus('sending');
    const subject = contactSubjects.find((s) => s.id === v.subject)?.label ?? v.subject;
    const r = await postJSON('/api/contact.php', { type: 'contact', ...v, subject, recaptcha: token, website: hp });
    if (r.ok) {
      setStatus('ok');
      setV(empty);
      setTouched({});
    } else {
      setStatus('error');
    }
    reset();
  };

  const show = (k: keyof ContactInput) => (touched[k] ? errors[k] : undefined);
  const fieldProps = (k: keyof ContactInput) => ({
    id: `cf-${k}`,
    name: k,
    'aria-invalid': show(k) ? (true as const) : undefined,
    'aria-describedby': show(k) ? `cf-${k}-err` : undefined,
    onBlur: blur(k),
  });
  const Err = ({ k }: { k: keyof ContactInput }) => (show(k) ? <p id={`cf-${k}-err`} className="field-error">{show(k)}</p> : null);
  const disabled = status === 'sending' || (!recaptchaConfigured && import.meta.env.PROD);
  const L = contact.limits;

  return (
    <form ref={formRef} className="contact-form card" onSubmit={submit} noValidate data-testid="contact-form" aria-describedby="cf-required">
      <p id="cf-required" className="field-hint">All fields are required unless marked optional.</p>
      <div className="field">
        <input {...fieldProps('name')} type="text" autoComplete="name" placeholder=" " maxLength={L.name} value={v.name} onChange={set('name')} required />
        <label htmlFor="cf-name" className="float">Name</label>
        <Err k="name" />
      </div>
      <div className="field">
        <input {...fieldProps('email')} type="email" autoComplete="email" inputMode="email" placeholder=" " maxLength={L.email} value={v.email} onChange={set('email')} required />
        <label htmlFor="cf-email" className="float">Email</label>
        <Err k="email" />
      </div>
      <div className="field">
        <input {...fieldProps('company')} type="text" autoComplete="organization" placeholder=" " maxLength={L.company} value={v.company} onChange={set('company')} />
        <label htmlFor="cf-company" className="float">Company (optional)</label>
        <Err k="company" />
      </div>
      <div className="field">
        <select {...fieldProps('subject')} value={v.subject} onChange={set('subject')} required>
          <option value="" disabled>Choose a subject</option>
          {contactSubjects.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <label htmlFor="cf-subject" className="float">Subject</label>
        <Err k="subject" />
      </div>
      <div className="field">
        <textarea {...fieldProps('message')} placeholder=" " rows={6} maxLength={L.message} value={v.message} onChange={set('message')} required />
        <label htmlFor="cf-message" className="float">Message</label>
        <p className="field-hint" aria-live="off">{v.message.length} / {L.message}</p>
        <Err k="message" />
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="cf-website">Website</label>
        <input id="cf-website" type="text" name="website" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
      </div>

      {recaptchaConfigured ? (
        <div className="captcha">
          <div className="captcha-box" data-testid="recaptcha-box">
            <div ref={boxRef} className="captcha-mount" />
            {capStatus !== 'ready' && <span className="field-hint">{capStatus === 'error' ? 'reCAPTCHA could not load. Please check your connection and reload.' : 'Loading reCAPTCHA'}</span>}
          </div>
          {captchaErr && <p className="field-error" role="alert">{captchaErr}</p>}
        </div>
      ) : (
        <p className="form-status info" data-testid="contact-not-configured">{contact.notConfigured}</p>
      )}

      <button type="submit" className="btn btn-primary btn-lg" disabled={disabled} aria-disabled={disabled}>
        {status === 'sending' ? (<><span className="spinner" aria-hidden="true" /> Sending</>) : 'Send message'}
      </button>
      <div aria-live="polite">
        {status === 'ok' && <p className="form-status ok" data-testid="contact-success">{contact.success}</p>}
        {status === 'error' && <p className="form-status err" role="alert">{contact.error}</p>}
      </div>
    </form>
  );
}
