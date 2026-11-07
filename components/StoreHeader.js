import { socialLinks, mapHref, hasMapLink } from '../lib/links';

// Original brand logos. Each one fills the same 1:1 square, with no circle or background behind it.
const BRAND = {
  whatsapp: (
    <g transform="translate(12 12) scale(1.333) translate(-12 -12)">
      <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9z" fill="#25D366" />
      <path
        d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1"
        fill="none"
        stroke="#fff"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  ),
  instagram: (
    <>
      <defs>
        <linearGradient id="igGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#FEDA75" />
          <stop offset="0.3" stopColor="#FA7E1E" />
          <stop offset="0.55" stopColor="#D62976" />
          <stop offset="0.8" stopColor="#962FBF" />
          <stop offset="1" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="24" height="24" rx="7" fill="url(#igGrad)" />
      <rect x="5" y="5" width="14" height="14" rx="4.2" fill="none" stroke="#fff" strokeWidth="1.9" />
      <circle cx="12" cy="12" r="3.3" fill="none" stroke="#fff" strokeWidth="1.9" />
      <circle cx="16.8" cy="7.2" r="1.1" fill="#fff" />
    </>
  ),
  facebook: (
    <>
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        transform="translate(0 1.5)"
        d="M13.4 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.4 1.5-1.4h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.2H7.8v3h2.6V21h3z"
        fill="#fff"
      />
    </>
  ),
  youtube: (
    <>
      <rect x="0" y="0" width="24" height="24" rx="6" fill="#FF0000" />
      <path d="M9 6.8v10.4L18.2 12z" fill="#fff" />
    </>
  ),
};

const GEAR = [
  'M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z',
  'M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0',
];

function Gear({ size }) {
  return (
    <svg
      viewBox="0 0 24 24"
      style={{ width: size, height: size }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {GEAR.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

export default function StoreHeader({ store: s, gearHref, showGear = true, note = null }) {
  const links = socialLinks(s);
  const icons = links.filter((l) => l.key !== 'review');
  const review = links.find((l) => l.key === 'review');
  const showMap = hasMapLink(s);
  // Store name stays on one line: 20px as before, smaller only when the name is very long.
  const nameSize = Math.max(11, Math.min(20, Math.floor(320 / ((s.business_name || '').length * 0.68 || 1))));

  return (
    <>
      <style>{`
        .sh-top{display:flex;align-items:center;gap:14px}
        .sh-logo{width:88px;height:88px;flex:none;border-radius:50%;object-fit:cover;background:#fff;border:4px solid #fff;box-shadow:var(--shadow);display:block}
        .sh-topright{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:flex-end;gap:10px}
        .sh-gear{color:var(--tx2);padding:2px;display:flex}
        .sh-icons{display:flex;gap:8px;justify-content:flex-end;max-width:100%}
        .sh-icons a{display:block;width:44px;height:44px;flex:0 1 44px}
        .sh-icons svg{width:100%;height:100%;display:block}
        .sh-note{text-align:center;margin-top:12px}
        .sh-name{font-weight:800;text-transform:uppercase;line-height:1.15;margin:14px 0 0;text-align:center;white-space:nowrap}
        .sh-btns{display:flex;gap:10px;justify-content:center;margin-top:12px}
        .sh-review{display:block;flex:0 1 calc(50% - 5px);text-align:center;background:var(--card);border:1.5px solid var(--bd);border-radius:16px;padding:10px 8px;font-weight:800;font-size:14px;text-decoration:none;color:var(--tx);box-shadow:var(--shadow)}
      `}</style>

      <div className="sh-top">
        <img className="sh-logo" src={s.logo_url} alt={`${s.business_name} logo`} />
        <div className="sh-topright">
          {showGear && (
            <a className="sh-gear" href={gearHref || `/s/${s.slug}/edit`} aria-label="Store settings">
              <Gear size={28} />
            </a>
          )}
          {icons.length > 0 && (
            <div className="sh-icons">
              {icons.map((i) => (
                <a
                  key={i.key}
                  href={i.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={i.label}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">{BRAND[i.key]}</svg>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {note && <div className="sh-note">{note}</div>}

      <h1 className="sh-name" style={{ fontSize: nameSize }}>{s.business_name}</h1>

      {(showMap || review) && (
        <div className="sh-btns">
          {showMap && (
            <a className="sh-review" href={mapHref(s)} target="_blank" rel="noopener noreferrer">
              Google Location
            </a>
          )}
          {review && (
            <a className="sh-review" href={review.href} target="_blank" rel="noopener noreferrer">
              <span style={{ color: '#E3A93B' }}>★</span> Google reviews
            </a>
          )}
        </div>
      )}
    </>
  );
}
