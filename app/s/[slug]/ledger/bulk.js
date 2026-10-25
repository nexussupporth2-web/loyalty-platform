'use server';

import { redirect } from 'next/navigation';
import { admin } from '../../../../lib/supabase';
import { getOwnerSession } from '../../../../lib/session';

export async function deleteCustomers(fd) {
  const slug = (fd.get('slug') || '').toString();
  const sort = (fd.get('sort') || 'new').toString();
  const done = (msg) => redirect(`/s/${slug}/ledger?sort=${sort}&msg=${encodeURIComponent(msg)}`);

  const db = admin();
  const { data: s } = await db.from('stores').select('id').eq('slug', slug).maybeSingle();
  if (!s || (await getOwnerSession()) !== s.id) redirect(`/s/${slug}/edit`);

  const ids = fd.getAll('ids').map(String);
  if (!ids.length) done('Select at least one customer first.');

  const { data: ms } = await db.from('memberships').select('id,customer_id')
    .eq('store_id', s.id).in('id', ids);
  if (!ms || !ms.length) done('Nothing to delete.');

  // Remove the bill photos of these customers.
  for (const m of ms) {
    const { data: files } = await db.storage.from('bills').list(s.id, { limit: 1000, search: m.id });
    if (files && files.length) {
      await db.storage.from('bills').remove(files.map((f) => `${s.id}/${f.name}`));
    }
  }

  // Deleting the card also deletes that customer's entries and redemptions.
  await db.from('memberships').delete().in('id', ms.map((m) => m.id));

  // Remove customer accounts that no longer belong to any store.
  const cids = [...new Set(ms.map((m) => m.customer_id))];
  const { data: still } = await db.from('memberships').select('customer_id').in('customer_id', cids);
  const keep = new Set((still || []).map((x) => x.customer_id));
  const orphans = cids.filter((c) => !keep.has(c));
  if (orphans.length) await db.from('customers').delete().in('id', orphans);

  done(`Deleted ${ms.length} customer${ms.length > 1 ? 's' : ''}.`);
}
