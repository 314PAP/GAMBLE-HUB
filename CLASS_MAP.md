# GambleHub — Class & Module Map

> Living architecture map. Keep updated whenever modules are added, split, renamed, or removed.
> **Line limits:** 400 lines (warning) / 500 lines (hard ceiling).

## Entry & Core Orchestration
| File | Lines | Key Classes / Exports | Responsibility | Dependencies |
|------|-------|-----------------------|----------------|--------------|
| `src/main.js` | ~361 | `window.onload`, `initApp`, theme/visit setup | App bootstrap, splash screen, visit tracking, theme init | `db.js`, `api.js`, `ui.js`, `games.js`, `sound.js`, `globalHandlers.js` |
| `src/games.js` | ~390 | `GameManager` | Bet orchestration, UI lock, game routing (re-exports `config.js`) | `db.js`, `api.js`, `ui.js`, `sound.js`, `games/*`, `ui/BetSlider.js` |
| `src/ui.js` | ~307 | `GameUI` | Screen switching, modals, alerts, profile/stats/leaderboard coordination | `db.js`, `ui/*`, `animations/*`, `utils.js` |
| `src/events/globalHandlers.js` | ~356 | `GlobalEventHandlers` | Binds `window.*` handlers for HTML `onclick` attributes | `main.js`, `games.js`, `ui.js`, `sound.js` |

## Data, Persistence & Networking
| File | Lines | Key Classes / Exports | Responsibility | Dependencies |
|------|-------|-----------------------|----------------|--------------|
| `src/db.js` | ~151 | `Database` | LocalStorage CRUD (`c_uziv`, `c_stat`, `c_scor`, `c_mute`, `c_music_mute`, `c_theme`) | — |
| `src/api.js` | ~145 | `API` | Firebase Firestore sync (`leaderboard`, `matches`, `visits`) | Firebase SDK |
| `src/clientWebSocket.js` | ~64 | WebSocket client | Real-time client WebSocket connection | — |
| `src/utils.js` | ~104 | `formatNumber`, `escapeHtml`, `COIN_SVG`, etc. | Number formatting, HTML escaping, shared SVG constants | — |

## Audio
| File | Lines | Key Classes / Exports | Responsibility | Dependencies |
|------|-------|-----------------------|----------------|--------------|
| `src/sound.js` | ~377 | `SoundManager` | Web Audio API synth + file-based SFX & BGM playback | `soundIndex.js`, `db.js` |
| `src/soundIndex.js` | ~41 | `SOUND_ASSETS`, `BGM_TRACKS` | Audio asset registry | — |

## Games (`src/games/`)
| File | Lines | Key Classes / Exports | Responsibility | Dependencies |
|------|-------|-----------------------|----------------|--------------|
| `src/games/config.js` | ~22 | `DISPLAY_STATES`, `GAME_CONFIG` | Game display states and configuration metadata | — |
| `src/games/autoPlay.js` | ~52 | `toggleAutoPlay`, `stopAutoPlay` | Slot machine autoplay loop & cleanup | `animations/ui.js` |
| `src/games/controlsLock.js` | ~26 | `lockGameControls` | Lock/unlock game controls during animations | — |
| `src/games/resultBoxes.js` | ~20 | `clearAllResultBoxes` | Hide and clear all game result boxes | — |
| `src/games/slots.js` | ~215 | `SlotMachineGame` | 3x3 slot grid, 5 paylines, GSAP reel spin | `sound.js` |
| `src/games/guessing.js` | ~147 | `GuessingGame` | Number grid games (Guessing, Roulette) | `sound.js` |
| `src/games/hilo.js` | ~139 | `HiloGame` | Hi-Lo card game, 3D flip, dynamic multiplier | `sound.js` |
| `src/games/dice.js` | ~100 | `DiceGame` | Dice 1–6 game, shuffle animation | `sound.js` |

## UI Components (`src/ui/`)
| File | Lines | Key Classes / Exports | Responsibility | Dependencies |
|------|-------|-----------------------|----------------|--------------|
| `src/ui/resultAnimations.js` | ~166 | `triggerWinConfetti`, `cancelWinConfetti`, `animateWinResult`, `animateLossBalance` | Win confetti & GSAP result/balance animations | `gsap`, `canvas-confetti`, `dompurify`, `utils.js` |
| `src/ui/BetSlider.js` | ~306 | `BetSlider` | Custom logarithmic bet slider with hold-to-repeat | `utils.js` |
| `src/ui/Explorer.js` | ~170 | `Explorer` | Global history & leaderboard with filter/sort | `api.js`, `utils.js` |
| `src/ui/Stats.js` | ~89 | `Stats` | Player stats, win-rate, last 10 matches | `db.js`, `utils.js` |
| `src/ui/Leaderboard.js` | ~87 | `LeaderboardManager` | Top 5 leaderboard with medals | `api.js`, `db.js`, `utils.js` |
| `src/ui/Accounts.js` | ~48 | `Accounts` | Account selection & deletion list | `db.js`, `utils.js` |
| `src/ui/DeleteConfirm.js` | ~30 | `DeleteConfirm` | Account deletion confirmation modal | — |
| `src/ui/gameInfo.js` | ~26 | `GAME_INFOS` | HTML content for game info panels | — |

## Animations (`src/animations/`)
| File | Lines | Key Classes / Exports | Responsibility | Dependencies |
|------|-------|-----------------------|----------------|--------------|
| `src/animations/ui.js` | ~290 | UI animation helpers | Neon flicker, idle pulse, screen transitions, border glow | `gsap` |
| `src/animations/infoToggle.js` | ~200 | `initInfoToggleAnimations` | Info panel toggle animations & screen transitions | `gsap` |
| `src/animations/buttons.js` | ~15 | Button entrance animations | GSAP entrance animations for buttons | `gsap` |

## Styles (`src/css/`)
| File | Lines | Responsibility |
|------|-------|----------------|
| `src/css/main.css` | ~29 | Entry point importing Tailwind, base layers, and component CSS |
| `src/css/_buttons.css` | ~298 | Action buttons, delete account button |
| `src/css/_panels.css` | ~273 | Leaderboard card, explorer history table, toggle buttons |
| `src/css/_layout.css` | ~197 | Screen management, form inputs, grid layouts |
| `src/css/_dice.css` | ~162 | Dice frame, sheen animation, win glow |
| `src/css/_bet-slider.css` | ~150 | BetSlider track, fill, thumb, value, arrow buttons |
| `src/css/_slot.css` | ~147 | Slot machine 3x3 grid & reel styles |
| `src/css/_modals.css` | ~133 | Explorer modal overrides & stats modal progress bar |
| `src/css/_bet-buttons.css` | ~117 | 8-bit glass bet preset buttons |
| `src/css/_typography.css` | ~112 | Fonts, headings, neon text utilities, `.sr-only` |
| `src/css/_number-buttons.css` | ~90 | `.btn-num` color variants, states, and pulse keyframes |
| `src/css/_hilo.css` | ~63 | Hi-Lo card 3D flip styles |
| `src/css/_variables.css` | ~60 | CSS custom properties (`--neon-*`) |
| `src/css/_reset.css` | ~57 | Global reset, scrollbar, body background |
| `src/css/tailwind.css` | ~32 | Tailwind v4 `@theme` neon palette |
