'use client';
import { useState } from 'react';
import SubmitButton from './SubmitButton';
import { activateMembership } from '../app/s/[slug]/edit/actions';

// Small red text shown to the store manager near renewal time. Tapping it opens a pop-up asking for the activation code.
export default function ActivateMembership({ slug, text }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ background: 'none', border: 'none', padding: 0, margin: 0, color: '#D14B4B', fontSize: 12, fontWeight: 600, lineHeight: 1.3, cursor: 'pointer', textAlign: 'center', width: '100%' }}
      >
        {text}
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Activation code"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}
        >
          <div style={{ background: 'var(--card)', color: 'var(--tx)', borderRadius: 18, padding: 20, width: '100%', maxWidth: 360, boxShadow: '0 10px 40px rgba(0,0,0,.4)' }}>
            <h2 style={{ margin: '0 0 6px' }}>Activation code</h2>
            <p className="sub" style={{ margin: '0 0 10px' }}>
              Enter the code you received. The new period starts from the last day of your current membership.
            </p>
            <form action={activateMembership}>
              <input type="hidden" name="slug" value={slug} />
              <input name="code" required autoFocus autoComplete="off" autoCapitalize="characters" placeholder="XXXX-XXXX-XXXX" />
              <SubmitButton label="Activate" busyLabel="Checking…" />
            </form>
            <button
              type="button"
              className="btn"
              onClick={() => setOpen(false)}
              style={{ marginTop: 10, background: 'transparent', color: 'var(--tx)', border: '1px solid var(--bd)' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
