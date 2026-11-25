// Game display states and configuration metadata

export const DISPLAY_STATES = {
  1: { title: "HÁDANKA 1-10", classic: true, dice: false, slots: false, hilo: false },
  2: { title: "HÁDANKA 1-5", classic: true, dice: false, slots: false, hilo: false },
  3: { title: "KOSTKA 1-6", classic: false, dice: true, slots: false, hilo: false },
  4: { title: "RULETA 0-35", classic: true, dice: false, slots: false, hilo: false },
  5: { title: "AUTOMAT", classic: false, dice: false, slots: true, hilo: false },
  6: { title: "HI-LOW", classic: false, dice: false, slots: false, hilo: true },
};

export const GAME_CONFIG = {
  1: { resultBox: 'resBoxClassic', hiloColor: false, label: 'Hádanka 1-10', minVal: 1, maxVal: 10, multVal: 10 },
  2: { resultBox: 'resBoxClassic', hiloColor: false, label: 'Hádanka 1-5', minVal: 1, maxVal: 5, multVal: 5 },
  3: { resultBox: 'resBoxDice', hiloColor: false, label: 'Kostka', minVal: 1, maxVal: 6, multVal: 6 },
  4: { resultBox: 'resBoxClassic', hiloColor: false, label: 'Ruleta', minVal: 0, maxVal: 35, multVal: 35 },
  5: { resultBox: 'resBoxSlots', hiloColor: false, label: 'Automat', minVal: 1, maxVal: 6, multVal: 6 },
  6: { resultBox: 'resBoxHilo', hiloColor: true, label: 'Hi-Low', minVal: 1, maxVal: 6, multVal: 6 },
};
