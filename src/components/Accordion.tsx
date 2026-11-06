import { useId, useState } from 'react';
import { Icon } from './Icons';

interface Item { q: string; a: string }

/** Accessible accordion: real buttons with aria-expanded and aria-controls. */
export function Accordion({ items, headingLevel = 3, testId }: { items: Item[]; headingLevel?: 2 | 3 | 4; testId?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();
  const H = `h${headingLevel}` as 'h3';
  return (
    <div className="accordion" data-testid={testId}>
      {items.map((it, i) => {
        const btnId = `${uid}-b-${i}`;
        const panelId = `${uid}-p-${i}`;
        const isOpen = open === i;
        return (
          <div key={it.q} className="acc-item">
            <H className="acc-h">
              <button id={btnId} type="button" className="acc-btn" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpen(isOpen ? null : i)}>
                <span>{it.q}</span>
                <span className="acc-icon" aria-hidden="true"><Icon name="plus" size={18} /></span>
              </button>
            </H>
            <div id={panelId} role="region" aria-labelledby={btnId} className="acc-panel" hidden={!isOpen}>
              <p>{it.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
