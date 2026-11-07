'use server';

import { admin } from './supabase';
import { getOwnerSession, isAdmin } from './session';

// Resets every customer card of one store to zero. Nothing is deleted: entries made before this moment simply stop counting.
export async function resetAllCards(slug) {
  const db = admin();
  const { data: s } = await db.from('stores').select('id').eq('slug', String(slug || '')).maybeSingle();
  if (!s || ((await getOwnerSession()) !== s.id && !(await isAdmin()))) {
    return { ok: false, msg: 'Please log in again.' };
  }
  const r = await db.from('app_settings').upsert({ key: 'reset:' + s.id, value: new Date().toISOString() });
  if (r.error) return { ok: false, msg: 'Could not reset. Please try again.' };
  // Entries still waiting for a check are closed too, so nothing old is credited later.
  await db.from('entries')
    .update({ status: 'rejected', reason: 'Rejected: cards were reset by the store' })
    .eq('store_id', s.id).eq('status', 'pending');
  return { ok: true };
}
