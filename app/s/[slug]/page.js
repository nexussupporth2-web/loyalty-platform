import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { admin } from '../../../lib/supabase';
import LoyaltyCard from '../../../components/LoyaltyCard';

export const dynamic = 'force-dynamic';

export default async function StorePage({ params, searchParams }) {
  const { data: s } = await admin()
    .from('stores').select('*').eq('slug', params.slug).eq('status', 'active').maybeSingle();
  if (!s) notFound();

  const url = `https://${headers().get('host')}/s/${s.slug}`;
  const map = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(s.address);

  return (
    <>
      {searchParams.welcome && (
        <div className="msg ok">
          Your store page is live. Your unique link:<br /><strong>{url}</strong><br />
          <a href={`/s/${s.slug}/qr`}>Get your QR standee</a>
        </div>
      )}
      <div className="head">
        <img className="logo-lg" src={s.logo_url} alt={`${s.business_name} logo`} />
        <h1>{s.business_name}</h1>
      </div>
      {s.business_details && <p>{s.business_details}</p>}

      <h2>Your loyalty card</h2>
      <LoyaltyCard name={s.business_name} logo={s.logo_url} />

      <button className="btn" disabled style={{ marginTop: 16 }}>Join the loyalty program (coming next)</button>

      <h2>Contact</h2>
      <p>{s.contact_person}<br /><a href={`tel:${s.contact_number.replace(/[^+\d]/g, '')}`}>{s.contact_number}</a></p>
      <p>{s.address}<br /><a href={map} target="_blank" rel="noopener noreferrer">Open in maps</a></p>
    </>
  );
    }
