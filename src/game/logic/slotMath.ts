import type { PaylineResult, SpinResult, SymbolId } from '../state/types';
import { PAYTABLE } from './paytable';
import { pickOne, type RandomSource } from './rng';

export const SYMBOLS: readonly SymbolId[] = ['CHERRY', 'LEMON', 'BAR', 'SEVEN', 'DIAMOND', 'WILD'];

const REEL_COUNT = 5;
const ROW_COUNT = 3;
const CENTER_ROW_INDEX = 1;

export function createSpinResult(bet: number, rng: RandomSource): SpinResult {
  const reels = Array.from({ length: REEL_COUNT }, () =>
    Array.from({ length: ROW_COUNT }, () => pickOne(SYMBOLS, rng)),
  );
  const centerLine = reels.map((reel) => reel[CENTER_ROW_INDEX]);
  const win = evaluateCenterPayline(centerLine, bet);

  return {
    reels,
    centerLine,
    win,
    totalWin: win?.winAmount ?? 0,
  };
}

export function evaluateCenterPayline(centerLine: SymbolId[], bet: number): PaylineResult | null {
  const target = centerLine.find((symbol) => symbol !== 'WILD') ?? 'WILD';
  let count = 0;

  for (const symbol of centerLine) {
    if (target === 'WILD' ? symbol === 'WILD' : symbol === target || symbol === 'WILD') {
      count += 1;
      continue;
    }
    break;
  }

  if (count < 3) {
    return null;
  }

  const multiplier = PAYTABLE[count as keyof typeof PAYTABLE];
  return {
    lineIndex: CENTER_ROW_INDEX,
    symbol: target,
    count,
    multiplier,
    positions: Array.from({ length: count }, (_, index) => index),
    winAmount: bet * multiplier,
  };
}
