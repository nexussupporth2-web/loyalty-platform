import { todayIST } from './membership';

// Offer scheme: optional starting and ending dates (plain IST dates). With neither date, it simply continues.
// Outside the dates, and for anything before the store's last "Reset", entries and points show as zero.
export function schemeEnded(s) {
  return !!(s && s.scheme_end && todayIST() > s.scheme_end);
}
export function schemeNotStarted(s) {
  return !!(s && s.scheme_start && todayIST() < s.scheme_start);
}

// The time of the store's last "Reset" lives in the existing app_settings table, so no new database column is needed.
export async function attachReset(db, s) {
  if (!s) return s;
  const { data, error } = await db.from('app_settings').select('value').eq('key', 'reset:' + s.id).maybeSingle();
  s.scheme_reset_at = !error && data ? data.value : null;
  return s;
}

const istDay = (ts) => new Date(new Date(ts).getTime() + 19800000).toISOString().slice(0, 10);

// Keeps only the rows (entries or redemptions) that belong to the current scheme.
export function inScheme(s, rows) {
  if (schemeEnded(s) || schemeNotStarted(s)) return [];
  const start = s && s.scheme_start;
  const reset = s && s.scheme_reset_at ? new Date(s.scheme_reset_at).getTime() : 0;
  return (rows || []).filter(
    (r) => (!start || istDay(r.created_at) >= start) && (!reset || new Date(r.created_at).getTime() > reset)
  );
}
