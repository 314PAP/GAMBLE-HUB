// Game Manager orchestrating bets, autoplay, database updates and game launches

import gsap from 'gsap';
import { sound } from './sound.js';
import { animateBetButtonsGlow, stopBetButtonsGlow } from './animations/ui.js';

import { DISPLAY_STATES, GAME_CONFIG } from './games/config.js';
import { toggleAutoPlay as runToggleAutoPlay, stopAutoPlay as runStopAutoPlay } from './games/autoPlay.js';
import { lockGameControls as runLockGameControls } from './games/controlsLock.js';
import { clearAllResultBoxes as runClearAllResultBoxes } from './games/resultBoxes.js';

export { DISPLAY_STATES, GAME_CONFIG };

const gameModules = {
  3: () => import('./games/dice.js'),
  5: () => import('./games/slots.js'),
  6: () => import('./games/hilo.js'),
};

export class GameManager {
  constructor(db, ui, api) {
    this.db = db;
    this.ui = ui;
    this.api = api;
    
    // Configs
    this.symbols = ["🍒", "🔔", "🍋", "⭐", "💎", "7️⃣"];
    this.winningLines = [[0,1,2],[3,4,5],[6,7,8],[0,4,8],[2,4,6]];

    // Game Instances (loaded dynamically)
    this.slots = null;
    this.hilo = null;
    this.guessing = null;
    this.dice = null;

    // Active States
    this.activeGameId = 0; // 1: Guess 1-10, 2: Guess 1-5, 3: Dice, 4: Roulette, 5: Slots, 6: Hi-Lo
    this.activeBet = GameManager.DEFAULT_BET;
    this.autoPlayInterval = null;
    this.currentPlayer = null;
    this._gameModulesLoaded = false;
  }

  // Konstanty
  static STARTING_BALANCE = 500;
  static DEFAULT_BET = 10;
  static AUTOPLAY_INTERVAL_MS = 700;
  static SPLASH_DURATION_MS = 2000;

