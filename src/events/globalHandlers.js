import { sound } from '../sound.js';

export class GlobalEventHandlers {
  constructor(db, api, ui, gm) {
    this.db = db;
    this.api = api;
    this.ui = ui;
    this.gm = gm;
    this._bindAll();
  }

  _bindAll() {
    window.otevriPrihlaseni = () => {
      this.ui.renderAccounts(
        (username) => window.prihlasitHrace(username),
        (username) => window.smazatUcet(username)
      );
      this.ui.showScreen('screen-select-user');
    };

    window.otevriRegistraci = () => {
      const regInput = document.getElementById('reg-name');
      if (regInput) regInput.value = '';
      
      this.ui.showScreen('screen-register');
      setTimeout(() => {
        if (regInput) regInput.focus();
      }, 100);
    };

    window.zpetDoMenu = () => {
      this.gm.stopAutoPlay();
      this.ui.showScreen('screen-login');
      this.ui.renderLeaderboard();
    };

    window.navratDoHubu = () => {
      this.gm.stopAutoPlay();
      const balance = this.db.getPlayerBalance(this.gm.currentPlayer);
      this.ui.updateMiniProfile(this.gm.currentPlayer, balance);
      this.ui.showScreen('screen-hub');
    };

    window.prihlasitHrace = (username) => {
      const balance = this.db.getPlayerBalance(username);
      if (balance <= 0) {
        this.gm.setCurrentPlayer(username);
        this.gm.triggerBrokeScreen();
        return;
      }
      this.gm.setCurrentPlayer(username);
      this.ui.updateMiniProfile(username, balance);
      this.ui.showScreen('screen-hub');
    };

window.smazatUcet = (username) => {
        this.ui.deleteConfirm.show(username, () => {
          const success = this.db.deletePlayer(username);
          if (success) {
            this.ui.showAlert('success', 'Účet smazán', `Hráč ${username} byl permanentně smazán.`);
            window.otevriPrihlaseni();
          } else {
            this.ui.showAlert('error', 'Chyba', 'Účet se nepodařilo smazat.');
          }
        });
      };

      window.zavriDeleteConfirm = () => {
        this.ui.deleteConfirm.hide();
      };

    window.potvrditRegistraci = () => {
      const regInput = document.getElementById('reg-name');
      if (!regInput) return;
      
      const username = regInput.value.trim();
      const res = this.db.createPlayer(username);
      if (res.success) {
        window.prihlasitHrace(username);
      } else {
        this.ui.showAlert('warning', 'Registrace se nezdařila', res.message);
      }
    };

    window.odhlasitSe = () => {
      this.gm.setCurrentPlayer(null);
      window.zpetDoMenu();
    };

    window.otevriDisclaimer = () => {
      const panel = document.getElementById('disclaimer-panel');
      if (panel) {
        panel.classList.remove('hidden');
        panel.classList.add('flex');
      }
    };

    window.zavriDisclaimer = () => {
      const panel = document.getElementById('disclaimer-panel');
      if (panel) {
        panel.classList.add('hidden');
        panel.classList.remove('flex');
      }
    };

    window.otevriInstalaciInfo = () => {
      const panel = document.getElementById('install-panel');
      if (panel) {
        panel.classList.remove('hidden');
        panel.classList.add('flex');
      }
    };

    window.zavriInstalaciInfo = () => {
      const panel = document.getElementById('install-panel');
      if (panel) {
        panel.classList.add('hidden');
        panel.classList.remove('flex');
      }
    };

    window.spustitHru = (gameId) => {
      this.gm.launchGame(gameId);
    };

    window.nastavSazku = (amount) => {
      this.gm.setBet(amount);
    };

    window.ukazVlastniSazku = () => {
      const area = document.getElementById('custom-sazka-area');
      if (!area) return;
      if (area.classList.contains('hidden')) {
        area.classList.remove('hidden');
        const input = document.getElementById('game-sazka');
        if (input) {
          input.value = '';
          input.focus();
        }
      } else {
        area.classList.add('hidden');
      }
    };

    window.potvrditVlastniSazku = () => {
      const input = document.getElementById('game-sazka');
      if (!input) return;
      
      let rawText = input.value.trim().toLowerCase().replace(/\s+/g, '').replace(',', '.');
      if (!rawText) {
        this.ui.showAlert('warning', 'Chybná sázka', 'Zadejte platnou částku!');
        return;
      }

      let multiplier = 1;
      const suffixes = [
        { key: 'qd', val: 1e27 },
        { key: 'q',  val: 1e24 },
        { key: 'td', val: 1e21 },
        { key: 't',  val: 1e18 },
        { key: 'bld',val: 1e15 },
        { key: 'b',  val: 1e12 },
        { key: 'mld',val: 1e9 },
        { key: 'm',  val: 1e6 },
        { key: 'k',  val: 1e3 }
      ];

      for (let i = 0; i < suffixes.length; i++) {
        if (rawText.endsWith(suffixes[i].key)) {
          multiplier = suffixes[i].val;
          rawText = rawText.slice(0, -suffixes[i].key.length);
          break;
        }
      }

      const numVal = parseFloat(rawText);
      if (isNaN(numVal) || numVal <= 0) {
        this.ui.showAlert('warning', 'Chybná sázka', 'Zadejte platnou kladnou částku (např. 100, 1.5k, 10m)!');
        return;
      }

      const finalBet = Math.round(numVal * multiplier);
      this.gm.setBet(finalBet);
      const area = document.getElementById('custom-sazka-area');
      if (area) area.classList.add('hidden');
    };

    window.hodKostkami = () => {
      this.gm.playDiceGame();
    };

    window.kliknutoCislo = (num) => {
      if (this.gm.activeGameId === 5) {
        this.gm.playSlots();
      } else {
        const maxVal = this.gm.activeGameId === 1 ? 10 : (this.gm.activeGameId === 2 ? 5 : (this.gm.activeGameId === 3 ? 6 : 36));
        const minVal = this.gm.activeGameId === 4 ? 0 : 1;
        const multVal = this.gm.activeGameId === 1 ? 10 : (this.gm.activeGameId === 2 ? 5 : (this.gm.activeGameId === 3 ? 6 : 36));
        const gameLabel = this.gm.activeGameId === 1 ? "Hádanka 1-10" : (this.gm.activeGameId === 2 ? "Hádanka 1-5" : (this.gm.activeGameId === 3 ? "Kostka" : "Ruleta"));
        this.gm.playGuessingGame(num, minVal, maxVal, multVal, gameLabel);
      }
    };

    window.toggleAutoPlay = () => {
      this.gm.toggleAutoPlay();
    };

    window.hrajHiLo = (tip) => {
      this.gm.playHilo(tip);
    };

    window.otevriStatsModal = () => {
      if (this.gm.currentPlayer) {
        this.ui.openStatsModal(this.gm.currentPlayer);
      }
    };
    window.zavriStatsModal = () => {
      this.ui.closeStatsModal();
    };

    window.otevriExplorer = () => {
      this.ui.openExplorer();
    };
    window.zavriExplorer = () => {
      this.ui.closeExplorer();
    };
    window.prepniExplorerTab = (tabName) => {
      this.ui.prepniExplorerTab(tabName);
    };
    window.filtrujLeaderboard = () => {
      this.ui.filtrujLeaderboard();
    };
    window.filtrujHistorii = () => {
      this.ui.filtrujHistorii();
    };
    window.seradHistorii = (columnName) => {
      this.ui.seradHistorii(columnName);
    };

    window.toggleInfoPanel = () => {
      this.ui.toggleInfoPanel(this.gm.activeGameId);
    };
    window.zavriInfoPanel = () => {
      this.ui.zavriInfoPanel();
    };

    window.exportovatData = () => {
      const data = this.db.exportData();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
      const link = document.createElement('a');
      link.setAttribute("href", dataStr);
      link.setAttribute("download", "gamblehub_data.json");
      document.body.appendChild(link);
      link.click();
      link.remove();
    };

    window.importovatData = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const success = this.db.importData(data);
          if (success) {
            this.ui.showAlert('success', 'Import úspěšný', 'Herní data byla úspěšně nahrána.');
            window.otevriPrihlaseni();
          } else {
            this.ui.showAlert('error', 'Chyba importu', 'Záložní soubor nemá správný formát.');
          }
        } catch (_err) {
          this.ui.showAlert('error', 'Chyba', 'Soubor se nepodařilo přečíst.');
        }
      };
      reader.readAsText(file);
    };

    window.checkEnter = (event, callback) => {
      if (event.key === "Enter") {
        event.preventDefault();
        callback();
      }
    };

    window.toggleMuteState = () => {
      const isMuted = sound.toggleMute();
      const toggleBtn = document.getElementById('global-sound-toggle');
      if (toggleBtn) {
        if (isMuted) {
          toggleBtn.classList.add('muted');
        } else {
          toggleBtn.classList.remove('muted');
        }
      }
    };
  }
}
