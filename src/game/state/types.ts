export type GameStatus = 'loading' | 'idle' | 'spinning' | 'evaluating' | 'win';

export type SymbolId = 'CHERRY' | 'LEMON' | 'BAR' | 'SEVEN' | 'DIAMOND' | 'WILD';

export interface PaylineResult {
  lineIndex: number;
  symbol: SymbolId;
  count: number;
  multiplier: number;
  positions: number[];
  winAmount: number;
}

export interface SpinResult {
  reels: SymbolId[][];
  centerLine: SymbolId[];
  win: PaylineResult | null;
  totalWin: number;
}

export interface GameSnapshot {
  status: GameStatus;
  balance: number;
  bet: number;
  lastWin: number;
  lastSpin: SpinResult | null;
}
