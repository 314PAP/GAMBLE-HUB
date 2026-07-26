import './css/main.css';
import { GameDatabase } from './db';
import { GameUI } from './ui';
import { GameManager } from './games';
import { sound } from './sound';
import { API } from './api';
import { initButtonAnimations } from './animations/buttons.js';
import {
  initTitleFlicker,
  initModalAnimations,
  initInfoPanelAnimations,
  initStatusBoxAnimation,
  initSockaShake,
  initPulseSeven,
  initNeonFlicker,
  initIdlePulse,
} from './animations/ui.js';
import { GlobalEventHandlers } from './events/globalHandlers.js';

const db = new GameDatabase();
const api = new API(db);
const ui = new GameUI(db, api);
const gm = new GameManager(db, ui, api);

new GlobalEventHandlers(db, api, ui, gm);

document.addEventListener('DOMContentLoaded', () => {
   ui.showScreen('screen-splash');
   setTimeout(() => {
     ui.showScreen('screen-login');
   }, 2000);

   ui.renderLeaderboard();
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

   const toggleBtn = document.getElementById('global-sound-toggle');
   if (toggleBtn) {
     if (sound.isMuted()) {
       toggleBtn.classList.add('muted');
     } else {
       toggleBtn.classList.remove('muted');
     }
   }

   ui.renderLeaderboard();

   document.addEventListener('click', (e) => {
     const target = e.target;
     if (
       target.closest('button') ||
       target.closest('.btn-num') ||
       target.closest('.btn-bet') ||
       target.closest('.bet-btn') ||
       target.closest('.btn-spin-slots') ||
       target.closest('.btn-auto-slots') ||
       target.closest('.sound-toggle-btn')
     ) {
       sound.playClick();
     }
   });

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

   initTitleFlicker();
   initSockaShake();
   initPulseSeven();
   initModalAnimations();
   initInfoPanelAnimations();
   initStatusBoxAnimation();

   const gameTitle = document.getElementById('game-title');
   if (gameTitle) {
     initNeonFlicker(gameTitle, 'rgba(0, 240, 255, 0.6)');
   }
   const spinBtn = document.getElementById('btn-spin-slots');
   if (spinBtn) {
     initIdlePulse(spinBtn);
   }
});

window.otevriAbbrevModal = async function () {
   const modal = document.getElementById('abbrev-modal');
   if (!modal) return;
   modal.classList.remove('hidden');
   const body = document.getElementById('abbrev-modal-body');
   if (!body) return;
   try {
      const { getAbbrevTableData } = await import('./utils.js');
     const data = getAbbrevTableData();
     body.innerHTML = data.map((row, i) =>
       '<tr class="' + (i % 2 === 0 ? '' : 'bg-[rgba(255,255,255,0.03)]') + '">' +
       '<td class="px-3 py-2 font-mono font-bold text-[var(--neon-cyan)]">' + row.sym + '</td>' +
       '<td class="px-3 py-2 text-[var(--text-primary)]">' + row.name + '</td>' +
       '<td class="px-3 py-2 text-right font-mono text-[var(--neon-orange)]">' + row.zeros + '</td>' +
       '</tr>'
     ).join('');
   } catch (e) {
     console.error('Failed to load abbreviation table data', e);
   }
};

window.zavriAbbrevModal = function () {
   const modal = document.getElementById('abbrev-modal');
   if (modal) modal.classList.add('hidden');
};


