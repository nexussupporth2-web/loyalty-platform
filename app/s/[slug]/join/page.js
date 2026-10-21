import Link from 'next/link';
import { notFound } from 'next/navigation';
import { admin } from '../../../../lib/supabase';
import { join, login } from './actions';

export const dynamic = 'force-dynamic';

export default async function JoinPage({ params, searchParams }) {
  const { data: s } = await admin()
    .from('stores').select('business_name,logo_url,slug')
    .eq('slug', params.slug).eq('status', 'active').maybeSingle();
  if (!s) notFound();

  const mode = searchParams.mode === 'login' ? 'login' : 'join';
  const method = searchParams.method === 'email' ? 'email' : 'mobile';
  const isMobile = method === 'mobile';
  const base = `/s/${s.slug}/join`;

  return (
    <>
      <div className="head">
        <img className="logo-lg" src={s.logo_url} alt="" />
        <h1>{s.business_name}</h1>
      </div>
      <h2>{mode === 'join' ? 'Join the loyalty program' : 'Log in to your card'}</h2>
      {searchParams.error && <div className="msg err" role="alert">{searchParams.error}</div>}

      <form action={mode === 'join' ? join : login}>
        <input type="hidden" name="slug" value={s.slug} />
        <input type="hidden" name="method" value={method} />
        {mode === 'join' && (
          <>
            <label htmlFor="name">Your name</label>
            <input id="name" name="name" required maxLength={60} autoComplete="name" />
          </>
        )}
        <label htmlFor="id">{isMobile ? 'Mobile number' : 'Email address'}</label>
        <input id="id" name="id" required type={isMobile ? 'tel' : 'email'} autoComplete={isMobile ? 'tel' : 'email'} />
        <label htmlFor="secret">{isMobile ? '4-digit PIN' : 'Password (6 or more characters)'}</label>
        <input
          id="secret" name="secret" type="password" required
          {...(isMobile ? { inputMode: 'numeric', maxLength: 4, pattern: '\\d{4}' } : { minLength: 6 })}
        />
        <button className="btn" type="submit" style={{ marginTop: 20 }}>
          {mode === 'join' ? 'Get my card' : 'Log in'}
        </button>
      </form>

      <p className="sub" style={{ marginTop: 16 }}>
        {isMobile
          ? <Link href={`${base}?mode=${mode}&method=email`}>Use email and password instead</Link>
          : <Link href={`${base}?mode=${mode}&method=mobile`}>Use mobile number and PIN instead</Link>}
      </p>
      <p className="sub">
        {mode === 'join'
          ? <Link href={`${base}?mode=login&method=${method}`}>Already a member? Log in</Link>
          : <Link href={`${base}?mode=join&method=${method}`}>New here? Join now</Link>}
      </p>
    </>
  );
    }
