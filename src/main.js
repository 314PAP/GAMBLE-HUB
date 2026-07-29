import './css/main.css';
import gsap from 'gsap';
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
  initContainerBorderGlow,
  initStroboscopicGlow,
} from './animations/ui.js';
import { GlobalEventHandlers } from './events/globalHandlers.js';

if (import.meta.env.DEV) {
  console.debug('[DEBUG] location.href =', location.href);
  console.debug('[DEBUG] import.meta.env.BASE_URL =', import.meta.env.BASE_URL);
  console.debug('[DEBUG] VITE_BASE =', import.meta.env.VITE_BASE);
  console.debug('[DEBUG] sw path =', `${import.meta.env.BASE_URL}sw.js`);
}

const db = new GameDatabase();
const api = new API(db);
const ui = new GameUI(db, api);
const gm = new GameManager(db, ui, api);

if (import.meta.env.DEV) {
  console.debug('[DEBUG] api.isOnline =', api.isOnline);
  console.debug('[DEBUG] firebase projectId =', import.meta.env.VITE_FIREBASE_PROJECT_ID);
  console.debug('[DEBUG] firebase apiKey present =', Boolean(import.meta.env.VITE_FIREBASE_API_KEY));
}

window._globalHandlersInstance = new GlobalEventHandlers(db, api, ui, gm);

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
     const loginToggleBtn = document.getElementById('login-sound-toggle');
     if (toggleBtn) {
       if (sound.isMuted()) {
         toggleBtn.classList.add('muted');
       } else {
         toggleBtn.classList.remove('muted');
       }
     }
     if (loginToggleBtn) {
       if (sound.isMuted()) {
         loginToggleBtn.classList.add('muted');
       } else {
         loginToggleBtn.classList.remove('muted');
       }
     }

     const musicToggleBtn = document.getElementById('global-music-toggle');
     const loginMusicToggleBtn = document.getElementById('login-music-toggle');
     if (musicToggleBtn) {
       const musicMuted = localStorage.getItem('c_music_mute') === 'true';
       if (musicMuted) {
         musicToggleBtn.classList.add('muted');
       } else {
         musicToggleBtn.classList.remove('muted');
       }
     }
     if (loginMusicToggleBtn) {
       const musicMuted = localStorage.getItem('c_music_mute') === 'true';
       if (musicMuted) {
         loginMusicToggleBtn.classList.add('muted');
       } else {
         loginMusicToggleBtn.classList.remove('muted');
       }
     }

    window.toggleMusicState = function() {
      const isPlaying = sound.toggleBGM();
      const btns = [
        document.getElementById('global-music-toggle'),
        document.getElementById('login-music-toggle'),
      ];
      btns.forEach((btn) => {
        if (btn) {
          if (isPlaying) {
            btn.classList.remove('muted');
            localStorage.setItem('c_music_mute', 'false');
          } else {
            btn.classList.add('muted');
            localStorage.setItem('c_music_mute', 'true');
          }
        }
      });
    };

    document.addEventListener('click', (e) => {
     const target = e.target;
     if (
       target.closest('button') ||
       target.closest('.btn-num') ||
       target.closest('.btn-bet') ||
       target.closest('.bet-btn') ||
       target.closest('.btn-spin-slots') ||
       target.closest('.btn-auto-slots') ||
       target.closest('.sound-toggle-btn') ||
       target.closest('#login-sound-toggle') ||
       target.closest('#login-music-toggle')
     ) {
       sound.playClickRetro();
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

    // GSAP border glow on main container (always runs, also after refresh)
    // Default mode is always 'gradient' (Gamble Hub title gradient colors).
    // No localStorage persistence — hard refresh always resets to default gradient.
    const mainContainer = document.querySelector('.container');
    if (mainContainer) {
      // Kill any existing tweens first (prevents duplicate animation)
      gsap.killTweensOf(mainContainer);
      initContainerBorderGlow(mainContainer);
    }

    // Override toggleTheme so it switches the main container border animation
    // (gradient ↔ stroboscopic yellow) WITHOUT changing the CSS background vars.
    const originalToggleTheme = window.toggleTheme;
    if (originalToggleTheme) {
      window.toggleTheme = () => {
        // Switch theme attribute (cyan ↔ default)
        originalToggleTheme();

        // Only change the border animation on main container — do NOT
        // modify background/screen CSS variables (those stay constant).
        if (mainContainer) {
          gsap.killTweensOf(mainContainer);
          // Determine new mode: if theme is now cyan → stroboscopic, else → gradient
          const newMode = document.documentElement.getAttribute('data-theme') === 'cyan'
            ? 'stroboscopic' : 'gradient';
          if (newMode === 'stroboscopic') {
            initStroboscopicGlow(mainContainer);
          } else {
            initContainerBorderGlow(mainContainer);
          }
        }
      };
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

window.addEventListener('error', (event) => {
  if (event.filename && event.filename.includes('games/')) {
    console.error('Game module loading error:', event.error);
    const gameArea = document.getElementById('game-area');
    if (gameArea) {
      gameArea.innerHTML = `
        <div class="text-center p-4">
          <h2 class="text-[var(--neon-red)] text-glow-red mb-2">Chyba načítání hry</h2>
          <p class="text-text-muted">Nepodařilo se načíst herní modul. Zkuste obnovit stránku.</p>
          <button onclick="location.reload()" class="btn btn-primary mt-4">Obnovit stránku</button>
        </div>
      `;
    }
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('game')) {
    console.error('Unhandled game module error:', event.reason);
  }
});

// Show update notification
function showUpdateNotification() {
  const existing = document.getElementById('update-notification');
  if (existing) return;

  const notification = document.createElement('div');
  notification.id = 'update-notification';
  notification.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl bg-[var(--neon-purple)] text-white font-bold text-sm shadow-lg flex items-center gap-3';
  notification.innerHTML = `
    <span>🎮</span>
    <span>Nová verze k dispozici</span>
    <button onclick="window.location.reload()" class="ml-2 px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-xs">
      Obnovit
    </button>
    <button onclick="this.closest('#update-notification').remove()" class="ml-1 text-white/70 hover:text-white" aria-label="Zavřít">
      ✕
    </button>
  `;
  document.body.appendChild(notification);

  // Auto-hide after 30 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 30000);
}

// FPS meter for dev mode (only on localhost)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  let lastTime = performance.now();
  let frames = 0;
  const fpsMeter = document.createElement('div');
  fpsMeter.id = 'fps-meter';
  fpsMeter.className = 'fixed bottom-2 right-2 z-50 px-2 py-1 rounded bg-black/80 text-[var(--neon-green)] text-xs font-mono border border-[var(--neon-green)]/30';
  document.body.appendChild(fpsMeter);

  function updateFPS() {
    frames++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      const fps = Math.round((frames * 1000) / (now - lastTime));
      fpsMeter.textContent = `FPS: ${fps}`;
      fpsMeter.style.color = fps < 30 ? 'var(--neon-red)' : fps < 50 ? 'var(--neon-orange)' : 'var(--neon-green)';
      frames = 0;
      lastTime = now;
    }
    requestAnimationFrame(updateFPS);
  }
  requestAnimationFrame(updateFPS);
}
if ('serviceWorker' in navigator && !import.meta.env.DEV) {
  const registerSW = async () => {
    try {
      // Clean up stale SWs from previous sessions with different scopes
      const existingRegistrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of existingRegistrations) {
        if (registration.scope !== `${window.location.origin}/`) {
          await registration.unregister();
        }
      }

      const swPath = `${import.meta.env.BASE_URL}sw.js`;
      const baseUrl = import.meta.env.BASE_URL || '/';
      const registration = await navigator.serviceWorker.register(swPath, { scope: baseUrl });
      
      // Check for updates every 4 hours
      const checkForUpdates = async () => {
        try {
          const ready = await navigator.serviceWorker.ready;
          await ready.update();
        } catch (e) {
          console.warn('SW update check failed:', e);
        }
      };
      
      // Initial check
      setTimeout(checkForUpdates, 5000);
      
      // Periodic checks
      setInterval(checkForUpdates, 4 * 60 * 60 * 1000); // 4 hours
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available - show notification
              showUpdateNotification();
            }
          });
        }
      });
      
    } catch (err) {
      console.warn('Service worker registration failed:', err);
    }
  };

  // Register after page load
  if (document.readyState === 'complete') {
    registerSW();
  } else {
    window.addEventListener('load', registerSW);
  }
}


