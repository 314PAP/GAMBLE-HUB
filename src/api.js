// api.js - Abstrakce pro budoucí online připojení (Leaderboards, Účty)
// V současnosti využívá lokální db.js jako fallback. Později se zde napojí fetch/axios.

export class API {
  constructor(localDb) {
    this.db = localDb;
    this.isOnline = false; // Příznak, zda používáme reálný server
    this.baseUrl = 'https://api.gamblehub.example.com';
  }

  // Získá globální leaderboard (zatím lokální)
  async getGlobalLeaderboard() {
    if (this.isOnline) {
      try {
        const response = await fetch(`${this.baseUrl}/leaderboard`);
        return await response.json();
      } catch (e) {
        console.error('Failed to fetch global leaderboard', e);
        return this.db.getLeaderboard(); // fallback
      }
    } else {
      return Promise.resolve(this.db.getLeaderboard());
    }
  }

  // Odešle skóre hráče na server
  async submitScore(username, balance) {
    if (this.isOnline) {
      try {
        await fetch(`${this.baseUrl}/score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, balance })
        });
      } catch (e) {
        console.error('Failed to submit score', e);
      }
    }
    // V lokálním DB se skóre už ukládá jinde (savePlayers), ale sem by se dal přidat lokální sync
    return Promise.resolve(true);
  }
}
