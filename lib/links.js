const clean = (v) => (v || '').toString().trim();
const URL_RULE = /^https:\/\/\S{4,500}$/;

const RULES = {
  whatsapp: /^\d{8,15}$/,
  instagram: /^[A-Za-z0-9._]{1,30}$/,
  facebook: /^[A-Za-z0-9.\-]{5,50}$/,
  youtube: /^(@?[A-Za-z0-9._-]{3,50}|https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\/\S+)$/,
  google_place_id: /^[A-Za-z0-9_-]{15,}$/,
  review_url: URL_RULE,
  map_url: URL_RULE,
};

// Turns what the owner typed (handles or full links) into clean values.
export function normalizeSocial(raw) {
  const yt = clean(raw.youtube);
  return {
    whatsapp: clean(raw.whatsapp).replace(/\D/g, ''),
    instagram: clean(raw.instagram)
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/[/?].*$/, ''),
    facebook: clean(raw.facebook)
      .replace(/^https?:\/\/(www\.|m\.)?facebook\.com\//i, '').replace(/^@/, '').replace(/\/$/, ''),
    youtube: /^https?:/i.test(yt) ? yt : yt.replace(/^@/, ''),
    google_place_id: clean(raw.google_place_id),
    review_url: clean(raw.review_url),
    map_url: clean(raw.map_url),
  };
}

const LABELS = {
  whatsapp: 'WhatsApp number (digits with country code)',
  instagram: 'Instagram ID',
  facebook: 'Facebook page name',
  youtube: 'YouTube (a handle like @name, or a youtube.com link starting with https://)',
  google_place_id: 'Google Place ID',
  review_url: 'Google reviews link (must start with https://)',
  map_url: 'Google Maps location link (must start with https://)',
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
  if (ok('youtube')) {
    const isUrl = /^https:/.test(s.youtube);
    const handle = s.youtube.replace(/^@/, '');
    out.push({
      key: 'youtube',
      label: 'YouTube',
      text: isUrl ? 'YouTube channel' : '@' + handle,
      href: isUrl ? s.youtube : `https://youtube.com/@${handle}`,
    });
  }
  const review = ok('review_url')
    ? s.review_url
    : ok('google_place_id')
      ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(s.google_place_id)}`
      : null;
  if (review) out.push({ key: 'review', label: 'Review us on Google', text: '', href: review });
  return out;
}

// Link for the "Open in maps" button.
export function mapHref(s) {
  return s.map_url && RULES.map_url.test(s.map_url)
    ? s.map_url
    : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(s.address);
}
