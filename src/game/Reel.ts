import { Container, Graphics } from 'pixi.js';
import { SYMBOLS } from './logic/slotMath';
import { pickOne, type RandomSource } from './logic/rng';
import { SymbolView } from './SymbolView';
import type { SymbolId } from './state/types';
import type { SymbolTextureMap } from './assets/createSymbolTextures';

const VISIBLE_ROWS = 3;
const BUFFER_ROWS = 4;

export class Reel extends Container {
  private readonly symbols: SymbolView[] = [];
  private readonly rng: RandomSource;
  private readonly cellSize: number;
  private readonly stripHeight: number;
  private readonly maskGraphic: Graphics;
  private spinning = false;
  private stopping = false;
  private stopElapsed = 0;
  private stopDuration = 0.42;
  private finalSymbols: SymbolId[] = [];
  private readonly baseSpeed: number;

  constructor(textures: SymbolTextureMap, rng: RandomSource, cellSize: number, width: number) {
    super();
    this.rng = rng;
    this.cellSize = cellSize;
    this.stripHeight = cellSize * BUFFER_ROWS;
    this.baseSpeed = cellSize * 13;

    this.maskGraphic = new Graphics()
      .rect(-width / 2, 0, width, cellSize * VISIBLE_ROWS)
      .fill('#ffffff');
    this.addChild(this.maskGraphic);
    this.mask = this.maskGraphic;
    this.maskGraphic.visible = false;

    for (let index = 0; index < BUFFER_ROWS; index += 1) {
      const view = new SymbolView(textures, pickOne(SYMBOLS, rng), cellSize * 0.84);
      view.position.set(0, index * cellSize + cellSize / 2);
      this.symbols.push(view);
      this.addChild(view);
    }
  }

  start(): void {
    this.spinning = true;
    this.stopping = false;
    this.stopElapsed = 0;
    this.setWinningPositions([]);
  }

  stopWith(finalSymbols: SymbolId[]): void {
    this.finalSymbols = finalSymbols;
    this.stopping = true;
    this.stopElapsed = 0;
  }

  get isIdle(): boolean {
    return !this.spinning;
  }

  setWinningPositions(rowIndexes: number[]): void {
    this.symbols.forEach((symbol, index) => symbol.setWinning(rowIndexes.includes(index)));
  }

  update(deltaSeconds: number): void {
    this.symbols.forEach((symbol) => symbol.update(deltaSeconds));

    if (!this.spinning) {
      return;
    }

    const speedScale = this.stopping ? Math.max(0.18, 1 - this.stopElapsed / this.stopDuration) : 1;
    for (const symbol of this.symbols) {
      symbol.y += this.baseSpeed * speedScale * deltaSeconds;
      if (symbol.y > this.stripHeight - this.cellSize / 2) {
        symbol.y -= this.stripHeight;
        symbol.setSymbol(pickOne(SYMBOLS, this.rng));
      }
    }

    if (!this.stopping) {
      return;
    }

    this.stopElapsed += deltaSeconds;
    if (this.stopElapsed >= this.stopDuration) {
      this.spinning = false;
      this.stopping = false;
      this.symbols.slice(0, VISIBLE_ROWS).forEach((symbol, index) => {
        symbol.y = index * this.cellSize + this.cellSize / 2;
        symbol.setSymbol(this.finalSymbols[index]);
      });
      this.symbols[3].y = VISIBLE_ROWS * this.cellSize + this.cellSize / 2;
      this.symbols[3].setSymbol(pickOne(SYMBOLS, this.rng));
    }
  }
}
