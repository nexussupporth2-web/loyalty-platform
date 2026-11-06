export const POINTS_PER = 10; // 1 point for every 10 spent
export const earnedFor = (amount) => Math.floor(Number(amount || 0) / POINTS_PER);
export const tierFor = (points) => (points >= 3000 ? 'Platinum' : points >= 1000 ? 'Gold' : 'Silver');

// Card level follows the store's redemption slabs: one level (and one card colour) per slab.
// Each slab line starts with the points needed, e.g. "500 points = Free Belt".
const LADDER = ['Copper', 'Bronze', 'Silver', 'Gold', 'Platinum'];
const LADDER_6 = [...LADDER, 'Diamond'];

export function slabThresholds(rules) {
  const nums = (rules || '')
    .split(/\r?\n/)
    .map((l) => l.trim().match(/^([\d][\d,]*)/))
    .filter(Boolean)
    .map((m) => Number(m[1].replace(/,/g, '')))
    .filter((n) => Number.isFinite(n));
  return [...new Set(nums)].sort((a, b) => a - b).slice(0, 6);
}

// Returns the level name for the card. With no usable slabs it falls back to the 3 standard levels.
export function levelFor(points, rules) {
  const th = slabThresholds(rules);
  if (th.length === 0) return tierFor(points);
  const names = th.length >= 6 ? LADDER_6 : LADDER.slice(LADDER.length - th.length);
  let idx = 0;
  th.forEach((n, i) => { if (points >= n) idx = i; });
  return names[idx];
}
