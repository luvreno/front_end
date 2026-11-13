import { useId, useRef, useState, type KeyboardEvent, type ReactElement } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { features, ruleShelf, productNames, builtFor } from '../content';
import { HangTag, Reveal } from '../components/Motion';
import { ProductArt } from '../illustrations/Products';
import { useReducedMotion } from '../lib/motion';
import rulesBgUrl from '../assets/graphics/recommendation-rules-bg.webp';

/* ----------------------------------------------------------- micro visuals */

/** Recommendation Rules: full-card background illustration, faded into cream behind the text. */
function RulesArt() {
  return (
    <>
      <img className="bento-bg" src={rulesBgUrl} width={860} height={995} alt="" loading="lazy" decoding="async" />
      <span className="bento-fade" aria-hidden="true" />
    </>
  );
}
function MiniProfiles() {
  return (
    <div className="mini mini-profiles" aria-hidden="true">
      {['Customer 1042', 'Customer 2187', 'Customer 3310'].map((c, i) => (
        <div key={c} className="mini-row" style={{ ['--d' as string]: `${i * 0.6}s` }}>
          <span className="mini-avatar" />
          <span className="mono">{c}</span>
        </div>
      ))}
    </div>
  );
}
function MiniCatalog() {
  return (
    <div className="mini mini-catalog" aria-hidden="true">
      {(['mug', 'tote', 'watch', 'notebook'] as const).map((k, i) => (
        <span key={k} className="mini-thumb" style={{ ['--d' as string]: `${i * 0.5}s` }}><ProductArt kind={k} size={44} /></span>
      ))}
    </div>
  );
}
function MiniSegments() {
  return (
    <div className="mini mini-segments" aria-hidden="true">
      <span className="venn venn-a" />
      <span className="venn venn-b" />
      <span className="venn venn-c" />
    </div>
  );
}
function MiniHistory() {
  return (
    <div className="mini mini-history" aria-hidden="true">
      <span className="hist-line" />
      {[0, 1, 2, 3].map((i) => <span key={i} className="hist-dot" style={{ ['--d' as string]: `${i * 0.45}s`, left: `${10 + i * 26}%` }} />)}
    </div>
  );
}
function MiniReports() {
  return (
    <div className="mini mini-reports" aria-hidden="true">
      {[40, 70, 55, 90, 65].map((h, i) => <span key={i} className="bar" style={{ ['--h' as string]: `${h}%`, ['--d' as string]: `${i * 0.12}s` }} />)}
    </div>
  );
}
const visuals: Record<string, () => ReactElement> = {
  rules: RulesArt,
  profiles: MiniProfiles,
  catalog: MiniCatalog,
  segments: MiniSegments,
  history: MiniHistory,
  reports: MiniReports,
};

