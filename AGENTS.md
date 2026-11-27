# GambleHub - Agent Instructions

## 🚀 Nasazené instance
- **GitHub Pages**: `https://314pap.github.io/GAMBLE-HUB/`
- **Vercel**: `https://gamblehub.vercel.app/`
- Workflow: `.github/workflows/pages.yml` (automatický deploy z `main`)

## Architektura projektu
```
src/
├── css/
│   ├── main.css           # Entry point – importuje všechny CSS vrstvy
│   ├── tailwind.css       # Tailwind v4 @theme s neon paletou
│   ├── _variables.css     # CSS custom properties (--neon-*)
│   ├── _reset.css         # Globální reset, scrollbar, body pozadí
│   ├── _typography.css    # Fonty, nadpisy, neon text utility, .sr-only
│   ├── _layout.css        # Screen management, form inputs, grid rozložení
│   ├── _buttons.css       # 3D tlačítka + delete-account-btn
│   ├── _bet-buttons.css   # 8-bit glass tlačítka pro předvolby sázek
│   ├── _bet-slider.css    # Styly pro BetSlider
│   ├── _number-buttons.css # Barevné varianty a stavy pro .btn-num
│   ├── _panels.css        # Leaderboard card, explorer tabulka, toggle tlačítka
│   ├── _modals.css        # Explorer a Stats modály
│   ├── _slot.css          # Slot machine (komponenta)
│   ├── _hilo.css          # Hi-Lo karta (komponenta)
│   ├── _dice.css          # Dice frame – sheen animace, win glow
│   ├── _mines.css         # Mines 5×5 mřížka a stavy políček
│   └── _crash.css         # Crash násobitel a progress bar
├── partials/              # HTML partials (načítané přes Vite plugin)
│   ├── screen-game.html   # Herní obrazovka (#screen-game)
│   └── modals.html        # Explorer, Stats a DeleteConfirm modály
├── ui/                    # UI komponenty
│   ├── Leaderboard.js     # Žebříček hráčů (top 5, medaile, online/lokální badge)
│   ├── Explorer.js        # Globální historie a leaderboard s filtry/sortem
│   ├── Stats.js           # Statistiky hráče, Chart.js graf, ROI, achievementy, historie
│   ├── Accounts.js        # Správa účtů (výběr, smazání)
│   ├── DeleteConfirm.js   # Dialog pro potvrzení smazání účtu
│   ├── BetSlider.js       # Custom logaritmický slider s hold-to-repeat
│   ├── resultAnimations.js # Konfety a GSAP animace výsledků/balance
│   └── gameInfo.js        # GAME_INFOS – HTML obsah pro info panely
├── games/                 # Herní logika
│   ├── config.js          # DISPLAY_STATES a GAME_CONFIG
│   ├── autoPlay.js        # Autoplay smyčka pro automaty
│   ├── controlsLock.js    # Zamykání ovládacích prvků během animací
│   ├── resultBoxes.js     # Skrytí a vyčištění výsledkových boxů
│   ├── resultProcessor.js # Zpracování výsledku kola, DB/Firebase/achievementy, bankrot
│   ├── screenSetup.js     # Příprava DOM a ovládání při přepnutí hry
│   ├── slots.js           # SlotMachineGame – 3x3 mřížka, 5 linií, GSAP spin
│   ├── hilo.js            # HiloGame – Hi-Lo karta, 3D flip, série & Cash Out
│   ├── guessing.js        # GuessingGame – číselné mřížky (Hádanka, Ruleta + side bets)
│   ├── dice.js            # DiceGame – kostka 1-6, shuffle animace
│   ├── mines.js           # MinesGame – 5×5 miny, progresivní koeficienty & Cash Out
│   └── crash.js           # CrashGame – exponenciální násobitel & Cash Out
├── animations/            # Animace
│   ├── buttons.js         # GSAP entrance animace tlačítek
│   ├── infoToggle.js      # Neónové kmitání, idle pulzace, screen přechody info panelu
│   └── ui.js              # Neónové kmitání, idle pulzace, screen přechody, border glow
├── events/
│   ├── globalHandlers.js  # GlobalEventHandlers – window.* funkce z HTML onclick
│   ├── uiHandlers.js      # Modály, explorer, info, import/export, audio & téma
│   └── keyboardShortcuts.js # Klávesové zkratky pro hry
├── sound.js               # SoundManager – Web Audio API syntetizátor + file-based audio
├── soundIndex.js          # Sound asset registry (SOUND_ASSETS, BGM_TRACKS)
├── main.js                # Entry point – inicializace, splash, návštěvy, SW registrace
├── swRegister.js          # Registrace Service Workeru a update banner
├── ui.js                  # GameUI – obrazovky, modály, koordinace komponent
├── games.js               # GameManager – orchestrátor sázek, autoplay, UI lock
├── db.js                  # LocalStorage databáze
├── achievements.js        # Systém achievementů a milníků (c_achiv)
├── api.js                 # API – Firebase Auth + Firestore sync + validace skóre
├── clientWebSocket.js     # WebSocket klient
├── liveFeed.js            # Live Big-Win feed (WebSocket / BroadcastChannel)
└── utils.js               # Utility – formátování velkých čísel, zkratky, escapeHtml, COIN_SVG
```

