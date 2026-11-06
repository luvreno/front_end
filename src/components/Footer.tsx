import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { footer, newsletter, dashboardUrl, socialLinks, citationLinks, realLinks, company, isPlaceholder } from '../content';
import { Logo } from './Logo';
import { Icon } from './Icons';
import { NewsletterForm } from './Newsletter';
import { useConsent } from './ConsentContext';
import { useGsapContext } from '../lib/gsap';
import { useReducedMotion } from '../lib/motion';

export function Footer() {
  const { openDialog } = useConsent();
  const wordRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const social = realLinks(socialLinks);
  const citations = realLinks(citationLinks);
  const year = new Date().getFullYear();

  // the giant outline wordmark fills with terracotta as it scrolls into view
  useGsapContext(
    wordRef,
    ({ gsap }) => {
      const outer = wordRef.current?.querySelector('.wm-fill');
      const inner = wordRef.current?.querySelector('.wm-fill-inner');
      if (!outer || !inner) return;
      const st = { trigger: wordRef.current, start: 'top 95%', end: 'bottom 75%', scrub: 0.5 };
      gsap.fromTo(outer, { xPercent: -100 }, { xPercent: 0, ease: 'none', scrollTrigger: st });
      gsap.fromTo(inner, { xPercent: 100 }, { xPercent: 0, ease: 'none', scrollTrigger: st });
    },
    [],
    !reduced,
  );

  return (
    <footer className="site-footer on-dark" data-testid="footer">
      <div className="container">
        <div className="footer-top">
          <p className="footer-line">{footer.line}</p>
          <div className="nl-tag">
            <span className="nl-tag-string" aria-hidden="true" />
            <div className="nl-tag-card">
              <span className="nl-tag-hole" aria-hidden="true" />
              <h2 className="nl-title">{newsletter.title}</h2>
              <p className="nl-text">{newsletter.text}</p>
              <NewsletterForm idPrefix="footer-nl" />
            </div>
          </div>
        </div>

        <nav aria-label="Footer" className="footer-contents">
          <p className="footer-contents-title mono">Contents</p>
          <ul className="footer-links">
            {footer.links.map((l) => (
              <li key={l.label}>
                {l.external ? (
                  <a href={dashboardUrl} target="_blank" rel="noopener noreferrer">
                    {l.label} <Icon name="external" size={15} />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : l.plain ? (
                  <a href={l.to}>{l.label}</a>
                ) : (
                  <Link to={l.to}>{l.label}</Link>
                )}
              </li>
            ))}
            <li>
              <button type="button" className="footer-btn" onClick={openDialog} data-testid="cookie-prefs">Cookie preferences</button>
            </li>
          </ul>
        </nav>

        {(social.length > 0 || citations.length > 0) && (
          <div className="footer-ext">
            {social.length > 0 && (
              <div>
                <p className="mono footer-ext-title">Social</p>
                <ul>{social.map((l) => <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a></li>)}</ul>
              </div>
            )}
            {citations.length > 0 && (
              <div>
                <p className="mono footer-ext-title">Listed on</p>
                <ul>{citations.map((l) => <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a></li>)}</ul>
              </div>
            )}
          </div>
        )}

        <div className="footer-contact">
          <p className="mono footer-ext-title">Company</p>
          <p>{company.legalName}</p>
          <p>
            {isPlaceholder(company.email) ? company.email : <a href={`mailto:${company.email}`}>{company.email}</a>}
            {' · '}
            {isPlaceholder(company.phone) ? company.phone : <a href={`tel:${company.phone.replace(/[^+\d]/g, '')}`}>{company.phone}</a>}
          </p>
          <p>{company.address}</p>
        </div>

        <div className="footer-bottom">
          <button type="button" className="back-top" onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}>
            <Icon name="up" size={18} /> Back to top
          </button>
        </div>
      </div>

      <div className="footer-wordmark" ref={wordRef} aria-hidden="true">
        <span className="wm-outline">Luvreno</span>
        <span className="wm-fill">
          <span className="wm-fill-inner">Luvreno</span>
        </span>
      </div>

      <div className="container footer-legal">
        <Link to="/" aria-label="Luvreno home"><Logo variant="dark" size={32} /></Link>
        <p>© {year} Luvreno. All rights reserved.</p>
      </div>
    </footer>
  );
}
