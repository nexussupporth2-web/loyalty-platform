import Link from 'next/link';
import { admin } from '../lib/supabase';
import { isAdmin } from '../lib/session';
import { deleteStoreFromList } from '../lib/adminActions';
import LoyaltyCard from '../components/LoyaltyCard';
import ConfirmButton from '../components/ConfirmButton';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }) {
  const isMain = await isAdmin();
  const { data } = await admin()
    .from('stores')
    .select('id,slug,business_name,logo_url,created_at')
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

      {isMain && searchParams?.msg && <div className="msg ok">{searchParams.msg}</div>}

      {stores.length > 0 && (
        <>
          <h2>Registered businesses ({stores.length})</h2>
          {stores.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <a
                href={`/s/${s.slug}`}
                style={{
                  flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 12, padding: 12,
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
              {isMain && (
                <form action={deleteStoreFromList}>
                  <input type="hidden" name="id" value={s.id} />
                  <ConfirmButton
                    label="Delete"
                    message={`Delete "${s.business_name}" with all its customers, entries and bill photos? This cannot be undone.`}
                    style={{ background: '#F7D7D1', color: '#8A3A32', boxShadow: 'none', width: 'auto', padding: '10px 14px', fontSize: 14 }}
                  />
                </form>
              )}
            </div>
          ))}
        </>
      )}
    </>
  );
}
