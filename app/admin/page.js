import { admin } from '../../lib/supabase';
import { isAdmin } from '../../lib/session';
import SubmitButton from '../../components/SubmitButton';
import { adminLogin, adminLogout, deleteStore, setMembership, generateCode } from './actions';
import { PLANS, CODE_PLANS, membershipStatus, prettyDate, showCode } from '../../lib/membership';

export const dynamic = 'force-dynamic';

export default async function AdminPage({ searchParams }) {
  const err = searchParams.error ? <div className="msg err" role="alert">{searchParams.error}</div> : null;
  const msg = searchParams.msg ? <div className="msg ok">{searchParams.msg}</div> : null;

  if (!(await isAdmin())) {
    return (
      <>
        <h1>Main admin</h1>
        {err}
        <form action={adminLogin}>
          <label htmlFor="admin_id">Admin ID</label>
          <input id="admin_id" name="admin_id" required autoComplete="username" />
          <label htmlFor="password">Admin password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" />
          <SubmitButton label="Log in" busyLabel="Checking…" />
        </form>
      </>
    );
  }

  const db = admin();
  const { data: stores } = await db.from('stores')
    .select('*')
    .order('created_at', { ascending: false });
  const { data: ms } = await db.from('memberships').select('store_id');
  const { data: codes } = await db.from('activation_codes').select('code,plan,created_at')
    .is('used_at', null).order('created_at', { ascending: false }).limit(20);
  const q = (searchParams.q || '').toString().trim();
  const qDigits = q.replace(/\D/g, '');
  const shown = !q ? (stores || []) : (stores || []).filter((s) =>
    (s.business_name || '').toLowerCase().includes(q.toLowerCase()) ||
    (qDigits.length >= 4 && (s.store_card_no || '').endsWith(qDigits))
  );
  const counts = {};
  (ms || []).forEach((m) => { counts[m.store_id] = (counts[m.store_id] || 0) + 1; });

  return (
    <>
      <h1>Main admin</h1>
      <p className="sub">{q ? `${shown.length} of ${(stores || []).length} stores` : `${(stores || []).length} stores`}</p>
      <a className="btn" href="/register" style={{ margin: '12px 0' }}>Register a new store</a>
      <form method="get" action="/admin" style={{ margin: '12px 0' }}>
        <input name="q" defaultValue={q} placeholder="Store name or last 6 digits of card" autoComplete="off" />
        <button className="btn" type="submit" style={{ marginTop: 8 }}>Search existing store</button>
      </form>
      {err}
      {msg}
      <div style={{ border: '1px solid var(--bd)', background: 'var(--card)', borderRadius: 14, padding: 12, marginTop: 12 }}>
        <strong>Activation codes</strong>
        <form action={generateCode} style={{ marginTop: 6 }}>
          <label htmlFor="code-plan">Make a one-time code for</label>
          <select id="code-plan" name="plan" defaultValue="12">
            {CODE_PLANS.map((p) => (
              <option key={p.key} value={p.key}>{p.price ? `${p.label} (₹${p.price})` : p.label}</option>
            ))}
          </select>
          <SubmitButton label="Generate code" busyLabel="Making…" />
        </form>
        {(codes || []).length > 0 && (
          <>
            <p className="sub" style={{ margin: '10px 0 4px' }}>Unused codes</p>
            {(codes || []).map((c) => (
              <div key={c.code} className="sub" style={{ fontFamily: 'ui-monospace, Menlo, Consolas, monospace' }}>
                {showCode(c.code)} · {(CODE_PLANS.find((p) => p.key === c.plan) || {}).label || c.plan}
              </div>
            ))}
          </>
        )}
      </div>
      {shown.map((s) => (
        <div key={s.id} style={{ border: '1px solid var(--bd)', background: 'var(--card)', borderRadius: 14, padding: 12, marginTop: 12 }}>
          <strong><a href={`/s/${s.slug}?manager=1`}>{s.business_name}</a></strong>
          <div className="sub">{s.contact_person} · {s.contact_number}</div>
          <div className="sub">
            {counts[s.id] || 0} customers · created {new Date(s.created_at).toLocaleDateString('en-GB')}
          </div>
          {(() => {
            const ms = membershipStatus(s);
            const text = ms.state === 'life' ? 'Membership: Lifetime'
              : ms.state === 'none' ? 'Membership: not set'
              : ms.state === 'expired' ? `Membership: EXPIRED on ${prettyDate(ms.until)}`
              : `Membership: until ${prettyDate(ms.until)} (${ms.left} day${ms.left === 1 ? '' : 's'} left)`;
            return (
              <div style={{ marginTop: 8 }}>
                <div className="sub" style={{ color: ms.state === 'expired' ? '#D14B4B' : undefined, fontWeight: 600 }}>{text}</div>
                <form action={setMembership} style={{ marginTop: 6 }}>
                  <input type="hidden" name="id" value={s.id} />
                  <label htmlFor={`plan-${s.id}`}>Membership plan paid</label>
                  <select id={`plan-${s.id}`} name="plan" defaultValue="12">
                    {PLANS.map((p) => (
                      <option key={p.key} value={p.key}>{p.label} (₹{p.price})</option>
                    ))}
                    <option value="life">Lifetime (demo account)</option>
                  </select>
                  <SubmitButton label="Record payment" busyLabel="Saving…" />
                </form>
              </div>
            );
          })()}
          <details style={{ marginTop: 8 }}>
            <summary style={{ color: '#D14B4B', fontWeight: 600, cursor: 'pointer' }}>Delete this store</summary>
            <form action={deleteStore}>
              <input type="hidden" name="id" value={s.id} />
              <p className="sub">
                This permanently deletes the store, its customers’ cards, entries and bill photos.
                Type the store name exactly to confirm: <strong>{s.business_name}</strong>
              </p>
              <input name="confirm" autoComplete="off" required />
              <SubmitButton label="Delete store forever" busyLabel="Deleting…" />
            </form>
          </details>
        </div>
      ))}
      <form action={adminLogout} style={{ marginTop: 20 }}>
        <button className="btn" type="submit" style={{ background: 'transparent', color: 'var(--tx)', border: '1px solid var(--bd)' }}>
          Log out
        </button>
      </form>
    </>
  );
}
