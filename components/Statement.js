const CHIP = {
  pending: ['Pending', '#FAEEDA', '#633806'],
  verified: ['Verified', '#EAF3DE', '#27500A'],
  ineligible: ['Ineligible', '#FCEBEB', '#791F1F'],
  rejected: ['Rejected', '#FCEBEB', '#791F1F'],
};

const fmt = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });

const th = { padding: '8px', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' };
const td = { padding: '8px', borderTop: '1px solid var(--bd)', verticalAlign: 'top' };
const num = { ...td, textAlign: 'right', whiteSpace: 'nowrap' };

export default function Statement({ rows, totals }) {
  return (
    <>
      <h2>Statement</h2>
      <div style={{ border: '1px solid var(--bd)', borderRadius: 12, background: 'var(--card)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 400 }}>
            <thead>
              <tr style={{ color: 'var(--tx2)', textAlign: 'left' }}>
                <th style={th}>Date</th>
                <th style={th}>Details</th>
                <th style={{ ...th, textAlign: 'right' }}>Credit</th>
                <th style={{ ...th, textAlign: 'right' }}>Debit</th>
                <th style={{ ...th, textAlign: 'right' }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td style={{ ...td, textAlign: 'center', color: 'var(--tx2)' }} colSpan={5}>No entries yet</td></tr>
              )}
              {rows.map((r) => {
                const c = r.status ? CHIP[r.status] : null;
                return (
                  <tr key={r.key}>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{fmt(r.date)}</td>
                    <td style={td}>
                      <div style={{ fontWeight: 600 }}>{r.title}</div>
                      {r.sub && <div style={{ color: 'var(--tx2)', fontSize: 12 }}>{r.sub}</div>}
                      {c && (
                        <span style={{ display: 'inline-block', marginTop: 2, fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 10, background: c[1], color: c[2] }}>
                          {c[0]}
                        </span>
                      )}
                      {r.reason && <div style={{ color: 'var(--tx2)', fontSize: 11 }}>{r.reason}</div>}
                    </td>
                    <td style={{ ...num, color: r.credit ? '#27A05A' : 'var(--tx2)' }}>{r.credit ? '+' + r.credit : '-'}</td>
                    <td style={{ ...num, color: r.debit ? '#D14B4B' : 'var(--tx2)' }}>{r.debit ? '-' + r.debit : '-'}</td>
                    <td style={{ ...num, fontWeight: 600 }}>{r.bal}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ borderTop: '2px solid var(--bd)', padding: 12, display: 'grid', gap: 6, fontSize: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Total entries made</span><strong>{totals.entries}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Total points earned</span><strong>{totals.earned}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Total points redeemed</span><strong>{totals.redeemed}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, borderTop: '1px solid var(--bd)', paddingTop: 6 }}>
            <span>Total available points</span><strong>{totals.available}</strong>
          </div>
        </div>
      </div>
    </>
  );
}
