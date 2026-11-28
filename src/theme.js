/**
 * Theme Switcher — supports Cyberpunk Cyan, Vegas Gold, Matrix Green, Synthwave Pink.
 */
export const THEMES = {
  cyan: {
    name: "Cyberpunk Cyan",
    "--neon-cyan": "#00f0ff",
    "--neon-cyan-glow": "rgba(0, 240, 255, 0.55)",
    "--neon-pink": "#ff2a85",
    "--neon-gold": "#ffd700",
  },
  gold: {
    name: "Vegas Gold",
    "--neon-cyan": "#ffd700",
    "--neon-cyan-glow": "rgba(255, 215, 0, 0.55)",
    "--neon-pink": "#ff6b00",
    "--neon-gold": "#fff066",
  },
  matrix: {
    name: "Matrix Green",
    "--neon-cyan": "#00ff66",
    "--neon-cyan-glow": "rgba(0, 255, 102, 0.55)",
    "--neon-pink": "#00cc44",
    "--neon-gold": "#aaff00",
  },
  synthwave: {
    name: "Synthwave Pink",
    "--neon-cyan": "#ff2a85",
    "--neon-cyan-glow": "rgba(255, 42, 133, 0.55)",
    "--neon-pink": "#b829ff",
    "--neon-gold": "#00f0ff",
  },
};

const STORAGE_KEY = "c_theme";

/**
 * Apply a theme by key and persist to localStorage.
 * @param {string} themeKey
 * @returns {string} applied theme key
 */
export function applyTheme(themeKey) {
  const key = THEMES[themeKey] ? themeKey : "cyan";
  const theme = THEMES[key];

  if (typeof document !== "undefined" && document.documentElement) {
    const root = document.documentElement;
    Object.entries(theme).forEach(([prop, val]) => {
      if (prop.startsWith("--")) {
        root.style.setProperty(prop, val);
      }
    });
    root.dataset.theme = key;
  }

  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, key);
  }
  return key;
}

/**
 * Cycle to the next theme and apply it.
 * @returns {string} new theme key
 */
export function cycleTheme() {
  const keys = Object.keys(THEMES);
  const current =
    typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) || "cyan" : "cyan";
  const idx = keys.indexOf(current);
  const next = keys[(idx + 1) % keys.length];
  return applyTheme(next);
}

/**
 * Initialize theme from localStorage.
 */
export function initTheme() {
  const saved =
    typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) || "cyan" : "cyan";
  return applyTheme(saved);
}
