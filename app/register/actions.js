'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { admin } from '../../lib/supabase';
import { setOwnerSession } from '../../lib/session';
import { readStoreForm, checkStoreForm, uploadLogo, socialColumns } from '../../lib/storeForm';

const slugify = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim()
    .replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 40) || 'store';

export async function createStore(formData) {
  const x = readStoreForm(formData);
  const fail = (m) => redirect('/register?error=' + encodeURIComponent(m)); // redirect() throws, so code below never runs

  const err = checkStoreForm(x, true);
  if (err) fail(err);
  if (x.password.length < 6) fail('Owner password must be at least 6 characters.');

  const db = admin();
  let slug = slugify(x.f.business_name);
  const { data: taken } = await db.from('stores').select('id').eq('slug', slug).maybeSingle();
  if (taken) slug += '-' + Math.random().toString(36).slice(2, 6);

  const logoUrl = await uploadLogo(db, slug, x.logo);
  if (!logoUrl) fail('Logo upload failed. Please try again.');

  const ins = await db.from('stores')
    .insert({
      ...x.f,
      slug,
      logo_url: logoUrl,
      ...socialColumns(x.social),
      owner_hash: await bcrypt.hash(x.password, 10),
    })
    .select('id').single();
  if (ins.error) fail('Could not save your store. Please try again.');

  await setOwnerSession(ins.data.id);
  redirect(`/s/${slug}?welcome=1`);
}
