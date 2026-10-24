'use server';

import { redirect } from 'next/navigation';
import { admin } from '../../../../lib/supabase';
import { getOwnerSession } from '../../../../lib/session';
import { earnedFor } from '../../../../lib/points';

const sum = (rows) => (rows || []).reduce((t, r) => t + r.points, 0);

async function guard(fd) {
  const slug = (fd.get('slug') || '').toString();
  const q = (fd.get('q') || '').toString().replace(/\D/g, '').slice(0, 6);
  const db = admin();
  const { data: s } = await db.from('stores').select('id').eq('slug', slug).maybeSingle();
  if (!s || (await getOwnerSession()) !== s.id) redirect(`/s/${slug}/edit`);
  const back = (msg) => redirect(`/s/${slug}/ledger?${q ? 'q=' + q + '&' : ''}msg=${encodeURIComponent(msg)}`);
  return { db, s, slug, back };
}

export async function approveEntry(fd) {
  const { db, s, back } = await guard(fd);
  const id = (fd.get('id') || '').toString();
  const { data: e } = await db.from('entries').select('id,amount,status').eq('id', id).eq('store_id', s.id).maybeSingle();
  if (!e || e.status !== 'pending') back('That entry is no longer waiting.');
  const r = await db.from('entries')
    .update({ status: 'verified', points: earnedFor(e.amount), reason: null }).eq('id', id);
  back(r.error ? 'Could not approve. Please try again.' : 'Entry approved. Points added.');
}

export async function rejectEntry(fd) {
  const { db, s, back } = await guard(fd);
  const id = (fd.get('id') || '').toString();
  const why = (fd.get('reason') || 'Other').toString().slice(0, 80);
  const { data: e } = await db.from('entries').select('id,status').eq('id', id).eq('store_id', s.id).maybeSingle();
  if (!e || e.status !== 'pending') back('That entry is no longer waiting.');
  const r = await db.from('entries').update({ status: 'rejected', reason: 'Rejected: ' + why }).eq('id', id);
  back(r.error ? 'Could not reject. Please try again.' : 'Entry rejected.');
}

export async function redeemPoints(fd) {
  const { db, s, back } = await guard(fd);
  const mid = (fd.get('membership_id') || '').toString();
  const { data: m } = await db.from('memberships').select('id').eq('id', mid).eq('store_id', s.id).maybeSingle();
  if (!m) back('Customer not found.');
  const pts = Math.floor(Number(fd.get('points')));
  if (!(pts > 0)) back('Enter the number of points to redeem.');
  const { data: es } = await db.from('entries').select('points').eq('membership_id', mid).eq('status', 'verified');
  const { data: rs } = await db.from('redemptions').select('points').eq('membership_id', mid);
  const available = sum(es) - sum(rs);
  if (pts > available) back(`Only ${available} points are available.`);
  const note = (fd.get('note') || '').toString().trim().slice(0, 80) || null;
  const r = await db.from('redemptions').insert({ store_id: s.id, membership_id: mid, points: pts, note });
  back(r.error ? 'Could not save. Please try again.' : `Redeemed ${pts} points.`);
}

export async function deleteCustomer(fd) {
  const { db, s, slug, back } = await guard(fd);
  const mid = (fd.get('membership_id') || '').toString();
  if ((fd.get('confirm') || '').toString().trim() !== 'DELETE') back('Type DELETE to confirm.');
  const { data: m } = await db.from('memberships').select('id,customer_id').eq('id', mid).eq('store_id', s.id).maybeSingle();
  if (!m) back('Customer not found.');

  const { data: files } = await db.storage.from('bills').list(s.id, { limit: 1000, search: mid });
  if (files && files.length) {
    await db.storage.from('bills').remove(files.map((f) => `${s.id}/${f.name}`));
  }
  await db.from('memberships').delete().eq('id', mid); // also removes this customer's entries and redemptions
  const { data: other } = await db.from('memberships').select('id').eq('customer_id', m.customer_id).limit(1);
  if (!other || !other.length) await db.from('customers').delete().eq('id', m.customer_id);

  redirect(`/s/${slug}/ledger?msg=${encodeURIComponent('Customer deleted.')}`);
}
