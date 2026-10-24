import { admin } from '../../lib/supabase';
import { isAdmin } from '../../lib/session';
import SubmitButton from '../../components/SubmitButton';
import { adminLogin, adminLogout, deleteStore } from './actions';

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
          <label htmlFor="password">Admin password</label>
          <input id="password" name="password" type="password" required />
          <SubmitButton label="Log in" busyLabel="Checking…" />
        </form>
      </>
    );
  }

  const db = admin();
  const { data: stores } = await db.from('stores')
    .select('id,slug,business_name,contact_person,contact_number,created_at')
    .order('created_at', { ascending: false });
  const { data: ms } = await db.from('memberships').select('store_id');
  const counts = {};
  (ms || []).forEach((m) => { counts[m.store_id] = (counts[m.store_id] || 0) + 1; });

  return (
    <>
      <h1>Main admin</h1>
      <p className="sub">{(stores || []).length} stores</p>
      {err}
      {msg}
      {(stores || []).map((s) => (
        <div key={s.id} style={{ border: '1px solid var(--bd)', background: 'var(--card)', borderRadius: 14, padding: 12, marginTop: 12 }}>
          <strong><a href={`/s/${s.slug}`}>{s.business_name}</a></strong>
          <div className="sub">{s.contact_person} · {s.contact_number}</div>
          <div className="sub">
            {counts[s.id] || 0} customers · created {new Date(s.created_at).toLocaleDateString('en-GB')}
          </div>
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
