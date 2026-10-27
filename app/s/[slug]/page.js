import { notFound, redirect } from 'next/navigation';
import { admin } from '../../../../lib/supabase';
import { getSession } from '../../../../lib/session';
import { tierFor } from '../../../../lib/points';
import { logout } from '../join/actions';
import { addEntry } from './actions';
import FlipCard from '../../../../components/FlipCard';
import SocialLinks from '../../../../components/SocialLinks';
import SubmitButton from '../../../../components/SubmitButton';
import BillInput from '../../../../components/BillInput';
import Statement from '../../../../components/Statement';

export const dynamic = 'force-dynamic';

const CHIP = {
  pending: ['Pending', '#FAEEDA', '#633806'],
  verified: ['Verified', '#EAF3DE', '#27500A'],
  ineligible: ['Ineligible', '#FCEBEB', '#791F1F'],
  rejected: ['Rejected', '#FCEBEB', '#791F1F'],
};

const fmt = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });

export default async function CardPage({ params, searchParams }) {
  const db = admin();
  const { data: s } = await db.from('stores').select('*')
    .eq('slug', params.slug).eq('status', 'active').maybeSingle();
  if (!s) notFound();

  const cid = await getSession();
  if (!cid) redirect(`/s/${s.slug}/join?mode=login`);

  const { data: m } = await db.from('memberships').select('id,member_no')
    .eq('store_id', s.id).eq('customer_id', cid).maybeSingle();
  const { data: c } = await db.from('customers').select('name').eq('id', cid).maybeSingle();
  if (!m || !c) redirect(`/s/${s.slug}/join?mode=login`);

  const { data: entries } = await db.from('entries').select('*').eq('membership_id', m.id);
  const { data: reds } = await db.from('redemptions').select('*').eq('membership_id', m.id);

  const items = [
    ...(entries || []).map((e) => ({ t: e.created_at, e })),
    ...(reds || []).map((r) => ({ t: r.created_at, r })),
  ].sort((a, b) => new Date(a.t) - new Date(b.t));

  let bal = 0;
  let earned = 0;
  let redeemed = 0;
  const rows = items.map((it) => {
    if (it.e) {
      const e = it.e;
      const credit = e.status === 'verified' ? e.points : 0;
      bal += credit;
      earned += credit;
      return {
        key: e.id,
        date: e.entry_date || e.created_at.slice(0, 10),
        title: e.bill_no || 'No bill number',
        sub: e.amount ? 'Amount ' + Number(e.amount).toLocaleString() : '',
        status: e.status,
        reason: e.reason,
        credit,
        debit: 0,
        bal,
      };
    }
    const r = it.r;
    bal -= r.points;
    redeemed += r.points;
    return {
      key: r.id, date: r.created_at.slice(0, 10), title: 'Points redeemed', sub: r.note || '',
      status: null, reason: null, credit: 0, debit: r.points, bal,
    };
  });

  const totals = { entries: (entries || []).length, earned, redeemed, available: earned - redeemed };
  const number = m.member_no.replace(/(\d{4})(?=\d)/g, '$1 ');
  const today = new Date().toISOString().slice(0, 10);
  const result = searchParams.result;
  const newest = [...(entries || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <>
      {/* 1. Welcome */}
      <h1>Welcome, {c.name}</h1>
      <p className="sub">Your {s.business_name} loyalty card</p>

      {/* 2. Card */}
      <div style={{ margin: '16px 0' }}>
        <FlipCard
          name={s.business_name}
          logo={s.logo_url}
          member={c.name.toUpperCase()}
          number={number}
          tier={tierFor(earned)}
          rules={s.redeem_rules}
        />
      </div>

      {/* 3. Statement */}
      <Statement rows={rows} totals={totals} />

      {/* 4. Add a new purchase */}
      {result === 'pending' && (
        <div className="msg ok">Entry submitted. Points are added after the store verifies your bill.</div>
      )}
      {result === 'ineligible' && (
        <div className="msg err">Entry saved but not eligible: {searchParams.why}.</div>
      )}
      {result === 'error' && <div className="msg err" role="alert">{searchParams.why}</div>}

      <details
        open={!!result}
        style={{ margin: '24px 0 16px', border: '1px solid var(--bd)', borderRadius: 12, background: 'var(--card)', padding: '0 12px' }}
      >
        <summary style={{ padding: '12px 0', fontWeight: 600, cursor: 'pointer' }}>+ Add a new purchase</summary>
        <form action={addEntry} style={{ paddingBottom: 12 }}>
          <input type="hidden" name="slug" value={s.slug} />
          <label htmlFor="entry_date">Date of purchase</label>
          <input id="entry_date" name="entry_date" type="date" defaultValue={today} />
          <label htmlFor="bill_no">Bill number</label>
          <input id="bill_no" name="bill_no" maxLength={40} autoComplete="off" />
          <label htmlFor="amount">Amount</label>
          <input id="amount" name="amount" type="number" inputMode="decimal" min="0" step="any" />
          <label htmlFor="bill">Bill copy (photo)</label>
          <BillInput />
          <SubmitButton label="Submit entry" busyLabel="Submitting…" />
        </form>
      </details>

      {/* 5. All purchase entries, newest first */}
      <h2>All purchase entries</h2>
      {newest.length === 0 && <p className="sub">No entries yet.</p>}
      {newest.map((e) => {
        const ch = CHIP[e.status] || CHIP.pending;
        return (
          <div
            key={e.id}
            style={{ border: '1px solid var(--bd)', background: 'var(--card)', borderRadius: 14, padding: 12, marginTop: 10, display: 'grid', gap: 4 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
              <strong>{e.bill_no || 'No bill number'}</strong>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 9px', borderRadius: 10, background: ch[1], color: ch[2] }}>{ch[0]}</span>
            </div>
            <div className="sub">
              {fmt(e.entry_date || e.created_at.slice(0, 10))} · Amount {e.amount != null ? Number(e.amount).toLocaleString() : 'none'}
              {e.status === 'verified' ? ` · +${e.points} points` : ''}
            </div>
            {e.reason && <div className="sub">{e.reason}</div>}
          </div>
        );
      })}

      <SocialLinks store={s} />
      <p style={{ marginTop: 24 }}><a href={`/s/${s.slug}`}>Back to {s.business_name}</a></p>
      <form action={logout}>
        <input type="hidden" name="slug" value={s.slug} />
        <button className="btn" type="submit" style={{ background: 'transparent', color: 'var(--tx)', border: '1px solid var(--bd)' }}>
          Log out
        </button>
      </form>
    </>
  );
}
