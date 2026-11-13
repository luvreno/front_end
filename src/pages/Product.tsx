import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import { productPage as P, dashboardUrl, pricing } from '../content';
import { getPrice } from '../lib/pricing';
import { Seo } from '../components/Seo';
import { staticRoutes } from '../lib/seoData.ts';
import { HangTag, Reveal, Thread } from '../components/Motion';
import { Icon, type IconName } from '../components/Icons';
import { DashboardMock, MockCatalog, MockChart, MockCustomers, MockRule, MockSegments } from '../sections/Mockups';
import { useReducedMotion } from '../lib/motion';
import { useGsapContext } from '../lib/gsap';
import '../styles/product.css';

export default function Product() {
  return (
    <>
      <Seo {...staticRoutes['/product']} />
      <Header />
      <Flow />
      <Modules />
      <Architecture />
      <Roadmap />
      <FinalCta />
    </>
  );
}

function DashboardButton({ big = true }: { big?: boolean }) {
  return (
    <a href={dashboardUrl} className={`btn btn-primary${big ? ' btn-lg' : ''}`} target="_blank" rel="noopener noreferrer" data-testid="open-dashboard">
      {P.openDashboard} <Icon name="external" size={18} />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function Header() {
  return (
    <section className="section section-cream product-header page-top" aria-labelledby="product-title">
      <div className="container">
        <div className="product-head-copy">
          <p className="eyebrow">{P.eyebrow}</p>
          <h1 id="product-title" data-testid="product-h1">{P.title}</h1>
          <p className="lead">{P.line}</p>
          <div className="btn-row">
            <DashboardButton />
            <Link to="/" className="btn btn-secondary btn-lg" data-testid="back-home">{P.backHome}</Link>
          </div>
        </div>
        <div className="product-mock-wrap">
          <span className="label-illustrative mock-label">{P.mockLabel}</span>
          <DashboardMock />
        </div>
      </div>
    </section>
  );
}

function Flow() {
  return (
    <section id="flow" className="section section-dark on-dark flow" aria-labelledby="flow-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Flow</p>
          <h2 id="flow-title">From records to reports.</h2>
        </div>
        <div className="flow-track">
          <Thread className="flow-thread thread-desktop" viewBox="0 0 1000 60" axis="x" d="M20 30 C 120 -10, 180 70, 260 30 S 420 -10, 500 30 S 660 70, 740 30 S 900 -10, 980 30" />
          <ol className="flow-nodes">
            {P.flow.map((f, i) => (
              <Reveal as="li" key={f} className="flow-node" delay={i * 0.1}>
                <span className="flow-num mono">{String(i + 1).padStart(2, '0')}</span>
                <span className="flow-label">{f}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* distinct animated line graphics per module */
const moduleArt: Record<string, ReactElement> = {
  profiles: (
    <svg viewBox="0 0 200 140" className="mod-art"><circle cx="60" cy="55" r="22" className="draw" /><path d="M25 120c5-25 20-35 35-35s30 10 35 35" className="draw" /><path d="M115 45h60M115 65h45M115 85h55" className="draw d2" /></svg>
  ),
  catalog: (
    <svg viewBox="0 0 200 140" className="mod-art"><rect x="20" y="20" width="70" height="45" rx="8" className="draw" /><rect x="110" y="20" width="70" height="45" rx="8" className="draw d2" /><rect x="20" y="80" width="70" height="45" rx="8" className="draw d2" /><rect x="110" y="80" width="70" height="45" rx="8" className="draw d3" /></svg>
  ),
  segments: (
    <svg viewBox="0 0 200 140" className="mod-art"><circle cx="75" cy="65" r="40" className="draw" /><circle cx="125" cy="65" r="40" className="draw d2" /><circle cx="100" cy="100" r="30" className="draw d3 dashed" /></svg>
  ),
  recommendations: (
    <svg viewBox="0 0 200 140" className="mod-art"><path d="M20 70h50l20-35h40M90 70l20 35h40" className="draw" /><circle cx="160" cy="35" r="12" className="draw d2" /><circle cx="160" cy="105" r="12" className="draw d3" /><circle cx="20" cy="70" r="8" className="draw" /></svg>
  ),
  analytics: (
    <svg viewBox="0 0 200 140" className="mod-art"><path d="M20 120h165M20 120V20" className="draw" /><path d="M30 100l35-25 30 15 40-45 40 10" className="draw d2" /><path d="M30 110l35-12 30 6 40-22 40 4" className="draw d3 dashed" /></svg>
  ),
  security: (
    <svg viewBox="0 0 200 140" className="mod-art"><path d="M100 15l55 20v35c0 30-25 50-55 60-30-10-55-30-55-60V35z" className="draw" /><path d="M78 72l15 15 30-32" className="draw d2" /></svg>
  ),
};

function Modules() {
  return (
    <section id="modules" className="section section-cream modules" aria-labelledby="modules-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Modules</p>
          <h2 id="modules-title">Six modules, in detail.</h2>
        </div>
        <div className="module-rows">
          {P.modules.map((mod, i) => (
            <Reveal key={mod.id} className={`module-row${i % 2 ? ' is-flipped' : ''}`}>
              <div className="module-copy">
                <span className="module-icon" aria-hidden="true"><Icon name={mod.icon as IconName} size={28} /></span>
                <h3 className="module-title">{mod.title}</h3>
                <p>{mod.text}</p>
                <ul className="module-list">
                  {mod.bullets.map((b) => <li key={b}>{b}</li>)}
                </ul>
              </div>
              <div className="module-visual" aria-hidden="true">{moduleArt[mod.id]}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const tourPanels: Record<string, () => ReactElement> = {
  customers: MockCustomers,
  catalog: MockCatalog,
  segments: MockSegments,
  rules: MockRule,
  reports: MockChart,
};

function Tour() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const uid = useId();
  const n = P.tourTabs.length;

  useEffect(() => {
    if (paused || reduced) return;
    const t = window.setInterval(() => {
      if (document.visibilityState === 'visible') setActive((a) => (a + 1) % n);
    }, 4500);
    return () => window.clearInterval(t);
  }, [paused, reduced, n]);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    let next: number;
    if (e.key === 'ArrowRight') next = (active + 1) % n;
    else if (e.key === 'ArrowLeft') next = (active - 1 + n) % n;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = n - 1;
    else return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };
  const tab = P.tourTabs[active];
  const Panel = tourPanels[tab.id];

  return (
    <section id="tour" className="section section-green on-green tour" aria-labelledby="tour-title">
      <div className="container" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
        <div className="section-head row-head">
          <div>
            <p className="eyebrow">Interactive tour</p>
            <h2 id="tour-title">A quick walk through the dashboard.</h2>
          </div>
          <span className="label-illustrative">{P.mockLabel}</span>
        </div>
        <div role="tablist" aria-label="Dashboard areas" className="tablist tour-tabs">
          {P.tourTabs.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${uid}-t-${t.id}`}
              aria-selected={active === i}
              aria-controls={`${uid}-panel`}
              tabIndex={active === i ? 0 : -1}
              className="tab tab-on-green"
              onClick={() => setActive(i)}
              onKeyDown={onKey}
            >
              {t.label}
            </button>
          ))}
          <button type="button" className="tour-pause mono" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
            {paused ? 'Auto-play paused' : 'Pause auto-play'}
          </button>
        </div>
        <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-t-${tab.id}`} className="tour-panel" tabIndex={0}>
          <AnimatePresence mode="wait" initial={false}>
            <m.div key={tab.id} initial={{ opacity: 0, y: reduced ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.35 }}>
              <Panel />
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Architecture() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useGsapContext(
    ref,
    ({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 900px)', () => {
        const st = { trigger: ref.current?.querySelector('.arch-stack'), start: 'top 75%', end: 'center 45%', scrub: 0.6 };
        gsap.fromTo('.arch-layer-top', { y: 40 }, { y: -18, ease: 'none', scrollTrigger: st });
        gsap.fromTo('.arch-layer-bottom', { y: -40 }, { y: 18, ease: 'none', scrollTrigger: st });
        gsap.fromTo('.arch-caption', { opacity: 0.4 }, { opacity: 1, ease: 'none', scrollTrigger: st });
      });
      return () => mm.revert();
    },
    [],
    !reduced,
  );
  const [top, bottom] = P.architecture.layers;
  return (
    <section ref={ref} id="architecture" className="section section-cream architecture" aria-labelledby="arch-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Architecture</p>
          <h2 id="arch-title">{P.architecture.title}</h2>
        </div>
        <div className="arch-stack">
          {[top, bottom].map((l, i) => (
            <div key={l.title} className={`arch-layer card ${i === 0 ? 'arch-layer-top' : 'arch-layer-bottom card-dark'}`}>
              <h3 className="arch-title">{l.title}</h3>
              <ul className="arch-items">{l.items.map((it) => <li key={it}>{it}</li>)}</ul>
              <p className="arch-caption mono">{l.caption}</p>
            </div>
          ))}
        </div>
        <p className="arch-note muted">{P.architecture.note}</p>
      </div>
    </section>
  );
}

function Foundation() {
  return (
    <section id="foundation" className="section foundation" aria-labelledby="foundation-title">
      <div className="container">
        <div className="foundation-box">
          <p className="eyebrow">Technical context</p>
          <h2 id="foundation-title" className="foundation-title">{P.foundation.title}</h2>
          <ul className="foundation-cards">
            {P.foundation.cards.map((c) => (
              <li key={c.name} className="foundation-card">
                <h3 className="foundation-name">{c.name}</h3>
                <p>{c.text}</p>
              </li>
            ))}
          </ul>
          <p className="foundation-disclaimer" data-testid="nvidia-disclaimer">{P.foundation.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}

function Roadmap() {
  return (
    <section id="roadmap" className="section section-dark on-dark roadmap" aria-labelledby="roadmap-title">
      <div className="container">
        <div className="section-head roadmap-head">
          <p className="eyebrow">The roadmap</p>
          <h2 id="roadmap-title">{P.roadmap.title}</h2>
          <p className="lead roadmap-intro">{P.roadmap.intro}</p>
        </div>
        <ol className="roadmap-stages">
          {P.roadmap.stages.map((stage, i) => (
            <Reveal as="li" key={stage.title + stage.label} className="roadmap-stage" delay={i * 0.07}>
              <span className="roadmap-step mono">{String(i + 1).padStart(2, '0')}</span>
              <p className="roadmap-label">{stage.label}</p>
              <h3>{stage.title}</h3>
              <p>{stage.text}</p>
              <ul className="roadmap-tags" aria-label={`${stage.title} technologies and capabilities`}>
                {stage.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
            </Reveal>
          ))}
        </ol>
        <p className="roadmap-note">{P.roadmap.note}</p>
      </div>
    </section>
  );
}

function Governance() {
  return (
    <section id="governance" className="section section-dark on-dark governance" aria-labelledby="gov-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Governance</p>
          <h2 id="gov-title">{P.governance.title}</h2>
        </div>
        <ul className="gov-list">
          {P.governance.items.map((g, i) => (
            <Reveal as="li" key={g.title} className="gov-item" delay={i * 0.08}>
              <HangTag label={`0${i + 1}`} variant="cream" />
              <h3 className="gov-title">{g.title}</h3>
              <p>{g.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function UseCases() {
  return (
    <section id="use-cases" className="section section-cream use-cases" aria-labelledby="uc-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Use cases</p>
          <h2 id="uc-title">Where it fits.</h2>
        </div>
        <ul className="uc-grid">
          {P.useCases.map((u, i) => (
            <Reveal as="li" key={u.title} className="card liftable uc-card" delay={i * 0.08}>
              <h3 className="uc-title">{u.title}</h3>
              <p>{u.text}</p>
              <Link to="/?subject=general#contact" className="text-link">Learn more<span className="sr-only"> about {u.title}</span> <span aria-hidden="true">→</span></Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PlansSnapshot() {
  return (
    <section id="plans" className="section section-cream plans-snapshot" aria-labelledby="snap-title">
      <div className="container">
        <div className="snapshot card">
          <div>
            <p className="eyebrow">Plans</p>
            <h2 id="snap-title" className="snap-title">Monthly plans at a glance.</h2>
          </div>
          <ul className="snap-list">
            {pricing.plans.map((p) => {
              const price = getPrice(p);
              return (
                <li key={p.id}>
                  <span className="snap-name">{p.name}</span>
                  <span className="snap-price" data-price-plan={p.id} data-price={price.long}>{price.display}{!price.isContact && <span className="price-suffix"> {price.suffix}</span>}</span>
                </li>
              );
            })}
          </ul>
          <Link to="/#pricing" className="btn btn-secondary">Compare plans <span className="arrow" aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="section section-green on-green closing" aria-labelledby="pfinal-title">
      <Thread className="closing-thread thread-desktop" viewBox="0 0 1200 300" axis="x" d="M-10 80 C 200 0, 320 260, 520 170 S 800 -20, 920 120 S 1120 280, 1210 200" />
      <div className="container closing-inner">
        <h2 id="pfinal-title" className="closing-title">{P.finalTitle}</h2>
        <div className="btn-row">
          <a href={dashboardUrl} className="btn btn-secondary btn-lg" target="_blank" rel="noopener noreferrer">
            {P.openDashboard} <Icon name="external" size={18} /><span className="sr-only"> (opens in a new tab)</span>
          </a>
          <Link to="/?subject=demo#contact" className="btn btn-primary btn-lg talk-btn">{P.talkToUs}</Link>
        </div>
      </div>
    </section>
  );
}
