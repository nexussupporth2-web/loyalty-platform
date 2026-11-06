'use server';

import { redirect } from 'next/navigation';
import { timingSafeEqual } from 'crypto';
import { admin } from '../../lib/supabase';
import { setAdminSession, isAdmin, clearAdminSession } from '../../lib/session';
import { PLANS, addMonths, todayIST, prettyDate } from '../../lib/membership';

const same = (a, b) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};
const go = (kind, text) => redirect(`/admin?${kind}=${encodeURIComponent(text)}`);

export async function adminLogin(fd) {
  const id = (fd.get('admin_id') || '').toString().trim();
  const pw = (fd.get('password') || '').toString();
  const realId = process.env.ADMIN_ID || '';
  const realPw = process.env.ADMIN_PASSWORD || '';
  if (!realId || !realPw) go('error', 'ADMIN_ID and ADMIN_PASSWORD are not set in Vercel yet.');
  const okId = same(id, realId);
  const okPw = same(pw, realPw);
  if (!(okId && okPw)) go('error', 'Wrong ID or password.');
  await setAdminSession();
  redirect('/admin');
}

export async function adminLogout() {
  clearAdminSession();
  redirect('/admin');
}

export async function deleteStore(fd) {
  if (!(await isAdmin())) redirect('/admin');
  const id = (fd.get('id') || '').toString();
  const confirm = (fd.get('confirm') || '').toString().trim();
  const db = admin();

  const { data: s } = await db.from('stores').select('id,business_name').eq('id', id).maybeSingle();
  if (!s) go('error', 'Store not found.');
  if (confirm !== s.business_name) go('error', 'The store name did not match, so nothing was deleted.');

  // Remove the stored bill photos of this store.
  const { data: files } = await db.storage.from('bills').list(s.id, { limit: 1000 });
  if (files && files.length) {
    await db.storage.from('bills').remove(files.map((f) => `${s.id}/${f.name}`));
  }

  // Deleting the store also deletes its cards, entries and redemptions.
  await db.from('stores').delete().eq('id', s.id);

  // Remove customer accounts that no longer belong to any store.
  const { data: all } = await db.from('customers').select('id');
  const { data: mem } = await db.from('memberships').select('customer_id');
  const used = new Set((mem || []).map((m) => m.customer_id));
  const orphans = (all || []).map((c) => c.id).filter((cid) => !used.has(cid));
  if (orphans.length) await db.from('customers').delete().in('id', orphans);

  go('msg', `Deleted ${s.business_name}.`);
}

// Records a payment: the membership runs from today (or from the current end date, if it has not ended yet).
export async function setMembership(fd) {
  if (!(await isAdmin())) redirect('/admin');
  const id = (fd.get('id') || '').toString();
  const plan = PLANS.find((p) => p.key === (fd.get('plan') || '').toString());
  if (!plan) go('error', 'Choose a membership plan.');
  const db = admin();
  const { data: s } = await db.from('stores').select('*').eq('id', id).maybeSingle();
  if (!s) go('error', 'Store not found.');
  const today = todayIST();
  const base = s.member_until && s.member_until >= today ? s.member_until : today;
  const until = addMonths(base, plan.months);
  const r = await db.from('stores').update({ member_plan: plan.key, member_until: until }).eq('id', s.id);
  if (r.error) go('error', 'Could not save the membership: ' + (r.error.message || '').slice(0, 120) + ' (Run the membership SQL in Supabase first.)');
  go('msg', `${s.business_name}: membership now runs until ${prettyDate(until)}.`);
}
