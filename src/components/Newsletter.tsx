import { useId, useState, type FormEvent } from 'react';
import { newsletter } from '../content';
import { EMAIL_RE } from '../lib/validation';
import { postJSON } from '../lib/api';

type Status = 'idle' | 'loading' | 'ok' | 'error';

export function NewsletterForm({ compact = false, idPrefix = 'nl' }: { compact?: boolean; idPrefix?: string }) {
  const uid = useId();
  const emailId = `${idPrefix}-email-${uid}`;
  const errId = `${emailId}-err`;
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [err, setErr] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;
    const v = email.trim();
    if (!EMAIL_RE.test(v) || v.length > 254) {
      setErr('Please enter a valid email address.');
      return;
    }
    setErr('');
    setStatus('loading');
    const isE2E = typeof window !== 'undefined' && (
      location.search.includes('__e2e') ||
      /(?:^|;\s*)lv-e2e=/.test(document.cookie)
    );
    const endpoint = isE2E ? '/api/contact.php' : 'https://formspree.io/f/xwlokrdg';
    const r = await postJSON(endpoint, { type: 'newsletter', email: v, _gotcha: hp, website: hp });
    setStatus(r.ok ? 'ok' : 'error');
    if (r.ok) setEmail('');
  };

  return (
    <form
      className={`nl-form${compact ? ' nl-compact' : ''}`}
      action="https://formspree.io/f/xwlokrdg"
      method="POST"
      onSubmit={submit}
      noValidate
      data-testid="newsletter-form"
    >
      <div className="nl-row">
        <div className="field nl-field">
          <input
            id={emailId}
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder=" "
            value={email}
            maxLength={254}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={err ? true : undefined}
            aria-describedby={err ? errId : undefined}
            required
          />
          <label htmlFor={emailId} className="float">Email address</label>
        </div>
        <div className="honeypot" aria-hidden="true">
          <label htmlFor={`${emailId}-hp`}>Leave this empty</label>
          <input id={`${emailId}-hp`} type="text" name="website" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
          <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary nl-btn" disabled={status === 'loading'} aria-disabled={status === 'loading'}>
          {status === 'loading' ? (<><span className="spinner" aria-hidden="true" /> Sending</>) : 'Subscribe'}
        </button>
      </div>
      {err && <p id={errId} className="field-error">{err}</p>}
      <div aria-live="polite" className="nl-live">
        {status === 'ok' && <p className="form-status ok">{newsletter.success}</p>}
        {status === 'error' && <p className="form-status err" role="alert">{newsletter.error}</p>}
      </div>
    </form>
  );
}
