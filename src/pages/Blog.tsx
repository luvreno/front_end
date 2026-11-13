import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { blogCopy } from '../content';
import { posts, categories, filterPosts, formatDate, categoryArt, type PostMeta } from '../lib/blog';
import { Seo } from '../components/Seo';
import { staticRoutes } from '../lib/seoData.ts';
import { HangTag } from '../components/Motion';
import { ProductArt } from '../illustrations/Products';
import { Icon } from '../components/Icons';
import '../styles/blog.css';

function PostCard({ p, featured = false }: { p: PostMeta; featured?: boolean }) {
  return (
    <article className={`post-card card liftable${featured ? ' post-featured' : ''}`} data-testid="post-card">
      <div className="post-cover" aria-hidden="true">
        <ProductArt kind={categoryArt[p.category] ?? 'notebook'} size={featured ? 180 : 110} />
      </div>
      <HangTag label={p.category} variant={featured ? 'green' : 'cream'} />
      {featured && <p className="mono featured-label">Featured</p>}
      <h2 className={featured ? 'post-featured-title' : 'post-card-title'}>
        <Link to={`/blog/${p.slug}`} className="stretched">{p.title}</Link>
      </h2>
      <p>{p.excerpt}</p>
      <p className="post-meta mono"><time dateTime={p.date}>{formatDate(p.date)}</time> · {p.readingTime} min read</p>
    </article>
  );
}

export default function Blog() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category');
  const activeCategory = category && categories.includes(category as PostMeta['category']) ? category : null;
  const urlQuery = params.get('q') ?? '';
  const [query, setQuery] = useState(urlQuery);
  const [debounced, setDebounced] = useState(urlQuery);
  const [shown, setShown] = useState(blogCopy.pageSize);

  // debounce typing, then mirror the query in the URL
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query), 250);
    return () => window.clearTimeout(t);
  }, [query]);
  useEffect(() => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debounced.trim()) next.set('q', debounced.trim());
        else next.delete('q');
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  }, [debounced, setParams]);
  useEffect(() => setShown(blogCopy.pageSize), [activeCategory, debounced]);

  const filtering = !!activeCategory || !!debounced.trim();
  const featured = posts[0];
  const results = useMemo(() => filterPosts(filtering ? posts : posts.slice(1), activeCategory, debounced), [filtering, activeCategory, debounced]);
  const visible = results.slice(0, shown);

  const pickCategory = (c: string | null) => {
    const next = new URLSearchParams(params);
    if (c) next.set('category', c);
    else next.delete('category');
    setParams(next, { preventScrollReset: true });
  };

  return (
    <>
      <Seo {...staticRoutes['/blog']} />
      <section className="section section-cream page-top blog-head" aria-labelledby="blog-title">
        <div className="container">
          <p className="eyebrow">The Luvreno journal</p>
          <h1 id="blog-title">{blogCopy.title}</h1>
          <p className="lead">{blogCopy.intro}</p>
        </div>
      </section>

      {!filtering && featured && (
        <section className="section-cream blog-featured" aria-label="Featured post">
          <div className="container"><PostCard p={featured} featured /></div>
        </section>
      )}

      <section className="section section-cream blog-list" aria-labelledby="all-posts">
        <div className="container">
          <h2 id="all-posts" className="sr-only">All posts</h2>
          <div className="blog-tools">
            <div className="chips" role="group" aria-label="Filter by category">
              <button type="button" className="chip" aria-pressed={!activeCategory} onClick={() => pickCategory(null)}>{blogCopy.all}</button>
              {categories.map((c) => (
                <button key={c} type="button" className="chip" aria-pressed={activeCategory === c} onClick={() => pickCategory(c)} data-testid="category-chip">{c}</button>
              ))}
            </div>
            <div className="field blog-search">
              <input id="blog-search" type="search" placeholder=" " value={query} onChange={(e) => setQuery(e.target.value)} data-testid="blog-search" />
              <label htmlFor="blog-search" className="float">{blogCopy.searchLabel}</label>
              <Icon name="search" className="search-icon" />
            </div>
          </div>
          <p className="sr-only" aria-live="polite">{results.length} posts found</p>
          {visible.length ? (
            <ul className="blog-grid">
              {visible.map((p) => <li key={p.slug}><PostCard p={p} /></li>)}
            </ul>
          ) : (
            <p className="blog-empty" data-testid="blog-empty">{blogCopy.empty}</p>
          )}
          {results.length > shown && (
            <div className="center load-more">
              <button type="button" className="btn btn-secondary" onClick={() => setShown((s) => s + blogCopy.pageSize)} data-testid="load-more">{blogCopy.loadMore}</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