export function FeaturesSection() {
  return (
    <section id="features" className="section section-cream features" aria-labelledby="features-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{features.eyebrow}</p>
          <h2 id="features-title">{features.title}</h2>
        </div>
        <ul className="bento">
          {features.cards.map((c, i) => {
            const V = visuals[c.id];
            return (
              <Reveal as="li" key={c.id} className={`bento-card card liftable bento-${c.id}${c.size === 'large' ? ' bento-large' : ''}`} delay={i * 0.06}>
                <V />
                <h3 className="bento-title">{c.title}</h3>
                <p>{c.text}</p>
              </Reveal>
            );
          })}
        </ul>
        <ul className="facts" aria-label="Product facts">
          {features.facts.map((f) => (
            <li key={f.label} className="fact">
              <span className="fact-value">{f.value}</span>
              <span className="fact-label mono">{f.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- rule shelf */

export function RuleShelf() {
  const [segment, setSegment] = useState(ruleShelf.segments[0].id);
  const [rule, setRule] = useState(ruleShelf.rules[0].id);
  const reduced = useReducedMotion();
  const result = ruleShelf.results[segment][rule];
  const ruleMeta = ruleShelf.rules.find((r) => r.id === rule)!;
  const segMeta = ruleShelf.segments.find((s) => s.id === segment)!;

  return (
    <section id="rule-shelf" className="section section-dark on-dark rule-shelf" aria-labelledby="shelf-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{ruleShelf.eyebrow}</p>
          <h2 id="shelf-title">{ruleShelf.title}</h2>
          <p className="lead">{ruleShelf.text}</p>
        </div>
        <p className="shelf-banner mono" data-testid="shelf-banner">{ruleShelf.banner}</p>
        <div className="shelf-controls">
          <fieldset className="chip-group">
            <legend className="mono">1. Segment</legend>
            <div className="chips">
              {ruleShelf.segments.map((s) => (
                <label key={s.id} className="chip-radio">
                  <input type="radio" name="shelf-segment" value={s.id} checked={segment === s.id} onChange={() => setSegment(s.id)} />
                  <span className="chip">{s.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="chip-group">
            <legend className="mono">2. Rule type</legend>
            <div className="chips">
              {ruleShelf.rules.map((r) => (
                <label key={r.id} className="chip-radio">
                  <input type="radio" name="shelf-rule" value={r.id} checked={rule === r.id} onChange={() => setRule(r.id)} />
                  <span className="chip">{r.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="shelf-stage" aria-live="polite" data-testid="rule-shelf-output">
          <p className="sr-only">Showing {result.items.map((k) => productNames[k]).join(', ')} for {segMeta.label} with a {ruleMeta.label} rule.</p>
          <ul className="shelf-row">
            <AnimatePresence mode="popLayout" initial={false}>
              {result.items.map((k, i) => (
                <m.li
                  key={`${segment}-${rule}-${k}`}
                  className="shelf-product"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, x: -40 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.5, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  <HangTag label={ruleMeta.tag} variant={i === 0 ? 'green' : 'cream'} />
                  <div className="shelf-product-card">
                    <ProductArt kind={k} size={120} />
                    <p className="shelf-product-name">{productNames[k]}</p>
                  </div>
                </m.li>
              ))}
            </AnimatePresence>
          </ul>
          <div className="shelf-plank shelf-plank-dark" aria-hidden="true" />
          <p className="shelf-why" data-testid="shelf-why"><span className="mono">Why shown: </span>{result.why}</p>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- built for */

export function BuiltFor() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const uid = useId();
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const n = builtFor.tabs.length;
    let next: number;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (active + 1) % n;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (active - 1 + n) % n;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = n - 1;
    else return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };
  return (
    <section id="built-for" className="section section-cream built-for" aria-labelledby="builtfor-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{builtFor.eyebrow}</p>
          <h2 id="builtfor-title">{builtFor.title}</h2>
        </div>
        <div className="tabs">
          <div role="tablist" aria-label="Audiences" className="tablist">
            {builtFor.tabs.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                type="button"
                id={`${uid}-tab-${t.id}`}
                aria-selected={active === i}
                aria-controls={`${uid}-panel-${t.id}`}
                tabIndex={active === i ? 0 : -1}
                className="tab"
                onClick={() => setActive(i)}
                onKeyDown={onKey}
              >
                <span className="tab-num mono">0{i + 1}</span> {t.label}
              </button>
            ))}
          </div>
          {builtFor.tabs.map((t, i) => (
            <div
              key={t.id}
              role="tabpanel"
              id={`${uid}-panel-${t.id}`}
              aria-labelledby={`${uid}-tab-${t.id}`}
              hidden={active !== i}
              tabIndex={0}
              className="tabpanel card"
            >
              <h3 className="tabpanel-title">{t.full}</h3>
              <p className="lead">{t.scenario}</p>
              <p className="mono tabpanel-label">Modules they would use</p>
              <ul className="module-tags">
                {t.modules.map((mod) => <li key={mod}><span className="hang-tag">{mod}</span></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
