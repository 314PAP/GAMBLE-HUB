/**
 * VIP & XP progression system (persisted under `c_vip` in localStorage).
 */

const STORAGE_KEY = "c_vip";

export const VIP_LEVELS = [
  { level: 1, name: "Nováček", minXp: 0 },
  { level: 2, name: "Hráč", minXp: 100 },
  { level: 3, name: "Stálice", minXp: 300 },
  { level: 4, name: "High Roller", minXp: 700 },
  { level: 5, name: "VIP", minXp: 1500 },
  { level: 6, name: "Legenda", minXp: 3000 },
];

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getVipLevelInfo(xp = 0) {
  let current = VIP_LEVELS[0];
  let next = null;
  for (let i = 0; i < VIP_LEVELS.length; i++) {
    if (xp >= VIP_LEVELS[i].minXp) {
      current = VIP_LEVELS[i];
      next = VIP_LEVELS[i + 1] || null;
    }
  }
  return { ...current, xp, nextLevel: next };
}

export function getPlayerVip(username) {
  const all = loadAll();
  const xp = all[username]?.xp || 0;
  return getVipLevelInfo(xp);
}

export function addPlayerXp(username, betAmount) {
  if (!username || betAmount <= 0) return { leveledUp: false, info: getPlayerVip(username) };
  const all = loadAll();
  const prevXp = all[username]?.xp || 0;
  const prevLevel = getVipLevelInfo(prevXp).level;
  const gained = Math.max(1, Math.floor(betAmount / 10));
  const newXp = prevXp + gained;
  all[username] = { xp: newXp };
  saveAll(all);

  const info = getVipLevelInfo(newXp);
  return { leveledUp: info.level > prevLevel, info };
}
