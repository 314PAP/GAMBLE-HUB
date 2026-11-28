// Game Manager orchestrating bets, autoplay, database updates and game launches

import gsap from 'gsap';
import { sound } from './sound.js';
import { animateBetButtonsGlow, stopBetButtonsGlow } from './animations/ui.js';

import { DISPLAY_STATES, GAME_CONFIG } from './games/config.js';
import { toggleAutoPlay as runToggleAutoPlay, stopAutoPlay as runStopAutoPlay } from './games/autoPlay.js';
import { lockGameControls as runLockGameControls } from './games/controlsLock.js';
import { clearAllResultBoxes as runClearAllResultBoxes } from './games/resultBoxes.js';
import { processGameResult as runProcessGameResult, triggerBrokeScreen as runTriggerBrokeScreen } from './games/resultProcessor.js';
import { setupGameScreen } from './games/screenSetup.js';

export { DISPLAY_STATES, GAME_CONFIG };

const gameModules = {
  3: () => import('./games/dice.js'),
  5: () => import('./games/slots.js'),
  6: () => import('./games/hilo.js'),
  7: () => import('./games/mines.js'),
  8: () => import('./games/crash.js'),
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
    this.mines = null;
    this.crash = null;
    this.blackjack = null;
    this.wheel = null;

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
        const [slotsModule, hiloModule, guessingModule, diceModule, minesModule, crashModule, blackjackModule, wheelModule] = await Promise.all([
          import('./games/slots.js'),
          import('./games/hilo.js'),
          import('./games/guessing.js'),
          import('./games/dice.js'),
          import('./games/mines.js'),
          import('./games/crash.js'),
          import('./games/blackjack.js'),
          import('./games/wheel.js'),
        ]);
        
        this.slots = new slotsModule.SlotMachineGame(this.symbols, this.winningLines);
        this.hilo = new hiloModule.HiloGame();
        this.guessing = new guessingModule.GuessingGame();
        this.dice = new diceModule.DiceGame();
        this.mines = new minesModule.MinesGame();
        this.crash = new crashModule.CrashGame();
        this.blackjack = new blackjackModule.BlackjackGame();
        this.wheel = new wheelModule.WheelGame();
        
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

    // Auto-cashout active Hi-Lo or Mines streak when switching games
    if (this.hilo?.isStreakActive) {
      this.cashOutHilo();
    }
    if (this.mines?.isActive && this.mines.revealedIndices.size > 0) {
      this.cashOutMines();
    } else if (this.mines?.isActive) {
      this.mines.init();
    }
    if (this.crash?.isActive) {
      this.cashOutCrash();
    }

    // Kill all running GSAP animations before switching games
    gsap.globalTimeline.clear();

    const balance = this.db.getPlayerBalance(this.currentPlayer);
    this.ui.updateMiniProfile(this.currentPlayer, balance);
    this.setBet(GameManager.DEFAULT_BET); // Reset to default bet

    setupGameScreen(this, gameId);

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

    if (!this.isAutoPlaying) {
      this.clearAllResultBoxes();
    }
    return true;
  }

  clearAllResultBoxes() {
    runClearAllResultBoxes();
  }

  // Unified win/loss result processor
  processGameResult(isWin, winAmount, gameName, resultText, isJackpot = false, betOverride = null) {
    runProcessGameResult(this, isWin, winAmount, gameName, resultText, isJackpot, betOverride);
  }

  triggerBrokeScreen() {
    runTriggerBrokeScreen(this);
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

  // Play Hi-Lo card game (supports streaks & Cash Out)
  async playHilo(tip) {
    const modulesLoaded = await this._ensureGameModules();
    if (!modulesLoaded) return;
    if (this.hilo.isAnimating) return;
    if (this.hilo.getWinningCount(tip) <= 0) return;

    if (!this.hilo.isStreakActive) {
      if (!this._startRound()) return;
    } else {
      if (!this.isAutoPlaying) {
      this.clearAllResultBoxes();
    }
    }

    this.lockGameControls(true);
    animateBetButtonsGlow();

    const res = await this.hilo.playAsync(tip, this.activeBet);
    this.lockGameControls(false);
    stopBetButtonsGlow();

    if (res.isWin && res.isStreakContinue) {
      const resBoxHilo = document.getElementById('game-result-hilo');
      if (resBoxHilo) {
        resBoxHilo.innerText = `🔥 Série ${res.streak}× (${res.multiplier}×) — Výhra: ${res.potentialWin}`;
        resBoxHilo.classList.remove('hidden');
        resBoxHilo.style.color = 'var(--neon-gold)';
      }
      this.hilo.updateStreakUI();
    } else {
      this.processGameResult(false, 0, "VíceMéně", res.resultText, false, res.bet);
    }
  }

  cashOutHilo() {
    if (!this.hilo) return;
    const res = this.hilo.cashOut();
    if (!res) return;
    this.processGameResult(true, res.winAmount, "VíceMéně", res.resultText, res.multiplier >= 5, res.bet);
  }

  // Play Mines 5x5 game
  async startMines() {
    const modulesLoaded = await this._ensureGameModules();
    if (!modulesLoaded) return;
    if (this.mines.isActive) return;
    if (!this._startRound()) return;
    this.mines.start(this.activeBet);
  }

  revealMineTile(index) {
    if (!this.mines || !this.mines.isActive) return;
    const res = this.mines.revealTile(index);
    if (!res) return;

    if (res.status === 'mine') {
      this.processGameResult(false, 0, "Miny", res.resultText, false, res.bet);
    } else if (res.status === 'cleared') {
      this.processGameResult(true, res.winAmount, "Miny", res.resultText, res.multiplier >= 5, res.bet);
    }
  }

  cashOutMines() {
    if (!this.mines) return;
    const res = this.mines.cashOut();
    if (!res) return;
    this.processGameResult(true, res.winAmount, "Miny", res.resultText, res.multiplier >= 5, res.bet);
  }

  setMinesCount(count) {
    if (!this.mines) return;
    this.mines.setMinesCount(count);
  }

  // Play Crash game
  async startCrash() {
    const modulesLoaded = await this._ensureGameModules();
    if (!modulesLoaded) return;
    if (this.crash.isActive) return;
    if (!this._startRound()) return;
    this.crash.start(this.activeBet, (res) => {
      this.processGameResult(false, 0, "Crash", res.resultText, false, res.bet);
    });
  }

  cashOutCrash() {
    if (!this.crash) return;
    const res = this.crash.cashOut();
    if (!res) return;
    this.processGameResult(true, res.winAmount, "Crash", res.resultText, res.multiplier >= 5, res.bet);
  }

  // Play Blackjack game
  async startBlackjack() {
    const modulesLoaded = await this._ensureGameModules();
    if (!modulesLoaded) return;
    if (this.blackjack.isRoundActive) return;
    if (!this._startRound()) return;
    const res = this.blackjack.start(this.activeBet);
    if (res) {
      this._handleBlackjackResult(res);
    }
  }

  hitBlackjack() {
    if (!this.blackjack || !this.blackjack.isRoundActive) return;
    const res = this.blackjack.hit();
    if (res) {
      this._handleBlackjackResult(res);
    }
  }

  standBlackjack() {
    if (!this.blackjack || !this.blackjack.isRoundActive) return;
    const res = this.blackjack.stand();
    if (res) {
      this._handleBlackjackResult(res);
    }
  }

  doubleBlackjack() {
    if (!this.blackjack || !this.blackjack.isRoundActive) return;
    const balance = this.db.getPlayerBalance(this.currentPlayer);
    if (balance < this.blackjack.bet) {
      this.ui.showAlert('Nedostatek mincí pro Double!', 'error');
      return;
    }
    this.db.updateBalance(this.currentPlayer, balance - this.blackjack.bet);
    this.ui.updateBalanceDisplay(this.currentPlayer);
    const res = this.blackjack.doubleDown();
    if (res) {
      this._handleBlackjackResult(res);
    }
  }

  _handleBlackjackResult(res) {
    this.processGameResult(
      res.isWin,
      res.winAmount,
      "Blackjack",
      res.resultText,
      res.isBlackjack,
      res.bet
    );
  }

  // Play Wheel of Fortune game
  async spinWheel() {
    const modulesLoaded = await this._ensureGameModules();
    if (!modulesLoaded) return;
    if (this.wheel.isSpinning) return;
    if (!this._startRound()) return;

    this.lockGameControls(true);
    const res = await this.wheel.spinAsync(this.activeBet);
    this.lockGameControls(false);
    if (res) {
      this.processGameResult(res.isWin, res.winAmount, "Kolo štěstí", res.resultText, res.multiplier >= 5, res.bet);
    }
  }

  setWheelRisk(risk) {
    if (this.wheel) this.wheel.setRisk(risk);
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
