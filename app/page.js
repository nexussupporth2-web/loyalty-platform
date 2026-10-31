import Link from 'next/link';
import { admin } from '../lib/supabase';
import LoyaltyCard from '../components/LoyaltyCard';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data } = await admin()
    .from('stores')
    .select('slug,business_name,logo_url,created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  const stores = data || [];

  return (
    <>
      <h1>Loyalty cards for your store</h1>
      <p className="sub">Register your business, get your own link and QR code, and let customers join with a scan.</p>
      <div style={{ margin: '20px 0' }}>
        <LoyaltyCard name="Your Shop Name" />
      </div>
      <Link className="btn" href="/register">Register your store</Link>

      {stores.length > 0 && (
        <>
          <h2>Registered businesses ({stores.length})</h2>
          {stores.map((s) => (
            <a
              key={s.slug}
              href={`/s/${s.slug}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: 12, marginTop: 10,
                border: '1px solid var(--bd)', background: 'var(--card)', borderRadius: 16,
                textDecoration: 'none', color: 'var(--tx)', boxShadow: 'var(--shadow)',
              }}
            >
              <img
                src={s.logo_url}
                alt=""
                style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', background: '#fff', flex: 'none' }}
              />
              <strong style={{ fontSize: 16 }}>{s.business_name}</strong>
            </a>
          ))}
        </>
      )}
    </>
  );
}
