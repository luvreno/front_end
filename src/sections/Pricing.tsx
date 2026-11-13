import { Link } from 'react-router-dom';
import { pricing, type Plan } from '../content';
import { getPrice, getCheckoutLink } from '../lib/pricing';
import { HangTag, Reveal } from '../components/Motion';
import { Icon } from '../components/Icons';

function PriceTag({ plan, size = 'lg' }: { plan: Plan; size?: 'lg' | 'sm' }) {
  const p = getPrice(plan);
  return (
    <span className={`price price-${size}`} data-price-plan={plan.id} data-price={p.long}>
      <span className="price-amount">{p.display}</span>
      {!p.isContact && <span className="price-suffix"> {p.suffix}</span>}
    </span>
  );
}

function PlanAction({ plan }: { plan: Plan }) {
  const price = getPrice(plan);
  if (price.isContact) {
    return (
      <Link to="/?subject=enterprise#contact" className="btn btn-secondary btn-lg plan-btn" data-testid={`plan-${plan.id}-cta`}>
        {pricing.contactCta} <span className="arrow" aria-hidden="true">→</span>
      </Link>
    );
  }
  const link = getCheckoutLink(plan);
  if (!link) {
    return (
      <button type="button" className="btn btn-lg plan-btn" disabled aria-disabled="true" data-testid={`plan-${plan.id}-cta`}>
        {pricing.notConfigured}
      </button>
    );
  }
  return (
    <a href={link} className={`btn btn-lg plan-btn ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`} target="_blank" rel="noopener noreferrer" data-testid={`plan-${plan.id}-cta`}>
      {pricing.planCta} {plan.name} <span className="arrow" aria-hidden="true">→</span>
      <span className="sr-only">, {price.long} (sandbox checkout, opens in a new tab)</span>
    </a>
  );
}

const cell = (plan: Plan, v: string) => {
  if (v === 'yes') return <><Icon name="check" size={20} /><span className="sr-only">Included</span></>;
  if (v === 'no') return <><span aria-hidden="true">·</span><span className="sr-only">Not included</span></>;
  if (v === 'limit:profiles') return plan.limits.profiles;
  if (v === 'limit:products') return plan.limits.products;
  return v;
};

export function PricingSection() {
  const plans = pricing.plans;
  return (
    <section id="pricing" className="section section-cream pricing" aria-labelledby="pricing-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{pricing.eyebrow}</p>
          <h2 id="pricing-title">{pricing.title}</h2>
          <p className="lead">{pricing.text}</p>
        </div>
        <div className="sandbox-note">
          <span className="badge-sandbox" data-testid="sandbox-badge">{pricing.sandboxBadge}</span>
          <span className="sandbox-card">{pricing.testCardNote}</span>
        </div>
        <ul className="plans">
          {plans.map((plan, i) => (
            <Reveal as="li" key={plan.id} delay={i * 0.08} className={`plan card${plan.highlight ? ' plan-highlight' : ''}`}>
              <div className="plan-top">
                <HangTag label={`Plan 0${i + 1}`} variant={plan.highlight ? 'cream' : 'green'} />
                {plan.highlight && <span className="plan-flag mono">Premium analytics included</span>}
              </div>
              <h3 className="plan-name">{plan.name}</h3>
              <p className="plan-blurb">{plan.blurb}</p>
              <p className="plan-price"><PriceTag plan={plan} /></p>
              <p className="plan-limits mono">
                {plan.limits.profiles === 'Custom' ? 'Custom profile and catalog limits' : `Up to ${plan.limits.profiles} customer profiles and ${plan.limits.products} products`}
              </p>
              <ul className="plan-features">
                {plan.features.map((f) => (
                  <li key={f}><Icon name="check" size={18} /> {f}</li>
                ))}
              </ul>
              <PlanAction plan={plan} />
            </Reveal>
          ))}
        </ul>

        <div className="compare-wrap" tabIndex={0} role="region" aria-labelledby="compare-caption">
          <table className="compare" data-testid="compare-table">
            <caption id="compare-caption">Plan comparison. All prices are per month in USD.</caption>
            <thead>
              <tr>
                <th scope="col">Feature</th>
                {plans.map((p) => <th key={p.id} scope="col">{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Monthly price</th>
                {plans.map((p) => <td key={p.id}><PriceTag plan={p} size="sm" /></td>)}
              </tr>
              {pricing.comparison.map((row) => (
                <tr key={row.feature}>
                  <th scope="row">{row.feature}</th>
                  {plans.map((p, i) => <td key={p.id}>{cell(p, row.values[i])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="custom-note">
          {pricing.customNote} <Link to="/?subject=general#contact" className="text-link">{pricing.customLink}</Link>
        </p>
      </div>
    </section>
  );
}
