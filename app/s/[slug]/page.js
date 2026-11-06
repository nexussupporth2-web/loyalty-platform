import { notFound } from 'next/navigation';
import { admin } from '../../../lib/supabase';
import { getOwnerSession } from '../../../lib/session';
import SubmitButton from '../../../components/SubmitButton';
import StoreFront from '../../../components/StoreFront';
import { ownerLogin } from './edit/actions';
import { ensureStoreCardNo } from '../../../lib/membership';

export const dynamic = 'force-dynamic';

export default async function StorePage({ params, searchParams }) {
  const { data: s } = await admin().from('stores').select('*').eq('slug', params.slug).maybeSingle();
  if (!s) notFound();

  // Public page for customers: /s/your-store
  if (!searchParams.manager) {
    if (s.status !== 'active') notFound();
    return <StoreFront store={s} mode="customer" searchParams={searchParams} />;
  }

  // Store manager page (password protected): /s/your-store?manager=1
  if ((await getOwnerSession()) !== s.id) {
    return (
      <>
        <h1>Store manager login</h1>
        <p className="sub">{s.business_name}</p>
        {searchParams.error && <div className="msg err" role="alert">{searchParams.error}</div>}
        {!s.owner_hash ? (
          <p>This store has no owner password yet. Please register the store again to get one.</p>
        ) : (
          <form action={ownerLogin}>
            <input type="hidden" name="slug" value={s.slug} />
            <input type="hidden" name="next" value="manager" />
            <label htmlFor="password">Owner password</label>
            <input id="password" name="password" type="password" required />
            <SubmitButton label="Log in" busyLabel="Checking…" />
          </form>
        )}
        <p style={{ marginTop: 16 }}><a href={`/s/${s.slug}`}>Back to store</a></p>
      </>
    );
  }

  const cardNo = await ensureStoreCardNo(admin(), s);
  return <StoreFront store={s} mode="manager" searchParams={searchParams} cardNo={cardNo} />;
}
