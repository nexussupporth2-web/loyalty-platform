import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const key = () =>
  new TextEncoder().encode(process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY);

async function put(name, payload, days) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${days}d`)
    .sign(key());
  cookies().set(name, token, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * days,
  });
}

async function get(name) {
  const t = cookies().get(name)?.value;
  if (!t) return null;
  try {
    return (await jwtVerify(t, key())).payload;
  } catch {
    return null;
  }
}

// Customers
export const setSession = (customerId) => put('cust', { cid: customerId }, 90);
export async function getSession() {
  return (await get('cust'))?.cid || null;
}
export function clearSession() {
  cookies().delete('cust');
}

// Store owners
export const setOwnerSession = (storeId) => put('own', { sid: storeId }, 30);
export async function getOwnerSession() {
  return (await get('own'))?.sid || null;
}
export function clearOwnerSession() {
  cookies().delete('own');
}
