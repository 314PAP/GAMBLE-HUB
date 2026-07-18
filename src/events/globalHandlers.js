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
      if (window.grecaptcha) {
        try {
          window.grecaptcha.reset();
        } catch (e) {
          console.error(e);
        }
      }
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
      
      // Verify reCAPTCHA
      if (window.grecaptcha) {
        const response = window.grecaptcha.getResponse();
        if (!response) {
          this.ui.showAlert('warning', 'Ochrana reCAPTCHA', 'Pro vytvoření účtu potvrďte, že nejste robot.');
          return;
        }
      }

      const username = regInput.value.trim();
      const res = this.db.createPlayer(username);
      if (res.success) {
        window.prihlasitHrace(username);
      } else {
        this.ui.showAlert('warning', 'Registrace se nezdařila', res.message);
        if (window.grecaptcha) {
          try {
            window.grecaptcha.reset();
          } catch (e) {}
        }
      }
    };

    window.odhlasitSe = () => {
      this.gm.setCurrentPlayer(null);
      window.zpetDoMenu();
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
      if (area.style.display === 'none') {
        area.style.display = 'block';
        const input = document.getElementById('game-sazka');
        if (input) {
          input.value = '';
          input.focus();
        }
      } else {
        area.style.display = 'none';
      }
    };

    window.potvrditVlastniSazku = () => {
      const input = document.getElementById('game-sazka');
      if (!input) return;
      const val = parseInt(input.value);
      if (isNaN(val) || val <= 0) {
        this.ui.showAlert('warning', 'Chybná částka', 'Zadejte platnou kladnou částku!');
        return;
      }
      this.gm.setBet(val);
      const area = document.getElementById('custom-sazka-area');
      if (area) area.style.display = 'none';
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
