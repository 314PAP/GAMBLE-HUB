const RESULT_BOX_IDS = [
  'game-result',
  'game-result-classic',
  'game-result-dice',
  'game-result-slots',
  'game-result-hilo',
  'game-result-mines',
];

/**
 * Hide and clear all game result boxes.
 */
export function clearAllResultBoxes() {
  RESULT_BOX_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('hidden');
      el.innerHTML = '';
    }
  });
}
