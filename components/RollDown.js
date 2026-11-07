'use client';

import { useState } from 'react';

// A button that rolls its content down when tapped and rolls it up when tapped again.
export default function RollDown({ label, children }) {
  const [on, setOn] = useState(false);
  return (
    <>
      <button
        type="button"
        className="btn"
        aria-expanded={on}
        aria-controls="rolldown-panel"
        onClick={() => setOn(!on)}
        style={{ marginTop: 16 }}
      >
        {label}
      </button>
      <div
        id="rolldown-panel"
        style={{ display: 'grid', gridTemplateRows: on ? '1fr' : '0fr', transition: 'grid-template-rows .4s ease' }}
      >
        <div
          style={{
            overflow: 'hidden', minHeight: 0,
            visibility: on ? 'visible' : 'hidden',
            transition: `visibility 0s linear ${on ? '0s' : '.4s'}`,
          }}
        >
          <div style={{ paddingTop: 16 }}>{children}</div>
        </div>
      </div>
    </>
  );
}
