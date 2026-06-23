export const GAME_INFOS = {
  1: {
    title: "Hádanka 1-10",
    html: `
      <p>Vyberte si libovolné číslo v rozmezí <strong>1 až 10</strong> a vsaďte si.</p>
      <ul>
        <li><strong>Cíl hry:</strong> Uhodnout náhodně vylosované číslo.</li>
        <li><strong>Výhra:</strong> <strong>10násobek (10x)</strong> vsazené částky.</li>
      </ul>
    `
  },
  2: {
    title: "Hádanka 1-5",
    html: `
      <p>Vyberte si libovolné číslo v rozmezí <strong>1 až 5</strong> a vsaďte si.</p>
      <ul>
        <li><strong>Cíl hry:</strong> Uhodnout náhodně vylosované číslo.</li>
        <li><strong>Výhra:</strong> <strong>5násobek (5x)</strong> vsazené částky.</li>
      </ul>
    `
  },
  3: {
    title: "Kostka 1-6",
    html: `
      <p>Vyberte si libovolné číslo v rozmezí <strong>1 až 6</strong> a vsaďte si.</p>
      <ul>
        <li><strong>Cíl hry:</strong> Uhodnout hozené číslo na hrací kostce.</li>
        <li><strong>Výhra:</strong> <strong>6násobek (6x)</strong> vsazené částky.</li>
      </ul>
    `
  },
  4: {
    title: "Ruleta 0-36",
    html: `
      <p>Vyberte si libovolné číslo v rozmezí <strong>0 až 36</strong> na hracím poli a vsaďte si.</p>
      <ul>
        <li><strong>Cíl hry:</strong> Uhodnout vylosované číslo.</li>
        <li><strong>Výhra:</strong> <strong>36násobek (36x)</strong> vsazené částky.</li>
      </ul>
    `
  },
  5: {
    title: "AUTOMAT",
    html: `
      <p>Tříválcový výherní automat s 3 viditelnými symboly na každém válci a <strong>5 výherními liniemi</strong> (3 horizontální, 2 diagonální).</p>
      <ul>
        <li><strong>Jak hrát:</strong> Nastavte sázku a stiskněte <strong>SPIN</strong>, případně zapněte režim <strong>AUTO</strong>.</li>
        <li><strong>Cíl hry:</strong> Získat 3 stejné symboly v jakékoli výherní linii.</li>
        <li><strong>Výplatní tabulka (násobiče):</strong></li>
      </ul>
      <table class="game-info-table">
        <tr>
          <th>Symbol</th>
          <th>Výhra</th>
        </tr>
        <tr class="win-row"><td>🍒 Třešeň</td><td>2x sázka</td></tr>
        <tr class="win-row"><td>🛎 Zvonek</td><td>5x sázka</td></tr>
        <tr class="win-row"><td>🍋 Citron</td><td>8x sázka</td></tr>
        <tr class="win-row"><td>⭐ Hvězda</td><td>15x sázka</td></tr>
        <tr class="win-row"><td>💎 Diamant</td><td>30x sázka</td></tr>
        <tr class="jackpot-row"><td>7️⃣ Sedmička</td><td>100x sázka (JACKPOT)</td></tr>
      </table>
    `
  },
  6: {
    title: "HI-LOW",
    html: `
      <p>Karetní hra, ve které odhadujete hodnotu další karty. Hraje se s kartami s hodnotami <strong>od 1 do 10</strong>.</p>
      <ul>
        <li><strong>Začátek hry:</strong> Na začátku je vygenerována počáteční karta v rozmezí 2 až 9.</li>
        <li><strong>Jak hrát:</strong> Tipněte si, zda bude další karta <strong>VYŠŠÍ ▲</strong> nebo <strong>NIŽŠÍ ▼</strong> než ta aktuální.</li>
        <li><strong>Při shodě (stejná karta):</strong> Pokud má nová karta stejnou hodnotu, máte 50% šanci na výhru.</li>
        <li><strong>Výhra:</strong> <strong>2násobek (2x)</strong> vsazené částky při správném odhadu.</li>
      </ul>
    `
  }
};
