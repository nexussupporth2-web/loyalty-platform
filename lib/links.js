const clean = (v) => (v || "").toString().trim();
const URL_RULE = /^https:\/\/\S{4,500}$/;
const FB_URL_START =
  /^(https?:\/\/)?((www|m|web|mbasic)\.)?(facebook\.com|fb\.com|fb\.me)\//i;

const RULES = {
  // a phone number (digits with country code) or a WhatsApp group / channel link
  whatsapp: /^(\d{8,15}|https:\/\/(chat\.whatsapp\.com|whatsapp\.com\/channel|wa\.me|api\.whatsapp\.com)\/\S{2,300})$/i,
  instagram: /^[A-Za-z0-9._]{1,30}$/,
  // a Facebook page name / handle, or any facebook.com / fb.com / fb.me link
  facebook:
    /^(https:\/\/([a-z0-9-]+\.)?(facebook\.com|fb\.com|fb\.me)\/\S{1,300}|[A-Za-z0-9._-]{3,80})$/i,
  youtube:
    /^(@?[A-Za-z0-9._-]{3,50}|https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\/\S+)$/,
  google_place_id: /^[A-Za-z0-9_-]{15,}$/,
  review_url: URL_RULE,
  map_url: URL_RULE,
};

// A WhatsApp group/channel link is kept as a link; anything else is reduced to digits.
function waValue(v) {
  const w = clean(v);
  const m = w.match(/(https?:\/\/)?(chat\.whatsapp\.com|whatsapp\.com\/channel|wa\.me|api\.whatsapp\.com)\/\S+/i);
  if (m) return m[0].replace(/^(https?:\/\/)?/i, "https://");
  return w.replace(/\D/g, "");
}

// A pasted Google Maps share text ("Place name https://maps.app.goo.gl/...") is cut down to the link.
function mapValue(v) {
  const w = clean(v);
  const m = w.match(LINK_IN_TEXT);
  return m ? "https://" + m[2] : w;
}

// Turns what the owner typed (handles or full links) into clean values.
export function normalizeSocial(raw) {
  // A pasted YouTube share text can carry extra words/lines: pick out the link, and make it https://.
  const ytRaw = clean(raw.youtube);
  const ytLink = ytRaw.match(
    /(https?:\/\/)?((www|m|music)\.)?(youtube\.com|youtu\.be)\/\S+/i
  );
  const yt = ytLink
    ? ytLink[0]
        .replace(/^(https?:\/\/)?/i, "https://")
        .replace(/^https:\/\/(m|music)\./i, "https://www.")
    : ytRaw;
  const fb = clean(raw.facebook);
  return {
    whatsapp: waValue(raw.whatsapp),
    instagram: clean(raw.instagram)
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
      .replace(/^@/, "")
      .replace(/[/?].*$/, ""),
    facebook: FB_URL_START.test(fb)
      ? fb.replace(/^(https?:\/\/)?/i, "https://")
      : fb.replace(/^@/, ""),
    youtube: /^https?:/i.test(yt) ? yt : yt.replace(/^@/, ""),
    google_place_id: clean(raw.google_place_id),
    review_url: clean(raw.review_url),
    map_url: mapValue(raw.map_url),
  };
}

const LABELS = {
  whatsapp: "WhatsApp (a number with country code, or a WhatsApp group link)",
  instagram: "Instagram ID",
  facebook: "Facebook (a page name, or a facebook.com link)",
  youtube:
    "YouTube (a handle like @name, or a youtube.com link starting with https://)",
  google_place_id: "Google Place ID",
  review_url: "Google reviews link (must start with https://)",
  map_url: "Google Maps location link (must start with https://)",
};

// Names of the filled-in fields that do not look right.
export function invalidFields(v) {
  return Object.keys(RULES)
    .filter((k) => v[k] && !RULES[k].test(v[k]))
    .map((k) => LABELS[k]);
}

// Only properly filled options are returned, so only those are shown.
export function socialLinks(s) {
  const ok = (k) => s[k] && RULES[k].test(s[k]);
  const out = [];
  if (ok("whatsapp")) {
    const isUrl = /^https:/i.test(s.whatsapp);
    out.push({
      key: "whatsapp",
      label: "WhatsApp",
      text: isUrl ? "WhatsApp group" : "+" + s.whatsapp,
      href: isUrl ? s.whatsapp : `https://wa.me/${s.whatsapp}`,
    });
  }
  if (ok("instagram"))
    out.push({
      key: "instagram",
      label: "Instagram",
      text: "@" + s.instagram,
      href: `https://instagram.com/${s.instagram}`,
    });
  if (ok("facebook")) {
    const isUrl = /^https:/i.test(s.facebook);
    out.push({
      key: "facebook",
      label: "Facebook",
      text: isUrl ? "Facebook page" : "facebook.com/" + s.facebook,
      href: isUrl ? s.facebook : `https://facebook.com/${s.facebook}`,
    });
  }
  if (ok("youtube")) {
    const isUrl = /^https:/.test(s.youtube);
    const handle = s.youtube.replace(/^@/, "");
    out.push({
      key: "youtube",
      label: "YouTube",
      text: isUrl ? "YouTube channel" : "@" + handle,
      href: isUrl ? s.youtube : `https://youtube.com/@${handle}`,
    });
  }
  const review = ok("review_url")
    ? s.review_url
    : ok("google_place_id")
    ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent( s.google_place_id )}`
    : null;
  if (review)
    out.push({
      key: "review",
      label: "Review us on Google",
      text: "",
      href: review,
    });
  return out;
}

// Link for the "Open in maps" button.
const LINK_IN_TEXT = /(https?:\/\/)?((maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs|share\.google|(www\.)?google\.[a-z.]+\/maps|maps\.google\.[a-z.]+)\S*)/i;

// True when the store has a Google Maps link, either in the link box or pasted into the address.
export const hasMapLink = (s) => !!(((s.map_url || "").trim()) || LINK_IN_TEXT.test(s.address || ""));

// The address as text, without any Google Maps link that was pasted into it.
export const addressText = (s) =>
  (s.address || "")
    .replace(new RegExp(LINK_IN_TEXT.source, "gi"), "")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

export function mapHref(s) {
  if (s.map_url && RULES.map_url.test(s.map_url)) return s.map_url;
  // A Google Maps link pasted into the address (or into the link box without https://) still works.
  for (const text of [s.map_url, s.address]) {
    const m = (text || "").match(LINK_IN_TEXT);
    if (m) return "https://" + m[2];
  }
  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(s.address)
  );
}
