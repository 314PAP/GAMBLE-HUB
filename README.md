# 🎰 Gamble Hub

Moderní, modulární herní platforma s neonovým retro designem. Projekt je kompletně přepsán do architektury ES modules s build nástrojem Vite, Tailwind CSS v4 a prémiovými animacemi pomocí GSAP.

---

## ♿ Přístupnost (a11y)

Aplikace respektuje standardy WCAG a používá sémantické HTML5 tagy v kombinaci s ARIA atributy:

- `<main role="main">` s `aria-label="Herní aplikace"`
- `<nav aria-label="...">` pro navigaci a herní přepínače
- `<article aria-labelledby="...">` pro samostatné herní sekce
- `<section aria-labelledby="...">` pro obrazovky
- Modály: `role="dialog" aria-modal="true" aria-labelledby="..."`
- Emoji ikony: `aria-hidden="true"`
- Seznamy: `role="list"` + `role="listitem"` na položky
- `aria-live="polite"` pro dynamická oznámení
- `.sr-only` třída pro skryté nadpisy
- `prefers-reduced-motion` media query zakazuje všechny animace

---

## 🎨 Design a vizuální styl

- **Glassmorfismus**: Poloprůhledné panely s `backdrop-filter: blur() saturate()`, jemné světelné okraje a inset stíny pro hloubku.
- **Neonová paleta**: CSS proměnné `--neon-gold`, `--neon-purple`, `--neon-cyan`, `--neon-blue`, `--neon-pink`, `--neon-green`, `--neon-orange` s dynamickými glow efekty.
- **Typografie**: Google Fonts **Orbitron** (nadpisy, čísla) a **Outfit** (texty, UI).
- **3D tlačítka**: Mechanické spínače s tlustou spodní hranou, `translateY` na hover/active a neonovými stíny.
- **Retro efekt**: Idle pulzace, neonové kmitání (`initNeonFlicker`), zvukové efekty generované Web Audio API syntetizátorem.
- **Plná responzivita**: Optimalizováno pro mobil (na výšku) i desktop.

---

## 🎮 Hry

Aplikace obsahuje **6 her**, každá s vlastním herním modulem v `src/games/`:

| # | Název | ID | Popis |
|---|-------|----|-------|
| 1 | **Hádanka 1-10** | 1 | Mřížka čísel 1–10, náhodné výherní číslo, Výplata: **10× sázka** |
| 2 | **Hádanka 1-5** | 2 | Mřížka čísel 1–5, Výplata: **5× sázka** |
| 3 | **Kostka 1-6** | 3 | Výběr čísla 1–6, hod kostkou s GSAP shuffle animací, Výplata: **6× sázka** |
| 4 | **Ruleta 0-35** | 4 | Mřížka 0–36 s červenými/černými/zelenými políčky, Výplata: **36× sázka** |
| 5 | **Automat (Slots)** | 5 | 3 válce × 3 řady, 6 symbolů, 5 výherních linií, Jackpot na třech `7️⃣`, Výplata: **2× – 100×** podle symbolu |
| 6 | **Hi-Low** | 6 | Karty 1–10, tip VYŠŠÍ/NIŽŠÍ, dynamický koeficient `(9 / winningCards) × 0.95`, 3D flip animace karty |

### Herní tok
1. Vybrání hry z hub obrazovky → zobrazí se 2s animovaný splash → herní obrazovka.
2. Nastavení sázky (předvolená tlačítka 10/20/50/100/ALL-IN + custom slider).
3. Kliknutí na SPIN/START → okamžité odečtení sázky z balance, uzamčení ovládání.
4. Dokončení hry → přidání výhry, uložení zápasu, kontrola milníků, odeslání na Firebase, animace výsledku.
5. Při vyrovnání balance `≤ 0` → zobrazení bankrotní obrazovky.

---

## 🛠️ Tech Stack

