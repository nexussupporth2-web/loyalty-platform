'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resetAllCards } from '../lib/resetCards';

// Small "Reset" button. It opens a full-screen warning; "Yes reset all" sets every customer card of the store to zero.
export default function ResetCards({ slug }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  async function confirm() {
    setBusy(true);
    const r = await resetAllCards(slug);
    setBusy(false);
    setResult(r);
    if (r.ok) router.refresh();
  }
  function close() {
    setOpen(false);
    setResult(null);
  }

  return (
    <>
      <button
        type="button"
        className="btn"
        onClick={() => setOpen(true)}
        style={{ width: 'auto', padding: '10px 14px', background: '#F7D7D1', color: '#8A3A32', boxShadow: 'none' }}
      >
        Reset
      </button>
      {open && (
        <div
          role="alertdialog"
          aria-modal="true"
          style={{
            position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(20,12,8,.94)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
        >
          <div style={{ maxWidth: 420, width: '100%', textAlign: 'center', color: '#fff' }}>
            {result && result.ok ? (
              <>
                <p style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4 }}>Done. All customer cards are reset to zero.</p>
                <button type="button" className="btn" onClick={close} style={{ marginTop: 20 }}>Close</button>
              </>
            ) : (
              <>
                <p style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.3, margin: '0 0 16px' }}>⚠️ Warning: This Action Cannot Be Reversed!</p>
                <p style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.4, margin: '0 0 14px' }}>
                  Are you sure you want to reset all existing customer cards to zero?
                </p>
                <p style={{ fontSize: 16, lineHeight: 1.5, margin: '0 0 14px' }}>
                  This action will permanently erase all reward points earned by customers to date. Once reset, the points cannot be recovered.
                </p>
                <p style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Are you sure you want to proceed?</p>
                {result && !result.ok && <p style={{ color: '#F7D7D1' }}>{result.msg}</p>}
                <button
                  type="button"
                  className="btn"
                  onClick={confirm}
                  disabled={busy}
                  style={{ marginTop: 24, background: '#D14B4B', color: '#fff', boxShadow: 'none' }}
                >
                  {busy ? 'Resetting…' : 'Yes, Reset All'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={close}
                  disabled={busy}
                  style={{ marginTop: 12, background: 'transparent', color: '#fff', border: '1px solid #fff', boxShadow: 'none' }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
