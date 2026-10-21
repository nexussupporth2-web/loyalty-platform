'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { admin } from '../../../../lib/supabase';
import { setSession, clearSession } from '../../../../lib/session';

function parse(fd) {
  const method = fd.get('method') === 'email' ? 'email' : 'mobile';
  const raw = (fd.get('id') || '').toString().trim();
  return {
    slug: (fd.get('slug') || '').toString(),
    method,
    name: (fd.get('name') || '').toString().trim(),
    secret: (fd.get('secret') || '').toString(),
    phone: method === 'mobile' ? raw.replace(/[^\d+]/g, '') : null,
    email: method === 'email' ? raw.toLowerCase() : null,
  };
}

function bad(p, mode, msg) {
  redirect(`/s/${p.slug}/join?mode=${mode}&method=${p.method}&error=${encodeURIComponent(msg)}`);
}

function validate(p, mode) {
  if (mode === 'join' && !p.name) bad(p, mode, 'Please enter your name.');
  if (p.method === 'mobile') {
    if (!/^\+?\d{8,15}$/.test(p.phone)) bad(p, mode, 'Enter a valid mobile number.');
    if (!/^\d{4}$/.test(p.secret)) bad(p, mode, 'PIN must be exactly 4 digits.');
  } else {
    if (!/^\S+@\S+\.\S+$/.test(p.email)) bad(p, mode, 'Enter a valid email address.');
    if (p.secret.length < 6) bad(p, mode, 'Password must be at least 6 characters.');
  }
}

async function getStore(db, p) {
  const { data } = await db.from('stores').select('id').eq('slug', p.slug).eq('status', 'active').maybeSingle();
  if (!data) redirect('/');
  return data;
}

async function ensureMember(db, p, mode, storeId, customerId) {
  const { data: m } = await db.from('memberships').select('id')
    .eq('store_id', storeId).eq('customer_id', customerId).maybeSingle();
  if (m) return;
  const member_no = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');
  const r = await db.from('memberships').insert({ store_id: storeId, customer_id: customerId, member_no });
  if (r.error) bad(p, mode, 'Could not create your card. Please try again.');
}

export async function join(fd) {
  const p = parse(fd);
  validate(p, 'join');
  const db = admin();
  const store = await getStore(db, p);
  const col = p.method === 'mobile' ? 'phone' : 'email';
  let { data: c } = await db.from('customers').select('*').eq(col, p[col]).maybeSingle();
  if (c) {
    if (!(await bcrypt.compare(p.secret, c.pin_hash))) {
      bad(p, 'join', 'You already have an account. Enter your existing PIN or password, or use Log in.');
    }
  } else {
    const ins = await db.from('customers')
      .insert({ name: p.name, [col]: p[col], pin_hash: await bcrypt.hash(p.secret, 10) })
      .select('*').single();
    if (ins.error) bad(p, 'join', 'Could not create your account. Please try again.');
    c = ins.data;
  }
  await ensureMember(db, p, 'join', store.id, c.id);
  await setSession(c.id);
  redirect(`/s/${p.slug}/card`);
}

export async function login(fd) {
  const p = parse(fd);
  validate(p, 'login');
  const db = admin();
  const store = await getStore(db, p);
  const col = p.method === 'mobile' ? 'phone' : 'email';
  const { data: c } = await db.from('customers').select('*').eq(col, p[col]).maybeSingle();
  if (!c || !(await bcrypt.compare(p.secret, c.pin_hash))) {
    bad(p, 'login', 'Wrong details. Please check and try again.');
  }
  await ensureMember(db, p, 'login', store.id, c.id);
  await setSession(c.id);
  redirect(`/s/${p.slug}/card`);
}

export async function logout(fd) {
  clearSession();
  redirect(`/s/${(fd.get('slug') || '').toString()}`);
    }
