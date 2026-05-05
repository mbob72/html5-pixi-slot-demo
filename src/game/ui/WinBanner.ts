import { Container, Graphics, Text } from 'pixi.js';

export class WinBanner extends Container {
  private readonly background = new Graphics();
  private readonly message = new Text({
    text: '',
    style: {
      fill: '#fff6c8',
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: 34,
      fontWeight: '900',
    },
  });
  private timer = 0;

  constructor() {
    super();
    this.visible = false;
    this.alpha = 0;
    this.message.anchor.set(0.5);
    this.background.roundRect(-190, -36, 380, 72, 8).fill('#8b1830').stroke({
      color: '#ffdb72',
      width: 3,
    });
    this.addChild(this.background, this.message);
  }

  show(amount: number): void {
    this.message.text = `WIN ${amount}`;
    this.visible = true;
    this.alpha = 1;
    this.scale.set(0.92);
    this.timer = 1.6;
  }

  hide(): void {
    this.visible = false;
    this.timer = 0;
  }

  update(deltaSeconds: number): void {
    if (!this.visible) {
      return;
    }

    this.timer -= deltaSeconds;
    const pulse = Math.sin(this.timer * 14) * 0.04;
    this.scale.set(1 + pulse);
    this.alpha = Math.min(1, Math.max(0, this.timer * 2));

    if (this.timer <= 0) {
      this.hide();
    }
  }
}
