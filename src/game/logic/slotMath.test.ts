import { describe, expect, it } from 'vitest';
import { evaluateCenterPayline } from './slotMath';
import type { SymbolId } from '../state/types';

const BET = 20;

describe('evaluateCenterPayline', () => {
  it('evaluates 3 matching symbols', () => {
    const result = evaluateCenterPayline(line('CHERRY', 'CHERRY', 'CHERRY', 'LEMON', 'BAR'), BET);

    expect(result).toEqual({
      lineIndex: 1,
      symbol: 'CHERRY',
      count: 3,
      multiplier: 2,
      positions: [0, 1, 2],
      winAmount: 40,
    });
  });

  it('evaluates 4 matching symbols', () => {
    const result = evaluateCenterPayline(line('LEMON', 'LEMON', 'LEMON', 'LEMON', 'BAR'), BET);

    expect(result).toMatchObject({
      symbol: 'LEMON',
      count: 4,
      multiplier: 5,
      positions: [0, 1, 2, 3],
      winAmount: 100,
    });
  });

  it('evaluates 5 matching symbols', () => {
    const result = evaluateCenterPayline(line('SEVEN', 'SEVEN', 'SEVEN', 'SEVEN', 'SEVEN'), BET);

    expect(result).toMatchObject({
      symbol: 'SEVEN',
      count: 5,
      multiplier: 10,
      positions: [0, 1, 2, 3, 4],
      winAmount: 200,
    });
  });

  it('uses WILD as a substitute for the target symbol', () => {
    const result = evaluateCenterPayline(line('DIAMOND', 'WILD', 'DIAMOND', 'BAR', 'LEMON'), BET);

    expect(result).toMatchObject({
      symbol: 'DIAMOND',
      count: 3,
      multiplier: 2,
      positions: [0, 1, 2],
      winAmount: 40,
    });
  });

  it('returns no win when less than 3 symbols match', () => {
    const result = evaluateCenterPayline(line('BAR', 'BAR', 'LEMON', 'BAR', 'BAR'), BET);

    expect(result).toBeNull();
  });
});

function line(...symbols: SymbolId[]): SymbolId[] {
  return symbols;
}
