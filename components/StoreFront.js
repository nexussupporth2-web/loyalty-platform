import { headers } from 'next/headers';
import { addressText } from '../lib/links';
import StoreHeader from './StoreHeader';
import StoreGallery from './StoreGallery';
import StandeeSection from './StandeeSection';
import RollDown from './RollDown';
import StoreCard from './StoreCard';
import ActivateMembership from './ActivateMembership';
import { BRAND_LOGO } from '../lib/brandLogo';
import { BRAND_NAME, membershipStatus, prettyDate } from '../lib/membership';

// mode = 'manager'  -> password-protected view (ledger button, standee with Download / Print)
// mode = 'customer' -> public view (standee is shown only, no Download / Print)
export default function StoreFront({ store: s, mode, searchParams = {}, cardNo = null, feeLines = [] }) {
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
      {manager && searchParams.activated && (
        <div className="msg ok" style={{ wordBreak: 'normal' }}>Membership activated. It now runs until {searchParams.activated}.</div>
      )}
      {manager && searchParams.codeerror && (
        <div className="msg err" role="alert" style={{ wordBreak: 'normal' }}>{searchParams.codeerror}</div>
      )}

      <StoreHeader
        store={s}
        gearHref={`/s/${s.slug}/edit`}
        showGear={manager}
        note={
          manager && (ms.state === 'soon' || ms.state === 'expired' || ms.state === 'none') ? (
            <ActivateMembership
              slug={s.slug}
              text={
                ms.state === 'none'
                  ? 'Store not activated. Tap to enter activation code'
                  : ms.state === 'expired'
                  ? 'Membership expired. Tap to renew'
                  : ms.left === 0
                    ? 'Membership will expire today'
                    : `Membership will expire in ${ms.left} day${ms.left === 1 ? '' : 's'}`
              }
            />
          ) : null
        }
      />

      {s.slogan && <p style={{ textAlign: 'center', fontSize: 18, fontWeight: 700, lineHeight: 1.35, margin: '20px 8px 8px' }}>{s.slogan}</p>}
      <StoreGallery images={s.store_images} />
      {s.business_details && <p style={{ textAlign: 'center' }}>{s.business_details}</p>}

      <p style={{ textAlign: 'center', fontWeight: 700, margin: '16px 0 4px' }}>
        {s.contact_person} · <a href={`tel:${s.contact_number.replace(/[^+\d]/g, '')}`}>{s.contact_number}</a>
      </p>
      {addressText(s) && <p style={{ textAlign: 'center', whiteSpace: 'pre-line', margin: '4px 0 12px' }}>{addressText(s)}</p>}

      {manager && cardNo && (
        <>
          {ms.state === 'soon' && (
            <div className="msg" style={{ background: '#FAEEDA', color: '#633806', wordBreak: 'normal' }}>
              Your membership ends on {prettyDate(ms.until)} ({ms.left === 0 ? 'today' : `${ms.left} day${ms.left === 1 ? '' : 's'} left`}). Please renew to keep your store active.
            </div>
          )}
          {ms.state === 'none' && (
            <div className="msg err" style={{ wordBreak: 'normal' }}>
              Your store is not activated yet. It is locked for customers until you enter an activation code.
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
              lines={feeLines}
              until={ms.state === 'life' ? 'Lifetime' : ms.until ? prettyDate(ms.until) : ''}
            />
          </div>
        </>
      )}

      {manager && (
        <a className="btn" href={`/s/${s.slug}/ledger`} style={{ marginTop: 16 }}>Customer ledger</a>
      )}

      {!manager && (ms.state === 'expired' || ms.state === 'none') ? (
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

      {manager && (
        <RollDown label="QR standee">
          <StandeeSection store={s} url={url} showActions />
        </RollDown>
      )}
    </>
  );
}
