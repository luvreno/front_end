import { useRef, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { productPage as P, dashboardUrl } from '../content';
import { Seo } from '../components/Seo';
import { staticRoutes } from '../lib/seoData.ts';
import { Reveal, Thread } from '../components/Motion';
import { Icon, type IconName } from '../components/Icons';
import { DashboardMock } from '../sections/Mockups';
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
