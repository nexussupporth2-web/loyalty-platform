import { notFound, redirect } from 'next/navigation';
import { admin } from '../../../../lib/supabase';
import { getOwnerSession, isAdmin } from '../../../../lib/session';
import { buildLedger } from '../../../../lib/ledger';
import { earnedFor } from '../../../../lib/points';
import { inScheme, attachReset } from '../../../../lib/scheme';
import Statement from '../../../../components/Statement';
import SubmitButton from '../../../../components/SubmitButton';
import ConfirmButton from '../../../../components/ConfirmButton';
import SlidePanels from '../../../../components/SlidePanels';
import { approveEntry, rejectEntry, redeemPoints, deleteCustomer } from './actions';
import { deleteCustomers } from './bulk';

export const dynamic = 'force-dynamic';

const CHIP = {
  pending: ['Pending', '#FAEEDA', '#633806'],
  verified: ['Verified', '#EAF3DE', '#27500A'],
  ineligible: ['Ineligible', '#FCEBEB', '#791F1F'],
  rejected: ['Rejected', '#FCEBEB', '#791F1F'],
};
const box = { border: '1px solid var(--bd)', background: 'var(--card)', borderRadius: 14, padding: 12, marginTop: 10, display: 'grid', gap: 4 };
const ghost = { background: 'transparent', color: 'var(--tx)', border: '1px solid var(--bd)' };
const th = { padding: '10px 8px', fontWeight: 700, fontSize: 12, textAlign: 'left', color: 'var(--tx2)' };
const td = { padding: '10px 8px', borderTop: '1px solid var(--bd)' };

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
  const { data: s } = await db.from('stores').select('*').eq('slug', params.slug).maybeSingle();
  if (!s) notFound();
  await attachReset(db, s);
  if (((await getOwnerSession()) !== s.id && !(await isAdmin()))) redirect(`/s/${s.slug}/edit`);

  const q = (searchParams.q || '').toString().replace(/\D/g, '').slice(0, 6);
  const sort = ['new', 'az', 'points'].includes(searchParams.sort) ? searchParams.sort : 'new';
  let searchContent = null;
  let customersNode = null;
  let waitingNode = null;
  let nPeople = 0;
  let nWait = 0;

  if (q.length === 6) {
    const { data: ms } = await db.from('memberships').select('id,member_no,customer_id')
      .eq('store_id', s.id).like('member_no', `%${q}`);
    if (!ms || !ms.length) {
      searchContent = <p style={{ marginTop: 16 }}>No customer found with a card ending in {q}.</p>;
    } else {
      searchContent = [];
      for (const m of ms) {
        const { data: c } = await db.from('customers').select('name,phone,email').eq('id', m.customer_id).maybeSingle();
        const { data: esAll } = await db.from('entries').select('*').eq('membership_id', m.id).order('created_at', { ascending: false });
        const { data: rsAll } = await db.from('redemptions').select('*').eq('membership_id', m.id);
        const es = inScheme(s, esAll);
        const rs = inScheme(s, rsAll);
        const { rows, totals } = buildLedger(es || [], rs || []);
        const urls = await signedMap(db, es || []);
        searchContent.push(
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
  }

  {
    // All registered customers
    const { data: mems } = await db.from('memberships').select('id,member_no,customer_id,created_at').eq('store_id', s.id);
    const cids = [...new Set((mems || []).map((m) => m.customer_id))];
    const { data: cs } = cids.length
      ? await db.from('customers').select('id,name').in('id', cids)
      : { data: [] };
    const names = Object.fromEntries((cs || []).map((c) => [c.id, c.name]));
    const { data: evAll } = await db.from('entries').select('membership_id,points,created_at').eq('store_id', s.id).eq('status', 'verified');
    const { data: rvAll } = await db.from('redemptions').select('membership_id,points,created_at').eq('store_id', s.id);
    const ev = inScheme(s, evAll);
    const rv = inScheme(s, rvAll);
    const avail = {};
    (ev || []).forEach((e) => { avail[e.membership_id] = (avail[e.membership_id] || 0) + e.points; });
    (rv || []).forEach((r) => { avail[r.membership_id] = (avail[r.membership_id] || 0) - r.points; });

    const people = (mems || []).map((m) => ({
      id: m.id,
      name: names[m.customer_id] || 'Customer',
      last6: m.member_no.slice(-6),
      created: m.created_at,
      points: avail[m.id] || 0,
    }));
    if (sort === 'az') people.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'points') people.sort((a, b) => b.points - a.points);
    else people.sort((a, b) => new Date(b.created) - new Date(a.created));

    // Entries waiting for a check
    const { data: pend } = await db.from('entries').select('*')
      .eq('store_id', s.id).eq('status', 'pending').order('created_at', { ascending: true }).limit(50);
    const list = pend || [];
    let who = {};
    if (list.length) {
      const mids = [...new Set(list.map((e) => e.membership_id))];
      const { data: pm } = await db.from('memberships').select('id,member_no,customer_id').in('id', mids);
      const pcids = [...new Set((pm || []).map((m) => m.customer_id))];
      const { data: pc } = await db.from('customers').select('id,name').in('id', pcids);
      const pn = Object.fromEntries((pc || []).map((c) => [c.id, c.name]));
      who = Object.fromEntries(
        (pm || []).map((m) => [m.id, `${pn[m.customer_id] || 'Customer'} · card ending ${m.member_no.slice(-6)}`])
      );
    }
    const urls = await signedMap(db, list);

    nPeople = people.length;
    nWait = list.length;
    customersNode = (
      <>
        <form method="get" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select name="sort" defaultValue={sort} aria-label="Sort customers" style={{ flex: 1 }}>
            <option value="new">Newly first</option>
            <option value="az">Alphabetical</option>
            <option value="points">As per points status</option>
          </select>
          <button className="btn" type="submit" style={{ width: 'auto', padding: '12px 18px' }}>Sort</button>
        </form>

        {people.length === 0 ? (
          <p className="sub" style={{ textAlign: 'center' }}>No customers yet.</p>
        ) : (
          <div style={{ border: '1px solid var(--bd)', background: 'var(--card)', borderRadius: 14, overflow: 'hidden', marginTop: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Card (last 6)</th>
                  <th style={{ ...th, width: 56 }} />
                </tr>
              </thead>
              <tbody>
                {people.map((p) => (
                  <tr key={p.id}>
                    <td style={{ ...td, fontWeight: 600 }}>{p.name}</td>
                    <td style={{ ...td, fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: 1 }}>{p.last6}</td>
                    <td style={td}>
                      <form action={deleteCustomers}>
                        <input type="hidden" name="slug" value={s.slug} />
                        <input type="hidden" name="sort" value={sort} />
                        <input type="hidden" name="ids" value={p.id} />
                        <ConfirmButton
                          label="🗑"
                          message={`Delete ${p.name} and all their entries? This cannot be undone.`}
                          style={{ width: 'auto', padding: '6px 10px', background: '#F7D7D1', color: '#8A3A32', boxShadow: 'none', borderRadius: 12 }}
                        />
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
    waitingNode = (
      <>
        {list.length === 0 && <p className="sub" style={{ textAlign: 'center' }}>Nothing is waiting. New entries appear here.</p>}
        {list.map((e) => (
          <EntryCard key={e.id} e={e} url={urls[e.bill_path]} slug={s.slug} q="" who={who[e.membership_id]} />
        ))}
      </>
    );
  }

  return (
    <>
      <h1 style={{ textAlign: 'center' }}>Customer ledger</h1>
      <p className="sub" style={{ textAlign: 'center', fontWeight: 400, fontSize: 13, margin: '0 0 4px' }}>{s.business_name}</p>
      {searchParams.msg && <div className="msg ok">{searchParams.msg}</div>}
      <SlidePanels
        initial={q.length === 6 ? 'search' : searchParams.open || (searchParams.sort ? 'customers' : null)}
        items={[
          {
            key: 'search',
            label: 'Search',
            node: (
              <div>
                <form method="get">
                  <label htmlFor="q">Last 6 digits of the customer card</label>
                  <input id="q" name="q" inputMode="numeric" maxLength={6} pattern="\d{6}" defaultValue={q} placeholder="e.g. 123456" />
                  <button className="btn" type="submit" style={{ marginTop: 12 }}>Find customer</button>
                </form>
                {searchContent}
              </div>
            ),
          },
          { key: 'customers', label: `Registered customers (${nPeople})`, node: customersNode },
          { key: 'waiting', label: `Waiting for your check (${nWait})`, node: waitingNode },
        ]}
      />
      <p style={{ marginTop: 24, textAlign: 'center' }}><a href={`/s/${s.slug}/edit`}>Back to store settings</a></p>
    </>
  );
}
