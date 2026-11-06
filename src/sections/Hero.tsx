import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { hero, marquee } from '../content';
import { HangTag, Thread } from '../components/Motion';
import { ProductArt } from '../illustrations/Products';
import { useReducedMotion } from '../lib/motion';
import { Icon } from '../components/Icons';

export function Hero() {
  const words = hero.cycleWords;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (paused || reduced) return;
    const t = window.setInterval(() => {
      if (document.visibilityState === 'visible') setI((n) => (n + 1) % words.length);
    }, hero.cycleMs);
    return () => window.clearInterval(t);
  }, [paused, reduced, words.length]);

  const pause = () => setPaused(true);
  const resume = () => setPaused(false);

  return (
    <section className="hero section-cream" aria-labelledby="hero-title" onMouseEnter={pause} onMouseLeave={resume} onFocus={pause} onBlur={resume}>
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1 id="hero-title" className="hero-title">
            {hero.titleBefore}{' '}
            <span className="cycle" aria-hidden="true" data-testid="hero-cycle">
              {words.map((w, n) => (
                <span key={w} className={`cycle-word${n === i ? ' is-on' : ''}`}>{w}</span>
              ))}
            </span>
            <span className="sr-only">{words[0]}</span> {hero.titleAfter}
          </h1>
          <p className="lead hero-text">{hero.text}</p>
          <div className="btn-row">
            <Link to={hero.cta.to} className="btn btn-primary btn-lg" data-testid="hero-cta">
              {hero.cta.label} <span className="arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <HeroShelf />
      </div>
      <Marquee />
    </section>
  );
}

function HeroShelf() {
  const items = [
    { kind: 'lamp' as const, tag: hero.tags[0], variant: 'green' as const },
    { kind: 'mug' as const, tag: hero.tags[1], variant: 'cream' as const },
    { kind: 'plant' as const, tag: hero.tags[2], variant: 'dark' as const },
  ];
  return (
    <figure className="hero-shelf" aria-label="Illustration of three sample products on a shelf, joined by a thread with labels">
      <span className="label-illustrative hero-label">{hero.shelfLabel}</span>
      <Thread className="hero-thread" viewBox="0 0 600 120" axis="x" scrub={false} d="M10 60 C 80 0, 150 0, 200 52 S 330 110, 400 52 S 520 -4, 590 50" />
      <ul className="shelf-items">
        {items.map((it, n) => (
          <li key={it.kind} className="shelf-item">
            <HangTag label={it.tag} variant={it.variant} delay={0.3 + n * 0.25} />
            <ProductArt kind={it.kind} size={150} className="shelf-art" />
          </li>
        ))}
      </ul>
      <div className="shelf-plank" aria-hidden="true" />
    </figure>
  );
}

export function Marquee() {
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const words = marquee.words;
  return (
    <div className={`marquee on-dark${paused ? ' is-paused' : ''}`} ref={ref}>
      <div className="container marquee-head">
        <p className="marquee-label mono">
          {marquee.label} <span className="marquee-note">({marquee.note})</span>
        </p>
        <button type="button" className="marquee-btn" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
          <Icon name={paused ? 'arrow' : 'close'} size={14} />
          {paused ? 'Play' : 'Pause'}
          <span className="sr-only"> category marquee</span>
        </button>
      </div>
      <div className="marquee-viewport">
        <ul className="marquee-track" aria-label={marquee.label}>
          {words.map((w) => <li key={w}>{w}</li>)}
          {words.map((w) => <li key={`${w}-2`} aria-hidden="true">{w}</li>)}
          {words.map((w) => <li key={`${w}-3`} aria-hidden="true">{w}</li>)}
        </ul>
      </div>
    </div>
  );
}
