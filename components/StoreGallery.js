export default function StoreGallery({ images }) {
  const list = (images || []).filter(Boolean);
  if (!list.length) return null;
  const moving = list.length > 1;
  const loop = moving ? [...list, ...list] : list;
  const secs = Math.max(10, list.length * 6);
  return (
    <>
      <style>{`
        .gal{overflow:hidden;border-radius:12px;margin:16px 0}
        .gal .track{display:flex;width:max-content}
        .gal.go .track{animation:galmove ${secs}s linear infinite}
        .gal:hover .track{animation-play-state:paused}
        .gal img{width:260px;height:170px;object-fit:cover;border-radius:12px;margin-right:8px;flex:none;display:block}
        @keyframes galmove{to{transform:translateX(-50%)}}
        @media (prefers-reduced-motion:reduce){.gal{overflow-x:auto}.gal.go .track{animation:none}}
      `}</style>
      <div className={moving ? 'gal go' : 'gal'}>
        <div className="track">
          {loop.map((u, i) => <img key={i} src={u} alt="" />)}
        </div>
      </div>
    </>
  );
}
