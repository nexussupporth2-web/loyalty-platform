'use server';

import { redirect } from 'next/navigation';
import { admin } from '../../lib/supabase';

const slugify = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim()
    .replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 40) || 'store';

export async function createStore(formData) {
  const g = (k) => (formData.get(k) || '').toString().trim();
  const f = {
    business_name: g('business_name'),
    contact_person: g('contact_person'),
    contact_number: g('contact_number'),
    business_details: g('business_details'),
    address: g('address'),
  };
  const logo = formData.get('logo');
  const fail = (m) => redirect('/register?error=' + encodeURIComponent(m)); // redirect() throws, so code below never runs

  if (!f.business_name || !f.contact_person || !f.contact_number || !f.address) fail('Please fill in all required fields.');
  if (!/^[+\d][\d\s-]{6,17}$/.test(f.contact_number)) fail('Enter a valid contact number.');
  if (!logo || !logo.size) fail('Please upload your logo.');
  if (!logo.type.startsWith('image/') || logo.size > 2 * 1024 * 1024) fail('Logo must be an image under 2 MB.');

  const db = admin();

  let slug = slugify(f.business_name);
  const { data: taken } = await db.from('stores').select('id').eq('slug', slug).maybeSingle();
  if (taken) slug += '-' + Math.random().toString(36).slice(2, 6);

  const ext = (logo.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
  const path = `${slug}-${Date.now()}.${ext}`;
  const up = await db.storage.from('logos').upload(path, Buffer.from(await logo.arrayBuffer()), { contentType: logo.type });
  if (up.error) fail('Logo upload failed. Please try again.');

  const { data: pub } = db.storage.from('logos').getPublicUrl(path);
  const ins = await db.from('stores').insert({ ...f, slug, logo_url: pub.publicUrl });
  if (ins.error) fail('Could not save your store. Please try again.');

  redirect(`/s/${slug}?welcome=1`);
}
