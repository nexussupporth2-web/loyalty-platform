import { socialLinks } from '../lib/links';

const ICONS = {
  whatsapp: [
    'M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9',
    'M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1',
  ],
  instagram: [
    'M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z',
    'M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0',
    'M16.5 7.5v.01',
  ],
  facebook: ['M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3'],
  youtube: [
    'M2 8a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4v-8z',
    'M10 9l5 3l-5 3z',
  ],
};

// Soft pastel circle + darker icon colour for each network.
const TINT = {
  whatsapp: ['#CDE8DF', '#2F6B5A'],
  instagram: ['#F7D7D1', '#A5493F'],
  facebook: ['#C9D8EC', '#34508A'],
  youtube: ['#F8D9C8', '#B04632'],
};

const GEAR = [
  'M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z',
  'M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0',
];

function Svg({ paths, size }) {
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
      {paths.map((d, i) => <path key={i} d={d} />)}
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
        .sh-icons a{aspect-ratio:1;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow)}
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
            <Svg paths={GEAR} size={28} />
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
                  style={{ background: TINT[i.key][0], color: TINT[i.key][1] }}
                >
                  <Svg paths={ICONS[i.key]} size="46%" />
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
