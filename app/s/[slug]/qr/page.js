import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import QRCode from 'qrcode';
import { admin } from '../../../../lib/supabase';
import PrintButton from '../../../../components/PrintButton';

export const dynamic = 'force-dynamic';

export default async function Standee({ params }) {
  const { data: s } = await admin()
    .from('stores').select('business_name,logo_url,slug')
    .eq('slug', params.slug).eq('status', 'active').maybeSingle();
  if (!s) notFound();

  const url = `https://${headers().get('host')}/s/${s.slug}`;
  const qr = await QRCode.toDataURL(url, { width: 700, margin: 1, errorCorrectionLevel: 'H' });

  return (
    <>
      <style>{`@media print{body{background:#fff!important}.noprint{display:none!important}.wrap{max-width:none!important;padding:0!important}}`}</style>
      <div style={{ background: '#fff', color: '#111', border: '1px solid #ddd', borderRadius: 16, padding: 24, textAlign: 'center' }}>
        <img className="logo-lg" src={s.logo_url} alt="" style={{ width: 96, height: 96 }} />
        <h1 style={{ margin: '12px 0 4px' }}>{s.business_name}</h1>
        <p style={{ fontSize: 20, fontWeight: 600, margin: '0 0 16px' }}>Scan to join our loyalty program</p>
        <img src={qr} alt={`QR code to join ${s.business_name}`} style={{ width: '100%', maxWidth: 320 }} />
        <p style={{ fontSize: 13, color: '#555', wordBreak: 'break-all' }}>{url}</p>
      </div>
      <div className="noprint" style={{ marginTop: 16, display: 'grid', gap: 8 }}>
        <PrintButton />
        <a className="btn" href={qr} download={`${s.slug}-qr.png`}>Download QR image</a>
      </div>
    </>
  );
  }
