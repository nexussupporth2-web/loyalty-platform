export const POINTS_PER = 10; // 1 point for every 10 spent
export const earnedFor = (amount) => Math.floor(Number(amount || 0) / POINTS_PER);
export const tierFor = (points) => (points >= 3000 ? 'Platinum' : points >= 1000 ? 'Gold' : 'Silver');
