import { notFound, redirect } from 'next/navigation';
import { admin } from '../../../../lib/supabase';
import { getOwnerSession } from '../../../../lib/session';
import { buildLedger } from '../../../../lib/ledger';
import { earnedFor } from '../../../../lib/points';
import Statement from '../../../../components/Statement';
import SubmitButton from '../../../../components/SubmitButton';
import { approveEntry, rejectEntry, redeemPoints, deleteCustomer } from './actions';

export const dynamic = 'force-dynamic';

const CHIP = {
  pending: ['Pending', '#FAEEDA', '#633806'],
  verified: ['Verified', '#EAF3DE', '#27500A'],
  ineligible: ['Ineligible', '#FCEBEB', '#791F1F'],
  rejected: ['Rejected', '#FCEBEB', '#791F1F'],
};
const box = { border: '1px solid var(--bd)', background: 'var(--card)', borderRadius: 14, padding: 12, marginTop: 10, display: 'grid', gap: 4 };
const ghost = { background: 'transparent', color: 'var(--tx)', border: '1px solid var(--bd)' };

async function signedMap(db, entries) {
  const paths = entries.map((e) => e.bill_path).filter(Boolean);
  if (!paths.length) return {};
  const { data } = await db.storage.from('bills').createSignedUrls(paths, 900);
  const map = {};
  (data || []).forEach((d) => { if (d.signedUrl) map[d.path] = d.signedUrl; });
  return map;
}

function EntryCard({ e, url, slug, q, who }) {
  const c = CHIP[e.status] || CHIP.pending;
  const hid = (
    <>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="q" value={q} />
      <input type="hidden" name="id" value={e.id} />
    </>
  );
  return (
    <div style={box}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
        <strong>{e.bill_no || 'No bill number'}</strong>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 10, background: c[1], color: c[2] }}>{c[0]}</span>
      </div>
      {who && <div className="sub">{who}</div>}
      <div className="sub">
        {e.entry_date || 'No date'} · Amount {e.amount ?? 'none'}{e.status === 'verified' ? ` · ${e.points} points` : ''}
      </div>
      {e.reason && <div className="sub">{e.reason}</div>}
      {url
        ? <a href={url} target="_blank" rel="noopener noreferrer">View bill photo</a>
        : <span className="sub">No bill photo</span>}
      {e.status === 'pending' && (
        <>
          <form action={approveEntry} style={{ marginTop: 8 }}>
            {hid}
            <button className="btn" type="submit">Approve (+{earnedFor(e.amount)} points)</button>
          </form>
          <form action={rejectEntry} style={{ display: 'grid', gap: 8, marginTop: 4 }}>
            {hid}
            <select name="reason">
              <option>Bill unclear</option>
              <option>Amount does not match</option>
              <option>Other</option>
            </select>
            <button className="btn" type="submit" style={ghost}>Reject</button>
          </form>
        </>
      )}
    </div>
  );
}

