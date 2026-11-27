export const GAME_INFOS = {
  2: {
    title: "Hádanka 1-5",
    html: "<p>Vyberte si libovolné číslo v rozmezí <strong>1 až 5</strong> a vsaďte si.</p><ul><li><strong>Cíl hry:</strong> Uhodnout náhodně vylosované číslo.</li><li><strong>Výhra:</strong> <strong>5násobek (5x)</strong> vsazené částky.</li></ul>",
  },
  3: {
    title: "Kostka 1-6",
    html: "<p>Vyberte si libovolné číslo v rozmezí <strong>1 až 6</strong> a vsaďte si.</p><ul><li><strong>Cíl hry:</strong> Uhodnout hozené číslo na hrací kostce.</li><li><strong>Výhra:</strong> <strong>6násobek (6x)</strong> vsazené částky.</li></ul>",
  },
  4: {
    title: "Ruleta 0-35",
    html: "<p>Vyberte si libovolné číslo v rozmezí <strong>0 až 35</strong> nebo některou z <strong>vedlejších sázek</strong>.</p><ul><li><strong>Přímé číslo:</strong> <strong>35násobek (35x)</strong> vsazené částky.</li><li><strong>Červená / Černá, Sudá / Lichá, 1–18 / 19–35:</strong> <strong>2násobek (2x)</strong> (nula 0 prohrává).</li><li><strong>Tucty (1–12, 13–24, 25–35):</strong> <strong>3násobek (3x)</strong>.</li></ul>",
  },
  5: {
    title: "AUTOMAT",
    html: '<p>Tříválcový výherní automat s 3 viditelnými symboly na každém válci a <strong>5 výherními liniemi</strong> (3 horizontální, 2 diagonální).</p><ul><li><strong>Jak hrát:</strong> Nastavte sázku a stiskněte <strong>SPIN</strong>, případně zapněte režim <strong>AUTO</strong>.</li><li><strong>Cíl hry:</strong> Získat 3 stejné symboly v jakékoli výherní linii.</li><li><strong>Výplatní tabulka (násobiče):</strong></li></ul><table class="game-info-table"><tr><th>Symbol</th><th>Výhra</th></tr><tr class="win-row"><td>🍒 Třešeň</td><td>2x sázka</td></tr><tr class="win-row"><td>🔔 Zvonek</td><td>5x sázka</td></tr><tr class="win-row"><td>🍋 Citron</td><td>8x sázka</td></tr><tr class="win-row"><td>⭐ Hvězda</td><td>15x sázka</td></tr><tr class="win-row"><td>💎 Diamant</td><td>30x sázka</td></tr><tr class="jackpot-row"><td>7️⃣ Sedmička</td><td>100x sázka (JACKPOT)</td></tr></table>',
  },
  6: {
    title: "HI-LOW",
    html: "<p>Karetní hra, kde hádáte, jestli bude další karta <strong>vyšší</strong> nebo <strong>nižší</strong> než ta aktuální. Karty mají hodnoty <strong>od 1 do 10</strong>.</p><ul><li><strong>Jak hrát:</strong> Vyberte <strong>VYŠŠÍ ▲</strong> nebo <strong>NIŽŠÍ ▼</strong> a potvrďte sázku.</li><li><strong>Výplata:</strong> Čím rizikovější váš tip, tím vyšší <strong>násobek</strong>. Série výher násobí kurz — kdykoli můžete dát <strong>VYBRAT</strong>.</li></ul>",
  },
  7: {
    title: "MINY 5×5",
    html: "<p>Odkrývejte bezpečná pole na mřížce <strong>5×5</strong> a vyhněte se skrytým minám.</p><ul><li><strong>1. Počet min:</strong> Nad herní mřížkou vyberte <strong>1, 3, 5 nebo 10</strong> min — více min znamená vyšší násobitel za každé odkryté pole.</li><li><strong>2. Start &amp; Odkrývání:</strong> Nastavte sázku, klikněte na <strong>START HRY</strong> a postupně otvírejte políčka.</li><li><strong>3. Cash Out:</strong> Kdykoli po odkrytí alespoň 1 bezpečného pole můžete kliknout na <strong>VYBRAT</strong> a připsat si výhru.</li></ul>",
  },
  8: {
    title: "CRASH",
    html: "<p>Sledujte stoupající násobitel od <strong>1.00×</strong> a vyberte svou výhru dřív, než raketa spadne.</p><ul><li><strong>Jak hrát:</strong> Nastavte sázku, klikněte na <strong>START</strong> a v pravý čas stiskněte <strong>VYBRAT</strong>.</li><li><strong>Výhra:</strong> Váš zisk je sázka vynásobená aktuálním kurzem (až <strong>100×</strong>). Pokud nestihnete vybrat před pádem, sázka propadá.</li></ul>",
  },
  9: {
    title: "BLACKJACK",
    html: "<p>Klasická karetní hra proti krupiérovi. Cílem je přiblížit se součtu <strong>21</strong> více než krupiér, ale nepřekročit ho.</p><ul><li><strong>Hit:</strong> Vezmete si další kartu.</li><li><strong>Stand:</strong> Zůstanete stát a hraje krupiér (táhne do 17).</li><li><strong>Double:</strong> Zdvojnásobíte sázku a dostanete přesně jednu kartu.</li><li><strong>Výplata:</strong> Běžná výhra <strong>2×</strong>, Blackjack (21 z prvních 2 karet) <strong>2.5×</strong>, remíza (Push) vrací sázku.</li></ul>",
  },
  10: {
    title: "KOLO ŠTĚSTÍ",
    html: "<p>Vyberte si úroveň rizika a roztočte kolo! Vyšší riziko znamená vyšší násobky až <strong>10×</strong>.</p><ul><li><strong>Nízké:</strong> Časté výhry 1.2× – 2×.</li><li><strong>Střední:</strong> Vyvážené výhry až 3×.</li><li><strong>Vysoké:</strong> Vzácné, ale obří trefy 5× a 10×.</li></ul>",
  },
};