## Stylování
- **Tailwind v4 utilities** v `tailwind.css` – flex, grid, spacing utility
- **CSS proměnné** v `_variables.css` – neon barvy, glow, shadow (pro komponentový CSS)
- **Komponenty** v `_buttons.css`, `_slot.css`, `_hilo.css`, `_dice.css`, `_panels.css` – složité efekty
- Nové styly přidávej do `tailwind.css` v `@layer utilities` nebo do příslušné komponenty
- **HTML/JS**: používaj Tailwind utility třídy z `@theme` (`text-neon-gold`, `bg-neon-purple`, `border-neon-cyan`, `text-text-primary`, atd.) místo CSS custom property workarounků (`text-[var(--neon-gold)]` se nepoužívá)
- **CSS cleanup**: `_buttons.css` a `_panels.css` nemají `!important` (odstraněno 2026-06-29)

## Sémantické HTML & ARIA
- `<main role="main">` – hlavní oblast
- `<nav aria-label="...">` – navigace a přepínače
- `<article aria-labelledby="...">` – samostatné herní sekce (slots, hilo, dice, classic)
- `<section aria-labelledby="...">` – obrazovky
- Modály: `role="dialog" aria-modal="true" aria-labelledby="..."`
- Emoji ikony: `aria-hidden="true"`
- Seznamy: `role="list"` + `role="listitem"` na položky
- `aria-live="polite"` pro dynamická oznámení

## Databáze (LocalStorage klíče)
| Klíč | Formát | Popis |
|------|--------|-------|
| `c_uziv` | `{ username: balance }` | Uživatelé a jejich zůstatky (startovní 500) |
| `c_stat` | `{ username: { vyhry, prohry, historie: string[], perGame, balanceHistory } }` | Statistiky, historie (10 záznamů), per-game ROI a vývoj zůstatku |
| `c_scor` | `[{ jmeno, castka }]` | Leaderboard – pouze nejvyšší skóre na hráče |
| `c_achiv` | `{ username: string[] }` | Odemčené achievementy hráče |
| `c_daily_bonus` | `{ [username]: { lastClaim, streak } }` | Denní bonus a streak (Den 1–7) |
| `c_bailout` | `{ [username]: number }` | Čas posledního bankrotního záchranného bonusu |
| `c_mute` | `"true"` / `"false"` | Stav ztlumení zvuku |
| `c_music_mute` | `"true"` / `"false"` | Stav ztlumení hudby |
| `c_theme` | `"cyan"` / absent | Barevné téma |

## Firebase (volitelné, global sync)
- `leaderboard/{username}` – `{ castka, updatedAt }`
- `matches/{autoId}` – `{ username, gameName, bet, resultText, isWin, winAmount, timestamp }`
- `visits/{ip}` – `{ count }` – návštěvy podle IP

## Linting
```bash
npm run lint    # ESLint
npm run format  # Prettier
```

## Testing
```bash
npm run test          # Vitest unit tests
npm run test:watch    # Vitest watch mode
npm run test:e2e      # Playwright e2e tests
```

## Modularization, Line Limits & Living Documentation
- **Warning Threshold (400 lines):** Whenever a source file reaches or approaches 400 lines, plan and extract cohesive modules, helpers, subcomponents, or services.
- **Hard Ceiling (500 lines):** No source file in the project may exceed 500 lines of code (ideal target: 120–320 lines per file).
- **Single Responsibility & Deduplication:** Split oversized files by clear domain/technical boundaries. Consolidate duplicated logic, UI blocks, or helpers into shared modules.
- **Class Map (`CLASS_MAP.md`):** Keep `CLASS_MAP.md` up to date with key classes, functions, responsibilities, dependencies, and approximate line counts whenever modules are added, split, renamed, or removed.
- **Progress & Handoff (`DOCS_PROGRESS.md`):** Record completed refactoring steps, current state, remaining targets, known duplicates, and immediate next steps. Read `CLASS_MAP.md` and `DOCS_PROGRESS.md` before making architectural edits and update them afterward.

## CI/CD, E2E & PWA Guardrails
- **Single Pages Workflow:** Používej výhradně `.github/workflows/pages.yml`. Nikdy nepřidávej druhý workflow (např. `deploy.yml`) se stejnou `pages` concurrency skupinou — bez Firebase secrets by přepisoval nasazení offline verzí.
- **Firebase Env in CI:** V `pages.yml` předávej všechny `VITE_FIREBASE_*` proměnné přímo v `env:` kroku `Build` (kromě `.env`), aby je Vite vždy spolehlivě načetl z `Repository secrets`.
- **Playwright `webServer`:** `playwright.config.ts` musí definovat `webServer` (`npm run dev -- --port 5173`), jinak `npm run test:e2e` v CI spadne na `ERR_CONNECTION_REFUSED`. Při úpravách UI/ID nezapomeň ověřit selektory v `tests/e2e/main-flow.spec.ts`.
- **Service Worker (`public/sw.js` & `src/main.js`):** Navigační požadavky (`index.html`) obsluhuj strategií **network-first** (fallback na cache / `./offline.html`), a tlačítko aktualizace musí před `window.location.reload()` po `SKIP_WAITING` počkat na `controllerchange`, jinak prohlížeč zůstane na staré cache.

## Git & Deploy
- Po každém dokončeném a ověřeném úkolu (`npm run lint`, `npm run test`, `npm run build`) změny vždy commitni a pushni do větve `main`, aby se automaticky nasadily na GitHub Pages.
