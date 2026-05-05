import { Container, Graphics } from 'pixi.js';
import { SYMBOLS } from './logic/slotMath';
import { pickOne, type RandomSource } from './logic/rng';
import { SymbolView } from './SymbolView';
import type { SymbolId } from './state/types';
import type { SymbolTextureMap } from './assets/createSymbolTextures';

const VISIBLE_ROWS = 3;
const BUFFER_ROWS = 7;

export class Reel extends Container {
  private readonly stripLayer = new Container();
  private readonly symbols: SymbolView[] = [];
  private readonly rng: RandomSource;
  private readonly cellSize: number;
  private readonly stripHeight: number;
  private readonly maskGraphic: Graphics;
  private readonly motionStreaks = new Graphics();
  private spinning = false;
  private stopping = false;
  private spinElapsed = 0;
  private stopElapsed = 0;
  private settleElapsed = 0;
  private stopDuration = 0.72;
  private finalSymbols: SymbolId[] = [];
  private readonly baseSpeed: number;
  private readonly phase: number;

  constructor(textures: SymbolTextureMap, rng: RandomSource, cellSize: number, width: number) {
    super();
    this.rng = rng;
    this.cellSize = cellSize;
    this.stripHeight = cellSize * BUFFER_ROWS;
    this.baseSpeed = cellSize * 10.5;
    this.phase = rng.next() * Math.PI * 2;

    this.maskGraphic = new Graphics()
      .rect(-width / 2, 0, width, cellSize * VISIBLE_ROWS)
      .fill('#ffffff');
    this.addChild(this.maskGraphic);
    this.maskGraphic.alpha = 0.001;

    this.stripLayer.mask = this.maskGraphic;
    this.addChild(this.stripLayer);
    this.motionStreaks.alpha = 0;
    this.stripLayer.addChild(this.motionStreaks);

    for (let index = 0; index < BUFFER_ROWS; index += 1) {
      const view = new SymbolView(textures, pickOne(SYMBOLS, rng), cellSize * 0.84);
      view.position.set(0, index * cellSize + cellSize / 2);
      this.symbols.push(view);
      this.stripLayer.addChild(view);
    }

    this.drawMotionStreaks(width);
  }

  start(): void {
    this.spinning = true;
    this.stopping = false;
    this.spinElapsed = 0;
    this.stopElapsed = 0;
    this.settleElapsed = 0;
    this.motionStreaks.alpha = 0.34;
    this.stripLayer.scale.set(1, 1.08);
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
      this.settle(deltaSeconds);
      return;
    }

    this.spinElapsed += deltaSeconds;
    const acceleration = Math.min(1, this.spinElapsed / 0.2);
    const stopProgress = this.stopping ? Math.min(1, this.stopElapsed / this.stopDuration) : 0;
    const speedScale = this.stopping
      ? 0.14 + (1 - easeOutCubic(stopProgress)) * 0.96
      : acceleration;
    const speed = this.baseSpeed * speedScale;

    this.motionStreaks.alpha = this.stopping ? 0.34 * (1 - stopProgress) : 0.34;
    this.stripLayer.scale.y = 1 + Math.min(0.13, speed / this.baseSpeed / 8);

    for (const symbol of this.symbols) {
      symbol.y += speed * deltaSeconds;
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
      this.motionStreaks.alpha = 0;
      this.symbols.slice(0, VISIBLE_ROWS).forEach((symbol, index) => {
        symbol.y = index * this.cellSize + this.cellSize / 2;
        symbol.setSymbol(this.finalSymbols[index]);
      });
      this.symbols.slice(VISIBLE_ROWS).forEach((symbol, index) => {
        symbol.y = (VISIBLE_ROWS + index) * this.cellSize + this.cellSize / 2;
        symbol.setSymbol(pickOne(SYMBOLS, this.rng));
      });
      this.stripLayer.y = 18;
      this.stripLayer.scale.set(1.02, 0.92);
      this.settleElapsed = 0.001;
    }
  }

  private settle(deltaSeconds: number): void {
    if (this.settleElapsed > 0) {
      this.settleElapsed += deltaSeconds;
      const progress = Math.min(1, this.settleElapsed / 0.34);
      const bounce = Math.sin(progress * Math.PI) * (1 - progress);
      this.stripLayer.y = 18 * (1 - easeOutCubic(progress));
      this.stripLayer.scale.set(1 + bounce * 0.04, 1 - bounce * 0.08);
      if (progress >= 1) {
        this.stripLayer.y = 0;
        this.stripLayer.scale.set(1);
        this.settleElapsed = 0;
      }
      return;
    }

    const idleOffset = Math.sin(performance.now() / 1000 + this.phase) * 1.4;
    this.stripLayer.y = idleOffset;
  }

  private drawMotionStreaks(width: number): void {
    this.motionStreaks.clear();
    for (let index = 0; index < VISIBLE_ROWS; index += 1) {
      this.motionStreaks
        .roundRect(-width * 0.34, index * this.cellSize + 24, width * 0.68, 42, 20)
        .fill({ color: '#ffd66d', alpha: 0.18 });
      this.motionStreaks
        .roundRect(-width * 0.28, index * this.cellSize + 82, width * 0.56, 26, 14)
        .fill({ color: '#ffffff', alpha: 0.12 });
    }
  }
}

function easeOutCubic(value: number): number {
  return 1 - Math.pow(1 - value, 3);
}
