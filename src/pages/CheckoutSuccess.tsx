import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { staticRoutes } from '../lib/seoData.ts';
import { checkoutSuccess, pricing } from '../content';
import { HangTag } from '../components/Motion';
import { Icon } from '../components/Icons';

export default function CheckoutSuccess() {
  return (
    <section className="section page-top checkout-success">
      <Seo {...staticRoutes['/checkout/success']} />
      <div className="container narrow center">
        <HangTag label={pricing.sandboxBadge} variant="dark" />
        <div className="success-icon" aria-hidden="true"><Icon name="check" size={40} /></div>
        <h1 className="h-md">{checkoutSuccess.title}</h1>
        <p className="lead" data-testid="checkout-text">{checkoutSuccess.text}</p>
        <div className="btn-row" style={{ justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
          <Link to="/#pricing" className="btn btn-secondary">Back to Pricing</Link>
        </div>
      </div>
    </section>
  );
}
