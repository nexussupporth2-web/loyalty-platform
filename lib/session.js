import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const key = () =>
  new TextEncoder().encode(process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function setSession(customerId) {
  const token = await new SignJWT({ cid: customerId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('90d')
    .sign(key());
  cookies().set('cust', token, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 90,
  });
}

export async function getSession() {
  const t = cookies().get('cust')?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, key());
    return payload.cid;
  } catch {
    return null;
  }
}

export function clearSession() {
  cookies().delete('cust');
}
