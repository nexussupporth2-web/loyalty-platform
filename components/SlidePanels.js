'use client';

import { useState } from 'react';

// A list of buttons; each one slides its own section open right below it and pushes the rest down.
// Tap the same button again to slide it shut. To add another button later, add one more item.
// items: [{ key, label, node }]   initial: key of the section that starts open (or null)
export default function SlidePanels({ items, initial = null, onePerTime = true }) {
  const [open, setOpen] = useState(onePerTime ? initial : initial ? [initial] : []);
  const isOpen = (k) => (onePerTime ? open === k : open.includes(k));
  const toggle = (k) => {
    if (onePerTime) setOpen(open === k ? null : k);
    else setOpen(open.includes(k) ? open.filter((x) => x !== k) : [...open, k]);
  };
  return (
    <>
      {items.map((it) => {
        const on = isOpen(it.key);
        return (
          <div key={it.key}>
            <button
              type="button"
              className="btn"
              aria-expanded={on}
              aria-controls={`panel-${it.key}`}
              onClick={() => toggle(it.key)}
              style={{ margin: '12px 0 0' }}
            >
              {it.label}
            </button>
            <div
              id={`panel-${it.key}`}
              style={{ display: 'grid', gridTemplateRows: on ? '1fr' : '0fr', transition: 'grid-template-rows .35s ease' }}
            >
              <div
                style={{
                  overflow: 'hidden', minHeight: 0,
                  visibility: on ? 'visible' : 'hidden',
                  transition: `visibility 0s linear ${on ? '0s' : '.35s'}`,
                }}
              >
                <div style={{ paddingTop: 10 }}>{it.node}</div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
