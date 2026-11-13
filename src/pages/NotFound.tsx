import { Link } from 'react-router-dom';
import { productCta } from '../content';
import { Seo } from '../components/Seo';
import { staticRoutes } from '../lib/seoData.ts';
import { HangTag } from '../components/Motion';
import { ProductArt } from '../illustrations/Products';

export default function NotFound() {
  return (
    <section className="section page-top notfound">
      <Seo {...staticRoutes['/404']} />
      <div className="container notfound-inner">
        <div className="notfound-art" aria-hidden="true">
          <HangTag label="Not on this shelf" variant="green" />
          <ProductArt kind="tote" size={200} />
        </div>
        <div>
          <p className="eyebrow">Error 404</p>
          <h1>This page is not on the shelf.</h1>
          <p className="lead muted">The link may be old or mistyped. These pages are a good place to continue.</p>
          <div className="btn-row">
            <Link to="/" className="btn btn-primary">Back to Home</Link>
            <Link to={productCta.to} className="btn btn-secondary">{productCta.label}<span className="sr-only">{productCta.srHint}</span></Link>
            <Link to="/blog" className="btn btn-secondary">Read the journal</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
