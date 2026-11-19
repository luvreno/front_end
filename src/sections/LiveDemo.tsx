import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import { liveDemo as D, productNames, productCta, type DemoRule } from '../content';
import { ProductArt } from '../illustrations/Products';
import { useReducedMotion } from '../lib/motion';

/**
 * Interactive L.VIA demo: a sample shopper's profile on the left (the workspace), the storefront
 * shelf it produces on the right. Every pick comes from one of the four rule types the product
 * really has, and the data is clearly labelled as sample data.
 */
export function LiveDemo() {
  const [shopperId, setShopperId] = useState(D.shoppers[0].id);
  const [on, setOn] = useState<Record<DemoRule, boolean>>({ customer: true, segment: true, related: true, complementary: true });
  const reduced = useReducedMotion();
  const shopper = D.shoppers.find((s) => s.id === shopperId)!;
  const active = D.rules.filter((r) => on[r.id]);
  const picks = active.map((r) => ({ rule: r, ...shopper.picks[r.id] }));

  return (
    <section id="demo" className="section section-cream live-demo" aria-labelledby="demo-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{D.eyebrow}</p>
          <h2 id="demo-title">{D.title}</h2>
          <p className="lead">{D.text}</p>
        </div>
        <p className="demo-banner mono" data-testid="demo-banner">{D.banner}</p>

        <div className="demo-grid">
          <div className="demo-panel demo-workspace on-dark">
            <p className="demo-panel-label mono">{D.workspaceLabel}</p>

            <fieldset className="demo-group">
              <legend className="mono">1. Choose a sample shopper</legend>
              <div className="demo-shoppers">
                {D.shoppers.map((s) => (
                  <label key={s.id} className="demo-shopper">
                    <input type="radio" name="demo-shopper" value={s.id} checked={shopperId === s.id} onChange={() => setShopperId(s.id)} />
                    <span className="demo-shopper-card">
                      <span className="demo-avatar" aria-hidden="true">{s.name[0]}</span>
                      <span className="demo-shopper-name">{s.name}</span>
                      <span className="demo-shopper-seg">{s.segment}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <dl className="demo-profile" data-testid="demo-profile">
              <div><dt className="mono">Segment</dt><dd>{shopper.segment}</dd></div>
              <div><dt className="mono">Last purchase</dt><dd>{shopper.lastPurchase}</dd></div>
              <div>
                <dt className="mono">Preferences</dt>
                <dd><ul className="demo-prefs">{shopper.preferences.map((p) => <li key={p}>{p}</li>)}</ul></dd>
              </div>
            </dl>

            <fieldset className="demo-group">
              <legend className="mono">2. Switch rules on or off <span className="demo-count">({active.length} of {D.rules.length} on)</span></legend>
              <div className="demo-rules">
                {D.rules.map((r) => (
                  <label key={r.id} className="demo-rule">
                    <input type="checkbox" checked={on[r.id]} onChange={(e) => setOn((cur) => ({ ...cur, [r.id]: e.target.checked }))} />
                    <span className="demo-switch" aria-hidden="true" />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="demo-panel demo-store">
            <div className="demo-store-bar" aria-hidden="true">
              <span /><span /><span />
              <span className="demo-store-url mono">{D.storeUrl}</span>
            </div>
            <div className="demo-store-body" aria-live="polite" data-testid="demo-output">
              <p className="demo-store-title">Recommended for {shopper.name}</p>
              <p className="sr-only">
                {picks.length ? `Showing ${picks.map((p) => productNames[p.item]).join(', ')}.` : D.emptyTitle}
              </p>
              {picks.length ? (
                <ul className="demo-shelf">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {picks.map((p, i) => (
                      <m.li
                        key={`${shopper.id}-${p.rule.id}`}
                        className="demo-product"
                        layout={!reduced}
                        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                        transition={reduced ? { duration: 0 } : { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <span className="demo-tag mono">{p.rule.tag}</span>
                        <ProductArt kind={p.item} size={96} />
                        <p className="demo-product-name">{productNames[p.item]}</p>
                        <p className="demo-why"><span className="sr-only">Why shown: </span>{p.why}</p>
                      </m.li>
                    ))}
                  </AnimatePresence>
                </ul>
              ) : (
                <div className="demo-empty" data-testid="demo-empty">
                  <p className="demo-empty-title">{D.emptyTitle}</p>
                  <p>{D.emptyText}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="demo-cta">
          <Link to={productCta.to} className="btn btn-primary btn-lg">
            {productCta.label}<span className="sr-only">{productCta.srHint}</span> <span className="arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
