# GambleHub — Refactoring Progress & Handoff

## Completed Steps
1. **Project Rules Sync:** Added 400-line warning / 500-line hard ceiling, deduplication, `CLASS_MAP.md`, and `DOCS_PROGRESS.md` rules to `AGENTS.md`.
2. **Living Docs Created:** Created `CLASS_MAP.md` and `DOCS_PROGRESS.md`.
3. **CSS Modularization (Batch 1):** Extracted `BetSlider` styles (150 lines) from `src/css/_buttons.css` (653 → 502 lines) into `src/css/_bet-slider.css` and imported it in `src/css/main.css`.
4. **CSS Modularization (Batch 2):** Extracted `.btn-num` color variants, states, and pulse keyframes (90 lines) from `src/css/_buttons.css` (502 → 415 lines) into `src/css/_number-buttons.css` and imported it in `src/css/main.css`.
5. **Game Config Extraction:** Extracted `DISPLAY_STATES` and `GAME_CONFIG` from `src/games.js` (486 → 472 lines) into `src/games/config.js` with re-exports in `src/games.js`.
6. **Autoplay Extraction:** Extracted `toggleAutoPlay` and `stopAutoPlay` from `src/games.js` (472 → 439 lines) into `src/games/autoPlay.js`.
7. **UI Result Animations Extraction:** Extracted `triggerWinConfetti`, `cancelWinConfetti`, `animateWinResult`, and `animateLossBalance` from `src/ui.js` (467 → 307 lines) into `src/ui/resultAnimations.js`.
8. **Controls Lock Extraction:** Extracted `lockGameControls` from `src/games.js` (439 → 402 lines) into `src/games/controlsLock.js`.
9. **CSS Modularization (Batch 3):** Extracted `_modals.css` (133 lines) from `src/css/_panels.css` (406 → 273 lines) and `_bet-buttons.css` (117 lines) from `src/css/_buttons.css` (415 → 298 lines), importing both in `src/css/main.css`.
10. **Result Boxes Extraction:** Extracted `clearAllResultBoxes` from `src/games.js` (402 → 390 lines) into `src/games/resultBoxes.js`.
11. **UI Test Guards:** Added defensive DOM guards in `src/animations/infoToggle.js` and `src/ui.js`, fixing all 10 failures in `tests/ui.test.js`.
12. **Post-Audit Improvements & Cleanup:**
    - Removed `.kilo/` directory completely.
    - Updated `vitest.config.js` to exclude `node_modules/**` so `npm run test` runs cleanly (17/17 files, 140/140 tests).
    - Fixed `gameConfig` resolution in `src/games.js` (`processGameResult`).
    - Updated `submitScore` in `src/api.js` to only overwrite `leaderboard/{username}` when `balance` exceeds the player's previous best.

## Current State ("Kde jsme skončili")
- **All `.js` and `.css` files in `src/` are under 400 lines** (0 files over 400 or 500).
- `npm run lint`: 0 errors, 0 warnings.
- `npm run test`: 17/17 test files passed (140/140 tests).
- `npm run build`: clean production build.

## Remaining / Optional Targets
- `index.html` (1014 lines): HTML entry point; only split if adopting a template/partial build step.
