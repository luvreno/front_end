import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { consentConfig } from '../content';
import { useConsent } from './ConsentContext';
import { useFocusTrap, useScrollLock } from '../hooks/a11y';
import { Icon } from './Icons';

export function CookieConsent() {
  const { bannerOpen, dialogOpen, acceptAll, rejectAll, openDialog, closeDialog, save, consent } = useConsent();
  const cardRef = useRef<HTMLDivElement>(null);

  // Publish the card height so the chat button can sit above it on small screens.
  useEffect(() => {
    const el = cardRef.current;
    if (!bannerOpen || !el) {
      document.body.classList.remove('consent-open');
      return;
    }
    document.body.classList.add('consent-open');
    const set = () => document.body.style.setProperty('--consent-h', `${el.offsetHeight}px`);
    set();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(set) : null;
    ro?.observe(el);
    return () => {
      ro?.disconnect();
      document.body.classList.remove('consent-open');
    };
  }, [bannerOpen]);

  return (
    <>
      {bannerOpen && (
        <div ref={cardRef} className="consent-card" role="region" aria-label="Cookie consent" data-testid="consent-banner">
          <p className="consent-title">A quick note on cookies</p>
          <p className="consent-text">
            We use necessary storage to run the site. Preferences and anonymous analytics are optional and stay off unless you allow them.{' '}
            <Link to="/cookies" className="text-link">Cookie policy</Link>
          </p>
          <div className="consent-actions">
            <button type="button" className="btn btn-primary" onClick={acceptAll}>Accept all</button>
            <button type="button" className="btn btn-primary" onClick={rejectAll}>Reject non-essential</button>
            <button type="button" className="btn btn-secondary" onClick={openDialog}>Customise</button>
          </div>
        </div>
      )}
      {dialogOpen && <ConsentDialog initial={consent} onClose={closeDialog} onSave={save} />}
    </>
  );
}

function ConsentDialog({ initial, onClose, onSave }: { initial: ReturnType<typeof useConsent>['consent']; onClose: () => void; onSave: (c: { preferences: boolean; analytics: boolean }) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const [prefs, setPrefs] = useState(initial?.preferences ?? false);
  const [analytics, setAnalytics] = useState(initial?.analytics ?? false);
  useFocusTrap(ref, true, onClose);
  useScrollLock(true);

  const values: Record<string, boolean> = { necessary: true, preferences: prefs, analytics };
  const setters: Record<string, (v: boolean) => void> = { preferences: setPrefs, analytics: setAnalytics };

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className="dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId} tabIndex={-1} data-testid="consent-dialog">
        <div className="dialog-head">
          <h2 id={titleId} className="dialog-title">Cookie preferences</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close cookie preferences">
            <Icon name="close" />
          </button>
        </div>
        <p id={descId}>Choose which optional categories to allow. You can change this at any time from the footer.</p>
        <ul className="toggle-list">
          {consentConfig.categories.map((c) => {
            const id = `consent-${c.id}`;
            return (
              <li key={c.id} className="toggle-row">
                <div>
                  <label htmlFor={id} className="toggle-label">{c.label}{c.locked && <span className="toggle-locked"> (always on)</span>}</label>
                  <p className="toggle-text" id={`${id}-desc`}>{c.text}</p>
                </div>
                <input
                  id={id}
                  type="checkbox"
                  role="switch"
                  className="switch"
                  checked={values[c.id]}
                  disabled={c.locked}
                  aria-describedby={`${id}-desc`}
                  aria-checked={values[c.id]}
                  onChange={(e) => setters[c.id]?.(e.target.checked)}
                />
              </li>
            );
          })}
        </ul>
        <div className="consent-actions">
          <button type="button" className="btn btn-primary" onClick={() => onSave({ preferences: prefs, analytics })}>Save choices</button>
          <button type="button" className="btn btn-primary" onClick={() => onSave({ preferences: false, analytics: false })}>Reject non-essential</button>
          <button type="button" className="btn btn-secondary" onClick={() => onSave({ preferences: true, analytics: true })}>Accept all</button>
        </div>
      </div>
    </div>
  );
}
