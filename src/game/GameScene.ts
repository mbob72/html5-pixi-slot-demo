import { Container, Graphics, Text } from 'pixi.js';
import { createSymbolTextures } from './assets/createSymbolTextures';
import { MathRandomSource, type RandomSource } from './logic/rng';
import { createSpinResult } from './logic/slotMath';
import { Reel } from './Reel';
import { Button } from './ui/Button';
import { TextPanel } from './ui/TextPanel';
import { WinBanner } from './ui/WinBanner';
import { fitIntoViewport } from './utils/resize';
import type { GameStateMachine } from './state/GameStateMachine';
import type { GameSnapshot, SpinResult } from './state/types';

const LOGICAL_WIDTH = 900;
const LOGICAL_HEIGHT = 720;
const REEL_COUNT = 5;
const REEL_CELL = 128;
const REEL_WIDTH = 138;

export class GameScene extends Container {
  private readonly state: GameStateMachine;
  private readonly rng: RandomSource;
  private readonly reels: Reel[] = [];
  private readonly balancePanel = new TextPanel('BALANCE');
  private readonly betPanel = new TextPanel('BET', 130);
  private readonly winPanel = new TextPanel('LAST WIN');
  private readonly spinButton: Button;
  private readonly minusButton: Button;
  private readonly plusButton: Button;
  private readonly soundButton: Button;
  private readonly winBanner = new WinBanner();
  private readonly loadingOverlay = new Container();
  private currentSpin: Promise<void> | null = null;
  private soundEnabled = false;

  constructor(state: GameStateMachine, rng: RandomSource = new MathRandomSource()) {
    super();
    this.state = state;
    this.rng = rng;
    this.spinButton = new Button({
      label: 'SPIN',
      width: 166,
      height: 68,
      variant: 'primary',
      onPress: () => this.requestSpin(),
    });
    this.minusButton = new Button({
      label: '-',
      width: 54,
      height: 54,
      onPress: () => {
        this.state.decreaseBet();
        this.renderHud();
      },
    });
    this.plusButton = new Button({
      label: '+',
      width: 54,
      height: 54,
      onPress: () => {
        this.state.increaseBet();
        this.renderHud();
      },
    });
    this.soundButton = new Button({
      label: 'SOUND OFF',
      width: 144,
      height: 44,
      onPress: () => this.toggleSound(),
    });

    this.buildScene();
    this.showLoading();
  }

  resize(viewportWidth: number, viewportHeight: number): void {
    const fit = fitIntoViewport(LOGICAL_WIDTH, LOGICAL_HEIGHT, viewportWidth, viewportHeight);
    this.position.set(fit.x, fit.y);
    this.scale.set(fit.scale);
  }

  update(deltaSeconds: number): void {
    this.reels.forEach((reel) => reel.update(deltaSeconds));
    this.winBanner.update(deltaSeconds);
  }

  getSnapshot(): GameSnapshot {
    return this.state.snapshot;
  }

  async finishLoading(): Promise<void> {
    await delay(450);
    this.loadingOverlay.visible = false;
    this.state.markReady();
    this.renderHud();
  }

  private buildScene(): void {
    const root = new Container();
    root.pivot.set(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2);
    this.addChild(root);

    const table = createSymbolTextures();
    const backdrop = new Graphics()
      .roundRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT, 18)
      .fill('#0c0d14')
      .stroke({ color: '#40371f', width: 2 });
    const header = new Text({
      text: 'PIXI SLOT DEMO',
      style: {
        fill: '#ffe199',
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: 46,
        fontWeight: '900',
      },
    });
    header.anchor.set(0.5);
    header.position.set(LOGICAL_WIDTH / 2, 54);

    const machine = new Graphics()
      .roundRect(80, 126, 740, 418, 12)
      .fill('#111421')
      .stroke({ color: '#ffcf64', width: 3 });
    const payline = new Graphics().rect(102, 318, 696, 4).fill({ color: '#ffd66d', alpha: 0.7 });

    root.addChild(backdrop, header, machine, payline);
    this.addReels(root, table);
    this.addHud(root);

