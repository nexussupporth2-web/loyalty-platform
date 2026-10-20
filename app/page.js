import Link from 'next/link';
import LoyaltyCard from '../components/LoyaltyCard';

export default function Home() {
  return (
    <>
      <h1>Loyalty cards for your store</h1>
      <p className="sub">Register your business, get your own link and QR code, and let customers join with a scan.</p>
      <div style={{ margin: '20px 0' }}>
        <LoyaltyCard name="Your Shop Name" />
      </div>
      <Link className="btn" href="/register">Register your store</Link>
    </>
  );
}
