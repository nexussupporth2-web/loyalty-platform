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

  return (
    <>
      <h1>Welcome, {c.name}</h1>
      <p className="sub">Your {s.business_name} loyalty card</p>
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

      {result === 'pending' && (
        <div className="msg ok">Entry submitted. Points are added after the store verifies your bill.</div>
      )}
      {result === 'ineligible' && (
        <div className="msg err">Entry saved but not eligible: {searchParams.why}.</div>
      )}
      {result === 'error' && <div className="msg err" role="alert">{searchParams.why}</div>}

      <details
        open={!!result}
        style={{ margin: '16px 0', border: '1px solid var(--bd)', borderRadius: 12, background: 'var(--card)', padding: '0 12px' }}
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

      <Statement rows={rows} totals={totals} />

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
