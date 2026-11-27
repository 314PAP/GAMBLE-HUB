/**
 * Daily Missions system (persisted under `c_missions` in localStorage).
 */

const STORAGE_KEY = "c_missions";

export const DAILY_MISSIONS = [
  { id: "mines_3", title: "Vyhraj 3× v Minách", target: 3, reward: 150, game: "Miny" },
  { id: "crash_3x", title: "Dosáhni 3× v Crash", target: 1, reward: 200, game: "Crash", minMult: 3 },
  { id: "blackjack_2", title: "Vyhraj 2× v Blackjacku", target: 2, reward: 150, game: "Blackjack" },
];

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

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

export function getPlayerMissions(username) {
  const today = getTodayKey();
  const all = loadAll();
  const entry = all[username];
  if (!entry || entry.date !== today) {
    return DAILY_MISSIONS.map((m) => ({ ...m, progress: 0, completed: false }));
  }
  return DAILY_MISSIONS.map((m) => {
    const p = entry.progress?.[m.id] || 0;
    return { ...m, progress: Math.min(p, m.target), completed: p >= m.target };
  });
}

export function updateMissionsProgress(username, { gameName, isWin, multiplier = 1 }) {
  if (!username || !isWin) return [];
  const today = getTodayKey();
  const all = loadAll();
  if (!all[username] || all[username].date !== today) {
    all[username] = { date: today, progress: {} };
  }

  const completedNow = [];
  for (const m of DAILY_MISSIONS) {
    if (m.game !== gameName) continue;
    if (m.minMult && multiplier < m.minMult) continue;
    const prev = all[username].progress[m.id] || 0;
    if (prev >= m.target) continue;
    const next = prev + 1;
    all[username].progress[m.id] = next;
    if (next >= m.target) {
      completedNow.push(m);
    }
  }

  saveAll(all);
  return completedNow;
}
