// Builds the statement rows and totals for one customer.
export function buildLedger(entries = [], reds = []) {
  const items = [
    ...entries.map((e) => ({ t: e.created_at, e })),
    ...reds.map((r) => ({ t: r.created_at, r })),
  ].sort((a, b) => new Date(a.t) - new Date(b.t));

  let bal = 0;
  let earned = 0;
  let redeemed = 0;
  const rows = items.map((it) => {
    if (it.e) {
      const e = it.e;
      const credit = e.status === 'verified' ? e.points : 0;
      bal += credit;
      earned += credit;
      return {
        key: e.id,
        date: e.entry_date || e.created_at.slice(0, 10),
        title: e.bill_no || 'No bill number',
        sub: e.amount ? 'Amount ' + Number(e.amount).toLocaleString() : '',
        status: e.status,
        reason: e.reason,
        credit,
        debit: 0,
        bal,
      };
    }
    const r = it.r;
    bal -= r.points;
    redeemed += r.points;
    return {
      key: r.id, date: r.created_at.slice(0, 10), title: 'Points redeemed', sub: r.note || '',
      status: null, reason: null, credit: 0, debit: r.points, bal,
    };
  });

  return { rows, totals: { entries: entries.length, earned, redeemed, available: earned - redeemed } };
}
