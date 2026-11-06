import { socialLinks, mapHref } from '../lib/links';

// Original brand logos, each filling a 1:1 square with no background.
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
        <linearGradient id="igGradCard" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#FEDA75" />
          <stop offset="0.3" stopColor="#FA7E1E" />
          <stop offset="0.55" stopColor="#D62976" />
          <stop offset="0.8" stopColor="#962FBF" />
          <stop offset="1" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="24" height="24" rx="7" fill="url(#igGradCard)" />
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

// Customer card page: filled-in social icons in one line, then Google location + Google reviews buttons.
export default function CardLinks({ store: s }) {
  const links = socialLinks(s);
  const icons = links.filter((l) => l.key !== 'review');
  const review = links.find((l) => l.key === 'review');
  const map = mapHref(s);

  return (
    <>
      <style>{`
        .cl-name{font-size:26px;font-weight:800;text-transform:uppercase;line-height:1.15;margin:0 0 12px;word-break:break-word;text-align:center}
        .cl-head{display:flex;gap:16px;align-items:center}
        .cl-logo{width:96px;height:96px;flex:0 0 96px;border-radius:50%;object-fit:cover;background:#fff;border:3px solid #fff;box-shadow:var(--shadow);display:block}
        .cl-right{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:flex-end;text-align:right}
        .cl-icons{display:flex;flex-wrap:nowrap;gap:14px;align-items:center;justify-content:flex-end;margin:0}
        .cl-icons a{display:block;width:44px;height:44px;flex:0 0 44px}
        .cl-icons svg{width:100%;height:100%;display:block}
        .cl-btns{display:flex;gap:10px;margin:14px 0 0}
        .cl-btns a{flex:1 1 0;min-width:0;text-align:center;background:var(--card);border:1.5px solid var(--bd);border-radius:16px;padding:10px 6px;font-weight:800;font-size:14px;text-decoration:none;color:var(--tx);box-shadow:var(--shadow)}
      `}</style>

      <h1 className="cl-name">{s.business_name}</h1>

      <div className="cl-head">
        <img className="cl-logo" src={s.logo_url} alt={`${s.business_name} logo`} />
        <div className="cl-right">
          {icons.length > 0 && (
            <div className="cl-icons">
              {icons.map((i) => (
                <a key={i.key} href={i.href} target="_blank" rel="noopener noreferrer" aria-label={i.label}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">{BRAND[i.key]}</svg>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="cl-btns">
        <a href={map} target="_blank" rel="noopener noreferrer">Google location</a>
        {review && (
          <a href={review.href} target="_blank" rel="noopener noreferrer">Google reviews</a>
        )}
      </div>
    </>
  );
}
