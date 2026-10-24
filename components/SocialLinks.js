import { socialLinks } from '../lib/links';

export default function SocialLinks({ store, title = 'Follow us' }) {
  const items = socialLinks(store);
  if (!items.length) return null;
  return (
    <>
      <h2>{title}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {items.map((i) => (
          <a
            key={i.key}
            href={i.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ border: '1px solid var(--bd)', background: 'var(--card)', borderRadius: 20, padding: '8px 14px', textDecoration: 'none' }}
          >
            {i.label}
          </a>
        ))}
      </div>
    </>
  );
              }
