# 🎰 Neon Gamble Club

Vítejte v **Neon Gamble Club** – modernizované, vysoce estetické a plně responzivní webové herní platformě. Tento projekt vznikl kompletním refaktoringem původní hry (která je bezpečně uchována v souboru `index3.html`) do podoby moderní modulární JavaScriptové aplikace běžící na build nástroji Vite a využívající prémiové animační a UI knihovny z ekosystému npm.

---

## 🎨 Design a vizuální styl (Rich Aesthetics)

Původní jednoduchý neonový design byl povýšen na prémiový zážitek inspirovaný rozhraním moderních luxusních kasin:
- **Glassmorfismus**: Všechny herní panely a obrazovky využívají poloprůhledné pozadí s rozostřením (`backdrop-filter`) a jemnými světelnými okraji, což vytváří hloubku a prémiový kontrast.
- **Neonová barevná paleta**: Pečlivě vybrané neonové odstíny (oranžová, zelená, růžová, modrá a zlatá) s dynamickými stíny a pulzujícími zářemi na tmavém radiálním pozadí.
- **Prémiová typografie**: Integrace moderních Google Fonts – **Orbitron** pro herní nadpisy a retro-arcade styl a **Outfit** pro perfektně čitelné texty a UI prvky.
- **Plná responzivita**: Rozhraní je optimalizováno pro mobilní zařízení (na výšku) i stolní počítače.
- **Plovoucí oznámení (Win-Toast)**: Výsledky hry se nyní nezobrazují ve statickém elementu (který natahoval výšku aplikace), ale v absolutně napoziciovaném glassmorphic panelu (toastu), který se plynule vysune zespodu pomocí GSAP, chvíli visí nad ovládacími prvky a automaticky sjede dolů a zmizí. Vhodné pro telefony s omezenou výškou.

---

## 🚀 Klíčové změny a použité knihovny (Refaktoring)

Všechny zastaralé animace a nativní prohlížečové dialogy byly kompletně přepsány s využitím moderních npm knihoven:

1. **GSAP (GreenSock Animation Platform)**:
   - **Sloty (Bary 3x3)**: Původní okamžité přepínání emotikonů bylo nahrazeno fyzikálním mechanismem rotujících válců. Válce se roztáčí postupně (stagger efekt), během rotace se na ně aplikuje rychlostní rozostření (blur filtr) a zastavují se s jemným odpružením (bounce-back).
   - **Více / Méně (Hi-Lo)**: Hra využívá plně 3D rotaci karty. Při sázce se karta otočí rubem nahoru (`180deg` Y-osa), na pozadí se vygeneruje nové číslo a karta se otočí lícem zpět se spring efektem.

2. **SweetAlert2**:
   - Nahradil standardní systémové alerty (`alert()`) a konfirmace (`confirm()`) za plně přizpůsobené, animované dialogy a modální okna v temném neonovém stylu, které neruší herní flow.

3. **Chart.js**:
   - V modálním okně statistik se nyní zobrazuje interaktivní prstencový graf (doughnut chart) poměru výher a proher konkrétního hráče s responzivní legendou a neonovým zbarvením.

4. **Canvas Confetti**:
   - Při výhře vystřelí barevné konfety. U běžné výhry jde o rychlý středový výstřel, při trefení Jackpolu (trefení tří sedmiček `7️⃣`) se spustí masivní ohňostrojová kaskáda konfet po stranách obrazovky.

5. **Web Audio API (Syntetizované zvukové efekty)**:
   - Integrován vlastní zvukový syntezátor [sound.js](file:///Users/pipap/projects/gamblehub/src/sound.js). Tóny a efekty (arpeggia, točení slotů, otočení karty Hi-Lo, fanfára jackpotu a klesající tón bankrotu) jsou generovány dynamicky.
   - V pravém horním rohu je umístěno plovoucí tlačítko 🔊/🔇 dostupné ve všech obrazovkách. Stav ztlumení se ukládá do LocalStorage a kliknutí na jakékoliv interaktivní tlačítko přehraje tichý klik.

---

## 📂 Architektura projektu

Aplikace byla rozdělena do logických modulů (Separation of Concerns):

```
├── .github/workflows/deploy.yml   # GitHub Actions pro automatické nasazení
├── src/
│   ├── games/
│   │   ├── slots.js               # Logika a GSAP animace slotů (Bary 3x3)
│   │   ├── hilo.js                # Logika a 3D animace otáčení karet pro Hi-Lo
│   │   └── guessing.js            # Logika číselných her (Ruleta, Kostka, atd.) s efektem točení
│   ├── db.js                      # Databázová vrstva (LocalStorage, hráči, statistiky, import/export)
│   ├── sound.js                   # Zvukový syntezátor (Web Audio API, mute stav)
│   ├── ui.js                      # UI manažer (obrazovky, modály, grafy, konfety a SweetAlert)
│   ├── games.js                   # Hlavní orchestrátor sázek, autoplay režimu a her
│   ├── style.css                  # Kompletní stylový předpis s neon design systémem
│   └── main.js                    # Vstupní bod, inicializace a globální provázání eventů
├── index.html                     # Hlavní vstupní HTML šablona pro Vite
├── index3.html                    # Původní verze hry (zachována bokem jako záloha)
├── package.json                   # Konfigurace závislostí a skriptů
└── vite.config.js                 # Konfigurace sestavení Vite
```

---

## 🛠️ Lokální spuštění

Pro spuštění projektu na svém počítači postupujte následovně:

1. **Instalace závislostí**:
   ```bash
   npm install
   ```

2. **Spuštění vývojového serveru**:
   ```bash
   npm run dev
   ```
   Projekt se otevře na adrese `http://localhost:5173`.

3. **Sestavení produkční verze**:
   ```bash
   npm run build
   ```
   Tento příkaz vytvoří optimalizovanou složku `dist/` připravenou k nasazení.

---

## 🌐 Nasazení na GitHub Pages (GitHub Actions)

Projekt obsahuje předpřipravený CI/CD workflow, který aplikaci automaticky nasadí při každém pushnutí do větve `main`.

### Nastavení na GitHubu:
1. Otevřete nastavení vašeho repozitáře na GitHubu: **Settings** -> **Pages**.
2. V sekci **Build and deployment** změňte **Source** na **GitHub Actions**.
3. Pushněte kód do větve `main`. GitHub automaticky spustí akci, která zkompiluje projekt a nasadí ho na adresu:
   `https://314pap.github.io/GAMBLE-HUB/`

---

## 💾 Záloha logiky
Pokud byste potřebovali nahlédnout do původní monolitické verze kódu nebo obnovit původní chování hry, soubor **`index3.html`** zůstal zcela nedotčen a slouží jako reference původní herní logiky.
