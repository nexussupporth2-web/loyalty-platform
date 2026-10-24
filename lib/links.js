const clean = (v) => (v || '').toString().trim();

const RULES = {
  whatsapp: /^\d{8,15}$/,
  instagram: /^[A-Za-z0-9._]{1,30}$/,
  facebook: /^[A-Za-z0-9.\-]{5,50}$/,
  google_place_id: /^[A-Za-z0-9_-]{15,}$/,
};

// Turns what the owner typed (handles or full links) into clean values.
export function normalizeSocial(raw) {
  return {
    whatsapp: clean(raw.whatsapp).replace(/\D/g, ''),
    instagram: clean(raw.instagram)
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/[/?].*$/, ''),
    facebook: clean(raw.facebook)
      .replace(/^https?:\/\/(www\.|m\.)?facebook\.com\//i, '').replace(/^@/, '').replace(/\/$/, ''),
    google_place_id: clean(raw.google_place_id),
  };
}

const LABELS = {
  whatsapp: 'WhatsApp number (digits with country code)',
  instagram: 'Instagram ID',
  facebook: 'Facebook page name',
  google_place_id: 'Google Place ID',
};

// Names of the filled-in fields that do not look right.
export function invalidFields(v) {
  return Object.keys(RULES).filter((k) => v[k] && !RULES[k].test(v[k])).map((k) => LABELS[k]);
}

// Only properly filled options are returned, so only those are shown.
export function socialLinks(s) {
  const ok = (k) => s[k] && RULES[k].test(s[k]);
  const out = [];
  if (ok('whatsapp')) out.push({ key: 'whatsapp', label: 'WhatsApp', text: '+' + s.whatsapp, href: `https://wa.me/${s.whatsapp}` });
  if (ok('instagram')) out.push({ key: 'instagram', label: 'Instagram', text: '@' + s.instagram, href: `https://instagram.com/${s.instagram}` });
  if (ok('facebook')) out.push({ key: 'facebook', label: 'Facebook', text: 'facebook.com/' + s.facebook, href: `https://facebook.com/${s.facebook}` });
  if (ok('google_place_id')) out.push({ key: 'review', label: 'Review us on Google', text: '', href: `https://search.google.com/local/writereview?placeid=${encodeURIComponent(s.google_place_id)}` });
  return out;
}
