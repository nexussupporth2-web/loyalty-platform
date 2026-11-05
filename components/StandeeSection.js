import QRCode from 'qrcode';
import PrintButton from './PrintButton';
import StandeeDownload from './StandeeDownload';

// showActions = false shows the standee only (no Download / Print buttons).
export default async function StandeeSection({ store: s, url, showActions = true }) {
  const qr = await QRCode.toDataURL(url, { width: 700, margin: 1, errorCorrectionLevel: 'H' });
  const slabs = (s.redeem_rules || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 6);

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
        </div>
        <div style={{ textAlign: 'center', fontWeight: 700 }}>
          {slabs.map((l, i) => <div key={i} style={{ fontSize: 13, lineHeight: 1.5 }}>{l}</div>)}
        </div>
      </div>
      {showActions && (
        <div className="noprint" style={{ marginTop: 16, display: 'grid', gap: 8, maxWidth: 340, marginInline: 'auto' }}>
          <StandeeDownload
            name={s.business_name}
            slug={s.slug}
            logo={s.logo_url}
            url={url}
            qr={qr}
            slabs={slabs}
          />
          <PrintButton />
        </div>
      )}
    </>
  );
}