- **Build**: Vite 6 (ES modules, sourcemaps, GitHub Pages base path `/GAMBLE-HUB/`)
- **Styling**: Tailwind CSS v4 + vlastní CSS vrstvy `@layer components` / `@layer utilities`
- **Animace**: GSAP 3 — slot válce, kartové otočení, mřížkové rolování, screen přechody
- **UI efekty**: SweetAlert2 (dialogy), Canvas Confetti (výherní efekty), Chart.js (statistiky)
- **Backend sync**: Firebase Firestore (globální žebříček, historie zápasů, návštěvy)
- **Audio**: Web Audio API (vlastní syntetizátor bez audio souborů)
- **Ikony**: Lucide (referencováno v package.json)
- **PWA**: Web App Manifest (`public/manifest.json`)

---

## 📂 Architektura projektu

```
├── .github/workflows/deploy.yml   # GitHub Actions CD
├── public/
│   └── manifest.json               # PWA manifest
│   └── sounds/                     # Audio soubory (sfx + bgm)
│   └── sw.js                       # Service Worker
├── src/
│   ├── main.js                     # Entry point – inicializace, splash, návštěvy
│   ├── games.js                    # GameManager – orchestrátor sázek, autoplay, UI lock
│   ├── ui.js                       # GameUI – obrazovky, modály, animace výsledků
│   ├── db.js                       # GameDatabase – LocalStorage CRUD, milníky, import/export
│   ├── api.js                      # API – Firebase Firestore sync (leaderboard, matches, visits)
│   ├── sound.js                    # SoundManager – Web Audio API syntetizátor + file-based audio
│   ├── soundIndex.js                # Sound asset registry (SOUND_ASSETS, BGM_TRACKS)
│   ├── utils.js                    # Utility – formátování velkých čísel, zkratky, escapeHtml, COIN_SVG
│   ├── games/
│   │   ├── slots.js                # SlotMachineGame – 3x3 mřížka, 5 linií, GSAP spin
│   │   ├── hilo.js                 # HiloGame – Hi-Lo karta, 3D flip, dynamický koeficient
│   │   ├── guessing.js             # GuessingGame – číselné mřížky (Hádanka, Ruleta)
│   │   └── dice.js                 # DiceGame – kostka 1-6, shuffle animace
│   ├── ui/
│   │   ├── Leaderboard.js          # Žebříček hráčů (top 5, medaile)
│   │   ├── Explorer.js             # Globální historie a leaderboard s filtry/sortem
│   │   ├── Stats.js                # Statistiky hráče, win-rate, posledních 10 zápasů
│   │   ├── Accounts.js             # Správa účtů (výběr, smazání)
│   │   ├── DeleteConfirm.js        # Dialog pro potvrzení smazání účtu
│   │   ├── BetSlider.js            # Custom logaritmický slider s hold-to-repeat
│   │   └── gameInfo.js             # GAME_INFOS – HTML obsah pro info panely
│   ├── events/
│   │   └── globalHandlers.js       # GlobalEventHandlers – window.* funkce z HTML onclick
│   ├── animations/
│   │   ├── buttons.js              # GSAP entrance animace tlačítek
│   │   ├── infoToggle.js           # Neónové kmitání, idle pulzace, screen přechody info panelu
│   │   └── ui.js                   # Neónové kmitání, idle pulzace, screen přechody, border glow
│   └── css/
│       ├── main.css                # Entry point – importuje všechny CSS vrstvy
│       ├── tailwind.css            # Tailwind v4 @theme s neon paletou
│       ├── _variables.css          # CSS custom properties (barvy, glow, shadow)
│       ├── _reset.css              # Základní reset, scrollbar, body pozadí
│       ├── _typography.css         # Fonty, nadpisy, neon text utility, .sr-only
│       ├── _layout.css             # Screen state management, @media queries
│       ├── _buttons.css            # 3D tlačítka – massive component v @layer components
│       ├── _panels.css             # Modály, info panely, status box, toast pozice
│       ├── _slot.css               # Slot machine – glass panel, reel glow, symbol glows
│       ├── _hilo.css               # Hi-Lo karta – 3D preserve-3d, flip animace
│       └── _dice.css               # Dice frame – sheen animace, win glow
├── index.html                      # Hlavní šablona – sémantické tagy, screeny, modály
└── package.json                    # Závislosti a skripty
```

