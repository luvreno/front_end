import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { company, consentConfig, isPlaceholder, legal, site, dashboardUrl } from '../content';
import { staticRoutes } from '../lib/seoData.ts';
import { Seo } from '../components/Seo';
import { LogoMark } from '../components/Logo';
import { useConsent } from '../components/ConsentContext';
import '../styles/blog.css';

type Kind = 'privacy' | 'terms' | 'cookies';
const titles: Record<Kind, string> = { privacy: 'Privacy Policy', terms: 'Terms and Conditions', cookies: 'Cookie Policy' };
const BUILD_DATE = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : new Date().toISOString().slice(0, 10);
const prettyDate = new Date(BUILD_DATE + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

function S({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  );
}

/** Contact block fed by the single company object. Placeholders never become links. */
function CompanyContact() {
  return (
    <S id="contact-us" title="Contact us">
      <p>For any question about this document or your information, contact:</p>
      <dl className="legal-contact" data-testid="legal-contact">
        <div><dt>Company</dt><dd>{company.legalName} (trading as {company.tradingName})</dd></div>
        <div><dt>Phone</dt><dd>{isPlaceholder(company.phone) ? company.phone : <a href={`tel:${company.phone.replace(/[^+\d]/g, '')}`}>{company.phone}</a>}</dd></div>
        <div><dt>Email</dt><dd>{isPlaceholder(company.email) ? company.email : <a href={`mailto:${company.email}`}>{company.email}</a>}</dd></div>
        <div><dt>Address</dt><dd>{company.address}</dd></div>
        <div><dt>Website</dt><dd><a href={company.website} target="_blank" rel="noopener noreferrer">{company.website.replace(/^https?:\/\//, '')}</a></dd></div>
      </dl>
      <p>You can also use the <Link to="/#contact">contact form</Link>.</p>
    </S>
  );
}

function Privacy() {
  return (
    <>
      <S id="who" title="1. Who we are">
        <p>This policy explains how {company.legalName}, trading as Luvreno ("we", "us"), handles personal information collected through {site.url.replace(/^https?:\/\//, '')} (the "site"). The Luvreno dashboard at {dashboardUrl.replace(/^https?:\/\//, '')} may be covered by separate terms and notices provided there.</p>
      </S>
      <S id="collect" title="2. Information we collect">
        <ul>
          <li><strong>Contact form:</strong> your name, email address, optional company, the subject you choose and your message.</li>
          <li><strong>Newsletter:</strong> your email address.</li>
          <li><strong>Feedback (testimonials):</strong> your name, optional company and role, rating, message and your consent to publication. We do not ask for an email address with feedback and never publish one.</li>
          <li><strong>Technical data:</strong> to limit abuse, our server keeps a one-way hash of your IP address for a short time when you submit a form. We do not store the IP address itself with your submission.</li>
          <li><strong>Cookie choice:</strong> your consent choice, its date and the policy version, stored in your browser.</li>
          <li><strong>Chat assistant:</strong> the conversation with the automated assistant is kept in your browser's session storage and cleared when you close the tab. It is not sent to us.</li>
        </ul>
      </S>
      <S id="purposes" title="3. Why we use it">
        <ul>
          <li>To answer your enquiries and provide information you request.</li>
          <li>To send the newsletter you signed up for. You can unsubscribe at any time.</li>
          <li>To review feedback and, where you agreed, publish it on the site after moderation.</li>
          <li>To protect the site and forms against spam and abuse.</li>
          <li>To remember your cookie choice.</li>
        </ul>
      </S>
      <S id="recaptcha" title="4. Google reCAPTCHA">
        <p>Our contact and feedback forms use Google reCAPTCHA to tell people and automated programs apart. The reCAPTCHA script loads only when you scroll near a form. Google processes information such as your IP address and browser details under its own <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>.</p>
      </S>
      <S id="analytics" title="5. Optional analytics">
        <p>No analytics script is loaded unless you choose to allow the Analytics category in the cookie settings. If analytics is enabled in future, it will be used only to understand how the site is used in aggregate, and this policy will name the provider.</p>
      </S>
      <S id="payments" title="6. Sandbox payment links">
        <p>Plan buttons may open Stripe-hosted test-mode Payment Links. These are for demonstration only: no real charge is made and no account is created. Anything you enter on a Stripe page is processed by Stripe under the <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</a>. We do not receive card details.</p>
      </S>
      <S id="third" title="7. Third parties">
        <p>We use service providers for hosting and email delivery, Google for reCAPTCHA and Stripe for sandbox payment pages. We share only what each provider needs to perform its service. We do not sell personal information.</p>
      </S>
      <S id="retention" title="8. How long we keep it">
        <p>{legal.retention}. Rate-limit records are kept for a short window and then discarded. Rejected feedback is deleted during moderation.</p>
      </S>
      <S id="rights" title="9. Your rights">
        <p>Depending on where you live, you may have the right to access, correct, delete or receive a copy of your personal information, to object to or restrict certain processing, and to withdraw consent at any time. You may also have the right to complain to a data protection authority. To use these rights, contact us using the details below.</p>
      </S>
      <S id="cookies" title="10. Cookies and storage">
        <p>See our <Link to="/cookies">Cookie Policy</Link> for the categories we use and how to change your choice.</p>
      </S>
      <S id="changes" title="11. Changes">
        <p>We may update this policy. The date at the top shows when it last changed.</p>
      </S>
      <CompanyContact />
    </>
  );
}

function Terms() {
  return (
    <>
      <S id="about" title="1. About these terms">
        <p>These terms apply to your use of {site.url.replace(/^https?:\/\//, '')} (the "site") and, unless other terms are provided there, the Luvreno dashboard (the "dashboard"), offered by {company.legalName}, trading as Luvreno. By using the site or dashboard you agree to these terms.</p>
      </S>
      <S id="service" title="2. The service">
        <p>Luvreno is a customer and product management application with configurable recommendation rules. Recommendation outputs are produced from the rules you configure and the data you provide. Features, plans and prices shown on the site may change and are confirmed in a separate agreement or order.</p>
      </S>
      <S id="accounts" title="3. Accounts">
        <p>You are responsible for keeping your login details confidential, for activity under your account and for making sure the people you give access to follow these terms. Tell us promptly if you suspect unauthorised access.</p>
      </S>
      <S id="use" title="4. Acceptable use">
        <ul>
          <li>Do not use the site or dashboard for anything unlawful, harmful or misleading.</li>
          <li>Do not upload data you have no right to use, or personal data you have not collected lawfully.</li>
          <li>Do not try to break, overload, probe or bypass the security of the service.</li>
          <li>Do not copy, resell or reverse engineer the service except where the law allows it.</li>
        </ul>
      </S>
      <S id="data" title="5. Your data">
        <p>You keep ownership of the customer and product data you add. You are responsible for having a lawful basis to process it and for the instructions you give through rules and settings.</p>
      </S>
      <S id="ip" title="6. Intellectual property">
        <p>The site, the dashboard, the Luvreno name, logo and content are owned by us or our licensors. You may not use them except as needed to use the service.</p>
      </S>
      <S id="disclaimer" title="7. Disclaimers">
        <p>The site and its content are provided for general information. Illustrations, demos and sample data are illustrative only. To the extent the law allows, the service is provided "as is", without warranties of any kind. We do not guarantee any particular sales, engagement or business result.</p>
      </S>
      <S id="liability" title="8. Limitation of liability">
        <p>To the extent the law allows, we are not liable for indirect or consequential loss, or for loss of profit, revenue or data, arising from your use of the site or dashboard. Nothing in these terms limits liability that cannot be limited by law.</p>
      </S>
      <S id="third-party" title="9. Third-party services">
        <p>The site links to and uses services run by others, such as Google reCAPTCHA and Stripe sandbox payment pages. Their own terms apply to those services.</p>
      </S>
      <S id="changes" title="10. Changes">
        <p>We may update these terms. The date at the top shows when they last changed. Continued use after a change means you accept the updated terms.</p>
      </S>
      <S id="law" title="11. Governing law">
        <p>{legal.governingLaw}.</p>
      </S>
      <CompanyContact />
    </>
  );
}

function Cookies() {
  const { openDialog } = useConsent();
  return (
    <>
      <S id="what" title="1. What this covers">
        <p>The site uses browser storage (cookies, local storage and session storage) for a small number of purposes. Optional categories stay off until you allow them.</p>
      </S>
      <S id="categories" title="2. Categories">
        <div className="legal-table-wrap">
          <table className="legal-table">
            <caption className="sr-only">Storage categories</caption>
            <thead><tr><th scope="col">Category</th><th scope="col">Purpose</th><th scope="col">Default</th></tr></thead>
            <tbody>
              {consentConfig.categories.map((c) => (
                <tr key={c.id}><th scope="row">{c.label}</th><td>{c.text}</td><td>{c.locked ? 'Always on' : 'Off until you allow it'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </S>
      <S id="items" title="3. Items we store">
        <ul>
          <li><code>lv-consent</code> (local storage, necessary): your choice, its date and the policy version.</li>
          <li><code>lv-chat-v1</code> (session storage, necessary): the assistant conversation for this tab only.</li>
          <li><code>lv-intro-v1</code> (session storage, necessary): remembers that the short intro played this session.</li>
          <li><code>lv-strip-dismissed-v1</code> (local storage with Preferences, otherwise session storage): remembers that you closed the announcement strip.</li>
          <li>Google reCAPTCHA (necessary for form security): set by Google when a form with reCAPTCHA loads.</li>
        </ul>
      </S>
      <S id="change" title="4. Changing your choice">
        <p>You can change your choice at any time.</p>
        <button type="button" className="btn btn-primary" onClick={openDialog}>Open cookie preferences</button>
        <p className="legal-small">When we change this policy we update its version, and you will be asked again.</p>
      </S>
      <CompanyContact />
    </>
  );
}

export default function Legal({ kind }: { kind: Kind }) {
  const title = titles[kind];
  return (
    <>
      <Seo {...staticRoutes[`/${kind}`]} />
      <article className="section section-cream page-top legal" aria-labelledby="legal-title">
        <div className="container legal-inner">
          <LogoMark size={48} className="legal-mark" />
          <h1 id="legal-title" className="legal-title">{title}</h1>
          <p className="mono legal-updated">Last updated: <time dateTime={BUILD_DATE}>{prettyDate}</time></p>
          <p className="legal-banner" role="note" data-testid="legal-draft">{legal.draftBanner}</p>
          <div className="prose legal-body">
            {kind === 'privacy' ? <Privacy /> : kind === 'terms' ? <Terms /> : <Cookies />}
          </div>
        </div>
      </article>
    </>
  );
}
