import gsap from 'gsap';
import { sound } from '../sound';

export class DiceGame {
  constructor() {
    this.isPlaying = false;
    this.selectedNumber = null;
    this.currentValue = 1;
  }

  init() {
    this.selectedNumber = null;
    this.currentValue = Math.floor(Math.random() * 6) + 1;
    this.render();
    this.clearSelection();
  }

  render() {
    const display = document.getElementById('dice-display');
    if (display) {
      display.textContent = this.currentValue;
    }
  }

  selectNumber(num) {
    if (this.isPlaying) return;

    this.clearSelection();
    this.selectedNumber = num;

    document.querySelectorAll('.dice-num-btn').forEach(btn => {
      btn.classList.toggle('selected', parseInt(btn.dataset.num) === num);
    });

    sound.playClick();
  }

  clearSelection() {
    this.selectedNumber = null;
    document.querySelectorAll('.dice-num-btn').forEach(btn => btn.classList.remove('selected'));
    const frame = document.getElementById('dice-frame');
    if (frame) frame.classList.remove('win');
  }

  roll(onComplete) {
    if (this.isPlaying || this.selectedNumber === null) return;
    this.isPlaying = true;

    const frame = document.getElementById('dice-frame');
    const display = document.getElementById('dice-display');
    const finalValue = Math.floor(Math.random() * 6) + 1;

    sound.playDiceRoll();

    const tl = gsap.timeline({
      onComplete: () => {
        this.currentValue = finalValue;
        this.render();

        const isWin = this.selectedNumber === finalValue;

        if (isWin) {
          frame.classList.add('win');
          setTimeout(() => frame.classList.remove('win'), 2000);
        }

        this.isPlaying = false;

        onComplete({
          isWin,
          winAmount: isWin ? 6 : 0,
          resultText: `Tvá volba: ${this.selectedNumber} | Padlo: ${finalValue}`,
          selectedNum: this.selectedNumber,
          diceValue: finalValue
        });
      }
    });

    // Animace rychlého přechodu čísel během hodu
    for (let i = 0; i < 12; i++) {
      tl.call(() => {
        const val = Math.floor(Math.random() * 6) + 1;
        display.textContent = val;
        this.currentValue = val;
      }, null, i * 0.1);
    }
  }
}
