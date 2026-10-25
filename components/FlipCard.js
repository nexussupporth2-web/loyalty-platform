'use client';
import { useState } from 'react';
import LoyaltyCard from './LoyaltyCard';

const TAGS = [
  ['Verified', '#EAF3DE', '#27500A'],
  ['Pending', '#FAEEDA', '#633806'],
  ['Ineligible', '#FCEBEB', '#791F1F'],
];

export default function FlipCard({ name, logo, member, number, tier, rules }) {
  const [back, setBack] = useState(false);
  const slabs = (rules || '').split('\n').map((l) => l.trim()).filter(Boolean);
  const face = { position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' };

  return (
    <>
      <style>{`@media (prefers-reduced-motion:reduce){.flip-inner{transition:none!important}}`}</style>
      <div style={{ perspective: 1000 }}>
        <div
          className="flip-inner"
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '85.6 / 53.98',
            transformStyle: 'preserve-3d',
            transition: 'transform .6s',
            transform: back ? 'rotateY(180deg)' : 'none',
          }}
        >
          <div style={face}>
            <LoyaltyCard name={name} logo={logo} member={member} number={number} tier={tier} />
          </div>

          <div style={{ ...face, transform: 'rotateY(180deg)' }}>
            <div className="lc" data-t={tier} style={{ height: '100%' }}>
              <div className="in">
                <div>
                  <div className="sm" style={{ fontWeight: 700 }}>Redeem points</div>
                  <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.3, maxHeight: 96, overflowY: 'auto' }}>
                    {slabs.length
                      ? slabs.map((l, i) => <div key={i}>{l}</div>)
                      : 'Ask the store how to redeem your points.'}
                  </div>
                </div>
                <div>
                  <div className="sm" style={{ fontWeight: 700, marginBottom: 4 }}>Eligibility colours</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {TAGS.map(([t, bg, fg]) => (
                      <span key={t} style={{ background: bg, color: fg, fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 10 }}>
                        {t}
                      </span>
                    ))}
                  </div>
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
