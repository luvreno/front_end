import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { hero, marquee } from '../content';
import { useReducedMotion } from '../lib/motion';
import { Icon } from '../components/Icons';
import heroAnim800 from '../assets/graphics/hero-anim-800.webp';
import heroAnim1000 from '../assets/graphics/hero-anim-1000.webp';
import heroStill from '../assets/graphics/hero-still.webp';

export function Hero() {
  const words = hero.cycleWords;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (paused || reduced || words.length < 2) return;
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
            <span className="sr-only">{words[0]}</span>{hero.titleAfter && ` ${hero.titleAfter}`}
          </h1>
          <p className="lead hero-text">{hero.text}</p>
          <div className="btn-row">
            <Link to={hero.cta.to} className="btn btn-primary btn-lg" data-testid="hero-cta">
              {hero.cta.label} <span className="arrow" aria-hidden="true">→</span>
            </Link>
            <Link to={hero.secondaryCta.to} className="btn btn-secondary btn-lg" data-testid="hero-secondary-cta">
              {hero.secondaryCta.label}
            </Link>
          </div>
        </div>
        <HeroArt />
      </div>
      <Marquee />
    </section>
  );
}

/**
 * Animated hero (client artwork, converted from GIF to animated WebP: about a tenth of the size).
 * Visitors who prefer reduced motion get a still of the final frame instead.
 */
function HeroArt() {
  return (
    <figure className="hero-art">
      <picture>
        <source media="(prefers-reduced-motion: reduce)" srcSet={heroStill} />
        <img
          src={heroAnim1000}
          srcSet={`${heroAnim800} 800w, ${heroAnim1000} 1000w`}
          sizes="(min-width: 1024px) 480px, 92vw"
          width={1000}
          height={750}
          alt={hero.artAlt}
          decoding="async"
        />
      </picture>
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
