# Gamble-Hub Style Guide & CSS Dokumentace

Tento dokument popisuje aktuální modulární strukturu CSS a design systém aplikace.

## 1. Adresářová struktura

```
src/
├── css/
│   ├── _variables.css    // CSS custom properties (barevná paleta, glow, shadow)
│   ├── _reset.css        // *, html, body, scrollbar
│   ├── _typography.css   // Google fonty, h1/h2, @keyframes
│   ├── _layout.css       // .container, .screen, grid/flex helpers, media queries
│   ├── _buttons.css      // Tlačítka, inputy, modály, info-panel, sound-toggle
│   ├── _panels.css       // Header, modal, info-panel, leaderboard, dialogy
│   ├── _slot.css         // Automat: reels, cells, symboly, slot-controls
│   ├── _hilo.css         // Hi-Lo karty, number-grid, bet-buttons, .status-box
│   └── main.css          // Jediný entry point – importuje všechny moduly
├── tailwind.css          // Tailwind v4 base (@tailwind base/components/utilities)
```

## 2. Entry point

Vše importuje **`src/css/main.css`**, který je naimportován v `src/main.js`:

```js
import './css/main.css';
```

HTML (`index.html`) žádný `<link>` na CSS neobsahuje – vše prochází Vite/PostCSS pipeline.

## 3. Pořadí importů v main.css

1. `../tailwind.css` – Tailwind v4 utility (kompilováno Vitem)
2. `./_variables.css` – CSS custom properties (`--neon-*`, `--glass-*`)
3. `./_reset.css` – `* { box-sizing… }`, `html/body`, scrollbar
4. `./_typography.css` – font import, `h1`, `h2`, @keyframes
5. `./_layout.css` – `.container`, `.screen`, `.flex-row-center`, media queries
6. `@layer components { ... }` – tlačítka, inputy, modály, slot, hilo

## 4. Design tokeny (CSS proměnné)

Definováno v `_variables.css`:

| Proměnná | Hodnota | Použití |
|----------|---------|---------|
| `--bg-gradient` | `radial-gradient(...)` | Pozadí `body` |
| `--panel-bg` | `rgba(13,0,26,0.6)` | `.container`, modály |
| `--panel-border` | `rgba(189,0,255,0.3)` | Border panelů |
| `--text-primary` | `#ffd700` | Hlavní text |
| `--text-secondary` | `#00ffff` | Vedlejší text |
| `--neon-gold` / `--neon-gold-glow` | `#ffd700` / `rgba(255,215,0,0.65)` | Zlaté akcenty |
| `--neon-purple` / `--neon-purple-glow` | `#bd00ff` / `rgba(189,0,255,0.6)` | Hlavní border/glow |
| `--neon-cyan` / `--neon-cyan-glow` | `#00ffff` / `rgba(0,255,255,0.6)` | Cyan akcenty |
| `--neon-blue` / `--neon-blue-glow` | `#00f0ff` / `rgba(0,240,255,0.6)` | Modré akcenty |
| `--neon-pink` / `--neon-pink-glow` | `#ff007f` / `rgba(255,0,127,0.6)` | Růžové akcenty |
| `--neon-green` / `--neon-green-glow` | `#39ff14` / `rgba(57,255,20,0.6)` | Zelené akcenty |
| `--neon-orange` / `--neon-orange-glow` | `#ff9f1c` / `rgba(255,159,28,0.6)` | Oranžové akcenty |
| `--shadow-premium` | `0 0 30px rgba(189,0,255,0.25), ...` | Premium shadow |
| `--glass-blur` | `blur(25px)` | Backdrop filter hodnota |

## 5. Komponenty

### Tlačítka (`.btn`, `.btn-*`)
Definováno v `_buttons.css` – massive 3D mechanical switch design:
- Všechny varianty sdílejí základ: `#111118` bg, 6px bottom shadow for 3D depth
- Hover: lift `translateY(-2px)`, zesílení box-shadow
- Active: press `translateY(6px)`, snížení shadow pro fyzický dojem
- Speciální varianty: `.btn-spin-slots`, `.btn-bet`, `.btn-auto-slots`, `.btn-num`
- Skrytí ikon: `.btn i, .btn svg, .btn-num i, .btn-num svg { display:none; }`

> **Důležité:** Veškerá deklarace `!important` byla z `_buttons.css` a `_panels.css` odstraněna. Dříve sloužila k nucenému přepsání Tailwind v4 preflight základních restů. Díky tomu, že vlastní komponenty jsou v `@layer components` (což má vyšší prioritu než `@layer base`), je přepsání zaručeno samotnou vrstvou CSS Layers – speciální důraz (`!important`) není potřeba. Zároveň bylo smazáno `scripts/fix-legacy.js`, které námi odebrané `!important` opětovně přidávalo.

### Inputy
V `_layout.css`: `input, select, textarea` – tmavé sklo, orange focus glow.

### Modály (.modal)
- `.modal` – fixed overlay, `rgba(2, 2, 5, 0.92)`, `backdrop-blur(18px)`
- `.modal-content` – tmavé pozadí, purple border, premium shadow, scale-in animace
- `.modal-header` – Orbitron font, gold text-shadow

### Info Panel (.info-panel)
- Stejné principy jako `.modal` ale z-index 200
- Header s blue title, gold close button (hover rotate 90°)

### Slot Machine (_slot.css)
- `.slot-machine` – tmavé pozadí, gold border, gold glow
- `.slot-reel` – gradient `#010104 → #0a0a16`
- `.slot-cell.sym-*` – neonové glowy pro každý symbol

### Hi-Lo (_hilo.css)
- `.hilo-card` – 3D flip (`rotateY(180deg)`)
- `.card-front` / `.card-back` – gradienty + border
- `.btn-bet` – černé s cyan border, selected stav má gold glow

### Status Box (.status-box)
- Fixed toast – `bottom: 160px`, tmavé sklo, blur

## 6. Responzivita

Breakpointy v `_layout.css`:
- `@media (max-width: 600px)` – `.container` zmenšený padding, `border-radius: 16px`, `max-height: 100vh`
- `@media (max-width: 480px)` – header stack, menší bet buttons, gap adjust

## 7. Tailwind v4

Projekt používá Tailwind CSS v4 (`@tailwindcss/postcss`). Utility třídy se applikují přímo v HTML (např. `flex`, `grid-cols-2`, `text-[var(--neon-gold)]`, `gap-3`). V build čas se generuje `dist/assets/index-*.css`.

Konfigurace je v `tailwind.config.js` ( backwards-compatible JS config):
- Rozšířená barevná paleta: `neon-*` barvy + kompletní `gray` paleta
- Vlastní `boxShadow.premium`

## 8. Sémantické HTML (2026-06-28 refaktoring)

Provedená změna v `index.html`:
- `<div class="container">` → `<main class="container">`
- `<div class="screen ...">` → `<section class="screen ...">`
- `<div class="game-header-bar">` → `<header class="game-header-bar">`
- Zachovány všechny `id` atributy pro kompatibilitu s JS

## 9. CSS Cleanup (2026-06-29)

### Odstraněno
- **Duplicitní definice `.dice-num-btn`** v `_hilo.css` (existovaly 3x stejná definice, nyní 1x)
- **Duplicitní definice `.history-item.win/loss`** a `.leaderboard-item` v `_panels.css` (2x → 1x)
- **Zbytečné utility třídy** v `_layout.css`: `flex-row-center`, `gap-sm`, `margin-top-md`, `text-center`, `text-muted` (už jsou v Tailwind)

### Zálohy
Originální soubory zálohovány do `backup/css/20260629_010247/`.