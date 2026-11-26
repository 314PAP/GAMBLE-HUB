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
17. **Step 4 — New Game: Mines 5×5:**
    - Created `src/games/mines.js` (`MinesGame` with 5×5 grid, 1/3/5/10 mine presets, progressive 5%-edge multiplier formula, tile reveal, and Cash Out) and `src/css/_mines.css` imported in `src/css/main.css`.
    - Registered game ID `7` in `src/games/config.js`, `src/games/resultBoxes.js`, `src/games/controlsLock.js`, `src/games.js`, `src/events/globalHandlers.js`, `src/ui/gameInfo.js`, and `index.html`.
    - Added `tests/mines.test.js` and updated `tests/gameInfo.test.js` & `tests/gameManager.test.js` (153/153 passing).
18. **Step 5 — Achievements & Milestones:**
    - Created `src/achievements.js` (`ACHIEVEMENTS`, `evaluateAchievements`, `getPlayerAchievements`) persisted under `c_achiv` in `localStorage`.
    - Hooked evaluation & neon toast alerts into `GameManager.processGameResult` (`src/games.js`) and bankruptcy bailout (`src/events/globalHandlers.js`).
    - Rendered unlocked/locked achievement badges in `src/ui/Stats.js` and `#modal-achievements-data` in `index.html`.
    - Added `tests/achievements.test.js` (157/157 passing).
19. **Step 6 — Stats Charts, Per-Game Analytics & Bet UX:**
    - Extended `recordMatch` in `src/db.js` to track `perGame` stats (`wins`, `losses`, `totalBet`, `totalWon`, `highestWin`) and `balanceHistory` (last 25 snapshots).
    - Integrated tree-shaken `chart.js` line chart (`#stats-balance-chart`) and per-game ROI breakdown (`#modal-pergame-stats`) in `src/ui/Stats.js` and `index.html`.
    - Added `1/2×` and `2×` quick-bet buttons (`nasobSazku`) and keyboard shortcut hint in `index.html` + `src/events/globalHandlers.js`, and fixed `#screen-game` + added `H`/`L`/`M`/`Space` shortcuts in `src/events/keyboardShortcuts.js`.
    - Added unit test in `tests/db.test.js` (158/158 passing).
20. **Step 7 — Technical Cleanup & Modularization:**
    - Removed unused `lucide` dependency from `package.json`.
    - Extracted `src/games/resultProcessor.js`, `src/games/screenSetup.js`, `src/events/uiHandlers.js`, and `src/swRegister.js` so all JS files in `src/` are ≤ 377 lines (well under the 400-line warning threshold).
    - Added zero-dependency `htmlPartialsPlugin` in `vite.config.js` and split `index.html` (1235 → 341 lines) into `src/partials/screen-game.html` and `src/partials/modals.html`.
21. **Step 8 — Online Fairness, Auth & Live Big-Win Feed:**
    - Added Firebase Anonymous Auth (`_initAuth`) and `isValidScoreSubmission` jump/bounds validation in `src/api.js`, plus `firestore.rules` for `leaderboard`, `matches`, and `visits`.
    - Created `src/liveFeed.js` wiring `src/clientWebSocket.js` (when `VITE_WS_URL` is configured) and `BroadcastChannel` for live big-win notifications, hooked into `src/main.js` and `src/games/resultProcessor.js`.
    - Added `tests/liveFeed.test.js` (161/161 passing).
22. **Step 9 — E2E Verification & Documentation Sync:**
    - Installed Playwright Chromium (`npx playwright install chromium`) and added `E2E_PORT` override (default `5173`) to `playwright.config.ts`.
    - Moved `initServiceWorker` and `initLiveFeed` imports to the top of `src/main.js`.
    - Updated `.gitignore` (`playwright-report/`, `test-results/`), `AGENTS.md`, and `README.md` to match the 7-game architecture and Step 4–8 modules.
23. **Step 10 — Bundle Optimization (Lazy-Loaded `chart.js`):**
    - Replaced static `chart.js` import in `src/ui/Stats.js` with a dynamic `import("chart.js")` loader (`loadChart`) guarded by `_chartRenderId` to avoid stale renders.
    - Split `chart-*.js` (`153.34 kB` / `53.88 kB` gzip) out of `index-*.js` (`387.75 kB` → `235.23 kB` / `61.38 kB` gzip).
24. **Step 11 — Expanded E2E Test Suite (`tests/e2e/gameplay.spec.ts`):**
    - Added 4 new E2E tests (8 runs across `chromium` and `Mobile Chrome`) covering player registration, Daily Bonus claim, Mines 5×5 round start, Slots controls, and Stats/Explorer modals (`18/18` E2E tests passing).

## Planned Next Steps
25. **Step 12 — New Game: Crash (ID 8):**
    - Implement `src/games/crash.js` and `src/css/_crash.css`, wire into game config/UI/handlers/info, add unit tests, and update docs.

## Current State ("Kde jsme skončili")
- All `.js` and `.css` files in `src/` are under 378 lines (`src/sound.js` 377, `src/events/globalHandlers.js` 355, `src/ui.js` 345, `src/games.js` 342).
- `index.html` is 341 lines with `src/partials/screen-game.html` and `src/partials/modals.html`.
- `npm run lint`: 0 errors, 0 warnings.
- `npm run test`: 20/20 test files passed (161/161 tests).
- `npm run test:e2e`: 10/10 Playwright tests passed (Chromium + Mobile Chrome).
- `npm run build`: clean production build.
