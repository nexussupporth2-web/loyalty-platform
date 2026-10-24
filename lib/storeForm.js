import { normalizeSocial, invalidFields } from './links';

export function readStoreForm(fd) {
  const g = (k) => (fd.get(k) || '').toString().trim();
  return {
    f: {
      business_name: g('business_name'),
      contact_person: g('contact_person'),
      contact_number: g('contact_number'),
      business_details: g('business_details'),
      address: g('address'),
    },
    social: normalizeSocial({
      whatsapp: g('whatsapp'),
      instagram: g('instagram'),
      facebook: g('facebook'),
      google_place_id: g('google_place_id'),
    }),
    password: (fd.get('password') || '').toString(),
    logo: fd.get('logo'),
  };
}

// Returns an error message, or '' when everything looks fine.
export function checkStoreForm({ f, social, logo }, logoRequired) {
  if (!f.business_name || !f.contact_person || !f.contact_number || !f.address) {
    return 'Please fill in all required fields.';
  }
  if (!/^[+\d][\d\s-]{6,17}$/.test(f.contact_number)) return 'Enter a valid contact number.';
  const bad = invalidFields(social);
  if (bad.length) return 'Please check: ' + bad.join(', ') + '.';
  const has = logo && logo.size;
  if (logoRequired && !has) return 'Please upload your logo.';
  if (has && (!logo.type.startsWith('image/') || logo.size > 2 * 1024 * 1024)) {
    return 'Logo must be an image under 2 MB.';
  }
  return '';
}

export async function uploadLogo(db, slug, logo) {
  const ext = (logo.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
  const path = `${slug}-${Date.now()}.${ext}`;
  const up = await db.storage.from('logos')
    .upload(path, Buffer.from(await logo.arrayBuffer()), { contentType: logo.type });
  if (up.error) return null;
  return db.storage.from('logos').getPublicUrl(path).data.publicUrl;
}

export const socialColumns = (s) => ({
  whatsapp: s.whatsapp || null,
  instagram: s.instagram || null,
  facebook: s.facebook || null,
  google_place_id: s.google_place_id || null,
});
