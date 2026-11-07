import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Register() {
  // Registration now lives on the master admin page, under the first button.
  redirect('/admin?open=register');
}
