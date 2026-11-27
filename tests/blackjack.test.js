import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../src/sound.js', () => ({
  sound: {
    playCard: vi.fn(),
    playWin: vi.fn(),
    playLoss: vi.fn(),
    playClick: vi.fn(),
  },
}));

import { createDeck, handValue, isBlackjack, BlackjackGame } from '../src/games/blackjack.js';

describe('Blackjack helpers', () => {
  it('createDeck creates 52 unique cards', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
  });

  it('handValue calculates soft and hard aces correctly', () => {
    expect(handValue([{ rank: 'A' }, { rank: 'K' }])).toBe(21);
    expect(handValue([{ rank: 'A' }, { rank: '9' }, { rank: '5' }])).toBe(15);
    expect(handValue([{ rank: 'A' }, { rank: 'A' }, { rank: '9' }])).toBe(21);
    expect(handValue([{ rank: '10' }, { rank: 'J' }, { rank: '2' }])).toBe(22);
  });

  it('isBlackjack detects natural 21 on 2 cards only', () => {
    expect(isBlackjack([{ rank: 'A' }, { rank: 'Q' }])).toBe(true);
    expect(isBlackjack([{ rank: '10' }, { rank: '5' }, { rank: '6' }])).toBe(false);
  });
});

describe('BlackjackGame', () => {
  let game;
  let mockGm;

  beforeEach(() => {
    mockGm = {
      ui: { aktualniHrac: 'Tester', updateBalanceDisplay: vi.fn(), showAlert: vi.fn() },
      db: { getUserBalance: vi.fn(() => 1000), updateUserBalance: vi.fn() },
      processGameResult: vi.fn(),
    };
    game = new BlackjackGame(mockGm);
  });

  it('starts a round and deals 2 cards each', () => {
    game.start(100);
    expect(game.playerHand).toHaveLength(2);
    expect(game.dealerHand).toHaveLength(2);
  });

  it('stand resolves the round and calls processGameResult', () => {
    game.isRoundActive = true;
    game.bet = 100;
    game.deck = createDeck();
    game.playerHand = [{ rank: '10', suit: '♠', color: 'black' }, { rank: '9', suit: '♥', color: 'red' }];
    game.dealerHand = [{ rank: '10', suit: '♣', color: 'black' }, { rank: '7', suit: '♦', color: 'red' }];
    game.stand();
    expect(mockGm.processGameResult).toHaveBeenCalled();
    expect(game.isRoundActive).toBe(false);
  });

  it('doubleDown doubles the bet and resolves', () => {
    game.isRoundActive = true;
    game.bet = 50;
    game.deck = [{ rank: '2', suit: '♠', color: 'black' }, ...createDeck()];
    game.playerHand = [{ rank: '9', suit: '♠', color: 'black' }, { rank: '9', suit: '♥', color: 'red' }];
    game.dealerHand = [{ rank: '10', suit: '♣', color: 'black' }, { rank: '7', suit: '♦', color: 'red' }];
    game.doubleDown();
    expect(game.bet).toBe(100);
    expect(mockGm.processGameResult).toHaveBeenCalled();
    expect(game.isRoundActive).toBe(false);
  });
});
