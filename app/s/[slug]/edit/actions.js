'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { admin } from '../../../../lib/supabase';
import { setOwnerSession, getOwnerSession, clearOwnerSession, isAdmin } from '../../../../lib/session';
import { addMonths, todayIST, prettyDate, normalizeCode } from '../../../../lib/membership';
import {
  readStoreForm, checkStoreForm, uploadLogo, uploadImages, socialColumns,
} from '../../../../lib/storeForm';

const back = (slug, msg) => redirect(`/s/${slug}/edit?error=${encodeURIComponent(msg)}`);
const slugOf = (fd) => (fd.get('slug') || '').toString();

export async function ownerLogin(fd) {
  const slug = slugOf(fd);
  const manager = (fd.get('next') || '').toString() === 'manager';
  const pw = (fd.get('password') || '').toString();
  const { data: s } = await admin().from('stores').select('id,owner_hash').eq('slug', slug).maybeSingle();
  if (!s || !s.owner_hash || !(await bcrypt.compare(pw, s.owner_hash))) {
    const msg = encodeURIComponent('Wrong password.');
    redirect(manager ? `/s/${slug}?manager=1&error=${msg}` : `/s/${slug}/edit?error=${msg}`);
  }
  await setOwnerSession(s.id);
  redirect(manager ? `/s/${slug}?manager=1` : `/s/${slug}/edit`);
}

export async function ownerLogout(fd) {
  clearOwnerSession();
  redirect(`/s/${slugOf(fd)}`);
}

export async function saveStore(fd) {
  const slug = slugOf(fd);
  const db = admin();
  const { data: s } = await db.from('stores').select('id,store_images').eq('slug', slug).maybeSingle();
  const adm = await isAdmin();
  if (!s || (((await getOwnerSession()) !== s.id) && !adm)) redirect(`/s/${slug}/edit`);

  const x = readStoreForm(fd);
  const err = checkStoreForm(x, false);
  if (err) back(slug, err);

  const existing = s.store_images || [];
  const keep = existing.filter((u) => x.keep.includes(u));
  if (keep.length + x.images.length > 5) back(slug, 'You can have at most 5 store images.');

  const update = { ...x.f, ...socialColumns(x.social) };
  // Only the master admin can see or change the Place ID; for everyone else it stays as it is.
  if (!adm) delete update.google_place_id;

  if (x.logo && x.logo.size) {
    const url = await uploadLogo(db, slug, x.logo);
    if (!url) back(slug, 'Logo upload failed. Please try again.');
    update.logo_url = url;
  }
  if (x.images.length || keep.length !== existing.length) {
    const added = x.images.length ? await uploadImages(db, slug, x.images) : [];
    if (!added) back(slug, 'Image upload failed. Please try again.');
    const all = [...keep, ...added];
    update.store_images = all.length ? all : null;
  }
  if (x.password) {
    if (x.password.length < 6) back(slug, 'New password must be at least 6 characters.');
    update.owner_hash = await bcrypt.hash(x.password, 10);
  }

  const r = await db.from('stores').update(update).eq('id', s.id);
  if (r.error) back(slug, 'Could not save: ' + (r.error.message || 'unknown reason').slice(0, 160));
  redirect(`/s/${slug}?manager=1&saved=1`);
}

// The store manager types an activation code; the new period starts from the end of the current membership.
export async function activateMembership(fd) {
  const slug = slugOf(fd);
  const fail = (m) => redirect(`/s/${slug}?manager=1&codeerror=${encodeURIComponent(m)}`);
  const db = admin();
  const { data: s } = await db.from('stores').select('*').eq('slug', slug).maybeSingle();
  if (!s || (((await getOwnerSession()) !== s.id) && !(await isAdmin()))) redirect(`/s/${slug}?manager=1`);
  if (s.member_plan === 'life') fail('This is a lifetime account. No code is needed.');

  const code = normalizeCode(fd.get('code'));
  if (code.length !== 12) fail('Please enter the full 12-character activation code.');

  const { data: c, error } = await db.from('activation_codes').select('*').eq('code', code).maybeSingle();
  if (error) fail('Could not check the code right now. Please try again.');
  if (!c || c.used_at) fail('This code is not valid or has already been used.');

  // Mark the code as used first; only one person can win this race.
  const claim = await db.from('activation_codes')
    .update({ used_at: new Date().toISOString(), used_store_id: s.id })
    .eq('id', c.id).is('used_at', null).select('id');
  if (claim.error || !claim.data || !claim.data.length) fail('This code is not valid or has already been used.');

  const today = todayIST();
  const base = s.member_until && s.member_until >= today ? s.member_until : today;
  const until = addMonths(base, c.months);
  const r = await db.from('stores').update({ member_plan: c.plan, member_until: until }).eq('id', s.id);
  if (r.error) {
    // Give the code back so it can be tried again.
    await db.from('activation_codes').update({ used_at: null, used_store_id: null }).eq('id', c.id);
    fail('Could not extend the membership. Please try again.');
  }
  redirect(`/s/${slug}?manager=1&activated=${encodeURIComponent(prettyDate(until))}`);
}
