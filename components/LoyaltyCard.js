// Bank-card proportions (85.6 x 53.98 mm). Shop name is shown in two lines.
function twoLines(name) {
  const w = name.toUpperCase().split(/\s+/).filter(Boolean);
  if (w.length < 2) return [w[0] || '', ''];
  const i = Math.ceil(w.length / 2);
  return [w.slice(0, i).join(' '), w.slice(i).join(' ')];
}

export default function LoyaltyCard({ name, logo, member = 'YOUR NAME', tier = 'Silver' }) {
  const [l1, l2] = twoLines(name);
  return (
    <div className="lc" data-t={tier}>
      <span className="circ c1" /><span className="circ c2" />
      <div className="in">
        <div className="row"><span className="sm">Loyalty card</span><span className="badge">{tier} member</span></div>
        <div className="chip" />
        <p className="num">0000 0000 0000 0000</p>
        <div className="row end">
          <div><div className="sm">Member name</div><div className="mn">{member}</div></div>
          <div className="row" style={{ gap: 6 }}>
            <div className="sn"><span>{l1}</span><span>{l2}</span></div>
            <div className="lg">{logo ? <img src={logo} alt="" /> : null}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
