// Game Manager orchestrating bets, autoplay, database updates and game launches

import gsap from 'gsap';
import { SlotMachineGame } from './games/slots';
import { HiloGame } from './games/hilo';
import { GuessingGame } from './games/guessing';
import { sound } from './sound';

export class GameManager {
  constructor(db, ui, api) {
    this.db = db;
    this.ui = ui;
    this.api = api;
    
    // Configs
    this.symbols = ["🍒", "🛎", "🍋", "⭐", "💎", "7️⃣"];
    this.winningLines = [[0,1,2],[3,4,5],[6,7,8],[0,4,8],[2,4,6]];

    // Game Instances
    this.slots = new SlotMachineGame(this.symbols, this.winningLines);
    this.hilo = new HiloGame();
    this.guessing = new GuessingGame();

    // Active States
    this.activeGameId = 0; // 1: Guess 1-10, 2: Guess 1-5, 3: Dice, 4: Roulette, 5: Slots, 6: Hi-Lo
    this.activeBet = 10;
    this.autoPlayInterval = null;
    this.currentPlayer = null;
  }

  setCurrentPlayer(username) {
    this.currentPlayer = username;
  }

  setBet(amount) {
    this.activeBet = amount;
    this.ui.updateBetButtonsSelection(this.activeBet);
  }

  // Launches the specified game screen
  launchGame(gameId) {
    this.activeGameId = gameId;
    this.stopAutoPlay();

    const balance = this.db.getPlayerBalance(this.currentPlayer);
    this.ui.updateMiniProfile(this.currentPlayer, balance);
    this.setBet(10); // Reset to default bet
    
    // Hide game-specific areas in the DOM
    document.getElementById('slots-area').style.display = 'none';
    document.getElementById('hilo-area').style.display = 'none';
    document.getElementById('classic-inputs').style.display = 'none';
    document.getElementById('game-result').style.display = 'none';
    document.getElementById('bet-area').style.display = 'grid';

    // Reset slot cell classes
    document.querySelectorAll('.slot-cell').forEach(c => c.classList.remove('win-active'));

    const titleEl = document.getElementById('game-title');

    switch (gameId) {
      case 1:
        titleEl.innerText = "HÁDANKA 1-10";
        document.getElementById('classic-inputs').style.display = 'block';
        this.guessing.generateGrid(1, 10, (num) => this.playGuessingGame(num, 1, 10, 10, "Hádanka 1-10"));
        break;
      case 2:
        titleEl.innerText = "HÁDANKA 1-5";
        document.getElementById('classic-inputs').style.display = 'block';
        this.guessing.generateGrid(1, 5, (num) => this.playGuessingGame(num, 1, 5, 5, "Hádanka 1-5"));
        break;
      case 3:
        titleEl.innerText = "KOSTKA 1-6";
        document.getElementById('classic-inputs').style.display = 'block';
        this.guessing.generateGrid(1, 6, (num) => this.playGuessingGame(num, 1, 6, 6, "Kostka"));
        break;
      case 4:
        titleEl.innerText = "RULETA 0-35";
        document.getElementById('classic-inputs').style.display = 'block';
        this.guessing.generateGrid(0, 35, (num) => this.playGuessingGame(num, 0, 35, 35, "Ruleta"));
        break;
      case 5:
        titleEl.innerText = "AUTOMAT BARY";
        document.getElementById('slots-area').style.display = 'block';
        this.slots.initReels();
        break;
      case 6:
        titleEl.innerText = "VÍCE / MÉNĚ (Hi-Lo)";
        document.getElementById('hilo-area').style.display = 'block';
        this.hilo.init();
        break;
    }

    // Reset number buttons for classic games (e.g., roulette) to clear previous selections
    this.ui.resetNumberButtons();
    this.ui.showScreen('screen-game');
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

    const resBox = document.getElementById('game-result');
    if (resBox) resBox.style.display = 'none';

    return true;
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
    
    const resBox = document.getElementById('game-result');
    
    if (isWin) {
      this.ui.animateWinResult(resBox, winAmount, resultText, isJackpot);
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

  // Play numeric guessing games
  playGuessingGame(selectedNum, min, max, multiplier, gameName) {
    if (!this._startRound()) return;

    this.ui.resetNumberButtons();
    this.lockGameControls(true);

    this.guessing.play(selectedNum, min, max, this.activeBet, multiplier, (res) => {
      this.lockGameControls(false);
      this.processGameResult(res.isWin, res.winAmount, gameName, res.resultText);
      this.ui.resetNumberButtons();
    });
  }

  // Play Hi-Lo card game
  playHilo(tip) {
    if (this.hilo.isAnimating) return;
    if (!this._startRound()) return;

    this.lockGameControls(true);

    this.hilo.play(tip, this.activeBet, (res) => {
      this.lockGameControls(false);
      this.processGameResult(res.isWin, res.winAmount, "VíceMéně", res.resultText);
    });
  }

  // Spin slots
  playSlots() {
    if (this.slots.isSpinning) return;
    if (!this._startRound()) return;

    const balance = this.db.getPlayerBalance(this.currentPlayer);
    if (!this.autoPlayInterval) {
      this.lockGameControls(true);
    }

    this.slots.spin(this.activeBet, balance, (res) => {
      if (!this.autoPlayInterval) {
        this.lockGameControls(false);
      }
      this.processGameResult(res.isWin, res.winAmount, "Bary3x3", res.resultText, res.isJackpot);
    });
  }

  // Handles Slot Machine Autoplay toggling
  toggleAutoPlay() {
    const autoBtn = document.getElementById('btn-auto-slots');
    if (this.autoPlayInterval) {
      this.stopAutoPlay();
    } else {
      if (!this.preGameChecks()) return;
      
      autoBtn.classList.add('active');
      autoBtn.innerHTML = '<span class="icon-node"></span> STOP';
      
      this.playSlots(); // Play first turn immediately
      
      this.autoPlayInterval = setInterval(() => {
        const balance = this.db.getPlayerBalance(this.currentPlayer);
        if (balance >= this.activeBet && !this.slots.isSpinning) {
          this.playSlots();
        } else if (balance < this.activeBet) {
          this.stopAutoPlay();
        }
      }, 700); // Fast autoplay loop
    }
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
    const autoBtn = document.getElementById('btn-auto-slots');
    if (autoBtn) {
      autoBtn.classList.remove('active');
      autoBtn.innerHTML = '<span class="icon-node"></span> AUTO';
    }
    this.lockGameControls(false);
  }

  // Utility to prevent user clicks on other options during animations
  lockGameControls(lock) {
    // Disable bet presets
    document.querySelectorAll('.btn-bet').forEach(b => {
      b.disabled = lock;
    });

    // Disable grid buttons in classic games
    document.querySelectorAll('.btn-num').forEach(b => {
      b.disabled = lock;
    });

    // Disable slot spin button
    const spinBtn = document.getElementById('btn-spin-slots');
    if (spinBtn) spinBtn.disabled = lock;

    // Disable Hilo buttons
    const hiloHigh = document.getElementById('btn-hilo-high');
    const hiloLow = document.getElementById('btn-hilo-low');
    if (hiloHigh) hiloHigh.disabled = lock;
    if (hiloLow) hiloLow.disabled = lock;
  }
}
