// Main entry point initializing CSS and mounting game/UI events globally

import { ClientWebSocket } from './clientWebSocket.js';
import './css/main.css';
import { GameDatabase } from './db';
import { GameUI } from './ui';
import { GameManager } from './games';
import { sound } from './sound';
import { API } from './api';
import { initButtonAnimations } from './animations/buttons.js';

// Initialize core components
const db = new GameDatabase();
const api = new API(db);
const ui = new GameUI(db, api);
const gm = new GameManager(db, ui, api);

// Initialize WebSocket connection
const wsUrl = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/GAMBLE-HUB/';
window.clientWS = new ClientWebSocket(wsUrl);

// Global event handlers mounted on 'window' for HTML compatibility
window.otevriPrihlaseni = () => {
  ui.renderAccounts(
    (username) => window.prihlasitHrace(username),
    (username) => window.smazatUcet(username)
  );
  ui.showScreen('screen-select-user');
};

window.otevriRegistraci = () => {
  const regInput = document.getElementById('reg-name');
  if (regInput) regInput.value = '';
  ui.showScreen('screen-register');
  setTimeout(() => {
    if (regInput) regInput.focus();
  }, 100);
};

window.zpetDoMenu = () => {
  gm.stopAutoPlay();
  ui.showScreen('screen-login');
  ui.renderLeaderboard(); // async – stáhne z Firebase
};

window.navratDoHubu = () => {
  gm.stopAutoPlay();
  const balance = db.getPlayerBalance(gm.currentPlayer);
  ui.updateMiniProfile(gm.currentPlayer, balance);
  ui.showScreen('screen-hub');
};

window.prihlasitHrace = (username) => {
  const balance = db.getPlayerBalance(username);
  if (balance <= 0) {
    gm.setCurrentPlayer(username);
    gm.triggerBrokeScreen();
    return;
  }
  
  gm.setCurrentPlayer(username);
  ui.updateMiniProfile(username, balance);
  ui.showScreen('screen-hub');
};

window.smazatUcet = (username) => {
  const success = db.deletePlayer(username);
  if (success) {
    ui.showAlert('success', 'Účet smazán', `Hráč ${username} byl permanentně smazán.`);
    window.otevriPrihlaseni();
  } else {
    ui.showAlert('error', 'Chyba', 'Účet se nepodařilo smazat.');
  }
};

window.potvrditRegistraci = () => {
  const regInput = document.getElementById('reg-name');
  if (!regInput) return;
  
  const username = regInput.value.trim();
  const res = db.createPlayer(username);
  
  if (res.success) {
    window.prihlasitHrace(username);
  } else {
    ui.showAlert('warning', 'Registrace se nezdařila', res.message);
  }
};

window.odhlasitSe = () => {
  gm.setCurrentPlayer(null);
  window.zpetDoMenu();
};

window.spustitHru = (gameId) => {
  gm.launchGame(gameId);
};

window.nastavSazku = (amount) => {
  gm.setBet(amount);
};

