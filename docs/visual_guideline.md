# Vizuální guideline – Gamble Hub (Herní automat design)

Tento dokument definuje **neměnné designové standardy** pro celou aplikaci. Všechny budoucí úpravy HTML, Tailwind tříd a CSS šablon MUSÍ respektovat tato pravidla.

---

## 1. EFEKT STARÉHO SKLA A CRT DISPLEJE

**Platí pro:** `.screen / .slot-machine / herní zóny / modální okná`

### Základní pravidla:
- Všechny herní plochy musí mít **temné, hluboké pozadí** (`#020205` s mírným vertikálním gradientem).
- Na pozadí vždy přidej **odlesk starého skla** (diagonální lineární gradient):
  ```css
  background-image:
    linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 50%),
    linear-gradient(180deg, #020205 0%, #0a0a12 100%);
  ```
- Přidej **vnitřní stín** (inset box-shadow) pro efekt zapuštěné obrazovky do plechového šasi:
  ```css
  box-shadow:
    inset 0 2px 20px rgba(0,0,0,0.8),
    inset 0 -2px 10px rgba(0,0,0,0.4),
    0 0 2px rgba(0,0,0,0.9);
  ```
- Hraniční rámeček musí být **tmavý metalický** (2-3px solid `#1a1a2e` nebo `rgba(255,215,0,0.2)`).
- Žádný plochý bg-gray-900. Žádný čistý bílý prostor uvnitř herního pole.

---

## 2. RETRO DIGITÁLNÍ KONTRAST (Texty, stavy, čísla)

**Platí pro:** Kredit, Výhra, Sázka, všechna čísla v ruletě/kostkách

### Základní pravidla:
- Všechny herní texty a čísla MUSÍ použít font **'Orbitron'** (font-black pro čísla).
- Každý důležitý text MUSÍ mít **brutální záři**:
  ```css
  text-shadow: 0 0 8px var(--glow-color), 0 0 16px var(--glow-color);
  ```
- Rozdělení barev čísel:
  - **Červená políčka ruleta:** `bg-red-900/40 border-red-500 text-red-400` + záře červená
  - **Černá políčka ruleta:** `bg-zinc-900 border-zinc-600 text-zinc-300` + záře šedá/cyan
  - **Nula (ZERO):** `bg-emerald-900/60 border-emerald-400 text-emerald-300` + záře zelená
- Sázkové tlačítka: zelená záře (aktivní) / modrá záře (sázky).
- Stavové řádky (Kredit/Výhra): zelená záře pro peníze, zlatá záře pro titles.
- **Základní barvy CSS proměnných:**
  ```
  --screen-glow-green: rgba(57, 255, 20, 0.5);
  --screen-glow-blue: rgba(0, 240, 255, 0.5);
  --screen-glow-gold: rgba(255, 215, 0, 0.5);
  --screen-glow-red: rgba(255, 0, 60, 0.5);
  ```

---

## 3. MECHANICKÁ 3D TLAČÍTKA JAKO NA AUTOMATECH

**Platí pro:** `.btn .btn-spin .btn-bet .btn-auto .btn-action`

### Základní pravidla:
- Tlačítka musí vypadat jako **robustní plastové spínače** zapuštěné do panelu.
- Musí mít **tlustou spodní hranu** simulující fyzickou hmatník:
  ```css
  box-shadow:
    0 6px 0 #000,           /* tlustá spodní hrana */
    0 8px 12px rgba(0,0,0,0.5),  /* stín pod tlačítkem */
    inset 0 1px 0 rgba(255,255,255,0.15),  /* vrchní odlesk */
    inset 0 -4px 8px rgba(0,0,0,0.4);     /* vnitřní stín */
  ```
- V **aktivním stavu** (:active) se tlačítko MUSÍ fyzicky "zatlačit":
  ```css
  transform: translateY(6px);
  box-shadow:
    0 1px 0 #000,
    0 2px 4px rgba(0,0,0,0.5),
    inset 0 1px 0 rgba(255,255,255,0.1),
    inset 0 -2px 4px rgba(0,0,0,0.5);
  ```
- SPIN tlačítko: **jedovatě zelené**, vysoká světelná intenzita.
- Sázkové tlačítka (10/20/50/100): **modro-cyan** záře, slabší než SPIN.
- Neaktivní tlačítka: `opacity: 0.4`, žádná záře.
- Hover stav: `translateY(-2px)`, zesílení záře, zvýšení box-shadow.
- Min. šířka tlačítek: **50px**, výška: **38px**, border-radius: **10-12px**.
- Tlačítka NESMÍ být ploché, průhledné nudle s jedinou 1px border.

---

## 4. AUDIO-VIZUÁLNÍ ŽIVOT (Blikání a zvuky)

**Platí pro:** Všechny herní prvky, UI panely, hlavní nápisy

### Základní pravidla:
- **KAŽDÉ kliknutí** tlačítka, roztočení, nebo přepnutí menu → volání `sound.playClick()`.
- Hlavní **neonové nápisy** musí mít `initNeonFlicker()` – jemné, nepravidelné kmitání opacity (simuluje starou neonovou trubici).
- Při **výhře**: `initPulseWin()` – rychlé pulzování záře na výherních číslech/symbolech, přidání `animateSlotWin()`.
- V nečinnosti (`idle`) musí stroj **jemně pulzovat** – např. pomalejší pulzace na SPIN tlačítku nebo jemné záření herní plochy.
- Po roztočení válců (`SPIN`) musí jít `sound.playSpin()`.
- Při výhře (`WIN`) → `sound.playWin()`, při jackpotu → `sound.playJackpot()`.
- Při prohře → `sound.playLoss()`.
- Při bankrotu → `sound.playBroke()`.
- **Zvuk MUSÍ být integrován přímo do herní logiky** (games.js, slots.js), NEZÁVISLE na tom, zda uživatel kliknul nebo ne — roztočení = zvuk.

---

## 5. IMPLEMENTAČNÍ PŘEDPISY

### Pořadí změn:
1. Vždy nejprve tato dokumentace (`docs/visual_guideline.md`).
2. Úpravy CSS v tomto pořadí: `_variables.css` → `_layout.css` → `_slot.css` → `_components.css` → `_hilo.css` → `guessing styles`.
3. Poté úpravy HTML (`index.html`) – preferuj Tailwind v4 utility třídy pro rychlé úpravy, custom CSS pro komplexní efekty.
4. Nakonec úpravy JS (`main.js`, `games/*.js`, `animations/ui.js`).

### Tailwind v4Utilities k použití:
- `bg-[#020205]` – temné herní pozadí
- `border-2 border-[#1a1a2e]` – metalický rámeček
- `shadow-[inset_0_2px_20px_rgba(0,0,0,0.8)]` – zapuštěný stín
- `text-shadow-[0_0_8px_var(--glow-color)]` – neonová záře
- `font-['Orbitron'] font-black` – retro digitální font
- `active:translate-y-[6px]` – mechanický stisk

### ZÁKAZ:
- Žádné `bg-gray-900` uvnitř herních zón.
- Žádné `text-gray-400` pro důležitá čísla.
- Žádné ploché tlačítka bez 3D stínu.
- Žádné tlačítko bez zvuku při kliknutí.
- Žádné animace bez cyklu (`repeat: 1` bez yoyo) – vše musí být nekonečné nebo plynulé.