export default async function LedgerPage({ params, searchParams }) {
  const db = admin();
  const { data: s } = await db.from('stores').select('id,business_name,slug').eq('slug', params.slug).maybeSingle();
  if (!s) notFound();
  if ((await getOwnerSession()) !== s.id) redirect(`/s/${s.slug}/edit`);

  const q = (searchParams.q || '').toString().replace(/\D/g, '').slice(0, 6);
  let content = null;

  if (q.length === 6) {
    const { data: ms } = await db.from('memberships').select('id,member_no,customer_id')
      .eq('store_id', s.id).like('member_no', `%${q}`);
    if (!ms || !ms.length) {
      content = <p style={{ marginTop: 16 }}>No customer found with a card ending in {q}.</p>;
    } else {
      content = [];
      for (const m of ms) {
        const { data: c } = await db.from('customers').select('name,phone,email').eq('id', m.customer_id).maybeSingle();
        const { data: es } = await db.from('entries').select('*').eq('membership_id', m.id).order('created_at', { ascending: false });
        const { data: rs } = await db.from('redemptions').select('*').eq('membership_id', m.id);
        const { rows, totals } = buildLedger(es || [], rs || []);
        const urls = await signedMap(db, es || []);
        content.push(
          <section key={m.id} style={{ marginTop: 24 }}>
            <h2 style={{ marginBottom: 2 }}>{c?.name || 'Customer'}</h2>
            <div className="sub">
              {c?.phone || c?.email} · Card {m.member_no.replace(/(\d{4})(?=\d)/g, '$1 ')}
            </div>
            <Statement rows={rows} totals={totals} />

            <h2>Bills and checks</h2>
            {(es || []).length === 0 && <p className="sub">No entries yet.</p>}
            {(es || []).map((e) => (
              <EntryCard key={e.id} e={e} url={urls[e.bill_path]} slug={s.slug} q={q} />
            ))}

            <h2>Redeem points</h2>
            <form action={redeemPoints}>
              <input type="hidden" name="slug" value={s.slug} />
              <input type="hidden" name="q" value={q} />
              <input type="hidden" name="membership_id" value={m.id} />
              <label htmlFor={`p${m.id}`}>Points to redeem (available {totals.available})</label>
              <input id={`p${m.id}`} name="points" type="number" min="1" max={totals.available} required />
              <label htmlFor={`n${m.id}`}>Note (optional)</label>
              <input id={`n${m.id}`} name="note" maxLength={80} />
              <SubmitButton label="Redeem points" busyLabel="Saving…" />
            </form>

            <details style={{ marginTop: 20 }}>
              <summary style={{ color: '#D14B4B', fontWeight: 600, cursor: 'pointer' }}>Delete this customer</summary>
              <form action={deleteCustomer}>
                <input type="hidden" name="slug" value={s.slug} />
                <input type="hidden" name="q" value={q} />
                <input type="hidden" name="membership_id" value={m.id} />
                <p className="sub">
                  This removes the customer’s card and all their entries from your store. Type DELETE to confirm.
                </p>
                <input name="confirm" autoComplete="off" required />
                <SubmitButton label="Delete customer" busyLabel="Deleting…" />
              </form>
            </details>
          </section>
        );
      }
    }
  } else {
    const { data: pend } = await db.from('entries').select('*')
      .eq('store_id', s.id).eq('status', 'pending').order('created_at', { ascending: true }).limit(50);
    const list = pend || [];
    let who = {};
    if (list.length) {
      const mids = [...new Set(list.map((e) => e.membership_id))];
      const { data: ms } = await db.from('memberships').select('id,member_no,customer_id').in('id', mids);
      const cids = [...new Set((ms || []).map((m) => m.customer_id))];
      const { data: cs } = await db.from('customers').select('id,name').in('id', cids);
      const names = Object.fromEntries((cs || []).map((c) => [c.id, c.name]));
      who = Object.fromEntries(
        (ms || []).map((m) => [m.id, `${names[m.customer_id] || 'Customer'} · card ending ${m.member_no.slice(-6)}`])
      );
    }
    const urls = await signedMap(db, list);
    content = (
      <>
        <h2>Waiting for your check ({list.length})</h2>
        {list.length === 0 && <p className="sub">Nothing is waiting. New entries appear here.</p>}
        {list.map((e) => (
          <EntryCard key={e.id} e={e} url={urls[e.bill_path]} slug={s.slug} q="" who={who[e.membership_id]} />
        ))}
      </>
    );
  }

  return (
    <>
      <h1>Customer ledger</h1>
      <p className="sub">{s.business_name}</p>
      {searchParams.msg && <div className="msg ok">{searchParams.msg}</div>}
      <form method="get" style={{ marginTop: 12 }}>
        <label htmlFor="q">Last 6 digits of the customer card</label>
        <input id="q" name="q" inputMode="numeric" maxLength={6} pattern="\d{6}" defaultValue={q} placeholder="e.g. 123456" />
        <button className="btn" type="submit" style={{ marginTop: 12 }}>Search</button>
      </form>
      {content}
      <p style={{ marginTop: 24 }}><a href={`/s/${s.slug}/edit`}>Back to store settings</a></p>
    </>
  );
        }
