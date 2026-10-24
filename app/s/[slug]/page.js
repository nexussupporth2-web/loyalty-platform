import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { admin } from '../../../lib/supabase';
import { mapHref } from '../../../lib/links';
import SocialLinks from '../../../components/SocialLinks';
import StoreGallery from '../../../components/StoreGallery';
import StandeeSection from '../../../components/StandeeSection';

export const dynamic = 'force-dynamic';

export default async function StorePage({ params, searchParams }) {
  const { data: s } = await admin()
    .from('stores').select('*').eq('slug', params.slug).eq('status', 'active').maybeSingle();
  if (!s) notFound();

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

      <div className="head">
        <img className="logo-lg" src={s.logo_url} alt={`${s.business_name} logo`} />
        <h1 style={{ flex: 1 }}>{s.business_name}</h1>
        <a
          href={`/s/${s.slug}/edit`}
          aria-label="Store owner settings"
          style={{ color: 'var(--tx2)', padding: 8, display: 'flex' }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
            <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
          </svg>
        </a>
      </div>

      <StoreGallery images={s.store_images} />
      {s.business_details && <p>{s.business_details}</p>}

      <a className="btn" href={`/s/${s.slug}/join`} style={{ marginTop: 16 }}>Join the loyalty program</a>
      <p className="sub" style={{ textAlign: 'center' }}>
        Already a member? <a href={`/s/${s.slug}/join?mode=login`}>Log in</a>
      </p>

      <SocialLinks store={s} />

      <h2>Contact</h2>
      <p>{s.contact_person}<br /><a href={`tel:${s.contact_number.replace(/[^+\d]/g, '')}`}>{s.contact_number}</a></p>
      <p>{s.address}<br /><a href={mapHref(s)} target="_blank" rel="noopener noreferrer">Open in maps</a></p>

      <h2>QR standee</h2>
      <StandeeSection store={s} url={url} />
    </>
  );
          }
