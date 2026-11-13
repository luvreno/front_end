import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { productCta } from '../content';
import { getPost, relatedPosts, neighbours, formatDate, categoryArt } from '../lib/blog';
import { getPostBody } from '../lib/blogBodies';
import { postSeo } from '../lib/seoData.ts';
import { Seo } from '../components/Seo';
import { HangTag } from '../components/Motion';
import { ProductArt } from '../illustrations/Products';
import { Icon } from '../components/Icons';
import NotFound from './NotFound';
import '../styles/blog.css';

/** Reading progress drawn as a terracotta thread along the top (transform only). */
function ProgressThread({ target }: { target: React.RefObject<HTMLElement | null> }) {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = target.current;
      if (!el || !bar.current) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
      bar.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [target]);
  return (
    <div className="progress-thread" aria-hidden="true">
      <div ref={bar} className="progress-thread-bar" />
    </div>
  );
}

function CopyLink() {
  const [state, setState] = useState<'idle' | 'ok' | 'err'>('idle');
  useEffect(() => {
    if (state === 'idle') return;
    const t = window.setTimeout(() => setState('idle'), 2500);
    return () => window.clearTimeout(t);
  }, [state]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split('#')[0]);
      setState('ok');
    } catch {
      setState('err');
    }
  };
  return (
    <>
      <button type="button" className="btn btn-secondary copy-btn" onClick={copy} data-testid="copy-link">
        <Icon name="link" size={18} /> {state === 'ok' ? 'Link copied' : 'Copy link'}
      </button>
      <span className="sr-only" aria-live="polite">{state === 'ok' ? 'Link copied to clipboard' : state === 'err' ? 'Could not copy the link' : ''}</span>
    </>
  );
}

export default function Post() {
  const { slug = '' } = useParams();
  const post = getPost(slug);
  const body = getPostBody(slug);
  const articleRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // highlight the TOC entry for the heading in view
  useEffect(() => {
    if (!body) return;
    const els = body.headings.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActiveId(vis[0].target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [body, slug]);

  if (!post || !body) return <NotFound />;
  const related = relatedPosts(slug);
  const { prev, next } = neighbours(slug);

  return (
    <>
      <Seo {...postSeo(post)} />
      <ProgressThread target={articleRef} />
      <article ref={articleRef} className="section section-cream page-top post" aria-labelledby="post-title">
        <div className="container">
          <nav aria-label="Breadcrumb" className="crumbs mono">
            <Link to="/blog">Journal</Link> <span aria-hidden="true">/</span> <span aria-current="page">{post.category}</span>
          </nav>
          <header className="post-header">
            <HangTag label={post.category} variant="green" />
            <h1 id="post-title" className="post-title">{post.title}</h1>
            <p className="lead">{post.excerpt}</p>
            <p className="post-byline mono">
              By {post.author} · <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingTime} min read
            </p>
            <div className="post-hero-art" aria-hidden="true"><ProductArt kind={categoryArt[post.category] ?? 'notebook'} size={140} /></div>
          </header>
          <div className="post-layout">
            <aside className="toc" aria-labelledby="toc-title">
              <p id="toc-title" className="mono toc-title">On this page</p>
              <ol>
                {body.headings.filter((h) => h.level === 2).map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className={activeId === h.id ? 'is-active' : undefined} aria-current={activeId === h.id ? 'location' : undefined}>{h.text}</a>
                  </li>
                ))}
              </ol>
              <CopyLink />
            </aside>
            <div className="prose" dangerouslySetInnerHTML={{ __html: body.html }} />
          </div>

          <nav className="post-nav" aria-label="More posts">
            {prev ? (
              <Link to={`/blog/${prev.slug}`} className="post-nav-link" rel="prev"><span className="mono">Previous</span><span>{prev.title}</span></Link>
            ) : <span />}
            {next ? (
              <Link to={`/blog/${next.slug}`} className="post-nav-link post-nav-next" rel="next"><span className="mono">Next</span><span>{next.title}</span></Link>
            ) : <span />}
          </nav>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section section-cream related" aria-labelledby="related-title">
          <div className="container">
            <h2 id="related-title" className="related-title">Related reading</h2>
            <ul className="post-grid">
              {related.map((p) => (
                <li key={p.slug}>
                  <article className="post-card card liftable">
                    <HangTag label={p.category} />
                    <h3 className="post-card-title"><Link to={`/blog/${p.slug}`} className="stretched">{p.title}</Link></h3>
                    <p className="post-meta mono">{p.readingTime} min read</p>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section section-green on-green closing" aria-labelledby="post-cta">
        <div className="container closing-inner">
          <h2 id="post-cta" className="closing-title">Put these ideas on your own shelves.</h2>
          <Link to={productCta.to} className="btn btn-secondary btn-lg">{productCta.label}<span className="sr-only">{productCta.srHint}</span> <span className="arrow" aria-hidden="true">→</span></Link>
        </div>
      </section>
    </>
  );
}
