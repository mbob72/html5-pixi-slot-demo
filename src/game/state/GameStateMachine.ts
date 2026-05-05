import type { GameSnapshot, GameStatus, SpinResult } from './types';

const BET_STEPS = [10, 20, 50, 100, 200] as const;

export class GameStateMachine {
  private status: GameStatus = 'loading';
  private balance = 1000;
  private betIndex = 1;
  private lastWin = 0;
  private lastSpin: SpinResult | null = null;

  get snapshot(): GameSnapshot {
    return {
      status: this.status,
      balance: this.balance,
      bet: this.bet,
      lastWin: this.lastWin,
      lastSpin: this.lastSpin,
    };
  }

  get bet(): number {
    return BET_STEPS[this.betIndex];
  }

  markReady(): void {
    this.status = 'idle';
  }

  canSpin(): boolean {
    return this.status === 'idle' && this.balance >= this.bet;
  }

  startSpin(): void {
    if (!this.canSpin()) {
      return;
    }

    this.balance -= this.bet;
    this.lastWin = 0;
    this.status = 'spinning';
  }

  startEvaluation(): void {
    if (this.status === 'spinning') {
      this.status = 'evaluating';
    }
  }

  settleSpin(result: SpinResult): void {
    this.lastSpin = result;
    this.lastWin = result.totalWin;
    this.balance += result.totalWin;
    this.status = result.totalWin > 0 ? 'win' : 'idle';
  }

  finishWinPresentation(): void {
    if (this.status === 'win') {
      this.status = 'idle';
    }
  }

  increaseBet(): void {
    if (this.status !== 'idle') {
      return;
    }
    this.betIndex = Math.min(BET_STEPS.length - 1, this.betIndex + 1);
  }

  decreaseBet(): void {
    if (this.status !== 'idle') {
      return;
    }
    this.betIndex = Math.max(0, this.betIndex - 1);
  }
}
