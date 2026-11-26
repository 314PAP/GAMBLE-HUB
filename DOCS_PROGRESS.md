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
13. **CI/CD, E2E & Firebase / Service Worker Fix:**
    - Removed duplicate `.github/workflows/deploy.yml` (which lacked Firebase secrets and overwrote GitHub Pages deployments).
    - Passed `VITE_FIREBASE_*` directly in the `Build` step `env:` of `.github/workflows/pages.yml`.
    - Added `webServer` to `playwright.config.ts` and updated selectors in `tests/e2e/main-flow.spec.ts` (`#screen-login.active`, `#screen-register.active`, `Nový Hráč`, `#login-sound-toggle`).
    - Switched `public/sw.js` navigation requests to network-first and waited for `controllerchange` before reloading in `src/main.js`.
    - Updated `src/ui/Leaderboard.js` to always render the `🌐 Online` / `💾 Lokální` badge even when scores are empty.
14. **Step 1 — Daily Bonus & Bankruptcy Bailout:**
    - Upgraded `claimDailyBonus` in `src/db.js` with streak tracking (Day 1–7, 250–550 coins) and `getDailyBonusStatus`.
    - Added `getBailoutStatus` and `claimBailout` (+200 coins with 3-min cooldown when balance is 0) in `src/db.js`.
    - Wired `#hub-daily-bonus-btn` and `#socka-bailout-btn` in `index.html`, `src/ui.js`, `src/games.js`, and `src/events/globalHandlers.js`.
    - Added unit tests in `tests/db.test.js` (142/142 passing).
15. **Step 2 — Roulette Side Bets:**
    - Added `ROULETTE_SIDE_BETS` and `evaluateRouletteBet` in `src/games/guessing.js` (Red/Black, Even/Odd, 1–18/19–35 at 2×; Dozens 1–12, 13–24, 25–35 at 3×; 0 loses side bets).
    - Added `#roulette-side-bets` UI in `index.html`, control locking in `src/games/controlsLock.js`, handler `vsaditRuletaVedlejsi` in `src/events/globalHandlers.js`, and updated `src/ui/gameInfo.js`.
    - Added unit tests in `tests/guessing.test.js` and updated `tests/gameInfo.test.js` (144/144 passing).
16. **Step 3 — Hi-Lo Streaks & Cash Out:**
    - Added streak tracking (`streak`, `currentMultiplier`, `streakBet`, `isStreakActive`), `cashOut()`, and `updateStreakUI()` in `src/games/hilo.js` (with impossible-guess button disabling and dynamic step multipliers).
    - Added `#hilo-streak-info` and `#btn-hilo-cashout` in `index.html`, control locking in `src/games/controlsLock.js`, `cashOutHilo()` + auto-cashout on game switch in `src/games.js`, and `window.cashOutHiLo` in `src/events/globalHandlers.js`.
    - Added streak & cashOut unit tests in `tests/hilo.test.js` (147/147 passing).

## Current State ("Kde jsme skončili")
- `src/events/globalHandlers.js` is at ~420 lines (plan to split in Step 7); all other `.js` and `.css` files in `src/` are under 400 lines.
- `npm run lint`: 0 errors, 0 warnings.
- `npm run test`: 17/17 test files passed (147/147 tests).
- `npm run build`: clean production build.

## Remaining / Optional Targets
- `index.html` (1014 lines): HTML entry point; only split if adopting a template/partial build step.
