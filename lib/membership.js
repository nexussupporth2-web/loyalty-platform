import { randomInt } from 'crypto';

// ---- Membership plans (shown on the back of the Store Registration Card) ----
// To correct a price later, edit only this list.
export const BRAND_NAME = 'TechIngen Solutions';
export const REMIND_DAYS = 15;
export const PLANS = [
  { key: '3', months: 3, label: 'Three months', rate: '2.25', price: 821 },
  { key: '6', months: 6, label: 'Six months', rate: '2.15', price: 785 },
  { key: '9', months: 9, label: 'Nine months', rate: '2.05', price: 748 },
  { key: '12', months: 12, label: 'One year', rate: '1.95', price: 712, recommended: true },
];

// ---- Dates (India time). Dates are plain 'YYYY-MM-DD' text. ----
const pad = (n) => String(n).padStart(2, '0');
const utc = (s) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));

export const todayIST = () => new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
export const daysBetween = (a, b) => Math.round((utc(b) - utc(a)) / 86400000);

export function addMonths(dateStr, n) {
  const d = +dateStr.slice(8, 10);
  const t = new Date(Date.UTC(+dateStr.slice(0, 4), +dateStr.slice(5, 7) - 1 + n, 1));
  const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(Math.min(d, last))}`;
}

export const prettyDate = (s) =>
  new Date(s + 'T00:00:00Z').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

// state: 'none' (no end date set yet) | 'life' (lifetime, never ends) | 'active' | 'soon' (last 15 days) | 'expired'
export function membershipStatus(s) {
  if (s && s.member_plan === 'life') return { state: 'life', until: null, left: null };
  const until = s && s.member_until;
  if (!until) return { state: 'none', until: null, left: null };
  const left = daysBetween(todayIST(), until);
  const state = left < 0 ? 'expired' : left <= REMIND_DAYS ? 'soon' : 'active';
  return { state, until, left };
}
export const isExpired = (s) => membershipStatus(s).state === 'expired';

// ---- 16-digit store card number (passes the Luhn check, like a bank card) ----
export function luhnCheckDigit(base) {
  let sum = 0;
  for (let i = 0; i < base.length; i++) {
    let d = Number(base[base.length - 1 - i]);
    if (i % 2 === 0) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return (10 - (sum % 10)) % 10;
}

export function makeStoreCardNo() {
  let base = '5';
  for (let i = 0; i < 14; i++) base += String(randomInt(0, 10));
  return base + luhnCheckDigit(base);
}

// Gives the store its number the first time it is needed. Returns null if it cannot (e.g. the SQL was not run yet).
export async function ensureStoreCardNo(db, s) {
  if (s.store_card_no) return s.store_card_no;
  for (let i = 0; i < 6; i++) {
    const n = makeStoreCardNo();
    const r = await db.from('stores').update({ store_card_no: n }).eq('id', s.id).is('store_card_no', null).select('store_card_no');
    if (!r.error) {
      if (r.data && r.data[0]) return r.data[0].store_card_no;
      const { data } = await db.from('stores').select('store_card_no').eq('id', s.id).maybeSingle();
      return (data && data.store_card_no) || null;
    }
    if (!/duplicate|unique/i.test(r.error.message || '')) return null;
  }
  return null;
}
