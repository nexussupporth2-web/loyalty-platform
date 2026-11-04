'use server';

import { redirect } from 'next/navigation';
import { admin } from './supabase';
import { isAdmin } from './session';

// Deletes one store (only for the logged-in main admin).
export async function deleteStoreFromList(fd) {
  if (!(await isAdmin())) redirect('/admin');

  const id = (fd.get('id') || '').toString();
  const db = admin();
  const { data: s } = await db.from('stores').select('id,business_name').eq('id', id).maybeSingle();
  if (!s) redirect('/?msg=' + encodeURIComponent('Store not found.'));

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

  redirect('/?msg=' + encodeURIComponent(`Deleted ${s.business_name}.`));
}
