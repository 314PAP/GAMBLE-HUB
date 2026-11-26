export const ACHIEVEMENTS = [
  {
    id: "first_win",
    icon: "🏆",
    title: "První výhra",
    desc: "Vyhraj svou první hru",
  },
  {
    id: "win_streak_5",
    icon: "🔥",
    title: "Horká ruka",
    desc: "Vyhraj 5× v řadě",
  },
  {
    id: "jackpot_slots",
    icon: "🎰",
    title: "Král automatu",
    desc: "Tref 7️⃣7️⃣7️⃣ Jackpot na automatu",
  },
  {
    id: "high_roller",
    icon: "💎",
    title: "Velký hráč",
    desc: "Vsaď alespoň 500 mincí v jedné hře",
  },
  {
    id: "rich_10k",
    icon: "👑",
    title: "Milionář v zácviku",
    desc: "Dosáhni zůstatku 10 000 mincí",
  },
  {
    id: "all_games",
    icon: "🎮",
    title: "Všeuměl",
    desc: "Vyzkoušej všech 7 her",
  },
  {
    id: "broke_survivor",
    icon: "🩹",
    title: "Fénix",
    desc: "Využij záchranu při bankrotu",
  },
];

const ACHIEVEMENTS_STORAGE_KEY = "c_achiv";

function readAllData() {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAllData(data) {
  try {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}

function getPlayerRecord(username) {
  const all = readAllData();
  return (
    all[username] || {
      unlocked: [],
      winStreak: 0,
      gamesPlayed: [],
    }
  );
}

/**
 * Get unlocked achievement objects and progress for a player.
 * @param {string} username
 */
export function getPlayerAchievements(username) {
  const rec = getPlayerRecord(username);
  const unlockedSet = new Set(rec.unlocked || []);
  return ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: unlockedSet.has(a.id),
  }));
}

/**
 * Evaluate and unlock any newly earned achievements for a player.
 * @param {string} username
 * @param {object} ctx
 * @returns {Array} newly unlocked achievement objects
 */
export function evaluateAchievements(username, ctx = {}) {
  if (!username) return [];
  const all = readAllData();
  const rec = getPlayerRecord(username);
  const unlockedSet = new Set(rec.unlocked || []);
  const gamesSet = new Set(rec.gamesPlayed || []);

  if (ctx.gameName) {
    gamesSet.add(ctx.gameName);
  }

  if (typeof ctx.isWin === "boolean") {
    rec.winStreak = ctx.isWin ? (rec.winStreak || 0) + 1 : 0;
  }

  const candidates = [];
  if (ctx.isWin) candidates.push("first_win");
  if ((rec.winStreak || 0) >= 5) candidates.push("win_streak_5");
  if (ctx.isJackpot) candidates.push("jackpot_slots");
  if ((ctx.betAmount || 0) >= 500) candidates.push("high_roller");
  if ((ctx.newBalance || 0) >= 10000) candidates.push("rich_10k");
  if (gamesSet.size >= 7) candidates.push("all_games");
  if (ctx.usedBailout) candidates.push("broke_survivor");

  const newlyUnlocked = [];
  for (const id of candidates) {
    if (!unlockedSet.has(id)) {
      unlockedSet.add(id);
      const def = ACHIEVEMENTS.find((a) => a.id === id);
      if (def) newlyUnlocked.push(def);
    }
  }

  all[username] = {
    unlocked: Array.from(unlockedSet),
    winStreak: rec.winStreak || 0,
    gamesPlayed: Array.from(gamesSet),
  };
  writeAllData(all);

  return newlyUnlocked;
}