window.ukazVlastniSazku = () => {
  const area = document.getElementById('custom-sazka-area');
  if (!area) return;
  
  if (area.style.display === 'none') {
    area.style.display = 'block';
    const input = document.getElementById('game-sazka');
    if (input) {
      input.value = gm.activeBet;
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
    ui.showAlert('warning', 'Chybná částka', 'Zadejte platnou kladnou částku!');
    return;
  }
  
  gm.setBet(val);
  const area = document.getElementById('custom-sazka-area');
  if (area) area.style.display = 'none';
};

window.kliknutoCislo = (num) => {
  if (gm.activeGameId === 5) {
    gm.playSlots();
  } else {
    // For classic games, pass chosen grid number
    const maxVal = gm.activeGameId === 1 ? 10 : (gm.activeGameId === 2 ? 5 : (gm.activeGameId === 3 ? 6 : 36));
    const minVal = gm.activeGameId === 4 ? 0 : 1;
    const multVal = gm.activeGameId === 1 ? 10 : (gm.activeGameId === 2 ? 5 : (gm.activeGameId === 3 ? 6 : 36));
    const gameLabel = gm.activeGameId === 1 ? "Hádanka 1-10" : (gm.activeGameId === 2 ? "Hádanka 1-5" : (gm.activeGameId === 3 ? "Kostka" : "Ruleta"));
    
    gm.playGuessingGame(num, minVal, maxVal, multVal, gameLabel);
  }
};

window.toggleAutoPlay = () => {
  gm.toggleAutoPlay();
};

window.hrajHiLo = (tip) => {
  gm.playHilo(tip);
};

window.otevriStatsModal = () => {
  if (gm.currentPlayer) {
    ui.openStatsModal(gm.currentPlayer);
  }
};
window.zavriStatsModal = () => {
  ui.closeStatsModal();
};

window.otevriExplorer = () => {
  ui.openExplorer();
};
window.zavriExplorer = () => {
  ui.closeExplorer();
};
window.prepniExplorerTab = (tabName) => {
  ui.prepniExplorerTab(tabName);
};
window.filtrujLeaderboard = () => {
  ui.filtrujLeaderboard();
};
window.filtrujHistorii = () => {
  ui.filtrujHistorii();
};
window.seradHistorii = (columnName) => {
  ui.seradHistorii(columnName);
};

window.toggleInfoPanel = () => {
  ui.toggleInfoPanel(gm.activeGameId);
};

window.zavriInfoPanel = () => {
  ui.zavriInfoPanel();
};

window.exportovatData = () => {
  const data = db.exportData();
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
      const success = db.importData(data);
      if (success) {
        ui.showAlert('success', 'Import úspěšný', 'Herní data byla úspěšně nahrána.');
        window.otevriPrihlaseni();
      } else {
        ui.showAlert('error', 'Chyba importu', 'Záložní soubor nemá správný formát.');
      }
    } catch (err) {
      ui.showAlert('error', 'Chyba', 'Soubor se nepodařilo přečíst.');
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

// Sound mute handler
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

// Initial setup on window load
document.addEventListener('DOMContentLoaded', () => {
  ui.renderLeaderboard();
// Visit counter
(async () => {
  try {
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const { ip } = await ipRes.json();
    const visitData = await api.recordVisit(ip);
    const { ipCount, total } = visitData;
    const visitorNumber = total !== null ? total : ipCount;
    const counterEl = document.getElementById('visit-counter');
    if (counterEl) {
      counterEl.textContent = `👽 ${ipCount}/${total}`;
      ui.showAlert('info', 'Vítej!', `Jsi tu po ${ipCount}/${total}`);
    }
  } catch (e) {
    console.error('Visit counter failed', e);
  }
})();

  // Load sound settings
  const toggleBtn = document.getElementById('global-sound-toggle');
  if (toggleBtn) {
    if (sound.isMuted()) {
      toggleBtn.classList.add('muted');
    } else {
      toggleBtn.classList.remove('muted');
    }
  }

  // Načteme žebříček hned při startu (stáhne z Firebase)
  ui.renderLeaderboard();

  // Global click listener for button sound effects
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (
      target.closest('button') ||
      target.closest('.btn-num') ||
      target.closest('.btn-bet') ||
      target.closest('.sound-toggle-btn')
    ) {
      sound.playClick();
    }
  });

  // Button specific actions
  const btnEnter = document.getElementById('btn-enter');
  if (btnEnter) {
    btnEnter.addEventListener('click', () => {
      if (window.otevriPrihlaseni) window.otevriPrihlaseni();
    });
  }

  const btnCreate = document.getElementById('btn-create-player');
  if (btnCreate) {
    btnCreate.addEventListener('click', () => {
      if (window.otevriRegistraci) window.otevriRegistraci();
    });
  }

  initButtonAnimations();
});
