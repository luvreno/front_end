import { useCallback, useEffect, useRef, useState, type FormEvent, type PointerEvent } from 'react';
import seed from '../content/testimonials.seed.json';
import { testimonialsCopy as T } from '../content';
import { parseTestimonials, ratingSummary, validateTestimonial, type Errors, type Testimonial, type TestimonialInput } from '../lib/validation';
import { postJSON } from '../lib/api';
import { useRecaptcha, recaptchaConfigured } from '../lib/recaptcha';
import { Icon } from '../components/Icons';

const seedItems = parseTestimonials(seed);

/** Polls approved testimonials every 30s while the tab is visible. Failures keep the last good list. */
function useTestimonials(): Testimonial[] {
  const [items, setItems] = useState<Testimonial[]>(seedItems);
  useEffect(() => {
    let alive = true;
    let timer = 0;
    let ctrl: AbortController | null = null;
    const load = async () => {
      ctrl?.abort();
      ctrl = new AbortController();
      try {
        // no-cache lets the browser revalidate with If-None-Match (ETag)
        const res = await fetch('/api/testimonials.php', { cache: 'no-cache', signal: ctrl.signal, headers: { Accept: 'application/json' } });
        if (!res.ok) return;
        const type = res.headers.get('content-type') || '';
        if (!type.includes('application/json')) return;
        const api = parseTestimonials(await res.json());
        if (!alive) return;
        const merged = [...seedItems, ...api.filter((a) => !seedItems.some((s) => s.id === a.id))];
        setItems((cur) => (JSON.stringify(cur) === JSON.stringify(merged) ? cur : merged));
      } catch {
        /* endpoint missing or offline: keep current list, no console noise */
      }
    };
    const schedule = () => {
      window.clearInterval(timer);
      if (document.visibilityState === 'visible') timer = window.setInterval(load, T.pollMs);
    };
    const onVis = () => {
      if (document.visibilityState === 'visible') load();
      schedule();
    };
    load();
    schedule();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      alive = false;
      ctrl?.abort();
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);
  return items;
}

function Stars({ n, label }: { n: number; label?: string }) {
  return (
    <span className="stars" role="img" aria-label={label ?? `${n} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className={i <= Math.round(n) ? 'on' : ''}>
          <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" />
        </svg>
      ))}
    </span>
  );
}

function Carousel({ items }: { items: Testimonial[] }) {
  const track = useRef<HTMLUListElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const scrollBy = (dir: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.8), behavior: 'smooth' });
  };
  // mouse drag (touch already scrolls natively)
  const down = (e: PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== 'mouse' || !track.current) return;
    drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false };
  };
  const move = (e: PointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    if (!d || !track.current) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) d.moved = true;
    track.current.scrollLeft = d.left - dx;
  };
  const up = () => {
    drag.current = null;
  };
  return (
    <div className="t-carousel">
      <ul
        ref={track}
        className="t-track"
        tabIndex={0}
        aria-label="Approved feedback, scroll horizontally or use the arrow keys"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); scrollBy(1); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); scrollBy(-1); }
        }}
        data-testid="testimonial-track"
      >
        {items.map((t) => (
          <li key={t.id} className="t-card">
            <span className="t-hole" aria-hidden="true" />
            <Stars n={t.rating} />
            <blockquote className="t-quote"><p>{t.message}</p></blockquote>
            <p className="t-who">
              <strong>{t.name}</strong>
              {(t.role || t.company) && <span className="mono">{[t.role, t.company].filter(Boolean).join(', ')}</span>}
            </p>
          </li>
        ))}
      </ul>
      {items.length > 1 && (
        <div className="t-controls">
          <button type="button" className="icon-btn" onClick={() => scrollBy(-1)} aria-label="Previous feedback"><Icon name="arrow" className="flip" /></button>
          <button type="button" className="icon-btn" onClick={() => scrollBy(1)} aria-label="Next feedback"><Icon name="arrow" /></button>
        </div>
      )}
    </div>
  );
}

type FormState = Omit<TestimonialInput, 'rating'> & { rating: number };
const empty: FormState = { name: '', company: '', role: '', rating: 0, message: '', consent: false };

function FeedbackForm() {
  const [v, setV] = useState<FormState>(empty);
  const [hp, setHp] = useState('');
  const [errors, setErrors] = useState<Errors<TestimonialInput>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [serverMsg, setServerMsg] = useState('');
  const [capErr, setCapErr] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const { token, status: capStatus, reset } = useRecaptcha(boxRef, formRef);
  const L = T.limits;

  const update = useCallback(<K extends keyof FormState>(k: K, val: FormState[K]) => {
    setV((cur) => {
      const next = { ...cur, [k]: val };
      if (submitted) setErrors(validateTestimonial(next));
      return next;
    });
  }, [submitted]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setSubmitted(true);
    const errs = validateTestimonial(v);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="t-${first}"]`)?.focus();
      return;
    }
    if (recaptchaConfigured && !token) {
      setCapErr('Please tick the reCAPTCHA checkbox.');
      return;
    }
    setCapErr('');
    setStatus('sending');
    const r = await postJSON<{ ok: boolean; error?: string }>('/api/testimonials.php', { ...v, recaptcha: token, website: hp });
    if (r.ok) {
      setStatus('ok');
      setV(empty);
      setSubmitted(false);
    } else {
      setStatus('error');
      setServerMsg(r.status === 422 || r.status === 429 ? r.error || '' : '');
    }
    reset();
  };

  const err = (k: keyof TestimonialInput) => (submitted ? errors[k] : undefined);
  const aria = (k: keyof TestimonialInput) => ({
    name: `t-${k}`,
    'aria-invalid': err(k) ? (true as const) : undefined,
    'aria-describedby': err(k) ? `t-${k}-err` : undefined,
  });
  const E = (k: keyof TestimonialInput) => (err(k) ? <p id={`t-${k}-err`} className="field-error">{err(k)}</p> : null);
  const disabled = status === 'sending' || (!recaptchaConfigured && import.meta.env.PROD);

  return (
    <form ref={formRef} className="t-form card" onSubmit={submit} noValidate data-testid="testimonial-form" aria-labelledby="t-form-title">
      <h3 id="t-form-title" className="t-form-title">{T.formTitle}</h3>
      <div className="field">
        <input id="t-name" {...aria('name')} type="text" autoComplete="name" placeholder=" " maxLength={L.name} value={v.name} onChange={(e) => update('name', e.target.value)} />
        <label htmlFor="t-name" className="float">Name</label>
        {E('name')}
      </div>
      <div className="t-row">
        <div className="field">
          <input id="t-company" {...aria('company')} type="text" autoComplete="organization" placeholder=" " maxLength={L.company} value={v.company} onChange={(e) => update('company', e.target.value)} />
          <label htmlFor="t-company" className="float">Company (optional)</label>
          {E('company')}
        </div>
        <div className="field">
          <input id="t-role" {...aria('role')} type="text" autoComplete="organization-title" placeholder=" " maxLength={L.role} value={v.role} onChange={(e) => update('role', e.target.value)} />
          <label htmlFor="t-role" className="float">Role (optional)</label>
          {E('role')}
        </div>
      </div>
      <fieldset className="rating-field" aria-describedby={err('rating') ? 't-rating-err' : undefined} aria-invalid={err('rating') ? true : undefined}>
        <legend>Rating</legend>
        <div className="rating-options">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="rating-opt">
              <input type="radio" name="t-rating" value={n} checked={v.rating === n} onChange={() => update('rating', n)} />
              <span className="rating-chip"><Icon name="star" size={18} /> {n}<span className="sr-only"> out of 5</span></span>
            </label>
          ))}
        </div>
        {E('rating')}
      </fieldset>
      <div className="field">
        <textarea id="t-message" {...aria('message')} placeholder=" " rows={5} maxLength={L.message} value={v.message} onChange={(e) => update('message', e.target.value)} />
        <label htmlFor="t-message" className="float">Your feedback</label>
        <p className="field-hint">{v.message.length} / {L.message} characters. Links and email addresses are not published.</p>
        {E('message')}
      </div>
      <label className="check">
        <input type="checkbox" {...aria('consent')} checked={v.consent} onChange={(e) => update('consent', e.target.checked)} />
        <span>{T.consent}</span>
      </label>
      {E('consent')}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="t-website">Website</label>
        <input id="t-website" type="text" name="website" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
      </div>
      {recaptchaConfigured ? (
        <div className="captcha">
          <div className="captcha-box">
            <div ref={boxRef} className="captcha-mount" />
            {capStatus !== 'ready' && <span className="field-hint">{capStatus === 'error' ? 'reCAPTCHA could not load. Please reload the page.' : 'Loading reCAPTCHA'}</span>}
          </div>
          {capErr && <p className="field-error" role="alert">{capErr}</p>}
        </div>
      ) : (
        <p className="form-status info">Feedback form not configured</p>
      )}
      <button type="submit" className="btn btn-primary btn-lg" disabled={disabled} aria-disabled={disabled}>
        {status === 'sending' ? (<><span className="spinner" aria-hidden="true" /> Sending</>) : 'Send feedback'}
      </button>
      <div aria-live="polite">
        {status === 'ok' && <p className="form-status ok" data-testid="testimonial-success">{T.pendingNote}</p>}
        {status === 'error' && <p className="form-status err" role="alert">{serverMsg || T.error}</p>}
      </div>
    </form>
  );
}

export function TestimonialsSection() {
  const items = useTestimonials();
  const sum = ratingSummary(items);
  return (
    <section id="testimonials" className="section section-cream testimonials" aria-labelledby="testimonials-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{T.eyebrow}</p>
          <h2 id="testimonials-title">{T.title}</h2>
        </div>
        <div className="t-grid">
          <div className="t-list" aria-live="polite">
            {items.length ? (
              <>
                <p className="t-summary" data-testid="rating-summary">
                  <Stars n={sum.average} label={`Average rating ${sum.average} out of 5`} />
                  <span><strong>{sum.average.toFixed(1)}</strong> average from {sum.count} approved {sum.count === 1 ? 'review' : 'reviews'}</span>
                </p>
                <Carousel items={items} />
              </>
            ) : (
              <div className="t-empty" data-testid="testimonials-empty">
                <span className="hang-tag hang-tag-green">Feedback</span>
                <p>{T.empty}</p>
              </div>
            )}
          </div>
          <FeedbackForm />
        </div>
      </div>
    </section>
  );
}
