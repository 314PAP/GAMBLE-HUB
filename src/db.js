// Database manager using LocalStorage to keep track of players, stats and leaderboard

export class GameDatabase {
  constructor() {
    this.uzivatele = JSON.parse(localStorage.getItem('c_uziv')) || {};
    this.statistiky = JSON.parse(localStorage.getItem('c_stat')) || {};
    this.scoreTable = JSON.parse(localStorage.getItem('c_scor')) || [];
  }

  saveAll() {
    localStorage.setItem('c_uziv', JSON.stringify(this.uzivatele));
    localStorage.setItem('c_stat', JSON.stringify(this.statistiky));
    localStorage.setItem('c_scor', JSON.stringify(this.scoreTable));
  }

  getPlayers() {
    return this.uzivatele;
  }

  getStats(username) {
    return this.statistiky[username] || { vyhry: 0, prohry: 0, historie: [] };
  }

  getLeaderboard() {
    // Odstranění duplicit – pro každého hráče zachováme jen to nejvyšší zaznamenané skóre
    const maxScores = {};
    this.scoreTable.forEach(record => {
      if (!maxScores[record.jmeno] || maxScores[record.jmeno] < record.castka) {
        maxScores[record.jmeno] = record.castka;
      }
    });

    // Převedeme zpět na pole a seřadíme od nejvyššího
    const uniqueLeaderboard = Object.keys(maxScores).map(jmeno => ({
      jmeno,
      castka: maxScores[jmeno]
    }));

    return uniqueLeaderboard.sort((a, b) => b.castka - a.castka);
  }

  createPlayer(username) {
    if (!username) return { success: false, message: 'Jméno nesmí být prázdné!' };
    if (username.includes(';') || username.includes(',')) {
      return { success: false, message: 'Jméno obsahuje nepovolené znaky!' };
    }
    if (this.uzivatele[username] !== undefined) {
      return { success: false, message: 'Tento hráč už existuje!' };
    }

    this.uzivatele[username] = 100;
    this.statistiky[username] = { vyhry: 0, prohry: 0, historie: [] };
    this.saveAll();
    return { success: true };
  }

  deletePlayer(username) {
    if (this.uzivatele[username] !== undefined) {
      delete this.uzivatele[username];
      delete this.statistiky[username];
      this.scoreTable = this.scoreTable.filter(i => i.jmeno !== username);
      this.saveAll();
      return true;
    }
    return false;
  }

  getPlayerBalance(username) {
    return this.uzivatele[username] || 0;
  }

  updatePlayerBalance(username, amount) {
    if (this.uzivatele[username] !== undefined) {
      this.uzivatele[username] = Math.max(0, amount);
      this.saveAll();
    }
  }

  recordMatch(username, gameName, bet, resultText, isWin) {
    if (!this.statistiky[username]) {
      this.statistiky[username] = { vyhry: 0, prohry: 0, historie: [] };
    }
    
    if (isWin) {
      this.statistiky[username].vyhry++;
    } else {
      this.statistiky[username].prohry++;
    }

    const matchString = `${gameName} (${bet} Kč) – ${isWin ? 'VÝHRA' : 'PROHRA'}`;
    this.statistiky[username].historie.unshift(matchString);
    this.statistiky[username].historie = this.statistiky[username].historie.slice(0, 10); // Keep last 10 records for better stats
    this.saveAll();
  }

  checkMilestones(username, oldBalance, newBalance) {
    // Už nepotřebujeme specifické milníky, prostě si pamatujeme nejvyšší skóre nad 100 Kč (což je starting balance)
    if (newBalance > 100) {
      // Zjistíme, jestli hráč už v tabulce má záznam
      const existingRecordIndex = this.scoreTable.findIndex(r => r.jmeno === username);
      
      if (existingRecordIndex !== -1) {
        // Hráč už je v tabulce, aktualizujeme pouze pokud je nové skóre vyšší
        if (newBalance > this.scoreTable[existingRecordIndex].castka) {
          this.scoreTable[existingRecordIndex].castka = newBalance;
          this.saveAll();
        }
      } else {
        // Úplně nový rekordman
        this.scoreTable.push({ jmeno: username, castka: newBalance });
        this.saveAll();
      }
    }
  }

  importData(dataObj) {
    try {
      if (dataObj.u && dataObj.s) {
        this.uzivatele = dataObj.u;
        this.statistiky = dataObj.s;
        this.scoreTable = dataObj.h || [];
        this.saveAll();
        return true;
      }
    } catch (e) {
      console.error('Import failed', e);
    }
    return false;
  }

  exportData() {
    return {
      u: this.uzivatele,
      s: this.statistiky,
      h: this.scoreTable
    };
  }
}
