import { redirect } from 'next/navigation';
import { isAdmin } from '../../lib/session';
import RegisterForm from './RegisterForm';

export const dynamic = 'force-dynamic';

export default async function Register({ searchParams }) {
  // Only the main admin can register stores.
  if (!(await isAdmin())) redirect('/admin');

  return (
    <>
      <h1>Register your store</h1>
      <p className="sub">You will get a unique link and a QR code for your customers.</p>
      <RegisterForm error={searchParams.error} />
    </>
  );
}
