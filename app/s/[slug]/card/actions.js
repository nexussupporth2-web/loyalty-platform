'use server';

import { redirect } from 'next/navigation';
import { admin } from '../../../../lib/supabase';
import { getSession } from '../../../../lib/session';

export async function addEntry(fd) {
  const slug = (fd.get('slug') || '').toString();
  const go = (q) => redirect(`/s/${slug}/card?${q}`);
  const oops = (m) => go('result=error&why=' + encodeURIComponent(m));

  const cid = await getSession();
  if (!cid) redirect(`/s/${slug}/join?mode=login`);

  const db = admin();
  const { data: s } = await db.from('stores').select('id').eq('slug', slug).eq('status', 'active').maybeSingle();
  if (!s) redirect('/');
  const { data: m } = await db.from('memberships').select('id')
    .eq('store_id', s.id).eq('customer_id', cid).maybeSingle();
  if (!m) redirect(`/s/${slug}/join?mode=login`);

  const date = (fd.get('entry_date') || '').toString().trim();
  const bill = (fd.get('bill_no') || '').toString().trim().toUpperCase();
  const amount = Number((fd.get('amount') || '').toString().trim());
  const file = fd.get('bill');
  const hasFile = file && file.size > 0;

  const missing = [];
  if (!date) missing.push('date');
  if (!bill) missing.push('bill number');
  if (!(amount > 0)) missing.push('amount');
  if (!hasFile) missing.push('bill copy');

  let path = null;
  if (hasFile) {
    if (!file.type.startsWith('image/') || file.size > 3 * 1024 * 1024) oops('Bill copy must be an image under 3 MB.');
    path = `${s.id}/${m.id}-${Date.now()}.jpg`;
    const up = await db.storage.from('bills')
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
    if (up.error) oops('Could not upload the bill copy. Please try again.');
  }

  let status = 'pending';
  let reason = '';
  const limit = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  if (missing.length) {
    status = 'ineligible';
    reason = 'Missing: ' + missing.join(', ');
  } else if (date > limit) {
    status = 'ineligible';
    reason = 'Date is in the future';
  } else {
    const { data: dup } = await db.from('entries').select('id')
      .eq('store_id', s.id).eq('bill_no', bill).in('status', ['pending', 'verified']).limit(1);
    if (dup && dup.length) {
      status = 'ineligible';
      reason = 'Duplicate bill number';
    }
  }

  const ins = await db.from('entries').insert({
    store_id: s.id,
    customer_id: cid,
    membership_id: m.id,
    entry_date: date || null,
    bill_no: bill || null,
    amount: amount > 0 ? amount : null,
    bill_path: path,
    status,
    reason: reason || null,
  });
  if (ins.error) oops('Could not save your entry. Please try again.');

  go('result=' + status + (reason ? '&why=' + encodeURIComponent(reason) : ''));
                       }
