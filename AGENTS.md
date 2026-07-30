# GambleHub - Agent Instructions

## Architektura projektu
```
src/
├── css/
│   ├── main.css      # Entry point – importuje všechny CSS vrstvy
│   ├── tailwind.css  # Tailwind v4 @theme s neon paletou
│   ├── _variables.css # CSS custom properties (--neon-*)
│   ├── _reset.css    # Globální reset, scrollbar, body pozadí
│   ├── _typography.css # Fonty, nadpisy, neon text utility, .sr-only
│   ├── _layout.css   # Screen management, form inputs, grid rozložení
│   ├── _buttons.css  # 3D tlačítka (komponenta) + BetSlider + delete-account-btn
│   ├── _slot.css     # Slot machine (komponenta)
│   ├── _hilo.css     # Hi-Lo karta (komponenta)
│   ├── _panels.css   # Modály, info panely, status box, toast pozice
│   └── _dice.css     # Dice frame – sheen animace, win glow
├── ui/              # UI komponenty
│   ├── Leaderboard.js   # Žebříček hráčů (top 5, medaile)
│   ├── Explorer.js      # Globální historie a leaderboard s filtry/sortem
│   ├── Stats.js         # Statistiky hráče, win-rate, posledních 10 zápasů
│   ├── Accounts.js      # Správa účtů (výběr, smazání)
│   ├── DeleteConfirm.js # Dialog pro potvrzení smazání účtu
│   ├── BetSlider.js     # Custom logaritmický slider s hold-to-repeat
│   └── gameInfo.js      # GAME_INFOS – HTML obsah pro info panely
├── games/           # Herní logika
│   ├── slots.js      # SlotMachineGame – 3x3 mřížka, 5 linií, GSAP spin
│   ├── hilo.js       # HiloGame – Hi-Lo karta, 3D flip, dynamický koeficient
│   ├── guessing.js   # GuessingGame – číselné mřížky (Hádanka, Ruleta)
│   └── dice.js       # DiceGame – kostka 1-6, shuffle animace
├── animations/      # Animace
│   ├── buttons.js    # GSAP entrance animace tlačítek
│   ├── infoToggle.js # Neónové kmitání, idle pulzace, screen přechody info panelu
│   └── ui.js         # Neónové kmitání, idle pulzace, screen přechody, border glow
├── events/
│   └── globalHandlers.js # GlobalEventHandlers – window.* funkce z HTML onclick
├── sound.js         # SoundManager – Web Audio API syntetizátor + file-based audio
├── soundIndex.js   # Sound asset registry (SOUND_ASSETS, BGM_TRACKS)
├── main.js          # Entry point – inicializace, splash, návštěvy
├── ui.js            # GameUI – obrazovky, modály, animace výsledků
├── games.js         # GameManager – orchestrátor sázek, autoplay, UI lock
├── db.js            # LocalStorage databáze
├── api.js           # API – Firebase Firestore sync
└── utils.js         # Utility – formátování velkých čísel, zkratky, escapeHtml, COIN_SVG
```

## Stylování
- **Tailwind v4 utilities** v `tailwind.css` – flex, grid, spacing utility
- **CSS proměnné** v `_variables.css` – neon barvy, glow, shadow
- **Komponenty** v `_buttons.css`, `_slot.css`, `_hilo.css`, `_dice.css`, `_panels.css` – složité efekty
- Nové styly přidávej do `tailwind.css` v `@layer utilities` nebo do příslušné komponenty
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
| `c_stat` | `{ username: { vyhry, prohry, historie: string[] } }` | Statistiky, historie omezena na 10 záznamů |
| `c_scor` | `[{ jmeno, castka }]` | Leaderboard – pouze nejvyšší skóre na hráče |
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