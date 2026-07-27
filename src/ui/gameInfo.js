export const GAME_INFOS = {
  1: {
    title: "Hádanka 1-10",
    html: '<p>Vyberte si libovolné číslo v rozmezí <strong>1 až 10</strong> a vsaďte si.</p><ul><li><strong>Cíl hry:</strong> Uhodnout náhodně vylosované číslo.</li><li><strong>Výhra:</strong> <strong>10násobek (10x)</strong> vsazené částky.</li></ul><div class="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)]"><button class="w-full py-2 px-3 text-xs font-bold text-[var(--neon-cyan)] border border-[rgba(255,255,255,0.1)] rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer" onclick="otevriAbbrevModal()">📊 Číselné zkratky</button></div>',
  },
  2: {
    title: "Hádanka 1-5",
    html: '<p>Vyberte si libovolné číslo v rozmezí <strong>1 až 5</strong> a vsaďte si.</p><ul><li><strong>Cíl hry:</strong> Uhodnout náhodně vylosované číslo.</li><li><strong>Výhra:</strong> <strong>5násobek (5x)</strong> vsazené částky.</li></ul><div class="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)]"><button class="w-full py-2 px-3 text-xs font-bold text-[var(--neon-cyan)] border border-[rgba(255,255,255,0.1)] rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer" onclick="otevriAbbrevModal()">📊 Číselné zkratky</button></div>',
  },
  3: {
    title: "Kostka 1-6",
    html: '<p>Vyberte si libovolné číslo v rozmezí <strong>1 až 6</strong> a vsaďte si.</p><ul><li><strong>Cíl hry:</strong> Uhodnout hozené číslo na hrací kostce.</li><li><strong>Výhra:</strong> <strong>6násobek (6x)</strong> vsazené částky.</li></ul><div class="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)]"><button class="w-full py-2 px-3 text-xs font-bold text-[var(--neon-cyan)] border border-[rgba(255,255,255,0.1)] rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer" onclick="otevriAbbrevModal()">📊 Číselné zkratky</button></div>',
  },
  4: {
    title: "Ruleta 0-36",
    html: '<p>Vyberte si libovolné číslo v rozmezí <strong>0 až 36</strong> na hracím poli a vsaďte si.</p><ul><li><strong>Cíl hry:</strong> Uhodnout vylosované číslo.</li><li><strong>Výhra:</strong> <strong>36násobek (36x)</strong> vsazené částky.</li></ul><div class="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)]"><button class="w-full py-2 px-3 text-xs font-bold text-[var(--neon-cyan)] border border-[rgba(255,255,255,0.1)] rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer" onclick="otevriAbbrevModal()">📊 Číselné zkratky</button></div>',
  },
  5: {
    title: "AUTOMAT",
    html: '<p>Tříválcový výherní automat s 3 viditelnými symboly na každém válci a <strong>5 výherními liniemi</strong> (3 horizontální, 2 diagonální).</p><ul><li><strong>Jak hrát:</strong> Nastavte sázku a stiskněte <strong>SPIN</strong>, případně zapněte režim <strong>AUTO</strong>.</li><li><strong>Cíl hry:</strong> Získat 3 stejné symboly v jakékoli výherní linii.</li><li><strong>Výplatní tabulka (násobiče):</strong></li></ul><table class="game-info-table"><tr><th>Symbol</th><th>Výhra</th></tr><tr class="win-row"><td>🍒 Třešeň</td><td>2x sázka</td></tr><tr class="win-row"><td>🔔 Zvonek</td><td>5x sázka</td></tr><tr class="win-row"><td>🍋 Citron</td><td>8x sázka</td></tr><tr class="win-row"><td>⭐ Hvězda</td><td>15x sázka</td></tr><tr class="win-row"><td>💎 Diamant</td><td>30x sázka</td></tr><tr class="jackpot-row"><td>7️⃣ Sedmička</td><td>100x sázka (JACKPOT)</td></tr></table><div class="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)]"><button class="w-full py-2 px-3 text-xs font-bold text-[var(--neon-cyan)] border border-[rgba(255,255,255,0.1)] rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer" onclick="otevriAbbrevModal()">📊 Číselné zkratky</button></div>',
  },
   6: {
     title: "HI-LOW",
     html: '<p>Kartická hra, kde hádáte, jestli bude další karta <strong>vyšší</strong> nebo <strong>nižší</strong> než ta aktuální. Karty mají hodnoty <strong>od 1 do 10</strong>.</p><ul><li><strong>Jak hrát:</strong> Vyberte <strong>VYŠŠÍ ▲</strong> nebo <strong>NIŽŠÍ ▼</strong> a potvrďte sázku.</li><li><strong>Výplata:</strong> Čím rizikovější váš tip, tím vyšší <strong>násobek</strong>. Vyhodnocení proběhne automaticky.</li></ul><div class="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)]"><button class="w-full py-2 px-3 text-xs font-bold text-[var(--neon-cyan)] border border-[rgba(255,255,255,0.1)] rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer" onclick="otevriAbbrevModal()">📊 Číselné zkratky</button></div>',
   },
};
