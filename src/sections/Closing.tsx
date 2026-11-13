import { Link } from 'react-router-dom';
import { about, closing, faqs, faqCopy, journalTeaser, dashboardUrl } from '../content';
import { posts, formatDate, categoryArt } from '../lib/blog';
import { Accordion } from '../components/Accordion';
import { HangTag, Reveal, Thread } from '../components/Motion';
import { ProductArt } from '../illustrations/Products';

export function JournalTeaser() {
  const latest = posts.slice(0, 3);
  return (
    <section id="journal" className="section section-cream journal-teaser" aria-labelledby="journal-title">
      <div className="container">
        <div className="section-head row-head">
          <div>
            <p className="eyebrow">{journalTeaser.eyebrow}</p>
            <h2 id="journal-title">{journalTeaser.title}</h2>
          </div>
          <Link to="/blog" className="text-link">{journalTeaser.link} <span aria-hidden="true">→</span></Link>
        </div>
        <ul className="post-grid">
          {latest.map((p, i) => (
            <Reveal as="li" key={p.slug} delay={i * 0.08}>
              <article className="post-card card liftable">
                <HangTag label={p.category} variant={i === 0 ? 'green' : 'cream'} />
                <h3 className="post-card-title">
                  <Link to={`/blog/${p.slug}`} className="stretched">{p.title}</Link>
                </h3>
                <p>{p.excerpt}</p>
                <p className="post-meta mono"><time dateTime={p.date}>{formatDate(p.date)}</time> · {p.readingTime} min read</p>
                <ProductArt kind={categoryArt[p.category] ?? 'notebook'} size={72} className="post-card-art" />
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section id="about" className="section section-green on-green about" aria-labelledby="about-title">
      <div className="container">
        <p className="eyebrow" id="about-title">{about.eyebrow}</p>
        <p className="about-statement">{about.statement}</p>
        <ul className="values">
          {about.values.map((v, i) => (
            <li key={v.title} className="value">
              <span className="value-num mono">0{i + 1}</span>
              <span className="value-title">{v.title}</span>
              <span className="value-text">{v.text}</span>
            </li>
          ))}
        </ul>
        <p className="about-note mono">{about.note}</p>
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section id="faq" className="section section-cream faq" aria-labelledby="faq-title">
      <div className="container faq-grid">
        <div>
          <p className="eyebrow">{faqCopy.eyebrow}</p>
          <h2 id="faq-title">{faqCopy.title}</h2>
          <p className="lead muted">{faqCopy.lead}</p>
        </div>
        <Accordion items={faqs} testId="faq" />
      </div>
    </section>
  );
}

export function ClosingBanner() {
  return (
    <section className="section section-green on-green closing" aria-labelledby="closing-title">
      <Thread className="closing-thread thread-desktop" viewBox="0 0 1200 300" d="M-10 220 C 200 300, 300 40, 500 120 S 760 330, 860 170 S 1000 -10, 1080 90 S 1180 220, 1210 150" axis="x" />
      <div className="container closing-inner">
        <h2 id="closing-title" className="closing-title">{closing.title}</h2>
        <a href={dashboardUrl} className="btn btn-secondary btn-lg" target="_blank" rel="noopener noreferrer">
          {closing.cta} <span className="arrow" aria-hidden="true">→</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </section>
  );
}
