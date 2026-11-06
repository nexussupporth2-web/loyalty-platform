import { todayIST } from './membership';

// Offer scheme: an optional end date. After it, every customer's entries and points show as zero.
// scheme_start (a plain IST date) marks where the current scheme began, so older entries stay at zero.
export function schemeEnded(s) {
  return !!(s && s.scheme_end && todayIST() > s.scheme_end);
}

const istDay = (ts) => new Date(new Date(ts).getTime() + 19800000).toISOString().slice(0, 10);

// Keeps only the rows (entries or redemptions) that belong to the current scheme.
export function inScheme(s, rows) {
  if (schemeEnded(s)) return [];
  const start = s && s.scheme_start;
  if (!start) return rows || [];
  return (rows || []).filter((r) => istDay(r.created_at) >= start);
}
