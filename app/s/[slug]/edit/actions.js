'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { admin } from '../../../../lib/supabase';
import { setOwnerSession, getOwnerSession, clearOwnerSession } from '../../../../lib/session';
import {
  readStoreForm, checkStoreForm, uploadLogo, uploadImages, socialColumns,
} from '../../../../lib/storeForm';

const back = (slug, msg) => redirect(`/s/${slug}/edit?error=${encodeURIComponent(msg)}`);
const slugOf = (fd) => (fd.get('slug') || '').toString();

export async function ownerLogin(fd) {
  const slug = slugOf(fd);
  const pw = (fd.get('password') || '').toString();
  const { data: s } = await admin().from('stores').select('id,owner_hash').eq('slug', slug).maybeSingle();
  if (!s || !s.owner_hash || !(await bcrypt.compare(pw, s.owner_hash))) back(slug, 'Wrong password.');
  await setOwnerSession(s.id);
  redirect(`/s/${slug}/edit`);
}

export async function ownerLogout(fd) {
  clearOwnerSession();
  redirect(`/s/${slugOf(fd)}`);
}

export async function saveStore(fd) {
  const slug = slugOf(fd);
  const db = admin();
  const { data: s } = await db.from('stores').select('id,store_images').eq('slug', slug).maybeSingle();
  if (!s || (await getOwnerSession()) !== s.id) redirect(`/s/${slug}/edit`);

  const x = readStoreForm(fd);
  const err = checkStoreForm(x, false);
  if (err) back(slug, err);

  const existing = s.store_images || [];
  const keep = existing.filter((u) => x.keep.includes(u));
  if (keep.length + x.images.length > 5) back(slug, 'You can have at most 5 store images.');

  const update = { ...x.f, ...socialColumns(x.social) };

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
  if (r.error) back(slug, 'Could not save. Please try again.');
  redirect(`/s/${slug}?saved=1`);
}
