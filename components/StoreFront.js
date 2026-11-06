import { headers } from 'next/headers';
import { mapHref } from '../lib/links';
import StoreHeader from './StoreHeader';
import StoreGallery from './StoreGallery';
import StandeeSection from './StandeeSection';
import StoreCard from './StoreCard';
import { BRAND_LOGO } from '../lib/brandLogo';
import { BRAND_NAME, PLANS, membershipStatus, prettyDate } from '../lib/membership';

// mode = 'manager'  -> password-protected view (ledger button, standee with Download / Print)
// mode = 'customer' -> public view (standee is shown only, no Download / Print)
export default function StoreFront({ store: s, mode, searchParams = {}, cardNo = null }) {
  const manager = mode === 'manager';
  const ms = membershipStatus(s);
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
        gearHref={`/s/${s.slug}/edit`}
        showGear={manager}
      />

      <StoreGallery images={s.store_images} />
      {s.business_details && <p>{s.business_details}</p>}

      {manager && cardNo && (
        <>
          {ms.state === 'soon' && (
            <div className="msg" style={{ background: '#FAEEDA', color: '#633806', wordBreak: 'normal' }}>
              Your membership ends on {prettyDate(ms.until)} ({ms.left === 0 ? 'today' : `${ms.left} day${ms.left === 1 ? '' : 's'} left`}). Please renew to keep your store active.
            </div>
          )}
          {ms.state === 'expired' && (
            <div className="msg err" style={{ wordBreak: 'normal' }}>
              Your membership ended on {prettyDate(ms.until)}. Your store is locked for customers until it is renewed.
            </div>
          )}
          <div style={{ margin: '16px 0' }}>
            <StoreCard
              storeName={s.business_name}
              number={cardNo}
              brandName={BRAND_NAME}
              brandLogo={BRAND_LOGO}
              plans={PLANS}
              until={ms.state === 'life' ? 'Lifetime' : ms.until ? prettyDate(ms.until) : ''}
            />
          </div>
        </>
      )}

      {!manager && ms.state === 'expired' ? (
        <div className="msg err" style={{ wordBreak: 'normal' }}>
          Joining and new purchase entries are paused at this store for now. Please contact the store.
        </div>
      ) : (
        <>
          <a className="btn" href={`/s/${s.slug}/join`} style={{ marginTop: 16 }}>Join the loyalty program</a>
          <p className="sub" style={{ textAlign: 'center' }}>
            Already a member? <a href={`/s/${s.slug}/join?mode=login`}>Log in</a>
          </p>
        </>
      )}

      <h2>Contact</h2>
      <p>{s.contact_person}<br /><a href={`tel:${s.contact_number.replace(/[^+\d]/g, '')}`}>{s.contact_number}</a></p>
      <p>{s.address}<br /><a href={mapHref(s)} target="_blank" rel="noopener noreferrer">Open in maps</a></p>

      {manager && (
        <a className="btn" href={`/s/${s.slug}/ledger`} style={{ marginTop: 24 }}>Customer ledger</a>
      )}

      {manager && (
        <>
          <h2>QR standee</h2>
          <StandeeSection store={s} url={url} showActions />
        </>
      )}
    </>
  );
}
