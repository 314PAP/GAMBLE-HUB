import { sound } from "../sound.js";
import { playCashOut } from "../soundEffects.js";

export const TOWER_FLOORS = 8;
export const TOWER_DOORS = 3;

/**
 * TowerGame — Climb 8 floors (3 doors each, 1 trap) with progressive multiplier & Cash Out.
 */
export class TowerGame {
  constructor() {
    this.isActive = false;
    this.betAmount = 0;
    this.currentFloor = 0;
    this.traps = [];
    this.currentMultiplier = 1.0;
  }

  /**
   * Calculate multiplier for a given floor (1-based).
   * Fair 2/3 survival per floor with 4% house edge.
   * @param {number} floor
   * @returns {number}
   */
  static multiplierForFloor(floor) {
    if (floor <= 0) return 1.0;
    const raw = Math.pow(1.5, floor) * 0.96;
    return Math.round(raw * 100) / 100;
  }

  /**
   * Start a new Tower climb.
   * @param {number} betAmount
   * @param {number[]} [trapsOverride]
   */
  start(betAmount, trapsOverride = null) {
    this.betAmount = betAmount;
    this.currentFloor = 0;
    this.currentMultiplier = 1.0;
    this.isActive = true;
    this.traps = trapsOverride
      ? [...trapsOverride]
      : Array.from({ length: TOWER_FLOORS }, () => Math.floor(Math.random() * TOWER_DOORS));
  }

  /**
   * Pick a door (0..2) on the current floor.
   * @param {number} doorIndex
   * @returns {{ safe: boolean, floor: number, multiplier: number, finished: boolean, winAmount: number }}
   */
  pickDoor(doorIndex) {
    if (!this.isActive) return null;
    const trap = this.traps[this.currentFloor];
    if (doorIndex === trap) {
      this.isActive = false;
      sound.playExplosion();
      return {
        safe: false,
        floor: this.currentFloor + 1,
        multiplier: 0,
        finished: true,
        winAmount: 0,
      };
    }

    this.currentFloor += 1;
    this.currentMultiplier = TowerGame.multiplierForFloor(this.currentFloor);
    sound.playDiamond();

    if (this.currentFloor >= TOWER_FLOORS) {
      this.isActive = false;
      const winAmount = Math.round(this.betAmount * this.currentMultiplier);
      playCashOut();
      return {
        safe: true,
        floor: this.currentFloor,
        multiplier: this.currentMultiplier,
        finished: true,
        winAmount,
      };
    }

    return {
      safe: true,
      floor: this.currentFloor,
      multiplier: this.currentMultiplier,
      finished: false,
      winAmount: 0,
    };
  }

  /**
   * Cash out at current floor.
   */
  cashOut() {
    if (!this.isActive || this.currentFloor === 0) return null;
    this.isActive = false;
    const winAmount = Math.round(this.betAmount * this.currentMultiplier);
    playCashOut();
    return {
      isWin: true,
      floor: this.currentFloor,
      multiplier: this.currentMultiplier,
      winAmount,
    };
  }
}
