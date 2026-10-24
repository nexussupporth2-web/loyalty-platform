import { notFound } from 'next/navigation';
import { admin } from '../../../../lib/supabase';
import { getOwnerSession } from '../../../../lib/session';
import StoreFields from '../../../../components/StoreFields';
import SubmitButton from '../../../../components/SubmitButton';
import { ownerLogin, ownerLogout, saveStore } from './actions';

export const dynamic = 'force-dynamic';

export default async function EditPage({ params, searchParams }) {
  const { data: s } = await admin().from('stores').select('*').eq('slug', params.slug).maybeSingle();
  if (!s) notFound();

  const isOwner = (await getOwnerSession()) === s.id;
  const err = searchParams.error ? <div className="msg err" role="alert">{searchParams.error}</div> : null;

  if (!isOwner) {
    return (
      <>
        <h1>Store owner login</h1>
        <p className="sub">{s.business_name}</p>
        {err}
        {!s.owner_hash ? (
          <p>This store has no owner password yet. Please register the store again to get one.</p>
        ) : (
          <form action={ownerLogin}>
            <input type="hidden" name="slug" value={s.slug} />
            <label htmlFor="password">Owner password</label>
            <input id="password" name="password" type="password" required />
            <SubmitButton label="Log in" busyLabel="Checking…" />
          </form>
        )}
        <p style={{ marginTop: 16 }}><a href={`/s/${s.slug}`}>Back to store</a></p>
      </>
    );
  }

  return (
    <>
      <h1>Edit store details</h1>
      <p className="sub">Your store link stays the same: /s/{s.slug}</p>
      <a className="btn" href={`/s/${s.slug}/ledger`} style={{ margin: '12px 0' }}>Open customer ledger</a>
      {err}
      <form action={saveStore}>
        <input type="hidden" name="slug" value={s.slug} />
        <StoreFields d={s} withImages passwordLabel="New owner password (leave empty to keep the current one)" />
        <SubmitButton label="Save changes" />
      </form>
      <form action={ownerLogout} style={{ marginTop: 12 }}>
        <input type="hidden" name="slug" value={s.slug} />
        <button className="btn" type="submit" style={{ background: 'transparent', color: 'var(--tx)', border: '1px solid var(--bd)' }}>
          Log out
        </button>
      </form>
      <p style={{ marginTop: 16 }}><a href={`/s/${s.slug}`}>Back to store</a></p>
    </>
  );
}
