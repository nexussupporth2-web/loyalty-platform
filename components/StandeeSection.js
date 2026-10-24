import QRCode from 'qrcode';
import { socialLinks } from '../lib/links';
import PrintButton from './PrintButton';
import StandeeDownload from './StandeeDownload';

export default async function StandeeSection({ store: s, url }) {
  const qr = await QRCode.toDataURL(url, { width: 700, margin: 1, errorCorrectionLevel: 'H' });
  const links = socialLinks(s);
  const review = links.find((l) => l.key === 'review');
  const reviewQr = review ? await QRCode.toDataURL(review.href, { width: 400, margin: 1 }) : null;
  const follow = links.filter((l) => l.key !== 'review').map((l) => `${l.label}: ${l.text}`);

  return (
    <>
      <style>{`@media print{body{background:#fff!important}.noprint{display:none!important}.wrap{max-width:none!important;padding:0!important}}`}</style>
      <div
        style={{
          background: '#fff', color: '#111', border: '1px solid #ddd', borderRadius: 16, padding: 20,
          textAlign: 'center', maxWidth: 340, margin: '0 auto', aspectRatio: '210 / 297',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}
      >
        <div>
          <img className="logo-lg" src={s.logo_url} alt="" style={{ width: 64, height: 64 }} />
          <h2 style={{ margin: '8px 0 2px', fontSize: 20 }}>{s.business_name}</h2>
          <p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: '#534AB7' }}>Scan to join our loyalty program</p>
        </div>
        <div>
          <img src={qr} alt={`QR code to join ${s.business_name}`} style={{ width: '100%', maxWidth: 200 }} />
          <p style={{ fontSize: 10, color: '#555', wordBreak: 'break-all', margin: '4px 0 0' }}>{url}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, textAlign: 'left' }}>
          <div>
            {follow.length > 0 && <strong style={{ fontSize: 13 }}>Follow us</strong>}
            {follow.map((t) => <div key={t} style={{ fontSize: 11 }}>{t}</div>)}
          </div>
          {reviewQr && (
            <div style={{ textAlign: 'center' }}>
              <img src={reviewQr} alt="QR code for Google reviews" style={{ width: 70 }} />
              <div style={{ fontSize: 10, fontWeight: 600 }}>Review us on Google</div>
            </div>
          )}
        </div>
      </div>
      <div className="noprint" style={{ marginTop: 16, display: 'grid', gap: 8, maxWidth: 340, marginInline: 'auto' }}>
        <StandeeDownload
          name={s.business_name}
          slug={s.slug}
          logo={s.logo_url}
          url={url}
          qr={qr}
          reviewQr={reviewQr}
          follow={follow}
        />
        <PrintButton />
      </div>
    </>
  );
    }
