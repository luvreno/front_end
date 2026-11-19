import { useEffect, useRef, useState, type PointerEvent } from 'react';
import seed from '../content/testimonials.seed.json';
import { testimonialsCopy as T } from '../content';
import { parseTestimonials, ratingSummary, type Testimonial } from '../lib/validation';
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

function Carousel({ items, sample = false }: { items: Testimonial[]; sample?: boolean }) {
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
        aria-label={`${sample ? 'Example feedback' : 'Approved feedback'}, scroll horizontally or use the arrow keys`}
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
            {sample && <span className="t-sample-tag mono">{T.sampleTag}</span>}
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
            <div className="t-samples" data-testid="testimonials-empty">
              <Carousel items={T.samples} sample />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