    this.winBanner.position.set(LOGICAL_WIDTH / 2, 114);
    root.addChild(this.winBanner);
    root.addChild(this.loadingOverlay);
    this.renderHud();
  }

  private addReels(root: Container, textures: ReturnType<typeof createSymbolTextures>): void {
    const startX = 158;
    const gap = 6;

    for (let index = 0; index < REEL_COUNT; index += 1) {
      const reelFrame = new Graphics()
        .roundRect(-REEL_WIDTH / 2, 0, REEL_WIDTH, REEL_CELL * 3, 8)
        .fill('#070910')
        .stroke({ color: '#2d3347', width: 2 });
      const reel = new Reel(textures, this.rng, REEL_CELL, REEL_WIDTH - 10);
      const reelShell = new Container();
      reelShell.position.set(startX + index * (REEL_WIDTH + gap), 144);
      reelShell.addChild(reelFrame, reel);
      this.reels.push(reel);
      root.addChild(reelShell);
    }
  }

  private addHud(root: Container): void {
    this.balancePanel.position.set(80, 566);
    this.betPanel.position.set(266, 566);
    this.winPanel.position.set(414, 566);
    this.minusButton.position.set(606, 575);
    this.plusButton.position.set(668, 575);
    this.spinButton.position.set(734, 566);
    this.soundButton.position.set(676, 84);

    root.addChild(
      this.balancePanel,
      this.betPanel,
      this.winPanel,
      this.minusButton,
      this.plusButton,
      this.spinButton,
      this.soundButton,
    );
  }

  private showLoading(): void {
    const shade = new Graphics()
      .roundRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT, 18)
      .fill({ color: '#08090f', alpha: 0.92 });
    const text = new Text({
      text: 'LOADING GAME...',
      style: {
        fill: '#ffe09a',
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: 34,
        fontWeight: '900',
      },
    });
    text.anchor.set(0.5);
    text.position.set(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2);
    this.loadingOverlay.addChild(shade, text);
  }

  private requestSpin(): void {
    if (this.currentSpin || !this.state.canSpin()) {
      return;
    }

    this.currentSpin = this.playSpin().finally(() => {
      this.currentSpin = null;
    });
  }

  private async playSpin(): Promise<void> {
    this.state.startSpin();
    const result = createSpinResult(this.state.snapshot.bet, this.rng);
    this.reels.forEach((reel) => reel.start());
    this.winBanner.hide();
    this.renderHud();

    await Promise.all(
      this.reels.map(async (reel, index) => {
        await delay(620 + index * 250);
        reel.stopWith(result.reels[index]);
      }),
    );
    await delay(520);

    this.state.startEvaluation();
    this.state.settleSpin(result);
    this.presentResult(result);
    this.renderHud();

    if (result.totalWin > 0) {
      await delay(1500);
      this.state.finishWinPresentation();
      this.renderHud();
    }
  }

  private presentResult(result: SpinResult): void {
    this.reels.forEach((reel, reelIndex) => {
      const isWinningReel = result.win?.positions.includes(reelIndex) ?? false;
      reel.setWinningPositions(isWinningReel ? [1] : []);
    });

    if (result.totalWin > 0) {
      this.winBanner.show(result.totalWin);
    }
  }

  private toggleSound(): void {
    this.soundEnabled = !this.soundEnabled;
    this.soundButton.children
      .filter((child): child is Text => child instanceof Text)
      .forEach((text) => {
        text.text = this.soundEnabled ? 'SOUND ON' : 'SOUND OFF';
      });
  }

  private renderHud(): void {
    const snapshot = this.state.snapshot;
    this.balancePanel.setValue(`${snapshot.balance}`);
    this.betPanel.setValue(`${snapshot.bet}`);
    this.winPanel.setValue(`${snapshot.lastWin}`);
    const controlsEnabled = snapshot.status === 'idle';
    this.spinButton.setEnabled(this.state.canSpin());
    this.minusButton.setEnabled(controlsEnabled);
    this.plusButton.setEnabled(controlsEnabled);
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
