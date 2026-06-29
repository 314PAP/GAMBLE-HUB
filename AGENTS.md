# GambleHub - Agent Instructions

## Architektura projektu
```
src/
├── css/
│   ├── main.css    # Entry point
│   ├── tailwind.css # Tailwind v4 utilities
│   ├── _variables.css # CSS proměnné (--neon-*)
│   ├── _reset.css    # Globální reset
│   ├── _typography.css # Typografie, .sr-only
│   ├── _layout.css   # Screen management
│   ├── _buttons.css  # 3D tlačítka (komponenta)
│   ├── _slot.css     # Slot machine (komponenta)
│   └── _panels.css   # Modály, panely (komponenta)
├── ui/            # UI komponenty (Leaderboard, Explorer, Stats, Accounts)
├── games/         # Herní logika
├── db.js          # LocalStorage databáze
├── main.js        # Entry point
└── ui.js          # UI manager
```

## Stylování
- **Tailwind v4 utilities** v `tailwind.css` - flex, grid, spacing utility
- **CSS proměnné** v `_variables.css` - neon barvy, glow, shadow
- **Komponenty** v `_buttons.css`, `_slot.css`, `_panels.css` - složité efekty
- Nové styly přidávej do `tailwind.css` v `@layer utilities` nebo do příslušné komponenty

## Sémantické HTML & ARIA
- `<main role="main">` - hlavní oblast
- `<nav aria-label="...">` - navigace a přepínače
- `<article aria-labelledby="...">` - samostatné sekce (slots, hilo, dice, classic)
- `<section aria-labelledby="...">` - obrazovky
- Modály: `role="dialog" aria-modal="true" aria-labelledby="..."`
- Emoji ikony: `aria-hidden="true"`
- Seznamy: `role="list"` + `role="listitem"` na položky

## Linting
```bash
npm run lint    # ESLint
npm run format  # Prettier
```