  async _ensureGameModules() {
    if (this._gameModulesLoaded) return true;
    
    // Show loading indicator
    const loadingEl = document.getElementById('game-loading');
    if (loadingEl) {
      loadingEl.classList.remove('hidden');
      loadingEl.classList.add('flex');
    }
    
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 500;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const [slotsModule, hiloModule, guessingModule, diceModule] = await Promise.all([
          import('./games/slots.js'),
          import('./games/hilo.js'),
          import('./games/guessing.js'),
          import('./games/dice.js'),
        ]);
        
        this.slots = new slotsModule.SlotMachineGame(this.symbols, this.winningLines);
        this.hilo = new hiloModule.HiloGame();
        this.guessing = new guessingModule.GuessingGame();
        this.dice = new diceModule.DiceGame();
        
        this._gameModulesLoaded = true;
        
        // Hide loading indicator
        if (loadingEl) {
          loadingEl.classList.add('hidden');
          loadingEl.classList.remove('flex');
        }
        
        return true;
      } catch (error) {
        console.error(`Failed to load game modules (attempt ${attempt}/${MAX_RETRIES}):`, error);
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }
    }
    
    // Hide loading indicator on error
    if (loadingEl) {
      loadingEl.classList.add('hidden');
      loadingEl.classList.remove('flex');
    }
    
    this.ui.showAlert('error', 'Chyba načítání', 'Nepodařilo se načíst herní moduly. Obnovte stránku.');
    return false;
  }

  setCurrentPlayer(username) {
    this.currentPlayer = username;
  }

  setBet(amount) {
    this.activeBet = amount;
    this.ui.updateBetButtonsSelection(this.activeBet);
  }

  // Launches the specified game screen
  async launchGame(gameId) {
    await this._ensureGameModules();
    
    this.activeGameId = gameId;
    this.stopAutoPlay();
    this.ui.cancelWinConfetti();

    // Kill all running GSAP animations before switching games
    gsap.globalTimeline.clear();

    const balance = this.db.getPlayerBalance(this.currentPlayer);
    this.ui.updateMiniProfile(this.currentPlayer, balance);
    this.setBet(GameManager.DEFAULT_BET); // Reset to default bet
    
    // Hide game-specific areas in the DOM
    const slotsArea = document.getElementById('slots-area');
    const hiloArea = document.getElementById('hilo-area');
    const classicInputs = document.getElementById('classic-inputs');
    const diceArea = document.getElementById('dice-area');
    const gameResult = document.getElementById('game-result');
    const gameResultClassic = document.getElementById('game-result-classic');
    const gameResultDice = document.getElementById('game-result-dice');
    const gameResultSlots = document.getElementById('game-result-slots');
    const gameResultHilo = document.getElementById('game-result-hilo');
    const betArea = document.getElementById('bet-area');

    if (gameResultClassic) gameResultClassic.classList.add('hidden');
    if (gameResultDice) gameResultDice.classList.add('hidden');
    if (gameResultSlots) gameResultSlots.classList.add('hidden');
    if (gameResultHilo) gameResultHilo.classList.add('hidden');

    if (slotsArea) slotsArea.classList.add('hidden');
    if (hiloArea) hiloArea.classList.add('hidden');
    if (classicInputs) classicInputs.classList.add('hidden');
    if (diceArea) diceArea.classList.add('hidden');
    if (gameResult) gameResult.classList.add('hidden');
    if (betArea) betArea.classList.add('grid');

    // Reset slot cell classes
    document.querySelectorAll('.slot-cell').forEach(c => c.classList.remove('win-active'));

    const titleEl = document.getElementById('game-title');
    const cfg = GAME_CONFIG[gameId];
    const state = DISPLAY_STATES[gameId] || DISPLAY_STATES[1];

    if (state.classic) {
      document.getElementById('classic-inputs').classList.remove('hidden');
      this.guessing.generateGrid(cfg.minVal, cfg.maxVal, (num) => this.playGuessingGame(num, cfg.minVal, cfg.maxVal, cfg.multVal, cfg.label));
    } else {
      document.getElementById('classic-inputs').classList.add('hidden');
    }

    if (state.dice) {
      const diceEl = document.getElementById('dice-area');
      diceEl.classList.remove('hidden');
      this.dice.init();
      document.querySelectorAll('.dice-num-btn').forEach(btn => {
        btn.onclick = () => {
          if (this.dice.isPlaying) return;
          this.dice.selectNumber(parseInt(btn.dataset.num));
          this.playDiceGame();
        };
      });
    }

    if (state.slots) {
      document.getElementById('slots-area').classList.remove('hidden');
    }

    if (state.hilo) {
      document.getElementById('hilo-area').classList.remove('hidden');
      document.getElementById('hilo-area').classList.add('flex');
      this.hilo.init();
    }

    titleEl.innerText = state.title;

    // Reset number buttons for classic games (e.g., roulette) to clear previous selections
    this.ui.resetNumberButtons();

    // Show 2-second animated GAMBLE HUB splash loader screen before revealing game
    this.ui.showScreen('screen-splash');

    setTimeout(() => {
      this.ui.showScreen('screen-game');
      if (gameId === 5) {
        this.slots.initReels();
      }
    }, GameManager.SPLASH_DURATION_MS);
  }

  // Logic wrapper before playing any turn (balance checks, UI locking)
  preGameChecks() {
    const balance = this.db.getPlayerBalance(this.currentPlayer);
    if (this.activeBet > balance) {
      this.stopAutoPlay();
      this.ui.showAlert('error', 'Nedostatek prostředků', 'Nemáte dost peněz na tuto sázku!');
      return false;
    }
    return true;
  }

  _startRound() {
    if (!this.preGameChecks()) return false;

    const balance = this.db.getPlayerBalance(this.currentPlayer);
    this.db.updatePlayerBalance(this.currentPlayer, balance - this.activeBet);
    this.ui.updateMiniProfile(this.currentPlayer, balance - this.activeBet);

    this.clearAllResultBoxes();
    return true;
  }

  clearAllResultBoxes() {
    runClearAllResultBoxes();
  }

   // Unified win/loss result processor
    processGameResult(isWin, winAmount, gameName, resultText, isJackpot = false) {
      const oldBalance = this.db.getPlayerBalance(this.currentPlayer);
      
      // Deduct bet (note: bet was already deducted in original, but to make it clean,
      // we can either deduct at start and add wins, or deduct now.
      // In original code, player money was deducted immediately:
      // uzivatele[aktualniHrac] -= aktualniSazka;
      // And in ukonciKolo:
      // if(jeVyhra) uzivatele[aktualniHrac] += vyhraMnozstvi;
      // So we follow this exactly: we deduct at start of spin, and here we just add the winnings.)
      
       let newBalance = oldBalance;
       if (isWin) {
         newBalance = oldBalance + winAmount;
         this.db.updatePlayerBalance(this.currentPlayer, newBalance);
         this.ui.triggerWinConfetti(isJackpot);
       }
    
    // Log in DB
    this.db.recordMatch(this.currentPlayer, gameName, this.activeBet, resultText, isWin);
    this.db.checkMilestones(this.currentPlayer, oldBalance - this.activeBet, newBalance);
    
    // Odeslat aktuální skóre na Firebase (async, fire & forget)
    if (this.api) {
      this.api.submitScore(this.currentPlayer, newBalance);
      this.api.submitMatch(this.currentPlayer, gameName, this.activeBet, resultText, isWin, isWin ? winAmount : -this.activeBet);
    }

    // Update UI profile
    this.ui.updateMiniProfile(this.currentPlayer, newBalance);

    // Notify BetSlider of balance change so max can be updated
    document.dispatchEvent(new CustomEvent('balanceChanged', { detail: { balance: newBalance } }));
    
    const resBoxClassic = document.getElementById('game-result-classic');
    const resBoxDice = document.getElementById('game-result-dice');
    const resBoxSlots = document.getElementById('game-result-slots');
    const resBoxHilo = document.getElementById('game-result-hilo');
    const gameConfig = GAME_CONFIG[this.activeGameId] || GAME_CONFIG[1];

    let targetResBox = resBoxClassic;
    if (gameConfig.resultBox === 'resBoxDice' && resBoxDice) targetResBox = resBoxDice;
    if (gameConfig.resultBox === 'resBoxSlots' && resBoxSlots) targetResBox = resBoxSlots;
    if (gameConfig.resultBox === 'resBoxHilo' && resBoxHilo) targetResBox = resBoxHilo;

    if (isWin) {
      const hiloColor = gameConfig.hiloColor ? '#ff4060' : 'var(--neon-orange)';
      this.ui.animateWinResult(targetResBox, winAmount, resultText, isJackpot, 'game-result', hiloColor);
    } else {
      this.ui.animateLossBalance(newBalance);
    }

    // Check if player went broke
    if (newBalance <= 0) {
      this.stopAutoPlay();
      setTimeout(() => {
        this.triggerBrokeScreen();
      }, 600);
    }
  }

  triggerBrokeScreen() {
    this.db.updatePlayerBalance(this.currentPlayer, 0);
    sound.playBroke();
    document.getElementById('socka-text').innerText = 
      `Hráč ${this.currentPlayer} prohrál úplně všechno. Ochranka tě vyvedla z casina!`;
    this.ui.showScreen('screen-socka');
  }

