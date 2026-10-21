import { notFound, redirect } from 'next/navigation';
import { admin } from '../../../../lib/supabase';
import { getSession } from '../../../../lib/session';
import { logout } from '../join/actions';
import LoyaltyCard from '../../../../components/LoyaltyCard';

export const dynamic = 'force-dynamic';

export default async function CardPage({ params }) {
  const db = admin();
  const { data: s } = await db.from('stores').select('id,business_name,logo_url,slug')
    .eq('slug', params.slug).eq('status', 'active').maybeSingle();
  if (!s) notFound();

  const cid = await getSession();
  if (!cid) redirect(`/s/${s.slug}/join?mode=login`);

  const { data: m } = await db.from('memberships').select('member_no')
    .eq('store_id', s.id).eq('customer_id', cid).maybeSingle();
  const { data: c } = await db.from('customers').select('name').eq('id', cid).maybeSingle();
  if (!m || !c) redirect(`/s/${s.slug}/join?mode=login`);

  const number = m.member_no.replace(/(\d{4})(?=\d)/g, '$1 ');

  return (
    <>
      <h1>Welcome, {c.name}</h1>
      <p className="sub">Your {s.business_name} loyalty card</p>
      <div style={{ margin: '16px 0' }}>
        <LoyaltyCard name={s.business_name} logo={s.logo_url} member={c.name.toUpperCase()} number={number} />
      </div>
      <p><a href={`/s/${s.slug}`}>Back to {s.business_name}</a></p>
      <form action={logout}>
        <input type="hidden" name="slug" value={s.slug} />
        <button className="btn" type="submit" style={{ background: 'transparent', color: 'var(--tx)', border: '1px solid var(--bd)' }}>
          Log out
        </button>
      </form>
    </>
  );
}
