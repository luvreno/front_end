import { useRef } from 'react';
import { problem, steps } from '../content';
import { useGsapContext } from '../lib/gsap';
import { useReducedMotion } from '../lib/motion';
import { HangTag, Reveal, Thread } from '../components/Motion';
import { Icon, type IconName } from '../components/Icons';

export function ProblemSection() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // Desktop only: the scattered notes slide into the tidy record as you scroll.
  useGsapContext(
    ref,
    ({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
        const root = ref.current;
        if (!root) return;
        const notes = Array.from(root.querySelectorAll<HTMLElement>('.note'));
        const record = root.querySelector<HTMLElement>('.record-card');
        const rows = root.querySelectorAll('.record-row');
        if (!record) return;
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.querySelector('.problem-stage'), start: 'top 25%', end: 'bottom 15%', scrub: 0.8, invalidateOnRefresh: true },
        });
        // measure without the current transform so refreshes stay accurate
        const delta = (n: HTMLElement, i: number) => {
          const r = record.getBoundingClientRect();
          const prev = n.style.transform;
          n.style.transform = 'none';
          const b = n.getBoundingClientRect();
          n.style.transform = prev;
          return { x: r.left + r.width / 2 - (b.left + b.width / 2), y: r.top + 90 + i * 34 - (b.top + b.height / 2) };
        };
        notes.forEach((n, i) => {
          tl.to(n, { x: () => delta(n, i).x, y: () => delta(n, i).y, rotate: 0, scale: 0.55, opacity: 0.25, ease: 'power1.inOut' }, i * 0.12);
        });
        tl.fromTo(rows, { opacity: 0.35, x: 12 }, { opacity: 1, x: 0, stagger: 0.12, ease: 'power1.out' }, 0.2);
      });
      return () => mm.revert();
    },
    [],
    !reduced,
  );

  return (
    <section id="problem" ref={ref} className="section section-cream problem" aria-labelledby="problem-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{problem.eyebrow}</p>
          <h2 id="problem-title">{problem.title}</h2>
        </div>
        <div className="problem-stage">
          <ul className="board" aria-label="Common problems">
            {problem.notes.map((n, i) => (
              <li key={n} className={`note note-${i + 1}`}>
                <span className="pin" aria-hidden="true" />
                {n}
              </li>
            ))}
          </ul>
          <div className="record-wrap">
            <div className="record-card card">
              <div className="record-head">
                <HangTag label="Organised" variant="green" />
                <h3 className="record-title">{problem.recordTitle}</h3>
              </div>
              <dl className="record-list">
                {problem.record.map((r) => (
                  <div key={r.k} className="record-row">
                    <dt className="mono">{r.k}</dt>
                    <dd>{r.v}</dd>
                  </div>
                ))}
              </dl>
              <p className="record-note mono">{problem.recordNote}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section section-green on-green how" aria-labelledby="how-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">How it works</p>
          <h2 id="how-title">Five steps, one thread.</h2>
          <p className="lead">From scattered records to recommendations you can explain and measure.</p>
        </div>
        <div className="how-track">
          <Thread className="how-thread thread-desktop" viewBox="0 0 1000 80" axis="x" d="M0 40 C 100 0, 150 80, 250 40 S 400 0, 500 40 S 650 80, 750 40 S 900 0, 1000 40" />
          <ol className="how-steps">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.title} className="how-step" delay={i * 0.08}>
                <HangTag label={`Step ${String(i + 1).padStart(2, '0')}`} variant="cream" />
                <span className="how-icon" aria-hidden="true"><Icon name={s.icon as IconName} size={30} /></span>
                <h3 className="how-step-title">{s.title}</h3>
                <p>{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
