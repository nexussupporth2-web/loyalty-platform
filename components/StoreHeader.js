import { socialLinks } from '../lib/links';

// Original brand logos: no circle behind them, each in its own colour.
const BRAND = {
  whatsapp: (
    <>
      <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9z" fill="#25D366" />
      <path
        d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1"
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
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
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#igGrad)" />
      <rect x="6" y="6" width="12" height="12" rx="3.6" fill="none" stroke="#fff" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="2.8" fill="none" stroke="#fff" strokeWidth="1.7" />
      <circle cx="16" cy="8" r="0.9" fill="#fff" />
    </>
  ),
  facebook: (
    <>
      <circle cx="12" cy="12" r="10.5" fill="#1877F2" />
      <path
        d="M13.4 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.4 1.5-1.4h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.2H7.8v3h2.6V21h3z"
        fill="#fff"
      />
    </>
  ),
  youtube: (
    <>
      <rect x="1.5" y="4.5" width="21" height="15" rx="4.5" fill="#FF0000" />
      <path d="M10 9l5 3l-5 3z" fill="#fff" />
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

export default function StoreHeader({ store: s }) {
  const links = socialLinks(s);
  const icons = links.filter((l) => l.key !== 'review');
  const review = links.find((l) => l.key === 'review');

  return (
    <>
      <style>{`
        .sh{display:flex;gap:16px;align-items:flex-start}
        .sh-left,.sh-right{flex:1 1 0;min-width:0}
        .sh-right{display:flex;flex-direction:column;gap:10px}
        .sh-logo{width:100%;aspect-ratio:1;border-radius:50%;object-fit:cover;background:#fff;border:4px solid #fff;box-shadow:var(--shadow);display:block}
        .sh-name{font-size:20px;font-weight:800;text-transform:uppercase;line-height:1.15;margin:12px 0 0;word-break:break-word}
        .sh-gear{align-self:flex-end;color:var(--tx2);padding:4px;display:flex}
        .sh-icons{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .sh-icons a{aspect-ratio:1;display:flex;align-items:center;justify-content:center}
        .sh-icons svg{width:82%;height:82%;display:block}
        .sh-review{display:block;text-align:center;background:var(--card);border:1.5px solid var(--bd);border-radius:16px;padding:10px 8px;font-weight:800;font-size:14px;text-decoration:none;color:var(--tx);box-shadow:var(--shadow)}
        .sh-slogan{text-align:center;font-size:18px;font-weight:700;line-height:1.35;margin:24px 8px 8px}
      `}</style>

      <div className="sh">
        <div className="sh-left">
          <img className="sh-logo" src={s.logo_url} alt={`${s.business_name} logo`} />
          <h1 className="sh-name">{s.business_name}</h1>
        </div>

        <div className="sh-right">
          <a className="sh-gear" href={`/s/${s.slug}/edit`} aria-label="Store settings">
            <Gear size={28} />
          </a>
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
          {review && (
            <a className="sh-review" href={review.href} target="_blank" rel="noopener noreferrer">
              <span style={{ color: '#E3A93B' }}>★</span> Google reviews
            </a>
          )}
        </div>
      </div>

      {s.slogan && <p className="sh-slogan">{s.slogan}</p>}
    </>
  );
}
