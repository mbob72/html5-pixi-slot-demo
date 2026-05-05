import { Application } from 'pixi.js';
import { GameScene } from './GameScene';
import { GameStateMachine } from './state/GameStateMachine';
import { FpsMeter } from './utils/ticker';

interface GameAppOptions {
  root: HTMLDivElement;
  debugPanel: HTMLDivElement;
  debug: boolean;
}

export class GameApp {
  private readonly app = new Application();
  private readonly state = new GameStateMachine();
  private readonly scene = new GameScene(this.state);
  private readonly fps = new FpsMeter();
  private readonly root: HTMLDivElement;
  private readonly debugPanel: HTMLDivElement;
  private readonly debug: boolean;

  constructor(options: GameAppOptions) {
    this.root = options.root;
    this.debugPanel = options.debugPanel;
    this.debug = options.debug;
  }

  async start(): Promise<void> {
    await this.app.init({
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      resizeTo: this.root,
    });

    this.root.appendChild(this.app.canvas);
    this.app.stage.addChild(this.scene);
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.debugPanel.hidden = !this.debug;

    this.app.ticker.add((ticker) => {
      const deltaSeconds = ticker.deltaMS / 1000;
      this.scene.update(deltaSeconds);
      this.updateDebug(ticker.deltaMS);
    });

    await this.scene.finishLoading();
  }

  private resize(): void {
    this.scene.resize(this.root.clientWidth, this.root.clientHeight);
  }

  private updateDebug(deltaMs: number): void {
    if (!this.debug) {
      return;
    }

    const snapshot = this.scene.getSnapshot();
    const lastSpin = snapshot.lastSpin
      ? `${snapshot.lastSpin.centerLine.join(' | ')} / win=${snapshot.lastSpin.totalWin}`
      : 'none';

    this.debugPanel.textContent = [
      `state: ${snapshot.status}`,
      `bet: ${snapshot.bet}`,
      `balance: ${snapshot.balance}`,
      `last win: ${snapshot.lastWin}`,
      `last spin: ${lastSpin}`,
      `fps: ${this.fps.update(deltaMs)}`,
    ].join('\n');
  }
}
