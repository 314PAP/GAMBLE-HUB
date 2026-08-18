// Sound asset registry for file-based audio
// Paths are prefixed with BASE_URL so they work under both Vercel (base '/')
// and GitHub Pages (base '/GAMBLE-HUB/').
const BASE = import.meta.env.BASE_URL;

export const SOUND_ASSETS = {
  'button-click': `${BASE}sounds/sfx/click-mechanical.mp3`,
  'button-click-8bit': `${BASE}sounds/sfx/click-8bit.mp3`,
  'button-click-retro': `${BASE}sounds/sfx/click-retro.mp3`,
  'button-click-heavy': `${BASE}sounds/sfx/click-heavy.mp3`,

  'slot-spin': `${BASE}sounds/sfx/slot-spin.mp3`,
  'slot-reel-stop': `${BASE}sounds/sfx/slot-reel-stop.mp3`,
  'slot-wheel': `${BASE}sounds/sfx/slot-wheel.mp3`,
  'slot-wheel-start': `${BASE}sounds/sfx/slot-wheel-start.mp3`,
  'slot-idle': `${BASE}sounds/sfx/slot-idle.mp3`,
  'slot-coin': `${BASE}sounds/sfx/slot-coin.wav`,
  'slot-payout': `${BASE}sounds/sfx/slot-payout.wav`,
  'slot-win': `${BASE}sounds/sfx/slot-win-alert.wav`,
  'slot-jackpot': `${BASE}sounds/sfx/slot-jackpot.mp3`,
  'slot-bonus': `${BASE}sounds/sfx/slot-bonus.mp3`,
  'slot-near-miss': `${BASE}sounds/sfx/slot-near-miss.mp3`,
  'slot-cancel': `${BASE}sounds/sfx/slot-cancel.mp3`,

  '8bit-jump': `${BASE}sounds/sfx/8bit-jump.mp3`,
  '8bit-powerup': `${BASE}sounds/sfx/8bit-powerup.mp3`,
  '8bit-coin': `${BASE}sounds/sfx/8bit-coin.mp3`,
  '8bit-select': `${BASE}sounds/sfx/8bit-select.mp3`,

  'win-8bit': `${BASE}sounds/sfx/floraphonic-level-up-bonus-sequence-3-186892.mp3`,
  'lose-8bit': `${BASE}sounds/sfx/click-heavy.mp3`,
  'flip-8bit': `${BASE}sounds/sfx/8bit-select.mp3`,
  'dice-roll-8bit': `${BASE}sounds/sfx/slot-reel-stop.mp3`,
  'card-flip': `${BASE}sounds/sfx/mixkit-poker-card-flick-2002.wav`,
};

export const BGM_TRACKS = [
  { id: 'casino-groove', name: 'Casino Groove', src: `${BASE}sounds/bgm/casino-groove.ogg` },
  { id: 'retro-platform', name: 'Retro Platform', src: `${BASE}sounds/bgm/retro-platform.ogg` },
  { id: 'chiptune-action', name: 'Chiptune Action', src: `${BASE}sounds/bgm/chiptune-action.ogg` },
];
