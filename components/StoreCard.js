'use client';
import { useState } from 'react';

// Black Store Registration Card: front (store card number) and back (membership fee details).
// Same bank-card shape as the customer loyalty card.
function twoLines(name) {
  const w = name.toUpperCase().split(/\s+/).filter(Boolean);
  if (w.length < 2) return [w[0] || '', ''];
  const i = Math.ceil(w.length / 2);
  return [w.slice(0, i).join(' '), w.slice(i).join(' ')];
}

export default function StoreCard({ storeName, number, brandName, brandLogo, plans, until }) {
  const [back, setBack] = useState(false);
  const [b1, b2] = twoLines(brandName);
  const face = { position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' };
  const grouped = number.replace(/(\d{4})(?=\d)/g, '$1 ');

  return (
    <>
      <style>{`
        .lc[data-t="Black"]{--c1:#151515;--c2:#2A2A2A;--c3:#363636;--ct:#F3EBDD;--ct2:#BFAF8F;background:linear-gradient(135deg,#1A1A1A,#0C0C0C)}
        .lc[data-t="Black"] .badge{background:#D9B77A;color:#1A1A1A}
        .lc[data-t="Black"] .lg{background:#000}
        @media (prefers-reduced-motion:reduce){.flip-inner-s{transition:none!important}}
      `}</style>
      <div style={{ perspective: 1000 }}>
        <div
          className="flip-inner-s"
          style={{
            position: 'relative', width: '100%', aspectRatio: '85.6 / 53.98', transformStyle: 'preserve-3d',
            transition: 'transform .6s', transform: back ? 'rotateY(180deg)' : 'none',
          }}
        >
          <div style={face}>
            <div className="lc" data-t="Black">
              <span className="circ c1" /><span className="circ c2" />
              <div className="in">
                <div className="row"><span className="sm">Store registration card</span><span className="badge">Store</span></div>
                <div className="chip" />
                <p className="num">{grouped}</p>
                <div className="row end">
                  <div style={{ minWidth: 0 }}>
                    <div className="sm">Store name</div>
                    <div className="mn" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 185 }}>
                      {storeName.toUpperCase()}
                    </div>
                  </div>
                  <div className="row" style={{ gap: 6 }}>
                    <div className="sn"><span>{b1}</span><span>{b2}</span></div>
                    <div className="lg"><img src={brandLogo} alt="" /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ ...face, transform: 'rotateY(180deg)' }}>
            <div className="lc" data-t="Black" style={{ height: '100%' }}>
              <div className="in" style={{ gap: 4 }}>
                <div className="sm" style={{ fontWeight: 700, letterSpacing: 1 }}>MEMBERSHIP FEE</div>
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', fontSize: 12.5, lineHeight: 1.25 }}>
                  {plans.map((p) => (
                    <div key={p.key} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: p.recommended ? 700 : 400 }}>
                      {p.label} @ ₹{p.rate} = ₹{p.price}{p.recommended ? ' *' : ''}
                    </div>
                  ))}
                </div>
                <div className="row">
                  <span className="sm">{plans.some((p) => p.recommended) ? '* Recommended' : ''}</span>
                  <span className="sm">{until === 'Lifetime' ? 'Lifetime membership' : until ? `Valid until ${until}` : 'Validity not set yet'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="btn"
        aria-pressed={back}
        onClick={() => setBack(!back)}
        style={{
          marginTop: 12, background: 'transparent', color: 'var(--tx)', border: '1px solid var(--bd)',
          width: 'auto', padding: '8px 16px', display: 'block', marginInline: 'auto',
        }}
      >
        {back ? 'Show front' : 'Flip card'}
      </button>
    </>
  );
}
