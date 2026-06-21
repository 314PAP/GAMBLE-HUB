# Gamble-Hub Style Guide & UI Dokumentace

Tento dokument slouží jako centrální reference pro design systém aplikace. Přecházíme na modulární systém pomocí **Tailwind CSS**, který zajišťuje konzistentní a responzivní design.

## 1. Barevná Paleta a Design Tokeny (Tailwind config)

Aplikace využívá tmavý, "glassmorphism" vzhled s výraznými neonovými akcenty, připomínající moderní cyberpunkové nebo herní UI.

### Základní barvy
* **Pozadí (Background):** Temně modrá/černá s gradientem (v Tailwindu dostupné přes speciální kontejnerové třídy nebo `bg-[#0a0a0f]`).
* **Panely (Panels):** Poloprůhledné černé vrstvy s blur efektem (`backdrop-blur`).
* **Text:** 
  * Primární: `#f5f5fa` (např. `text-white` s mírným ztmavením)
  * Sekundární: `#94a3b8` (Tailwind `text-slate-400` nebo `text-muted`)

### Neonové Akcenty (Custom Tailwind Colors)
V `tailwind.config.js` by měly být nadefinovány (nebo brzy budou) tyto specifické barvy pro tlačítka a zvýraznění:
* `neon-blue`: `#00f0ff`
* `neon-pink`: `#ff0055`
* `neon-green`: `#00ff99`
* `neon-orange`: `#ff5500`
* `neon-gold`: `#ffe600`

## 2. Hlavní UI Komponenty

Pro zachování čistoty HTML se používají Tailwind utility, ale opakující se složité struktury (jako prémiová tlačítka) jsou seskupeny v `style.css` pomocí direktivy `@apply`.

### Tlačítka (Buttons)
Základní tlačítko se vyvolá přidáním utility tříd. Pro složitější gradienty s neonovými stíny zachováváme třídy jako:
* `.btn-primary` (oranžové/červené tóny)
* `.btn-success` (zelené/tyrkysové tóny)
* `.btn-danger` (růžové/červené tóny)
* `.btn-info` (modré tóny)
* `.btn-gold` (zlaté prémiové tlačítko pro automaty)
* **Příklad použití v HTML:**
  ```html
  <button class="btn btn-primary w-full">Vstoupit</button>
  ```

### Herní Čísla (Number Grid)
Pro klasické hry (Ruleta, Hádanky) používáme plně responzivní CSS Grid.
* **Kontejner:** Převeden z fixního flexboxu na klasický CSS Grid v `#game-number-buttons` (s ohledem na počet čísel).
* **Tlačítka (`.btn-num`):** Čtvercová tlačítka (`aspect-ratio: 1`), která se dynamicky přizpůsobují šířce sloupce. 
* **Stavy tlačítek:** Třídy `.selected` a `.winning` mění barvu na `neon-blue` resp. `neon-green` a přidávají glow efekt (box-shadow).

### Hlavní Kontejner (Container)
Celá aplikace žije uvnitř hlavního wrapperu `.container` (případně Tailwind ekvivalentní utility):
* Původní maximální šířka 440px byla pro desktop rozšířena (např. `max-w-3xl`).
* Poskytuje `backdrop-filter: blur()`, `border` a vnitřní `overflow-y: auto`, aby herní prvky (zejména dlouhá ruleta) nelezly do spodní řídící lišty a daly se pohodlně scrollovat.

## 3. Responzivita
Aplikace funguje stylem **Mobile-First**.
Základní (bez prefixu) Tailwind třídy se aplikují na mobilní telefony. Prefixy `sm:`, `md:` a `lg:` se používají k rozšíření UI pro tablety a desktopy.
* **Typický příklad v ruletě:** Sázková tlačítka mají na mobilu `grid-cols-2`, na desktopu (od velikosti `sm:`) se roztáhnou na `sm:grid-cols-4`.

---
*Tento dokument bude průběžně doplňován a aktualizován tak, jak bude postupovat refaktoring směrem k čistému Tailwind CSS.*
