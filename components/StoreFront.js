import { headers } from 'next/headers';
import { mapHref } from '../lib/links';
import StoreHeader from './StoreHeader';
import StoreGallery from './StoreGallery';
import StandeeSection from './StandeeSection';

// mode = 'manager'  -> password-protected view (ledger button, standee with Download / Print)
// mode = 'customer' -> public view (standee is shown only, no Download / Print)
export default function StoreFront({ store: s, mode, searchParams = {} }) {
  const manager = mode === 'manager';
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

      <StoreHeader
        store={s}
        gearHref={manager ? `/s/${s.slug}/edit` : `/s/${s.slug}?manager=1`}
      />

      <StoreGallery images={s.store_images} />
      {s.business_details && <p>{s.business_details}</p>}

      <a className="btn" href={`/s/${s.slug}/join`} style={{ marginTop: 16 }}>Join the loyalty program</a>
      <p className="sub" style={{ textAlign: 'center' }}>
        Already a member? <a href={`/s/${s.slug}/join?mode=login`}>Log in</a>
      </p>

      <h2>Contact</h2>
      <p>{s.contact_person}<br /><a href={`tel:${s.contact_number.replace(/[^+\d]/g, '')}`}>{s.contact_number}</a></p>
      <p>{s.address}<br /><a href={mapHref(s)} target="_blank" rel="noopener noreferrer">Open in maps</a></p>

      {manager && (
        <a className="btn" href={`/s/${s.slug}/ledger`} style={{ marginTop: 24 }}>Customer ledger</a>
      )}

      <h2>QR standee</h2>
      <StandeeSection store={s} url={url} showActions={manager} />
    </>
  );
}