---

## 💾 Databáze a ukládání

### LocalStorage klíče
| Klíč | Formát | Popis |
|------|--------|-------|
| `c_uziv` | `{ username: balance }` | Uživatelé a jejich zůstatky (startovní 500) |
| `c_stat` | `{ username: { vyhry, prohry, historie: string[] } }` | Statistiky, historie omezena na 10 záznamů |
| `c_scor` | `[{ jmeno, castka }]` | Leaderboard – pouze nejvyšší skóre na hráče |
| `c_mute` | `"true"` / `"false"` | Stav ztlumení zvuku |
| `c_music_mute` | `"true"` / `"false"` | Stav ztlumení hudby |
| `c_theme` | `"cyan"` / absent | Barevné téma |

### Firebase (volitelné, global sync)
- `leaderboard/{username}` – `{ castka, updatedAt }`
- `matches/{autoId}` – `{ username, gameName, bet, resultText, isWin, winAmount, timestamp }`
- `visits/{ip}` – `{ count }` – návštěvy podle IP

---

## 🎯 Klíčové vlastnosti

- **Multiplayer global leaderboard** přes Firebase Firestore
- **Autoplay** – automatické točení slotů (700ms interval, zastaví se při nedostatku balance)
- **PWA** – instalovatelná aplikace s manifestem
- **Import / Export dat** – JSON záloha všech LocalStorage dat
- **Visit counter** – sledování unikátních návštěv přes ipify.org
- **Bankrot systém** – "Čistá Kasa" obrazovka při vyrovnání balance na 0
- **Milníky** – automatický zápis do leaderboardu při překonání osobního rekordu

---

## 📱 CSS architektura

- **Tailwind v4 utilities** v `tailwind.css` – flex, grid, spacing, responzivita
- **CSS proměnné** v `_variables.css` – neon paleta, glow RGBA, gradienty
- **Komponenty** v `_buttons.css`, `_panels.css`, `_slot.css`, `_hilo.css`, `_dice.css` – komplexní efekty v `@layer components`
- Layout utility přesunuty z `_layout.css` do Tailwind tříd v HTML

---

## 🛠️ Lokální spuštění

```bash
npm install
npm run dev
```

Aplikace se otevře na `http://localhost:5173`.

### Firebase pro vývoj
Pro lokální vývoj s Firebase zkopírujte `.env.example` do `.env` a vyplňte vlastní Firebase konfiguraci. `.env` je v `.gitignore` a nebude commitován.

### Skripty
| Příkaz | Popis |
|--------|-------|
| `npm run dev` | Vývojový server (Vite) |
| `npm run build` | Produkční build do `dist/` |
| `npm run preview` | Náhled production buildu |
| `npm run lint` | ESLint kontrola |
| `npm run lint:fix` | ESLint automatické opravy |
| `npm run format` | Prettier formátování |
| `npm run deploy` | Commit + push na `main` (pro GitHub Pages) |

---

## 🌐 Nasazení na GitHub Pages

Projekt obsahuje GitHub Actions workflow (`.github/workflows/deploy.yml`), který automaticky sestaví a nasadí aplikaci při každém push do větve `main`.

### Nastavení:
1. V repozitáři **Settings → Pages** nastavte **Source** na **GitHub Actions**.
2. V repozitáři **Settings → Secrets and variables → Actions** vytvořte následující secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
3. Pushněte do `main`. GitHub automaticky zkompiluje projekt a nasadí ho na:
   `https://314pap.github.io/GAMBLE-HUB/`

---

## 📋 Dodatečné dokumentace

- `STYLE_DOC.md` – detailní popis CSS architektury a design tokenů
- `docs/visual_guideline.md` – neměnné vizuální pravidla (CRT glass, 3D tlačítka, audio-vizuální život)
- `AGENTS.md` – instrukce pro autonomní agenty pracující na projektu
# rebuild
