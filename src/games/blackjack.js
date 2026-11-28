import { sound } from "../sound.js";
import { formatLargeNumber as formatNumber } from "../utils.js";

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

/**
 * Create and shuffle a standard 52-card deck.
 * @returns {Array<{rank: string, suit: string}>}
 */
export function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/**
 * Calculate the best Blackjack hand value (Aces count as 11 or 1).
 * @param {Array<{rank: string, suit: string}>} cards
 * @returns {number}
 */
export function handValue(cards) {
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    if (card.rank === "A") {
      total += 11;
      aces += 1;
    } else if (["K", "Q", "J"].includes(card.rank)) {
      total += 10;
    } else {
      total += Number(card.rank);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

/**
 * Check if a 2-card hand is a natural Blackjack (21).
 * @param {Array<{rank: string, suit: string}>} cards
 * @returns {boolean}
 */
export function isBlackjack(cards) {
  return cards.length === 2 && handValue(cards) === 21;
}

export class BlackjackGame {
  constructor(gameManager) {
    this.gm = gameManager;
    this.deck = [];
    this.playerHand = [];
    this.dealerHand = [];
    this.bet = 0;
    this.isRoundActive = false;
    this.hideDealerHole = true;
  }

  init() {
    this.deck = [];
    this.playerHand = [];
    this.dealerHand = [];
    this.bet = 0;
    this.isRoundActive = false;
    this.hideDealerHole = true;
    this.render();
    this._updateButtons();
  }

  start(bet) {
    if (this.isRoundActive) return false;
    this.bet = bet;
    this.deck = createDeck();
    this.playerHand = [this.deck.pop(), this.deck.pop()];
    this.dealerHand = [this.deck.pop(), this.deck.pop()];
    this.isRoundActive = true;
    this.hideDealerHole = true;
    this.lastOutcome = null;

    sound.playCard();
    this.render();

    const playerBJ = isBlackjack(this.playerHand);
    const dealerBJ = isBlackjack(this.dealerHand);

    if (playerBJ || dealerBJ) {
      this.hideDealerHole = false;
      this.isRoundActive = false;
      this.render();
      if (playerBJ && dealerBJ) {
        this._settle(this.bet, true, "Remíza (Blackjack vs Blackjack) — sázka vrácena");
      } else if (playerBJ) {
        this._settle(Math.floor(this.bet * 2.5), true, "BLACKJACK! Výhra 2.5×");
      } else {
        this._settle(0, false, "Krupiér má Blackjack!");
      }
      return true;
    }

    this._updateButtons();
    return true;
  }

  hit() {
    if (!this.isRoundActive) return false;
    this.playerHand.push(this.deck.pop());
    sound.playCard();

    const val = handValue(this.playerHand);
    if (val > 21) {
      this.hideDealerHole = false;
      this.isRoundActive = false;
      this.render();
      this._settle(0, false, `Přestřeleno (${val})!`);
      return true;
    }

    this.render();
    this._updateButtons();
    return true;
  }

  stand() {
    if (!this.isRoundActive) return false;
    this.hideDealerHole = false;
    this.isRoundActive = false;

    while (handValue(this.dealerHand) < 17) {
      this.dealerHand.push(this.deck.pop());
    }

    this.render();

    const pVal = handValue(this.playerHand);
    const dVal = handValue(this.dealerHand);

    if (dVal > 21 || pVal > dVal) {
      this._settle(this.bet * 2, true, `Výhra! (${pVal} vs ${dVal})`);
    } else if (pVal === dVal) {
      this._settle(this.bet, true, `Remíza (${pVal} vs ${dVal}) — sázka vrácena`);
    } else {
      this._settle(0, false, `Prohra (${pVal} vs ${dVal})`);
    }
    return true;
  }

  doubleDown() {
    if (!this.isRoundActive || this.playerHand.length !== 2) return false;
    const user = this.gm.ui.aktualniHrac;
    const balance = this.gm.db.getUserBalance(user);
    if (balance < this.bet) {
      this.gm.ui.showAlert("Nedostatek peněz", "Pro Double nemáš dostatek mincí.", "warning");
      return false;
    }

    this.gm.db.updateUserBalance(user, -this.bet);
    this.gm.ui.updateBalanceDisplay(this.gm.db.getUserBalance(user));
    this.bet *= 2;

    this.playerHand.push(this.deck.pop());
    sound.playCard();

    const pVal = handValue(this.playerHand);
    if (pVal > 21) {
      this.hideDealerHole = false;
      this.isRoundActive = false;
      this.render();
      this._settle(0, false, `Double přestřeleno (${pVal})!`);
      return true;
    }

    return this.stand();
  }

  _settle(winAmount, isWin, text) {
    this._updateButtons();
    if (this.gm.processGameResult) {
      this.gm.processGameResult(
        {
          isWin,
          winAmount,
          resultText: text,
          gameName: "Blackjack",
          bet: this.bet,
          isBroke: false,
        },
        "resBoxBlackjack"
      );
    }
  }

  _updateButtons() {
    const dealBtn = document.getElementById("btn-bj-deal");
    const hitBtn = document.getElementById("btn-bj-hit");
    const standBtn = document.getElementById("btn-bj-stand");
    const doubleBtn = document.getElementById("btn-bj-double");

    if (dealBtn) dealBtn.disabled = this.isRoundActive;
    if (hitBtn) hitBtn.disabled = !this.isRoundActive;
    if (standBtn) standBtn.disabled = !this.isRoundActive;
    if (doubleBtn) doubleBtn.disabled = !this.isRoundActive || this.playerHand.length !== 2;
  }

  render() {
    const dealerEl = document.getElementById("bj-dealer-hand");
    const playerEl = document.getElementById("bj-player-hand");
    const dealerScoreEl = document.getElementById("bj-dealer-score");
    const playerScoreEl = document.getElementById("bj-player-score");
    const statusEl = document.getElementById("bj-status-info");

    if (dealerEl) {
      dealerEl.innerHTML = this.dealerHand
        .map((c, idx) => {
          if (idx === 1 && this.hideDealerHole) {
            return '<div class="bj-card bj-card-hidden">?</div>';
          }
          const isRed = c.suit === "♥" || c.suit === "♦";
          return `<div class="bj-card ${isRed ? "bj-card-red" : ""}">${c.rank}${c.suit}</div>`;
        })
        .join("");
    }

    if (playerEl) {
      playerEl.innerHTML = this.playerHand
        .map((c) => {
          const isRed = c.suit === "♥" || c.suit === "♦";
          return `<div class="bj-card ${isRed ? "bj-card-red" : ""}">${c.rank}${c.suit}</div>`;
        })
        .join("");
    }

    if (dealerScoreEl) {
      if (this.dealerHand.length === 0) {
        dealerScoreEl.textContent = "0";
      } else if (this.hideDealerHole) {
        dealerScoreEl.textContent = `${handValue([this.dealerHand[0]])} + ?`;
      } else {
        dealerScoreEl.textContent = String(handValue(this.dealerHand));
      }
    }

    if (playerScoreEl) {
      playerScoreEl.textContent = String(handValue(this.playerHand));
    }

    if (statusEl) {
      if (this.isRoundActive) {
        statusEl.className = "text-xs text-neon-cyan font-semibold";
        statusEl.textContent = `Sázka: ${formatNumber(this.bet)} | Zvol HIT, STAND nebo DOUBLE`;
      } else if (this.lastOutcome) {
        if (this.lastOutcome.isPush) {
          statusEl.className = "text-xs text-neon-gold font-bold";
          statusEl.textContent = `🤝 REMÍZA — ${this.lastOutcome.text}`;
        } else if (this.lastOutcome.isWin) {
          statusEl.className = "text-xs text-neon-green font-bold";
          statusEl.textContent = `🏆 VÝHRA! ${this.lastOutcome.text}`;
        } else {
          statusEl.className = "text-xs text-neon-red font-bold";
          statusEl.textContent = `💀 PROHRA — ${this.lastOutcome.text}`;
        }
      } else {
        statusEl.className = "text-xs text-text-muted";
        statusEl.textContent = "Vsaď si a klikni na ROZDAT";
      }
    }
  }
}