// Play Dice game
  async playDiceGame() {
    const modulesLoaded = await this._ensureGameModules();
    if (!modulesLoaded) return;
    
    if (!this._startRound()) return;
    if (this.dice.selectedNumber === null) {
      this.ui.showAlert('warning', 'Vyber číslo', 'Nejprve klikni na kostku, na kterou vsadíš!');
      return;
    }

    this.lockGameControls(true);
    animateBetButtonsGlow();

    const res = await this.dice.rollAsync();
    this.lockGameControls(false);
    stopBetButtonsGlow();
    const multiplier = 6;
    this.processGameResult(res.isWin, res.isWin ? this.activeBet * multiplier : 0, "Kostka", res.resultText);
    this.dice.clearSelection();
  }

  // Play numeric guessing games
  async playGuessingGame(selectedNum, min, max, multiplier, gameName) {
    const modulesLoaded = await this._ensureGameModules();
    if (!modulesLoaded) return;
    
    if (!this._startRound()) return;

    this.ui.resetNumberButtons();
    this.lockGameControls(true);
    animateBetButtonsGlow();

    const res = await this.guessing.playAsync(selectedNum, min, max, this.activeBet, multiplier);
    this.lockGameControls(false);
    stopBetButtonsGlow();
    this.processGameResult(res.isWin, res.winAmount, gameName, res.resultText);
    this.ui.resetNumberButtons();
  }

  // Play Hi-Lo card game
  async playHilo(tip) {
    const modulesLoaded = await this._ensureGameModules();
    if (!modulesLoaded) return;
    if (this.hilo.isAnimating) return;
    if (!this._startRound()) return;

    this.lockGameControls(true);
    animateBetButtonsGlow();

    const res = await this.hilo.playAsync(tip, this.activeBet);
    this.lockGameControls(false);
    stopBetButtonsGlow();
    this.processGameResult(res.isWin, res.winAmount, "VíceMéně", res.resultText);
  }

  // Spin slots
  async playSlots() {
    const modulesLoaded = await this._ensureGameModules();
    if (!modulesLoaded) return;

    if (this.slots.isSpinning) return;
    if (!this._startRound()) return;

    // Animate bet buttons yellow glow during spin (both auto and manual)
    this.lockGameControls(true);
    animateBetButtonsGlow();

    const balance = this.db.getPlayerBalance(this.currentPlayer);

    const res = await this.slots.spinAsync(this.activeBet, balance);
    this.lockGameControls(false);
    // Stop bet buttons glow animation
    stopBetButtonsGlow();
    this.processGameResult(res.isWin, res.winAmount, "Bary3x3", res.resultText, res.isJackpot);
  }

  // Utility to prevent user clicks on other options during animations
  lockGameControls(lock) {
    runLockGameControls(lock);
  }

  // Handles Slot Machine Autoplay toggling
  async toggleAutoPlay() {
    return runToggleAutoPlay(this, GameManager.AUTOPLAY_INTERVAL_MS);
  }

  stopAutoPlay() {
    runStopAutoPlay(this);
  }
}
