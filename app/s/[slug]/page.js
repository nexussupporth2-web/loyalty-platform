import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { admin } from '../../../lib/supabase';
import { getOwnerSession } from '../../../lib/session';
import { mapHref } from '../../../lib/links';
import StoreHeader from '../../../components/StoreHeader';
import StoreGallery from '../../../components/StoreGallery';
import StandeeSection from '../../../components/StandeeSection';

export const dynamic = 'force-dynamic';

export default async function StorePage({ params, searchParams }) {
  const { data: s } = await admin()
    .from('stores').select('*').eq('slug', params.slug).eq('status', 'active').maybeSingle();
  if (!s) notFound();

  const isOwner = (await getOwnerSession()) === s.id;
  const url = `https://${headers().get('host')}/s/${s.slug}`;

  return (
    <>
      {searchParams.welcome && (
        <div className="msg ok">
          Your store page is live. Your unique link:<br /><strong>{url}</strong><br />
          Your QR standee is at the bottom of this page. Use the gear icon at the top right to edit your details.
        </div>
      )}
      {searchParams.saved && <div className="msg ok">Your changes are saved.</div>}

      <StoreHeader store={s} />

      {isOwner && (
        <div style={{ display: 'flex', gap: 8, margin: '8px 0 4px' }}>
          <a className="btn" href={`/s/${s.slug}/ledger`} style={{ flex: 1 }}>Customer ledger</a>
          <a
            className="btn"
            href={`/s/${s.slug}/edit`}
            style={{ flex: 1, background: 'transparent', color: 'var(--tx)', border: '1px solid var(--bd)' }}
          >
            Edit store
          </a>
        </div>
      )}

      <StoreGallery images={s.store_images} />
      {s.business_details && <p>{s.business_details}</p>}

      <a className="btn" href={`/s/${s.slug}/join`} style={{ marginTop: 16 }}>Join the loyalty program</a>
      <p className="sub" style={{ textAlign: 'center' }}>
        Already a member? <a href={`/s/${s.slug}/join?mode=login`}>Log in</a>
      </p>

      <h2>Contact</h2>
      <p>{s.contact_person}<br /><a href={`tel:${s.contact_number.replace(/[^+\d]/g, '')}`}>{s.contact_number}</a></p>
      <p>{s.address}<br /><a href={mapHref(s)} target="_blank" rel="noopener noreferrer">Open in maps</a></p>

      <h2>QR standee</h2>
      <StandeeSection store={s} url={url} />
    </>
  );
          }
